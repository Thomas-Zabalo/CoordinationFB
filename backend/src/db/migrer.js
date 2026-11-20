import { config } from '../config.js';
import { ouvrirBase } from './connexion.js';
import { appliquerMigrations, statutMigrations } from './migrations.js';

console.log(`[Flyway] Connexion à la base de données : ${config.dbPath}`);
const db = ouvrirBase(config.dbPath);

const appliquees = appliquerMigrations(db);
if (appliquees.length > 0) {
  console.log(`[Flyway] ${appliquees.length} nouvelle(s) migration(s) appliquée(s).`);
}

const historique = statutMigrations(db);
console.log('\n[Flyway] État des migrations :');
console.table(historique);

db.close();
