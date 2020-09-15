const electron = require('electron');
// const pool = require('../../../connections/db');
const connection = require('../../../connections/db2');
const Promise = require('bluebird');
const logger = require('../../../log');
const login_table = require('../../../config').login_table;
const params_table = require('../../../config').params_table;
const recorder = require('../../../handlers/recorder');

const ipc = electron.ipcRenderer;

logger.info('loaded login first');

let submit_button = document.getElementById('submit').addEventListener('click', () => {
    event.preventDefault();
    logger.info('clicked login button');
    let password = document.getElementById('password').value
    // let time = document.getElementById('time').value
    // time = new Date(time).valueOf() / 1000;

    const query = `SELECT * FROM ${login_table} where password = "${password}"`
    connection.query(query,
      function(err, result, fields) {
        if(err)
            logger.info('Error in executing query', { err });
        else {
            length = result.length
            logger.info(length, "result");
            if(length > 0){
                const query2 = `UPDATE ${login_table} t SET t.is_loggedin = "1" WHERE t.id = 1`;
                // const args = [1, time];
                logger.warn(query2);
                connection.query(query2);
                ipc.send('back-to-land');
            }
            else{
                document.getElementById('hidden').innerHTML = "Login failed!!! <br>Check your password or go to forget password.";
                document.getElementById('hidden').style.display = "block";
                document.getElementById('password').value = "";
            }
        }
    });
}, false);

let forget_password_btn = document.getElementById('forgetPassword').addEventListener('click', () => {
    logger.info('clicked forget password');
    event.preventDefault();

    ipc.send('forget-password');
});
