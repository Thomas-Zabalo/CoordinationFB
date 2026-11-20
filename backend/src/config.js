import { existsSync } from 'node:fs';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const DUREE_SESSION_PAR_DEFAUT_MS = 7 * 24 * 60 * 60 * 1000;

export const config = {
  port: Number(process.env.PORT) || 3000,
  dbPath: process.env.DB_PATH || (process.env.VERCEL ? '/tmp/vinyles.db' : './data/vinyles.db'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  sessionDureeMs: Number(process.env.SESSION_DUREE_MS) || DUREE_SESSION_PAR_DEFAUT_MS,
};
