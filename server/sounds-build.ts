/**
 * npm run sounds:build [-- <course>…] — makes the sounds of the courses
 * (docs/sounds.md): every word of a lesson text that can be listened to, and
 * every letter card, spoken by eSpeak NG and kept as a small MP3 in
 * content/courses/<id>/sounds/, listed in content/courses/<id>/sounds.json.
 *
 * eSpeak NG (the espeak-ng package, GPL) and ffmpeg are tools of this build
 * only: neither is part of the app, which serves the files made here.
 * A sound already made is kept (its file is named after what it says); a
 * sound no longer listed is removed. --check (npm run check:sounds) makes
 * nothing and fails when a sound is missing or sounds.json is out of date.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { TRANSLATION_LANGS as LANGS, type TranslationLang as Lang } from "../shared/vocab/format.ts";
import { contentDir, courses } from "./lessons.ts";
import { speakerFor, type Speech } from "./pronounce.ts";

const dom = new JSDOM("<!doctype html><body></body>");
(globalThis as Record<string, unknown>).document = dom.window.document;
const { parseMarkdown, renderBlock } = await import("../src/markdown.ts");
const { soundKey, soundTargets } = await import("../src/sound-targets.ts");

export interface SoundsFile {
  engine: string;
  /** Key (the word as written) → its file, and how it reads when the key is a transliteration. */
  items: Record<string, { file: string; reading?: string }>;
}

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const only = args.filter((a) => !a.startsWith("--"));
const SPEED = "135";

/** The words of a lesson text that can be listened to, as the browser finds them. */
function keysOf(markdown: string): Set<string> {
  const box = document.createElement("div");
  for (const block of parseMarkdown(markdown)) box.append(renderBlock(block));
  return new Set(soundTargets(box).map((n) => soundKey(n.textContent ?? "")));
}

const fileOf = (s: Speech): string => `${createHash("sha1").update(`${s.voice}\0${SPEED}\0${s.input}`).digest("hex").slice(0, 12)}.mp3`;

let espeak: typeof import("espeak-ng").default | null = null;
async function synthesize(s: Speech, out: string): Promise<void> {
  espeak ??= (await import("espeak-ng")).default;
  const errors: string[] = [];
  const e = await espeak({ arguments: ["-v", s.voice, "-s", SPEED, "-w", "/out.wav", s.input], print: () => {}, printErr: (m: string) => errors.push(m) });
  const wav = join(tmpdir(), `luma-sound-${process.pid}.wav`);
  writeFileSync(wav, e.FS.readFile("/out.wav"));
  // Mono MP3, the silence before and after cut.
  const trim = "silenceremove=start_periods=1:start_threshold=-50dB";
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wav, "-af", `${trim},areverse,${trim},areverse`, "-ac", "1", "-ar", "22050", "-codec:a", "libmp3lame", "-b:a", "32k", out]);
  rmSync(wav, { force: true });
  if (errors.length) console.warn(`  ${s.input}: ${errors.join(" ")}`);
}

let missing = 0;
for (const c of courses().values()) {
  if (only.length && !only.includes(c.meta.id)) continue;
  const speak = speakerFor(c.meta.language);
  if (!speak) continue;
  const items = new Map<string, Speech>();
  for (const l of c.lessons) {
    const perLang = LANGS.map((lang: Lang) => {
      const keys = new Set<string>();
      for (const p of l.byLang[lang].parts) if (p.kind !== "exercise") for (const k of keysOf(p.markdown)) keys.add(k);
      return keys;
    });
    // Malayalam is spotted by its script; a transliteration must be the same in the three languages
    // of the lesson (an italic word of French alone is emphasis, not Egyptian).
    const keys = c.meta.language === "ml" ? new Set(perLang.flatMap((s) => [...s])) : [...perLang[0]!].filter((k) => perLang.every((s) => s.has(k)));
    for (const k of keys) {
      const s = speak(k);
      if (s) items.set(k, s);
    }
  }
  for (const lesson of c.letters?.lessons ?? []) for (const section of lesson.sections) for (const e of section.entries) {
    const s = speak(soundKey(e.term));
    if (s) items.set(soundKey(e.term), s);
  }

  const dir = join(contentDir(), c.meta.id, "sounds");
  mkdirSync(dir, { recursive: true });
  const file: SoundsFile = { engine: "eSpeak NG", items: {} };
  let made = 0;
  for (const key of [...items.keys()].sort()) {
    const s = items.get(key)!;
    const name = fileOf(s);
    if (!existsSync(join(dir, name))) {
      if (checkOnly) {
        missing++;
        console.error(`${c.meta.id}: no sound for "${key}"`);
      } else {
        await synthesize(s, join(dir, name));
        made++;
      }
    }
    file.items[key] = { file: name, ...(s.reading && s.reading !== key ? { reading: s.reading } : {}) };
  }
  if (checkOnly) {
    // sounds.json must be what this build would write: no word missing, none left over.
    const path = join(contentDir(), c.meta.id, "sounds.json");
    const saved = existsSync(path) ? JSON.stringify((JSON.parse(readFileSync(path, "utf8")) as SoundsFile).items) : "";
    if (saved !== JSON.stringify(file.items)) {
      missing++;
      console.error(`${c.meta.id}: sounds.json is out of date (npm run sounds:build)`);
    } else console.log(`${c.meta.id}: ${items.size} sounds`);
    continue;
  }
  const used = new Set(Object.values(file.items).map((i) => i.file));
  let removed = 0;
  for (const f of readdirSync(dir)) if (!used.has(f)) (rmSync(join(dir, f)), removed++);
  writeFileSync(join(contentDir(), c.meta.id, "sounds.json"), `${JSON.stringify(file, null, 1)}\n`);
  console.log(`${c.meta.id}: ${items.size} sounds (${made} made, ${removed} removed)`);
}
if (missing) process.exit(1);
