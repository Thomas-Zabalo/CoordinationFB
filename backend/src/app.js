import cors from 'cors';
import express from 'express';
import { ErreurApi, erreurInterdit, erreurIntrouvable, gestionnaireErreurs, routeIntrouvable } from './erreurs.js';
import { enTetesSecurite, limiteurRequetes, validerContentType, verifierOrigineCors } from './securite.js';
import { creerRoutesVinyles } from './vinyles/routes.js';

export function creerApp({
  db,
  corsOrigin,
  activerLimiteur = !db?.memory && process.env.NODE_ENV !== 'test',
}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(enTetesSecurite);
  if (activerLimiteur) {
    app.use(limiteurRequetes);
  }
  app.use(cors({ origin: verifierOrigineCors(corsOrigin) }));
  app.use(validerContentType);
  app.use(express.json({ limit: '50kb' }));

  app.get('/sante', (req, res) => {
    res.json({ statut: 'ok' });
  });
  app.get('/test-erreur/:statut', (req, res, next) => {
    const statut = Number(req.params.statut);
    if (statut === 403) return next(erreurInterdit('Accès interdit : permission refusée (simulation backend)'));
    if (statut === 404) return next(erreurIntrouvable('Ressource de test introuvable (simulation backend 404)'));
    if (statut === 500) return next(new ErreurApi(500, 'Erreur interne du serveur (simulation backend 500)'));
    next(new ErreurApi(statut || 400, `Erreur ${statut || 400} de test générée par le serveur`));
  });
  app.use('/vinyles', creerRoutesVinyles(db));

  app.use(routeIntrouvable);
  app.use(gestionnaireErreurs);

  return app;
}
