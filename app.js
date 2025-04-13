// app.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');

// Initialize Express
const app = express();
const PORT = 3000;

// Setup body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session handling (for login/logout)
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files like CSS, JS, images
app.use(express.static(path.join(__dirname, 'public')));

// Setup routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const applicationRoutes = require('./routes/applications');

// Route handlers
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/applications', applicationRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});