require('dotenv').config();
const db = require('./src/config/database');
const express = require('express');
const cors = require('cors');
const path = require('path');
const photosRoutes = require('./src/routes/photos');
const authRoutes = require('./src/routes/auth');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend Sandy\'s Art Photographies is running! 🎨',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/photos', photosRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📸 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});