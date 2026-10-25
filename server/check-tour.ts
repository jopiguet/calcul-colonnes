/**
 * Checks of the guided tour (npm run check:tour), on a fresh SQLite file
 * through the real routes: a new account and a player on their own login
 * see it once, finishing it is kept, and accounts from before the tour are
 * not shown it. The tour's pages: the same in every language, and every
 * chip a label the app really shows (docs/user-guide.md#guided-tour).
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "./app.ts";
import type { AuthConfig } from "./auth/config.ts";
import { TOUR_TEXTS, tourSteps } from "../src/tour-texts.ts";

let failures = 0;
let checks = 0;
function expect(label: string, actual: unknown, wanted: unknown): void {
  checks++;
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    failures++;
    console.error(`✘ ${label}: got ${JSON.stringify(actual)}, wanted ${JSON.stringify(wanted)}`);
  }
}

// ------------------------------------------------------------- the pages
const langs = ["fr", "es", "en"] as const;
for (const player of [false, true]) {
  const ids = (lang: (typeof langs)[number]) => tourSteps(player, lang).map((s) => s.id);
  for (const lang of langs) expect(`${lang} pages (${player ? "player" : "account"})`, ids(lang), ids("fr"));
}
expect("a player's login skips the account pages", tourSteps(true, "fr").some((s) => s.id === "players" || s.id === "account"), false);
// Every chip names a label of the app: found, as written, in another source file.
const sources: string[] = [];
const walk = (dir: string): void => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith(".ts") && !path.endsWith("tour-texts.ts")) sources.push(readFileSync(path, "utf8"));
  }
};
walk(new URL("../src", import.meta.url).pathname);
const everything = sources.join("\n");
for (const lang of langs) {
  for (const step of TOUR_TEXTS[lang].steps) {
    for (const chip of step.chips ?? []) {
      // The player's chip stands for the player's name; the tour's own link is checked below.
      if (chip.startsWith("👤") || chip === TOUR_TEXTS[lang].link) continue;
      const bare = chip.replace(/^[^\p{L}\d]+\s/u, "");
      checks++;
      if (!everything.includes(`"${chip}"`) && !everything.includes(`"${bare}"`) && !everything.includes(chip)) {
        failures++;
        console.error(`✘ ${lang} ${step.id}: the chip "${chip}" is no label of the app`);
      }
    }
  }
  expect(`${lang}: the welcome page names the footer link`, TOUR_TEXTS[lang].steps[0]!.chips, [TOUR_TEXTS[lang].link]);
}

// -------------------------------------------------------------- the server
const dir = mkdtempSync(join(tmpdir(), "luma-tour-"));
const { openDatabase } = await import("./db/index.ts");
const db = await openDatabase({ databaseUrl: "", sqlitePath: join(dir, "tour.sqlite") }).catch(() => null);
if (!db) {
  console.log("tour checks: skipped (SQLite not installed)");
  process.exit(0);
}
try {
  const { migrate } = await import("./db/migrate.ts");
  await migrate(db);
  const config: AuthConfig = {
    publicUrl: new URL("http://localhost:8787"),
    secureCookies: false,
    sessionDays: 30,
    registration: "open",
    trustProxy: true,
    attemptsPerAddress: 1000,
    privacyHosting: "EU",
    privacyContact: "owner@example.test",
  };
  const app = createApp(db, config, new Map());
  const browser = () => {
    let cookie = "";
    return async (method: string, path: string, body?: unknown): Promise<{ status: number; json: Record<string, unknown> | null }> => {
      const response = await app.request(path, {
        method,
        headers: { "cf-connecting-ip": "127.0.0.1", ...(body ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const set = response.headers.get("set-cookie");
      if (set) cookie = set.split(";")[0]!;
      const text = await response.text();
      return { status: response.status, json: text ? (JSON.parse(text) as Record<string, unknown>) : null };
    };
  };
  const onboarded = async (b: ReturnType<typeof browser>) => (await b("GET", "/api/auth/session")).json?.onboarded;

  const stranger = browser();
  expect("signed out: refused", (await stranger("POST", "/api/auth/onboarded")).status, 401);

  const ana = browser();
  expect("sign-up", (await ana("POST", "/api/auth/register", { name: "Ana", email: "ana@example.test", password: "correct horse battery" })).status, 201);
  expect("a new account: tour not seen", await onboarded(ana), false);
  expect("tour finished", (await ana("POST", "/api/auth/onboarded")).status, 204);
  expect("then seen", await onboarded(ana), true);
  const first = (await db.query("SELECT onboarded_at FROM accounts WHERE email = 'ana@example.test'"))[0]!.onboarded_at;
  await ana("POST", "/api/auth/onboarded"); // opened again from the footer
  expect("the first time is kept", (await db.query("SELECT onboarded_at FROM accounts WHERE email = 'ana@example.test'"))[0]!.onboarded_at, first);
  const exported = (await ana("GET", "/api/export")).json as { account: { onboarded_at: unknown } };
  expect("in the export", typeof exported.account.onboarded_at, "number");

  // A player with their own login sees it on their own, once.
  const leo = (await ana("POST", "/api/users", { name: "Léo" })).json as { id: number };
  expect("own login", (await ana("POST", `/api/auth/players/${leo.id}/password`, { username: "leo", password: "correct horse battery" })).status, 201);
  const own = browser();
  expect("player signs in", (await own("POST", "/api/auth/login", { identifier: "leo", password: "correct horse battery" })).status, 200);
  expect("player: tour not seen", await onboarded(own), false);
  await own("POST", "/api/auth/onboarded");
  expect("player: then seen", await onboarded(own), true);
  expect("the account's flag untouched", (await db.query("SELECT onboarded_at FROM accounts WHERE email = 'ana@example.test'"))[0]!.onboarded_at, first);

  // Accounts and players from before the tour: migration 023 marks them seen.
  await db.exec("DELETE FROM schema_migrations WHERE version = 23");
  await db.exec("ALTER TABLE accounts DROP COLUMN onboarded_at");
  await db.exec("ALTER TABLE users DROP COLUMN onboarded_at");
  await migrate(db);
  expect("existing accounts: seen", (await db.query("SELECT COUNT(*) AS n FROM accounts WHERE onboarded_at IS NULL"))[0]!.n, 0);
  expect("existing players: seen", (await db.query("SELECT COUNT(*) AS n FROM users WHERE onboarded_at IS NULL"))[0]!.n, 0);
} finally {
  await db.close();
  rmSync(dir, { recursive: true, force: true });
}

if (failures > 0) {
  console.error(`${failures} of ${checks} tour checks failed`);
  process.exit(1);
}
console.log(`tour checks passed (${checks})`);
