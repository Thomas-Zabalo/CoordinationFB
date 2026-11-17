// Correspondance entre les noms de l'API (partagés avec le front) et les colonnes SQL.
const COLONNES = {
  artiste: 'artiste',
  titre: 'titre',
  annee: 'annee',
  genre: 'genre',
  label: 'label',
  numeroCatalogue: 'numero_catalogue',
  format: 'format',
  taille: 'taille',
  pays: 'pays',
  couleur: 'couleur',
  etatDisque: 'etat_disque',
  etatPochette: 'etat_pochette',
  liste: 'liste',
  notes: 'notes',
};

const CHAMPS_RECHERCHES = ['artiste', 'titre', 'label', 'numeroCatalogue', 'genre'];

const collateur = new Intl.Collator('fr', { sensitivity: 'base', numeric: true });

// Recherche, filtre par genre et tri se font en JS plutôt qu'en SQL : SQLite
// ne sait comparer sans tenir compte de la casse et des accents qu'en ASCII.
function normaliser(texte) {
  return texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function comparerValeurs(a, b) {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return typeof a === 'string' ? collateur.compare(a, b) : a - b;
}

function creerComparateur(tri, ordre) {
  const sens = ordre === 'desc' ? -1 : 1;
  // Les identifiants suivent l'ordre d'ajout, sans ex æquo possible.
  const champ = tri === 'dateAjout' ? 'id' : tri;
  return (a, b) => {
    const principal = comparerValeurs(a[champ], b[champ]);
    if (principal !== 0) {
      // Les vinyles sans valeur restent à la fin, quel que soit le sens.
      return a[champ] === null || b[champ] === null ? principal : principal * sens;
    }
    return collateur.compare(a.artiste, b.artiste) || collateur.compare(a.titre, b.titre) || a.id - b.id;
  };
}

function versVinyle(ligne) {
  if (!ligne) return null;
  const vinyle = { id: ligne.id };
  for (const [champ, colonne] of Object.entries(COLONNES)) {
    vinyle[champ] = ligne[colonne];
  }
  vinyle.dateAjout = ligne.date_ajout;
  vinyle.dateModification = ligne.date_modification;
  return vinyle;
}

export function creerDepotVinyles(db) {
  const champs = Object.keys(COLONNES);
  const colonnes = Object.values(COLONNES);

  const requeteInsertion = db.prepare(
    `INSERT INTO vinyles (${colonnes.join(', ')}) VALUES (${champs.map((champ) => `@${champ}`).join(', ')})`,
  );
  const requeteMiseAJour = db.prepare(
    `UPDATE vinyles
     SET ${champs.map((champ) => `${COLONNES[champ]} = @${champ}`).join(', ')},
         date_modification = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE id = @id`,
  );
  const requeteLister = db.prepare(
    `SELECT * FROM vinyles
     WHERE (@liste IS NULL OR liste = @liste) AND (@format IS NULL OR format = @format)`,
  );
  const requeteParId = db.prepare('SELECT * FROM vinyles WHERE id = ?');
  const requeteSuppression = db.prepare('DELETE FROM vinyles WHERE id = ?');
  const requeteGenres = db.prepare(
    `SELECT genre FROM vinyles
     WHERE genre IS NOT NULL AND (@liste IS NULL OR liste = @liste)
     GROUP BY genre COLLATE NOCASE`,
  );

  return {
    lister({ liste, q, genre, format, tri, ordre }) {
      const recherche = q ? normaliser(q) : null;
      const genreRecherche = genre ? normaliser(genre) : null;

      return requeteLister
        .all({ liste: liste ?? null, format: format ?? null })
        .map(versVinyle)
        .filter((vinyle) => !genreRecherche || (vinyle.genre !== null && normaliser(vinyle.genre) === genreRecherche))
        .filter(
          (vinyle) =>
            !recherche ||
            CHAMPS_RECHERCHES.some((champ) => vinyle[champ] !== null && normaliser(vinyle[champ]).includes(recherche)),
        )
        .sort(creerComparateur(tri, ordre));
    },

    trouver(id) {
      return versVinyle(requeteParId.get(id));
    },

    creer(valeurs) {
      const { lastInsertRowid } = requeteInsertion.run(valeurs);
      return this.trouver(lastInsertRowid);
    },

    modifier(id, valeurs) {
      const { changes } = requeteMiseAJour.run({ ...valeurs, id });
      return changes > 0 ? this.trouver(id) : null;
    },

    supprimer(id) {
      return requeteSuppression.run(id).changes > 0;
    },

    listerGenres(liste) {
      return requeteGenres
        .all({ liste: liste ?? null })
        .map((ligne) => ligne.genre)
        .sort(collateur.compare);
    },
  };
}
