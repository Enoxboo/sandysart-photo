/**
 * @fileoverview Script to generate bcrypt hash for admin password
 * @requires bcryptjs
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
    console.error('❌ Usage: node backend/scripts/hashPassword.js "VotreMotDePasse"');
    process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('❌ Error:', err);
        return;
    }

    console.log('✅ Hash généré :');
    console.log(hash);
    console.log('\nCopiez ce hash dans votre fichier .env :');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
});
