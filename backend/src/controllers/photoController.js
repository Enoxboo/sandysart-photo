const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Récupérer toutes les photos
exports.getAllPhotos = (req, res) => {
    try {
        const photos = db.prepare('SELECT * FROM photos ORDER BY upload_date DESC').all();
        res.json(photos);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
};

// Récupérer une photo par ID
exports.getPhotoById = (req, res) => {
    try {
        const { id } = req.params;
        const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(id);

        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        res.json(photo);
    } catch (error) {
        console.error('Error fetching photo:', error);
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
};

// Récupérer les photos de la semaine
exports.getWeekPhotos = (req, res) => {
    try {
        const photos = db.prepare('SELECT * FROM photos WHERE is_week_photo = 1').all();
        res.json(photos);
    } catch (error) {
        console.error('Error fetching week photos:', error);
        res.status(500).json({ error: 'Failed to fetch week photos' });
    }
};

// Récupérer les photos par tag
exports.getPhotosByTag = (req, res) => {
    try {
        const { tag } = req.params;
        // Recherche les photos qui contiennent le tag (même si d'autres tags existent)
        const photos = db.prepare('SELECT * FROM photos WHERE tags LIKE ?').all(`%${tag}%`);
        res.json(photos);
    } catch (error) {
        console.error('Error fetching photos by tag:', error);
        res.status(500).json({ error: 'Failed to fetch photos by tag' });
    }
};

// Créer une nouvelle photo (upload)
exports.createPhoto = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, description, tags } = req.body;
        const filename = req.file.filename;
        const originalName = req.file.originalname;

        const stmt = db.prepare(`
      INSERT INTO photos (filename, original_name, title, description, tags)
      VALUES (?, ?, ?, ?, ?)
    `);

        const result = stmt.run(filename, originalName, title || null, description || null, tags || null);

        res.status(201).json({
            message: 'Photo uploaded successfully',
            id: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Error creating photo:', error);
        res.status(500).json({ error: 'Failed to create photo' });
    }
};

// Mettre à jour une photo
exports.updatePhoto = (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, tags, is_week_photo } = req.body;

        const stmt = db.prepare(`
      UPDATE photos 
      SET title = ?, description = ?, tags = ?, is_week_photo = ?
      WHERE id = ?
    `);

        const result = stmt.run(title, description, tags, is_week_photo, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        res.json({ message: 'Photo updated successfully' });
    } catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).json({ error: 'Failed to update photo' });
    }
};

// Supprimer une photo
exports.deletePhoto = (req, res) => {
    try {
        const { id } = req.params;

        // Récupérer le nom du fichier avant de supprimer
        const photo = db.prepare('SELECT filename FROM photos WHERE id = ?').get(id);

        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        // Supprimer le fichier physique
        const filePath = path.join(__dirname, '../../uploads', photo.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Supprimer l'entrée en BDD
        db.prepare('DELETE FROM photos WHERE id = ?').run(id);

        res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
};