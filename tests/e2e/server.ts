/**
 * Test server: starts the real server on a fresh database.
 *
 * - By default, a fresh SQLite file (SQLITE_PATH).
 * - With E2E_DATABASE_URL, a PostgreSQL database emptied first (its public
 *   schema dropped and recreated): CI runs the suite this way too, so the
 *   engine production uses is tested on every change. Never point it at a
 *   database you want to keep.
 */
import { rmSync } from "node:fs";

const postgres = process.env.E2E_DATABASE_URL?.trim();

if (postgres) {
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: postgres });
  await client.connect();
  await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await client.end();
  process.env.DATABASE_URL = postgres;
} else {
  const path = process.env.SQLITE_PATH;
  if (!path || process.env.DATABASE_URL) throw new Error("the test server must run on its own SQLite file");
  for (const suffix of ["", "-wal", "-shm"]) rmSync(path + suffix, { force: true });
}

await import("../../server/index.ts");
