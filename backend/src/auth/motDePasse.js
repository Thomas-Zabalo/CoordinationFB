import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const LONGUEUR_SEL = 16;
const LONGUEUR_CLE = 64;
const PARAMETRES_SCRYPT = { N: 16384, r: 8, p: 1 };
const PREFIXE_ALGORITHME = 'scrypt';

export async function hacherMotDePasse(motDePasse) {
  const sel = randomBytes(LONGUEUR_SEL);
  const cleDerivee = await scryptAsync(motDePasse, sel, LONGUEUR_CLE, PARAMETRES_SCRYPT);
  return `${PREFIXE_ALGORITHME}$${sel.toString('hex')}$${cleDerivee.toString('hex')}`;
}

export async function verifierMotDePasse(motDePasse, hashStocke) {
  if (typeof motDePasse !== 'string' || typeof hashStocke !== 'string') return false;

  const parties = hashStocke.split('$');
  if (parties.length !== 3 || parties[0] !== PREFIXE_ALGORITHME) return false;

  const [, selHex, hashHex] = parties;
  const sel = Buffer.from(selHex, 'hex');
  const hashAttendu = Buffer.from(hashHex, 'hex');

  if (sel.length !== LONGUEUR_SEL || hashAttendu.length !== LONGUEUR_CLE) return false;

  const cleDerivee = await scryptAsync(motDePasse, sel, LONGUEUR_CLE, PARAMETRES_SCRYPT);
  return timingSafeEqual(cleDerivee, hashAttendu);
}
