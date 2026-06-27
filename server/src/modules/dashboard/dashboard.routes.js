import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import * as dashboard from './dashboard.service.js';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

// GET /api/dashboard?today=YYYY-MM-DD — aggregated stats for the current user.
// `today` is the caller's local date (for overdue/today/week boundaries);
// defaults to the server date when omitted.
dashboardRouter.get('/', (req, res) => {
  const today = /^\d{4}-\d{2}-\d{2}$/.test(req.query.today) ? req.query.today : undefined;
  res.json({ dashboard: dashboard.build(req.userId, today) });
});
