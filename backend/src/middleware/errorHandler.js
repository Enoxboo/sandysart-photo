/**
 * @fileoverview Global error handling middleware
 */

/**
 * Middleware de gestion centralisée des erreurs
 */
exports.errorHandler = (err, req, res, next) => {
    // Log l'erreur complète dans la console
    console.error('❌ Error occurred:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString()
    });

    // Erreurs opérationnelles vs erreurs de programmation
    const isOperationalError = err.isOperational || false;

    // Erreurs spécifiques
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token invalide',
            code: 'INVALID_TOKEN'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Session expirée, veuillez vous reconnecter',
            code: 'TOKEN_EXPIRED'
        });
    }

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Le fichier est trop volumineux (max 10MB)',
                code: 'FILE_TOO_LARGE'
            });
        }
        return res.status(400).json({
            error: 'Erreur lors de l\'upload du fichier',
            code: 'UPLOAD_ERROR'
        });
    }

    // Erreur base de données
    if (err.code && err.code.startsWith('SQLITE')) {
        return res.status(500).json({
            error: 'Erreur de base de données',
            code: 'DATABASE_ERROR'
        });
    }

    // Erreur par défaut
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Une erreur est survenue';

    res.status(statusCode).json({
        error: message,
        code: err.code || 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err
        })
    });
};

/**
 * Gestionnaire pour les routes non trouvées
 */
exports.notFound = (req, res) => {
    res.status(404).json({
        error: 'Route non trouvée',
        code: 'NOT_FOUND',
        path: req.path
    });
};

/**
 * Classe d'erreur personnalisée
 */
class AppError extends Error {
    constructor(message, statusCode, code = 'APP_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

exports.AppError = AppError;