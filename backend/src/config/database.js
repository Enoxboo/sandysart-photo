/**
 * @fileoverview SQLite database configuration and initialization
 * @requires better-sqlite3
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database configuration. DB_PATH lets tests point at an isolated
// (e.g. in-memory) database instead of the real photos.db on disk.
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../photos.db');
const db = new Database(dbPath, {verbose: process.env.NODE_ENV === 'test' ? undefined : console.log});

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
        is_hero_photo BOOLEAN  DEFAULT 0,
        upload_date   DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_is_week_photo ON photos(is_week_photo);
  CREATE INDEX IF NOT EXISTS idx_is_hero_photo ON photos(is_hero_photo);
  CREATE INDEX IF NOT EXISTS idx_upload_date ON photos(upload_date);
`);

// Migration légère : ajoute has_variants aux bases existantes créées avant
// l'introduction des images responsives (srcset). Indique si des fichiers
// <basename>-{400,800,1600}w.webp existent à côté de `filename` dans uploads/.
const photoColumns = db.prepare('PRAGMA table_info(photos)').all();
if (!photoColumns.some(col => col.name === 'has_variants')) {
    db.exec('ALTER TABLE photos ADD COLUMN has_variants BOOLEAN DEFAULT 0');
}

if (process.env.NODE_ENV !== 'test') {
    console.log('✅ Database initialized successfully');
}
module.exports = db;
