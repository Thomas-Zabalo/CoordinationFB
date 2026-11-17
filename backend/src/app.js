import cors from 'cors';
import express from 'express';
import { gestionnaireErreurs, routeIntrouvable } from './erreurs.js';
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
  app.use('/vinyles', creerRoutesVinyles(db));

  app.use(routeIntrouvable);
  app.use(gestionnaireErreurs);

  return app;
}
