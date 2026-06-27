// Apply the schema. Idempotent (CREATE TABLE IF NOT EXISTS), so safe to re-run.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './index.js';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(sql);
}

// Allow running directly:  npm run migrate
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
  // eslint-disable-next-line no-console
  console.log(`[migrate] schema applied -> ${config.databaseFile}`);
}
