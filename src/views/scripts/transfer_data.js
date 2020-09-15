const electron = require('electron');
const pool = require('../../../connections/db');
const Promise = require('bluebird');
const logger = require('../../../log');
const params_table = require('../../../config').params_table;
const connection = require('../../../connections/db2');
const transferToUsb = require('../../../handlers/transferToUSB');

const ipc = electron.ipcRenderer;

const ISTOffset = 330;
const ONEHROFFSET = 3600000;

logger.info('loaded transfer data');

// ascii form
let select_ascii = document.getElementById('select_ascii');
let start_time_ascii = document.getElementById('start-time_ascii');
let end_time_ascii = document.getElementById('end-time_ascii');

// csv form
let select_csv = document.getElementById('select_csv');
let start_time_csv = document.getElementById('start-time_csv');
let end_time_csv = document.getElementById('end-time_csv');

//transfer form
let pd_name = document.getElementById('pd_name');
let transfer_button = document.getElementById('transfer');

let asciiform = document.getElementById('asciiform').addEventListener('submit', () => {
    event.preventDefault();
    logger.info('clicked submit button of ascii form, fetching data');

    //enable transfer button
    transfer_button.disabled = false;

    selected_item = select_ascii.value;
    start = start_time_ascii.value;
    end = end_time_ascii.value;

    logger.info(selected_item, start, end, "logging variables");

    // converting epoch times
    let start_parts = start.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
    start_date = Date.UTC(+start_parts[3], start_parts[2]-1, +start_parts[1], +start_parts[4], +start_parts[5]);
    start_date = start_date + (ISTOffset)*60000 + ONEHROFFSET;
    let end_parts = end.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
    end_date = Date.UTC(+end_parts[3], end_parts[2]-1, +end_parts[1], +end_parts[4], +end_parts[5]);
    end_date = end_date + (ISTOffset)*60000 + ONEHROFFSET;

    // convert times from millisecs to only secs
    start_date /= 1000
    end_date /= 1000

    logger.info(start_date, end_date, "epoch times");

    if (selected_item === 'Maximum Speed') {
        let fileName = 'max_speed.txt'
        let dataToBeWritten = ""
        displayMaxSpeed(start_date, end_date, dataToBeWritten, fileName);
    } else if (selected_item === 'Over Speed') {
        let fileName = 'over_speed.txt'
        let dataToBeWritten = ""
        displayOverSpeed(start_date, end_date, dataToBeWritten, fileName);
    } else {
        let fileName = 'all_data.txt'
        let dataToBeWritten = ""
        displayAllLoggedData(start_date, end_date, dataToBeWritten, fileName);
    }

}, false);

let csvform = document.getElementById('csvform').addEventListener('submit', () => {
    event.preventDefault();
    logger.info('clicked submit button of csv form, fetching data');

    //enable transfer button
    transfer_button.disabled = false;

    selected_item = select_csv.value;
    start = start_time_csv.value;
    end = end_time_csv.value;

    logger.info(selected_item, start, end, "logging variables");

    // converting epoch times
    let start_parts = start.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
    start_date = Date.UTC(+start_parts[3], start_parts[2]-1, +start_parts[1], +start_parts[4], +start_parts[5]);
    start_date = start_date + (ISTOffset)*60000 + ONEHROFFSET;
    let end_parts = end.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
    end_date = Date.UTC(+end_parts[3], end_parts[2]-1, +end_parts[1], +end_parts[4], +end_parts[5]);
    end_date = end_date + (ISTOffset)*60000 + ONEHROFFSET;

    // convert times from millisecs to only secs
    start_date /= 1000
    end_date /= 1000

    logger.info(start_date, end_date, "epoch times");

    if (selected_item === 'Maximum Speed') {
        let fileName = 'max_speed.csv'
        let dataToBeWritten = ""
        displayMaxSpeed(start_date, end_date, dataToBeWritten, fileName);
    } else if (selected_item === 'Over Speed') {
        let fileName = 'over_speed.csv'
        let dataToBeWritten = ""
        displayOverSpeed(start_date, end_date, dataToBeWritten, fileName);
    } else {
        let fileName = 'all_data.csv'
        let dataToBeWritten = ""
        displayAllLoggedData(start_date, end_date, dataToBeWritten, fileName);
    }

}, false);

