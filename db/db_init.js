
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// logger.js
const logger = require('../logger/logger');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.log('Error opening database: ' + err.message);
        return;
    }
    logger.logInfo('Connected to SQLite database.');
    initDatabase(); // Start the database initialization after connection is successful
});

// Initialize the database: drop tables and recreate them
function initDatabase() {
    db.serialize(() => {
        // Drop the logs table if it exists
        db.run('DROP TABLE IF EXISTS logs', [], (err) => {
            if (err) {
                logger.logError('Error dropping logs table: ' + err.message);
            } else {
                logger.logInfo('Logs table dropped successfully.');
            }
        });
        createTables();
    });
}

// Create all necessary tables
function createTables() {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR NOT NULL,
        failed_login_attempts INTEGER DEFAULT 0,
        admin BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
        );
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company VARCHAR(50),
        listing_url TEXT,
        status VARCHAR,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        applied_at TIMESTAMP,
        last_update TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type VARCHAR(50),
        message TEXT,
        user_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

        logger.logSystem('Tables Created.');
        insertTestData();
}

function insertTestData() {
    db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
        if (err) return logger.logError('Error checking users table: ' + err.message);

        // If no rows then populate
        if (row.count === 0) {
            const rawUsers = [
                { email: 'admin@example.com', password: 'admin123', admin: true },
                { email: 'user2@example.com', password: 'password1', admin: false },
                { email: 'user3@example.com', password: 'password2', admin: false },
                { email: 'user4@example.com', password: 'password3', admin: false },
            ];

            let usersInserted = 0;

            rawUsers.forEach(user => {
                bcrypt.hash(user.password, 10, (err, hash) => {
                    if (err) {
                        logger.logError('Error hashing password: ' + err.message);
                        return;
                    }

                    db.run(
                        'INSERT INTO users (email, password_hash, admin) VALUES (?, ?, ?)',
                        [user.email, hash, user.admin ? 1 : 0],
                        (err) => {
                            if (err) {
                                logger.logError(`Error inserting user ${user.email}: ` + err.message);
                            }

                            usersInserted++;
                            if (usersInserted === rawUsers.length) {
                                logger.logInfo('Test users inserted.');
                                insertApplications();
                            }
                        }
                    );
                });
            });
        } else {
            logger.logInfo('Users table already has data. Skipping user insert.');
            insertApplications();
        }
    });
}

function insertApplications() {
    db.get('SELECT COUNT(*) AS count FROM applications', (err, row) => {
        if (err) return logger.logError('Error checking applications table: ' + err.message);

        // If no rows then populate
        if (row.count === 0) {
            const applications = [
                { company: 'Tech Corp', listing_url: 'https://techcorp.com/jobs/1', status: 'Applied', user_id: 2 },
                { company: 'Innovate LLC', listing_url: 'https://innovate.com/jobs/2', status: 'Interview Scheduled', user_id: 2 },
                { company: 'Dev Solutions', listing_url: 'https://devsolutions.com/jobs/3', status: 'Rejected', user_id: 1 }
            ];

            const stmt = db.prepare('INSERT INTO applications (company, listing_url, status, user_id) VALUES (?, ?, ?, ?)');
            applications.forEach(app => {
                stmt.run(app.company, app.listing_url, app.status, app.user_id);
            });
            stmt.finalize(() => {
                logger.logInfo('Test applications inserted.');
            });
        } else {
            logger.logInfo('Applications table already has data. Skipping test insert.');
        }
    });
}