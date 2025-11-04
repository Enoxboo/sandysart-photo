const express = require('express');
const router = express.Router();
const { generateToken } = require('../middleware/auth');

// POST /api/auth/login - Connexion admin
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Vérifier les identifiants
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        // Générer le token
        const token = generateToken(username);

        res.json({
            message: 'Login successful',
            token: token,
            username: username
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// GET /api/auth/verify - Vérifier si le token est valide
router.get('/verify', require('../middleware/auth').verifyToken, (req, res) => {
    // Si on arrive ici, c'est que le token est valide (middleware passé)
    res.json({
        valid: true,
        username: req.user.username
    });
});

module.exports = router;