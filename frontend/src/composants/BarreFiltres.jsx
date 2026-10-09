import { useEffect, useState } from 'react';
import { FORMATS, TRIS } from '../vinyles/constantes.js';

const DELAI_RECHERCHE_MS = 300;

export default function BarreFiltres({ filtres, genres, onChange }) {
  const [recherche, setRecherche] = useState(filtres.q);

  // Attend que l'utilisateur ait fini de taper pour ne pas lancer une requête par touche.
  useEffect(() => {
    if (recherche === filtres.q) return undefined;
    const minuteur = setTimeout(() => onChange('q', recherche), DELAI_RECHERCHE_MS);
    return () => clearTimeout(minuteur);
  }, [recherche, filtres.q, onChange]);

  return (
    <form className="filtres card" role="search" onSubmit={(evenement) => evenement.preventDefault()}>
      <div className="champ champ--large">
        <label htmlFor="filtre-recherche">Rechercher</label>
        <input
          id="filtre-recherche"
          type="search"
          placeholder="Artiste, titre, label, n° de catalogue…"
          value={recherche}
          onChange={(evenement) => setRecherche(evenement.target.value)}
        />
      </div>

      <div className="champ">
        <label htmlFor="filtre-genre">Genre</label>
        <select id="filtre-genre" value={filtres.genre} onChange={(evenement) => onChange('genre', evenement.target.value)}>
          <option value="">Tous</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="champ">
        <label htmlFor="filtre-format">Format</label>
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

      <div className="champ">
        <label htmlFor="filtre-tri">Trier par</label>
        <div className="champ__groupe">
          <select id="filtre-tri" value={filtres.tri} onChange={(evenement) => onChange('tri', evenement.target.value)}>
            {TRIS.map((tri) => (
              <option key={tri.valeur} value={tri.valeur}>
                {tri.libelle}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-outline btn-icone"
            onClick={() => onChange('ordre', filtres.ordre === 'asc' ? 'desc' : 'asc')}
            aria-label={filtres.ordre === 'asc' ? 'Ordre croissant, passer en décroissant' : 'Ordre décroissant, passer en croissant'}
          >
            {filtres.ordre === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
    </form>
  );
}
