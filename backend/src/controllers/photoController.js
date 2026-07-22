const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {AppError} = require('../middleware/errorHandler');

/**
 * Wrapper pour gérer les erreurs async
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Retrieve photos, paginated via ?page=&limit= query params.
 * Defaults to page 1 / 24 per page; limit is capped at 1000 (callers that
 * need the full set, like the admin dashboard, pass a high explicit limit
 * instead of the API special-casing an "unlimited" mode).
 */
exports.getAllPhotos = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit, 10) || 24));
    const offset = (page - 1) * limit;

    const {count: total} = db.prepare('SELECT COUNT(*) as count FROM photos').get();
    const photos = db.prepare('SELECT * FROM photos ORDER BY upload_date DESC LIMIT ? OFFSET ?').all(limit, offset);

    res.json({
        photos,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        },
    });
});

/**
 * Retrieve a single photo by ID
 */
exports.getPhotoById = asyncHandler(async (req, res) => {
    const {id} = req.params;

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
    const {tag} = req.params;

    if (!tag || tag.trim() === '') {
        throw new AppError('Tag invalide', 400, 'INVALID_TAG');
    }

    const photos = db.prepare('SELECT * FROM photos WHERE tags LIKE ?').all(`%${tag}%`);
    res.json(photos);
});

/**
 * Upload multiple simplifié (sans titre/description)
 */
exports.uploadMultiplePhotos = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw new AppError('Aucun fichier uploadé', 400, 'NO_FILE');
    }

    const {tags} = req.body;
    const results = { success: [], failed: [] };

    const uploadsDir = path.join(__dirname, '../../uploads');

    const stmt = db.prepare(`
        INSERT INTO photos (filename, original_name, tags)
        VALUES (?, ?, ?)
    `);

    for (const file of req.files) {
        try {
            // Le fichier est déjà dans uploads/temp/ grâce à multer
            const tempPath = file.path;
            const finalFilename = file.filename;
            const finalPath = path.join(uploadsDir, finalFilename);

            // Optimiser l'image avec un nom temporaire différent
            const optimizedTempPath = tempPath + '.optimized';

            await sharp(tempPath)
                .resize(1920, null, { withoutEnlargement: true, fit: 'inside' })
                .jpeg({quality: 85})
                .toFile(optimizedTempPath);

            // Déplacer l'image optimisée vers uploads/
            fs.renameSync(optimizedTempPath, finalPath);

            // Supprimer l'original du dossier temp/. Non bloquant : sur
            // certains systèmes de fichiers (Windows notamment), le handle
            // de lecture de sharp peut se libérer avec un léger délai après
            // la résolution de toFile(), causant un EBUSY transitoire. Le
            // fichier final est déjà en place, donc on ne fait pas échouer
            // l'upload pour un résidu temporaire non supprimé.
            try {
                fs.unlinkSync(tempPath);
            } catch (unlinkErr) {
                console.warn('⚠️  Impossible de supprimer le fichier temp original:', unlinkErr.message);
            }

            // Corriger les permissions
            fs.chmodSync(finalPath, 0o664);

            // Tenter de changer le groupe (peut échouer sans sudo)
            if (process.platform !== 'win32') {
                try {
                    const uid = process.getuid();
                    const gid = process.getgid();
                    fs.chownSync(finalPath, uid, gid);
                } catch (chownErr) {
                    console.warn('⚠️  Impossible de changer le groupe:', chownErr.message);
                }
            }

            const result = stmt.run(finalFilename, file.originalname, tags || null);

            results.success.push({
                id: result.lastInsertRowid,
                filename: finalFilename,
                originalName: file.originalname
            });

        } catch (error) {
            console.error(`❌ Erreur upload ${file.originalname}:`, error);

            // Nettoyer les fichiers temporaires
            if (fs.existsSync(file.path)) {
                try {
                    fs.unlinkSync(file.path);
                } catch (unlinkErr) {
                    console.error('⚠️  Impossible de supprimer le fichier temp:', unlinkErr.message);
                }
            }

            results.failed.push({
                filename: file.originalname,
                error: error.message || 'Erreur inconnue',
                code: error.code || 'PROCESSING_ERROR'
            });
        }
    }

    const statusCode = results.failed.length === 0 ? 201 :
        results.success.length === 0 ? 500 : 207;

    res.status(statusCode).json({
        message: `${results.success.length} photo(s) uploadée(s), ${results.failed.length} échec(s)`,
        total: req.files.length,
        success: results.success,
        failed: results.failed
    });
});


/**
 * Create a new photo entry (ANCIENNE FONCTION - garder pour compatibilité)
 */
exports.createPhoto = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError('Aucun fichier uploadé', 400, 'NO_FILE');
    }

    const {title, description, tags} = req.body;
    const originalFilename = req.file.filename;
    const originalPath = req.file.path;
    const optimizedPath = path.join(__dirname, '../../uploads', originalFilename);

    try {
        await sharp(originalPath)
            .resize(1920, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .jpeg({quality: 85})
            .toFile(optimizedPath);

        // Non bloquant — voir le commentaire équivalent dans uploadMultiplePhotos
        try {
            fs.unlinkSync(originalPath);
        } catch (unlinkErr) {
            console.warn('⚠️  Impossible de supprimer le fichier temp original:', unlinkErr.message);
        }

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
            message: 'Photo uploadée et optimisée avec succès',
            id: result.lastInsertRowid,
            filename: originalFilename
        });
    } catch (sharpError) {
        console.error('❌ Erreur optimisation image:', sharpError);

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
    const {id} = req.params;

    if (!id || isNaN(id)) {
        throw new AppError('ID invalide', 400, 'INVALID_ID');
    }

    const {title, description, tags, is_week_photo, is_hero_photo} = req.body;

    const stmt = db.prepare(`
        UPDATE photos
        SET title         = ?,
            description   = ?,
            tags          = ?,
            is_week_photo = ?,
            is_hero_photo = ?
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
    const {id} = req.params;

    if (!id || isNaN(id)) {
        throw new AppError('ID invalide', 400, 'INVALID_ID');
    }

    const photo = db.prepare('SELECT filename FROM photos WHERE id = ?').get(id);

    if (!photo) {
        throw new AppError('Photo non trouvée', 404, 'PHOTO_NOT_FOUND');
    }

    const filePath = path.join(__dirname, '../../uploads', photo.filename);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (fsError) {
            console.error('⚠️  Erreur suppression fichier:', fsError);
        }
    }

    db.prepare('DELETE FROM photos WHERE id = ?').run(id);

    res.json({
        message: 'Photo supprimée avec succès',
        id: parseInt(id)
    });
});