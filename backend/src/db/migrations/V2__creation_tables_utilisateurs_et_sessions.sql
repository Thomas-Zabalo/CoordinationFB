CREATE TABLE IF NOT EXISTS utilisateurs (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  email             TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  nom               TEXT    NOT NULL,
  mot_de_passe_hash TEXT    NOT NULL,
  date_creation     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  date_modification TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  utilisateur_id    INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  jeton_hash        TEXT    NOT NULL UNIQUE,
  date_creation     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  date_expiration   TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_utilisateur ON sessions (utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiration ON sessions (date_expiration);
