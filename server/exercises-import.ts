/**
 * Imports an exercise book made by tools/exercises-extract.py (docs/exercises.md):
 *
 *   npm run exercises:import -- data/exercises/grammar-in-use-5
 *
 * Into the database of .env (SQLite or Neon). Importing a book again updates
 * its exercises in place; the players' answers stay. A new book is the
 * owner's only until shared from Account › Owner.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { openDatabase } from "./db/index.ts";
import { migrate } from "./db/migrate.ts";
import { ExerciseStore } from "./exercises.ts";

const main = process.argv[1] ?? "";
if (/exercises-import\.[jt]s$/.test(main) && main === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (dirs.length === 0) {
    console.error("usage: npm run exercises:import -- data/exercises/<book> [more books]");
    process.exit(2);
  }
  if (existsSync(".env")) process.loadEnvFile(".env");
  const db = await openDatabase();
  try {
    await migrate(db);
    const store = new ExerciseStore(db);
    for (const dir of dirs) {
      const r = await store.importFolder(dir);
      console.log(`${db.label}, "${r.book}": ${r.units} units, ${r.exercises} exercises (${r.added} new, ${r.updated} updated, ${r.removed} removed), revision ${r.revision}`);
    }
  } finally {
    await db.close();
  }
}
