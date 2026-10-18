import { defineConfig } from "@playwright/test";

/**
 * Browser tests: `npm run test:e2e`.
 *
 * Playwright builds the app and starts its own server on a separate port with
 * a fresh SQLite file (test-results/e2e.sqlite), so a developer's database —
 * SQLite or Neon — is never touched: variables set here win over `.env`.
 */
const PORT = 8799;

export default defineConfig({
  testDir: "tests/e2e",
  // One shared server and database: run the files one after the other.
  workers: 1,
  fullyParallel: false,
  timeout: 90_000,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    browserName: "chromium",
    viewport: { width: 430, height: 900 },
    locale: "fr-FR",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run build && npx tsx tests/e2e/server.ts",
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: { PORT: String(PORT), SQLITE_PATH: "test-results/e2e.sqlite", DATABASE_URL: "" },
  },
});
