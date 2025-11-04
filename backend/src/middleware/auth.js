/**
 * @fileoverview JWT authentication middleware
 * @requires jsonwebtoken
 */

const jwt = require('jsonwebtoken');

/**
 * Verify JWT token from request authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({error: 'Access denied. No token provided.'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({error: 'Invalid or expired token.'});
    }
};

/**
 * Generate JWT token for authenticated user
 * @param {string} username - Username to encode in token
 * @returns {string} Signed JWT token
 */
exports.generateToken = (username) => {
    return jwt.sign(
        {username},
        process.env.JWT_SECRET,
        {expiresIn: '24h'}
    );
};
