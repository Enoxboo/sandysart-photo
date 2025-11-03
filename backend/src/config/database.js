const Database = require('better-sqlite3');
const path = require('path');

// Chemin vers le fichier de la base de données
const dbPath = path.join(__dirname, '../../photos.db');

// Création/connexion à la base de données
const db = new Database(dbPath, { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    title TEXT,
    description TEXT,
    tags TEXT,
    is_week_photo BOOLEAN DEFAULT 0,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('✅ Database initialized successfully');

module.exports = db;