import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { readCookie, setRefreshCookie, clearRefreshCookie } from '../../utils/cookies.js';
import { createRateLimiter } from '../../middleware/rate-limit.js';
import { config } from '../../config.js';
import * as authService from './auth.service.js';

export const authRouter = Router();

// Throttle credential-guessing on the auth endpoints (per IP). The bearer-token
// data routes are not limited.
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 50,
  message: 'Слишком много попыток. Подождите минуту и попробуйте снова.',
});
authRouter.use(['/login', '/register', '/refresh'], authLimiter);

// Set the refresh cookie and return the access token + user as JSON. The raw
// refresh token never appears in the response body.
function sendSession(res, status, { user, accessToken, refreshToken }) {
  setRefreshCookie(res, refreshToken);
  res.status(status).json({ token: accessToken, user });
}

// POST /api/auth/register — create account, auto-login.
authRouter.post('/register', validate(registerSchema), (req, res) => {
  sendSession(res, 201, authService.register(req.validated));
});

// POST /api/auth/login — exchange credentials for an access token + refresh cookie.
authRouter.post('/login', validate(loginSchema), (req, res) => {
  sendSession(res, 200, authService.login(req.validated));
});

// POST /api/auth/refresh — rotate the refresh cookie, return a new access token.
authRouter.post('/refresh', (req, res) => {
  const raw = readCookie(req, config.refresh.cookieName);
  const tokens = authService.refresh(raw);
  setRefreshCookie(res, tokens.refreshToken);
  res.json({ token: tokens.accessToken });
});

// GET /api/auth/me — current user from the bearer token.
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: authService.getCurrentUser(req.userId) });
});

// POST /api/auth/logout — revoke the refresh token and clear the cookie.
authRouter.post('/logout', (req, res) => {
  authService.revokeRefresh(readCookie(req, config.refresh.cookieName));
  clearRefreshCookie(res);
  res.status(204).end();
});
