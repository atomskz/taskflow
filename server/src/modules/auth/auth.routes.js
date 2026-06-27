import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import * as authService from './auth.service.js';

export const authRouter = Router();

// POST /api/auth/register — create account, return token + user (auto-login).
authRouter.post('/register', validate(registerSchema), (req, res) => {
  res.status(201).json(authService.register(req.validated));
});

// POST /api/auth/login — exchange credentials for a token.
authRouter.post('/login', validate(loginSchema), (req, res) => {
  res.json(authService.login(req.validated));
});

// GET /api/auth/me — current user from the bearer token.
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: authService.getCurrentUser(req.userId) });
});

// POST /api/auth/logout — stateless JWT, so this is a no-op the client confirms.
// The client drops its stored token; provided for symmetry/extensibility.
authRouter.post('/logout', (_req, res) => {
  res.status(204).end();
});
