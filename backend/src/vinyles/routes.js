import { Router } from 'express';
import { erreurIntrouvable, erreurValidation } from '../erreurs.js';
import { creerDepotVinyles } from './depot.js';
import { validerIdentifiant, validerRecherche, validerVinyle } from './validation.js';

export function creerRoutesVinyles(db) {
  const depot = creerDepotVinyles(db);
  const routes = Router();

  function lireIdentifiant(req) {
    const id = validerIdentifiant(req.params.id);
    if (id === null) throw erreurIntrouvable('Vinyle introuvable');
    return id;
  }

  function lireVinyle(req) {
    const { valeurs, erreurs } = validerVinyle(req.body);
    if (erreurs) throw erreurValidation(erreurs);
    return valeurs;
  }

  routes.get('/', (req, res) => {
    const { filtres, erreurs } = validerRecherche(req.query);
    if (erreurs) throw erreurValidation(erreurs);
    res.json(depot.lister(filtres));
  });

  routes.get('/genres', (req, res) => {
    const { filtres, erreurs } = validerRecherche({ liste: req.query.liste });
    if (erreurs) throw erreurValidation(erreurs);
    res.json(depot.listerGenres(filtres.liste));
  });

  routes.get('/:id', (req, res) => {
    const vinyle = depot.trouver(lireIdentifiant(req));
    if (!vinyle) throw erreurIntrouvable('Vinyle introuvable');
    res.json(vinyle);
  });

  routes.post('/', (req, res) => {
    const vinyle = depot.creer(lireVinyle(req));
    res.status(201).location(`${req.baseUrl}/${vinyle.id}`).json(vinyle);
  });

  routes.put('/:id', (req, res) => {
    const id = lireIdentifiant(req);
    const vinyle = depot.modifier(id, lireVinyle(req));
    if (!vinyle) throw erreurIntrouvable('Vinyle introuvable');
    res.json(vinyle);
  });

  routes.delete('/:id', (req, res) => {
    if (!depot.supprimer(lireIdentifiant(req))) throw erreurIntrouvable('Vinyle introuvable');
    res.status(204).end();
  });

  return routes;
}
