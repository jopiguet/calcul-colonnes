/**
 * Builds the Characters book (kana and kanji) from the EDRDG dictionaries:
 *
 *   npm run characters:build                      # data/characters.json
 *   npm run characters:build -- out.json          # elsewhere
 *
 * Reads data/kanjidic2.xml.gz (or .xml) and data/JMdict_e.xml (or .gz) when
 * present; without them the book holds the kana only. The dictionaries and
 * the book stay in data/, never in the repository (docs/characters.md).
 *
 * The order is the Japanese school's: hiragana, katakana, then the kanji of
 * grades 1 to 6 (kyōiku kanji) and the other jōyō kanji of secondary school,
 * the most frequent first within each grade. A kanji's example words are
 * common words (JMdict priority tags) whose kanji all come at or before it in
 * the book: nothing in an example is still unknown.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { kanaToRomaji } from "../shared/vocab/kana.ts";
import type { VocabFile, VocabFileEntry } from "../shared/vocab/format.ts";

export const CHARACTERS_ID = "characters";
export const CREDIT =
  "Kanji: KANJIDIC2 and JMdict, property of the Electronic Dictionary Research and Development Group (EDRDG), " +
  "used under the Creative Commons Attribution-ShareAlike 4.0 licence (edrdg.org).";

/** Meanings and readings kept per kanji: enough to recognise it, short enough for a card. */
const MEANINGS = 3;
const ON_READINGS = 3;
const KUN_READINGS = 3;
const EXAMPLES = 3;
const KANJI_PER_SECTION = 10;
const SECONDARY_SECTIONS_PER_LESSON = 20;

// ------------------------------------------------------------------ kana

type Section = { title: string; subtitle: string; entries: VocabFileEntry[] };

/** The gojūon table, row by row, then the voiced rows and the contracted sounds. */
const ROWS = [
  "あいうえお", "かきくけこ", "さしすせそ", "たちつてと", "なにぬねの",
  "はひふへほ", "まみむめも", "やゆよ", "らりるれろ", "わをん",
];
const VOICED = ["がぎぐげご", "ざじずぜぞ", "だぢづでど", "ばびぶべぼ", "ぱぴぷぺぽ"];
const CONTRACTED = [["き", "し", "ち", "に"], ["ひ", "み", "り"], ["ぎ", "じ", "び", "ぴ"]];
/** Katakana for sounds Japanese borrowed: ティ (ti), ファ (fa)… */
const EXTENDED = ["ヴ", "ファ", "フィ", "フェ", "フォ", "ティ", "ディ", "トゥ", "ドゥ", "ウィ", "ウェ", "ウォ", "シェ", "ジェ", "チェ"];

const katakana = (text: string): string => text.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));

/** How a kana sounds, in Hepburn rōmaji; を is "wo", also read "o". */
export function kanaSound(kana: string): string {
  if (kana === "を" || kana === "ヲ") return "wo / o";
  const special: Record<string, string> = { ウィ: "wi", ウェ: "we", ウォ: "wo", ヴ: "vu" };
  return special[kana] ?? kanaToRomaji(kana);
}

function kanaSection(kanas: string[], script: "hiragana" | "katakana"): Section {
  const shown = kanas.map((k) => (script === "katakana" ? katakana(k) : k));
  const sounds = shown.map(kanaSound);
  return {
    title: shown.join(" "),
    subtitle: sounds.map((s) => s.split(" / ")[0]).join(" "),
    entries: shown.map((term, i) => ({ term, meaning: sounds[i]! })),
  };
}

export function kanaLessons(): VocabFile["lessons"] {
  const sections = (script: "hiragana" | "katakana"): Section[] => [
    ...ROWS.map((row) => kanaSection([...row], script)),
    ...VOICED.map((row) => kanaSection([...row], script)),
    ...CONTRACTED.map((group) => kanaSection(group.flatMap((k) => ["ゃ", "ゅ", "ょ"].map((y) => k + y)), script)),
  ];
  const katakanaSections = sections("katakana");
  // Borrowed sounds: in katakana only, in two halves.
  for (const part of [EXTENDED.slice(0, 8), EXTENDED.slice(8)]) {
    const section = kanaSection(part, "katakana");
    katakanaSections.push(section);
  }
  return [
    { title: "ひらがな", subtitle: "Hiragana", sections: sections("hiragana") },
    { title: "カタカナ", subtitle: "Katakana", sections: katakanaSections },
  ];
}

