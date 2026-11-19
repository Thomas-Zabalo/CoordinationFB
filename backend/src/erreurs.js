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

export function erreurNonAutorise(message = 'Authentification requise') {
  return new ErreurApi(401, message);
}

export function erreurInterdit(message = 'Accès interdit') {
  return new ErreurApi(403, message);
}

export function erreurIntrouvable(message = 'Ressource introuvable') {
  return new ErreurApi(404, message);
}

export function erreurTropDeRequetes(message = 'Trop de requêtes, veuillez patienter avant de réessayer.') {
  return new ErreurApi(429, message);
}

export function erreurConflit(message = 'Action impossible en raison d’un conflit.') {
  return new ErreurApi(409, message);
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

  if (erreur.type === 'entity.too.large' || erreur.status === 413) {
    res.status(413).json({ erreur: { message: 'La taille de la requête dépasse la limite autorisée' } });
    return;
  }

  if (erreur instanceof ErreurApi) {
    res.status(erreur.statut).json({ erreur: { message: erreur.message, details: erreur.details } });
    return;
  }

  if (erreur.code === 'SQLITE_BUSY' || erreur.code === 'SQLITE_LOCKED') {
    res.status(503).json({ erreur: { message: 'Base de données momentanément occupée, veuillez réessayer' } });
    return;
  }

  console.error(erreur);
  res.status(500).json({ erreur: { message: 'Erreur interne du serveur' } });
}
