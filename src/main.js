const {app, BrowserWindow, ipcMain} = require('electron')
const logger = require("../log");
const recorder = require("../handlers/recorder");
recorder.recorder();
const crtController = require("../crt_controller/index");
crtController.startTracker();
const config = require("../config");
config.expireWebMembership();

let mainWindow;

// set frame false and splashwindow loadurl change
app.on("ready", () => {
  logger.info("ready!");
  mainWindow = new BrowserWindow({
    frame: false,
    height: 480,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      // preload: path.join(__dirname, 'preload.js')
}
  });

  mainWindow.loadURL(`file://${__dirname}/views/splash.html`);

  mainWindow.on("closed", () => {
    logger.info("closed!");
    mainWindow = null;
  });
});

ipcMain.on("login-successful", () => {
  mainWindow.loadURL(`file://${__dirname}/views/dash.html`);
});

// listen to set time ipcMain
ipcMain.on("set-time", () => {
  mainWindow.loadURL(`file://${__dirname}/views/set_time.html`);
});

// set params
ipcMain.on("set-sensor-unit-params", () => {
  mainWindow.loadURL(`file://${__dirname}/views/set-sensor-unit-params.html`);
});

// on successful params set
ipcMain.on("set-params-successful", () => {
  mainWindow.loadURL(`file://${__dirname}/views/dash.html`);
});

// on back to dash
ipcMain.on("back-to-dash", () => {
  mainWindow.loadURL(`file://${__dirname}/views/dash.html`);
});

// on back to dash
ipcMain.on("back-to-land", () => {
  mainWindow.loadURL(`file://${__dirname}/views/land.html`);
});

// on forget password
ipcMain.on("forget-password", () => {
  mainWindow.loadURL(`file://${__dirname}/views/forget.html`);
});

// on back-to-login
ipcMain.on("back-to-login", () => {
  mainWindow.loadURL(`file://${__dirname}/views/main.html`);
});

// on back-to-login
ipcMain.on("login-first", () => {
  mainWindow.loadURL(`file://${__dirname}/views/login-first.html`);
});

// listen to delet all data ipcMain
ipcMain.on("delete-all-data", () => {
  mainWindow.loadURL(`file://${__dirname}/views/delete-all-data.html`);
});

// display data
ipcMain.on("display-data", () => {
  mainWindow.loadURL(`file://${__dirname}/views/display-data.html`);
});

// Any Desk
ipcMain.on("any-desk", () => {
  mainWindow.loadURL(`file://${__dirname}/views/any-desk.html`);
});
