CREATE TABLE IF NOT EXISTS vinyles (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  artiste           TEXT    NOT NULL,
  titre             TEXT    NOT NULL,
  annee             INTEGER,
  genre             TEXT,
  label             TEXT,
  numero_catalogue  TEXT,
  format            TEXT CHECK (format IN ('LP', 'EP', 'Single', '78 tours')),
  taille            TEXT CHECK (taille IN ('12"', '10"', '7"')),
  pays              TEXT,
  couleur           TEXT,
  etat_disque       TEXT CHECK (etat_disque IN ('M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P')),
  etat_pochette     TEXT CHECK (etat_pochette IN ('M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P')),
  liste             TEXT    NOT NULL DEFAULT 'collection' CHECK (liste IN ('collection', 'envies')),
  notes             TEXT,
  date_ajout        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  date_modification TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_vinyles_liste ON vinyles (liste);
