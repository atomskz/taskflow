// Authentication guard. Reads the Bearer token, verifies it, and attaches
// req.userId for downstream handlers. Throws 401 if missing/invalid.
import { verifyToken } from '../utils/token.js';
import { unauthorized } from '../utils/errors.js';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized('Требуется авторизация'));
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch (err) {
    next(err);
  }
}
