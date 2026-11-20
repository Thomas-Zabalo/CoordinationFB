import { obtenirMessageErreur } from '../erreurs/gestionnaireErreurs.js';

export default function MessageErreur({ erreur }) {
  if (!erreur) return null;
  const message = obtenirMessageErreur(erreur);
  return (
    <div
      className="mb-5 flex items-start gap-3 rounded-md border border-danger/30 border-l-4 border-l-danger bg-danger-clair px-4 py-3 text-sm font-medium text-danger"
      role="alert"
    >
      <span aria-hidden="true" className="mt-0.5 font-mono text-xs font-bold">
        !
      </span>
      <span>{message}</span>
    </div>
  );
}
