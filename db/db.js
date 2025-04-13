const sqlite3 = require('sqlite3').verbose();
const path = require('path');


const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.log('Failed to connect to SQLite database.');
    } else {
        var logger = require('../logger/logger');
        logger.logSystem('Connected to SQLite database');
    }
});

module.exports = db;