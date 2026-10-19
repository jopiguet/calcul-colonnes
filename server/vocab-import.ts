/**
 * Imports a vocabulary file (see docs/vocabulary.md):
 *
 *   npm run vocab:import -- data/vocab.json
 *
 * Into the database of .env (SQLite or Neon). Importing again after a new
 * extraction keeps the players' progress on entries that did not change.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { openDatabase, type Database } from "./db/index.ts";
import { migrate } from "./db/migrate.ts";
import { parseVocabFile } from "../shared/vocab/format.ts";
import { VocabStore, type ImportReport } from "./vocab.ts";

export async function importVocabFile(db: Database, path: string): Promise<ImportReport> {
  const file = parseVocabFile(JSON.parse(readFileSync(path, "utf8")));
  return new VocabStore(db).import(file);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: npm run vocab:import -- data/vocab.json");
    process.exit(2);
  }
  if (existsSync(".env")) process.loadEnvFile(".env");
  const db = await openDatabase();
  try {
    await migrate(db);
    const r = await importVocabFile(db, path);
    console.log(
      `${db.label}: ${r.lessons} lessons, ${r.sections} sections, ${r.entries} entries ` +
        `(${r.added} new, ${r.removed} removed)`,
    );
  } finally {
    await db.close();
  }
}
