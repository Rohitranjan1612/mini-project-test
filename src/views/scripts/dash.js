const electron = require("electron");
const Promise = require("bluebird");
const logger = require("../../../log");

const ipc = electron.ipcRenderer;

logger.info("loaded dash");

let time_button = document.getElementById("time");
let temp_button = document.getElementById("temp");
let set_button = document.getElementById("set");
let display_button = document.getElementById("display");
let truncate = document.getElementById("truncate");

// logics for buttons

temp_button.addEventListener("click", () => {
  logger.info("clicked land_button!");

  //send ipc
  ipc.send("back-to-land");
});

set_button.addEventListener("click", () => {
  logger.info("clicked set_button!");

  //send ipc
  ipc.send("set-sensor-unit-params");
});

display_button.addEventListener("click", () => {
  logger.info("clicked display_button!");
  //send ipc
  ipc.send("display-data");
});

time_button.addEventListener("click", () => {
  logger.info("clicked time_button!");
  //send ipc
  ipc.send("set-time");
});

truncate.addEventListener("click", () => {
  logger.info("clicked truncate!");
  //send ipc
  ipc.send("delete-all-data");
});

anydesk.addEventListener("click", () => {
  logger.info("clicked any-desk!");
  //send ipc
  ipc.send("any-desk");
});