const displayMaxSpeed = (start, end, dataToBeWritten, fileName) => {
    logger.info("display maxspeed");

    let query = 'SELECT * FROM params'
    connection.query(query,
      function(err, results, fields) {
        logger.info(results, "logging query 1"); // results contains rows returned by server

        let RRRR = results[0].railway;
        let DDDD = results[0].division;
        let SSSS1 = results[0].from_st;
        let SSSS2 = results[0].to_st;
        let KKKK = results[0].kilometer_post;
        let LLLLL = results[0].line_name;
        let SSS = results[0].speed_limit;
        let TP1 = results[0].from_tp;
        let TP2 = results[0].to_tp;

        if (RRRR.length == 3)
            RRRR = ' ' + RRRR;
        else if (RRRR.length == 2)
            RRRR = '  ' + RRRR;
        else if (RRRR.length == 1)
            RRRR = '   ' + RRRR;

        if (DDDD.length == 3)
            DDDD = ' ' + DDDD;
        else if (DDDD.length == 2)
            DDDD = '  ' + DDDD;
        else if (DDDD.length == 1)
            DDDD = '   ' + DDDD;

        if (SSSS1.length == 3)
            SSSS1 = ' ' + SSSS1;
        else if (SSSS1.length == 2)
            SSSS1 = '  ' + SSSS1;
        else if (SSSS1.length == 1)
            SSSS1 = '   ' + SSSS1;

        if (SSSS2.length == 3)
            SSSS2 = ' ' + SSSS2;
        else if (SSSS2.length == 2)
            SSSS2 = '  ' + SSSS2;
        else if (SSSS2.length == 1)
            SSSS2 = '   ' + SSSS2;

        if (LLLLL.length == 4)
            LLLLL = ' ' + LLLLL;
        else if (LLLLL.length == 3)
            LLLLL = '  ' + LLLLL;
        else if (LLLLL.length == 2)
            LLLLL = '   ' + LLLLL;
        else if (LLLLL.length == 1)
            LLLLL = '    ' + LLLLL;

        if (KKKK < 1000 && KKKK > 99)
            KKKK = `0${KKKK}`;
        else if (KKKK < 100 && KKKK > 9)
            KKKK = `00${KKKK}`;
        else if (KKKK < 10)
            KKKK = `000${KKKK}`;
        else
            KKKK = `${KKKK}`;

        if (TP1 < 100 && TP1 > 9)
            TP1 = `${TP1}`;
        else if (TP1 < 10)
            TP1 = `0${TP1}`;

        if (TP2 < 100 && TP2 > 9)
            TP2 = `${TP2}`;
        else if (TP2 < 10)
            TP2 = `0${TP2}`;

        if (SSS < 100 && SSS > 9)
            SSS = `0${SSS}`;
        else if (SSS < 10)
            SSS = `00${SSS}`;
        else
            SSS = `${SSS}`;

        // writing in text area
        dataToBeWritten = dataToBeWritten + `1,${RRRR},${DDDD},${SSSS1}-${SSSS2}\n`;
        dataToBeWritten = dataToBeWritten + `2,${KKKK},${TP1},${TP2},${LLLLL}\n`;

        // quering ctsl table
        query = `select t1 as time, speed as maxspeed, stream as stream from ctsl WHERE speed = (select max(speed) from ctsl where t1 > ${start} and t1 < ${end}) and t1 > ${start} and t1 < ${end}`;
        connection.query(query,
            function(err, results, fields) {
                logger.info(results, 'logging 2nd query, maxspeed');
                for (i=0; i<results.length; i++) {
                    let MMM = Math.round(results[i].maxspeed);
                    let time = results[i].time;
                    let st = results[i].stream;

                    if (MMM < 100 && MMM > 9)
                        MMM = `0${MMM}`;
                    else if (MMM < 10)
                        MMM = `00${MMM}`;
                    else
                        MMM = `${MMM}`;

                    if (st === 'upstream')
                        st = "UP"
                    else if(st === 'downstream')
                        st = "DN"

                    let t = new Date(0);
                    t.setUTCSeconds(time);
                    let DD = t.getDate();
                    let MM = t.getMonth();
                    let YYYY = t.getFullYear();
                    let HH = t.getHours();
                    let Min = t.getMinutes();
                    if (DD < 10){
                        DD = `0${DD}`;
                    } else {
                        DD = `${DD}`;
                    }
                    if (MM < 10){
                        MM = `0${MM}`;
                    } else {
                        MM = `${MM}`;
                    }
                    if (HH < 10){
                        HH = `0${HH}`;
                    } else {
                        HH = `${HH}`;
                    }
                    if (Min < 10){
                        Min = `0${Min}`;
                    } else {
                        Min = `${Min}`;
                    }
                    let YY = YYYY.toString().slice(-2)
                    let flag = 1
                    if(SSS >= MMM)
                        flag = 0
                    else
                        flag = 1

                    // writing to a text area
                    dataToBeWritten = dataToBeWritten + `3,${DD}/${MM}/${YY},${HH}:${Min},${SSS},${MMM},${flag},${st}\n`;

                    transferToUsb.generate(dataToBeWritten, fileName);
                }
            })

      }
    );
}

