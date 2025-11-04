/**
 * @fileoverview Photo controller handling CRUD operations
 * @requires ../config/database
 * @requires fs
 * @requires path
 */

const db = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * Retrieve all photos
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPhotos = (req, res) => {
    try {
        const photos = db.prepare('SELECT * FROM photos ORDER BY upload_date DESC').all();
        res.json(photos);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({error: 'Failed to fetch photos'});
    }
};

/**
 * Retrieve a single photo by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPhotoById = (req, res) => {
    try {
        const {id} = req.params;
        const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(id);

        if (!photo) {
            return res.status(404).json({error: 'Photo not found'});
        }

        res.json(photo);
    } catch (error) {
        console.error('Error fetching photo:', error);
        res.status(500).json({error: 'Failed to fetch photo'});
    }
};

/**
 * Retrieve photos marked as week photos
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getWeekPhotos = (req, res) => {
    try {
        const photos = db.prepare('SELECT * FROM photos WHERE is_week_photo = 1').all();
        res.json(photos);
    } catch (error) {
        console.error('Error fetching week photos:', error);
        res.status(500).json({error: 'Failed to fetch week photos'});
    }
};

/**
 * Retrieve photos filtered by tag
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPhotosByTag = (req, res) => {
    try {
        const {tag} = req.params;
        const photos = db.prepare('SELECT * FROM photos WHERE tags LIKE ?').all(`%${tag}%`);
        res.json(photos);
    } catch (error) {
        console.error('Error fetching photos by tag:', error);
        res.status(500).json({error: 'Failed to fetch photos by tag'});
    }
};

/**
 * Create a new photo entry
 * @param {Object} req - Express request object with file upload
 * @param {Object} res - Express response object
 */
exports.createPhoto = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({error: 'No file uploaded'});
        }

        const {title, description, tags} = req.body;
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
        res.status(500).json({error: 'Failed to create photo'});
    }
};

/**
 * Update existing photo metadata
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePhoto = (req, res) => {
    try {
        const {id} = req.params;
        const {title, description, tags, is_week_photo} = req.body;

        const stmt = db.prepare(`
            UPDATE photos
            SET title         = ?,
                description   = ?,
                tags          = ?,
                is_week_photo = ?
            WHERE id = ?
        `);

        const result = stmt.run(title, description, tags, is_week_photo, id);

        if (result.changes === 0) {
            return res.status(404).json({error: 'Photo not found'});
        }

        res.json({message: 'Photo updated successfully'});
    } catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).json({error: 'Failed to update photo'});
    }
};

/**
 * Delete a photo and its associated file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deletePhoto = (req, res) => {
    try {
        const {id} = req.params;

        const photo = db.prepare('SELECT filename FROM photos WHERE id = ?').get(id);

        if (!photo) {
            return res.status(404).json({error: 'Photo not found'});
        }

        const filePath = path.join(__dirname, '../../uploads', photo.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        db.prepare('DELETE FROM photos WHERE id = ?').run(id);

        res.json({message: 'Photo deleted successfully'});
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({error: 'Failed to delete photo'});
    }
};
