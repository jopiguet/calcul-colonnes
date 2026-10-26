import { readFileSync } from "node:fs";
import type { Bank } from "../../shared/quiz/index.ts";
import { parseBankFile, toBank } from "../../shared/quiz/bank-file.ts";

/** The invented banks the server imports at startup (playwright.config.ts), each at the revision its import made. */
export const FIXTURE_FILES = ["tests/e2e/fixtures/bank.json", "tests/e2e/fixtures/econ-bank.json", "tests/e2e/fixtures/calc-bank.json"];

/** The bank as the server holds it after its startup imports: one revision per file, in order. */
export function serverBank(): Bank {
  const parts = FIXTURE_FILES.map((file, i) => toBank(parseBankFile(JSON.parse(readFileSync(file, "utf8"))), i + 1));
  return {
    revision: parts.length,
    books: parts.flatMap((b) => b.books),
    units: parts.flatMap((b) => b.units),
    questions: parts.flatMap((b) => b.questions),
  };
}
