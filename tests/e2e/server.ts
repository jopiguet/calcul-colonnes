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
import { OWNER_EMAIL, OWNER_PASSWORD } from "./owner.ts";

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

// Before the server starts: the database ready (migrations, invented books and
// bank), an owner account the tests can sign in to, and the content shared
// with every account, so that each test's own account sees the books and the
// written questions as before (the family tests make them private again).
{
  const { openDatabase } = await import("../../server/db/index.ts");
  const { maintain } = await import("../../server/maintenance.ts");
  const { AuthStore } = await import("../../server/auth/store.ts");
  const { hashPassword } = await import("../../server/auth/passwords.ts");
  const db = await openDatabase();
  await maintain(db);
  const store = new AuthStore(db);
  const { account } = await store.createAccount(OWNER_EMAIL, "Owner");
  await store.addCredential({ accountId: account.id, playerId: null, type: "password", provider: "", subject: OWNER_EMAIL, secret: await hashPassword(OWNER_PASSWORD), label: OWNER_EMAIL });
  await db.query("UPDATE vocab_books SET visibility = 'shared'");
  await db.query("UPDATE exercise_books SET visibility = 'shared'");
  await db.query("INSERT INTO app_settings (key, value) VALUES ('bank_visibility', 'shared')");
  await db.close();
}

await import("../../server/index.ts");