// ----------------------------------------------------------------- kanji

export interface Kanji {
  literal: string;
  /** 1–6: primary school; 8: the other jōyō kanji (secondary school). */
  grade: number;
  /** Rank among the 2,500 most used in newspapers; Infinity when unranked. */
  freq: number;
  strokes: number;
  on: string[];
  kun: string[];
  meanings: Record<"en" | "fr" | "es", string[]>;
}

const unescape = (text: string): string =>
  text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

const all = (block: string, pattern: RegExp): string[] => [...block.matchAll(pattern)].map((m) => unescape(m[1]!));

/** The jōyō kanji of KANJIDIC2 (grades 1–6 and 8). */
export function parseKanjidic(xml: string): Kanji[] {
  const out: Kanji[] = [];
  for (const match of xml.matchAll(/<character>([\s\S]*?)<\/character>/g)) {
    const block = match[1]!;
    const grade = Number(/<grade>(\d+)<\/grade>/.exec(block)?.[1] ?? 0);
    if (!((grade >= 1 && grade <= 6) || grade === 8)) continue;
    const freq = Number(/<freq>(\d+)<\/freq>/.exec(block)?.[1] ?? Infinity);
    out.push({
      literal: /<literal>([^<]+)<\/literal>/.exec(block)![1]!,
      grade,
      freq,
      strokes: Number(/<stroke_count>(\d+)<\/stroke_count>/.exec(block)?.[1] ?? 0),
      on: all(block, /<reading r_type="ja_on">([^<]+)<\/reading>/g),
      kun: all(block, /<reading r_type="ja_kun">([^<]+)<\/reading>/g),
      meanings: {
        en: all(block, /<meaning>([^<]+)<\/meaning>/g),
        fr: all(block, /<meaning m_lang="fr">([^<]+)<\/meaning>/g),
        es: all(block, /<meaning m_lang="es">([^<]+)<\/meaning>/g),
      },
    });
  }
  return out;
}

/** School order: grade by grade, the most frequent first, then the fewest strokes. */
export function schoolOrder(kanji: Kanji[]): Kanji[] {
  return [...kanji].sort((a, b) => a.grade - b.grade || a.freq - b.freq || a.strokes - b.strokes || a.literal.localeCompare(b.literal));
}

/**
 * A kun reading as learnt: the okurigana after "." in brackets (たか.い →
 * たか(い)), the "-" of a prefix or suffix dropped (-び → び).
 */
export function kunReading(raw: string): string {
  const bare = raw.replace(/-/g, "");
  const dot = bare.indexOf(".");
  return dot < 0 ? bare : `${bare.slice(0, dot)}(${bare.slice(dot + 1)})`;
}

/** か for が, ひ for び and ぴ. */
const unvoiced = (kana: string): string => kana.normalize("NFD").replace(/[\u3099\u309a]/g, "").normalize("NFC");

/** Readings as one answer: on'yomi in katakana, then kun'yomi in hiragana, " / " between. */
export function readingsOf(kanji: Pick<Kanji, "on" | "kun">): string {
  const on = [...new Set(kanji.on.map((r) => r.replace(/-/g, "")))].slice(0, ON_READINGS);
  // Several okurigana on one stem (い(きる), い(かす)) count as one reading, the first.
  // A suffix voiced in compounds (-び for ひ) is the same reading.
  const stems = new Set<string>();
  const kun: string[] = [];
  for (const raw of kanji.kun) {
    const reading = kunReading(raw);
    const stem = reading.replace(/\(.*\)$/, "");
    const voiced = raw.includes("-") && stems.has(unvoiced(stem));
    if (stems.has(stem) || voiced || kun.length >= KUN_READINGS) continue;
    stems.add(stem);
    kun.push(reading);
  }
  return [...on, ...kun].join(" / ");
}

