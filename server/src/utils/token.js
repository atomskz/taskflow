// Minimal, dependency-free JWT (HS256). Enough for a single-issuer learning API:
// sign({ sub }) -> token, verify(token) -> payload or throws.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';
import { unauthorized } from './errors.js';

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const b64urlJson = (obj) => b64url(JSON.stringify(obj));

function sign(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { iat: now, exp: now + config.jwt.accessExpiresIn, ...payload };
  const data = `${b64urlJson(header)}.${b64urlJson(body)}`;
  const sig = b64url(createHmac('sha256', config.jwt.secret).update(data).digest());
  return `${data}.${sig}`;
}

function verify(token) {
  if (!token || typeof token !== 'string') throw unauthorized('Недействительный токен');
  const parts = token.split('.');
  if (parts.length !== 3) throw unauthorized('Недействительный токен');
  const [h, p, sig] = parts;
  const data = `${h}.${p}`;
  const expected = b64url(createHmac('sha256', config.jwt.secret).update(data).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw unauthorized('Недействительный токен');
  let payload;
  try {
    payload = JSON.parse(Buffer.from(p, 'base64').toString('utf8'));
  } catch {
    throw unauthorized('Недействительный токен');
  }
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw unauthorized('Сессия истекла. Войдите снова.');
  }
  return payload;
}

export const signToken = (userId) => sign({ sub: userId });
export const verifyToken = verify;
