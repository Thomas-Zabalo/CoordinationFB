import {
  ANNEE_MIN,
  ETATS,
  FORMATS,
  LISTES,
  LONGUEUR_MAX_NOTES,
  LONGUEUR_MAX_TEXTE,
  TAILLES,
} from './constantes.js';

export const CHAMPS_FORMULAIRE = [
  'artiste',
  'titre',
  'annee',
  'genre',
  'label',
  'numeroCatalogue',
  'format',
  'taille',
  'pays',
  'couleur',
  'etatDisque',
  'etatPochette',
  'liste',
  'notes',
];

const CHAMPS_OBLIGATOIRES = new Set(['artiste', 'titre']);
const CHAMPS_TEXTE = new Set(['artiste', 'titre', 'genre', 'label', 'numeroCatalogue', 'pays', 'couleur']);
const CODES_ETATS = new Set(ETATS.map((etat) => etat.code));
const CLES_LISTES = Object.keys(LISTES);

export function anneeMaximaleAutorisee() {
  return new Date().getFullYear() + 1;
}

export function versFormulaire(vinyle = {}) {
  const donnees = vinyle ?? {};
  const etat = Object.fromEntries(
    CHAMPS_FORMULAIRE.map((champ) => {
      const valeur = donnees[champ];
      return [champ, valeur === undefined || valeur === null ? '' : String(valeur)];
    }),
  );
  if (!CLES_LISTES.includes(etat.liste)) {
    etat.liste = 'collection';
  }
  return etat;
}

export function versVinyle(formulaire) {
  const vinyle = {};
  for (const champ of CHAMPS_FORMULAIRE) {
    const valeur = formulaire[champ];
    const texte = valeur === undefined || valeur === null ? '' : String(valeur).trim();
    if (champ === 'annee') {
      vinyle.annee = texte === '' ? null : Number(texte);
    } else {
      vinyle[champ] = texte === '' ? null : texte;
    }
  }
  return vinyle;
}

export function validerChampVinyle(champ, valeur, { anneeMax = anneeMaximaleAutorisee() } = {}) {
  const texte = valeur === undefined || valeur === null ? '' : String(valeur).trim();

  if (CHAMPS_OBLIGATOIRES.has(champ) && texte === '') {
    return 'Champ obligatoire';
  }

  if (CHAMPS_TEXTE.has(champ)) {
    if (texte.length > LONGUEUR_MAX_TEXTE) {
      return `Ne doit pas dépasser ${LONGUEUR_MAX_TEXTE} caractères`;
    }
    return null;
  }

  if (champ === 'notes') {
    if (texte.length > LONGUEUR_MAX_NOTES) {
      return `Ne doit pas dépasser ${LONGUEUR_MAX_NOTES} caractères`;
    }
    return null;
  }

  if (champ === 'annee') {
    if (texte === '') return null;
    if (!/^\d{4}$/.test(texte)) {
      return `Doit être une année entre ${ANNEE_MIN} et ${anneeMax}`;
    }
    const annee = Number(texte);
    if (!Number.isInteger(annee) || annee < ANNEE_MIN || annee > anneeMax) {
      return `Doit être une année entre ${ANNEE_MIN} et ${anneeMax}`;
    }
    return null;
  }

  if (champ === 'format') {
    if (texte !== '' && !FORMATS.includes(texte)) {
      return `Doit être l'une des valeurs : ${FORMATS.join(', ')}`;
    }
    return null;
  }

  if (champ === 'taille') {
    if (texte !== '' && !TAILLES.includes(texte)) {
      return `Doit être l'une des valeurs : ${TAILLES.join(', ')}`;
    }
    return null;
  }

  if (champ === 'etatDisque' || champ === 'etatPochette') {
    if (texte !== '' && !CODES_ETATS.has(texte)) {
      return `Doit être l'une des valeurs : ${ETATS.map((e) => e.code).join(', ')}`;
    }
    return null;
  }

  if (champ === 'liste') {
    if (!CLES_LISTES.includes(texte)) {
      return `Doit être l'une des valeurs : ${CLES_LISTES.join(', ')}`;
    }
    return null;
  }

  return null;
}

export function validerFormulaireVinyle(formulaire, options = {}) {
  const erreurs = {};
  for (const champ of CHAMPS_FORMULAIRE) {
    const erreur = validerChampVinyle(champ, formulaire[champ], options);
    if (erreur) erreurs[champ] = erreur;
  }
  return {
    valide: Object.keys(erreurs).length === 0,
    erreurs,
  };
}

export function estFormulaireModifie(formulaireActuel, formulaireInitial) {
  return CHAMPS_FORMULAIRE.some((champ) => {
    const actuel = String(formulaireActuel[champ] ?? '').trim();
    const initial = String(formulaireInitial[champ] ?? '').trim();
    return actuel !== initial;
  });
}
