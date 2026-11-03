/**
 * The vocabulary file read by `npm run vocab:import`. See docs/vocabulary.md.
 *
 * Format 2 (one book per file):
 *
 * {
 *   "format": 2,
 *   "book": { "id": "english-4000", "title": "Vocabulary 4000",
 *             "kind": "definition", "term": "en", "meaning": "en" },
 *   "lessons": [
 *     { "title": "A",
 *       "sections": [
 *         { "title": "abase – abode",
 *           "entries": [ { "term": "abase", "meaning": "degrade" } ] } ] } ]
 * }
 *
 * kind "translation": the meaning is in another language (Spanish → English);
 * kind "definition": the meaning explains the term in the same language.
 * order "alphabetical" (optional, default "book"): a word list whose order
 * means nothing; new words then come at random by default.
 * Lessons and sections may have a "subtitle" (the title in the other language).
 * An entry may have "group" (heading inside the section), "note" (an example,
 * shown after the answer), "feminine" (a feminine noun taking "el") and
 * "reading" (how the term reads: Japanese rōmaji, accepted as an answer).
 *
 * kind "characters": a Japanese script book (kana and kanji, docs/characters.md).
 * A kanji entry has "readings" ("ニチ / ジツ / ひ"), asked as a third
 * direction, and "translations" ({"fr": "jour", "es": "día"}): the meaning in
 * the interface's language when there is one. The book may carry a "credit",
 * shown with it (the dictionaries' licence).
 *
 * Format 3 adds, on an entry, "type" ("sign", "noun"), "gender", "genitive",
 * "principal_parts", "forms", "readings" as a list ([{"value": "an",
 * "language": "sux"}], every one an answer) and "functions" (["logogram",
 * "determinative"]); see EntryInfo below. Any other field is refused.
 *
 * Format 1, written by 4.2 for the Spanish book, is still read:
 * titles {"en", "es"} and entries {"en", "es"}, Spanish being studied.
 */

export interface VocabFileEntry {
  term: string;
  meaning: string;
  group?: string;
  note?: string;
  feminine?: boolean;
  /** How the term reads, when its script does not say it: Japanese rōmaji ("gachō" for ガチョウ). */
  reading?: string;
  /** Characters book, kanji: on'yomi and kun'yomi, " / " between ("ニチ / ジツ / ひ / か"). */
  readings?: string;
  /** The meaning in other interface languages ("fr", "es"), when known. */
  translations?: Partial<Record<TranslationLang, string>>;
  /** A picture: a path relative to the file ("images/page_0013_image_01.png"), read by the import. */
  image?: string;
  /** The entry's number on a shared picture (a labelled diagram: "1. rotor" is part 1). */
  part?: number;
  /** Format 3: what the entry is, its readings by language, what it does in writing. */
  info?: EntryInfo;
}

/** One reading of a sign: "an" in Sumerian, "ilum" in Akkadian. */
export interface SignReading {
  value: string;
  /** A language code ("sux", "akk") or a name ("sumerian"). */
  language?: string;
  note?: string;
}

/**
 * Format 3 (docs/vocabulary.md#format-3): for scripts where an entry is more
 * than a word, such as a cuneiform sign that reads "an" or "diĝir" and also
 * serves as a silent determinative.
 */
export interface EntryInfo {
  /** "sign", "noun", "verb", "phrase", or any short label. */
  type?: string;
  /** A noun's gender: "masculine", "feminine", "neuter", "common", or any short label. */
  gender?: string;
  /** A Latin (or Greek) noun's genitive singular: "hominis". */
  genitive?: string;
  /** A verb's principal parts, in the dictionary's order: ["habeo", "habere", "habui", "habitum"]. */
  principalParts?: string[];
  /** Any other form worth showing: [{"label": "plural", "value": "homines"}]. */
  forms?: { label: string; value: string }[];
  readings?: SignReading[];
  /** What it does in writing: "logogram", "syllabogram", "determinative"… */
  functions?: string[];
}

/** Limits of format 3's fields. */
export const INFO_LIMITS = { label: 40, readings: 20, value: 60, note: 200, functions: 8, parts: 6, forms: 12 } as const;

/** The fields an entry may have in format 3: any other is a mistake, refused rather than dropped. */
const ENTRY_FIELDS = new Set([
  "term", "meaning", "group", "note", "feminine", "reading", "readings", "translations", "image", "part",
  "type", "gender", "genitive", "principal_parts", "principalParts", "forms", "functions",
]);

/** A picture path in a vocabulary file: relative, inside the file's folder, an image. */
export const IMAGE_PATH = /^(?![/\\])(?!.*(?:^|[/\\])\.\.(?:[/\\]|$))[^\0:]{1,300}\.(?:png|jpe?g|webp|gif)$/i;

