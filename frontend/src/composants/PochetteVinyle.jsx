const PALETTES_POCHETTE = [
  { fond: '#23201D', accent: '#C84B22', texte: '#F6F4EE', secondaire: '#B9B2A6' },
  { fond: '#24352B', accent: '#D8A35D', texte: '#F6F4EE', secondaire: '#A9BFB1' },
  { fond: '#2E2326', accent: '#D46A44', texte: '#F6F4EE', secondaire: '#C9B3B8' },
  { fond: '#1F2A33', accent: '#C84B22', texte: '#F6F4EE', secondaire: '#A3B4C2' },
  { fond: '#3C2F22', accent: '#E09F3E', texte: '#F6F4EE', secondaire: '#C8B9A6' },
  { fond: '#292927', accent: '#5D8A6E', texte: '#F6F4EE', secondaire: '#B4B3AE' },
  { fond: '#44261E', accent: '#E6B89C', texte: '#F6F4EE', secondaire: '#D4B5AC' },
  { fond: '#2B303A', accent: '#D97236', texte: '#F6F4EE', secondaire: '#B2B8C4' },
];

function calculerEmpreinte(texte) {
  let somme = 0;
  for (let i = 0; i < texte.length; i += 1) {
    somme = (somme * 31 + texte.charCodeAt(i)) >>> 0;
  }
  return somme;
}

export default function PochetteVinyle({ vinyle, taille = 'carte' }) {
  const cle = `${vinyle.artiste || ''}-${vinyle.titre || ''}-${vinyle.annee || ''}`;
  const empreinte = calculerEmpreinte(cle);
  const palette = PALETTES_POCHETTE[empreinte % PALETTES_POCHETTE.length];
  const estHero = taille === 'hero';

  return (
    <div
      className={`group/pochette relative aspect-square w-full overflow-hidden rounded-md border border-encre/10 select-none ${
        estHero ? 'shadow-md' : ''
      }`}
      style={{ backgroundColor: palette.fond }}
      aria-hidden="true"
    >
      {/* Sillons de vinyle subtils en arrière-plan */}
      <svg
        viewBox="0 0 240 240"
        className="pointer-events-none absolute -right-10 -bottom-10 h-4/5 w-4/5 opacity-25 transition-transform duration-500 ease-out group-hover/pochette:translate-x-1 group-hover/pochette:rotate-6"
      >
        <circle cx="120" cy="120" r="114" fill="#111111" />
        <circle cx="120" cy="120" r="96" fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1" />
        <circle cx="120" cy="120" r="78" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1" />
        <circle cx="120" cy="120" r="60" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1" />
        <circle cx="120" cy="120" r="36" fill={palette.accent} />
        <circle cx="120" cy="120" r="7" fill={palette.fond} />
      </svg>

      {/* Bandeau éditorial supérieur */}
      <div
        className={`relative z-10 flex h-full flex-col justify-between ${estHero ? 'p-7' : 'p-4'}`}
        style={{ color: palette.texte }}
      >
        <div className="flex items-start justify-between gap-2">
          <span
            className="truncate font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: palette.secondaire }}
          >
            {vinyle.label || vinyle.genre || 'RECORDS ARCHIVE'}
          </span>
          {vinyle.numeroCatalogue && (
            <span
              className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
              style={{ borderColor: `${palette.secondaire}55`, color: palette.texte }}
            >
              {vinyle.numeroCatalogue}
            </span>
          )}
        </div>

        {/* Filet d'accentuation éditorial */}
        <div className="my-auto py-3">
          <div className="mb-3 h-0.5 w-10" style={{ backgroundColor: palette.accent }} />
          <p
            className={`truncate font-mono uppercase tracking-[0.14em] ${estHero ? 'text-xs' : 'text-[10px]'}`}
            style={{ color: palette.secondaire }}
          >
            {vinyle.artiste || 'Artiste inconnu'}
          </p>
          <p
            className={`mt-1 line-clamp-2 font-serif leading-snug font-bold ${
              estHero ? 'text-2xl sm:text-3xl' : 'text-base'
            }`}
          >
            {vinyle.titre || 'Sans titre'}
          </p>
        </div>

        <div className="flex items-center justify-between border-t pt-2.5 font-mono text-[10px] uppercase tracking-widest" style={{ borderColor: `${palette.secondaire}33`, color: palette.secondaire }}>
          <span>{[vinyle.format, vinyle.taille].filter(Boolean).join(' / ') || '33 TOURS'}</span>
          <span>{vinyle.annee ?? 'PRESSING'}</span>
        </div>
      </div>
    </div>
  );
}
