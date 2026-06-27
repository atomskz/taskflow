// Data-access for refresh tokens. Stores only the hash of each token.
import { db } from '../../db/index.js';
import { newId, nowIso } from '../../utils/ids.js';

export function create(userId, tokenHash, expiresAt) {
  const id = newId();
  db.prepare(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, revoked_at, created_at)
     VALUES (?, ?, ?, ?, NULL, ?)`
  ).run(id, userId, tokenHash, expiresAt, nowIso());
  return id;
}

export function findByHash(tokenHash) {
  return db.prepare('SELECT * FROM refresh_tokens WHERE token_hash = ?').get(tokenHash);
}

export function revoke(id) {
  db.prepare('UPDATE refresh_tokens SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL').run(
    nowIso(),
    id
  );
}
