import { defineConfig } from '@playwright/test';

// End-to-end config. Boots the full dev stack (Vite client + API) and runs the
// specs in e2e/ against it.
//
// First-time setup (browsers are not installed by `npm install`):
//   npm install
//   npx playwright install chromium
//   npm run test:e2e
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  // Start client + server together; Vite proxies /api to the backend.
  webServer: {
    command: 'npm run dev:all',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