const displayOverSpeed = (start, end, dataToBeWritten, fileName) => {
    logger.info("display overspeed");

    let query = 'SELECT * FROM params'
    connection.query(query,
      function(err, results, fields) {
        logger.info(results, "logging query 1"); // results contains rows returned by server

        let RRRR = results[0].railway;
        let DDDD = results[0].division;
        let SSSS1 = results[0].from_st;
        let SSSS2 = results[0].to_st;
        let KKKK = results[0].kilometer_post;
        let LLLLL = results[0].line_name;
        let SSS = results[0].speed_limit;
        let TP1 = results[0].from_tp;
        let TP2 = results[0].to_tp;

        if (RRRR.length == 3)
            RRRR = ' ' + RRRR;
        else if (RRRR.length == 2)
            RRRR = '  ' + RRRR;
        else if (RRRR.length == 1)
            RRRR = '   ' + RRRR;

        if (DDDD.length == 3)
            DDDD = ' ' + DDDD;
        else if (DDDD.length == 2)
            DDDD = '  ' + DDDD;
        else if (DDDD.length == 1)
            DDDD = '   ' + DDDD;

        if (SSSS1.length == 3)
            SSSS1 = ' ' + SSSS1;
        else if (SSSS1.length == 2)
            SSSS1 = '  ' + SSSS1;
        else if (SSSS1.length == 1)
            SSSS1 = '   ' + SSSS1;

        if (SSSS2.length == 3)
            SSSS2 = ' ' + SSSS2;
        else if (SSSS2.length == 2)
            SSSS2 = '  ' + SSSS2;
        else if (SSSS2.length == 1)
            SSSS2 = '   ' + SSSS2;

        if (LLLLL.length == 4)
            LLLLL = ' ' + LLLLL;
        else if (LLLLL.length == 3)
            LLLLL = '  ' + LLLLL;
        else if (LLLLL.length == 2)
            LLLLL = '   ' + LLLLL;
        else if (LLLLL.length == 1)
            LLLLL = '    ' + LLLLL;

        if (KKKK < 1000 && KKKK > 99)
            KKKK = `0${KKKK}`;
        else if (KKKK < 100 && KKKK > 9)
            KKKK = `00${KKKK}`;
        else if (KKKK < 10)
            KKKK = `000${KKKK}`;
        else
            KKKK = `${KKKK}`;

        if (TP1 < 100 && TP1 > 9)
            TP1 = `${TP1}`;
        else if (TP1 < 10)
            TP1 = `0${TP1}`;

        if (TP2 < 100 && TP2 > 9)
            TP2 = `${TP2}`;
        else if (TP2 < 10)
            TP2 = `0${TP2}`;

        if (SSS < 100 && SSS > 9)
            SSS = `0${SSS}`;
        else if (SSS < 10)
            SSS = `00${SSS}`;
        else
            SSS = `${SSS}`;

        // writing in text area
        dataToBeWritten = dataToBeWritten + `1,${RRRR},${DDDD},${SSSS1}-${SSSS2}\n`;
        dataToBeWritten = dataToBeWritten + `2,${KKKK},${TP1},${TP2},${LLLLL}\n`;

        // quering ctsl table for over speed data
        query = `select t1 as time, speed as maxspeed, stream as stream from ctsl WHERE speed > ${SSS} and t1 > ${start} and t1 < ${end}`;
        connection.query(query,
            function(err, results, fields) {
                logger.info(results, 'logging 2nd query, maxspeed');
                for (i=0; i<results.length; i++) {
                    let MMM = Math.round(results[i].maxspeed);
                    let time = results[i].time;
                    let st = results[i].stream;

                    if (MMM < 100 && MMM > 9)
                        MMM = `0${MMM}`;
                    else if (MMM < 10)
                        MMM = `00${MMM}`;
                    else
                        MMM = `${MMM}`;

                    if (st === 'upstream')
                        st = "UP"
                    else if(st === 'downstream')
                        st = "DN"

                    let t = new Date(0);
                    t.setUTCSeconds(time);
                    let DD = t.getDate();
                    let MM = t.getMonth();
                    let YYYY = t.getFullYear();
                    let HH = t.getHours();
                    let Min = t.getMinutes();
                    if (DD < 10){
                        DD = `0${DD}`;
                    } else {
                        DD = `${DD}`;
                    }
                    if (MM < 10){
                        MM = `0${MM}`;
                    } else {
                        MM = `${MM}`;
                    }
                    if (HH < 10){
                        HH = `0${HH}`;
                    } else {
                        HH = `${HH}`;
                    }
                    if (Min < 10){
                        Min = `0${Min}`;
                    } else {
                        Min = `${Min}`;
                    }
                    let YY = YYYY.toString().slice(-2)
                    let flag = 1
                    if(SSS >= MMM)
                        flag = 0
                    else
                        flag = 1

                    // writing to a text area
                    dataToBeWritten = dataToBeWritten + `3,${DD}/${MM}/${YY},${HH}:${Min},${SSS},${MMM},${flag},${st}\n`;
                    transferToUsb.generate(dataToBeWritten, fileName);
                }
            })

      }
    );
}

