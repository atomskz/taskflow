// Apply the schema. Idempotent (CREATE TABLE IF NOT EXISTS), so safe to re-run.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './index.js';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Columns added after the initial release. CREATE TABLE IF NOT EXISTS never
// alters an existing table, so we add late columns by hand — but only when the
// column is actually missing, keeping migrate() safe to re-run.
const ADDED_COLUMNS = [
  { table: 'users', column: 'settings', ddl: "settings TEXT NOT NULL DEFAULT '{}'" },
  { table: 'tasks', column: 'deleted_at', ddl: 'deleted_at TEXT' },
];

function hasColumn(table, column) {
  return db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .some((c) => c.name === column);
}

export function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(sql);
  for (const { table, column, ddl } of ADDED_COLUMNS) {
    if (!hasColumn(table, column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}

// Allow running directly:  npm run migrate
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
  // eslint-disable-next-line no-console
  console.log(`[migrate] schema applied -> ${config.databaseFile}`);
}
