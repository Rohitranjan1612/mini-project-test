const electron = require('electron');
const Promise = require('bluebird');
const logger = require('../../../log');
const connection = require('../../../connections/db2');
const exec = require('child_process').exec;
const master_pass = require('../../../config').master_password;
// const ctsl_table = require('../../../config').ctsl_table;

const ipc = electron.ipcRenderer;

const ISTOffset = 330;
const ONEHROFFSET = 3600000;

logger.info('loaded delete all data');

let form = document.getElementById('asd').addEventListener('submit', () => {
    event.preventDefault();
    logger.info('clicked submit button, delete all data');

    document.getElementById('hidden').innerHTML = "";

    let mp = document.getElementById('m_password').value;

    if (mp === master_pass){
        logger.warn('correct master password. delete all data button enabled');
        document.getElementById('m_password').value = ""
        document.getElementById('delete_data').disabled = false;
    }else {
        logger.warn('Wrong master password. trying to delete all data');
        document.getElementById('hidden').innerHTML = "Wrong Master Password. Please contact administrator";
        document.getElementById('hidden').style.display = "block";
        document.getElementById('m_password').value = ""
    }

}, false);

const back = document.getElementById('back').addEventListener('click', () => {
    event.preventDefault();
    logger.info("back button pressed from delete all data, going to dash!");
    ipc.send('back-to-dash');
})

// delete all data
const delete_button = document.getElementById('delete_data').addEventListener('click', () => {
    logger.warn('deleting all logged data');

    let query = `TRUNCATE table temperature_readings`;
    connection.query(query, (err, result, fields) => {
        if(err) {
            logger.error(err, 'error deleting all data');
            document.getElementById('hidden_info').innerHTML = "error in deleting data, contact administrator";
            document.getElementById('hidden_info').style.display = "block";
        }else {
            logger.warn('all data deleted', result, fields);
            document.getElementById('hidden_info').innerHTML = "All Recorded data deleted successfully.";
            document.getElementById('hidden_info').style.display = "block";
        }
    })

});
