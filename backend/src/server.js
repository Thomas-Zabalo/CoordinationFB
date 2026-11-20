import { creerApp } from './app.js';
import { config } from './config.js';
import { ouvrirBase } from './db/connexion.js';
import { appliquerMigrations } from './db/migrations.js';

process.on('uncaughtException', (erreur) => {
  console.error('Erreur non interceptée (uncaughtException) :', erreur);
});

process.on('unhandledRejection', (raison) => {
  console.error('Promesse rejetée non gérée (unhandledRejection) :', raison);
});

const db = ouvrirBase(config.dbPath);
// Applique automatiquement les migrations Flyway au démarrage
appliquerMigrations(db);
const app = creerApp({
  db,
  corsOrigin: config.corsOrigin,
  sessionDureeMs: config.sessionDureeMs,
});

app.listen(config.port, () => {
  console.log(`API CoordinationFB démarrée sur http://localhost:${config.port}`);
  console.log(`Documentation Swagger disponible sur http://localhost:${config.port}/docs`);
});