/** Meanings as one answer: "day / sun / Japan". A "/" inside a meaning would split it. */
export function meaningOf(meanings: string[]): string {
  const clean = [...new Set(meanings.map((m) => m.replace(/\s*\/\s*/g, ", ").trim()))];
  // "one radical (no.1)": the radical's number says nothing about the meaning.
  const useful = clean.filter((m) => !/radical/i.test(m));
  return (useful.length ? useful : clean).slice(0, MEANINGS).join(" / ");
}

// ---------------------------------------------------------------- JMdict

export interface Word {
  written: string;
  kana: string;
  gloss: string;
  /** Lower is more common: JMdict's nfXX band (500 words each), 49 without one. */
  rank: number;
}

const COMMON = new Set(["news1", "ichi1", "spec1", "spec2", "gai1"]);
const KANJI = /[一-鿿㐀-䶿々]/u;

/** The common words of JMdict written with kanji, each with a reading and its first English gloss. */
export function parseJmdict(xml: string): Word[] {
  const out: Word[] = [];
  for (const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const block = match[1]!;
    if (!block.includes("<ke_pri>")) continue;
    const firstSense = /<sense>([\s\S]*?)<\/sense>/.exec(block)?.[1] ?? "";
    // Usually written in kana: the kanji spelling is not the one to learn.
    if (firstSense.includes("&uk;")) continue;
    const gloss = /<gloss>([^<]+)<\/gloss>/.exec(firstSense)?.[1];
    if (!gloss) continue;
    const readings = [...block.matchAll(/<r_ele>([\s\S]*?)<\/r_ele>/g)].map((m) => ({
      reb: /<reb>([^<]+)<\/reb>/.exec(m[1]!)![1]!,
      restr: all(m[1]!, /<re_restr>([^<]+)<\/re_restr>/g),
      nokanji: m[1]!.includes("<re_nokanji"),
    }));
    for (const k of block.matchAll(/<k_ele>([\s\S]*?)<\/k_ele>/g)) {
      const ele = k[1]!;
      const written = /<keb>([^<]+)<\/keb>/.exec(ele)![1]!;
      const pri = all(ele, /<ke_pri>([^<]+)<\/ke_pri>/g);
      if (!pri.some((p) => COMMON.has(p)) || /&[oir]K;|&ateji;/.test(ele) || !KANJI.test(written)) continue;
      const reading = readings.find((r) => !r.nokanji && (r.restr.length === 0 || r.restr.includes(written)));
      if (!reading) continue;
      const nf = pri.find((p) => /^nf\d\d$/.test(p));
      out.push({ written, kana: reading.reb, gloss: unescape(gloss).slice(0, 60), rank: nf ? Number(nf.slice(2)) : 49 });
    }
  }
  return out;
}

/**
 * Example words for each kanji: common words of one to four characters whose
 * kanji are all learnt by then, the most common first, a word given once.
 */
export function pickExamples(order: string[], words: Word[]): Map<string, Word[]> {
  const position = new Map(order.map((k, i) => [k, i]));
  const byKanji = new Map<string, Word[]>(order.map((k) => [k, []]));
  const sorted = [...words].sort((a, b) => a.rank - b.rank || [...a.written].length - [...b.written].length);
  const seen = new Set<string>();
  for (const word of sorted) {
    const chars = [...word.written];
    if (chars.length > 4 || seen.has(word.written)) continue;
    const kanji = chars.filter((c) => KANJI.test(c) && c !== "々");
    if (kanji.length === 0 || kanji.some((c) => !position.has(c))) continue;
    // The word belongs to its last kanji in the book: all the others come before it.
    const last = kanji.reduce((a, b) => (position.get(a)! >= position.get(b)! ? a : b));
    const list = byKanji.get(last)!;
    if (list.length >= EXAMPLES) continue;
    seen.add(word.written);
    list.push(word);
  }
  return byKanji;
}

export const exampleNote = (words: Word[]): string =>
  words.map((w) => `${w.written} (${w.kana}) ${w.gloss}`).join(" · ").slice(0, 300);

// ------------------------------------------------------------------ book

const GRADE_TITLES: Record<number, [string, string]> = {
  1: ["小学一年", "Grade 1"],
  2: ["小学二年", "Grade 2"],
  3: ["小学三年", "Grade 3"],
  4: ["小学四年", "Grade 4"],
  5: ["小学五年", "Grade 5"],
  6: ["小学六年", "Grade 6"],
};

