import { obtenirMessageErreur } from '../erreurs/gestionnaireErreurs.js';

export default function MessageErreur({ erreur }) {
  if (!erreur) return null;
  const message = obtenirMessageErreur(erreur);
  return (
    <div className="alert alert-erreur" role="alert">
      {message}
    </div>
  );
}
