const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token JWT
exports.verifyToken = (req, res, next) => {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Ajoute les infos de l'utilisateur à la requête
        next(); // Continue vers la route suivante
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// Fonction pour générer un token (utilisée lors du login)
exports.generateToken = (username) => {
    return jwt.sign(
        { username }, // Données à stocker dans le token
        process.env.JWT_SECRET, // Clé secrète
        { expiresIn: '24h' } // Le token expire après 24h
    );
};