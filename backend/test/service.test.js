import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ErreurApi } from '../src/erreurs.js';
import { creerServiceVinyles } from '../src/vinyles/service.js';

function creerDepotSimule(overrides = {}) {
  const appels = [];
  const depot = {
    lister(filtres) {
      appels.push(['lister', filtres]);
      return [];
    },
    listerGenres(liste) {
      appels.push(['listerGenres', liste]);
      return [];
    },
    trouver(id) {
      appels.push(['trouver', id]);
      return null;
    },
    creer(valeurs) {
      appels.push(['creer', valeurs]);
      return { id: 1, ...valeurs };
    },
    modifier(id, valeurs) {
      appels.push(['modifier', id, valeurs]);
      return { id, ...valeurs };
    },
    modifierPartiellement(id, valeurs) {
      appels.push(['modifierPartiellement', id, valeurs]);
      return { id, ...valeurs };
    },
    supprimer(id) {
      appels.push(['supprimer', id]);
      return true;
    },
    ...overrides,
  };
  return { depot, appels };
}

describe('service de gestion des vinyles', () => {
  it('valide les données avant d’appeler le dépôt lors de l’ajout', () => {
    const { depot, appels } = creerDepotSimule();
    const service = creerServiceVinyles(depot);

    const cree = service.ajouter({ artiste: '  Daft Punk ', titre: ' Discovery ' });

    assert.equal(cree.id, 1);
    assert.equal(cree.artiste, 'Daft Punk');
    assert.equal(cree.titre, 'Discovery');
    assert.equal(appels.length, 1);
    assert.equal(appels[0][0], 'creer');
  });

  it('rejette un ajout invalide avec ErreurApi 400 sans toucher le dépôt', () => {
    const { depot, appels } = creerDepotSimule();
    const service = creerServiceVinyles(depot);

    assert.throws(
      () => service.ajouter({ artiste: '' }),
      (erreur) => erreur instanceof ErreurApi && erreur.statut === 400 && erreur.details.artiste === 'Champ obligatoire',
    );
    assert.equal(appels.length, 0);
  });

  it('rejette un identifiant invalide avec ErreurApi 404 sans interroger le dépôt', () => {
    const { depot, appels } = creerDepotSimule();
    const service = creerServiceVinyles(depot);

    for (const action of [
      () => service.consulter('abc'),
      () => service.modifier('0', { artiste: 'A', titre: 'T' }),
      () => service.modifierPartiellement('-1', { genre: 'Jazz' }),
      () => service.supprimer('invalide'),
    ]) {
      assert.throws(action, (erreur) => erreur instanceof ErreurApi && erreur.statut === 404);
    }
    assert.equal(appels.length, 0);
  });

  it('lève une ErreurApi 404 si le vinyle à modifier ou supprimer n’existe pas', () => {
    const { depot } = creerDepotSimule({
      trouver: () => null,
      modifier: () => null,
      modifierPartiellement: () => null,
      supprimer: () => false,
    });
    const service = creerServiceVinyles(depot);

    assert.throws(
      () => service.consulter('42'),
      (erreur) => erreur instanceof ErreurApi && erreur.statut === 404,
    );
    assert.throws(
      () => service.modifier('42', { artiste: 'A', titre: 'T' }),
      (erreur) => erreur instanceof ErreurApi && erreur.statut === 404,
    );
    assert.throws(
      () => service.modifierPartiellement('42', { genre: 'Rock' }),
      (erreur) => erreur instanceof ErreurApi && erreur.statut === 404,
    );
    assert.throws(
      () => service.supprimer('42'),
      (erreur) => erreur instanceof ErreurApi && erreur.statut === 404,
    );
  });

  it('transmet uniquement les champs validés lors d’une modification partielle', () => {
    const { depot, appels } = creerDepotSimule();
    const service = creerServiceVinyles(depot);

    service.modifierPartiellement('7', { etatDisque: 'VG+', liste: 'collection' });

    assert.deepEqual(appels, [['modifierPartiellement', 7, { etatDisque: 'VG+', liste: 'collection' }]]);
  });

  it('supprime un vinyle existant avec son identifiant numérique', () => {
    const { depot, appels } = creerDepotSimule();
    const service = creerServiceVinyles(depot);

    service.supprimer('12');

    assert.deepEqual(appels, [['supprimer', 12]]);
  });
});
