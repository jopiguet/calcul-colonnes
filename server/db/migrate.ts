import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Database } from "./index.ts";

/**
 * server/migrations beside the sources (server/db/../migrations), or
 * migrations/ beside the bundle (dist-server/migrations, copied by
 * `npm run build:server`).
 */
const MIGRATIONS = [new URL("../migrations", import.meta.url), new URL("./migrations", import.meta.url)]
  .map((url) => fileURLToPath(url))
  .find((dir) => existsSync(join(dir, "001_init.sqlite.sql"))) ?? fileURLToPath(new URL("../migrations", import.meta.url));

/**
 * Applies the pending files of server/migrations, in order.
 * A step is `NNN_name.sql` (both engines) or `NNN_name.<dialect>.sql`.
 * Each step and its bookkeeping row run in one transaction.
 *
 * A SQLite step that rebuilds a table referenced by others starts with the line
 * "-- sqlite: foreign keys off": foreign keys are then switched off around its
 * transaction (SQLite ignores the switch inside one), so dropping the old table
 * does not cascade, and checked before they are switched on again.
 */
export async function migrate(db: Database): Promise<number[]> {
  await db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY)");
  const done = new Set(
    (await db.query("SELECT version FROM schema_migrations")).map((row) => Number(row.version)),
  );

  const steps = new Map<number, string>();
  for (const file of readdirSync(MIGRATIONS).sort()) {
    const match = /^(\d+)_[^.]+(?:\.(sqlite|postgres))?\.sql$/.exec(file);
    if (!match || (match[2] && match[2] !== db.dialect)) continue;
    const version = Number(match[1]);
    if (steps.has(version)) throw new Error(`migration ${version} is defined twice for ${db.dialect}`);
    steps.set(version, file);
  }

  const applied: number[] = [];
  for (const [version, file] of [...steps].sort((a, b) => a[0] - b[0])) {
    if (done.has(version)) continue;
    const sql = readFileSync(join(MIGRATIONS, file), "utf8");
    const keysOff = db.dialect === "sqlite" && sql.startsWith("-- sqlite: foreign keys off");
    if (keysOff) await db.exec("PRAGMA foreign_keys = OFF");
    try {
      await db.exec(
        `BEGIN;\n${sql}\nINSERT INTO schema_migrations (version) VALUES (${version});\nCOMMIT;`,
      );
      if (keysOff) {
        const broken = await db.query("PRAGMA foreign_key_check");
        if (broken.length > 0) throw new Error(`foreign keys broken: ${JSON.stringify(broken.slice(0, 3))}`);
      }
    } catch (error) {
      await db.exec("ROLLBACK").catch(() => undefined);
      throw new Error(`migration ${file} failed: ${(error as Error).message}`);
    } finally {
      if (keysOff) await db.exec("PRAGMA foreign_keys = ON");
    }
    applied.push(version);
  }
  return applied;
}
