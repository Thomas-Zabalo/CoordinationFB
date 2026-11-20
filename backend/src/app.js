import cors from 'cors';
import express from 'express';
import { creerRoutesAuth } from './auth/routes.js';
import { creerRoutesSwagger } from './docs/routes.js';
import { ErreurApi, gestionnaireErreurs, routeIntrouvable } from './erreurs.js';
import { enTetesSecurite, limiteurRequetes, validerContentType, verifierOrigineCors } from './securite.js';
import { creerRoutesVinyles } from './vinyles/routes.js';

export function creerApp({
  db,
  corsOrigin,
  sessionDureeMs,
  activerLimiteur = !db?.memory && process.env.NODE_ENV !== 'test',
}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(enTetesSecurite);
  if (activerLimiteur) {
    app.use(limiteurRequetes);
  }
  app.use(cors({ origin: verifierOrigineCors(corsOrigin), credentials: true }));
  app.use(validerContentType);
  app.use(express.json({ limit: '50kb' }));

  const routesApi = express.Router();

  routesApi.get('/sante', (req, res) => {
    res.json({ statut: 'ok' });
  });
  routesApi.get('/test-erreur/:statut', (req, res, next) => {
    const statut = Number(req.params.statut);
    if (statut === 500) return next(new ErreurApi(500, 'Erreur interne du serveur (simulation backend 500)'));
    next(new ErreurApi(statut || 400, `Erreur ${statut || 400} de test générée par le serveur`));
  });
  routesApi.use(creerRoutesSwagger());
  routesApi.use('/auth', creerRoutesAuth(db, { dureeSessionMs: sessionDureeMs }));
  routesApi.use('/vinyles', creerRoutesVinyles(db));

  app.use('/api', routesApi);
  app.use(routesApi);
  app.use(routeIntrouvable);
  app.use(gestionnaireErreurs);

  return app;
}
