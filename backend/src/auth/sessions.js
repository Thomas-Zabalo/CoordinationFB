import { erreurNonAutorise } from '../erreurs.js';

export const NOM_COOKIE_SESSION = 'coordinationfb_session';

function lireCookies(enteteCookie) {
  const cookies = {};
  if (typeof enteteCookie !== 'string' || enteteCookie.trim() === '') return cookies;

  for (const paire of enteteCookie.split(';')) {
    const indexEgal = paire.indexOf('=');
    if (indexEgal <= 0) continue;
    const nom = paire.slice(0, indexEgal).trim();
    const valeur = paire.slice(indexEgal + 1).trim();
    if (nom) {
      try {
        cookies[nom] = decodeURIComponent(valeur);
      } catch {
        cookies[nom] = valeur;
      }
    }
  }
  return cookies;
}

export function extraireJetonSession(req) {
  const cookies = lireCookies(req.headers.cookie);
  if (cookies[NOM_COOKIE_SESSION]) return cookies[NOM_COOKIE_SESSION];

  const autorisation = req.headers.authorization;
  if (typeof autorisation === 'string' && autorisation.startsWith('Bearer ')) {
    const jeton = autorisation.slice('Bearer '.length).trim();
    if (jeton) return jeton;
  }

  return null;
}

export function definirCookieSession(res, jeton, dureeMs) {
  const maxAgeSecondes = Math.max(0, Math.floor(dureeMs / 1000));
  const attributs = [
    `${NOM_COOKIE_SESSION}=${encodeURIComponent(jeton)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSecondes}`,
  ];
  if (process.env.NODE_ENV === 'production') {
    attributs.push('Secure');
  }
  res.setHeader('Set-Cookie', attributs.join('; '));
}

export function effacerCookieSession(res) {
  const attributs = [
    `${NOM_COOKIE_SESSION}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (process.env.NODE_ENV === 'production') {
    attributs.push('Secure');
  }
  res.setHeader('Set-Cookie', attributs.join('; '));
}

export function attacherSession(depotAuth) {
  return (req, res, next) => {
    const jeton = extraireJetonSession(req);
    if (!jeton) {
      req.utilisateur = null;
      req.jetonSession = null;
      return next();
    }

    const session = depotAuth.trouverSessionParJeton(jeton);
    if (!session) {
      req.utilisateur = null;
      req.jetonSession = null;
      return next();
    }

    req.utilisateur = session.utilisateur;
    req.jetonSession = jeton;
    return next();
  };
}

export function exigerAuthentification(req, res, next) {
  if (!req.utilisateur) {
    return next(erreurNonAutorise('Authentification requise'));
  }
  return next();
}
