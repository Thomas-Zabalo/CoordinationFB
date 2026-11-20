import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { creerApp } from '../src/app.js';
import { NOM_COOKIE_SESSION } from '../src/auth/sessions.js';
import { creerSchema, ouvrirBase } from '../src/db/connexion.js';
import { creerSpecOpenApi } from '../src/docs/openapi.js';
import { ANNEE_MIN, ETATS, FORMATS, LISTES, ORDRES, TAILLES, TRIS } from '../src/vinyles/constantes.js';

describe('Documentation Swagger / OpenAPI', () => {
  describe('spécification OpenAPI', () => {
    const spec = creerSpecOpenApi();

    it('déclare une spécification OpenAPI 3.0.3 complète avec schémas de sécurité', () => {
      assert.equal(spec.openapi, '3.0.3');
      assert.equal(spec.info.title, 'API CoordinationFB');
      assert.equal(spec.components.securitySchemes.cookieSession.name, NOM_COOKIE_SESSION);
      assert.equal(spec.components.securitySchemes.bearerAuth.scheme, 'bearer');
    });

    it('reste synchronisée avec les constantes métier des vinyles', () => {
      const proprietesVinyle = spec.components.schemas.Vinyle.properties;

      assert.equal(proprietesVinyle.annee.minimum, ANNEE_MIN);
      assert.deepEqual(proprietesVinyle.etatDisque.enum, [...ETATS, null]);
      assert.deepEqual(proprietesVinyle.etatPochette.enum, [...ETATS, null]);
      assert.deepEqual(proprietesVinyle.format.enum, [...FORMATS, null]);
      assert.deepEqual(proprietesVinyle.taille.enum, [...TAILLES, null]);
      assert.deepEqual(proprietesVinyle.liste.enum, [...LISTES]);

      const parametresListe = Object.fromEntries(spec.paths['/vinyles'].get.parameters.map((p) => [p.name, p]));
      assert.deepEqual(parametresListe.tri.schema.enum, [...TRIS]);
      assert.deepEqual(parametresListe.ordre.schema.enum, [...ORDRES]);
    });

    it('documente toutes les routes principales (système, auth, vinyles)', () => {
      assert.ok(spec.paths['/sante'].get);

      assert.ok(spec.paths['/auth/inscription'].post);
      assert.ok(spec.paths['/auth/connexion'].post);
      assert.ok(spec.paths['/auth/deconnexion'].post);
      assert.ok(spec.paths['/auth/moi'].get);

      assert.ok(spec.paths['/vinyles'].get);
      assert.ok(spec.paths['/vinyles'].post);
      assert.ok(spec.paths['/vinyles/genres'].get);
      assert.ok(spec.paths['/vinyles/{id}'].get);
      assert.ok(spec.paths['/vinyles/{id}'].put);
      assert.ok(spec.paths['/vinyles/{id}'].patch);
      assert.ok(spec.paths['/vinyles/{id}'].delete);
      assert.ok(spec.paths['/vinyles/{id}/transferer'].post);
    });
  });

  describe('endpoints HTTP /docs et /docs.json', () => {
    let app;

    beforeEach(() => {
      const db = ouvrirBase(':memory:');
      creerSchema(db);
      app = creerApp({ db, corsOrigin: 'http://localhost:5173' });
    });

    it('expose la spécification OpenAPI JSON sur /docs.json et /api/docs.json', async () => {
      const racine = await request(app).get('/docs.json').expect(200);
      assert.match(racine.headers['content-type'], /application\/json/);
      assert.equal(racine.body.openapi, '3.0.3');
      assert.ok(racine.body.paths['/vinyles']);

      const api = await request(app).get('/api/docs.json').expect(200);
      assert.deepEqual(api.body, racine.body);
    });

    it('sert l’interface Swagger UI sur /docs/ et /api/docs/', async () => {
      const racine = await request(app).get('/docs/').expect(200);
      assert.match(racine.headers['content-type'], /text\/html/);
      assert.match(racine.text, /swagger-ui/);
      assert.match(racine.text, /CoordinationFB — Documentation API/);

      const api = await request(app).get('/api/docs/').expect(200);
      assert.match(api.headers['content-type'], /text\/html/);
      assert.match(api.text, /swagger-ui/);
    });
  });
});
