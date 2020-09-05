// requires
const transferToUSB = require("./transferToUSB");
const fs = require("fs");
const config = require("./config");
const {
  getPingDetails,
} = require("./crt-server");

// CRT Web server change
let timeInterval = 2;
let sendRecorder;
let pingDetail = 0;
const sendPingDetails = () => {
    console.log("Next send ping details to server, next in 30 sec");
    const filePath = __dirname + "/crtId.txt";
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) console.error({ err }, "error while opening file");
      const crtId = data;
      console.log(crtId, "crtId in fs.freadFile");
      const params = {
        crtId: crtId,
      };
      console.log(params, "params in sendPingDetails");
      return getPingDetails(params)
        .then((resp) => {
          console.log({ resp }, "calling api in getPingDetails");
          timeInterval = resp.data.dataRetrivalTime;
          if (resp.data.drtFlag) {
            clearTimeout(sendRecorder);
            sendRecorder = setTimeout(sendRecording, timeInterval * 60000);
          }
          pingDetail = 1;
          return transferToUSB.generatePingDetail(pingDetail.toString());
        })
        .catch((err) => {
          pingDetail = 0;
          console.error({ err }, "error while calling api in getPingDetails");
          return transferToUSB.generatePingDetail(pingDetail.toString());
        });
    });
};

exports.recorder = () => {
  console.log({ timeInterval }, "recorder");
  setInterval(sendPingDetails, 1000);

  // pool.query(query)
  //     .then(([ res ]) => {
  //         console.log({ res }, 'result from db');
  //         if (res[0].start_recording) {
  //             console.warn('starting recoder, recording every minutes!');
  //             setInterval(startRecording, 60000);
  //         } else {
  //             console.warn('not recording now');
  //         }
  //     })
  //     .catch((err) => {
  //         console.error({ err }, 'unable to conect to db');
  //     });
};
