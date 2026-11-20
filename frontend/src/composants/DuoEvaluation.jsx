import BadgeEtat from './BadgeEtat.jsx';

// Règle DESIGN.md : ne jamais fusionner la note du média et celle de la pochette.
export default function DuoEvaluation({ etatDisque, etatPochette, compact = false }) {
  return (
    <div className={`grid grid-cols-2 ${compact ? 'gap-2' : 'gap-3'}`}>
      <div className="flex items-center justify-between gap-2 rounded border border-ligne bg-papier/60 px-2.5 py-1.5">
        <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-encre-douce">Média</span>
        <BadgeEtat code={etatDisque} />
      </div>
      <div className="flex items-center justify-between gap-2 rounded border border-ligne bg-papier/60 px-2.5 py-1.5">
        <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-encre-douce">Pochette</span>
        <BadgeEtat code={etatPochette} />
      </div>
    </div>
  );
}
