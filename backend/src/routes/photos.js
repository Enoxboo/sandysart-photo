const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const photoController = require('../controllers/photoController');

// Configuration de Multer pour l'upload de fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Dossier où stocker les fichiers
    },
    filename: (req, file, cb) => {
        // Génère un nom unique : timestamp + nom original
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// Filtre pour n'accepter que les images
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

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Limite à 10MB
});

// ============ ROUTES PUBLIQUES ============

// GET /api/photos - Récupérer toutes les photos
router.get('/', photoController.getAllPhotos);

// GET /api/photos/week - Récupérer les photos de la semaine
router.get('/week', photoController.getWeekPhotos);

// GET /api/photos/tag/:tag - Récupérer les photos par tag
router.get('/tag/:tag', photoController.getPhotosByTag);

// GET /api/photos/:id - Récupérer une photo par ID
router.get('/:id', photoController.getPhotoById);

// ============ ROUTES ADMIN (à protéger plus tard) ============

// POST /api/photos - Upload une nouvelle photo
router.post('/', upload.single('photo'), photoController.createPhoto);

// PUT /api/photos/:id - Mettre à jour une photo
router.put('/:id', photoController.updatePhoto);

// DELETE /api/photos/:id - Supprimer une photo
router.delete('/:id', photoController.deletePhoto);

module.exports = router;