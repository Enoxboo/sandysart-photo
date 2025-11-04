/**
 * @fileoverview Authentication routes for admin login and token verification
 * @requires express
 * @requires ../middleware/auth
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const {generateToken, verifyToken} = require('../middleware/auth');

/**
 * Admin login endpoint with bcrypt password verification
 * @route POST /api/auth/login
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.username - Admin username
 * @param {string} req.body.password - Admin password (plain text)
 * @returns {Object} JWT token and username on success
 */
router.post('/login', async (req, res) => {
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
