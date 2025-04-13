const express = require('express');
const session = require('express-session');
const router = express.Router();
const db = require('../db');  // Import the db connection

// View the list of applications
router.get('/', async (req, res) => {
    const userId = req.session.user_id;
    console.log('Current User ID:', userId); // Check if the user_id is set

    if (!userId) {
        return res.status(401).send('User not logged in');
    }

    // Check if the user is an admin
    db.get('SELECT admin FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error.');
        }

        if (!row) {
            return res.status(404).send('User not found');
        }

        const isAdmin = row.admin;

        let query = 'SELECT * FROM applications WHERE user_id = ?';
        let params = [userId];

        // If the user is an admin, fetch all applications
        if (isAdmin) {
            query = 'SELECT * FROM applications';  // Fetch all applications if admin
            params = [];  // No user_id filter
        }

        // Execute the query based on the user's role
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error.');
            }
            res.render('applications', { applications: rows, isAdmin: isAdmin });
        });
    });
});

// View and modify details of a specific application
router.get('/:id', (req, res) => {
    const applicationId = req.params.id;
    const userId = req.session.user_id;

    // Fetch the application details by ID
    db.get('SELECT * FROM applications WHERE id = ? AND user_id = ?', [applicationId, userId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error.');
        }

        if (!row) {
            return res.status(404).send('Application not found.');
        }

        res.render('details', { application: row });
    });
});

// Update the details of a specific application
router.post('/:id', (req, res) => {
    const applicationId = req.params.id;
    const { company, listing_url, status } = req.body;

    db.run(
        `UPDATE applications SET company = ?, listing_url = ?, status = ?, last_update = ? WHERE id = ?`,
        [company, listing_url, status, new Date().toISOString(), applicationId],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error updating application');
            }
            res.redirect(`/applications/${applicationId}`);
        }
    );
});

// Add a new application (this will be triggered by the "Add New Entry" button)
router.post('/add', async (req, res) => {
    const userId = req.session.user_id;
    if (!userId) {
        return res.status(401).send('User not logged in');
    }

    const { company, listing_url, status } = req.body;

    db.run(
        `INSERT INTO applications (company, listing_url, status, user_id, created_at, applied_at, last_update)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [company, listing_url, status, userId, new Date().toISOString(), new Date().toISOString(), new Date().toISOString()],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error adding application');
            }
            // Redirect to the details page for the newly added application
            res.redirect(`/applications/${this.lastID}`);
        }
    );
});


module.exports = router;