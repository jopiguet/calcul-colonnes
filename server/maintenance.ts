import { existsSync } from "node:fs";
import { AuthStore } from "./auth/store.ts";
import type { Database } from "./db/index.ts";
import { migrate } from "./db/migrate.ts";
import { Repository } from "./repository.ts";
import { log } from "./runtime.ts";
import { bookIdOf, importVocabFile } from "./vocab-import.ts";
import { VocabStore } from "./vocab.ts";

/**
 * Everything the database needs before a server version may serve it:
 * migrations, answers and mistakes rebuilt for older tests, vocabulary books
 * from VOCAB_FILE not yet imported, expired sessions removed.
 *
 * Locally it runs at every start (as before). On Cloud Run it runs once per
 * release as a job (`node dist-server/index.js maintenance`), so instances
 * start fast and two instances never migrate at the same time.
 */
export async function maintain(db: Database): Promise<void> {
  const applied = await migrate(db);
  if (applied.length > 0) log.info(`migrations applied: ${applied.join(", ")}`);

  const repository = new Repository(db);
  const rebuilt = await repository.backfillQuizAnswers();
  if (rebuilt > 0) log.info(`answers rebuilt from their seed for ${rebuilt} earlier test(s)`);
  const labelled = await repository.backfillMistakes();
  if (labelled > 0) log.info(`mistakes labelled for ${labelled} earlier test(s)`);

  // VOCAB_FILE: one or more files, comma-separated. Each book not yet on the
  // server is imported once; later changes: npm run vocab:import.
  const vocabFiles = (process.env.VOCAB_FILE ?? "").split(",").map((f) => f.trim()).filter(Boolean);
  if (vocabFiles.length > 0) {
    const present = new Set((await new VocabStore(db).books()).map((b) => b.slug));
    for (const file of vocabFiles) {
      if (!existsSync(file)) {
        log.warn(`vocabulary: VOCAB_FILE ${file} not found`);
        continue;
      }
      if (present.has(bookIdOf(file))) continue;
      const report = await importVocabFile(db, file);
      log.info(`vocabulary imported from ${file}: book "${report.book}", ${report.lessons} lessons, ${report.entries} entries`);
    }
  }

  await new AuthStore(db).deleteExpired();
}
