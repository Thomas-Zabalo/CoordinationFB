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
  it('trouve et charge au moins la migration initiale V1', () => {
    const migrations = chargerMigrationsDisponibles();
    assert.ok(migrations.length >= 1, 'Au moins une migration doit être présente');
    assert.equal(migrations[0].version, '1');
    assert.equal(migrations[0].fichier, 'V1__creation_table_vinyles.sql');
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

    assert.ok(appliquees.length >= 1);
    assert.equal(appliquees[0].version, '1');

    // Vérifie que la table créée par la migration est bien fonctionnelle
    const vinylesTable = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'vinyles'")
      .get();
    assert.ok(vinylesTable, 'La table vinyles doit avoir été créée par la migration');

    // Vérifie l'historique
    const historique = statutMigrations(db);
    assert.equal(historique.length, appliquees.length);
    assert.equal(historique[0].version, '1');
    assert.equal(historique[0].success, 1);

    db.close();
  });

  it('ne réapplique pas les migrations déjà exécutées', () => {
    const db = ouvrirBase(':memory:');
    const premierPassage = appliquerMigrations(db, { silencieux: true });
    assert.ok(premierPassage.length >= 1);

    const secondPassage = appliquerMigrations(db, { silencieux: true });
    assert.equal(secondPassage.length, 0, 'Aucune nouvelle migration ne doit être appliquée');

    db.close();
  });
});
