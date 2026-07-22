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

// Options du cookie JWT — httpOnly empêche tout accès en JS (protection XSS),
// secure exige HTTPS donc désactivé hors production pour permettre le dev local.
const tokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // aligné sur expiresIn: '24h' du JWT
};

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

        res.cookie('token', token, tokenCookieOptions);
        res.json({
            message: 'Login successful',
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

router.post('/logout', (req, res) => {
    res.clearCookie('token', tokenCookieOptions);
    res.json({ok: true});
});

module.exports = router;