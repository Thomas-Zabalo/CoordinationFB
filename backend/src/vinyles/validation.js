import { ANNEE_MIN, ETATS, FORMATS, LISTES, ORDRES, TAILLES, TRIS } from './constantes.js';

export const LONGUEUR_MAX_TEXTE = 200;
export const LONGUEUR_MAX_NOTES = 2000;

const CHAMPS_TEXTE = ['artiste', 'titre', 'genre', 'label', 'numeroCatalogue', 'pays', 'couleur'];
const CHAMPS_OBLIGATOIRES = ['artiste', 'titre'];
const CHAMPS_ENUMERES = {
  format: FORMATS,
  taille: TAILLES,
  etatDisque: ETATS,
  etatPochette: ETATS,
};

export const CHAMPS_MODIFIABLES = [
  ...CHAMPS_TEXTE,
  ...Object.keys(CHAMPS_ENUMERES),
  'annee',
  'notes',
  'liste',
];

function estObjetSimple(valeur) {
  return valeur !== null && typeof valeur === 'object' && !Array.isArray(valeur);
}

function estVide(valeur) {
  return valeur === undefined || valeur === null || (typeof valeur === 'string' && valeur.trim() === '');
}

function validerTexte(valeur, longueurMax) {
  if (estVide(valeur)) return { valeur: null };
  if (typeof valeur !== 'string') return { erreur: 'Doit être un texte' };
  if (valeur.includes('\0')) return { erreur: 'Contient des caractères non autorisés' };
  const texte = valeur.trim();
  if (texte.length > longueurMax) return { erreur: `Ne doit pas dépasser ${longueurMax} caractères` };
  return { valeur: texte };
}

function validerAnnee(valeur) {
  if (estVide(valeur)) return { valeur: null };
  const anneeMax = new Date().getFullYear() + 1;
  if (typeof valeur !== 'number' && typeof valeur !== 'string') {
    return { erreur: `Doit être une année entre ${ANNEE_MIN} et ${anneeMax}` };
  }
  if (typeof valeur === 'number' && !Number.isFinite(valeur)) {
    return { erreur: `Doit être une année entre ${ANNEE_MIN} et ${anneeMax}` };
  }
  const texte = String(valeur).trim();
  if (!/^\d{4}$/.test(texte)) {
    return { erreur: `Doit être une année entre ${ANNEE_MIN} et ${anneeMax}` };
  }
  const annee = Number(texte);
  if (!Number.isInteger(annee) || annee < ANNEE_MIN || annee > anneeMax) {
    return { erreur: `Doit être une année entre ${ANNEE_MIN} et ${anneeMax}` };
  }
  return { valeur: annee };
}

function validerEnumere(valeur, valeursAutorisees) {
  if (estVide(valeur)) return { valeur: null };
  if (typeof valeur !== 'string' || !valeursAutorisees.includes(valeur)) {
    return { erreur: `Doit être l'une des valeurs : ${valeursAutorisees.join(', ')}` };
  }
  return { valeur };
}

function validerChamp(champ, valeur, { listeObligatoire = false } = {}) {
  if (CHAMPS_TEXTE.includes(champ)) return validerTexte(valeur, LONGUEUR_MAX_TEXTE);
  if (Object.hasOwn(CHAMPS_ENUMERES, champ)) return validerEnumere(valeur, CHAMPS_ENUMERES[champ]);
  if (champ === 'annee') return validerAnnee(valeur);
  if (champ === 'notes') return validerTexte(valeur, LONGUEUR_MAX_NOTES);
  if (champ === 'liste') {
    if (estVide(valeur)) {
      return listeObligatoire
        ? { erreur: `Doit être l'une des valeurs : ${LISTES.join(', ')}` }
        : { valeur: 'collection' };
    }
    return validerEnumere(valeur, LISTES);
  }
  return { erreur: 'Champ inconnu' };
}

