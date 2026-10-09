import { creerApp } from './app.js';
import { config } from './config.js';
import { ouvrirBase } from './db/connexion.js';

const db = ouvrirBase(config.dbPath);
const app = creerApp({ db, corsOrigin: config.corsOrigin });

app.listen(config.port, () => {
  console.log(`API CoordinationFB démarrée sur http://localhost:${config.port}`);
});
