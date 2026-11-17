import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';

const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

export function ouvrirBase(chemin) {
  if (chemin !== ':memory:') {
    mkdirSync(dirname(chemin), { recursive: true });
  }
  const db = new Database(chemin);
  db.pragma('journal_mode = WAL');
  return db;
}

export function creerSchema(db) {
  db.exec(schema);
}