export const TRANSLATION_LANGS = ["fr", "es", "en"] as const;
export type TranslationLang = (typeof TRANSLATION_LANGS)[number];

export type BookKind = "translation" | "definition" | "characters";

export interface VocabFileBook {
  /** Stable identifier: importing a file with the same id updates that book. */
  id: string;
  title: string;
  kind: BookKind;
  term: string;
  meaning: string;
  /** "book" (default): the order means something. "alphabetical": a word list. */
  order?: "book" | "alphabetical";
  /** Where the content comes from, shown with the book (a licence's attribution). */
  credit?: string;
}

export interface VocabFile {
  book: VocabFileBook;
  lessons: {
    title: string;
    subtitle: string;
    sections: { title: string; subtitle: string; entries: VocabFileEntry[] }[];
  }[];
}

/** The book of format-1 files. The id is kept from the first version, for continuity. */
export const SPANISH_3000: VocabFileBook = {
  id: "collins-spanish",
  title: "3000 words and phrases",
  kind: "translation",
  term: "es",
  meaning: "en",
};

const text = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim() && value.length <= max ? value.trim() : null;

const LANG = /^[a-z]{2,3}$/;

function book(raw: unknown): VocabFileBook {
  const b = (raw ?? {}) as Record<string, unknown>;
  const id = text(b.id, 60);
  const title = text(b.title, 200);
  if (!id || !/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error('book: "id" must be lower-case letters, digits and "-"');
  if (!title) throw new Error('book: "title" is required');
  if (b.kind !== "translation" && b.kind !== "definition" && b.kind !== "characters") {
    throw new Error('book: "kind" must be "translation", "definition" or "characters"');
  }
  if (typeof b.term !== "string" || !LANG.test(b.term) || typeof b.meaning !== "string" || !LANG.test(b.meaning)) {
    throw new Error('book: "term" and "meaning" must be language codes ("es", "en")');
  }
  if (b.order !== undefined && b.order !== "book" && b.order !== "alphabetical") {
    throw new Error('book: "order" must be "book" or "alphabetical"');
  }
  const credit = b.credit === undefined ? null : text(b.credit, 500);
  if (b.credit !== undefined && !credit) throw new Error('book: "credit" must be a text of at most 500 characters');
  return { id, title, kind: b.kind, term: b.term, meaning: b.meaning, order: b.order ?? "book", ...(credit ? { credit } : {}) };
}

/** Validates a parsed vocabulary file; throws with the place of the first problem. */
export function parseVocabFile(data: unknown): VocabFile {
  const root = (data ?? {}) as Record<string, unknown>;
  if (root.format !== 1 && root.format !== 2 && root.format !== 3) throw new Error('unsupported file: "format" must be 1, 2 or 3');
  const v1 = root.format === 1;
  const v3 = root.format === 3;
  if (!Array.isArray(root.lessons) || root.lessons.length === 0) throw new Error('"lessons" must be a non-empty list');

  // Format 1: titles {en, es}, entries {en, es}; Spanish studied.
  const title = (value: unknown, where: string): { title: string; subtitle: string } => {
    if (v1) {
      const v = (value ?? {}) as Record<string, unknown>;
      const es = text(v.es, 200);
      const en = text(v.en, 200);
      if (!es || !en) throw new Error(`${where}: title needs "en" and "es"`);
      return { title: es, subtitle: en };
    }
    const t = text(value, 200);
    if (!t) throw new Error(`${where}: "title" is required`);
    return { title: t, subtitle: "" };
  };
  const subtitle = (raw: Record<string, unknown>): string => (v1 ? "" : (text(raw.subtitle, 200) ?? ""));

  return {
    book: v1 ? SPANISH_3000 : book(root.book),
    lessons: root.lessons.map((rawLesson, l) => {
      const lesson = (rawLesson ?? {}) as Record<string, unknown>;
      const where = `lesson ${l + 1}`;
      if (!Array.isArray(lesson.sections) || lesson.sections.length === 0) throw new Error(`${where}: no sections`);
      const lt = title(lesson.title, where);
      return {
        title: lt.title,
        subtitle: lt.subtitle || subtitle(lesson),
        sections: lesson.sections.map((rawSection, s) => {
          const section = (rawSection ?? {}) as Record<string, unknown>;
          const at = `${where}, section ${s + 1}`;
          if (!Array.isArray(section.entries) || section.entries.length === 0) throw new Error(`${at}: no entries`);
          const st = title(section.title, at);
          return {
            title: st.title,
            subtitle: st.subtitle || subtitle(section),
            entries: section.entries.map((rawEntry, e) => {
              const entry = (rawEntry ?? {}) as Record<string, unknown>;
              const term = text(v1 ? entry.es : entry.term, 300);
              const meaning = text(v1 ? entry.en : entry.meaning, 300);
              if (!term || !meaning) {
                throw new Error(`${at}, entry ${e + 1}: needs ${v1 ? '"en" and "es"' : '"term" and "meaning"'}`);
              }
              const group = text(entry.group, 100);
              const note = text(entry.note, 300);
              const where = `${at}, entry ${e + 1}`;
              const info = entryInfo(entry, where, v3);
              // A sign's readings are accepted answers: "reading" is what is shown, completed with any reading of the list it lacks.
              const reading = withReadings(text(entry.reading, 300), info?.readings);
              const readings = Array.isArray(entry.readings) ? null : text(entry.readings, 300);
              const translations: Partial<Record<TranslationLang, string>> = {};
              if (entry.translations !== undefined) {
                const raw = entry.translations;
                if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
                  throw new Error(`${at}, entry ${e + 1}: "translations" must be an object {"fr": "…"}`);
                }
                for (const [lang, value] of Object.entries(raw)) {
                  const t = text(value, 300);
                  if (!TRANSLATION_LANGS.includes(lang as TranslationLang) || !t) {
                    throw new Error(`${at}, entry ${e + 1}: translations are "fr", "es" or "en", each a text`);
                  }
                  translations[lang as TranslationLang] = t;
                }
              }
              return {
                term,
                meaning,
                ...(group ? { group } : {}),
                ...(note ? { note } : {}),
                ...(entry.feminine === true ? { feminine: true } : {}),
                ...(reading ? { reading } : {}),
                ...(readings ? { readings } : {}),
                ...(Object.keys(translations).length ? { translations } : {}),
                ...picture(entry, `${at}, entry ${e + 1}`),
                ...(info ? { info } : {}),
              };
            }),
          };
        }),
      };
    }),
  };
}

