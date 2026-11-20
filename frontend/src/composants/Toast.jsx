import { useEffect, useRef } from 'react';

const STYLES_TYPE = {
  erreur: 'border-l-danger bg-danger-clair text-encre',
  succes: 'border-l-qualite bg-qualite-clair text-encre',
  avertissement: 'border-l-terre bg-terre-clair text-encre',
  info: 'border-l-encre bg-carte text-encre',
};

const COULEURS_ICONE = {
  erreur: 'text-danger',
  succes: 'text-qualite',
  avertissement: 'text-terre',
  info: 'text-encre',
};

function Icone({ type }) {
  if (type === 'succes') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 6l-8 8-4-4" />
      </svg>
    );
  }
  if (type === 'avertissement') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 3L2 17h16L10 3zm0 6v4m0 2h.01" />
      </svg>
    );
  }
  if (type === 'erreur') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <circle cx="10" cy="10" r="8" />
        <line x1="10" y1="6" x2="10" y2="11" strokeLinecap="round" />
        <circle cx="10" cy="14" r="1" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <circle cx="10" cy="10" r="8" />
      <line x1="10" y1="9" x2="10" y2="14" strokeLinecap="round" />
      <circle cx="10" cy="6" r="1" fill="currentColor" />
    </svg>
  );
}

export default function Toast({ toast, onFermer }) {
  const { id, titre, message, type = 'info', duree = 5000 } = toast;
  const minuteurRef = useRef(null);

  useEffect(() => {
    if (duree > 0) {
      minuteurRef.current = setTimeout(() => {
        onFermer(id);
      }, duree);
    }
    return () => {
      if (minuteurRef.current) {
        clearTimeout(minuteurRef.current);
      }
    };
  }, [id, duree, onFermer]);

  function arreterMinuteur() {
    if (minuteurRef.current) {
      clearTimeout(minuteurRef.current);
      minuteurRef.current = null;
    }
  }

  function reprendreMinuteur() {
    if (duree > 0 && !minuteurRef.current) {
      minuteurRef.current = setTimeout(() => {
        onFermer(id);
      }, duree);
    }
  }

  const styleType = STYLES_TYPE[type] ?? STYLES_TYPE.info;
  const couleurIcone = COULEURS_ICONE[type] ?? COULEURS_ICONE.info;

  return (
    <div
      className={`toast toast--${type} pointer-events-auto flex items-start gap-3 rounded-lg border border-ligne border-l-4 px-4 py-3.5 shadow-lg ${styleType}`}
      role="status"
      aria-live={type === 'erreur' ? 'assertive' : 'polite'}
      onMouseEnter={arreterMinuteur}
      onMouseLeave={reprendreMinuteur}
    >
      <div className={`mt-0.5 shrink-0 ${couleurIcone}`}>
        <Icone type={type} />
      </div>
      <div className="min-w-0 flex-1">
        {titre && <strong className="block text-sm font-semibold text-encre">{titre}</strong>}
        {message && <p className="mt-0.5 mb-0 text-xs leading-relaxed text-encre-douce">{message}</p>}
      </div>
      <button
        type="button"
        aria-label="Fermer la notification"
        onClick={() => onFermer(id)}
        className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-lg leading-none text-encre-douce transition-colors hover:bg-encre/10 hover:text-encre"
      >
        ×
      </button>
    </div>
  );
}
