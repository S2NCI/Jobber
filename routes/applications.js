onst express = require('express');
const session = require('express-session');
const router = express.Router();
const { db, logger } = require('../db/db');

// View the list of applications
router.get('/', async (req, res) => {
    const userId = req.session.user_id;

    if (!userId) {
        logger.logError('Attempted access to /applications without login.');
        return res.status(401).send('User not logged in');
    }

    db.get('SELECT admin FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            logger.logError('Error fetching user role', userId);
            return res.status(500).send('Database error.');
        }

        if (!row) {
            logger.logError('User not found during application list retrieval', userId);
            return res.status(404).send('User not found');
        }

        const isAdmin = row.admin;
        let query = 'SELECT * FROM applications WHERE user_id = ?';
        let params = [userId];

        if (isAdmin) {
            query = 'SELECT * FROM applications';
            params = [];
            logger.logSystem('Admin retrieved full application list', userId);
        } else {
            logger.logSystem('User retrieved personal application list', userId);
        }

        db.all(query, params, (err, rows) => {
            if (err) {
                logger.logError('Error retrieving application list', userId);
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

    db.get(
        'SELECT * FROM applications WHERE id = ? AND user_id = ?',
        [applicationId, userId],
        (err, row) => {
            if (err) {
                logger.logError('Error fetching application', userId);
                return res.status(500).send('Database error.');
            }

            if (!row) {
                logger.logError('Application not found or unauthorized access', userId);
                return res.status(404).send('Application not found.');
            }

            logger.logSystem('Viewed application details', userId);
            res.render('details', { application: row });
        }
    );
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
                logger.logError('Failed to update application', userId);
                return res.status(500).send('Error updating application');
            }

            logger.logInfo('Application updated', userId);
            res.redirect(`/applications/${applicationId}`);
        }
    );
});

// Add a new application
router.post('/add', async (req, res) => {
    const userId = req.session.user_id;
    if (!userId) {
        logger.logError('Unauthenticated attempt to add application');
        return res.status(401).send('User not logged in');
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
                return res.status(500).send('Error adding application');
            }

            logger.logInfo('New application added', userId);

            // Redirect to the details page for the newly added application
            res.redirect(`/applications/${this.lastID}`);
        }
    );
});

module.exports = router;