import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Database } from "./index.ts";

const MIGRATIONS = fileURLToPath(new URL("../migrations", import.meta.url));

/**
 * Applies the pending files of server/migrations, in order.
 * A step is `NNN_name.sql` (both engines) or `NNN_name.<dialect>.sql`.
 * Each step and its bookkeeping row run in one transaction.
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
    try {
      await db.exec(
        `BEGIN;\n${sql}\nINSERT INTO schema_migrations (version) VALUES (${version});\nCOMMIT;`,
      );
    } catch (error) {
      await db.exec("ROLLBACK").catch(() => undefined);
      throw new Error(`migration ${file} failed: ${(error as Error).message}`);
    }
    applied.push(version);
  }
  return applied;
}
