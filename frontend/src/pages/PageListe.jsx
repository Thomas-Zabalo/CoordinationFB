import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { listerGenres, listerVinyles } from '../api/vinyles.js';
import BarreFiltres from '../composants/BarreFiltres.jsx';
import MessageErreur from '../composants/MessageErreur.jsx';
import MessageSucces from '../composants/MessageSucces.jsx';
import TableauVinyles from '../composants/TableauVinyles.jsx';
import { LISTES } from '../vinyles/constantes.js';

const MESSAGES_LISTE_VIDE = {
  collection: "Votre collection est vide pour l'instant. Ajoutez votre premier vinyle !",
  envies: "Votre liste d'envies est vide. Notez ici les vinyles que vous recherchez.",
};

function compterVinyles(nombre) {
  return `${nombre} vinyle${nombre > 1 ? 's' : ''}`;
}

export default function PageListe({ liste }) {
  const [parametres, setParametres] = useSearchParams();
  const q = parametres.get('q') ?? '';
  const genre = parametres.get('genre') ?? '';
  const format = parametres.get('format') ?? '';
  const tri = parametres.get('tri') ?? 'dateAjout';
  const ordre = parametres.get('ordre') ?? (tri === 'dateAjout' ? 'desc' : 'asc');
  const cle = JSON.stringify([liste, q, genre, format, tri, ordre]);

  const [resultat, setResultat] = useState({ cle: null, vinyles: [], erreur: null });
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const controleur = new AbortController();
    const cleRequete = JSON.stringify([liste, q, genre, format, tri, ordre]);
    listerVinyles({ liste, q, genre, format, tri, ordre }, controleur.signal)
      .then((vinyles) => setResultat({ cle: cleRequete, vinyles, erreur: null }))
      .catch((erreur) => {
        if (!controleur.signal.aborted) setResultat({ cle: cleRequete, vinyles: [], erreur });
      });
    return () => controleur.abort();
  }, [liste, q, genre, format, tri, ordre]);

  useEffect(() => {
    const controleur = new AbortController();
    listerGenres(liste, controleur.signal)
      .then(setGenres)
      .catch(() => {
        // Sans la liste des genres, le filtre reste simplement vide.
      });
    return () => controleur.abort();
  }, [liste]);

  const modifierFiltre = useCallback(
    (nom, valeur) => {
      setParametres(
        (precedents) => {
          const suivants = new URLSearchParams(precedents);
          if (valeur) suivants.set(nom, valeur);
          else suivants.delete(nom);
          if (nom === 'tri') suivants.delete('ordre');
          return suivants;
        },
        { replace: true },
      );
    },
    [setParametres],
  );

  const chargement = resultat.cle !== cle;
  const filtresActifs = Boolean(q || genre || format);
  const { titre } = LISTES[liste];

  return (
    <>
      <div className="entete-page">
        <div>
          <h1>{titre}</h1>
          {!chargement && !resultat.erreur && <p className="text-secondary">{compterVinyles(resultat.vinyles.length)}</p>}
        </div>
        <Link to={`/vinyles/nouveau?liste=${liste}`} className="btn btn-cta">
          Ajouter un vinyle
        </Link>
      </div>

      <MessageSucces />
      <BarreFiltres filtres={{ q, genre, format, tri, ordre }} genres={genres} onChange={modifierFiltre} />

      <MessageErreur erreur={!chargement && resultat.erreur} />

      {chargement && resultat.vinyles.length === 0 && <p className="text-secondary">Chargement…</p>}

      {!chargement && !resultat.erreur && resultat.vinyles.length === 0 && (
        <div className="alert alert-info">
          {filtresActifs ? 'Aucun vinyle ne correspond à votre recherche.' : MESSAGES_LISTE_VIDE[liste]}
        </div>
      )}

      {resultat.vinyles.length > 0 && (
        <div aria-busy={chargement}>
          <TableauVinyles vinyles={resultat.vinyles} />
        </div>
      )}
    </>
  );
}
