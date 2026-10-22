/**
 * Questions flagged by players from the corrections of a test:
 *
 *   npm run quiz:flags                  # the open ones, with the question
 *   npm run quiz:flags -- --resolve 12  # mark flag 12 as dealt with
 *
 * Against the database of .env (SQLite or Neon).
 */
import { existsSync } from "node:fs";
import { openDatabase } from "./db/index.ts";
import { migrate } from "./db/migrate.ts";
import { BankStore } from "./quiz-bank.ts";

if (existsSync(".env")) process.loadEnvFile(".env");
const args = process.argv.slice(2);
const db = await openDatabase();
try {
  await migrate(db);
  const store = new BankStore(db);
  const resolve = args.indexOf("--resolve");
  if (resolve >= 0) {
    const id = Number(args[resolve + 1]);
    console.log((await store.resolveFlag(id)) ? `flag ${id} resolved` : `no open flag ${id}`);
  } else {
    const flags = await store.openFlags();
    const bank = await store.load();
    const byId = new Map(bank.questions.map((q) => [q.id, q]));
    if (flags.length === 0) console.log("no open flag");
    for (const f of flags) {
      const q = byId.get(f.question);
      console.log(`#${f.id}  ${new Date(f.at).toISOString().slice(0, 16)}  ${f.user}  ${f.skill}`);
      console.log(q ? `   ${q.id} (${q.section}): ${q.prompt.en}\n   ✓ ${q.correct.en}` : `   ${f.question}`);
      if (f.note) console.log(`   note: ${f.note}`);
    }
  }
} finally {
  await db.close();
}
