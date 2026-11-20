const URL_API = import.meta.env.VITE_API_URL ?? '/api';

export class ErreurApi extends Error {
  constructor(message, statut, details) {
    super(message);
    this.statut = statut;
    this.details = details ?? {};
  }
}

export async function requeteApi(chemin, { methode = 'GET', corps, signal, credentials } = {}) {
  let reponse;
  try {
    reponse = await fetch(`${URL_API}${chemin}`, {
      method: methode,
      headers: corps ? { 'Content-Type': 'application/json' } : undefined,
      body: corps ? JSON.stringify(corps) : undefined,
      signal,
      credentials,
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
