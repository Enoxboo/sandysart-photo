/**
 * @fileoverview Main Express server entry point
 * @requires dotenv
 * @requires express
 * @requires cors
 */

require('dotenv').config();

// Database connection
const db = require('./src/config/database');

// Dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');

// Routes
const photosRoutes = require('./src/routes/photos');
const authRoutes = require('./src/routes/auth');

// App initialization
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Health check endpoint
 * @route GET /api/health
 * @returns {Object} Server status and timestamp
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend Sandy\'s Art Photographies is running!',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/photos', photosRoutes);
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📸 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📷 API: http://localhost:${PORT}/api/photos`);
});
