const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ErreurApi extends Error {
  constructor(message, statut, details) {
    super(message);
    this.statut = statut;
    this.details = details ?? {};
  }
}

async function requete(chemin, { methode = 'GET', corps, signal } = {}) {
  let reponse;
  try {
    reponse = await fetch(`${URL_API}${chemin}`, {
      method: methode,
      headers: corps ? { 'Content-Type': 'application/json' } : undefined,
      body: corps ? JSON.stringify(corps) : undefined,
      signal,
    });
  } catch (erreur) {
    if (erreur.name === 'AbortError') throw erreur;
    throw new ErreurApi("Impossible de joindre le serveur. Vérifiez que l'API est démarrée.", 0);
  }

  if (reponse.status === 204) return null;

  const donnees = await reponse.json().catch(() => null);
  if (!reponse.ok) {
    throw new ErreurApi(donnees?.erreur?.message ?? 'Erreur inattendue', reponse.status, donnees?.erreur?.details);
  }
  return donnees;
}

function versParametres(filtres) {
  const parametres = new URLSearchParams();
  for (const [cle, valeur] of Object.entries(filtres)) {
    if (valeur !== undefined && valeur !== null && valeur !== '') parametres.set(cle, valeur);
  }
  const texte = parametres.toString();
  return texte ? `?${texte}` : '';
}

export function listerVinyles(filtres = {}, signal) {
  return requete(`/vinyles${versParametres(filtres)}`, { signal });
}

export function listerGenres(liste, signal) {
  return requete(`/vinyles/genres${versParametres({ liste })}`, { signal });
}

export function recupererVinyle(id, signal) {
  return requete(`/vinyles/${id}`, { signal });
}

export function creerVinyle(vinyle) {
  return requete('/vinyles', { methode: 'POST', corps: vinyle });
}

export function modifierVinyle(id, vinyle) {
  return requete(`/vinyles/${id}`, { methode: 'PUT', corps: vinyle });
}

export function supprimerVinyle(id) {
  return requete(`/vinyles/${id}`, { methode: 'DELETE' });
}
