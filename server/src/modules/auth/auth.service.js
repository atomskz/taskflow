// Business logic for authentication. Pure functions over the repo + crypto utils.
import { randomBytes, createHash } from 'node:crypto';
import { createUser, findByEmail, findById, toPublicUser } from '../users/users.repo.js';
import * as refreshRepo from './refresh.repo.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signToken } from '../../utils/token.js';
import { config } from '../../config.js';
import { conflict, unauthorized, notFound } from '../../utils/errors.js';

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

// Issue a short-lived access token plus a new opaque refresh token (the raw
// value is returned once; only its hash is persisted).
function issueTokens(userId) {
  const accessToken = signToken(userId);
  const refreshToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + config.refresh.expiresIn * 1000).toISOString();
  refreshRepo.create(userId, sha256(refreshToken), expiresAt);
  return { accessToken, refreshToken };
}

export function register({ name, email, password }) {
  if (findByEmail(email)) {
    throw conflict('Этот email уже зарегистрирован');
  }
  const user = createUser({ name, email, passwordHash: hashPassword(password) });
  return { user: toPublicUser(user), ...issueTokens(user.id) };
}

export function login({ email, password }) {
  const user = findByEmail(email);
  // Same generic message whether the user is missing or the password is wrong,
  // so we don't leak which emails are registered.
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw unauthorized('Неверный email или пароль');
  }
  return { user: toPublicUser(user), ...issueTokens(user.id) };
}

// Rotate a refresh token: validate it, revoke it, and issue a fresh pair. An
// invalid/expired/revoked token throws 401 (the client then logs out).
export function refresh(rawToken) {
  if (!rawToken) throw unauthorized('Сессия истекла. Войдите снова.');
  const row = refreshRepo.findByHash(sha256(rawToken));
  if (!row || row.revoked_at || new Date(row.expires_at) <= new Date()) {
    throw unauthorized('Сессия истекла. Войдите снова.');
  }
  refreshRepo.revoke(row.id);
  return issueTokens(row.user_id);
}

// Best-effort revoke on logout. Silently ignores unknown/missing tokens.
export function revokeRefresh(rawToken) {
  if (!rawToken) return;
  const row = refreshRepo.findByHash(sha256(rawToken));
  if (row && !row.revoked_at) refreshRepo.revoke(row.id);
}

export function getCurrentUser(userId) {
  const user = findById(userId);
  if (!user) throw notFound('Пользователь не найден');
  return toPublicUser(user);
}
