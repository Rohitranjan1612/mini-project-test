let config = require('../config');
let log = require('../log');

let mysqlHost = config.host;
let mysqlUser = config.mysql_user;
let mysqlPassword = config.mysql_password;
let mysqlDb = config.mysql_db;
let bluebird = require('bluebird');
// var Promise = require('bluebird');
let mysql = require('mysql2/promise');
let options = {
    connectionLimit: 20,
    host: mysqlHost,
    user: mysqlUser,
    password: mysqlPassword,
    database: mysqlDb,
    multipleStatements: true,
    Promise: bluebird
};

bluebird.longStackTraces();
let pool = mysql.createPool(options);

module.exports = pool;
