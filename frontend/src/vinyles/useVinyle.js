import { useEffect, useState } from 'react';
import { recupererVinyle } from '../api/vinyles.js';

export function useVinyle(id) {
  const [resultat, setResultat] = useState({ id: null, vinyle: null, erreur: null });

  useEffect(() => {
    const controleur = new AbortController();
    recupererVinyle(id, controleur.signal)
      .then((vinyle) => setResultat({ id, vinyle, erreur: null }))
      .catch((erreur) => {
        if (!controleur.signal.aborted) setResultat({ id, vinyle: null, erreur });
      });
    return () => controleur.abort();
  }, [id]);

  const estAJour = resultat.id === id;
  return {
    vinyle: estAJour ? resultat.vinyle : null,
    erreur: estAJour ? resultat.erreur : null,
    chargement: !estAJour,
  };
}
