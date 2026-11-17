export class ErreurApi extends Error {
  constructor(statut, message, details) {
    super(message);
    this.statut = statut;
    this.details = details;
  }
}

export function erreurValidation(details) {
  return new ErreurApi(400, 'Certains champs sont invalides', details);
}

export function erreurIntrouvable(message = 'Ressource introuvable') {
  return new ErreurApi(404, message);
}

export function routeIntrouvable(req, res, next) {
  next(erreurIntrouvable(`Route introuvable : ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars -- Express reconnaît un gestionnaire d'erreurs à ses 4 paramètres.
export function gestionnaireErreurs(erreur, req, res, next) {
  if (erreur.type === 'entity.parse.failed') {
    res.status(400).json({ erreur: { message: 'Le corps de la requête doit être un JSON valide' } });
    return;
  }

  if (erreur instanceof ErreurApi) {
    res.status(erreur.statut).json({ erreur: { message: erreur.message, details: erreur.details } });
    return;
  }

  console.error(erreur);
  res.status(500).json({ erreur: { message: 'Erreur interne du serveur' } });
}