const displayAllLoggedData = (start, end, dataToBeWritten, fileName) => {
    logger.info("display all logged data");

    let query = 'SELECT * FROM params'
    connection.query(query,
      function(err, results, fields) {
        logger.info(results, "logging query 1"); // results contains rows returned by server

        let RRRR = results[0].railway;
        let DDDD = results[0].division;
        let SSSS1 = results[0].from_st;
        let SSSS2 = results[0].to_st;
        let KKKK = results[0].kilometer_post;
        let LLLLL = results[0].line_name;
        let SSS = results[0].speed_limit;
        let TP1 = results[0].from_tp;
        let TP2 = results[0].to_tp;

        if (RRRR.length == 3)
            RRRR = ' ' + RRRR;
        else if (RRRR.length == 2)
            RRRR = '  ' + RRRR;
        else if (RRRR.length == 1)
            RRRR = '   ' + RRRR;

        if (DDDD.length == 3)
            DDDD = ' ' + DDDD;
        else if (DDDD.length == 2)
            DDDD = '  ' + DDDD;
        else if (DDDD.length == 1)
            DDDD = '   ' + DDDD;

        if (SSSS1.length == 3)
            SSSS1 = ' ' + SSSS1;
        else if (SSSS1.length == 2)
            SSSS1 = '  ' + SSSS1;
        else if (SSSS1.length == 1)
            SSSS1 = '   ' + SSSS1;

        if (SSSS2.length == 3)
            SSSS2 = ' ' + SSSS2;
        else if (SSSS2.length == 2)
            SSSS2 = '  ' + SSSS2;
        else if (SSSS2.length == 1)
            SSSS2 = '   ' + SSSS2;

        if (LLLLL.length == 4)
            LLLLL = ' ' + LLLLL;
        else if (LLLLL.length == 3)
            LLLLL = '  ' + LLLLL;
        else if (LLLLL.length == 2)
            LLLLL = '   ' + LLLLL;
        else if (LLLLL.length == 1)
            LLLLL = '    ' + LLLLL;

        if (KKKK < 1000 && KKKK > 99)
            KKKK = `0${KKKK}`;
        else if (KKKK < 100 && KKKK > 9)
            KKKK = `00${KKKK}`;
        else if (KKKK < 10)
            KKKK = `000${KKKK}`;
        else
            KKKK = `${KKKK}`;

        if (TP1 < 100 && TP1 > 9)
            TP1 = `${TP1}`;
        else if (TP1 < 10)
            TP1 = `0${TP1}`;

        if (TP2 < 100 && TP2 > 9)
            TP2 = `${TP2}`;
        else if (TP2 < 10)
            TP2 = `0${TP2}`;

        if (SSS < 100 && SSS > 9)
            SSS = `0${SSS}`;
        else if (SSS < 10)
            SSS = `00${SSS}`;
        else
            SSS = `${SSS}`;

        // writing in text area
        dataToBeWritten = dataToBeWritten + `1,${RRRR},${DDDD},${SSSS1}-${SSSS2}\n`;
        dataToBeWritten = dataToBeWritten + `2,${KKKK},${TP1},${TP2},${LLLLL}\n`;

        // quering ctsl table for over speed data
        query = `select t1 as time, speed as maxspeed, stream as stream from ctsl WHERE t1 > ${start} and t1 < ${end}`;
        connection.query(query,
            function(err, results, fields) {
                logger.info(results, 'logging 2nd query, maxspeed');
                for (i=0; i<results.length; i++) {
                    let MMM = Math.round(results[i].maxspeed);
                    let time = results[i].time;
                    let st = results[i].stream;

                    if (MMM < 100 && MMM > 9)
                        MMM = `0${MMM}`;
                    else if (MMM < 10)
                        MMM = `00${MMM}`;
                    else
                        MMM = `${MMM}`;

                    if (st === 'upstream')
                        st = "UP"
                    else if(st === 'downstream')
                        st = "DN"

                    let t = new Date(0);
                    t.setUTCSeconds(time);
                    let DD = t.getDate();
                    let MM = t.getMonth();
                    let YYYY = t.getFullYear();
                    let HH = t.getHours();
                    let Min = t.getMinutes();
                    if (DD < 10){
                        DD = `0${DD}`;
                    } else {
                        DD = `${DD}`;
                    }
                    if (MM < 10){
                        MM = `0${MM}`;
                    } else {
                        MM = `${MM}`;
                    }
                    if (HH < 10){
                        HH = `0${HH}`;
                    } else {
                        HH = `${HH}`;
                    }
                    if (Min < 10){
                        Min = `0${Min}`;
                    } else {
                        Min = `${Min}`;
                    }
                    let YY = YYYY.toString().slice(-2)
                    let flag = 1
                    if(SSS >= MMM)
                        flag = 0
                    else
                        flag = 1

                    // writing to a text area
                    dataToBeWritten = dataToBeWritten + `3,${DD}/${MM}/${YY},${HH}:${Min},${SSS},${MMM},${flag},${st}\n`;
                    transferToUsb.generate(dataToBeWritten, fileName);
                }
            })

      }
    );
}

