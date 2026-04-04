const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {generateToken, verifyToken} = require('../middleware/auth');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'},
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', loginLimiter, async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({error: 'Username and password are required'});
    }

    try {
        if (username !== process.env.ADMIN_USERNAME) {
            return res.status(401).json({error: 'Invalid credentials'});
        }

        const isValidPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

        if (!isValidPassword) {
            return res.status(401).json({error: 'Invalid credentials'});
        }

        const token = generateToken(username);

        res.json({
            message: 'Login successful',
            token: token,
            username: username
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.get('/verify', verifyToken, (req, res) => {
    res.json({
        valid: true,
        username: req.user.username
    });
});

module.exports = router;