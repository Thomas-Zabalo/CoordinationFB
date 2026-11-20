import { useEffect, useState } from 'react';
import { FORMATS, TRIS } from '../vinyles/constantes.js';

const DELAI_RECHERCHE_MS = 300;

export default function BarreFiltres({ filtres, genres, onChange, affichage = 'grille', onChangerAffichage }) {
  const [recherche, setRecherche] = useState(filtres.q);

  // Attend que l'utilisateur ait fini de taper pour ne pas lancer une requête par touche.
  useEffect(() => {
    if (recherche === filtres.q) return undefined;
    const minuteur = setTimeout(() => onChange('q', recherche), DELAI_RECHERCHE_MS);
    return () => clearTimeout(minuteur);
  }, [recherche, filtres.q, onChange]);

  return (
    <form
      className="mb-6 grid grid-cols-1 items-end gap-4 rounded-lg border border-ligne bg-carte p-4 shadow-2xs sm:grid-cols-2 lg:grid-cols-[2fr_repeat(3,minmax(145px,1fr))_auto]"
      role="search"
      onSubmit={(evenement) => evenement.preventDefault()}
    >
      <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
        <label
          htmlFor="filtre-recherche"
          className="font-mono text-[11px] font-medium uppercase tracking-widest text-encre-douce"
        >
          Rechercher
        </label>
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-encre-douce"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="M13.5 13.5L17 17" strokeLinecap="round" />
          </svg>
          <input
            id="filtre-recherche"
            type="search"
            placeholder="Artiste, titre, label, n° de catalogue…"
            value={recherche}
            onChange={(evenement) => setRecherche(evenement.target.value)}
            className="!pl-9"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <label
          htmlFor="filtre-genre"
          className="font-mono text-[11px] font-medium uppercase tracking-widest text-encre-douce"
        >
          Genre
        </label>
        <select
          id="filtre-genre"
          value={filtres.genre}
          onChange={(evenement) => onChange('genre', evenement.target.value)}
        >
          <option value="">Tous</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <label
          htmlFor="filtre-format"
          className="font-mono text-[11px] font-medium uppercase tracking-widest text-encre-douce"
        >
          Format
        </label>
        <select
          id="filtre-format"
          value={filtres.format}
          onChange={(evenement) => onChange('format', evenement.target.value)}
        >
          <option value="">Tous</option>
          {FORMATS.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <label
          htmlFor="filtre-tri"
          className="font-mono text-[11px] font-medium uppercase tracking-widest text-encre-douce"
        >
          Trier par
        </label>
        <div className="flex gap-2">
          <select
            id="filtre-tri"
            value={filtres.tri}
            onChange={(evenement) => onChange('tri', evenement.target.value)}
          >
            {TRIS.map((tri) => (
              <option key={tri.valeur} value={tri.valeur}>
                {tri.libelle}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onChange('ordre', filtres.ordre === 'asc' ? 'desc' : 'asc')}
            aria-label={
              filtres.ordre === 'asc'
                ? 'Ordre croissant, passer en décroissant'
                : 'Ordre décroissant, passer en croissant'
            }
            className="inline-flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-ligne bg-papier font-mono text-base font-semibold text-encre transition-colors hover:border-encre hover:bg-carte"
          >
            {filtres.ordre === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {onChangerAffichage && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-encre-douce">Vue</span>
          <div
            className="inline-flex h-[42px] items-center rounded-md border border-ligne bg-papier p-1"
            role="group"
            aria-label="Mode d’affichage"
          >
            <button
              type="button"
              onClick={() => onChangerAffichage('grille')}
              aria-pressed={affichage === 'grille'}
              className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded px-2.5 font-mono text-xs uppercase transition-colors ${
                affichage === 'grille'
                  ? 'bg-encre font-semibold text-papier'
                  : 'text-encre-douce hover:text-encre'
              }`}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
                <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
                <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
                <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
              </svg>
              Grille
            </button>
            <button
              type="button"
              onClick={() => onChangerAffichage('liste')}
              aria-pressed={affichage === 'liste'}
              className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded px-2.5 font-mono text-xs uppercase transition-colors ${
                affichage === 'liste'
                  ? 'bg-encre font-semibold text-papier'
                  : 'text-encre-douce hover:text-encre'
              }`}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <rect x="1.5" y="2.5" width="13" height="2" rx="0.75" />
                <rect x="1.5" y="7" width="13" height="2" rx="0.75" />
                <rect x="1.5" y="11.5" width="13" height="2" rx="0.75" />
              </svg>
              Liste
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
