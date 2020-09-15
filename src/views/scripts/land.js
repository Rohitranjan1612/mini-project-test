const electron = require("electron");
const Promise = require("bluebird");
const connection = require("../../../connections/db2");
const pool = require("../../../connections/db");
const logger = require("../../../log");
const moment = require("moment");
const recorder = require("../../../handlers/recorder");
const getPingDetail = require("../../../handlers/getPingDetail");
const buzzer = require("../../../handlers/buzzer");
const { dialog } = require("electron").remote;
const config = require("../../../config");

let prevTemp = 0;
let prevTempUpdatedForTheFirstTime = false;

const ipc = electron.ipcRenderer;

logger.info("loaded land");

const dash_button = document.getElementById("dash");

// logics for buttons

dash_button.addEventListener("click", () => {
  logger.info("clicked set_button!");

  const query = `UPDATE temperature SET current_temp = ? where id = ?`;
  let minTemp = document.getElementById("min_temp").innerHTML;
  minTemp = parseFloat(minTemp.split(" ")[0]);
  let maxTemp = document.getElementById("max_temp").innerHTML;
  maxTemp = parseFloat(maxTemp.split(" ")[0]);
  pool.query(query, [minTemp, 2]);
  pool.query(query, [maxTemp, 3]);
  //send ipc to login
  ipc.send("back-to-login");
});

const getTime = () => {
  const time = moment().format("HH:mm:ss");
  // logger.info({ time }, 'time');
  const time_label = document.getElementById("time");
  time_label.innerHTML = time;
  setTimeout(getTime, 1000);
};

const getDate = () => {
  const date = moment().format("MMMM Do YYYY");
  // logger.info({ date }, 'date');
  const date_label = document.getElementById("date");
  date_label.innerHTML = date;
  setTimeout(getDate, 60000);
};

const showError = (message) => {
  logger.info("buzzzzzzzzzzzzer");
  return new Promise((resolve, reject) => {
    buzzer.startAlarm();
    dialog.showMessageBox(
      {
        type: "error",
        title: "Error",
        buttons: ["Ok"],
        message,
      },
      () => {
        buzzer.stopAlarm();
        resolve();
      }
    );
  });
};

let hash1 = "qwerty";
let hash2 = "zxcvbn";
let hash3 = "asdfgh";
let hash4 = "ytrewq";
let hash5 = "gfdsaz";
let hash6 = "gfdsdsaz";
let hash7 = "gfdsabvz";
let hash8 = "gfdsaza";
let hash9 = "gfxcdsaz";
let hash10 = "gfdewsaz";
let hash11 = "gfdsaz";
let hash12 = "gfdseaz";
let hash13 = "gfdsatrz";
let hash14 = "gfdsabvz";
let hash15 = "gfdsahgz";
let alarmed = 0;

