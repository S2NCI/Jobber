
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('Connected to SQLite database.');
});

db.serialize(() => {
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
      user_id INTEGER NOT NULL,
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

    console.log("Tables Created.");

    // Run the test data insertion
    insertTestData();
});

// Insert some test data if the tables are empty
function insertTestData() {
    db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
        if (err) return console.error('Error checking users table:', err);

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
                        console.error('Error hashing password:', err);
                        return;
                    }

                    db.run(
                        'INSERT INTO users (email, password_hash, admin) VALUES (?, ?, ?)',
                        [user.email, hash, user.admin ? 1 : 0],
                        (err) => {
                            if (err) {
                                console.error('Error inserting user:', err);
                            }

                            usersInserted++;
                            if (usersInserted === rawUsers.length) {
                                console.log('Test users inserted.');
                                insertApplications();
                            }
                        }
                    );
                });
            });
        } else {
            console.log('Users table already has data. Skipping user insert.');
            insertApplications();
        }
    });
}


function insertApplications() {
    db.get('SELECT COUNT(*) AS count FROM applications', (err, row) => {
        if (err) return console.error('Error checking applications table:', err);

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
                console.log('Test applications inserted.');
            });
        } else {
            console.log('Applications table already has data. Skipping test insert.');
        }
    });
};


//db.close();