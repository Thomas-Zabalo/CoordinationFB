import { useEffect, useMemo, useState } from 'react';
import { obtenirUtilisateur } from '../api/auth.js';
import { ErreurApi } from '../api/requete.js';
import { useToast } from '../composants/toastContexte.js';
import { contexteAuthentification } from './authentificationContexte.js';

export function FournisseurAuthentification({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const { afficherErreur } = useToast();

  useEffect(() => {
    const controleur = new AbortController();
    obtenirUtilisateur(controleur.signal)
      .then((utilisateurCourant) => {
        if (!controleur.signal.aborted) setUtilisateur(utilisateurCourant);
      })
      .catch((erreur) => {
        if (controleur.signal.aborted) return;
        if (!(erreur instanceof ErreurApi && erreur.statut === 401)) afficherErreur(erreur);
      })
      .finally(() => {
        if (!controleur.signal.aborted) setChargement(false);
      });

    return () => controleur.abort();
  }, [afficherErreur]);

  const valeur = useMemo(
    () => ({ utilisateur, setUtilisateur, chargement }),
    [utilisateur, chargement],
  );

  return <contexteAuthentification.Provider value={valeur}>{children}</contexteAuthentification.Provider>;
}
