import { ErreurApi, requeteApi } from './requete.js';

export { ErreurApi };

function versParametres(filtres) {
  const parametres = new URLSearchParams();
  for (const [cle, valeur] of Object.entries(filtres)) {
    if (valeur !== undefined && valeur !== null && valeur !== '') parametres.set(cle, valeur);
  }
  const texte = parametres.toString();
  return texte ? `?${texte}` : '';
}

export function listerVinyles(filtres = {}, signal) {
  return requeteApi(`/vinyles${versParametres(filtres)}`, { signal });
}

export function listerGenres(liste, signal) {
  return requeteApi(`/vinyles/genres${versParametres({ liste })}`, { signal });
}

export function recupererVinyle(id, signal) {
  return requeteApi(`/vinyles/${id}`, { signal });
}

export function creerVinyle(vinyle) {
  return requeteApi('/vinyles', { methode: 'POST', corps: vinyle });
}

export function modifierVinyle(id, vinyle) {
  return requeteApi(`/vinyles/${id}`, { methode: 'PUT', corps: vinyle });
}

export function supprimerVinyle(id) {
  return requeteApi(`/vinyles/${id}`, { methode: 'DELETE' });
}

export function declencherErreurApi(statut, signal) {
  return requeteApi(`/test-erreur/${statut}`, { signal });
}
