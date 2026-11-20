import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ouvrirBase } from '../src/db/connexion.js';
import {
  appliquerMigrations,
  chargerMigrationsDisponibles,
  initialiserTableHistoriqueFlyway,
  statutMigrations,
} from '../src/db/migrations.js';

describe('Migrations Flyway', () => {
  it('trouve et charge les migrations V1 et V2 dans le bon ordre', () => {
    const migrations = chargerMigrationsDisponibles();
    assert.ok(migrations.length >= 2, 'Les migrations V1 et V2 doivent être présentes');
    assert.equal(migrations[0].version, '1');
    assert.equal(migrations[0].fichier, 'V1__creation_table_vinyles.sql');
    assert.equal(migrations[1].version, '2');
    assert.equal(migrations[1].fichier, 'V2__creation_tables_utilisateurs_et_sessions.sql');
  });

  it('initialise la table flyway_schema_history dans la base de données', () => {
    const db = ouvrirBase(':memory:');
    initialiserTableHistoriqueFlyway(db);

    const table = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'flyway_schema_history'")
      .get();
    assert.ok(table, 'La table flyway_schema_history doit exister');
    db.close();
  });

  it('applique les migrations avec succès et enregistre l’historique', () => {
    const db = ouvrirBase(':memory:');
    const appliquees = appliquerMigrations(db, { silencieux: true });

    assert.ok(appliquees.length >= 2);
    assert.equal(appliquees[0].version, '1');
    assert.equal(appliquees[1].version, '2');

    // Vérifie que les tables créées par les migrations sont bien présentes
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map((ligne) => ligne.name);
    assert.ok(tables.includes('vinyles'), 'La table vinyles doit avoir été créée par V1');
    assert.ok(tables.includes('utilisateurs'), 'La table utilisateurs doit avoir été créée par V2');
    assert.ok(tables.includes('sessions'), 'La table sessions doit avoir été créée par V2');

    // Vérifie la contrainte ON DELETE CASCADE sur sessions
    const { lastInsertRowid: utilisateurId } = db
      .prepare('INSERT INTO utilisateurs (email, nom, mot_de_passe_hash) VALUES (?, ?, ?)')
      .run('thomas@exemple.fr', 'Thomas', 'scrypt$sel$hash');
    db.prepare('INSERT INTO sessions (utilisateur_id, jeton_hash, date_expiration) VALUES (?, ?, ?)').run(
      utilisateurId,
      'hash-session-test',
      '2099-01-01T00:00:00.000Z',
    );
    db.prepare('DELETE FROM utilisateurs WHERE id = ?').run(utilisateurId);
    assert.equal(db.prepare('SELECT COUNT(*) AS total FROM sessions').get().total, 0);

    // Vérifie l'historique
    const historique = statutMigrations(db);
    assert.equal(historique.length, appliquees.length);
    assert.equal(historique[0].version, '1');
    assert.equal(historique[0].success, 1);
    assert.equal(historique[1].version, '2');
    assert.equal(historique[1].success, 1);

    db.close();
  });

  it('ne réapplique pas les migrations déjà exécutées', () => {
    const db = ouvrirBase(':memory:');
    const premierPassage = appliquerMigrations(db, { silencieux: true });
    assert.ok(premierPassage.length >= 2);

    const secondPassage = appliquerMigrations(db, { silencieux: true });
    assert.equal(secondPassage.length, 0, 'Aucune nouvelle migration ne doit être appliquée');

    db.close();
  });
});
