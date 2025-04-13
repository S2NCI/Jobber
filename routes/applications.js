const express = require('express');
const session = require('express-session');
const db = require('../db/db');
const logger = require('../logger/logger');
const router = express.Router();

// Add a new application
router.post('/add', async (req, res, next) => {
    console.log('Adding'); // Debug log
    const userId = req.session.user_id;
    if (!userId) {
        logger.logError('Unauthenticated attempt to add application');
        return next(new Error('User not logged in'));
    }

    const { company, listing_url, status } = req.body;
    const now = new Date().toISOString();

    db.run(
        `INSERT INTO applications (company, listing_url, status, user_id, created_at, applied_at, last_update)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [company, listing_url, status, userId, now, now, now],
        function (err) {
            if (err) {
                logger.logError('Failed to add new application', userId);
                return next(new Error('Error adding application'));
            }

            logger.logInfo('New application added', userId);

            // Redirect to the details page for the newly added application
            res.redirect(`/applications/${this.lastID}`);
        }
    );
});

// View the list of applications
router.get('/', async (req, res, next) => {
    const userId = req.session.user_id;
    const isAdmin = req.session.isAdmin;

    if (!userId) {
        logger.logError('Attempted access to /applications without login.');
        return next(new Error('User not logged in'));
    }

    db.get('SELECT admin FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            logger.logError('Error fetching user role', userId);
            return next(new Error('Database error.'));
        }

        if (!row) {
            logger.logError('User not found during application list retrieval', userId);
            return next(new Error('User not found'));
        }

        let query = 'SELECT * FROM applications WHERE user_id = ?';
        let params = [userId];

        if (isAdmin) {
            query = 'SELECT * FROM applications';
            params = [];
            logger.logInfo('Admin retrieved full application list', userId);
        } else {
            logger.logInfo('User retrieved personal application list', userId);
        }

        db.all(query, params, (err, rows) => {
            if (err) {
                logger.logError('Error retrieving application list', userId);
                return next(new Error('Database error.'));
            }
            res.render('applications', { applications: rows, isAdmin: isAdmin });
        });
    });
});

// View and modify details of a specific application
router.get('/:id', (req, res, next) => {
    const applicationId = req.params.id;
    const userId = req.session.user_id;

    const isAdmin = req.session.isAdmin;
    const query = isAdmin
        ? 'SELECT * FROM applications WHERE id = ?'
        : 'SELECT * FROM applications WHERE id = ? AND user_id = ?';
    const params = isAdmin ? [applicationId] : [applicationId, userId];

    db.get(query, params, (err, row) => {
            if (err) {
                logger.logError('Error fetching application', userId);
                return next(new Error('Database error.'));
            }

            if (!row) {
                logger.logError('Application not found or unauthorized access', userId);
                return next(new Error('Application not found.'));
            }

            logger.logInfo(`Viewed details for application ${applicationId}`, userId);
            res.render('details', { application: row });
        }
    );
});

// Update the details of a specific application
router.post('/:id', (req, res, next) => {
    const applicationId = req.params.id;
    const { company, listing_url, status } = req.body;
    const userId = req.session.user_id;

    db.run(
        `UPDATE applications SET company = ?, listing_url = ?, status = ?, last_update = ? WHERE id = ?`,
        [company, listing_url, status, new Date().toISOString(), applicationId],
        function (err) {
            if (err) {
                logger.logError('Failed to update application', userId);
                return next(new Error('Error updating application'));
            }

            logger.logInfo('Application updated', userId);
            res.redirect(`/applications/${applicationId}`);
        }
    );
});

// Delete a specified application
router.post('/:id/delete', (req, res, next) => {
    const appId = req.params.id;
    const userId = req.session.user_id;

    db.run(`DELETE FROM applications WHERE id = ?`, [appId], function (err) {
        if (err) {
            logger.logError('Error deleting application', userId);
            return next(new Error('Error deleting application'));
        }

        logger.logInfo(`Application ${appId} deleted`, userId);
        res.redirect('/applications');
    });
});

module.exports = router;