const electron = require("electron");
const Promise = require("bluebird");
const pool = require("../../../connections/db");
const logger = require("../../../log");
const exec = require("child_process").exec;

const ipc = electron.ipcRenderer;

logger.info("loaded Any Desk");
const textarea = document.getElementById("data");

let form = document.getElementById("submit").addEventListener(
  "click",
  () => {
    event.preventDefault();
    logger.info("clicked get Detail button, Any Desk");
    textarea.value = "";
    const child = exec(
      `echo "Anydesk Id:" && anydesk --get-id && echo "\nStatus:" && anydesk --get-status && echo ""`,
      (error, stdout, stderr) => {
        logger.info(`stdout: ${stdout}`, "Any Desk Output");
        logger.info(`stderr: ${stderr}`, "Any Desk error");
        if (error !== null) {
          logger.error(`exec error: ${error}`);
          document.getElementById(
            "hidden"
          ).innerHTML = `Error in getting anydesk details.Check internet connection`;
          document.getElementById("hidden").style.display = "block";
        } else {
          textarea.value = `${stdout}`;
        }
      }
    );
  },
  false
);

const back = document.getElementById("back").addEventListener("click", () => {
  logger.info("back button pressed from display data, going to dash!");
  ipc.send("back-to-dash");
});
