// Middleware et configurations de sécurité défensives pour l'API CoordinationFB.

const FENETRE_MS = 60 * 1000; // 1 minute
const MAX_REQUETES_TOTAL = 150; // max requêtes totales par minute et par IP
const MAX_REQUETES_ECRITURE = 40; // max requêtes POST/PUT/DELETE par minute et par IP

// Registre mémoire pour le suivi du taux de requêtes (rate limiting)
const registreIp = new Map();

// Nettoyage régulier des adresses IP inactives pour éviter les fuites mémoire
const intervalleNettoyage = setInterval(() => {
  const maintenant = Date.now();
  for (const [ip, donnees] of registreIp.entries()) {
    if (maintenant - donnees.derniereRequete > FENETRE_MS) {
      registreIp.delete(ip);
    }
  }
}, FENETRE_MS);
intervalleNettoyage.unref();

/**
 * Middleware appliquant les en-têtes HTTP de sécurité standards (équivalent d'un sous-ensemble d'Helmet).
 */
export function enTetesSecurite(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.removeHeader('X-Powered-By');
  next();
}

/**
 * Middleware de limitation de débit (anti-bruteforce / anti-DDoS / anti-flood).
 * Désactivé en environnement de test pour ne pas bloquer les suites de tests unitaires.
 */
export function limiteurRequetes(req, res, next) {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const ip = req.ip || req.socket.remoteAddress || 'inconnu';
  const maintenant = Date.now();
  const estEcriture = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);

  let donnees = registreIp.get(ip);
  if (!donnees || maintenant - donnees.debutFenetre > FENETRE_MS) {
    donnees = { debutFenetre: maintenant, total: 0, ecritures: 0, derniereRequete: maintenant };
    registreIp.set(ip, donnees);
  }

  donnees.derniereRequete = maintenant;
  donnees.total += 1;
  if (estEcriture) donnees.ecritures += 1;

  if (donnees.total > MAX_REQUETES_TOTAL || (estEcriture && donnees.ecritures > MAX_REQUETES_ECRITURE)) {
    res.setHeader('Retry-After', '60');
    res.status(429).json({
      erreur: {
        message: 'Trop de requêtes effectuées depuis cette adresse. Veuillez patienter une minute avant de réessayer.',
      },
    });
    return;
  }

  next();
}

/**
 * Valide que les requêtes en écriture avec un corps ont bien un Content-Type JSON.
 */
export function validerContentType(req, res, next) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentLength = req.headers['content-length'];
    if (contentLength && Number(contentLength) > 0 && !req.is('application/json')) {
      res.status(415).json({
        erreur: { message: 'Le corps de la requête doit être transmis au format application/json' },
      });
      return;
    }
  }
  next();
}

/**
 * Valide dynamiquement l'origine CORS pour permettre le dev local sur localhost,
 * 127.0.0.1 ou le réseau local de la classe sans ouvrir l'API à n'importe quel site web malveillant.
 */
export function verifierOrigineCors(corsOriginConfig) {
  return (origin, callback) => {
    // Si pas d'origine (ex: requêtes supertest, curl, scripts internes)
    if (!origin) return callback(null, true);

    if (origin === corsOriginConfig) return callback(null, true);

    // Autoriser localhost et 127.0.0.1 sur n'importe quel port de développement
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // Autoriser les adresses IP privées locales (pour démos entre machines sur le même WiFi / réseau de classe)
    if (/^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    callback(new Error(`Origine CORS non autorisée : ${origin}`));
  };
}
