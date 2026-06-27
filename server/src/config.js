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
    // Short-lived access token; sessions are kept alive by the refresh cookie.
    accessExpiresIn: Number(env.ACCESS_TOKEN_TTL) || 60 * 15, // seconds (15 min)
  },
  refresh: {
    expiresIn: Number(env.REFRESH_TOKEN_TTL) || 60 * 60 * 24 * 30, // seconds (30 days)
    cookieName: 'taskflow_refresh',
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

// Refuse to boot in production with a weak/placeholder secret. The defaults
// shipped in the repo (.env.example, docker-compose) are intentionally caught.
const INSECURE_SECRETS = new Set([
  'dev-only-change-me-to-a-long-random-string',
  'change-me-to-a-long-random-string',
]);
function secretIsInsecure(secret) {
  return INSECURE_SECRETS.has(secret) || /change-me/i.test(secret) || secret.length < 16;
}

if (config.isProd && secretIsInsecure(config.jwt.secret)) {
  throw new Error(
    '[config] JWT_SECRET is missing, too short, or using a known default. Set a strong ' +
      'JWT_SECRET (e.g. `node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"`) ' +
      'before starting in production.'
  );
}
