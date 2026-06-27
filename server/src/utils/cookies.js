// Minimal cookie helpers for the refresh token. Scoped to /api/auth so the
// cookie is only sent to the refresh/logout routes, never to data endpoints.
import { config } from '../config.js';

const COOKIE_PATH = '/api/auth';

export function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

export function setRefreshCookie(res, token) {
  res.cookie(config.refresh.cookieName, token, {
    httpOnly: true,
    secure: config.isProd, // only sent over HTTPS in production
    sameSite: 'lax',
    maxAge: config.refresh.expiresIn * 1000,
    path: COOKIE_PATH,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(config.refresh.cookieName, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'lax',
    path: COOKIE_PATH,
  });
}