function picture(entry: Record<string, unknown>, at: string): Pick<VocabFileEntry, "image" | "part"> {
  const out: Pick<VocabFileEntry, "image" | "part"> = {};
  if (entry.image !== undefined && entry.image !== "") {
    if (typeof entry.image !== "string" || !IMAGE_PATH.test(entry.image)) {
      throw new Error(`${at}: "image" is a path inside the file's folder, ending .png, .jpg, .webp or .gif`);
    }
    out.image = entry.image;
  }
  if (entry.part !== undefined) {
    if (typeof entry.part !== "number" || !Number.isInteger(entry.part) || entry.part < 1 || entry.part > 999) {
      throw new Error(`${at}: "part" is a whole number from 1 to 999`);
    }
    out.part = entry.part;
  }
  return out;
}

const LABEL = /^[\p{L}\p{N}][\p{L}\p{N} ._-]*$/u;

/** A short label: "sign", "phonetic complement". */
function label(value: unknown, where: string): string {
  const t = text(value, INFO_LIMITS.label);
  if (!t || !LABEL.test(t)) throw new Error(`${where}: a short label (letters, digits, spaces, "-"), at most ${INFO_LIMITS.label} characters`);
  return t;
}

/** Format 3's fields of an entry; in an earlier format, refused with a pointer to format 3. */
function entryInfo(entry: Record<string, unknown>, where: string, v3: boolean): EntryInfo | null {
  const structured = Array.isArray(entry.readings);
  const parts = entry.principal_parts ?? entry.principalParts;
  if (!v3) {
    if (["type", "functions", "gender", "genitive", "principal_parts", "principalParts", "forms"].some((k) => entry[k] !== undefined) || structured) {
      throw new Error(`${where}: "type", "gender", "genitive", "principal_parts", "forms", "functions" and a list of "readings" need "format": 3`);
    }
    return null;
  }
  const unknown = Object.keys(entry).filter((k) => !ENTRY_FIELDS.has(k));
  if (unknown.length) {
    throw new Error(`${where}: unknown field ${unknown.map((k) => `"${k}"`).join(", ")} (see docs/vocabulary.md#format-3)`);
  }
  const info: EntryInfo = {};
  if (entry.type !== undefined) info.type = label(entry.type, `${where}, "type"`);
  if (entry.gender !== undefined) info.gender = label(entry.gender, `${where}, "gender"`);
  if (entry.genitive !== undefined) {
    const genitive = text(entry.genitive, INFO_LIMITS.value);
    if (!genitive) throw new Error(`${where}: "genitive" is a text of at most ${INFO_LIMITS.value} characters`);
    info.genitive = genitive;
  }
  if (parts !== undefined) {
    if (!Array.isArray(parts) || parts.length === 0 || parts.length > INFO_LIMITS.parts) {
      throw new Error(`${where}: "principal_parts" is a list of 1 to ${INFO_LIMITS.parts} forms`);
    }
    info.principalParts = parts.map((p, i) => {
      const form = text(p, INFO_LIMITS.value);
      if (!form) throw new Error(`${where}, principal part ${i + 1}: a text of at most ${INFO_LIMITS.value} characters`);
      return form;
    });
  }
  if (entry.forms !== undefined) {
    if (!Array.isArray(entry.forms) || entry.forms.length > INFO_LIMITS.forms) {
      throw new Error(`${where}: "forms" is a list of at most ${INFO_LIMITS.forms} {"label", "value"}`);
    }
    const forms = entry.forms.map((raw, i) => {
      const f = (raw ?? {}) as Record<string, unknown>;
      const value = text(f.value, INFO_LIMITS.value);
      if (!value) throw new Error(`${where}, form ${i + 1}: "value" is required, at most ${INFO_LIMITS.value} characters`);
      return { label: label(f.label, `${where}, form ${i + 1}, "label"`), value };
    });
    if (forms.length) info.forms = forms;
  }
  if (entry.functions !== undefined) {
    if (!Array.isArray(entry.functions) || entry.functions.length > INFO_LIMITS.functions) {
      throw new Error(`${where}: "functions" is a list of at most ${INFO_LIMITS.functions} labels`);
    }
    const functions = [...new Set(entry.functions.map((f, i) => label(f, `${where}, function ${i + 1}`)))];
    if (functions.length) info.functions = functions;
  }
  if (structured) {
    const list = entry.readings as unknown[];
    if (list.length > INFO_LIMITS.readings) throw new Error(`${where}: at most ${INFO_LIMITS.readings} readings`);
    const readings = list.map((raw, i): SignReading => {
      const at = `${where}, reading ${i + 1}`;
      // A reading alone ("an") or {"value", "language", "note"}.
      const r = (typeof raw === "string" ? { value: raw } : (raw ?? {})) as Record<string, unknown>;
      const value = text(r.value, INFO_LIMITS.value);
      if (!value) throw new Error(`${at}: "value" is required, at most ${INFO_LIMITS.value} characters`);
      if (/[;/]/.test(value)) throw new Error(`${at}: one reading per value ("${value}" holds several)`);
      const out: SignReading = { value };
      if (r.language !== undefined) out.language = label(r.language, `${at}, "language"`).toLowerCase();
      if (r.note !== undefined) {
        const note = text(r.note, INFO_LIMITS.note);
        if (!note) throw new Error(`${at}: "note" is a text of at most ${INFO_LIMITS.note} characters`);
        out.note = note;
      }
      return out;
    });
    if (readings.length) info.readings = readings;
  }
  // In the stored order (type, readings, functions): what the server sends back reads the same.
  return Object.keys(info).length ? (JSON.parse(storedInfo(info)) as EntryInfo) : null;
}

