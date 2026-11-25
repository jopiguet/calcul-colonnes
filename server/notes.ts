/**
 * The note books (docs/notes.md), built by npm run notes:build into content/notes/: imported at start whenever
 * they change (their hash, with their pictures' and sounds', in app_settings), shared with every account.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Database } from "./db/index.ts";
import { parseVocabFile } from "../shared/vocab/format.ts";
import { readImages, readSounds } from "./vocab-import.ts";
import { VocabStore } from "./vocab.ts";
import { NOTES_DIR } from "./notes-build.ts";

export const NOTE_BOOKS = ["ear.json", "staff.json"];

export async function importNoteBooks(db: Database, dir = NOTES_DIR): Promise<string[]> {
  const store = new VocabStore(db);
  const done: string[] = [];
  for (const name of NOTE_BOOKS) {
    const path = join(dir, name);
    if (!existsSync(path)) continue;
    const file = parseVocabFile(JSON.parse(readFileSync(path, "utf8")));
    const images = readImages(file, path);
    const sounds = readSounds(file, path);
    const hash = createHash("sha256").update(JSON.stringify(file)).digest("hex");
    const key = `notes-book:${file.book.id}`;
    const known = (await db.query("SELECT value FROM app_settings WHERE key = $1", [key]))[0]?.value;
    if (known === hash) continue;
    await store.import(file, { replace: true, images, sounds });
    const id = (await db.query("SELECT id FROM vocab_books WHERE slug = $1", [file.book.id]))[0]?.id;
    if (id !== undefined) await store.setVisibility(Number(id), "shared");
    await db.query("DELETE FROM app_settings WHERE key = $1", [key]);
    await db.query("INSERT INTO app_settings (key, value) VALUES ($1, $2)", [key, hash]);
    done.push(file.book.id);
  }
  return done;
}
