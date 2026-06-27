// Data-access layer for users. Knows SQL; knows nothing about HTTP.
import { db } from '../../db/index.js';
import { newId, nowIso } from '../../utils/ids.js';

export function createUser({ name, email, passwordHash }) {
  const id = newId();
  const ts = nowIso();
  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, avatar_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, name, email, passwordHash, null, ts, ts);
  return findById(id);
}

export function findByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase());
}

export function findById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

// Strip the password hash before sending a user to the client.
export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatar_url || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
