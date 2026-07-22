require('dotenv').config();

const db = require('./src/config/database');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const {errorHandler, notFound} = require('./src/middleware/errorHandler');
const photosRoutes = require('./src/routes/photos');
const authRoutes = require('./src/routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Headers de sécurité HTTP. CSP désactivée : ce serveur ne sert que du
// JSON et les fichiers statiques d'uploads, pas de HTML applicatif.
// crossOriginResourcePolicy en "cross-origin" pour ne pas casser le
// chargement des photos du portfolio si elles sont embarquées ailleurs.
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: {policy: 'cross-origin'},
}));

// CORS — restreint au domaine de production + localhost en dev
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://sandysartphotographies.com', 'https://www.sandysartphotographies.com']
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: "Backend Sandy's Art Photography is running!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.use('/api/photos', photosRoutes);
app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📸 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});