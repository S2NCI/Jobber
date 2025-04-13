// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db');

// Initialize Express
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Set up session handling (for login/logout)
app.use(session({
    secret: 'secret_key',
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

// Route for the root (homepage)
app.get('/', (req, res) => {
    res.render('login', { error: null });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});