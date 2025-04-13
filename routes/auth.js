const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// POST login/register
router.post('/', async (req, res) => {
    const { email, password, action } = req.body;

    if (action === 'login') {
        db.get(`SELECT * FROM users WHERE email = '${email}'`, (err, user) => {
            if (err) {
                console.error(err);
                return res.render('login', { error: 'Database error.' });
            }

            if (!user) {
                return res.render('login', { error: 'Invalid email or password.' });
            }

            bcrypt.compare(password, user.password_hash, (err, match) => {
                if (err || !match) {
                    return res.render('login', { error: 'Invalid email or password.' });
                }

                // Set session and redirect
                req.session.user_id = user.id;
                res.redirect('/applications');
            });
        });

    } else if (action === 'register') {
        db.get(`SELECT * FROM users WHERE email = '${email}'`, (err, existingUser) => {
            if (err) {
                console.error(err);
                return res.render('login', { error: 'Database error.' });
            }

            if (existingUser) {
                return res.render('login', { error: 'User already exists.' });
            }

            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error(err);
                    return res.render('login', { error: 'Error hashing password.' });
                }

                const now = new Date().toISOString();

                // Insert the new user
                db.run(
                    `INSERT INTO users (email, password_hash, failed_login_attempts, admin, created_at, last_login)
                     VALUES ('${email}', '${hashedPassword}', 0, 0, '${now}', '${now}')`,
                    function (err) {
                        if (err) {
                            console.error(err);
                            return res.render('login', { error: 'Error creating account.' });
                        }

                        // Fetch the newly inserted user using `this.lastID` which is the id of the newly inserted user
                        const newUserId = this.lastID;  // `this` refers to the context of the `db.run` function

                        // Log them in
                        req.session.user_id = newUserId;  // Use newUserId instead of user.id
                        res.redirect('/applications');
                    }
                );
            });
        });
    } else {
        res.render('login', { error: 'Unknown action.' });
    }
});

module.exports = router;