// Server entry point. Ensures the schema exists, then starts listening.
import { createApp } from './app.js';
import { config } from './config.js';
import { migrate } from './db/migrate.js';
import { logger } from './utils/logger.js';

migrate(); // idempotent: create tables on first run

const app = createApp();

app.listen(config.port, () => {
  logger.info('server started', {
    port: config.port,
    env: config.isProd ? 'production' : 'development',
    corsOrigin: config.corsOrigin,
  });
});
