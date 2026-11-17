import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { creerApp } from '../src/app.js';
import { creerSchema, ouvrirBase } from '../src/db/connexion.js';

describe('Sécurité de l’API', () => {
  let app;
  let db;

  beforeEach(() => {
    db = ouvrirBase(':memory:');
    creerSchema(db);
    app = creerApp({ db, corsOrigin: 'http://localhost:5173', activerLimiteur: true });
  });

  it('définit les en-têtes HTTP de sécurité et supprime X-Powered-By', async () => {
    const reponse = await request(app).get('/sante').expect(200);

    assert.equal(reponse.headers['x-content-type-options'], 'nosniff');
    assert.equal(reponse.headers['x-frame-options'], 'DENY');
    assert.equal(reponse.headers['x-powered-by'], undefined);
  });

  it('refuse les requêtes POST dont la taille dépasse la limite autorisée (413)', async () => {
    const grosPayload = { artiste: 'A'.repeat(60000), titre: 'B' };
    const reponse = await request(app)
      .post('/vinyles')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(grosPayload))
      .expect(413);

    assert.match(reponse.body.erreur.message, /limite autorisée/);
  });

  it('refuse un paramètre de recherche dépassant 200 caractères pour éviter le déni de service CPU', async () => {
    const requeteLongue = 'A'.repeat(250);
    const reponse = await request(app).get(`/vinyles?q=${requeteLongue}`).expect(400);

    assert.ok(reponse.body.erreur.details.q);
  });

  it('refuse les octets nuls (null bytes) dans les champs texte', async () => {
    const reponse = await request(app)
      .post('/vinyles')
      .send({ artiste: 'Artiste\0Infiltration', titre: 'Titre Valide' })
      .expect(400);

    assert.ok(reponse.body.erreur.details.artiste);
  });

  it('refuse les requêtes POST avec un Content-Type invalide (415)', async () => {
    await request(app)
      .post('/vinyles')
      .set('Content-Type', 'text/plain')
      .send('artiste=Test&titre=Test')
      .expect(415);
  });

  it('déclenche le limiteur de requêtes (429) en cas de flood en écriture', async () => {
    // 40 requêtes autorisées par minute pour les écritures
    for (let i = 0; i < 41; i++) {
      const res = await request(app).post('/vinyles').send({ artiste: 'Test', titre: `Vinyle ${i}` });
      if (res.status === 429) {
        assert.equal(res.status, 429);
        assert.match(res.body.erreur.message, /Trop de requêtes/);
        return;
      }
    }
    assert.fail('Le limiteur de requêtes aurait dû déclencher un 429');
  });
});
