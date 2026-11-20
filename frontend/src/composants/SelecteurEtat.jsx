import { ETATS, trouverEtat } from '../vinyles/constantes.js';
import BadgeEtat from './BadgeEtat.jsx';
import ChampFormulaire from './ChampFormulaire.jsx';

export default function SelecteurEtat({ id, libelle, valeur, erreur, onChange }) {
  const etatSelectionne = trouverEtat(valeur);

  return (
    <ChampFormulaire id={id} libelle={libelle} erreur={erreur}>
      <select
        id={id}
        value={valeur}
        onChange={onChange}
        aria-invalid={Boolean(erreur)}
        aria-describedby={erreur ? `${id}-erreur` : undefined}
      >
        <option value="">Non noté</option>
        {ETATS.map((etat) => (
          <option key={etat.code} value={etat.code}>
            {etat.code} ({etat.nom}) : {etat.description}
          </option>
        ))}
      </select>
      <div
        className="mt-1 flex min-h-8 flex-wrap items-center gap-2 rounded border border-ligne bg-papier/60 px-2.5 py-1.5"
        aria-live="polite"
      >
        <BadgeEtat code={valeur} />
        <span className="text-xs text-encre-douce">
          {etatSelectionne
            ? `${etatSelectionne.nom} — ${etatSelectionne.description}`
            : 'Aucune note sélectionnée'}
        </span>
      </div>
    </ChampFormulaire>
  );
}
