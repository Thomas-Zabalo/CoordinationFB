// Fichier de configuration PM2 pour le backend Node.js
// Compatible avec le CD GitHub Actions (ecosystem.config.cjs)
module.exports = {
  apps: [
    {
      name: 'coordinationfb-api',
      script: 'src/server.js',
      interpreter: 'node',

      // ---- Développement ----
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        DB_PATH: './data/vinyles-dev.db',
        CORS_ORIGIN: 'http://localhost:5173',
      },

      // ---- Test / Staging ----
      env_test: {
        NODE_ENV: 'test',
        PORT: 3001,
        DB_PATH: './data/vinyles-test.db',
        CORS_ORIGIN: 'http://localhost:4173',
      },

      // ---- Production ----
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_PATH: './data/vinyles.db',
        CORS_ORIGIN: 'https://votre-domaine.com', // ← à adapter
      },

      // Redémarre automatiquement en cas de crash
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
    },
  ],
};