function kanjiEntry(k: Kanji, examples: Word[]): VocabFileEntry {
  const fr = meaningOf(k.meanings.fr);
  const es = meaningOf(k.meanings.es);
  const note = exampleNote(examples);
  return {
    term: k.literal,
    meaning: meaningOf(k.meanings.en) || "?",
    readings: readingsOf(k),
    ...(fr || es ? { translations: { ...(fr ? { fr } : {}), ...(es ? { es } : {}) } } : {}),
    ...(note ? { note } : {}),
  };
}

const chunks = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

export function buildCharacters(kanjidic: Kanji[] | null, words: Word[]): VocabFile {
  const lessons = kanaLessons();
  if (kanjidic) {
    const ordered = schoolOrder(kanjidic).filter((k) => k.meanings.en.length > 0);
    const examples = pickExamples(ordered.map((k) => k.literal), words);
    let first = 1;
    const sectionsOf = (kanji: Kanji[]): Section[] =>
      chunks(kanji, KANJI_PER_SECTION).map((group) => {
        const section = {
          title: group.map((k) => k.literal).join(" "),
          subtitle: `${first}–${first + group.length - 1}`,
          entries: group.map((k) => kanjiEntry(k, examples.get(k.literal) ?? [])),
        };
        first += group.length;
        return section;
      });
    for (let grade = 1; grade <= 6; grade++) {
      const [title, subtitle] = GRADE_TITLES[grade]!;
      const sections = sectionsOf(ordered.filter((k) => k.grade === grade));
      if (sections.length) lessons.push({ title, subtitle, sections });
    }
    const secondary = chunks(sectionsOf(ordered.filter((k) => k.grade === 8)), SECONDARY_SECTIONS_PER_LESSON);
    secondary.forEach((sections, i) => lessons.push({ title: `中学・高校 ${i + 1}`, subtitle: `Secondary school ${i + 1}`, sections }));
  }
  return {
    book: {
      id: CHARACTERS_ID,
      title: kanjidic ? "Kana and jōyō kanji" : "Kana",
      kind: "characters",
      term: "ja",
      meaning: "en",
      order: "book",
      ...(kanjidic ? { credit: CREDIT } : {}),
    },
    lessons,
  };
}

/** The format-2 file, as `npm run vocab:import` reads it. */
export function toFileJson(file: VocabFile): string {
  return JSON.stringify({ format: 2, ...file }, null, 1);
}

function readMaybeGzip(...paths: string[]): string | null {
  for (const path of paths) {
    if (!existsSync(path)) continue;
    const raw = readFileSync(path);
    return (path.endsWith(".gz") ? gunzipSync(raw) : raw).toString("utf8");
  }
  return null;
}

const main = process.argv[1] ?? "";
if (/characters-build\.[jt]s$/.test(main) && main === fileURLToPath(import.meta.url)) {
  const out = process.argv[2] ?? "data/characters.json";
  const kanjidicXml = readMaybeGzip("data/kanjidic2.xml.gz", "data/kanjidic2.xml");
  const jmdictXml = readMaybeGzip("data/JMdict_e.xml", "data/JMdict_e.xml.gz", "data/JMdict_e.gz", "data/JMdict_e");
  if (!kanjidicXml) console.warn("data/kanjidic2.xml.gz not found: kana only (docs/characters.md)");
  else if (!jmdictXml) console.warn("data/JMdict_e.xml not found: kanji without example words");
  const kanji = kanjidicXml ? parseKanjidic(kanjidicXml) : null;
  const words = jmdictXml ? parseJmdict(jmdictXml) : [];
  const file = buildCharacters(kanji, words);
  writeFileSync(out, toFileJson(file));
  const entries = file.lessons.flatMap((l) => l.sections.flatMap((s) => s.entries));
  const withExamples = entries.filter((e) => e.note).length;
  console.log(
    `${out}: ${file.lessons.length} lessons, ${entries.length} characters` +
      (kanji ? ` (${entries.filter((e) => e.readings).length} kanji, ${withExamples} with example words, from ${words.length} common words)` : ""),
  );
}