export function validerVinyle(corps) {
  if (!estObjetSimple(corps)) {
    return { erreurs: { corps: 'Le corps de la requête doit être un objet JSON' } };
  }

  const valeurs = {};
  const erreurs = {};

  for (const champ of CHAMPS_MODIFIABLES) {
    const resultat = validerChamp(champ, corps[champ]);
    if (resultat.erreur) erreurs[champ] = resultat.erreur;
    else valeurs[champ] = resultat.valeur;
  }

  for (const champ of CHAMPS_OBLIGATOIRES) {
    if (!erreurs[champ] && valeurs[champ] === null) erreurs[champ] = 'Champ obligatoire';
  }

  return Object.keys(erreurs).length > 0 ? { erreurs } : { valeurs };
}

export function validerModificationPartielle(corps) {
  if (!estObjetSimple(corps)) {
    return { erreurs: { corps: 'Le corps de la requête doit être un objet JSON' } };
  }

  const champsFournis = CHAMPS_MODIFIABLES.filter((champ) => Object.hasOwn(corps, champ));
  if (champsFournis.length === 0) {
    return { erreurs: { corps: 'Au moins un champ modifiable doit être fourni' } };
  }

  const valeurs = {};
  const erreurs = {};

  for (const champ of champsFournis) {
    const resultat = validerChamp(champ, corps[champ], { listeObligatoire: true });
    if (resultat.erreur) {
      erreurs[champ] = resultat.erreur;
    } else if (CHAMPS_OBLIGATOIRES.includes(champ) && resultat.valeur === null) {
      erreurs[champ] = 'Champ obligatoire';
    } else {
      valeurs[champ] = resultat.valeur;
    }
  }

  return Object.keys(erreurs).length > 0 ? { erreurs } : { valeurs };
}

export function validerRecherche(query) {
  const donnees = estObjetSimple(query) ? query : {};
  const erreurs = {};

  let q = null;
  if (typeof donnees.q === 'string' && donnees.q.trim() !== '') {
    const texte = donnees.q.trim();
    if (texte.length > LONGUEUR_MAX_TEXTE) {
      erreurs.q = `Ne doit pas dépasser ${LONGUEUR_MAX_TEXTE} caractères`;
    } else if (texte.includes('\0')) {
      erreurs.q = 'Caractère non autorisé';
    } else {
      q = texte;
    }
  }

  let genre = null;
  if (typeof donnees.genre === 'string' && donnees.genre.trim() !== '') {
    const texte = donnees.genre.trim();
    if (texte.length > LONGUEUR_MAX_TEXTE) {
      erreurs.genre = `Ne doit pas dépasser ${LONGUEUR_MAX_TEXTE} caractères`;
    } else if (texte.includes('\0')) {
      erreurs.genre = 'Caractère non autorisé';
    } else {
      genre = texte;
    }
  }

  const filtres = {
    q,
    genre,
    tri: typeof donnees.tri === 'string' ? donnees.tri : 'dateAjout',
    ordre: typeof donnees.ordre === 'string' ? donnees.ordre : (donnees.tri ? 'asc' : 'desc'),
  };

  for (const [champ, autorisees] of [
    ['liste', LISTES],
    ['format', FORMATS],
  ]) {
    const resultat = validerEnumere(donnees[champ], autorisees);
    if (resultat.erreur) erreurs[champ] = resultat.erreur;
    else filtres[champ] = resultat.valeur;
  }

  if (!TRIS.includes(filtres.tri)) erreurs.tri = `Doit être l'une des valeurs : ${TRIS.join(', ')}`;
  if (!ORDRES.includes(filtres.ordre)) erreurs.ordre = `Doit être l'une des valeurs : ${ORDRES.join(', ')}`;

  return Object.keys(erreurs).length > 0 ? { erreurs } : { filtres };
}

export function validerIdentifiant(valeur) {
  if (typeof valeur !== 'string' && typeof valeur !== 'number') return null;
  const texte = String(valeur).trim();
  if (!/^\d{1,9}$/.test(texte)) return null;
  const id = Number(texte);
  return id > 0 && id <= Number.MAX_SAFE_INTEGER ? id : null;
}
