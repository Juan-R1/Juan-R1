import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the CruceEP end-to-end happy-path test.
 *
 * Run with:  npm run test:e2e
 * First time: npx playwright install chromium
 *
 * This boots the production server on port 3100 with mock providers (no
 * Supabase required) so the core flow is fully testable offline.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run build && npm run start -- --port 3100",
    url: "http://localhost:3100",
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