const getTemp = () => {
  let min = 0;
  let max = 85;
  const query = `SELECT current_temp, hash from temperature`;
  getPingDetail.getPingDetail();
  connection.query(query, (err, res) => {
    if (err) {
      logger.error(err, "error in getTemp land");
    } else {
      // logger.info({ res, res0: res[0].hash }, "jsjssd");
      const temp = res[0].current_temp;
      const hash = res[0].hash;
      // logger.info({ hash, hash1, hash2, hash3, hash4, hash5 });
      // logger.info({ pingDetail: recorder.pingDetail });
      if (!config.crt_params_web_flag) {
        var isConnected = document.getElementById("isConnected");
        isConnected.style.display = "none";
      } else if (parseInt(getPingDetail.pingDetail)) {
        document.getElementById("isConnected").innerHTML = `
                  <a href="#">
                    <span class="glyphicon glyphicon-ok"></span>
                  </a> Connected`;
      } else {
        document.getElementById("isConnected").innerHTML = `Not Connected`;
      }
      if (
        hash1 === hash &&
        hash2 === hash &&
        hash3 === hash &&
        hash4 === hash &&
        hash5 === hash &&
        hash6 === hash &&
        hash7 === hash &&
        hash8 === hash &&
        hash9 === hash &&
        hash10 === hash &&
        hash11 === hash &&
        hash12 === hash &&
        hash13 === hash &&
        hash14 === hash &&
        hash15 === hash
      ) {
        // sensors problem
        logger.error("check sensors or main program not running");
        //set not recording on display
        document.getElementById("isRecording").innerHTML = `Not Recording`;

        if (!alarmed) {
          alarmed = 1;
          return showError(
            "Check the connections and the main program. Or contact administrator"
          );
        }
      } else {
        // set recording on display
        document.getElementById("isRecording").innerHTML = `
                  <a href="#">
                    <span class="glyphicon glyphicon-ok"></span>
                  </a> Recording`;

        alarmed = 0;
        // changing hash values
        hash1 = hash2;
        hash2 = hash3;
        hash3 = hash4;
        hash4 = hash5;
        hash5 = hash6;
        hash6 = hash7;
        hash7 = hash8;
        hash8 = hash9;
        hash9 = hash10;
        hash10 = hash11;
        hash11 = hash12;
        hash12 = hash13;
        hash13 = hash14;
        hash14 = hash15;
        hash15 = hash;
        // logger.info({ temp }, 'temp');
        const temp_label = document.getElementById("curr_temp");
        if (!prevTempUpdatedForTheFirstTime) {
          prevTemp = parseFloat(temp);
          prevTempUpdatedForTheFirstTime = true;
        }
        temp_label.innerHTML = temp + " *C";
        return Promise.resolve();
      }
    }
  });
  setTimeout(getTemp, 1000);
};

const getRecording = () => {
  const query = "SELECT * from params";
  pool.query(query).then(([res]) => {
    logger.info(res[0].start_recording, res[0].start_time);
    if (res[0].start_recording) {
      recorder.recorder();
      document.getElementById("isRecording").innerHTML = `
                      <a href="#">
                        <span class="glyphicon glyphicon-ok"></span>
                      </a> Recording`;
    } else {
      const timeDiff = res[0].start_time - Math.ceil(moment().valueOf() / 1000);
      if (timeDiff > 0) {
        setTimeout(() => {
          const query = "UPDATE params SET start_recording = 1";
          pool.query(query);
          recorder.recorder();
          document.getElementById("isRecording").innerHTML = `
                          <a href="#">
                            <span class="glyphicon glyphicon-ok"></span>
                          </a> Recording`;
        }, timeDiff);
      } else {
        recorder.recorder();
      }
    }
  });
};

// const getMinTemp = () => {
//     // let temp = 90;
//     let buzzed = 0;

//     const calcMin = () => {
//         // logger.warn({ currTime, endTime }, 'times');
//         const startDate = moment().startOf('day').valueOf();
//         const now = moment().valueOf();
//         if ((now - startDate) > 5*1000) {
//             // check temp
//             let currTemp = document.getElementById('curr_temp').innerHTML;
//             currTemp = parseFloat(currTemp.split(' ')[0]);
//             // logger.info({ currTemp });
//             temp = document.getElementById('min_temp').innerHTML;
//             temp = parseFloat(temp.split(' ')[0]);
//             if (currTemp < temp) {
//                 // update curr min
//                 temp = currTemp;
//                 const time = moment().format('h:mm a');
//                 document.getElementById('min_temp').innerHTML = temp + ' *C';
//                 document.getElementById('min_time').innerHTML = time;

