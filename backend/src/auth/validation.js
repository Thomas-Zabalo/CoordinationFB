const LONGUEUR_MAX_EMAIL = 254;
const LONGUEUR_MIN_NOM = 2;
const LONGUEUR_MAX_NOM = 100;
const LONGUEUR_MIN_MOT_DE_PASSE = 8;
const LONGUEUR_MAX_MOT_DE_PASSE = 128;

// Validation pragmatique : partie locale sans espace + @ + domaine avec au moins un point.
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function estVide(valeur) {
  return valeur === undefined || valeur === null || (typeof valeur === 'string' && valeur.trim() === '');
}

function validerEmail(valeur) {
  if (estVide(valeur)) return { erreur: 'Champ obligatoire' };
  if (typeof valeur !== 'string') return { erreur: 'Doit être un texte' };
  if (valeur.includes('\0')) return { erreur: 'Contient des caractères non autorisés' };

  const email = valeur.trim().toLowerCase();
  if (email.length > LONGUEUR_MAX_EMAIL || !REGEX_EMAIL.test(email)) {
    return { erreur: 'Adresse e-mail invalide' };
  }
  return { valeur: email };
}

function validerNom(valeur) {
  if (estVide(valeur)) return { erreur: 'Champ obligatoire' };
  if (typeof valeur !== 'string') return { erreur: 'Doit être un texte' };
  if (valeur.includes('\0')) return { erreur: 'Contient des caractères non autorisés' };

  const nom = valeur.trim();
  if (nom.length < LONGUEUR_MIN_NOM) {
    return { erreur: `Doit contenir au moins ${LONGUEUR_MIN_NOM} caractères` };
  }
  if (nom.length > LONGUEUR_MAX_NOM) {
    return { erreur: `Ne doit pas dépasser ${LONGUEUR_MAX_NOM} caractères` };
  }
  return { valeur: nom };
}

function validerMotDePasseInscription(valeur) {
  if (valeur === undefined || valeur === null || valeur === '') {
    return { erreur: 'Champ obligatoire' };
  }
  if (typeof valeur !== 'string') return { erreur: 'Doit être un texte' };
  if (valeur.includes('\0')) return { erreur: 'Contient des caractères non autorisés' };

  if (valeur.length < LONGUEUR_MIN_MOT_DE_PASSE) {
    return { erreur: `Doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères` };
  }
  if (valeur.length > LONGUEUR_MAX_MOT_DE_PASSE) {
    return { erreur: `Ne doit pas dépasser ${LONGUEUR_MAX_MOT_DE_PASSE} caractères` };
  }
  if (!/[a-zA-ZÀ-ÿ]/.test(valeur) || !/\d/.test(valeur)) {
    return { erreur: 'Doit contenir au moins une lettre et un chiffre' };
  }
  return { valeur };
}

function validerMotDePasseConnexion(valeur) {
  if (valeur === undefined || valeur === null || valeur === '') {
    return { erreur: 'Champ obligatoire' };
  }
  if (typeof valeur !== 'string') return { erreur: 'Doit être un texte' };
  if (valeur.includes('\0')) return { erreur: 'Contient des caractères non autorisés' };
  if (valeur.length > LONGUEUR_MAX_MOT_DE_PASSE) {
    return { erreur: `Ne doit pas dépasser ${LONGUEUR_MAX_MOT_DE_PASSE} caractères` };
  }
  return { valeur };
}

export function validerInscription(corps) {
  const donnees = corps && typeof corps === 'object' ? corps : {};
  const valeurs = {};
  const erreurs = {};

  const resultats = {
    email: validerEmail(donnees.email),
    nom: validerNom(donnees.nom),
    motDePasse: validerMotDePasseInscription(donnees.motDePasse),
  };

  for (const [champ, resultat] of Object.entries(resultats)) {
    if (resultat.erreur) erreurs[champ] = resultat.erreur;
    else valeurs[champ] = resultat.valeur;
  }

  return Object.keys(erreurs).length > 0 ? { erreurs } : { valeurs };
}

export function validerConnexion(corps) {
  const donnees = corps && typeof corps === 'object' ? corps : {};
  const valeurs = {};
  const erreurs = {};

  const resultats = {
    email: validerEmail(donnees.email),
    motDePasse: validerMotDePasseConnexion(donnees.motDePasse),
  };

  for (const [champ, resultat] of Object.entries(resultats)) {
    if (resultat.erreur) erreurs[champ] = resultat.erreur;
    else valeurs[champ] = resultat.valeur;
  }

  return Object.keys(erreurs).length > 0 ? { erreurs } : { valeurs };
}
