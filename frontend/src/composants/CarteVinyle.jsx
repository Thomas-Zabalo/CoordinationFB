import { Link, useNavigate } from 'react-router';
import DuoEvaluation from './DuoEvaluation.jsx';
import PochetteVinyle from './PochetteVinyle.jsx';

export default function CarteVinyle({ vinyle }) {
  const naviguer = useNavigate();

  return (
    <article
      onClick={() => naviguer(`/vinyles/${vinyle.id}`)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-ligne bg-carte p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-encre/30 hover:shadow-md"
    >
      <PochetteVinyle vinyle={vinyle} />

      <div className="mt-3.5 flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-wider text-encre-douce">
          <span className="truncate">{vinyle.artiste || '—'}</span>
          {vinyle.annee && <span className="shrink-0">{vinyle.annee}</span>}
        </div>

        <h2 className="mt-1 font-serif text-base leading-snug font-bold text-encre">
          <Link
            to={`/vinyles/${vinyle.id}`}
            onClick={(evenement) => evenement.stopPropagation()}
            className="text-encre no-underline transition-colors group-hover:text-terre hover:underline"
          >
            {vinyle.titre || 'Sans titre'}
          </Link>
        </h2>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-encre-douce">
          {vinyle.numeroCatalogue && (
            <span className="rounded bg-papier px-1.5 py-0.5 text-encre">{vinyle.numeroCatalogue}</span>
          )}
          {(vinyle.format || vinyle.taille) && (
            <span className="rounded bg-papier px-1.5 py-0.5">
              {[vinyle.format, vinyle.taille].filter(Boolean).join(' ')}
            </span>
          )}
          {vinyle.genre && <span className="truncate">{vinyle.genre}</span>}
        </div>

        <div className="mt-auto pt-3.5">
          <DuoEvaluation etatDisque={vinyle.etatDisque} etatPochette={vinyle.etatPochette} compact />
        </div>
      </div>
    </article>
  );
}
