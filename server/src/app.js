// Express app assembly: middleware, routes, error handling. Exported separately
// from index.js so tests can import the app without binding a port.
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { tasksRouter } from './modules/tasks/tasks.routes.js';
import { settingsRouter } from './modules/settings/settings.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((s) => s.trim()),
    })
  );
  app.use(express.json({ limit: '256kb' }));

  // Health check.
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // Feature routers.
  app.use('/api/auth', authRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/dashboard', dashboardRouter);

  // Unknown route + central error handler (must be last).
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
