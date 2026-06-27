// Seed script: ensure the schema exists, create the demo user (idempotent),
// and (re)populate it with the demo task set.  Run with: npm run seed
import { migrate } from './migrate.js';
import { db } from './index.js';
import { config } from '../config.js';
import { createUser, findByEmail } from '../modules/users/users.repo.js';
import { hashPassword } from '../utils/password.js';
import { deleteAllForUser, bulkInsert } from '../modules/tasks/tasks.repo.js';
import { buildDemoTasks } from './seed-data.js';

export function seed() {
  migrate();

  let user = findByEmail(config.demo.email);
  if (!user) {
    user = createUser({
      name: config.demo.name,
      email: config.demo.email.toLowerCase(),
      passwordHash: hashPassword(config.demo.password),
    });
    // eslint-disable-next-line no-console
    console.log(`[seed] created demo user ${config.demo.email}`);
  }

  // Reset the demo user's tasks to a fresh, today-anchored set.
  deleteAllForUser(user.id);
  bulkInsert(user.id, buildDemoTasks());

  const count = db
    .prepare('SELECT COUNT(*) AS n FROM tasks WHERE user_id = ?')
    .get(user.id).n;
  // eslint-disable-next-line no-console
  console.log(`[seed] demo user has ${count} tasks`);
  // eslint-disable-next-line no-console
  console.log(`[seed] login with  ${config.demo.email} / ${config.demo.password}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
}
