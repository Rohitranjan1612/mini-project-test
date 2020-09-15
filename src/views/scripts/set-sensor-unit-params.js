const electron = require("electron");
const pool = require("../../../connections/db");
const Promise = require("bluebird");
const logger = require("../../../log");
const params_table = require("../../../config").params_table;
const { getDeviceInfo } = require("../../../services/api/crt-server");
const getCrtId = require("../../../handlers/getCrtId");
const transferToUSB = require("../../../handlers/transferToUSB");
const ipc = electron.ipcRenderer;
const { dialog } = require("electron").remote;
const config = require("../../../config");

logger.info("loaded set_params");

let r_name = document.getElementById("r_name");
let d_name = document.getElementById("d_name");
let s_name = document.getElementById("s_name");
let max_limit = document.getElementById("max_limit");
let min_limit = document.getElementById("min_limit");

window.onload = () => {
  logger.info("document loaded");
  query = `SELECT * FROM ${params_table} where id=1`;
  arg = [];
  pool
    .query(query, arg)
    .then((result) => {
      logger.info(result, "result");
      r_name.value = result[0][0].railway;
      d_name.value = result[0][0].division;
      s_name.value = result[0][0].station;
      max_limit.value = result[0][0].max_temp;
      min_limit.value = result[0][0].min_temp;
    })
    .catch((error) => {
      logger.info("Error in executing query", { query, error });
    });
};

let form = document.getElementById("submit").addEventListener(
  "click",
  () => {
    logger.info(
      "clicked submit button, form is going to be submitted after all form validations"
    );
    console.log("form");

    event.preventDefault();
    if (config.crt_web_flag) {
      getCrtId.getCrtId();
    }
    //form validations
    if (r_name.value.length < 1) {
      r_name.className += " invalid";
      document.getElementById("hidden").innerHTML =
        "Railway name must be of 1-4 alphabets.";
      document.getElementById("hidden").style.display = "block";
      event.preventDefault();
      return false;
    }
    if (d_name.value.length < 1) {
      d_name.className += " invalid";
      document.getElementById("hidden").innerHTML =
        "Division name must be of 1-4 alphabets.";
      document.getElementById("hidden").style.display = "block";
      event.preventDefault();
      return false;
    }
    if (s_name.value.length < 1) {
      s_name.className += " invalid";
      document.getElementById("hidden").innerHTML =
        "From Station name must be of 1-4 alphabets.";
      document.getElementById("hidden").style.display = "block";
      event.preventDefault();
      return false;
    }
    if (max_limit.value > 100) {
      max_limit.className += " invalid";
      document.getElementById("hidden").innerHTML =
        "Maximum Temperature Limit must be less than 100 *C";
      document.getElementById("hidden").style.display = "block";
      event.preventDefault();
      return false;
    }
    if (min_limit.value < -20) {
      s_name.className += " invalid";
      document.getElementById("hidden").innerHTML =
        "Minimum Temperature Limit must be greater than -20 *C";
      document.getElementById("hidden").style.display = "block";
      event.preventDefault();
      return false;
    }

    const a = [
      r_name.value.toUpperCase(),
      d_name.value.toUpperCase(),
      s_name.value.toUpperCase(),
      max_limit.value,
      min_limit.value,
    ];

    logger.info(a, "values");

    let query = `UPDATE crtapp.params t SET t.railway = "${a[0]}", t.division = "${a[1]}", t.station = "${a[2]}" , t.max_temp = "${a[3]}" , t.min_temp = "${a[4]}" WHERE t.id = 1`;
    let args = [];

    logger.info(query, "query");

    return pool
      .query(query, arg)
      .then((result) => {
        logger.info(result, "executing update query successful");
        if (!config.crt_params_web_flag) {
          ipc.send("set-params-successful");
        }
      })
      .then(() => {
        if (config.crt_params_web_flag) {
          let crtId = getCrtId.crtId;
          // logger.info({ crtId: crtId }, "saasasasasasas");
          const params = {
            crtId: crtId,
            railwayname: a[0],
            division: a[1],
            station: a[2],
            maxTemp: a[3],
            minTemp: a[4],
          };
          return getDeviceInfo(params)
            .then((resp) => {
              logger.info(resp.data.crtId, "API call successful");
              const crtId = resp.data.crtId;
              return transferToUSB.generatecrtId(crtId.toString()).then(() => {
                //send ipc on successful entry
                ipc.send("set-params-successful");
              });
            })
            .catch((err) => {
              logger.info(err, "Error in calling set params API");
              dialog.showMessageBox(
                {
                  type: "error",
                  title: "Error",
                  buttons: ["Ok"],
                  message: `Error in calling set params API.Error-${err.message}`,
                },
                () => {
                  resolve();
                }
              );
            });
        }
      })
      .catch((error) => {
        logger.info("Error in executing query", { error });
      });
  },
  false
);

const back = document.getElementById("back").addEventListener(
  "click",
  () => {
    logger.info("back button pressed from display data, going to dash!");

    let query = `select temperature, time from temperature_readings where temperature = 100`;
    return pool
      .query(query)
      .then(() => {
        ipc.send("back-to-dash");
      })
      .catch((error) => {
        logger.info("Error in executing query", { error });
      });
  },
  false
);
