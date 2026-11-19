import { useEffect, useRef } from 'react';

function Icone({ type }) {
  if (type === 'succes') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 6l-8 8-4-4" />
      </svg>
    );
  }
  if (type === 'avertissement') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 3L2 17h16L10 3zm0 6v4m0 2h.01" />
      </svg>
    );
  }
  if (type === 'erreur') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="10" cy="10" r="8" />
        <line x1="10" y1="6" x2="10" y2="11" strokeLinecap="round" />
        <circle cx="10" cy="14" r="1" fill="currentColor" />
      </svg>
    );
  }
  // info par défaut
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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

  return (
    <div
      className={`toast toast--${type}`}
      role="status"
      aria-live={type === 'erreur' ? 'assertive' : 'polite'}
      onMouseEnter={arreterMinuteur}
      onMouseLeave={reprendreMinuteur}
    >
      <div className="toast__icone">
        <Icone type={type} />
      </div>
      <div className="toast__contenu">
        {titre && <strong className="toast__titre">{titre}</strong>}
        {message && <p className="toast__message">{message}</p>}
      </div>
      <button
        type="button"
        className="toast__fermer"
        aria-label="Fermer la notification"
        onClick={() => onFermer(id)}
      >
        ×
      </button>
    </div>
  );
}
