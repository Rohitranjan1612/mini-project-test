const electron = require('electron');
// const pool = require('../../../connections/db');
const connection = require('../../../connections/db2');
const Promise = require('bluebird');
const logger = require('../../../log');
const login_table = require('../../../config').login_table;
const master_pass = require('../../../config').master_password;

const ipc = electron.ipcRenderer

logger.info('loaded forget password');

let submit_button = document.getElementById('submit').addEventListener('click', () => {
    event.preventDefault();
    logger.info('clicked submit button of foret password');

    let mp = document.getElementById('master_pass').value;
    let password = document.getElementById('password').value;

    if (mp === master_pass) {
        if (password.length >= 4) {
            query = `update ${login_table} set password = "${password}" where id = 1;`
            connection.query(query, (err, result, fields) => {
                if(err){
                    logger.error('cant set new user password', err, query);
                } else{
                    document.getElementById('hidden').innerHTML = "Password set Successful. Go back and login with new password.";
                    document.getElementById('hidden').style.display = "block";
                    document.getElementById('password').value = ""
                    document.getElementById('master_pass').value = ""
                }
            })
        } else {
            document.getElementById('hidden').innerHTML = "Password must be greater than or equal to 4 characters.";
            document.getElementById('hidden').style.display = "block";
            document.getElementById('password').value = ""
        }
    } else {
        document.getElementById('hidden').innerHTML = "Incorrect Master Password";
        document.getElementById('hidden').style.display = "block";
        document.getElementById('master_pass').value = ""
        document.getElementById('password').value = ""
    }
}, false);

let back = document.getElementById('back').addEventListener('click', () => {
    logger.info('clicked back');
    event.preventDefault();
    ipc.send('back-to-login');
})