//                 pool.query('SELECT min_temp as minTemp from params where id=1')
//                     .then(([ res ]) => {
//                         if (res[0].minTemp >= temp) {
//                             if (buzzed === 0) {
//                                 buzzed = 1;
//                                 return showError(`Current Temperature ${temp} crossed minimum temperature limit of ${res[0].minTemp}`);
//                             }
//                         } else {
//                             buzzed = 0;
//                         }
//                     });
//             }
//             setTimeout(calcMin, 1000);
//         } else {
//             const query = `UPDATE temperature SET current_temp = ? where id = ?`;
//             let minTemp = 100, maxTemp = -10;
//             const time = moment().format('h:mm a');
//             document.getElementById('min_temp').innerHTML = minTemp + ' *C';
//             document.getElementById('max_temp').innerHTML = maxTemp + ' *C';
//             document.getElementById('min_time').innerHTML = time;
//             document.getElementById('max_time').innerHTML = time;
//             pool.query(query, [minTemp, 2]);
//             pool.query(query, [maxTemp, 3]);
//         }
//     };

//     const query = `SELECT current_temp as temp, updated_at as time from temperature where id = 2`;
//     pool.query(query)
//         .then(([ res ]) => {
//             const time = moment(res[0].time).format('h:mm:ss a');
//             document.getElementById('min_temp').innerHTML = res[0].temp + ' *C';
//             document.getElementById('min_time').innerHTML = time;
//             setTimeout(calcMin, 1000);
//         });
// };

const getMaxTemp = () => {
  let defaultMax = -10;
  let buzzed = 0;

  const calcMax = () => {
    const now = moment().valueOf();
    const fetchQuery = `SELECT current_temp as temp, updated_at as time from temperature where id > 1`;
    pool.query(fetchQuery).then(([res]) => {
      // setting up current maxmin
      // logger.warn(String(res[0].time).substr(16, 5), 'time@@@@@@@@@@@@@@');
      document.getElementById("min_temp").innerHTML = res[0].temp + " *C";
      document.getElementById("max_temp").innerHTML = res[1].temp + " *C";
      document.getElementById("min_time").innerHTML = String(
        res[0].time
      ).substr(16, 5);
      document.getElementById("max_time").innerHTML = String(
        res[1].time
      ).substr(16, 5);

      // logics
      const todayDate = parseInt(String(moment().date()));
      const fetchedDate = parseInt(String(res[0].time).split(" ")[2]);

      // logger.warn({ todayDate, fetchedDate, buzzed }, String(res[0].time), '------dates**********');
      if (parseInt(fetchedDate) == parseInt(todayDate)) {
        const currMin = parseFloat(res[0].temp);
        const currMax = parseFloat(res[1].temp);
        const currTemp = parseFloat(
          document.getElementById("curr_temp").innerHTML.split(" ")[0]
        );
        // logger.info({ currMin, currMax, currTemp }, "fetchedDate == todayDate");

        // buzzer max min
        pool
          .query(
            "SELECT max_temp as maxTemp, min_temp as minTemp from params where id=1"
          )
          .then(([res]) => {
            // logger.warn({ res }, "$$$$$------$$$$$");
            if (res[0].maxTemp <= currTemp) {
              // logger.warn({ currTemp, res, buzzed }, "$$$$$------$$$$$");
              if (buzzed == 0) {
                // logger.warn({ buzzed }, "%%%%%------%%%%%");
                buzzed = 1;
                showError("max temp limit exceeded");
              }
            } else if (res[0].minTemp >= currTemp) {
              // logger.warn({ currTemp, res, buzzed }, "$$$$$------$$$$$");
              if (buzzed === 0) {
                // logger.warn({ buzzed }, "%%%%%------%%%%%");
                buzzed = 1;
                showError(
                  `Current Temperature ${currTemp} crossed minimum temperature limit of ${res[0].minTemp}`
                );
              }
            } else {
              buzzed = 0;
            }
          });
        console.log(
          { currMax, currTemp, prevTemp, abs: Math.abs(currTemp - prevTemp) },
          "values"
        );
        if (currMax < currTemp && Math.abs(currTemp - prevTemp) < 5) {
          // update curr max
          const time = moment().format("HH:mm");
          updateQuery =
            "UPDATE temperature SET current_temp = ?, updated_at = ? where id = 3";
          const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
          pool.query(updateQuery, [currTemp, updated_at]).then(() => {
            document.getElementById("max_temp").innerHTML = currTemp + " *C";
            document.getElementById("max_time").innerHTML = time;
            prevTemp = currTemp;
            setTimeout(calcMax, 1000);
          });
        } else if (currMin > currTemp && Math.abs(currTemp - prevTemp) < 5) {
          // update curr max
          const time = moment().format("HH:mm");
          updateQuery =
            "UPDATE temperature SET current_temp = ?, updated_at = ? where id = 2";
          const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
          pool.query(updateQuery, [currTemp, updated_at]).then(() => {
            document.getElementById("min_temp").innerHTML = currTemp + " *C";
            document.getElementById("min_time").innerHTML = time;
            prevTemp = currTemp;
            setTimeout(calcMax, 1000);
          });
        } else {
          prevTemp = currTemp;
          setTimeout(calcMax, 1000);
        }
      } else {
        // date is chnaged resetting the values
        logger.warn("---------in else date change---------");
        const maxTemp = parseFloat(
          document.getElementById("curr_temp").innerHTML.split(" ")[0]
        );
        const time = moment().format("HH:mm");
        updateQuery =
          "UPDATE temperature SET current_temp = ?, updated_at = ? where id > 1";
        // const updated_at = String(moment()).split('T')[0] + ' ' + String(moment()).split('T')[1];
        const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
        pool.query(updateQuery, [maxTemp, updated_at]).then((res) => {
          logger.warn({ res }, "update query result");
          document.getElementById("min_temp").innerHTML = maxTemp + " *C";
          document.getElementById("max_temp").innerHTML = maxTemp + " *C";
          document.getElementById("min_time").innerHTML = time;
          document.getElementById("max_time").innerHTML = time;
          prevTemp = maxTemp;
          setTimeout(calcMax, 2000);
        });
      }
    });
  };

  calcMax();
};

