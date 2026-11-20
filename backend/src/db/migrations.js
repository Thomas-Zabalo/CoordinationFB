import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DOSSIER_MIGRATIONS = join(__dirname, 'migrations');

/**
 * Calcule un checksum 32 bits (compatible CRC32 simple) pour le suivi des migrations.
 */
function calculerChecksum(contenu) {
  let crc = -1;
  const buffer = Buffer.from(contenu.replace(/\r\n/g, '\n'), 'utf8');
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

/**
 * Compare deux numéros de versions Flyway (ex: "1" vs "2", "1.2" vs "1.10", "1_1" vs "1_2").
 */
function comparerVersions(versionA, versionB) {
  const partsA = versionA.split(/[._]/).map(Number);
  const partsB = versionB.split(/[._]/).map(Number);
  const maxLen = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < maxLen; i += 1) {
    const valA = partsA[i] ?? 0;
    const valB = partsB[i] ?? 0;
    if (valA !== valB) return valA - valB;
  }
  return 0;
}

/**
 * Récupère et trie la liste des fichiers de migration Flyway présents dans le dossier `migrations`.
 */
export function chargerMigrationsDisponibles(dossier = DOSSIER_MIGRATIONS) {
  const fichiers = readdirSync(dossier);
  const motif = /^V(?<version>[\d._]+)__(?<description>.+)\.sql$/;

  const migrations = [];
  for (const fichier of fichiers) {
    const match = fichier.match(motif);
    if (match) {
      const { version, description } = match.groups;
      const chemin = join(dossier, fichier);
      const sql = readFileSync(chemin, 'utf8');
      migrations.push({
        fichier,
        version: version.replace(/_/g, '.'),
        description: description.replace(/_/g, ' '),
        chemin,
        sql,
        checksum: calculerChecksum(sql),
      });
    }
  }

  migrations.sort((a, b) => comparerVersions(a.version, b.version));
  return migrations;
}

/**
 * Crée la table `flyway_schema_history` si elle n'existe pas encore.
 * Structure 100% conforme à celle générée nativement par Flyway sous SQLite.
 */
export function initialiserTableHistoriqueFlyway(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS flyway_schema_history (
      installed_rank INTEGER PRIMARY KEY,
      version        TEXT,
      description    TEXT NOT NULL,
      type           TEXT NOT NULL,
      script         TEXT NOT NULL,
      checksum       INTEGER,
      installed_by   TEXT NOT NULL,
      installed_on   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
      execution_time INTEGER NOT NULL,
      success        INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS flyway_schema_history_s_idx ON flyway_schema_history (success);
  `);
}

/**
 * Applique toutes les migrations Flyway en attente sur la base de données.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {object} [options]
 * @param {boolean} [options.silencieux=false]
 * @param {string} [options.dossier=DOSSIER_MIGRATIONS]
 * @returns {Array<{ version: string, fichier: string }>} Migrations appliquées
 */
export function appliquerMigrations(db, { silencieux = false, dossier = DOSSIER_MIGRATIONS } = {}) {
  initialiserTableHistoriqueFlyway(db);

  const migrationsExistantes = db
    .prepare('SELECT version, script FROM flyway_schema_history WHERE success = 1')
    .all();
  const versionsAppliquees = new Set(migrationsExistantes.map((m) => m.version));

  const migrations = chargerMigrationsDisponibles(dossier);
  const appliquees = [];

  for (const migration of migrations) {
    if (versionsAppliquees.has(migration.version)) {
      continue;
    }

    const debut = Date.now();
    const executerMigration = db.transaction(() => {
      db.exec(migration.sql);

      const prochainRang =
        (db.prepare('SELECT COALESCE(MAX(installed_rank), 0) + 1 AS rang FROM flyway_schema_history').get()?.rang ??
          1);

      const utilisateur = process.env.USERNAME || process.env.USER || 'flyway-node';
      const tempsExecution = Date.now() - debut;

      db.prepare(
        `INSERT INTO flyway_schema_history
          (installed_rank, version, description, type, script, checksum, installed_by, execution_time, success)
         VALUES (?, ?, ?, 'SQL', ?, ?, ?, ?, 1)`,
      ).run(
        prochainRang,
        migration.version,
        migration.description,
        migration.fichier,
        migration.checksum,
        utilisateur,
        tempsExecution,
      );
    });

    executerMigration();
    appliquees.push({ version: migration.version, fichier: migration.fichier });

    if (!silencieux) {
      console.log(`[Flyway] Migration appliquée avec succès : ${migration.fichier} (version ${migration.version})`);
    }
  }

  if (!silencieux && appliquees.length === 0) {
    console.log('[Flyway] Schéma à jour, aucune migration en attente.');
  }

  return appliquees;
}

/**
 * Récupère l'état courant de toutes les migrations appliquées.
 */
export function statutMigrations(db) {
  initialiserTableHistoriqueFlyway(db);
  return db
    .prepare(
      `SELECT installed_rank AS rang, version, description, script, installed_on, execution_time, success
       FROM flyway_schema_history
       ORDER BY installed_rank ASC`,
    )
    .all();
}
