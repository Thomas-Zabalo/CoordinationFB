import { config } from '../config.js';
import { ouvrirBase } from './connexion.js';
import { appliquerMigrations } from './migrations.js';

const db = ouvrirBase(config.dbPath);
const appliquees = appliquerMigrations(db, { silencieux: false });
db.close();

console.log(`Base de données initialisée (${appliquees.length} migration(s) appliquée(s)) : ${config.dbPath}`);