let hidden_div = document.getElementById('hidden');

let transferForm = document.getElementById('transferForm').addEventListener('submit', () => {
    event.preventDefault()
    let pd = pd_name.value;
    logger.warn(pd, 'name of the pen drive');

    hidden_div.innerHTML = "";

    transferToUsb.transfer(pd, (err, message) => {
        if (err){
            logger.error(err, 'error from transfer function in transfer data[transfer_data]');
            hidden_div.innerHTML = "ERROR!!! Check your pendrive and name you provided and try again.";
            hidden_div.style.display = "block";
        } else {
            logger.info(message, 'successfully transferred files to pd[transfer_data]');
            hidden_div.innerHTML = "Success transferred files to your pendrive";
            hidden_div.style.display = "block";
        }
    });

    logger.info('Writing files to pen drive :)');

})

const back = document.getElementById('back').addEventListener('click', () => {
    logger.info("back button pressed from display data, going to dash!");
    transferToUsb.deleteDirectory();
    ipc.send('back-to-dash');
})

const all_data_ascii = document.getElementById('create_all_ascii').addEventListener('click', () => {
    logger.info("all logged data");

    let fileName = 'all_logged_data.txt'
    let dataToBeWritten = ""

    let query = 'SELECT * FROM params'
    connection.query(query,
      function(err, results, fields) {
        logger.info(results, "logging query 1"); // results contains rows returned by server

        let RRRR = results[0].railway;
        let DDDD = results[0].division;
        let SSSS1 = results[0].from_st;
        let SSSS2 = results[0].to_st;
        let KKKK = results[0].kilometer_post;
        let LLLLL = results[0].line_name;
        let SSS = results[0].speed_limit;
        let TP1 = results[0].from_tp;
        let TP2 = results[0].to_tp;

        if (RRRR.length == 3)
            RRRR = ' ' + RRRR;
        else if (RRRR.length == 2)
            RRRR = '  ' + RRRR;
        else if (RRRR.length == 1)
            RRRR = '   ' + RRRR;

        if (DDDD.length == 3)
            DDDD = ' ' + DDDD;
        else if (DDDD.length == 2)
            DDDD = '  ' + DDDD;
        else if (DDDD.length == 1)
            DDDD = '   ' + DDDD;

        if (SSSS1.length == 3)
            SSSS1 = ' ' + SSSS1;
        else if (SSSS1.length == 2)
            SSSS1 = '  ' + SSSS1;
        else if (SSSS1.length == 1)
            SSSS1 = '   ' + SSSS1;

        if (SSSS2.length == 3)
            SSSS2 = ' ' + SSSS2;
        else if (SSSS2.length == 2)
            SSSS2 = '  ' + SSSS2;
        else if (SSSS2.length == 1)
            SSSS2 = '   ' + SSSS2;

        if (LLLLL.length == 4)
            LLLLL = ' ' + LLLLL;
        else if (LLLLL.length == 3)
            LLLLL = '  ' + LLLLL;
        else if (LLLLL.length == 2)
            LLLLL = '   ' + LLLLL;
        else if (LLLLL.length == 1)
            LLLLL = '    ' + LLLLL;

        if (KKKK < 1000 && KKKK > 99)
            KKKK = `0${KKKK}`;
        else if (KKKK < 100 && KKKK > 9)
            KKKK = `00${KKKK}`;
        else if (KKKK < 10)
            KKKK = `000${KKKK}`;
        else
            KKKK = `${KKKK}`;

        if (TP1 < 100 && TP1 > 9)
            TP1 = `${TP1}`;
        else if (TP1 < 10)
            TP1 = `0${TP1}`;

        if (TP2 < 100 && TP2 > 9)
            TP2 = `${TP2}`;
        else if (TP2 < 10)
            TP2 = `0${TP2}`;

        if (SSS < 100 && SSS > 9)
            SSS = `0${SSS}`;
        else if (SSS < 10)
            SSS = `00${SSS}`;
        else
            SSS = `${SSS}`;

        // writing in text area
        dataToBeWritten = dataToBeWritten + `1,${RRRR},${DDDD},${SSSS1}-${SSSS2}\n`;
        dataToBeWritten = dataToBeWritten + `2,${KKKK},${TP1},${TP2},${LLLLL}\n`;

        // quering ctsl table for over speed data
        query = `select t1 as time, speed as maxspeed, stream as stream from ctsl`;
        connection.query(query,
            function(err, results, fields) {
                logger.info(results, 'logging 2nd query, maxspeed');
                for (i=0; i<results.length; i++) {
                    let MMM = Math.round(results[i].maxspeed);
                    let time = results[i].time;
                    let st = results[i].stream;

                    if (MMM < 100 && MMM > 9)
                        MMM = `0${MMM}`;
                    else if (MMM < 10)
                        MMM = `00${MMM}`;
                    else
                        MMM = `${MMM}`;

                    if (st === 'upstream')
                        st = "UP"
                    else if(st === 'downstream')
                        st = "DN"

                    let t = new Date(0);
                    t.setUTCSeconds(time);
                    let DD = t.getDate();
                    let MM = t.getMonth();
                    let YYYY = t.getFullYear();
                    let HH = t.getHours();
                    let Min = t.getMinutes();
                    if (DD < 10){
                        DD = `0${DD}`;
                    } else {
                        DD = `${DD}`;
                    }
                    if (MM < 10){
                        MM = `0${MM}`;
                    } else {
                        MM = `${MM}`;
                    }
                    if (HH < 10){
                        HH = `0${HH}`;
                    } else {
                        HH = `${HH}`;
                    }
                    if (Min < 10){
                        Min = `0${Min}`;
                    } else {
                        Min = `${Min}`;
                    }
                    let YY = YYYY.toString().slice(-2)
                    let flag = 1
                    if(SSS >= MMM)
                        flag = 0
                    else
                        flag = 1

                    // writing to a text area
                    dataToBeWritten = dataToBeWritten + `3,${DD}/${MM}/${YY},${HH}:${Min},${SSS},${MMM},${flag},${st}\n`;
                    transferToUsb.generate(dataToBeWritten, fileName);
                }
            })
      }
    );
});