// const getMaxTemp = () => {
//     // let temp = 10;
//     const endTime = moment().endOf('day').valueOf();
//     let buzzed = 0

//     const calcMax = () => {
//         // logger.warn({ currTime, endTime }, 'times');
//         const startDate = moment().startOf('day').valueOf();
//         const now = moment().valueOf();
//         if ((now - startDate) > 5*1000) {
//             // check temp
//             let currTemp = document.getElementById('curr_temp').innerHTML;
//             currTemp = parseFloat(currTemp.split(' ')[0]);
//             // logger.info({ currTemp });
//             temp = document.getElementById('max_temp').innerHTML;
//             temp = parseFloat(temp.split(' ')[0]);
//             // logger.warn(temp, 'sgdfhghjnk.hgfdghjk');
//             if (currTemp > temp) {
//                 // update curr min
//                 temp = currTemp;
//                 const time = moment().format('h:mm:ss a');
//                 document.getElementById('max_temp').innerHTML = temp + ' *C';
//                 document.getElementById('max_time').innerHTML = time;

//                 pool.query('SELECT max_temp as maxTemp from params where id=1')
//                     .then(([ res ]) => {
//                         if (res[0].maxTemp <= temp) {
//                             if (buzzed === 0) {
//                                 buzzed = 1;
//                                 return showError(`Current Temperature ${temp} crossed maximum temperature limit of ${res[0].maxTemp}`);
//                             }
//                         } else {
//                             buzzed = 0;
//                         }
//                     });
//             }
//             setTimeout(calcMax, 1000);
//         }
//     };

//     const query = `SELECT current_temp as temp, updated_at as time from temperature where id = 3`;
//     pool.query(query)
//         .then(([ res ]) => {
//             const time = moment(res[0].time).format('h:mm:ss a');
//             document.getElementById('max_temp').innerHTML = res[0].temp + ' *C';
//             document.getElementById('max_time').innerHTML = time;
//             setTimeout(calcMax, 1000);
//         });
// };

window.onload = () => {
  logger.info("land document loaded");
  // getRecording();
  getTime();
  getDate();
  getTemp();
  // getMinTemp();
  getMaxTemp();
};

module.exports = {showError};