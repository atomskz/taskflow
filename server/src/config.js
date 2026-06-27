// Centralized configuration, read once from the environment (loaded via
// `node --env-file-if-exists=.env`). Sensible defaults keep local dev working
// even without a .env file, but JWT_SECRET should always be overridden in prod.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');

const env = process.env;

export const config = {
  port: Number(env.PORT) || 4000,
  isProd: env.NODE_ENV === 'production',
  jwt: {
    secret: env.JWT_SECRET || 'dev-only-change-me-to-a-long-random-string',
    expiresIn: Number(env.JWT_EXPIRES_IN) || 60 * 60 * 24 * 7, // seconds
  },
  // Resolve the DB path relative to server/ so scripts work from any cwd.
  databaseFile: path.resolve(serverRoot, env.DATABASE_FILE || './data/taskflow.db'),
  corsOrigin: env.CORS_ORIGIN || 'http://localhost:5173',
  demo: {
    name: env.SEED_DEMO_NAME || 'Алекс Морозов',
    email: env.SEED_DEMO_EMAIL || 'demo@taskflow.app',
    password: env.SEED_DEMO_PASSWORD || 'demo1234',
  },
};

if (config.isProd && config.jwt.secret.startsWith('dev-only')) {
  // eslint-disable-next-line no-console
  console.warn('[config] WARNING: JWT_SECRET is using the insecure default in production.');
}
