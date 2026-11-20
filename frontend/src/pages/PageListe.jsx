import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { listerGenres, listerVinyles } from '../api/vinyles.js';
import BarreFiltres from '../composants/BarreFiltres.jsx';
import CarteVinyle from '../composants/CarteVinyle.jsx';
import MessageErreur from '../composants/MessageErreur.jsx';
import MessageSucces from '../composants/MessageSucces.jsx';
import TableauVinyles from '../composants/TableauVinyles.jsx';
import { useToast } from '../composants/toastContexte.js';
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
  const [affichage, setAffichage] = useState('grille');
  const { afficherErreur } = useToast();

  useEffect(() => {
    if (resultat.cle === cle && resultat.erreur) {
      afficherErreur(resultat.erreur);
    }
  }, [resultat, cle, afficherErreur]);

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
  const vinyles = useMemo(() => (Array.isArray(resultat.vinyles) ? resultat.vinyles : []), [resultat.vinyles]);
  const estEnvies = liste === 'envies';
  const { titre, description } = LISTES[liste];

  const metriques = useMemo(() => {
    const artistesUniques = new Set(vinyles.map((v) => v.artiste?.trim().toLowerCase()).filter(Boolean)).size;
    const formatsUniques = new Set(vinyles.map((v) => v.format).filter(Boolean)).size;
    return {
      total: vinyles.length,
      artistes: artistesUniques,
      genres: genres.length,
      formats: formatsUniques,
    };
  }, [vinyles, genres]);

  return (
    <>
      <header className="mb-8 border-b border-ligne pb-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-terre">
              {estEnvies ? '02 / Wantlist' : '01 / Catalogue'}
            </p>
            <h1 className="mt-2 font-serif text-3xl leading-tight font-bold text-encre sm:text-[40px]">{titre}</h1>
            <p className="mt-2 text-sm text-encre-douce">{description}</p>
          </div>

          <Link
            to={`/vinyles/nouveau?liste=${liste}`}
            className="inline-flex h-[42px] items-center gap-2 rounded-md bg-terre px-5 text-sm font-semibold text-white no-underline transition-colors hover:bg-terre-fonce"
          >
            <span aria-hidden="true" className="text-base leading-none">
              +
            </span>
            Ajouter un vinyle
          </Link>
        </div>

        {!chargement && !resultat.erreur && (
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-xl">
            <div className="rounded-md border border-ligne bg-carte px-4 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-encre-douce">
                {estEnvies ? 'Disques recherchés' : 'Disques sur l’étagère'}
              </dt>
              <dd className="mt-1 font-serif text-lg font-bold text-encre">{compterVinyles(metriques.total)}</dd>
            </div>
            <div className="rounded-md border border-ligne bg-carte px-4 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-encre-douce">Artistes uniques</dt>
              <dd className="mt-1 font-serif text-lg font-bold text-encre">{metriques.artistes}</dd>
            </div>
            <div className="col-span-2 rounded-md border border-ligne bg-carte px-4 py-3 sm:col-span-1">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-encre-douce">Genres</dt>
              <dd className="mt-1 font-serif text-lg font-bold text-encre">{metriques.genres}</dd>
            </div>
          </dl>
        )}
      </header>

      <MessageSucces />

      <BarreFiltres
        filtres={{ q, genre, format, tri, ordre }}
        genres={genres}
        onChange={modifierFiltre}
        affichage={affichage}
        onChangerAffichage={setAffichage}
      />

      <MessageErreur erreur={!chargement && resultat.erreur} />

      {chargement && vinyles.length === 0 && (
        <p className="py-8 font-mono text-xs uppercase tracking-widest text-encre-douce" role="status">
          Chargement…
        </p>
      )}

      {!chargement && !resultat.erreur && vinyles.length === 0 && (
        <div className="rounded-lg border border-dashed border-ligne bg-carte px-6 py-12 text-center">
          <p className="font-serif text-lg text-encre">
            {filtresActifs ? 'Aucun vinyle ne correspond à votre recherche.' : MESSAGES_LISTE_VIDE[liste]}
          </p>
          {!filtresActifs && (
            <p className="mt-2 text-sm text-encre-douce">
              Commencez par cataloguer un pressage avec sa référence et son évaluation Goldmine.
            </p>
          )}
        </div>
      )}

      {vinyles.length > 0 && (
        <div
          aria-busy={chargement}
          className={estEnvies ? 'grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_290px]' : ''}
        >
          <div>
            {affichage === 'grille' ? (
              <div
                className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${
                  estEnvies ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'
                }`}
              >
                {vinyles.map((vinyle) => (
                  <CarteVinyle key={vinyle.id} vinyle={vinyle} />
                ))}
              </div>
            ) : (
              <TableauVinyles vinyles={vinyles} />
            )}
          </div>

          {estEnvies && (
            <aside className="rounded-lg border border-ligne bg-carte p-5 shadow-2xs lg:sticky lg:top-24">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-terre">
                Synthèse wantlist
              </p>
              <h2 className="mt-1.5 font-serif text-lg font-bold text-encre">Critères de recherche</h2>
              <p className="mt-2 text-xs leading-relaxed text-encre-douce">
                Gardez une trace précise des pressages recherchés. Dès qu’un disque rejoint vos étagères, basculez-le
                en un clic vers votre collection depuis sa fiche.
              </p>

              <dl className="mt-4 space-y-2.5 border-t border-ligne pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-encre-douce">Pressages suivis</dt>
                  <dd className="font-mono font-semibold text-encre">{metriques.total}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-encre-douce">Artistes</dt>
                  <dd className="font-mono font-semibold text-encre">{metriques.artistes}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-encre-douce">Formats visés</dt>
                  <dd className="font-mono font-semibold text-encre">{metriques.formats}</dd>
                </div>
              </dl>

              {genres.length > 0 && (
                <div className="mt-4 border-t border-ligne pt-4">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-encre-douce">
                    Genres recherchés
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {genres.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => modifierFiltre('genre', genre === g ? '' : g)}
                        className={`inline-flex h-6 cursor-pointer items-center rounded border px-2 font-mono text-[11px] transition-colors ${
                          genre === g
                            ? 'border-terre bg-terre text-white'
                            : 'border-ligne bg-papier text-encre hover:border-encre'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      )}
    </>
  );
}
