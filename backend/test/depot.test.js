import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { creerSchema, ouvrirBase } from '../src/db/connexion.js';
import { ErreurApi } from '../src/erreurs.js';
import { creerDepotVinyles } from '../src/vinyles/depot.js';

const vinyleBase = {
  artiste: 'Miles Davis',
  titre: 'Kind of Blue',
  annee: 1959,
  genre: 'Jazz',
  label: 'Columbia',
  numeroCatalogue: 'CS 8163',
  format: 'LP',
  taille: '12"',
  pays: 'États-Unis',
  couleur: 'Noir',
  etatDisque: 'NM',
  etatPochette: 'VG+',
  liste: 'collection',
  notes: 'Pressage stéréo',
};

describe('dépôt SQLite des vinyles', () => {
  let db;
  let depot;

  beforeEach(() => {
    db = ouvrirBase(':memory:');
    creerSchema(db);
    depot = creerDepotVinyles(db);
  });

  it('crée un vinyle et le retrouve par identifiant', () => {
    const cree = depot.creer(vinyleBase);

    assert.equal(cree.id, 1);
    assert.equal(cree.artiste, 'Miles Davis');
    assert.equal(cree.numeroCatalogue, 'CS 8163');
    assert.ok(cree.dateAjout);
    assert.ok(cree.dateModification);

    assert.deepEqual(depot.trouver(cree.id), cree);
    assert.equal(depot.trouver(999), null);
  });

  it('modifie tous les champs d’un vinyle tout en préservant dateAjout', () => {
    const cree = depot.creer(vinyleBase);
    const modifie = depot.modifier(cree.id, {
      ...vinyleBase,
      titre: 'Kind of Blue (Réédition)',
      annee: 2013,
      etatPochette: 'M',
    });

    assert.equal(modifie.id, cree.id);
    assert.equal(modifie.titre, 'Kind of Blue (Réédition)');
    assert.equal(modifie.annee, 2013);
    assert.equal(modifie.etatPochette, 'M');
    assert.equal(modifie.dateAjout, cree.dateAjout);
    assert.ok(modifie.dateModification >= cree.dateModification);
    assert.equal(depot.modifier(999, vinyleBase), null);
  });

  it('modifie partiellement un vinyle sans écraser les autres champs', () => {
    const cree = depot.creer(vinyleBase);
    const modifie = depot.modifierPartiellement(cree.id, {
      etatDisque: 'M',
      notes: null,
    });

    assert.equal(modifie.etatDisque, 'M');
    assert.equal(modifie.notes, null);
    assert.equal(modifie.artiste, 'Miles Davis');
    assert.equal(modifie.titre, 'Kind of Blue');
    assert.equal(modifie.numeroCatalogue, 'CS 8163');
    assert.equal(modifie.dateAjout, cree.dateAjout);
    assert.equal(depot.modifierPartiellement(999, { etatDisque: 'VG' }), null);
  });

  it('supprime un vinyle et renvoie false si inexistant', () => {
    const cree = depot.creer(vinyleBase);

    assert.equal(depot.supprimer(cree.id), true);
    assert.equal(depot.trouver(cree.id), null);
    assert.equal(depot.supprimer(cree.id), false);
  });

  it('refuse la création au-delà de la limite maximale configurée', () => {
    const depotLimite = creerDepotVinyles(db, { maxVinyles: 2 });
    depotLimite.creer(vinyleBase);
    depotLimite.creer({ ...vinyleBase, titre: 'Bitches Brew' });

    assert.throws(
      () => depotLimite.creer({ ...vinyleBase, titre: 'In a Silent Way' }),
      (erreur) => erreur instanceof ErreurApi && erreur.statut === 400 && /limite maximale de 2/.test(erreur.message),
    );
  });
});
