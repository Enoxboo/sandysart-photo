const {defineConfig} = require('vitest/config');

module.exports = defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.test.js'],
        // Chaque fichier de test importe server.js -> database.js, qui lit
        // process.env une seule fois au chargement du module. Isoler les
        // fichiers dans des forks séparés évite qu'un test qui redéfinit
        // JWT_SECRET/DB_PATH n'affecte un autre fichier de test.
        pool: 'forks',
    },
});
