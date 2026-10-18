import { existsSync } from "node:fs";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createApp } from "./app.ts";
import { authConfigFromEnv } from "./auth/config.ts";
import { providersFromEnv } from "./auth/providers.ts";
import { AuthStore } from "./auth/store.ts";
import { openDatabase } from "./db/index.ts";
import { migrate } from "./db/migrate.ts";
import { Repository } from "./repository.ts";

// Load .env explicitly, so the server never starts on silently missing settings.
if (existsSync(".env")) process.loadEnvFile(".env");

const db = await openDatabase();
const applied = await migrate(db);
console.log(`database: ${db.label}`);
if (applied.length > 0) console.log(`migrations applied: ${applied.join(", ")}`);
const rebuilt = await new Repository(db).backfillQuizAnswers();
if (rebuilt > 0) console.log(`answers rebuilt from their seed for ${rebuilt} earlier test(s)`);
const labelled = await new Repository(db).backfillMistakes();
if (labelled > 0) console.log(`mistakes labelled for ${labelled} earlier test(s)`);

const port = Number(process.env.PORT) || 8787;
const authConfig = authConfigFromEnv(process.env, port);
const providers = providersFromEnv(process.env);
console.log(
  `sign-in: email and password${[...providers.values()].map((p) => `, ${p.name}`).join("")}` +
    ` · ${authConfig.publicUrl.origin}${authConfig.secureCookies ? " (secure cookies)" : ""}` +
    ` · registration ${authConfig.registration}`,
);
const store = new AuthStore(db);
await store.deleteExpired();
setInterval(() => void store.deleteExpired().catch(() => undefined), 60 * 60 * 1000).unref();

const app = createApp(db, authConfig, providers);

// In production the same process serves the built app (npm run build → dist/).
if (existsSync("dist/index.html")) {
  app.use("/*", serveStatic({ root: "./dist" }));
} else {
  console.log("dist/ not found: API only (use `npm run dev`, or `npm run build` first)");
}

const server = serve({ fetch: app.fetch, port }, () => {
  console.log(`listening on http://localhost:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => void db.close().finally(() => process.exit(0)));
  });
}
