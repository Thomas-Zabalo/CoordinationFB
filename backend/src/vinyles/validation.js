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
  const donnees = query && typeof query === 'object' ? query : {};
  const erreurs = {};

  let q = null;
  if (typeof donnees.q === 'string' && donnees.q.trim() !== '') {
    const texte = donnees.q.trim();
    if (texte.length > 200) {
      erreurs.q = 'Ne doit pas dépasser 200 caractères';
    } else if (texte.includes('\0')) {
      erreurs.q = 'Caractère non autorisé';
    } else {
      q = texte;
    }
  }

  let genre = null;
  if (typeof donnees.genre === 'string' && donnees.genre.trim() !== '') {
    const texte = donnees.genre.trim();
    if (texte.length > 200) {
      erreurs.genre = 'Ne doit pas dépasser 200 caractères';
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

export function validerTransfert(corps) {
  const donnees = corps && typeof corps === 'object' ? corps : {};
  const valeurs = {};
  const erreurs = {};

  if ('etatDisque' in donnees) {
    const resultat = validerEnumere(donnees.etatDisque, ETATS);
    if (resultat.erreur) erreurs.etatDisque = resultat.erreur;
    else valeurs.etatDisque = resultat.valeur;
  }

  if ('etatPochette' in donnees) {
    const resultat = validerEnumere(donnees.etatPochette, ETATS);
    if (resultat.erreur) erreurs.etatPochette = resultat.erreur;
    else valeurs.etatPochette = resultat.valeur;
  }

  if ('notes' in donnees) {
    const resultat = validerTexte(donnees.notes, LONGUEUR_MAX_NOTES);
    if (resultat.erreur) erreurs.notes = resultat.erreur;
    else valeurs.notes = resultat.valeur;
  }

  return Object.keys(erreurs).length > 0 ? { erreurs } : { valeurs };
}

export function validerIdentifiant(valeur) {
  if (typeof valeur !== 'string' && typeof valeur !== 'number') return null;
  const texte = String(valeur).trim();
  if (!/^\d{1,9}$/.test(texte)) return null;
  const id = Number(texte);
  return id > 0 && id <= Number.MAX_SAFE_INTEGER ? id : null;
}
