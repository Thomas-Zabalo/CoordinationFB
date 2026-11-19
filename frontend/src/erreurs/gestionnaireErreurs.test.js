import { beforeEach, describe, expect, it } from 'vitest';
import { ErreurApi } from '../api/vinyles.js';
import {
  enregistrerErreur,
  enregistrerErreurs,
  MESSAGES_ERREURS_PAR_DEFAUT,
  obtenirMessageErreur,
  reinitialiserRegistreErreurs,
  resoudreErreur,
  TITRES_ERREURS_PAR_DEFAUT,
} from './gestionnaireErreurs.js';

describe('gestionnaireErreurs', () => {
  beforeEach(() => {
    reinitialiserRegistreErreurs();
  });

  it('gère par défaut l’erreur 403 (Accès interdit)', () => {
    const resultat = resoudreErreur(403);
    expect(resultat.statut).toBe(403);
    expect(resultat.titre).toBe('Accès refusé (403)');
    expect(resultat.message).toBe(MESSAGES_ERREURS_PAR_DEFAUT[403]);
    expect(obtenirMessageErreur(403)).toBe(MESSAGES_ERREURS_PAR_DEFAUT[403]);
  });

  it('gère par défaut l’erreur 404 (Ressource introuvable)', () => {
    const resultat = resoudreErreur(404);
    expect(resultat.statut).toBe(404);
    expect(resultat.titre).toBe('Ressource introuvable (404)');
    expect(resultat.message).toBe(MESSAGES_ERREURS_PAR_DEFAUT[404]);
    expect(obtenirMessageErreur(404)).toBe(MESSAGES_ERREURS_PAR_DEFAUT[404]);
  });

  it('gère les instances d’ErreurApi avec statut HTTP 403', () => {
    const erreurApi = new ErreurApi('Erreur inattendue', 403);
    const resultat = resoudreErreur(erreurApi);

    expect(resultat.statut).toBe(403);
    expect(resultat.message).toBe(MESSAGES_ERREURS_PAR_DEFAUT[403]);
  });

  it('préserve le message d’API spécifique s’il est fourni avec un statut 404', () => {
    const erreurApi = new ErreurApi('Vinyle introuvable', 404);
    const resultat = resoudreErreur(erreurApi);

    expect(resultat.statut).toBe(404);
    expect(resultat.message).toBe('Vinyle introuvable');
  });

  it('gère les erreurs 500, 401 et réseau (0)', () => {
    expect(resoudreErreur(500).titre).toBe(TITRES_ERREURS_PAR_DEFAUT[500]);
    expect(resoudreErreur(401).message).toBe(MESSAGES_ERREURS_PAR_DEFAUT[401]);
    expect(resoudreErreur(0).message).toBe(MESSAGES_ERREURS_PAR_DEFAUT[0]);
  });

  it('permet de rajouter facilement une nouvelle erreur avec enregistrerErreur', () => {
    enregistrerErreur(418, 'Je suis une théière.', 'Code 418');

    const resultat = resoudreErreur(418);
    expect(resultat.statut).toBe(418);
    expect(resultat.titre).toBe('Code 418');
    expect(resultat.message).toBe('Je suis une théière.');
  });

  it('permet de rajouter des erreurs personnalisées par chaîne ou clé métier', () => {
    enregistrerErreur('QUOTA_MAX', 'Vous avez atteint le nombre maximal de vinyles autorisés.', 'Quota atteint');

    const resultat = resoudreErreur('QUOTA_MAX');
    expect(resultat.titre).toBe('Quota atteint');
    expect(resultat.message).toBe('Vous avez atteint le nombre maximal de vinyles autorisés.');
  });

  it('permet d’enregistrer plusieurs erreurs en lot avec enregistrerErreurs', () => {
    enregistrerErreurs({
      508: { message: 'Boucle infinie détectée sur le serveur.', titre: 'Boucle infinie' },
      'ACCES_RESTREINT': 'Ce disque est privé.',
    });

    expect(resoudreErreur(508).titre).toBe('Boucle infinie');
    expect(resoudreErreur(508).message).toBe('Boucle infinie détectée sur le serveur.');
    expect(resoudreErreur('ACCES_RESTREINT').message).toBe('Ce disque est privé.');
  });

  it('gère les chaînes simples et les erreurs génériques de secours', () => {
    expect(resoudreErreur('Erreur personnalisée').message).toBe('Erreur personnalisée');
    expect(resoudreErreur(null).message).toBe('Une erreur inattendue est survenue.');
  });
});
