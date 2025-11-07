require('dotenv').config();

const db = require('./src/config/database');
const express = require('express');
const cors = require('cors');
const path = require('path');

// Middleware d'erreurs
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Routes
const photosRoutes = require('./src/routes/photos');
const authRoutes = require('./src/routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend Sandy\'s Art Photography is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/photos', photosRoutes);
app.use('/api/auth', authRoutes);

// Gestion des routes non trouvées (IMPORTANT: après toutes les routes)
app.use(notFound);

// Middleware de gestion d'erreurs (IMPORTANT: en dernier)
app.use(errorHandler);

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📸 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});