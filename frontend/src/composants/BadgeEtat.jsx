import { trouverEtat } from '../vinyles/constantes.js';

const NIVEAUX = {
  M: 'excellent',
  NM: 'excellent',
  'VG+': 'bon',
  VG: 'bon',
  'G+': 'moyen',
  G: 'moyen',
  F: 'mauvais',
  P: 'mauvais',
};

export default function BadgeEtat({ code }) {
  const etat = trouverEtat(code);
  if (!etat) return <span className="badge-etat badge-etat--vide">Non noté</span>;

  return (
    <span className={`badge-etat badge-etat--${NIVEAUX[etat.code]}`} title={`${etat.nom} : ${etat.description}`}>
      {etat.code}
    </span>
  );
}
