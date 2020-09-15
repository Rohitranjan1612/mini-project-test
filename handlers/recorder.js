// requires
const logger = require("../log");
const Promise = require("bluebird");
const config = require("../config");
const transferToUSB = require("./transferToUSB");
const pool = require("../connections/db");
const {
  getTimeLastConnect,
  getTempReading,
  getPingDetails,
} = require("../services/api/crt-server");
const fs = require("fs");
// const buzzer = require('./buzzer');
// const { dialog } = require('electron').remote;

// const showError = () => {
//     return new Promise((resolve, reject) => {
//         buzzer.startAlarm();
//         dialog.showMessageBox({
//             type: 'error',
//             title: 'Something not correct',
//             buttons: [ 'Ok' ],
//             message: 'Check the connections and the main program. Or contact administrator',
//         }, () => {
//             buzzer.stopAlarm();
//             resolve();
//         });
//     });
// };

const query = `select start_recording from ${config.params_table} where id=1`;

const startRecording = () => {
  logger.warn("recoder started, next in 60 secs");
  const query2 = "SELECT * from temperature";
  // rounding off time to minutes
  let time = new Date().valueOf() / 1000;
  time = Math.floor(time) / 60;
  time = Math.floor(time) * 60;
  // temperature reading time
  let hash1;

  return pool
    .query(query2)
    .then(([res]) => {
      logger.info({ res }, "response");
      hash1 = res[0].hash;
    })
    .delay(5000)
    .then(() => {
      return pool.query(query2);
    })
    .then(([res]) => {
      const hash2 = res[0].hash;
      logger.warn({ hash1, hash2 }, "updated_at values");
      if (hash1 !== hash2) {
        const currTemp = res[0].current_temp;
        const query3 =
          "insert into temperature_readings(temperature, time) values(?, ?)";
        pool.query(query3, [currTemp, time]);
      } else {
        logger.error(
          "Not Recording data, Check sensors, {info from : recorder}"
        );
        // buzzer
        // return showError();
      }
    });

  // const checkQuery = 'select start_time from params where id=1';
  // pool.query(checkQuery)
  //     .then(([ resp ]) => {
  //         const startTime = resp[0].start_time;
  //         if (time >= startTime) {
  //             return pool.query(query2)
  //                 .then(([ res ]) => {
  //                     logger.info({ res }, 'response');
  //                     hash1 = res[0].hash;
  //                 })
  //                 .delay(5000)
  //                 .then(() => {
  //                     return pool.query(query2);
  //                 })
  //                 .then(([ res ]) => {
  //                     const hash2 = res[0].hash;
  //                     logger.warn({ hash1, hash2 }, 'updated_at values');
  //                     if (hash1 !== hash2) {
  //                         const currTemp = res[0].current_temp;
  //                         const query3 = 'insert into temperature_readings(temperature, time) values(?, ?)';
  //                         pool.query(query3, [ currTemp, time ]);
  //                     } else {
  //                         logger.error('Not Recording data, Check sensors, {info from : recorder}');
  //                         // buzzer
  //                         // return showError();
  //                     }
  //                 });
  //         }
  //     });
};

// CRT Web server change
let timeInterval = 2;
let sendRecorder;
let pingDetail = 0;
const sendPingDetails = () => {
  if (config.crt_web_flag && config.crt_params_web_flag) {
    logger.info("Next send ping details to server, next in 30 sec");
    const filePath = __dirname + "/crtId.txt";
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) logger.error({ err }, "error while opening file");
      const crtId = data;
      logger.info(crtId, "crtId in fs.freadFile");
      const params = {
        crtId: crtId,
      };
      logger.info(params, "params in sendPingDetails");
      return getPingDetails(params)
        .then((resp) => {
          // logger.info(
          //   {
          //     drtFlag: resp.data.drtFlag,
          //     dataRetrivalTime: resp.data.dataRetrivalTime,
          //   },
          //   "[getPingDetails]"
          // );
          timeInterval = resp.data.dataRetrivalTime;
          if (resp.data.drtFlag) {
            // logger.info(
            //   { drtFlag: resp.data.drtFlag, timeInterval },
            //   "dsfsfdfsdfsd"
            // );
            clearTimeout(sendRecorder);
            sendRecorder = setTimeout(sendRecording, timeInterval * 60000);
          }
          pingDetail = 1;
          return transferToUSB.generatePingDetail(pingDetail.toString());
          // return timeInterval;
          // exports.pingDetail = pingDetail;
        })
        .catch((err) => {
          pingDetail = 0;
          logger.error({ err }, "error while calling api in getPingDetails");
          return transferToUSB.generatePingDetail(pingDetail.toString());
          // exports.pingDetail = pingDetail;
        });
    });
  } else {
    pingDetail = 0;
    return transferToUSB.generatePingDetail(pingDetail.toString());
  }
};

