/**
 * Imports a vocabulary file (see docs/vocabulary.md):
 *
 *   npm run vocab:import -- data/vocab.json
 *   npm run vocab:import -- data/vocab.json --replace
 *
 * Into the database of .env (SQLite or Neon). Importing again after a new
 * extraction keeps the players' progress on entries that did not change.
 * A file that would overwrite another book (same id, another language) or
 * remove much of one with progress on it is refused, unless --replace.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { openDatabase, type Database } from "./db/index.ts";
import { migrate } from "./db/migrate.ts";
import { parseVocabFile } from "../shared/vocab/format.ts";
import { ImportRefused, VocabStore, type ImportReport } from "./vocab.ts";

/** The id of the book a file holds, without importing it. */
export function bookIdOf(path: string): string {
  return parseVocabFile(JSON.parse(readFileSync(path, "utf8"))).book.id;
}

export async function importVocabFile(db: Database, path: string, replace = false): Promise<ImportReport> {
  const file = parseVocabFile(JSON.parse(readFileSync(path, "utf8")));
  return new VocabStore(db).import(file, { replace });
}

// Run as a command only when this file itself is the program: bundled into
// dist-server/index.js, import.meta.url is the bundle's, and the name check
// keeps the server from taking its arguments for a vocabulary file.
const main = process.argv[1] ?? "";
if (/vocab-import\.[jt]s$/.test(main) && main === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const replace = args.includes("--replace");
  const path = args.find((a) => !a.startsWith("--"));
  if (!path || args.some((a) => a.startsWith("--") && a !== "--replace")) {
    console.error("usage: npm run vocab:import -- data/vocab.json [--replace]");
    process.exit(2);
  }
  if (existsSync(".env")) process.loadEnvFile(".env");
  const db = await openDatabase();
  try {
    await migrate(db);
    const r = await importVocabFile(db, path, replace).catch((error: unknown) => {
      if (error instanceof ImportRefused) {
        console.error(`${db.label}: ${error.message}`);
        process.exit(1);
      }
      throw error;
    });
    console.log(
      `${db.label}, book "${r.book}": ${r.lessons} lessons, ${r.sections} sections, ${r.entries} entries ` +
        `(${r.added} new, ${r.removed} removed)`,
    );
  } finally {
    await db.close();
  }
}
