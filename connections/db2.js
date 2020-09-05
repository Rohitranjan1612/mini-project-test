const config = require('../config');

// get the client
const mysql = require('mysql2');
 
// create the connection to database
const connection = mysql.createConnection({
  host: config.host,
  user: config.mysql_user,
  password: config.mysql_password,
  database: config.mysql_db
});

module.exports = connection;