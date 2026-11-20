import { config } from '../config.js';
import { ouvrirBase } from './connexion.js';
import { appliquerMigrations } from './migrations.js';

const db = ouvrirBase(config.dbPath);
const appliquees = appliquerMigrations(db);
db.close();

if (appliquees.length === 0) {
  console.log(`Base de données déjà à jour : ${config.dbPath}`);
} else {
  console.log(`Migrations appliquées (${appliquees.length}) : ${appliquees.join(', ')}`);
}
