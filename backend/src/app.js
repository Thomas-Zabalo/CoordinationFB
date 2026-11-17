import cors from 'cors';
import express from 'express';
import { gestionnaireErreurs, routeIntrouvable } from './erreurs.js';
import { creerRoutesVinyles } from './vinyles/routes.js';

export function creerApp({ db, corsOrigin }) {
  const app = express();

  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  app.get('/sante', (req, res) => {
    res.json({ statut: 'ok' });
  });
  app.use('/vinyles', creerRoutesVinyles(db));

  app.use(routeIntrouvable);
  app.use(gestionnaireErreurs);

  return app;
}
