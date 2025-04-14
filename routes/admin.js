const express = require('express');
const session = require('express-session');
const router = express.Router();
const db = require('../db/db');

// Admin view for logs
router.get('/logs', (req, res) => {
    // Fetch log data from the database (for admin)
    res.render('admin/logs');
});

// Admin view for users
router.get('/users', (req, res) => {
    // Fetch list of users from the database
    res.render('admin/users');
});

module.exports = router;