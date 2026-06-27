// Boot helper for containers / fresh environments: apply the schema, then seed
// the demo data ONLY if the database has no users yet. Idempotent across restarts
// (won't wipe existing data on a persistent volume).
import { migrate } from './migrate.js';
import { db } from './index.js';
import { seed } from './seed.js';

migrate();

const { n } = db.prepare('SELECT COUNT(*) AS n FROM users').get();
if (n === 0) {
  // eslint-disable-next-line no-console
  console.log('[init] empty database — seeding demo data');
  seed();
} else {
  // eslint-disable-next-line no-console
  console.log(`[init] ${n} user(s) present — skipping seed`);
}
