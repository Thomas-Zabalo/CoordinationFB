import { Router } from 'express';
import { erreurNonAutorise, erreurValidation } from '../erreurs.js';
import { creerDepotAuth } from './depot.js';
import { hacherMotDePasse, verifierMotDePasse } from './motDePasse.js';
import {
  attacherSession,
  definirCookieSession,
  effacerCookieSession,
  exigerAuthentification,
  extraireJetonSession,
} from './sessions.js';
import { validerConnexion, validerInscription } from './validation.js';

const DUREE_SESSION_PAR_DEFAUT_MS = 7 * 24 * 60 * 60 * 1000;

export function creerRoutesAuth(db, { dureeSessionMs = DUREE_SESSION_PAR_DEFAUT_MS } = {}) {
  const depot = creerDepotAuth(db);
  const routes = Router();

  routes.post('/inscription', async (req, res) => {
    const { valeurs, erreurs } = validerInscription(req.body);
    if (erreurs) throw erreurValidation(erreurs);

    const motDePasseHash = await hacherMotDePasse(valeurs.motDePasse);
    const utilisateur = depot.creerUtilisateur({
      email: valeurs.email,
      nom: valeurs.nom,
      motDePasseHash,
    });

    const { jeton } = depot.creerSession(utilisateur.id, dureeSessionMs);
    definirCookieSession(res, jeton, dureeSessionMs);

    res.status(201).json({ utilisateur });
  });

  routes.post('/connexion', async (req, res) => {
    const { valeurs, erreurs } = validerConnexion(req.body);
    if (erreurs) throw erreurValidation(erreurs);

    const utilisateurTrouve = depot.trouverUtilisateurParEmail(valeurs.email);
    if (!utilisateurTrouve) {
      throw erreurNonAutorise('Identifiants invalides');
    }

    const motDePasseValide = await verifierMotDePasse(valeurs.motDePasse, utilisateurTrouve.motDePasseHash);
    if (!motDePasseValide) {
      throw erreurNonAutorise('Identifiants invalides');
    }

    const utilisateur = {
      id: utilisateurTrouve.id,
      email: utilisateurTrouve.email,
      nom: utilisateurTrouve.nom,
      dateCreation: utilisateurTrouve.dateCreation,
      dateModification: utilisateurTrouve.dateModification,
    };

    depot.purgerSessionsExpirees();
    const { jeton } = depot.creerSession(utilisateur.id, dureeSessionMs);
    definirCookieSession(res, jeton, dureeSessionMs);

    res.json({ utilisateur });
  });

  routes.post('/deconnexion', (req, res) => {
    const jeton = extraireJetonSession(req);
    if (jeton) {
      depot.supprimerSessionParJeton(jeton);
    }
    effacerCookieSession(res);
    res.status(204).end();
  });

  routes.get('/moi', attacherSession(depot), exigerAuthentification, (req, res) => {
    res.json({ utilisateur: req.utilisateur });
  });

  return routes;
}
