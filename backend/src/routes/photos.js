/**
 * @fileoverview Photo routes with multer file upload configuration
 * @requires express
 * @requires multer
 * @requires path
 * @requires ../controllers/photoController
 * @requires ../middleware/auth
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const photoController = require('../controllers/photoController');
const {verifyToken} = require('../middleware/auth');
const fs = require('fs');

// Limite générale : large marge pour la navigation publique (galerie, filtres
// par tag) et pour l'admin (upload de 20 photos en une seule requête, toggles,
// suppressions) sans gêner l'usage normal — vise surtout le scraping/abus.
const photosLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {error: 'Trop de requêtes. Réessayez dans quelques minutes.'},
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(photosLimiter);

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/temp/');
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, filename);
    }
});


// File type validation
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Seuls les fichiers image sont autorisés (jpg, png, gif, webp)'));
    }
};

// 🆕 Configuration pour UPLOAD MULTIPLE (max 20 photos à la fois)
const uploadMultiple = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024,  // 20MB par fichier
        files: 20  // Max 20 fichiers simultanés
    }
});

// Configuration pour upload simple (ancienne méthode)
const uploadSingle = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 20 * 1024 * 1024}
});

// Public routes
router.get('/', photoController.getAllPhotos);
router.get('/week', photoController.getWeekPhotos);
router.get('/hero', photoController.getHeroPhotos);
router.get('/tag/:tag', photoController.getPhotosByTag);
router.get('/:id', photoController.getPhotoById);

// Protected routes (authentication required)

router.post(
    '/upload-multiple',
    verifyToken,
    uploadMultiple.array('photos', 20),
    photoController.uploadMultiplePhotos
);

router.post('/', verifyToken, uploadSingle.single('photo'), photoController.createPhoto);

router.put('/:id', verifyToken, photoController.updatePhoto);
router.delete('/:id', verifyToken, photoController.deletePhoto);

module.exports = router;