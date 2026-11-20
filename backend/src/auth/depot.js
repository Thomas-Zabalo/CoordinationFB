import { createHash, randomBytes } from 'node:crypto';
import { erreurConflit } from '../erreurs.js';

const TAILLE_JETON_OCTETS = 32;

function hacherJeton(jeton) {
  return createHash('sha256').update(jeton).digest('hex');
}

function versUtilisateurPublic(ligne) {
  if (!ligne) return null;
  return {
    id: ligne.id,
    email: ligne.email,
    nom: ligne.nom,
    dateCreation: ligne.date_creation,
    dateModification: ligne.date_modification,
  };
}

export function creerDepotAuth(db) {
  const requeteInsertionUtilisateur = db.prepare(
    `INSERT INTO utilisateurs (email, nom, mot_de_passe_hash)
     VALUES (@email, @nom, @motDePasseHash)`,
  );
  const requeteUtilisateurParId = db.prepare('SELECT * FROM utilisateurs WHERE id = ?');
  const requeteUtilisateurParEmail = db.prepare('SELECT * FROM utilisateurs WHERE email = ?');

  const requeteInsertionSession = db.prepare(
    `INSERT INTO sessions (utilisateur_id, jeton_hash, date_expiration)
     VALUES (@utilisateurId, @jetonHash, @dateExpiration)`,
  );
  const requeteSessionParJetonHash = db.prepare(
    `SELECT
       s.id AS session_id,
       s.date_expiration AS session_expiration,
       u.id,
       u.email,
       u.nom,
       u.date_creation,
       u.date_modification
     FROM sessions s
     INNER JOIN utilisateurs u ON u.id = s.utilisateur_id
     WHERE s.jeton_hash = ?`,
  );
  const requeteSuppressionSessionParJetonHash = db.prepare('DELETE FROM sessions WHERE jeton_hash = ?');
  const requeteSuppressionSessionParId = db.prepare('DELETE FROM sessions WHERE id = ?');
  const requetePurgeSessionsExpirees = db.prepare('DELETE FROM sessions WHERE date_expiration <= ?');

  return {
    creerUtilisateur({ email, nom, motDePasseHash }) {
      try {
        const { lastInsertRowid } = requeteInsertionUtilisateur.run({ email, nom, motDePasseHash });
        return this.trouverUtilisateurParId(lastInsertRowid);
      } catch (erreur) {
        if (erreur.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          throw erreurConflit('Un compte existe déjà avec cette adresse e-mail');
        }
        throw erreur;
      }
    },

    trouverUtilisateurParId(id) {
      return versUtilisateurPublic(requeteUtilisateurParId.get(id));
    },

    trouverUtilisateurParEmail(email) {
      const ligne = requeteUtilisateurParEmail.get(email);
      if (!ligne) return null;
      return {
        ...versUtilisateurPublic(ligne),
        motDePasseHash: ligne.mot_de_passe_hash,
      };
    },

    creerSession(utilisateurId, dureeMs) {
      // On ne stocke en base que le hash SHA-256 du jeton pour protéger les sessions en cas de fuite de la BDD.
      const jeton = randomBytes(TAILLE_JETON_OCTETS).toString('hex');
      const jetonHash = hacherJeton(jeton);
      const dateExpiration = new Date(Date.now() + dureeMs).toISOString();

      requeteInsertionSession.run({ utilisateurId, jetonHash, dateExpiration });
      return { jeton, dateExpiration };
    },

    trouverSessionParJeton(jeton) {
      if (typeof jeton !== 'string' || jeton.length === 0) return null;

      const ligne = requeteSessionParJetonHash.get(hacherJeton(jeton));
      if (!ligne) return null;

      if (Date.parse(ligne.session_expiration) <= Date.now()) {
        requeteSuppressionSessionParId.run(ligne.session_id);
        return null;
      }

      return {
        sessionId: ligne.session_id,
        dateExpiration: ligne.session_expiration,
        utilisateur: versUtilisateurPublic(ligne),
      };
    },

    supprimerSessionParJeton(jeton) {
      if (typeof jeton !== 'string' || jeton.length === 0) return false;
      return requeteSuppressionSessionParJetonHash.run(hacherJeton(jeton)).changes > 0;
    },

    purgerSessionsExpirees() {
      return requetePurgeSessionsExpirees.run(new Date().toISOString()).changes;
    },
  };
}
