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
const photoController = require('../controllers/photoController');
const {verifyToken} = require('../middleware/auth');
const fs = require('fs');


// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
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
        cb(new Error('Only image files are allowed!'));
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 20 * 1024 * 1024}
});

const fixFilePermissions = (req, res, next) => {
    if (req.file) {
        try {
            // Juste changer les permissions pour que www-data puisse lire
            fs.chmodSync(req.file.path, 0o664);  // ← 664 = lecture pour le groupe
            console.log(`✅ Permissions corrigées: ${req.file.filename}`);
        } catch (error) {
            console.error('❌ Erreur permissions:', error.message);
        }
    }
    next();
};

// Public routes
router.get('/', photoController.getAllPhotos);
router.get('/week', photoController.getWeekPhotos);
router.get('/hero', photoController.getHeroPhotos);
router.get('/tag/:tag', photoController.getPhotosByTag);
router.get('/:id', photoController.getPhotoById);

// Protected routes (authentication required)
router.post('/', verifyToken, upload.single('photo'), fixFilePermissions, photoController.createPhoto);
router.put('/:id', verifyToken, photoController.updatePhoto);
router.delete('/:id', verifyToken, photoController.deletePhoto);

module.exports = router;