const sendRecording = () => {
  if (config.crt_web_flag && config.crt_params_web_flag) {
    logger.info(
      "Next recoder data send to server, next in " + timeInterval + " min"
    );
    const query =
      "select temperature, time from temperature_readings where time between ? and ?";
    const filePath = __dirname + "/crtId.txt";
    // rounding off time to second
    let currenttime = new Date().valueOf() / 1000;
    currenttime = Math.floor(currenttime);
    logger.info(currenttime, "currenttime in sendRecording");
    // currenttime = Math.floor(currenttime) * 60;
    // 1day = 86400sec
    const backupLimtTime = config.backup_limt_time * 86400;
    logger.info(backupLimtTime, "backupLimtTime in sendRecording");

    // calling set timeout again with new timer which may be change while ping test
    sendRecorder = setTimeout(sendRecording, timeInterval * 60000);

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) logger.error({ err }, "error while opening file");
      const crtId = data;
      logger.info(crtId, "crtId in fs.freadFile");
      const params = {
        crtId: crtId,
      };
      logger.info(params, "params in sendRecording");
      return getTimeLastConnect(params)
        .then((resp) => {
          let timeLastConnect = resp.data.timeLastConnect;
          logger.info(timeLastConnect, "timeLastConnect in sendRecording");
          if (timeLastConnect == "new") {
            timeLastConnect = currenttime - timeInterval * 60;
            return timeLastConnect;
          } else if (currenttime - timeLastConnect < backupLimtTime) {
            timeLastConnect = timeLastConnect - 120;
            return timeLastConnect;
          } else {
            timeLastConnect = currenttime - backupLimtTime;
            return timeLastConnect;
          }
        })
        .then((resp) => {
          logger.info(resp, "resp of timeLastConnects");
          pool
            .query(query, [resp, currenttime])
            .then((resp) => {
              logger.info(resp, "resp of query");
              let records = resp[0];
              return records;
            })
            .then((resp) => {
              logger.info(resp, "resp of query in sendRecording");
              let record = resp;
              let recordLength = Math.floor(record.length / 200);
              logger.info({ recordLength });
              if (recordLength) {
                for (let i = 0; i <= recordLength; i++) {
                  let j = i * 200;
                  let k = (i + 1) * 200 + 5;
                  let data = {
                    crtId: crtId,
                    records: record.slice(j, k),
                  };
                  getTempReading(data)
                    .then(
                      logger.info(
                        data,
                        "successfull get resp of getTempReading api."
                      )
                    )
                    .catch((err) => {
                      logger.error(
                        { err: err.message },
                        "error while calling api"
                      );
                      dialog.showMessageBox(
                        {
                          type: "error",
                          title: "Error",
                          buttons: ["Ok"],
                          message: `Error in calling send temperature reading API.Error-${err.message}`,
                        },
                        () => {
                          resolve();
                        }
                      );
                    });
                }
              } else {
                let data = {
                  crtId: crtId,
                  records: resp,
                };
                return getTempReading(data)
                  .then(
                    logger.info(
                      data,
                      "successfull get resp of getTempReading api."
                    )
                  )
                  .catch((err) => {
                    logger.error(
                      { err: err.message },
                      "error while calling api"
                    );
                    dialog.showMessageBox(
                      {
                        type: "error",
                        title: "Error",
                        buttons: ["Ok"],
                        message: `Error in calling send temperature reading API.Error-${err.message}`,
                      },
                      () => {
                        resolve();
                      }
                    );
                  });
              }
            })
            .catch((err) => {
              logger.error({ err }, "error while executing query");
            });
        })
        .catch((err) => {
          logger.error(
            { err },
            "error while calling api in getTimeLastConnect"
          );
        });
    });
  }
};
exports.recorder = () => {
  console.log({ timeInterval }, "recorder");
  setInterval(startRecording, 60000);
  setInterval(sendPingDetails, 30000);
  sendRecorder = setTimeout(sendRecording, timeInterval * 60000);

  // pool.query(query)
  //     .then(([ res ]) => {
  //         logger.info({ res }, 'result from db');
  //         if (res[0].start_recording) {
  //             logger.warn('starting recoder, recording every minutes!');
  //             setInterval(startRecording, 60000);
  //         } else {
  //             logger.warn('not recording now');
  //         }
  //     })
  //     .catch((err) => {
  //         logger.error({ err }, 'unable to conect to db');
  //     });
};