const all_data_csv = document.getElementById('create_all_csv').addEventListener('click', () => {
    logger.info("all logged data");

    let fileName = 'all_logged_data.csv'
    let dataToBeWritten = ""

    let query = 'SELECT * FROM params'
    connection.query(query,
      function(err, results, fields) {
        logger.info(results, "logging query 1"); // results contains rows returned by server

        let RRRR = results[0].railway;
        let DDDD = results[0].division;
        let SSSS1 = results[0].from_st;
        let SSSS2 = results[0].to_st;
        let KKKK = results[0].kilometer_post;
        let LLLLL = results[0].line_name;
        let SSS = results[0].speed_limit;
        let TP1 = results[0].from_tp;
        let TP2 = results[0].to_tp;

        if (RRRR.length == 3)
            RRRR = ' ' + RRRR;
        else if (RRRR.length == 2)
            RRRR = '  ' + RRRR;
        else if (RRRR.length == 1)
            RRRR = '   ' + RRRR;

        if (DDDD.length == 3)
            DDDD = ' ' + DDDD;
        else if (DDDD.length == 2)
            DDDD = '  ' + DDDD;
        else if (DDDD.length == 1)
            DDDD = '   ' + DDDD;

        if (SSSS1.length == 3)
            SSSS1 = ' ' + SSSS1;
        else if (SSSS1.length == 2)
            SSSS1 = '  ' + SSSS1;
        else if (SSSS1.length == 1)
            SSSS1 = '   ' + SSSS1;

        if (SSSS2.length == 3)
            SSSS2 = ' ' + SSSS2;
        else if (SSSS2.length == 2)
            SSSS2 = '  ' + SSSS2;
        else if (SSSS2.length == 1)
            SSSS2 = '   ' + SSSS2;

        if (LLLLL.length == 4)
            LLLLL = ' ' + LLLLL;
        else if (LLLLL.length == 3)
            LLLLL = '  ' + LLLLL;
        else if (LLLLL.length == 2)
            LLLLL = '   ' + LLLLL;
        else if (LLLLL.length == 1)
            LLLLL = '    ' + LLLLL;

        if (KKKK < 1000 && KKKK > 99)
            KKKK = `0${KKKK}`;
        else if (KKKK < 100 && KKKK > 9)
            KKKK = `00${KKKK}`;
        else if (KKKK < 10)
            KKKK = `000${KKKK}`;
        else
            KKKK = `${KKKK}`;

        if (TP1 < 100 && TP1 > 9)
            TP1 = `${TP1}`;
        else if (TP1 < 10)
            TP1 = `0${TP1}`;

        if (TP2 < 100 && TP2 > 9)
            TP2 = `${TP2}`;
        else if (TP2 < 10)
            TP2 = `0${TP2}`;

        if (SSS < 100 && SSS > 9)
            SSS = `0${SSS}`;
        else if (SSS < 10)
            SSS = `00${SSS}`;
        else
            SSS = `${SSS}`;

        // writing in text area
        dataToBeWritten = dataToBeWritten + `1,${RRRR},${DDDD},${SSSS1}-${SSSS2}\n`;
        dataToBeWritten = dataToBeWritten + `2,${KKKK},${TP1},${TP2},${LLLLL}\n`;

        // quering ctsl table for over speed data
        query = `select t1 as time, speed as maxspeed, stream as stream from ctsl`;
        connection.query(query,
            function(err, results, fields) {
                logger.info(results, 'logging 2nd query, maxspeed');
                for (i=0; i<results.length; i++) {
                    let MMM = Math.round(results[i].maxspeed);
                    let time = results[i].time;
                    let st = results[i].stream;

                    if (MMM < 100 && MMM > 9)
                        MMM = `0${MMM}`;
                    else if (MMM < 10)
                        MMM = `00${MMM}`;
                    else
                        MMM = `${MMM}`;

                    if (st === 'upstream')
                        st = "UP"
                    else if(st === 'downstream')
                        st = "DN"

                    let t = new Date(0);
                    t.setUTCSeconds(time);
                    let DD = t.getDate();
                    let MM = t.getMonth();
                    let YYYY = t.getFullYear();
                    let HH = t.getHours();
                    let Min = t.getMinutes();
                    if (DD < 10){
                        DD = `0${DD}`;
                    } else {
                        DD = `${DD}`;
                    }
                    if (MM < 10){
                        MM = `0${MM}`;
                    } else {
                        MM = `${MM}`;
                    }
                    if (HH < 10){
                        HH = `0${HH}`;
                    } else {
                        HH = `${HH}`;
                    }
                    if (Min < 10){
                        Min = `0${Min}`;
                    } else {
                        Min = `${Min}`;
                    }
                    let YY = YYYY.toString().slice(-2)
                    let flag = 1
                    if(SSS >= MMM)
                        flag = 0
                    else
                        flag = 1

                    // writing to a text area
                    dataToBeWritten = dataToBeWritten + `3,${DD}/${MM}/${YY},${HH}:${Min},${SSS},${MMM},${flag},${st}\n`;
                    transferToUsb.generate(dataToBeWritten, fileName);
                }
            })
      }
    );
});
