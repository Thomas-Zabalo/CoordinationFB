import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { creerApp } from '../src/app.js';
import { NOM_COOKIE_SESSION } from '../src/auth/sessions.js';
import { creerSchema, ouvrirBase } from '../src/db/connexion.js';

const utilisateurValide = {
  email: 'Thomas.Morel@Exemple.fr',
  nom: 'Thomas Morel',
  motDePasse: 'Vinyles1969',
};

function extraireCookieSession(reponse) {
  const cookies = reponse.headers['set-cookie'] ?? [];
  return cookies.find((cookie) => cookie.startsWith(`${NOM_COOKIE_SESSION}=`)) ?? null;
}

function extraireJetonDepuisCookie(cookie) {
  const match = cookie?.match(new RegExp(`^${NOM_COOKIE_SESSION}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

describe('API /auth (LIN-36)', () => {
  let app;
  let db;

  beforeEach(() => {
    db = ouvrirBase(':memory:');
    creerSchema(db);
    app = creerApp({ db, corsOrigin: 'http://localhost:5173' });
  });

  describe('POST /auth/inscription', () => {
    it("inscrit un utilisateur, hache son mot de passe et ouvre une session sécurisée", async () => {
      const reponse = await request(app).post('/auth/inscription').send(utilisateurValide).expect(201);

      assert.equal(reponse.body.utilisateur.email, 'thomas.morel@exemple.fr');
      assert.equal(reponse.body.utilisateur.nom, 'Thomas Morel');
      assert.ok(reponse.body.utilisateur.id);
      assert.equal(reponse.body.utilisateur.motDePasseHash, undefined);
      assert.equal(reponse.body.utilisateur.mot_de_passe_hash, undefined);

      const cookie = extraireCookieSession(reponse);
      assert.ok(cookie, 'Un cookie de session doit être défini');
      assert.match(cookie, /HttpOnly/);
      assert.match(cookie, /SameSite=Lax/);

      // Vérifie que le mot de passe n'est jamais stocké en clair en base.
      const ligneUtilisateur = db.prepare('SELECT mot_de_passe_hash FROM utilisateurs WHERE id = ?').get(
        reponse.body.utilisateur.id,
      );
      assert.match(ligneUtilisateur.mot_de_passe_hash, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
      assert.notEqual(ligneUtilisateur.mot_de_passe_hash, utilisateurValide.motDePasse);

      // Vérifie que le jeton de session n'est pas stocké en clair en base.
      const jetonBrut = extraireJetonDepuisCookie(cookie);
      const ligneSession = db.prepare('SELECT jeton_hash FROM sessions WHERE utilisateur_id = ?').get(
        reponse.body.utilisateur.id,
      );
      assert.ok(ligneSession);
      assert.notEqual(ligneSession.jeton_hash, jetonBrut);
    });

    it('est également accessible sous le préfixe /api/auth/inscription', async () => {
      const reponse = await request(app).post('/api/auth/inscription').send(utilisateurValide).expect(201);
      assert.equal(reponse.body.utilisateur.email, 'thomas.morel@exemple.fr');
    });

    it('refuse un e-mail déjà utilisé sans tenir compte de la casse (409)', async () => {
      await request(app).post('/auth/inscription').send(utilisateurValide).expect(201);

      const doublon = await request(app)
        .post('/auth/inscription')
        .send({ ...utilisateurValide, email: 'THOMAS.MOREL@EXEMPLE.FR' })
        .expect(409);

      assert.match(doublon.body.erreur.message, /existe déjà/);
    });

    it('valide les entrées et détaille les champs invalides (400)', async () => {
      const vide = await request(app).post('/auth/inscription').send({}).expect(400);
      assert.equal(vide.body.erreur.details.email, 'Champ obligatoire');
      assert.equal(vide.body.erreur.details.nom, 'Champ obligatoire');
      assert.equal(vide.body.erreur.details.motDePasse, 'Champ obligatoire');

      const invalide = await request(app)
        .post('/auth/inscription')
        .send({ email: 'pas-un-email', nom: 'A', motDePasse: 'abcdefg' })
        .expect(400);
      assert.ok(invalide.body.erreur.details.email);
      assert.ok(invalide.body.erreur.details.nom);
      assert.ok(invalide.body.erreur.details.motDePasse);

      const sansChiffre = await request(app)
        .post('/auth/inscription')
        .send({ ...utilisateurValide, motDePasse: 'MotDePasseSansChiffre' })
        .expect(400);
      assert.match(sansChiffre.body.erreur.details.motDePasse, /chiffre/);

      const octetNul = await request(app)
        .post('/auth/inscription')
        .send({ ...utilisateurValide, nom: 'Thomas\0Inject' })
        .expect(400);
      assert.ok(octetNul.body.erreur.details.nom);
    });
  });

  describe('POST /auth/connexion', () => {
    beforeEach(async () => {
      await request(app).post('/auth/inscription').send(utilisateurValide).expect(201);
    });

    it('connecte un utilisateur existant et renvoie un cookie de session', async () => {
      const reponse = await request(app)
        .post('/auth/connexion')
        .send({ email: 'thomas.morel@exemple.fr', motDePasse: 'Vinyles1969' })
        .expect(200);

      assert.equal(reponse.body.utilisateur.email, 'thomas.morel@exemple.fr');
      assert.equal(reponse.body.utilisateur.motDePasseHash, undefined);
      assert.ok(extraireCookieSession(reponse));
    });

    it("refuse un mauvais mot de passe ou un e-mail inconnu avec le même message générique (401)", async () => {
      const mauvaisMdp = await request(app)
        .post('/auth/connexion')
        .send({ email: 'thomas.morel@exemple.fr', motDePasse: 'Mauvais123' })
        .expect(401);

      const emailInconnu = await request(app)
        .post('/auth/connexion')
        .send({ email: 'inconnu@exemple.fr', motDePasse: 'Vinyles1969' })
        .expect(401);

      assert.equal(mauvaisMdp.body.erreur.message, 'Identifiants invalides');
      assert.equal(emailInconnu.body.erreur.message, 'Identifiants invalides');
    });

    it('refuse une requête de connexion aux champs invalides (400)', async () => {
      const reponse = await request(app).post('/auth/connexion').send({ email: 'invalide' }).expect(400);
      assert.ok(reponse.body.erreur.details.email);
      assert.equal(reponse.body.erreur.details.motDePasse, 'Champ obligatoire');
    });
  });

  describe('GET /auth/moi et POST /auth/deconnexion', () => {
    it('renvoie l’utilisateur courant grâce au cookie de session puis invalide la session à la déconnexion', async () => {
      const inscription = await request(app).post('/auth/inscription').send(utilisateurValide).expect(201);
      const cookie = extraireCookieSession(inscription);

      const moi = await request(app).get('/auth/moi').set('Cookie', cookie).expect(200);
      assert.equal(moi.body.utilisateur.email, 'thomas.morel@exemple.fr');

      const deconnexion = await request(app).post('/auth/deconnexion').set('Cookie', cookie).expect(204);
      const cookieEfface = extraireCookieSession(deconnexion);
      assert.match(cookieEfface, /Max-Age=0/);

      await request(app).get('/auth/moi').set('Cookie', cookie).expect(401);
    });

    it('accepte aussi un jeton de session via Authorization: Bearer', async () => {
      const inscription = await request(app).post('/auth/inscription').send(utilisateurValide).expect(201);
      const jeton = extraireJetonDepuisCookie(extraireCookieSession(inscription));

      const moi = await request(app).get('/auth/moi').set('Authorization', `Bearer ${jeton}`).expect(200);
      assert.equal(moi.body.utilisateur.nom, 'Thomas Morel');
    });

    it('renvoie 401 sans session ou avec une session expirée', async () => {
      await request(app).get('/auth/moi').expect(401);

      const appSessionCourte = creerApp({
        db,
        corsOrigin: 'http://localhost:5173',
        sessionDureeMs: -1000,
      });
      const inscription = await request(appSessionCourte).post('/auth/inscription').send(utilisateurValide).expect(201);
      const cookie = extraireCookieSession(inscription);

      await request(appSessionCourte).get('/auth/moi').set('Cookie', cookie).expect(401);

      const sessionsRestantes = db.prepare('SELECT COUNT(*) AS total FROM sessions').get().total;
      assert.equal(sessionsRestantes, 0);
    });
  });
});
