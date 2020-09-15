const electron = require('electron');
// const pool = require('../../../connections/db');
const connection = require('../../../connections/db2');
const Promise = require('bluebird');
const logger = require('../../../log');
const login_table = require('../../../config').login_table;

const ipc = electron.ipcRenderer;

logger.info('loaded splash');

setTimeout(() => {
    const query = `SELECT is_loggedin FROM ${login_table} where id = "1"`;
    logger.info(query);
    connection.query(query, (err, result, fields) => {
        logger.info({ err, result }, 'after query');
        if (err) {
            logger.info('Error in executing query', { err });
            ipc.send('back-to-login');
        } else {
            const isLoggedin = result[0].is_loggedin;
            if (isLoggedin) {
                logger.info('user already logged in');
                ipc.send('back-to-land');
            } else {
                logger.info('user not logged in');
                ipc.send('login-first');
            }
        }
    });
        // .then((res) => {
        //     logger.info({ res });

        // })
        // .catch((err) => {
        //     logger.error({ err }, 'error while feetching loggedin details from db, in splash.js');
        //     ipc.send('back-to-login');
        // });
}, 4000);
