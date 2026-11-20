import { Router } from 'express';
import { creerDepotVinyles } from './depot.js';
import { creerServiceVinyles } from './service.js';

export function creerRoutesVinyles(db) {
  const service = creerServiceVinyles(creerDepotVinyles(db));
  const routes = Router();

  routes.get('/', (req, res) => {
    res.json(service.lister(req.query));
  });

  routes.get('/genres', (req, res) => {
    res.json(service.listerGenres(req.query));
  });

  routes.get('/:id', (req, res) => {
    res.json(service.consulter(req.params.id));
  });

  routes.post('/', (req, res) => {
    const vinyle = service.ajouter(req.body);
    res.status(201).location(`${req.baseUrl}/${vinyle.id}`).json(vinyle);
  });

  routes.put('/:id', (req, res) => {
    res.json(service.modifier(req.params.id, req.body));
  });

  routes.patch('/:id', (req, res) => {
    res.json(service.modifierPartiellement(req.params.id, req.body));
  });

  routes.post('/:id/transferer', (req, res) => {
    res.json(service.transferer(req.params.id, req.body));
  });

  routes.post('/:id/transferer', (req, res) => {
    res.json(service.transferer(req.params.id, req.body));
  });

  routes.delete('/:id', (req, res) => {
    service.supprimer(req.params.id);
    res.status(204).end();
  });

  return routes;
}
