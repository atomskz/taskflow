// Server entry point. Ensures the schema exists, then starts listening.
import { createApp } from './app.js';
import { config } from './config.js';
import { migrate } from './db/migrate.js';

migrate(); // idempotent: create tables on first run

const app = createApp();

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] TaskFlow API listening on http://localhost:${config.port}`);
  // eslint-disable-next-line no-console
  console.log(`[server] CORS origin: ${config.corsOrigin}`);
});
