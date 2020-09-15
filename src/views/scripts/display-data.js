const electron = require('electron');
const Promise = require('bluebird');
const logger = require('../../../log');
const connection = require('../../../connections/db2');
const transferToUsb = require('../../../handlers/transferToUSB');
const moment = require('moment');

const ipc = electron.ipcRenderer;

logger.info('loaded Display data');

const select = document.getElementById('select');
const startTime = document.getElementById('start-time');
const endTime = document.getElementById('end-time');
const textarea = document.getElementById('data');

// transfer form
let pdName = document.getElementById('pd_name');
let transferButton = document.getElementById('transfer');

const form = document.getElementById('asd').addEventListener('submit', () => {
    event.preventDefault();
    // enable transfer button
    transferButton.disabled = false;
    // empty text field
    textarea.value = '';
    logger.info('clicked submit button, fetching data');
    
    const selectedItem = select.value.split(' ')[0];
    const start = startTime.value;
    const end = endTime.value;

    logger.info(selectedItem, start, end, 'logging variables');

    let startDate = moment(start, 'DD/MM/YYYY H:mm').valueOf();
    let endDate = moment(end, 'DD/MM/YYYY H:mm').valueOf();

    // convert times from millisecs to only secs
    startDate /= 1000;
    endDate /= 1000;

    logger.info(startDate, endDate, 'epoch times');

    fetchData(selectedItem, startDate, endDate);

}, false);

