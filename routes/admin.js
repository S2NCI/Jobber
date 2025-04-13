const express = require('express');
const session = require('express-session');
const router = express.Router();
const db = require('../db/db');

// Prevent direct access to admin pages
function requireAdmin(req, res, next) {
    if (!req.session.user_id || !req.session.isAdmin) {
        return res.status(403).send('Forbidden');
    }
    next();
}

// Admin view for logs
router.get('/logs', requireAdmin, (req, res) => {
    db.all(
        `SELECT * FROM logs
         ORDER BY id ASC`,
        [],
        (err, logs) => {
            if (err) {
                console.error('Failed to retrieve logs:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.render('admin/logs', { logs });
        }
    );
});

// Admin view for users
router.get('/users', requireAdmin, (req, res) => {
    db.all(
        `SELECT id, email, admin, last_login FROM users ORDER BY id`,
        [],
        (err, users) => {
            if (err) {
                console.error('Failed to retrieve users:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.render('admin/users', { users });
        }
    );
});

// Admin delete user
router.post('/users/:id/delete', requireAdmin, (req, res) => {
    const userId = req.params.id;
    db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
        if (err) {
            console.error('Failed to delete user:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/admin/users');
    });
});

module.exports = router;