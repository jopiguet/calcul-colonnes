import { existsSync } from "node:fs";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createApp } from "./app.ts";
import { authConfigFromEnv } from "./auth/config.ts";
import { providersFromEnv } from "./auth/providers.ts";
import { AuthStore } from "./auth/store.ts";
import { configFromEnv, openDatabase } from "./db/index.ts";
import { maintain } from "./maintenance.ts";
import { log, onCloudRun } from "./runtime.ts";

/**
 * The server, or with the argument `maintenance` the database upkeep alone
 * (migrations, backfills, vocabulary import, purge), then exit:
 *
 *   npm start                     serve (upkeep first, as always locally)
 *   npm run maintenance           upkeep only
 *   node dist-server/index.js     serve, from the bundle (the container)
 *   node dist-server/index.js maintenance   the Cloud Run job of each release
 */

// Load .env explicitly, so the server never starts on silently missing settings.
if (existsSync(".env")) process.loadEnvFile(".env");

const command = process.argv[2] ?? "serve";
if (command !== "serve" && command !== "maintenance") {
  log.error(`unknown command "${command}": use serve or maintenance`);
  process.exit(2);
}

// A container's disk is wiped at every restart: on Cloud Run, SQLite would
// silently lose every account. Refuse to start instead.
if (onCloudRun && !configFromEnv().databaseUrl) {
  log.error("DATABASE_URL is required on Cloud Run (the container's disk is not kept)");
  process.exit(1);
}

const db = await openDatabase();
log.info(`database: ${db.label}`);

if (command === "maintenance") {
  try {
    await maintain(db);
    log.info("maintenance done");
    await db.close();
    process.exit(0);
  } catch (error) {
    log.error("maintenance failed", error);
    await db.close().catch(() => undefined);
    process.exit(1);
  }
}

// Locally and on a home server, the upkeep runs at every start, as before. On
// Cloud Run the release job has done it already, and instances start fast;
// STARTUP_MAINTENANCE=true|false overrides either default.
const startupMaintenance = process.env.STARTUP_MAINTENANCE?.trim()
  ? process.env.STARTUP_MAINTENANCE.trim() === "true"
  : !onCloudRun;
if (startupMaintenance) await maintain(db);

const port = Number(process.env.PORT) || 8787;
const authConfig = authConfigFromEnv(process.env, port);
const providers = providersFromEnv(process.env);
log.info(
  `sign-in: email and password${[...providers.values()].map((p) => `, ${p.name}`).join("")}` +
    ` · ${authConfig.publicUrl.origin}${authConfig.secureCookies ? " (secure cookies)" : ""}` +
    ` · registration ${authConfig.registration}`,
);

// Expired sessions are refused when read; this only keeps the table small. On
// Cloud Run the CPU sleeps between requests, so the release job purges instead.
if (!onCloudRun) {
  const store = new AuthStore(db);
  setInterval(() => void store.deleteExpired().catch(() => undefined), 60 * 60 * 1000).unref();
}

const app = createApp(db, authConfig, providers);

// In production the same process serves the built app (npm run build → dist/).
if (existsSync("dist/index.html")) {
  // Caching: the page and version.json are checked on every load, so a new
  // build shows up at once (an installed app included); the hashed files in
  // assets/ never change and are kept for a year; icons for a day.
  app.use("/*", async (c, next) => {
    await next();
    const path = c.req.path;
    if (path.startsWith("/api/") || c.res.status !== 200 || c.res.headers.has("Cache-Control")) return;
    const policy = path.startsWith("/assets/")
      ? "public, max-age=31536000, immutable"
      : path === "/" || path.endsWith(".html") || path === "/version.json" || path.endsWith(".webmanifest")
        ? "no-cache"
        : "public, max-age=86400";
    c.res.headers.set("Cache-Control", policy);
  });
  app.use("/*", serveStatic({ root: "./dist" }));
} else {
  log.warn("dist/ not found: API only (use `npm run dev`, or `npm run build` first)");
}

// HOST=127.0.0.1 behind a tunnel or reverse proxy: only the proxy can connect.
const hostname = process.env.HOST?.trim() || undefined;
const server = serve({ fetch: app.fetch, port, hostname }, () => {
  log.info(`listening on http://${hostname ?? "localhost"}:${port}${hostname ? "" : " (all interfaces)"}`);
});

// Cloud Run sends SIGTERM before stopping an instance: finish requests, close the pool.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => void db.close().finally(() => process.exit(0)));
  });
}