/** The reading shown, completed with the readings of the list it lacks: every one is an answer. */
function withReadings(reading: string | null, readings: SignReading[] | undefined): string | null {
  if (!readings?.length) return reading;
  const shown = (reading ?? "").split(/\s*[;/,]\s*/).filter(Boolean);
  const seen = new Set(shown.map((v) => v.normalize("NFC").toLowerCase()));
  for (const { value } of readings) {
    const key = value.normalize("NFC").toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      shown.push(value);
    }
  }
  const joined = shown.join("; ");
  return joined.length <= 300 ? joined : joined.slice(0, 300).replace(/;[^;]*$/, "");
}

/** The stored form of an entry's info: fields in a fixed order, so an unchanged entry compares equal. */
export function storedInfo(info: EntryInfo | undefined): string {
  if (!info) return "";
  const out: EntryInfo = {};
  if (info.type) out.type = info.type;
  if (info.gender) out.gender = info.gender;
  if (info.genitive) out.genitive = info.genitive;
  if (info.principalParts?.length) out.principalParts = info.principalParts;
  if (info.forms?.length) out.forms = info.forms.map((f) => ({ label: f.label, value: f.value }));
  if (info.readings?.length) out.readings = info.readings.map((r) => ({ value: r.value, ...(r.language ? { language: r.language } : {}), ...(r.note ? { note: r.note } : {}) }));
  if (info.functions?.length) out.functions = info.functions;
  return Object.keys(out).length ? JSON.stringify(out) : "";
}

/** The info column read back; anything unreadable is none. */
export function infoOf(value: unknown): EntryInfo | undefined {
  if (typeof value !== "string" || !value) return undefined;
  try {
    const parsed = JSON.parse(value) as EntryInfo;
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}
