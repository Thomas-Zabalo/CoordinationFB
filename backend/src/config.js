import { existsSync } from 'node:fs';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  dbPath: process.env.DB_PATH || './data/vinyles.db',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
