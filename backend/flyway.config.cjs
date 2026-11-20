const fs = require('fs');
const path = require('path');

let dbPath = './data/vinyles.db';
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const contenu = fs.readFileSync(envPath, 'utf8');
  for (const ligne of contenu.split(/\r?\n/)) {
    const trimmed = ligne.trim();
    if (trimmed.startsWith('DB_PATH=')) {
      dbPath = trimmed.replace('DB_PATH=', '').trim();
    }
  }
}
if (process.env.DB_PATH) {
  dbPath = process.env.DB_PATH;
}

module.exports = {
  flywayArgs: {
    url: `jdbc:sqlite:${dbPath}`,
    locations: 'filesystem:src/db/migrations',
    table: 'flyway_schema_history',
    baselineOnMigrate: true,
  },
};
