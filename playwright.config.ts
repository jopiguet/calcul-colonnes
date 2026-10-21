import { defineConfig } from "@playwright/test";

/**
 * Browser tests: `npm run test:e2e`.
 *
 * Playwright builds the app and starts its own server on a separate port with
 * a fresh SQLite file (test-results/e2e.sqlite), so a developer's database —
 * SQLite or Neon — is never touched: variables set here win over `.env`.
 * E2E_DATABASE_URL=postgresql://… runs the same suite on PostgreSQL (emptied
 * first), as CI does.
 */
const PORT = 8799;
const MOCK_PORT = 8798;

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
  webServer: [
    {
      // Stands in for Google, Microsoft and GitHub (tests/e2e/mock-oidc.ts).
      command: "npx tsx tests/e2e/mock-oidc.ts",
      url: `http://localhost:${MOCK_PORT}/.well-known/openid-configuration`,
      reuseExistingServer: false,
      env: { MOCK_OIDC_PORT: String(MOCK_PORT) },
    },
    {
      command: "npm run build && npx tsx tests/e2e/server.ts",
      url: `http://localhost:${PORT}/api/health`,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        PORT: String(PORT),
        SQLITE_PATH: "test-results/e2e.sqlite",
        DATABASE_URL: "",
        // Set to run the suite on PostgreSQL instead (emptied first): see tests/e2e/server.ts.
        E2E_DATABASE_URL: process.env.E2E_DATABASE_URL ?? "",
        PUBLIC_URL: `http://localhost:${PORT}`,
        COOKIE_SECURE: "false",
        REGISTRATION: "open",
        // Every test signs up from the same address.
        AUTH_ATTEMPTS_PER_ADDRESS: "10000",
        // An invented vocabulary (never a book's content), imported at startup.
        VOCAB_FILE:
          "tests/e2e/fixtures/vocab.json,tests/e2e/fixtures/vocab-english.json,tests/e2e/fixtures/vocab-japanese.json,tests/e2e/fixtures/characters.json",
        // Only the mock provider: real ones from a developer's .env are switched off.
        GOOGLE_CLIENT_ID: "",
        MICROSOFT_CLIENT_ID: "",
        GITHUB_CLIENT_ID: "",
        OIDC_ISSUER: `http://localhost:${MOCK_PORT}`,
        OIDC_CLIENT_ID: "test-client",
        OIDC_CLIENT_SECRET: "test-secret",
        OIDC_NAME: "Mock ID",
        OIDC_ID: "mock",
      },
    },
  ],
});
