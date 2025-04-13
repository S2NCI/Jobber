const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('../db/db');
const logger = require('../logger/logger');
const router = express.Router();

// Login page
router.get('/', (req, res, next) => {
    res.render('login', { error: null });
});

// POST login/register
router.post('/', (req, res, next) => {
    const { email, password, action } = req.body;

    if (action === 'login') {
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                logger.logError(err, user_id);
                return next(new Error('Error Logging In'));
                return res.render('login', { error: 'Database error.' });
            }

            if (!user) {
                return res.render('login', { error: 'Invalid email or password.' });
            }

            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                return res.render('login', { error: 'Invalid email or password.' });
            }

            // Set session and redirect
            req.session.user_id = user.id;
            req.session.isAdmin = !!user.admin; // store admin flag in session

            // Update login time
            const now = new Date().toISOString();
            db.run(
                `UPDATE users SET last_login = ? WHERE id = ?`,
                [now, user.id],
                (err) => {
                    if (err) {
                        logger.logError('Failed to update last_login:', user.id);
                    }
                }
            );

            res.redirect('/applications');
        });

    } else if (action === 'register') {
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, existingUser) => {
            if (err) {
                logger.logError(err, user_id);
                return next(new Error('Error Logging In'));
                return res.render('login', { error: 'Database error.' });
            }

            if (existingUser) {
                return res.render('login', { error: 'User already exists.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const now = new Date().toISOString();

            // Insert the new user
            db.run(
                `INSERT INTO users (email, password_hash, failed_login_attempts, admin, created_at, last_login)
             VALUES (?, ?, 0, 0, ?, ?)`,
                [email, hashedPassword, now, now],
                function (err) {
                    if (err) {
                        logger.logError(err, user_id);
                        return next(new Error('Error Registering'));
                        return res.render('login', { error: 'Error creating account.' });
                    }

                    // Fetch the newly inserted user using `this.lastID` which is the id of the newly inserted user
                    const newUserId = this.lastID;  // `this` refers to the context of the `db.run` function

                    // Log them in
                    req.session.user_id = newUserId;  // Use newUserId instead of user.id
                    req.session.isAdmin = false;
                    res.redirect('/applications');
                }
            );
        });
    } else {
        res.render('login', { error: 'Unknown action.' });
    }
});

// GET logout page
router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            logger.logError('Error destroying session', req.session.userID);
            return next(new Error('Error logging out'));
        }
        res.redirect('/');  // Redirect to login page after
    });
});

module.exports = router;