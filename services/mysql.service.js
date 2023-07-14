/**
 * Connect Mysql
 */

const CONFIG = require('../config/config');
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: CONFIG.db_host,
    user: CONFIG.db_user,
    password: CONFIG.db_password,
    database: CONFIG.db_name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;

// const mysql = require('mysql')
// const config = require("config");
// let connection = mysql.createConnection({
//     host:config.mysql.host,
//     user: config.mysql.user,
//     password: config.mysql.password,
//     database: config.mysql.database,
// });
// connection.connect();
//
// module.exports = connection;