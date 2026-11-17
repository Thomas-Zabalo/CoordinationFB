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
// Le schéma utilise CREATE TABLE IF NOT EXISTS : sans effet si la base est déjà initialisée.
creerSchema(db);
const app = creerApp({ db, corsOrigin: config.corsOrigin });

app.listen(config.port, () => {
  console.log(`API CoordinationFB démarrée sur http://localhost:${config.port}`);
});
