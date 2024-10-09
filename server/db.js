const dotenv = require('dotenv');
dotenv.config({ path: `../.env` });

const mysql = require('mysql2/promise');

const db_options = {
    host: process.env.DB_HOST,
	port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'BarterDB'
};

const db = mysql.createPool(db_options);

module.exports = {
    db,
    db_options
};