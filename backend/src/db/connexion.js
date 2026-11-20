import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { appliquerMigrations } from './migrations.js';

export function ouvrirBase(chemin) {
  if (chemin !== ':memory:') {
    mkdirSync(dirname(chemin), { recursive: true });
  }
  const db = new Database(chemin);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function creerSchema(db) {
  return appliquerMigrations(db);
}
