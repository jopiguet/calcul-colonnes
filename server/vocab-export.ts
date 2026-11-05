/**
 * Lists and exports vocabulary books (see docs/vocabulary.md#export):
 *
 *   npm run vocab:export -- --list
 *   npm run vocab:export -- course-malayalam test-german [--out data/export] [--images]
 *   npm run vocab:export -- --all [--out data/export] [--images]
 *
 * From the database of .env (SQLite or Neon). Each book is written as
 * <out>/<id>.json in format 3, the format vocab:import reads: importing it
 * again gives the same book. With --images, the pictures are written to
 * <out>/images/<hash>.<ext> and named in the entries; without, entries keep
 * their words and the file imports on its own.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDatabase } from "./db/index.ts";
import { migrate } from "./db/migrate.ts";
import { VocabStore } from "./vocab.ts";

const main = process.argv[1] ?? "";
if (/vocab-export\.[jt]s$/.test(main) && main === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const flag = (name: string): boolean => args.includes(name);
  const outAt = args.indexOf("--out");
  const out = outAt >= 0 ? args[outAt + 1] : "data/export";
  const slugs = args.filter((a, i) => !a.startsWith("--") && !(outAt >= 0 && i === outAt + 1));
  const known = new Set(["--list", "--all", "--images", "--out"]);
  if (!out || args.some((a) => a.startsWith("--") && !known.has(a)) || (!flag("--list") && !flag("--all") && slugs.length === 0)) {
    console.error("usage: npm run vocab:export -- --list | --all | <book id>… [--out data/export] [--images]");
    process.exit(2);
  }
  if (existsSync(".env")) process.loadEnvFile(".env");
  const db = await openDatabase();
  try {
    await migrate(db);
    const store = new VocabStore(db);
    const books = await store.books(true);
    if (flag("--list")) {
      for (const b of books) {
        console.log(`${b.slug.padEnd(28)} ${b.kind.padEnd(12)} ${`${b.term}→${b.meaning}`.padEnd(8)} ${String(b.entries).padStart(6)} words  ${b.visibility.padEnd(8)} ${b.title}`);
      }
    } else {
      const chosen = flag("--all") ? books.map((b) => b.slug) : slugs;
      const unknown = chosen.filter((s) => !books.some((b) => b.slug === s));
      if (unknown.length) {
        console.error(`${db.label}: no book ${unknown.map((s) => `"${s}"`).join(", ")} (npm run vocab:export -- --list)`);
        process.exit(1);
      }
      mkdirSync(out, { recursive: true });
      for (const slug of chosen) {
        const exported = await store.exportBook(slug, true, flag("--images"));
        if (!exported) continue;
        for (const image of exported.images) {
          const stored = await store.image(image.hash, true);
          if (!stored) continue;
          mkdirSync(join(out, "images"), { recursive: true });
          writeFileSync(join(out, image.path), Buffer.from(stored.data, "base64"));
        }
        const path = join(out, `${slug}.json`);
        writeFileSync(path, `${JSON.stringify(exported.file, null, 1)}\n`);
        const entries = exported.file.lessons.reduce((sum, l) => sum + l.sections.reduce((t, s) => t + s.entries.length, 0), 0);
        console.log(`${path}: ${exported.file.lessons.length} lessons, ${entries} entries${exported.images.length ? `, ${exported.images.length} pictures` : ""}`);
      }
    }
  } finally {
    await db.close();
  }
}
