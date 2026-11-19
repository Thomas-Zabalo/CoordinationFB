import { createContext, useContext } from 'react';
import { resoudreErreur } from '../erreurs/gestionnaireErreurs.js';

export const ToastContexte = createContext(null);

export const EVENEMENT_TOAST = 'app:afficher-toast';

let compteurId = 0;
export function genererIdToast() {
  compteurId += 1;
  return `toast-${Date.now()}-${compteurId}`;
}

/**
 * Permet d'émettre un toast depuis n'importe où dans le code (ex: client API).
 *
 * @param {object} toast - Propriétés du toast
 */
export function emettreToast(toast) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(EVENEMENT_TOAST, {
        detail: {
          id: toast.id ?? genererIdToast(),
          type: toast.type ?? 'info',
          duree: toast.duree ?? 5000,
          ...toast,
        },
      }),
    );
  }
}

/**
 * Émet une notification d'erreur en résolvant le code ou l'erreur via le gestionnaire d'erreurs.
 *
 * @param {unknown} erreur - Code HTTP (403, 404, etc.), ErreurApi ou Error
 * @param {object} [options] - Options supplémentaires (titre, duree, etc.)
 */
export function emettreErreur(erreur, options = {}) {
  const resolue = resoudreErreur(erreur, options.message);
  emettreToast({
    type: 'erreur',
    titre: options.titre ?? resolue.titre,
    message: options.message ?? resolue.message,
    duree: options.duree ?? 6000,
    ...options,
  });
}

/**
 * Hook personnalisé pour interagir avec le système de toasts.
 * Fonctionne même en dehors d'un ToastProvider (ex: tests unitaires isolés).
 */
export function useToast() {
  const contexte = useContext(ToastContexte);
  if (!contexte) {
    return {
      toasts: [],
      ajouterToast: emettreToast,
      afficherToast: emettreToast,
      afficherErreur: emettreErreur,
      afficherSucces: (msg, opts) => emettreToast({ type: 'succes', message: msg, ...opts }),
      afficherInfo: (msg, opts) => emettreToast({ type: 'info', message: msg, ...opts }),
      afficherAvertissement: (msg, opts) => emettreToast({ type: 'avertissement', message: msg, ...opts }),
      fermerToast: () => {},
    };
  }
  return contexte;
}
