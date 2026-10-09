import { ANNEE_MIN, ETATS, FORMATS, LISTES, ORDRES, TAILLES, TRIS } from './constantes.js';

const LONGUEUR_MAX_TEXTE = 200;
const LONGUEUR_MAX_NOTES = 2000;

const CHAMPS_TEXTE = ['artiste', 'titre', 'genre', 'label', 'numeroCatalogue', 'pays', 'couleur'];
const CHAMPS_OBLIGATOIRES = ['artiste', 'titre'];
const CHAMPS_ENUMERES = {
  format: FORMATS,
  taille: TAILLES,
  etatDisque: ETATS,
  etatPochette: ETATS,
};

function estVide(valeur) {
  return valeur === undefined || valeur === null || (typeof valeur === 'string' && valeur.trim() === '');
}

function validerTexte(valeur, longueurMax) {
  if (estVide(valeur)) return { valeur: null };
  if (typeof valeur !== 'string') return { erreur: 'Doit être un texte' };
  const texte = valeur.trim();
  if (texte.length > longueurMax) return { erreur: `Ne doit pas dépasser ${longueurMax} caractères` };
  return { valeur: texte };
}

function validerAnnee(valeur) {
  if (estVide(valeur)) return { valeur: null };
  const annee = Number(valeur);
  const anneeMax = new Date().getFullYear() + 1;
  if (!Number.isInteger(annee) || annee < ANNEE_MIN || annee > anneeMax) {
    return { erreur: `Doit être une année entre ${ANNEE_MIN} et ${anneeMax}` };
  }
  return { valeur: annee };
}

function validerEnumere(valeur, valeursAutorisees) {
  if (estVide(valeur)) return { valeur: null };
  if (!valeursAutorisees.includes(valeur)) {
    return { erreur: `Doit être l'une des valeurs : ${valeursAutorisees.join(', ')}` };
  }
  return { valeur };
}

export function validerVinyle(corps) {
  const donnees = corps && typeof corps === 'object' ? corps : {};
  const valeurs = {};
  const erreurs = {};

  const resultats = {
    ...Object.fromEntries(CHAMPS_TEXTE.map((champ) => [champ, validerTexte(donnees[champ], LONGUEUR_MAX_TEXTE)])),
    ...Object.fromEntries(
      Object.entries(CHAMPS_ENUMERES).map(([champ, autorisees]) => [champ, validerEnumere(donnees[champ], autorisees)]),
    ),
    annee: validerAnnee(donnees.annee),
    notes: validerTexte(donnees.notes, LONGUEUR_MAX_NOTES),
    liste: estVide(donnees.liste) ? { valeur: 'collection' } : validerEnumere(donnees.liste, LISTES),
  };

  for (const [champ, resultat] of Object.entries(resultats)) {
    if (resultat.erreur) erreurs[champ] = resultat.erreur;
    else valeurs[champ] = resultat.valeur;
  }

  for (const champ of CHAMPS_OBLIGATOIRES) {
    if (!erreurs[champ] && valeurs[champ] === null) erreurs[champ] = 'Champ obligatoire';
  }

  return Object.keys(erreurs).length > 0 ? { erreurs } : { valeurs };
}

export function validerRecherche(query) {
  const erreurs = {};
  const filtres = {
    q: typeof query.q === 'string' && query.q.trim() !== '' ? query.q.trim() : null,
    genre: typeof query.genre === 'string' && query.genre.trim() !== '' ? query.genre.trim() : null,
    tri: query.tri ?? 'dateAjout',
    ordre: query.ordre ?? (query.tri ? 'asc' : 'desc'),
  };

  for (const [champ, autorisees] of [
    ['liste', LISTES],
    ['format', FORMATS],
  ]) {
    const resultat = validerEnumere(query[champ], autorisees);
    if (resultat.erreur) erreurs[champ] = resultat.erreur;
    else filtres[champ] = resultat.valeur;
  }

  if (!TRIS.includes(filtres.tri)) erreurs.tri = `Doit être l'une des valeurs : ${TRIS.join(', ')}`;
  if (!ORDRES.includes(filtres.ordre)) erreurs.ordre = `Doit être l'une des valeurs : ${ORDRES.join(', ')}`;

  return Object.keys(erreurs).length > 0 ? { erreurs } : { filtres };
}

export function validerIdentifiant(valeur) {
  const id = Number(valeur);
  return Number.isInteger(id) && id > 0 ? id : null;
}
