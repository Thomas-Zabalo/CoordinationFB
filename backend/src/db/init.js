import { config } from '../config.js';
import { creerSchema, ouvrirBase } from './connexion.js';

const db = ouvrirBase(config.dbPath);
creerSchema(db);
db.close();

console.log(`Base de données initialisée : ${config.dbPath}`);
