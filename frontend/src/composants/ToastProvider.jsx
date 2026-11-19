import { useCallback, useEffect, useMemo, useState } from 'react';
import { resoudreErreur } from '../erreurs/gestionnaireErreurs.js';
import { EVENEMENT_TOAST, genererIdToast, ToastContexte } from './toastContexte.js';

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const fermerToast = useCallback((id) => {
    setToasts((precedents) => precedents.filter((toast) => toast.id !== id));
  }, []);

  const ajouterToast = useCallback((options) => {
    const nouveauToast = {
      id: options.id ?? genererIdToast(),
      type: options.type ?? 'info',
      titre: options.titre ?? null,
      message: options.message ?? '',
      duree: options.duree ?? 5000,
      ...options,
    };

    setToasts((precedents) => [...precedents, nouveauToast]);
    return nouveauToast.id;
  }, []);

  const afficherErreur = useCallback(
    (erreur, options = {}) => {
      const resolue = resoudreErreur(erreur, options.message);
      return ajouterToast({
        type: 'erreur',
        titre: options.titre ?? resolue.titre,
        message: options.message ?? resolue.message,
        duree: options.duree ?? 6000,
        ...options,
      });
    },
    [ajouterToast],
  );

  const afficherSucces = useCallback(
    (message, options = {}) => {
      return ajouterToast({
        type: 'succes',
        titre: options.titre ?? 'Succès',
        message: typeof message === 'string' ? message : message?.message ?? '',
        duree: options.duree ?? 4000,
        ...options,
      });
    },
    [ajouterToast],
  );

  const afficherInfo = useCallback(
    (message, options = {}) => {
      return ajouterToast({
        type: 'info',
        titre: options.titre ?? 'Information',
        message: typeof message === 'string' ? message : message?.message ?? '',
        duree: options.duree ?? 4000,
        ...options,
      });
    },
    [ajouterToast],
  );

  const afficherAvertissement = useCallback(
    (message, options = {}) => {
      return ajouterToast({
        type: 'avertissement',
        titre: options.titre ?? 'Attention',
        message: typeof message === 'string' ? message : message?.message ?? '',
        duree: options.duree ?? 5000,
        ...options,
      });
    },
    [ajouterToast],
  );

  useEffect(() => {
    function intercepterEvenement(evenement) {
      if (evenement.detail) {
        ajouterToast(evenement.detail);
      }
    }
    window.addEventListener(EVENEMENT_TOAST, intercepterEvenement);
    return () => {
      window.removeEventListener(EVENEMENT_TOAST, intercepterEvenement);
    };
  }, [ajouterToast]);

  const valeur = useMemo(
    () => ({
      toasts,
      ajouterToast,
      afficherToast: ajouterToast,
      afficherErreur,
      afficherSucces,
      afficherInfo,
      afficherAvertissement,
      fermerToast,
    }),
    [toasts, ajouterToast, afficherErreur, afficherSucces, afficherInfo, afficherAvertissement, fermerToast],
  );

  return <ToastContexte.Provider value={valeur}>{children}</ToastContexte.Provider>;
}
