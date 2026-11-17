// Ces valeurs font partie de l'accord front / back : toute modification
// doit être répercutée dans backend/src/vinyles/constantes.js.

export const ETATS = [
  { code: 'M', nom: 'Mint', description: 'Neuf, jamais joué' },
  { code: 'NM', nom: 'Near Mint', description: 'Quasi neuf, aucune trace visible' },
  { code: 'VG+', nom: 'Very Good Plus', description: 'Très bon état, légères traces sans effet sur le son' },
  { code: 'VG', nom: 'Very Good', description: 'Bon état, traces visibles et léger souffle' },
  { code: 'G+', nom: 'Good Plus', description: 'Usé, craquements audibles' },
  { code: 'G', nom: 'Good', description: 'Très usé, joue encore du début à la fin' },
  { code: 'F', nom: 'Fair', description: 'Abîmé, saute ou grésille fortement' },
  { code: 'P', nom: 'Poor', description: 'Très abîmé, quasiment injouable' },
];

export const FORMATS = ['LP', 'EP', 'Single', '78 tours'];
export const TAILLES = ['12"', '10"', '7"'];

export const LISTES = {
  collection: { titre: 'Ma collection', nomCourt: 'Collection', nomPossessif: 'votre collection', chemin: '/collection' },
  envies: {
    titre: "Ma liste d'envies",
    nomCourt: "Liste d'envies",
    nomPossessif: "votre liste d'envies",
    chemin: '/envies',
  },
};

export const TRIS = [
  { valeur: 'dateAjout', libelle: "Date d'ajout" },
  { valeur: 'artiste', libelle: 'Artiste' },
  { valeur: 'titre', libelle: 'Titre' },
  { valeur: 'annee', libelle: 'Année' },
];

export function trouverEtat(code) {
  return ETATS.find((etat) => etat.code === code) ?? null;
}
