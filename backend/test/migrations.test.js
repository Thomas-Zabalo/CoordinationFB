import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { creerSchema, ouvrirBase } from '../src/db/connexion.js';
import { appliquerMigrations, listerMigrationsAppliquees } from '../src/db/migrations.js';

const ancienSchema = readFileSync(new URL('../src/db/schema.sql', import.meta.url), 'utf8');

describe('Migrations de la base de données', () => {
  it('applique toutes les migrations sur une base neuve et reste idempotente', () => {
    const db = ouvrirBase(':memory:');

    const premierePasse = creerSchema(db);
    assert.deepEqual(premierePasse, ['001_initial_vinyles.sql', '002_utilisateurs_et_sessions.sql']);

    const deuxiemePasse = appliquerMigrations(db);
    assert.deepEqual(deuxiemePasse, []);

    const historique = listerMigrationsAppliquees(db);
    assert.equal(historique.length, 2);
    assert.equal(historique[0].version, 1);
    assert.equal(historique[1].version, 2);

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((ligne) => ligne.name);
    assert.ok(tables.includes('vinyles'));
    assert.ok(tables.includes('utilisateurs'));
    assert.ok(tables.includes('sessions'));
    assert.ok(tables.includes('migrations_schema'));
  });

  it('migre une base existante sans perdre les vinyles déjà enregistrés', () => {
    const db = ouvrirBase(':memory:');
    db.exec(ancienSchema);
    db.prepare('INSERT INTO vinyles (artiste, titre, annee) VALUES (?, ?, ?)').run('Miles Davis', 'Kind of Blue', 1959);

    const appliquees = appliquerMigrations(db);
    assert.equal(appliquees.length, 2);

    const vinyles = db.prepare('SELECT artiste, titre, annee FROM vinyles').all();
    assert.deepEqual(vinyles, [{ artiste: 'Miles Davis', titre: 'Kind of Blue', annee: 1959 }]);

    // Vérifie la contrainte de clé étrangère ON DELETE CASCADE sur sessions.
    const { lastInsertRowid: utilisateurId } = db
      .prepare('INSERT INTO utilisateurs (email, nom, mot_de_passe_hash) VALUES (?, ?, ?)')
      .run('thomas@exemple.fr', 'Thomas', 'scrypt$sel$hash');
    db.prepare('INSERT INTO sessions (utilisateur_id, jeton_hash, date_expiration) VALUES (?, ?, ?)').run(
      utilisateurId,
      'hash-session-test',
      '2099-01-01T00:00:00.000Z',
    );

    db.prepare('DELETE FROM utilisateurs WHERE id = ?').run(utilisateurId);
    const sessionsRestantes = db.prepare('SELECT COUNT(*) AS total FROM sessions').get().total;
    assert.equal(sessionsRestantes, 0);
  });
});
