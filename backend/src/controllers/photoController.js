const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { AppError } = require('../middleware/errorHandler');

/**
 * Wrapper pour gérer les erreurs async
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Retrieve all photos
 */
exports.getAllPhotos = asyncHandler(async (req, res) => {
    const photos = db.prepare('SELECT * FROM photos ORDER BY upload_date DESC').all();
    res.json(photos);
});

/**
 * Retrieve a single photo by ID
 */
exports.getPhotoById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        throw new AppError('ID invalide', 400, 'INVALID_ID');
    }

    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(id);

    if (!photo) {
        throw new AppError('Photo non trouvée', 404, 'PHOTO_NOT_FOUND');
    }

    res.json(photo);
});

/**
 * Retrieve photos marked as week photos
 */
exports.getWeekPhotos = asyncHandler(async (req, res) => {
    const photos = db.prepare('SELECT * FROM photos WHERE is_week_photo = 1').all();
    res.json(photos);
});

/**
 * Retrieve photos marked as hero photos
 */
exports.getHeroPhotos = asyncHandler(async (req, res) => {
    const photos = db.prepare('SELECT * FROM photos WHERE is_hero_photo = 1 ORDER BY upload_date DESC').all();
    res.json(photos);
});

/**
 * Retrieve photos filtered by tag
 */
exports.getPhotosByTag = asyncHandler(async (req, res) => {
    const { tag } = req.params;

    if (!tag || tag.trim() === '') {
        throw new AppError('Tag invalide', 400, 'INVALID_TAG');
    }

    const photos = db.prepare('SELECT * FROM photos WHERE tags LIKE ?').all(`%${tag}%`);
    res.json(photos);
});

/**
 * Create a new photo entry
 */
exports.createPhoto = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError('Aucun fichier uploadé', 400, 'NO_FILE');
    }

    const { title, description, tags } = req.body;
    const originalFilename = req.file.filename;
    const originalPath = req.file.path;

    // Nouveau nom pour la version optimisée
    const optimizedFilename = 'optimized-' + originalFilename;
    const optimizedPath = path.join(__dirname, '../../uploads', optimizedFilename);

    try {
        // Optimiser l'image
        await sharp(originalPath)
            .resize(1920, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .jpeg({ quality: 85 })
            .toFile(optimizedPath);

        // Supprimer l'original
        fs.unlinkSync(originalPath);

        const stmt = db.prepare(`
      INSERT INTO photos (filename, original_name, title, description, tags)
      VALUES (?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            optimizedFilename,
            req.file.originalname,
            title || null,
            description || null,
            tags || null
        );

        res.status(201).json({
            message: 'Photo uploadée et optimisée avec succès',
            id: result.lastInsertRowid,
            filename: optimizedFilename
        });
    } catch (sharpError) {
        console.error('❌ Erreur optimisation image:', sharpError);

        // Si l'optimisation échoue, utilise l'original
        const stmt = db.prepare(`
      INSERT INTO photos (filename, original_name, title, description, tags)
      VALUES (?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            originalFilename,
            req.file.originalname,
            title || null,
            description || null,
            tags || null
        );

        res.status(201).json({
            message: 'Photo uploadée (optimisation échouée, original utilisé)',
            id: result.lastInsertRowid,
            warning: 'Image non optimisée'
        });
    }
});

/**
 * Update existing photo metadata
 */
exports.updatePhoto = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        throw new AppError('ID invalide', 400, 'INVALID_ID');
    }

    const { title, description, tags, is_week_photo, is_hero_photo } = req.body;

    const stmt = db.prepare(`
    UPDATE photos
    SET title = ?, description = ?, tags = ?, is_week_photo = ?, is_hero_photo = ?
    WHERE id = ?
  `);

    const result = stmt.run(
        title || null,
        description || null,
        tags || null,
        is_week_photo || 0,
        is_hero_photo || 0,
        id
    );

    if (result.changes === 0) {
        throw new AppError('Photo non trouvée', 404, 'PHOTO_NOT_FOUND');
    }

    res.json({
        message: 'Photo mise à jour avec succès',
        id: parseInt(id)
    });
});

/**
 * Delete a photo and its associated file
 */
exports.deletePhoto = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        throw new AppError('ID invalide', 400, 'INVALID_ID');
    }

    const photo = db.prepare('SELECT filename FROM photos WHERE id = ?').get(id);

    if (!photo) {
        throw new AppError('Photo non trouvée', 404, 'PHOTO_NOT_FOUND');
    }

    // Supprimer le fichier physique
    const filePath = path.join(__dirname, '../../uploads', photo.filename);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (fsError) {
            console.error('⚠️  Erreur suppression fichier:', fsError);
            // Continue quand même la suppression en BDD
        }
    }

    // Supprimer l'entrée en BDD
    db.prepare('DELETE FROM photos WHERE id = ?').run(id);

    res.json({
        message: 'Photo supprimée avec succès',
        id: parseInt(id)
    });
});