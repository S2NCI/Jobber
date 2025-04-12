const express = require('express');
const session = require('express-session');
const router = express.Router();
const db = require('../db/db');

// Admin view for logs
router.get('/logs', requireAdmin, (req, res) => {

    // Fetch log data from the database (for admin)
    res.render('admin/logs');
});

// Admin view for users
router.get('/users', requireAdmin, (req, res) => {
    // Fetch list of users from the database
    res.render('admin/users');
});

// Prevent direct access to admin pages
function requireAdmin(req, res, next) {
    if (!req.session.user_id || !req.session.isAdmin) {
        return res.status(403).send('Forbidden');
    }
    next();
}

module.exports = router;