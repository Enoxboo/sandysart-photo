/**
 * @fileoverview Authentication routes for admin login and token verification
 * @requires express
 * @requires ../middleware/auth
 */

const express = require('express');
const router = express.Router();
const {generateToken, verifyToken} = require('../middleware/auth');

/**
 * Admin login endpoint
 * @route POST /api/auth/login
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.username - Admin username
 * @param {string} req.body.password - Admin password
 * @returns {Object} JWT token and username on success
 */
router.post('/login', (req, res) => {
    const {username, password} = req.body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = generateToken(username);

        res.json({
            message: 'Login successful',
            token: token,
            username: username
        });
    } else {
        res.status(401).json({error: 'Invalid credentials'});
    }
});

/**
 * Token verification endpoint
 * @route GET /api/auth/verify
 * @middleware verifyToken - JWT validation required
 * @returns {Object} Validation status and username
 */
router.get('/verify', verifyToken, (req, res) => {
    res.json({
        valid: true,
        username: req.user.username
    });
});

module.exports = router;
