const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Update to use database.sqlite
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database.');
    }
});

module.exports = db;