const fetchData = (selectedItem, startDate, endDate) => {
    const query = 'SELECT * FROM params';
    connection.query(query,
        (err, results) => {
            if (err) {
                console.log({ err }, 'error while calling db');
            }
            // logger.info(results, 'logging query 1');

            let RRRR = results[0].railway;
            let DDDD = results[0].division;
            let SSSS = results[0].station;

            if (RRRR.length === 3) {
                RRRR = ' ' + RRRR;
            } else if (RRRR.length === 2) {
                RRRR = '  ' + RRRR;
            } else if (RRRR.length === 1) {
                RRRR = '   ' + RRRR;
            }

            if (DDDD.length === 3) {
                DDDD = ' ' + DDDD;
            } else if (DDDD.length === 2) {
                DDDD = '  ' + DDDD;
            } else if (DDDD.length === 1) {
                DDDD = '   ' + DDDD;
            }

            if (SSSS.length === 3) {
                SSSS = ' ' + SSSS;
            } else if (SSSS.length === 2) {
                SSSS = '  ' + SSSS;
            } else if (SSSS.length === 1) {
                SSSS = '   ' + SSSS;
            }

            // writing in text area
            textarea.value = textarea.value + `1, ${RRRR}, ${DDDD}, ${SSSS}\n`;

            // quering ctsl table
            const fetchQuery = `SELECT * from temperature_readings where time >= ${startDate} and time <= ${endDate}`;
            connection.query(fetchQuery,
                (error, fetchQueryResults) => {
                    if (error) {
                        console.log({ error }, 'error while fetchQuery');
                    }
                    // logger.info({ fetchQueryResults }, 'logging fetchQuery results');
                    // init variables
                    let hrMaxTime = 0, hrMaxTemp = -10, hrMinTime = 0, hrMinTemp = 90, abMaxTime = 0, abMaxTemp = -10, abMinTime = 0, abMinTemp = 90;

                    let count = parseInt(selectedItem);
                    const interval = parseInt(selectedItem);
                    const intervalTime = interval * 60;
                    let initialTime = parseInt(startDate);
                    let timePrev = 0, timeCurr = 0;

                    console.log(fetchQueryResults.length);
                    for (let i = 0; i < fetchQueryResults.length; i++) {
                    // changing values of timePrev and timeCurr for day change
                        timePrev = timeCurr;
                        timeCurr = moment(fetchQueryResults[i].time * 1000).format('DD/MM/YY');
                        console.log({ timePrev, timeCurr, queryResult: fetchQueryResults[i] }, 'timePrev and timeCurr');
                    
                        // 3,4,5,6 fields
                        if (timePrev !== timeCurr && timePrev !== 0 && hrMaxTemp > -10) {
                            console.log({ timePrev, timeCurr, hrMaxTime, hrMinTime, abMaxTime, abMinTime }, 'writing hr ab maxes');
                            if (hrMaxTemp >= 0 && hrMaxTemp < 10) {
                                textarea.value = textarea.value + `3, ${hrMaxTime}, +0${hrMaxTemp}, Deg C HR MAX\n`;
                            } else if (hrMaxTemp >= 10) {
                                textarea.value = textarea.value + `3, ${hrMaxTime}, +${hrMaxTemp}, Deg C HR MAX\n`;
                            } else {
                                textarea.value = textarea.value + `3, ${hrMaxTime}, ${hrMaxTemp}, Deg C HR MAX\n`;
                            }

                            if (hrMinTemp >= 0 && hrMinTemp < 10) {
                                textarea.value = textarea.value + `4, ${hrMinTime}, +0${hrMinTemp}, Deg C HR MIN\n`;
                            } else if (hrMinTemp >= 0) {
                                textarea.value = textarea.value + `4, ${hrMinTime}, +${hrMinTemp}, Deg C HR MIN\n`;
                            } else {
                                textarea.value = textarea.value + `4, ${hrMinTime}, ${hrMinTemp}, Deg C HR MIN\n`;
                            }

                            if (abMaxTemp >= 0 && abMaxTemp < 10) {
                                textarea.value = textarea.value + `5, ${abMaxTime}, +0${abMaxTemp}, Deg C AB MAX\n`;
                            } else if (abMaxTemp >= 0) {
                                textarea.value = textarea.value + `5, ${abMaxTime}, +${abMaxTemp}, Deg C AB MAX\n`;
                            } else {
                                textarea.value = textarea.value + `5, ${abMaxTime}, ${abMaxTemp}, Deg C AB MAX\n`;
                            }

                            if (abMinTemp >= 0 && abMinTemp < 10) {
                                textarea.value = textarea.value + `6, ${abMinTime}, +0${abMinTemp}, Deg C AB MIN\n`;
                            } else if (abMinTemp >= 0) {
                                textarea.value = textarea.value + `6, ${abMinTime}, +${abMinTemp}, Deg C AB MIN\n`;
                            } else {
                                textarea.value = textarea.value + `6, ${abMinTime}, ${abMinTemp}, Deg C AB MIN\n`;
                            }
                            hrMaxTemp = -10;
                            hrMinTemp = 90;
                            abMaxTemp = -10;
                            abMinTemp = 90;
                            timeCurr = 0;
                        }

                        // normal comparison for ab values
                        if ((parseFloat(fetchQueryResults[i].temperature)) > abMaxTemp) {
                            abMaxTemp = (parseFloat(fetchQueryResults[i].temperature));
                            abMaxTime = moment(fetchQueryResults[i].time * 1000).format('DD/MM/YY HH:mm');
                        }

                        if ((parseFloat(fetchQueryResults[i].temperature)) < abMinTemp) {
                            abMinTemp = (parseFloat(fetchQueryResults[i].temperature));
                            abMinTime = moment(fetchQueryResults[i].time * 1000).format('DD/MM/YY HH:mm');
                        }

                        // for interval values and time
                        // logger.warn({ initialTime }, parseInt(fetchQueryResults[i].time), 'dsds');
                        while (parseInt(initialTime) < parseInt(fetchQueryResults[i].time)) {
                            initialTime += intervalTime;
                        }

                        const isCurrDate = moment(initialTime * 1000).format('DD/MM/YY') === moment(fetchQueryResults[i].time * 1000).format('DD/MM/YY');

                        if (count > interval && isCurrDate) {
                            const temp = (parseFloat(fetchQueryResults[i].temperature));
                            const time = moment(initialTime * 1000).format('DD/MM/YY HH:mm');
                            if (temp >= 0 && temp < 10) {
                                textarea.value = textarea.value + `2, ${time}, +0${temp}, Deg C\n`;
                            } else if (temp >= 10) {
                                textarea.value = textarea.value + `2, ${time}, +${temp}, Deg C\n`;
                            } else {
                                textarea.value = textarea.value + `2, ${time}, ${temp}, Deg C\n`;
                            }

                            if ((parseFloat(fetchQueryResults[i].temperature)) > hrMaxTemp) {
                                hrMaxTemp = (parseFloat(fetchQueryResults[i].temperature));
                                hrMaxTime = moment(initialTime * 1000).format('DD/MM/YY HH:mm');
                            }

                            if ((parseFloat(fetchQueryResults[i].temperature)) < hrMinTemp) {
                                hrMinTemp = (parseFloat(fetchQueryResults[i].temperature));
                                hrMinTime = moment(initialTime * 1000).format('DD/MM/YY HH:mm');
                            }
                            initialTime += intervalTime;
                            count = 0;
                        }
                        if (parseInt(initialTime / 60) === parseInt(fetchQueryResults[i].time / 60)) {
                            // writing to a text area
                            initialTime += intervalTime;
                            count = 0;
                            const temp = (parseFloat(fetchQueryResults[i].temperature));
                            const time = moment(fetchQueryResults[i].time * 1000).format('DD/MM/YY HH:mm');
                            if (temp >= 0 && temp < 10) {
                                textarea.value = textarea.value + `2, ${time}, +0${temp}, Deg C\n`;
                            } else if (temp >= 10) {
                                textarea.value = textarea.value + `2, ${time}, +${temp}, Deg C\n`;
                            } else {
                                textarea.value = textarea.value + `2, ${time}, ${temp}, Deg C\n`;
                            }

                            if ((parseFloat(fetchQueryResults[i].temperature)) > hrMaxTemp) {
                                hrMaxTemp = (parseFloat(fetchQueryResults[i].temperature));
                                hrMaxTime = moment(fetchQueryResults[i].time * 1000).format('DD/MM/YY HH:mm');
                            }

                            if ((parseFloat(fetchQueryResults[i].temperature)) < hrMinTemp) {
                                hrMinTemp = (parseFloat(fetchQueryResults[i].temperature));
                                hrMinTime = moment(fetchQueryResults[i].time * 1000).format('DD/MM/YY HH:mm');
                            }
                        } else {
                            count += 1;
                        }

                    }

                    // setting of hr, ab max-min in the end
                    if (hrMaxTime !== 0 && abMaxTime !== 0) {
                        if (hrMaxTemp >= 0 && hrMaxTemp < 10) {
                            textarea.value = textarea.value + `3, ${hrMaxTime}, +0${hrMaxTemp}, Deg C HR MAX\n`;
                        } else if (hrMaxTemp >= 10) {
                            textarea.value = textarea.value + `3, ${hrMaxTime}, +${hrMaxTemp}, Deg C HR MAX\n`;
                        } else {
                            textarea.value = textarea.value + `3, ${hrMaxTime}, ${hrMaxTemp}, Deg C HR MAX\n`;
                        }

                        if (hrMinTemp >= 0 && hrMinTemp < 10) {
                            textarea.value = textarea.value + `4, ${hrMinTime}, +0${hrMinTemp}, Deg C HR MIN\n`;
                        } else if (hrMinTemp >= 0) {
                            textarea.value = textarea.value + `4, ${hrMinTime}, +${hrMinTemp}, Deg C HR MIN\n`;
                        } else {
                            textarea.value = textarea.value + `4, ${hrMinTime}, ${hrMinTemp}, Deg C HR MIN\n`;
                        }

                        if (abMaxTemp >= 0 && abMaxTemp < 10) {
                            textarea.value = textarea.value + `5, ${abMaxTime}, +0${abMaxTemp}, Deg C AB MAX\n`;
                        } else if (abMaxTemp >= 0) {
                            textarea.value = textarea.value + `5, ${abMaxTime}, +${abMaxTemp}, Deg C AB MAX\n`;
                        } else {
                            textarea.value = textarea.value + `5, ${abMaxTime}, ${abMaxTemp}, Deg C AB MAX\n`;
                        }

                        if (abMinTemp >= 0 && abMinTemp < 10) {
                            textarea.value = textarea.value + `6, ${abMinTime}, +0${abMinTemp}, Deg C AB MIN\n`;
                        } else if (abMinTemp >= 0) {
                            textarea.value = textarea.value + `6, ${abMinTime}, +${abMinTemp}, Deg C AB MIN\n`;
                        } else {
                            textarea.value = textarea.value + `6, ${abMinTime}, ${abMinTemp}, Deg C AB MIN\n`;
                        }
                    }

                    // writing to file
                    transferToUsb.generate(textarea.value, `${selectedItem}-mins-interval.csv`);
                    const str = textarea.value.replace(/,/g,'');
                    transferToUsb.generate(str, `${selectedItem}-mins-interval.txt`);
                });

        }
    );
};

const back = document.getElementById('back').addEventListener('click', () => {
    logger.info('back button pressed from display data, going to dash!');
    transferToUsb.deleteDirectory();
    ipc.send('back-to-dash');
});

const hiddenDiv = document.getElementById('hidden');

const transferForm = document
  .getElementById("transfer")
  .addEventListener("click", () => {
    event.preventDefault();
    const pd = pdName.value;
    logger.warn(pd, "name of the pen drive");

    hiddenDiv.innerHTML = "";

    transferToUsb.transfer(pd, (err, message) => {
      if (err) {
        logger.error(
          err,
          "error from transfer function in transfer data[transfer_data]"
        );
        hiddenDiv.innerHTML =
          "ERROR!!! Check your pendrive and name you provided and try again.";
        hiddenDiv.style.display = "block";
      } else {
        logger.info(
          message,
          "successfully transferred files to pd[transfer_data]"
        );
        hiddenDiv.innerHTML = "Success transferred files to your pendrive";
        hiddenDiv.style.display = "block";
      }
    });

    logger.info("Writing files to pen drive :)");
  });
