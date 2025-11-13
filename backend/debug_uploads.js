/**
 * Script de debug pour vérifier les uploads
 * À exécuter : node debug-uploads.js
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const uploadsDir = path.join(__dirname, 'uploads');
const dbPath = path.join(__dirname, 'photos.db');

console.log('🔍 DIAGNOSTIC DES UPLOADS\n');
console.log('================================\n');

// 1. Vérifier le dossier uploads
console.log('📁 Dossier uploads:', uploadsDir);
console.log('   Existe:', fs.existsSync(uploadsDir));

if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    console.log('   Nombre de fichiers:', files.length);

    if (files.length > 0) {
        console.log('\n📸 Derniers fichiers uploadés:');
        files.slice(-5).forEach(file => {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
            console.log(`   - ${file}`);
            console.log(`     Taille: ${(stats.size / 1024).toFixed(2)} KB`);
            console.log(`     Modifié: ${stats.mtime.toLocaleString()}`);
        });
    }
} else {
    console.log('   ❌ Le dossier uploads n\'existe pas!');
    console.log('   Création du dossier...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('   ✅ Dossier créé');
}

console.log('\n================================\n');

// 2. Vérifier la base de données
if (fs.existsSync(dbPath)) {
    console.log('💾 Base de données:', dbPath);
    const db = new Database(dbPath);

    const photos = db.prepare('SELECT * FROM photos ORDER BY upload_date DESC LIMIT 5').all();
    console.log('   Photos en BDD:', photos.length);

    if (photos.length > 0) {
        console.log('\n🖼️  Dernières photos en BDD:');
        photos.forEach(photo => {
            const filePath = path.join(uploadsDir, photo.filename);
            const exists = fs.existsSync(filePath);

            console.log(`\n   ID ${photo.id}: ${photo.filename}`);
            console.log(`   Titre: ${photo.title || 'Sans titre'}`);
            console.log(`   Fichier existe: ${exists ? '✅' : '❌'}`);

            if (!exists) {
                console.log(`   ⚠️  PROBLÈME: Le fichier n'existe pas sur le disque!`);
                console.log(`   Chemin attendu: ${filePath}`);
            }
        });
    }

    db.close();
} else {
    console.log('❌ Base de données introuvable:', dbPath);
}

console.log('\n================================\n');

// 3. Vérifier les permissions
try {
    const testFile = path.join(uploadsDir, 'test-write.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ Permissions en écriture: OK');
} catch (error) {
    console.log('❌ Permissions en écriture: ERREUR');
    console.log('   ', error.message);
}

console.log('\n================================\n');
console.log('🎯 Diagnostic terminé!\n');

// 4. Recommandations
console.log('💡 RECOMMANDATIONS:\n');

if (!fs.existsSync(uploadsDir)) {
    console.log('1. ❌ Créer le dossier uploads/');
} else {
    console.log('1. ✅ Dossier uploads/ existe');
}

console.log('2. Vérifier que votre serveur Express sert bien /uploads :');
console.log('   app.use(\'/uploads\', express.static(path.join(__dirname, \'uploads\')));');

console.log('\n3. Tester l\'accès aux fichiers:');
console.log('   curl http://localhost:5000/uploads/nom-du-fichier.jpg');

console.log('\n4. Si vous utilisez Docker, vérifier le volume:');
console.log('   docker-compose.yml doit avoir:');
console.log('   volumes:');
console.log('     - ./backend/uploads:/app/uploads');