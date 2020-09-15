const electron = require("electron");
const Promise = require("bluebird");
const logger = require("../../../log");
const exec = require("child_process").exec;

const ipc = electron.ipcRenderer;

const ISTOffset = 330;
const ONEHROFFSET = 3600000;

logger.info("loaded set date and time");

let time = document.getElementById("time");

let form = document.getElementById("submit").addEventListener(
  "click",
  () => {
    event.preventDefault();
    logger.info("clicked submit button, set date and time");

    start = time.value;

    logger.info(start, "logging start time variable");

    const child = exec(
      `sudo date -s "${start}" && sudo hwclock -w`,
      (error, stdout, stderr) => {
        logger.info(`stdout: ${stdout}`, "date and time set");
        logger.info(`stderr: ${stderr}`, "date and time set error");
        if (error !== null) {
          logger.error(`exec error: ${error}`);
          document.getElementById(
            "hidden"
          ).innerHTML = `Error setting date and time of the device, contact administrator`;
          document.getElementById("hidden").style.display = "block";
        } else {
          document.getElementById("hidden").innerHTML = `Time set successful!!`;
          document.getElementById("hidden").style.display = "block";
        }
      }
    );
  },
  false
);

const back = document.getElementById("back").addEventListener("click", () => {
  logger.info("back button pressed from set date and time, going to dash!");
  ipc.send("back-to-dash");
});
