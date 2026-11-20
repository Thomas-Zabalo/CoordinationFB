import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DOSSIER_MIGRATIONS = new URL('./migrations/', import.meta.url);

function listerFichiersMigrations() {
  return readdirSync(DOSSIER_MIGRATIONS)
    .filter((fichier) => /^\d+_.*\.sql$/.test(fichier))
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map((fichier) => {
      const version = Number(fichier.split('_')[0]);
      const contenu = readFileSync(fileURLToPath(new URL(fichier, DOSSIER_MIGRATIONS)), 'utf8');
      return { version, nom: fichier, contenu };
    });
}

function assurerTableMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations_schema (
      version          INTEGER PRIMARY KEY,
      nom              TEXT    NOT NULL,
      date_application TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);
}

export function listerMigrationsAppliquees(db) {
  assurerTableMigrations(db);
  return db
    .prepare('SELECT version, nom, date_application AS dateApplication FROM migrations_schema ORDER BY version ASC')
    .all();
}

export function appliquerMigrations(db) {
  assurerTableMigrations(db);

  const versionsAppliquees = new Set(
    db
      .prepare('SELECT version FROM migrations_schema')
      .all()
      .map((ligne) => ligne.version),
  );

  const enregistrer = db.prepare('INSERT INTO migrations_schema (version, nom) VALUES (?, ?)');
  const migrationsExecutees = [];

  for (const migration of listerFichiersMigrations()) {
    if (versionsAppliquees.has(migration.version)) continue;

    // Chaque migration s'exécute dans une transaction pour éviter un état partiel en cas d'erreur.
    const executer = db.transaction(() => {
      db.exec(migration.contenu);
      enregistrer.run(migration.version, migration.nom);
    });
    executer();
    migrationsExecutees.push(migration.nom);
  }

  return migrationsExecutees;
}
