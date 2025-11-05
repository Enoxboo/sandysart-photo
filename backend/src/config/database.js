/**
 * @fileoverview SQLite database configuration and initialization
 * @requires better-sqlite3
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database configuration
const dbPath = path.join(__dirname, '../../photos.db');
const db = new Database(dbPath, {verbose: console.log});

// Schema initialization
db.exec(`
    CREATE TABLE IF NOT EXISTS photos
    (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        filename      TEXT NOT NULL,
        original_name TEXT NOT NULL,
        title         TEXT,
        description   TEXT,
        tags          TEXT,
        is_week_photo BOOLEAN  DEFAULT 0,
        upload_date   DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_is_week_photo ON photos(is_week_photo);
  CREATE INDEX IF NOT EXISTS idx_upload_date ON photos(upload_date);
`);

console.log('✅ Database initialized successfully');

module.exports = db;
