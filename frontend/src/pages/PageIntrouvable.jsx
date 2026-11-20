import { Link } from 'react-router';

export default function PageIntrouvable() {
  return (
    <div className="mx-auto max-w-lg rounded-lg border border-ligne bg-carte px-8 py-12 text-center shadow-2xs">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-terre">Erreur 404</p>
      <h1 className="mt-2 font-serif text-3xl font-bold text-encre">Page introuvable</h1>
      <p className="mt-3 text-sm text-encre-douce">Cette page n’existe pas ou a été déplacée.</p>
      <Link
        to="/collection"
        className="mt-6 inline-flex h-[42px] items-center justify-center rounded-md bg-terre px-5 text-sm font-semibold text-white no-underline transition-colors hover:bg-terre-fonce"
      >
        Retour à ma collection
      </Link>
    </div>
  );
}
