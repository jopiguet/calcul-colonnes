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
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { openDatabase, type Database } from "./db/index.ts";
import { migrate } from "./db/migrate.ts";
import { parseVocabFile, type VocabFile } from "../shared/vocab/format.ts";
import { ImportRefused, VocabStore, type ImportReport, type VocabImage } from "./vocab.ts";

/** Largest picture accepted: a page of a picture dictionary, rendered at twice its size, is well under. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** The picture's type by its first bytes, whatever its name says; null for anything else. */
export function imageType(bytes: Uint8Array): string | null {
  const at = (offset: number, ...values: number[]) => values.every((v, i) => bytes[offset + i] === v);
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (at(0, 0xff, 0xd8, 0xff)) return "image/jpeg";
  if (at(0, 0x47, 0x49, 0x46, 0x38)) return "image/gif";
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "image/webp";
  return null;
}

/**
 * Reads the pictures a file names, relative to the file's folder, and puts
 * each one's SHA-256 in its entries' "image": a picture shown by several
 * entries (a scene, a labelled diagram) is stored once. A missing,
 * oversized or unknown picture stops the import, naming it.
 */
export function readImages(file: VocabFile, path: string): VocabImage[] {
  const folder = resolve(dirname(path));
  const byPath = new Map<string, VocabImage>();
  for (const lesson of file.lessons) {
    for (const section of lesson.sections) {
      for (const entry of section.entries) {
        if (!entry.image) continue;
        let image = byPath.get(entry.image);
        if (!image) {
          const target = resolve(folder, entry.image);
          const inside = relative(folder, target);
          if (!inside || inside.startsWith("..") || inside.startsWith(sep)) throw new Error(`picture ${entry.image}: outside the file's folder`);
          if (!existsSync(target)) throw new Error(`picture ${entry.image}: not found beside ${path}`);
          if (statSync(target).size > MAX_IMAGE_BYTES) throw new Error(`picture ${entry.image}: over ${MAX_IMAGE_BYTES / 1024 / 1024} MB`);
          const bytes = readFileSync(target);
          const mime = imageType(bytes);
          if (!mime) throw new Error(`picture ${entry.image}: not a PNG, JPEG, WebP or GIF`);
          image = { hash: createHash("sha256").update(bytes).digest("hex"), mime, data: bytes.toString("base64") };
          byPath.set(entry.image, image);
        }
        entry.image = image.hash;
      }
    }
  }
  return [...new Map([...byPath.values()].map((i) => [i.hash, i])).values()];
}

/** A recording's type, from its first bytes: MP3 (with or without an ID3 tag), Ogg (Vorbis, Opus), MP4 audio, WAV. */
export function audioType(bytes: Uint8Array): string | null {
  const at = (offset: number, ...values: number[]): boolean => values.every((v, i) => bytes[offset + i] === v);
  if (at(0, 0x49, 0x44, 0x33) || (bytes[0] === 0xff && ((bytes[1] ?? 0) & 0xe0) === 0xe0)) return "audio/mpeg";
  if (at(0, 0x4f, 0x67, 0x67, 0x53)) return "audio/ogg";
  if (at(4, 0x66, 0x74, 0x79, 0x70)) return "audio/mp4";
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x41, 0x56, 0x45)) return "audio/wav";
  return null;
}

/** A recording's size limit: a few seconds of song, not a whole dawn chorus. */
export const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

/**
 * Reads the recordings a sound book names, relative to the file's folder, and puts each one's SHA-256 in its
 * entries' "audio". A missing, oversized or unknown recording stops the import, naming it.
 */
export function readSounds(file: VocabFile, path: string): VocabImage[] {
  const folder = resolve(dirname(path));
  const byPath = new Map<string, VocabImage>();
  for (const entry of file.lessons.flatMap((l) => l.sections.flatMap((s) => s.entries))) {
    if (!entry.audio) continue;
    let sound = byPath.get(entry.audio);
    if (!sound) {
      const target = resolve(folder, entry.audio);
      const inside = relative(folder, target);
      if (!inside || inside.startsWith("..") || inside.startsWith(sep)) throw new Error(`recording ${entry.audio}: outside the file's folder`);
      if (!existsSync(target)) throw new Error(`recording ${entry.audio}: not found beside ${path}`);
      if (statSync(target).size > MAX_AUDIO_BYTES) throw new Error(`recording ${entry.audio}: over ${MAX_AUDIO_BYTES / 1024 / 1024} MB (npm run birds:fetch trims to 20 seconds)`);
      const bytes = readFileSync(target);
      const mime = audioType(bytes);
      if (!mime) throw new Error(`recording ${entry.audio}: not an MP3, Ogg, M4A or WAV file`);
      sound = { hash: createHash("sha256").update(bytes).digest("hex"), mime, data: bytes.toString("base64") };
      byPath.set(entry.audio, sound);
    }
    entry.audio = sound.hash;
  }
  return [...new Map([...byPath.values()].map((i) => [i.hash, i])).values()];
}

/** The id of the book a file holds, without importing it. */
export function bookIdOf(path: string): string {
  return parseVocabFile(JSON.parse(readFileSync(path, "utf8"))).book.id;
}

export async function importVocabFile(db: Database, path: string, replace = false): Promise<ImportReport> {
  const file = parseVocabFile(JSON.parse(readFileSync(path, "utf8")));
  const images = readImages(file, path);
  const sounds = readSounds(file, path);
  return new VocabStore(db).import(file, { replace, images, sounds });
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
        `(${r.added} new, ${r.changed} corrected, ${r.removed} removed)` +
        (r.images ? `, ${r.images} pictures stored` : "") +
        (r.sounds ? `, ${r.sounds} recordings stored` : ""),
    );
  } finally {
    await db.close();
  }
}
