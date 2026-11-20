import { trouverEtat } from '../vinyles/constantes.js';

const STYLES_NIVEAUX = {
  M: 'bg-qualite text-white border-qualite',
  NM: 'bg-qualite-clair text-qualite border-qualite/30',
  'VG+': 'bg-papier text-encre border-encre/20',
  VG: 'bg-papier-alt text-encre border-ligne',
  'G+': 'bg-amber-50 text-amber-900 border-amber-300/70',
  G: 'bg-amber-50/70 text-amber-900 border-amber-200',
  F: 'bg-danger-clair text-danger border-danger/25',
  P: 'bg-danger-clair text-danger border-danger/40',
};

export default function BadgeEtat({ code }) {
  const etat = trouverEtat(code);
  if (!etat) {
    return (
      <span className="inline-flex h-6 items-center font-mono text-[11px] uppercase tracking-wider text-encre-douce italic">
        Non noté
      </span>
    );
  }

  return (
    <span
      className={`inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded border px-2 font-mono text-[11px] font-semibold uppercase tracking-wider ${STYLES_NIVEAUX[etat.code]}`}
      title={`${etat.nom} : ${etat.description}`}
    >
      {etat.code}
    </span>
  );
}
