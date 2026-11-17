import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { creerApp } from '../src/app.js';
import { creerSchema, ouvrirBase } from '../src/db/connexion.js';

const abbeyRoad = {
  artiste: 'The Beatles',
  titre: 'Abbey Road',
  annee: 1969,
  genre: 'Rock',
  label: 'Apple Records',
  numeroCatalogue: 'PCS 7088',
  format: 'LP',
  taille: '12"',
  pays: 'Royaume-Uni',
  etatDisque: 'VG+',
  etatPochette: 'VG',
};

describe('API /vinyles', () => {
  let app;

  beforeEach(() => {
    const db = ouvrirBase(':memory:');
    creerSchema(db);
    app = creerApp({ db, corsOrigin: 'http://localhost:5173' });
  });

  async function ajouter(vinyle) {
    const reponse = await request(app).post('/vinyles').send(vinyle).expect(201);
    return reponse.body;
  }

  it('renvoie une liste vide au départ', async () => {
    const reponse = await request(app).get('/vinyles').expect(200);
    assert.deepEqual(reponse.body, []);
  });

  it('ajoute un vinyle à la collection par défaut', async () => {
    const vinyle = await ajouter(abbeyRoad);

    assert.equal(vinyle.titre, 'Abbey Road');
    assert.equal(vinyle.liste, 'collection');
    assert.equal(vinyle.etatDisque, 'VG+');
    assert.equal(vinyle.etatPochette, 'VG');
    assert.ok(vinyle.id);
    assert.ok(vinyle.dateAjout);
  });

  it("refuse un vinyle sans artiste ni titre et détaille les erreurs", async () => {
    const reponse = await request(app).post('/vinyles').send({ annee: 1969 }).expect(400);

    assert.equal(reponse.body.erreur.details.artiste, 'Champ obligatoire');
    assert.equal(reponse.body.erreur.details.titre, 'Champ obligatoire');
  });

  it("refuse un état qui n'est pas dans l'échelle standard", async () => {
    const reponse = await request(app)
      .post('/vinyles')
      .send({ ...abbeyRoad, etatDisque: 'Excellent' })
      .expect(400);

    assert.match(reponse.body.erreur.details.etatDisque, /NM/);
  });

  it('refuse une année hors limites', async () => {
    const reponse = await request(app).post('/vinyles').send({ ...abbeyRoad, annee: 1700 }).expect(400);
    assert.ok(reponse.body.erreur.details.annee);
  });

  it('refuse un JSON mal formé', async () => {
    await request(app).post('/vinyles').set('Content-Type', 'application/json').send('{ mal formé').expect(400);
  });

  it('renvoie un vinyle par son identifiant', async () => {
    const { id } = await ajouter(abbeyRoad);
    const reponse = await request(app).get(`/vinyles/${id}`).expect(200);
    assert.equal(reponse.body.numeroCatalogue, 'PCS 7088');
  });

  it('renvoie 404 pour un vinyle inexistant ou un identifiant invalide', async () => {
    await request(app).get('/vinyles/999').expect(404);
    await request(app).get('/vinyles/abc').expect(404);
  });

  it('modifie un vinyle', async () => {
    const { id } = await ajouter(abbeyRoad);
    const reponse = await request(app)
      .put(`/vinyles/${id}`)
      .send({ ...abbeyRoad, etatPochette: 'NM' })
      .expect(200);

    assert.equal(reponse.body.etatPochette, 'NM');
  });

  it("déplace un vinyle de la liste d'envies vers la collection", async () => {
    const { id } = await ajouter({ artiste: 'Miles Davis', titre: 'Kind of Blue', liste: 'envies' });
    const reponse = await request(app)
      .put(`/vinyles/${id}`)
      .send({ artiste: 'Miles Davis', titre: 'Kind of Blue', liste: 'collection' })
      .expect(200);

    assert.equal(reponse.body.liste, 'collection');
  });

  it('supprime un vinyle', async () => {
    const { id } = await ajouter(abbeyRoad);
    await request(app).delete(`/vinyles/${id}`).expect(204);
    await request(app).get(`/vinyles/${id}`).expect(404);
    await request(app).delete(`/vinyles/${id}`).expect(404);
  });

  describe('recherche, tri et filtres', () => {
    beforeEach(async () => {
      await ajouter(abbeyRoad);
      await ajouter({ artiste: 'Daft Punk', titre: 'Discovery', annee: 2001, genre: 'Électro', format: 'LP' });
      await ajouter({ artiste: 'Miles Davis', titre: 'Kind of Blue', annee: 1959, genre: 'Jazz', liste: 'envies' });
      await ajouter({ artiste: 'Inconnu', titre: 'Sans année', format: 'Single' });
    });

    it('filtre par liste', async () => {
      const reponse = await request(app).get('/vinyles?liste=envies').expect(200);
      assert.deepEqual(
        reponse.body.map((vinyle) => vinyle.titre),
        ['Kind of Blue'],
      );
    });

    it('recherche par artiste, titre ou numéro de catalogue sans tenir compte de la casse', async () => {
      const parArtiste = await request(app).get('/vinyles?q=daft').expect(200);
      assert.deepEqual(parArtiste.body.map((vinyle) => vinyle.titre), ['Discovery']);

      const parCatalogue = await request(app).get('/vinyles?q=PCS 7088').expect(200);
      assert.deepEqual(parCatalogue.body.map((vinyle) => vinyle.titre), ['Abbey Road']);
    });

    it('traite les caractères spéciaux de la recherche comme du texte', async () => {
      const reponse = await request(app).get('/vinyles?q=%25').expect(200);
      assert.deepEqual(reponse.body, []);
    });

    it('recherche sans tenir compte des accents', async () => {
      const reponse = await request(app).get('/vinyles?q=electro').expect(200);
      assert.deepEqual(reponse.body.map((vinyle) => vinyle.titre), ['Discovery']);
    });

    it('trie par défaut du plus récent au plus ancien ajout', async () => {
      const reponse = await request(app).get('/vinyles').expect(200);
      assert.deepEqual(
        reponse.body.map((vinyle) => vinyle.titre),
        ['Sans année', 'Kind of Blue', 'Discovery', 'Abbey Road'],
      );
    });

    it('trie par artiste en plaçant correctement les lettres accentuées', async () => {
      await ajouter({ artiste: 'Édith Piaf', titre: 'La Vie en rose' });
      const reponse = await request(app).get('/vinyles?tri=artiste').expect(200);
      assert.deepEqual(
        reponse.body.map((vinyle) => vinyle.artiste),
        ['Daft Punk', 'Édith Piaf', 'Inconnu', 'Miles Davis', 'The Beatles'],
      );
    });

    it('filtre par genre et par format', async () => {
      const parGenre = await request(app).get('/vinyles?genre=jazz').expect(200);
      assert.deepEqual(parGenre.body.map((vinyle) => vinyle.titre), ['Kind of Blue']);

      const parFormat = await request(app).get('/vinyles?format=Single').expect(200);
      assert.deepEqual(parFormat.body.map((vinyle) => vinyle.titre), ['Sans année']);
    });

    it('trie par année en plaçant les vinyles sans année à la fin', async () => {
      const croissant = await request(app).get('/vinyles?tri=annee').expect(200);
      assert.deepEqual(
        croissant.body.map((vinyle) => vinyle.annee),
        [1959, 1969, 2001, null],
      );

      const decroissant = await request(app).get('/vinyles?tri=annee&ordre=desc').expect(200);
      assert.deepEqual(
        decroissant.body.map((vinyle) => vinyle.annee),
        [2001, 1969, 1959, null],
      );
    });

    it('refuse un tri inconnu', async () => {
      const reponse = await request(app).get('/vinyles?tri=prix').expect(400);
      assert.ok(reponse.body.erreur.details.tri);
    });

    it("liste les genres d'une liste", async () => {
      const tous = await request(app).get('/vinyles/genres').expect(200);
      assert.deepEqual(tous.body, ['Électro', 'Jazz', 'Rock']);

      const collection = await request(app).get('/vinyles/genres?liste=collection').expect(200);
      assert.deepEqual(collection.body, ['Électro', 'Rock']);
    });
  });

  it('renvoie 404 en JSON pour une route inconnue', async () => {
    const reponse = await request(app).get('/inconnue').expect(404);
    assert.match(reponse.body.erreur.message, /Route introuvable/);
  });
});
