// Drop all data and rebuild from scratch: tables + demo user + demo tasks.
// Run with: npm run reset
import { db } from './index.js';
import { seed } from './seed.js';

db.exec('DROP TABLE IF EXISTS tasks;');
db.exec('DROP TABLE IF EXISTS users;');
// eslint-disable-next-line no-console
console.log('[reset] dropped tables');

seed();
