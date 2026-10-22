/**
 * Imports a question bank file (docs/question-bank.md):
 *
 *   npm run quiz:import -- data/atkins-12-concepts.json
 *   npm run quiz:import -- data/atkins-12-concepts.json --replace
 *
 * Into the database of .env (SQLite or Neon). Questions keep their id across
 * imports: a corrected question is updated in place, a removed one is kept for
 * the tests that used it. --replace allows another book, or a unit moved to
 * another topic.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { openDatabase, type Database } from "./db/index.ts";
import { migrate } from "./db/migrate.ts";
import { parseBankFile } from "../shared/quiz/bank-file.ts";
import { BankImportRefused, BankStore, type BankImportReport } from "./quiz-bank.ts";

export async function importBankFile(db: Database, path: string, replace = false): Promise<BankImportReport> {
  const file = parseBankFile(JSON.parse(readFileSync(path, "utf8")));
  return new BankStore(db).import(file, { replace });
}

const main = process.argv[1] ?? "";
if (/quiz-import\.[jt]s$/.test(main) && main === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const replace = args.includes("--replace");
  const path = args.find((a) => !a.startsWith("--"));
  if (!path || args.some((a) => a.startsWith("--") && a !== "--replace")) {
    console.error("usage: npm run quiz:import -- data/bank.json [--replace]");
    process.exit(2);
  }
  if (existsSync(".env")) process.loadEnvFile(".env");
  const db = await openDatabase();
  try {
    await migrate(db);
    const r = await importBankFile(db, path, replace).catch((error: unknown) => {
      if (error instanceof BankImportRefused) {
        console.error(`${db.label}: ${error.message}`);
        process.exit(1);
      }
      throw error;
    });
    console.log(
      `${db.label}, bank "${r.book}": ${r.units} units, ${r.questions} questions ` +
        `(${r.added} new, ${r.updated} corrected, ${r.removed} removed), revision ${r.revision}`,
    );
  } finally {
    await db.close();
  }
}
