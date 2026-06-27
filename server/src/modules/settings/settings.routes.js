import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { settingsSchema } from './settings.validation.js';
import * as settings from './settings.service.js';

export const settingsRouter = Router();

settingsRouter.use(requireAuth);

// GET /api/settings — current user's UI preferences (defaults-merged).
settingsRouter.get('/', (req, res) => {
  res.json({ settings: settings.get(req.userId) });
});

// PATCH /api/settings — update one or more preferences; returns the full object.
settingsRouter.patch('/', validate(settingsSchema), (req, res) => {
  res.json({ settings: settings.update(req.userId, req.validated) });
});
