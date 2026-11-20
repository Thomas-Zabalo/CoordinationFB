import { requeteApi } from './requete.js';

export async function inscrire({ email, nom, motDePasse }) {
  const resultat = await requeteApi('/auth/inscription', {
    methode: 'POST',
    corps: { email, nom, motDePasse },
    credentials: 'include',
  });
  return resultat.utilisateur;
}

export async function connecter({ email, motDePasse }) {
  const resultat = await requeteApi('/auth/connexion', {
    methode: 'POST',
    corps: { email, motDePasse },
    credentials: 'include',
  });
  return resultat.utilisateur;
}

export async function obtenirUtilisateur(signal) {
  const resultat = await requeteApi('/auth/moi', { signal, credentials: 'include' });
  return resultat.utilisateur;
}

export function deconnecter() {
  return requeteApi('/auth/deconnexion', { methode: 'POST', credentials: 'include' });
}
