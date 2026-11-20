import { creerApp } from './app.js';
import { config } from './config.js';
import { creerSchema, ouvrirBase } from './db/connexion.js';

process.on('uncaughtException', (erreur) => {
  console.error('Erreur non interceptée (uncaughtException) :', erreur);
});

process.on('unhandledRejection', (raison) => {
  console.error('Promesse rejetée non gérée (unhandledRejection) :', raison);
});

const db = ouvrirBase(config.dbPath);
// Les migrations SQL sont idempotentes : sans effet si la base est déjà à jour.
creerSchema(db);
const app = creerApp({
  db,
  corsOrigin: config.corsOrigin,
  sessionDureeMs: config.sessionDureeMs,
});

app.listen(config.port, () => {
  console.log(`API CoordinationFB démarrée sur http://localhost:${config.port}`);
});
