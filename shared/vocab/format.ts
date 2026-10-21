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
}

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
  if (root.format !== 1 && root.format !== 2) throw new Error('unsupported file: "format" must be 1 or 2');
  const v1 = root.format === 1;
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
              const reading = text(entry.reading, 300);
              const readings = text(entry.readings, 300);
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
              };
            }),
          };
        }),
      };
    }),
  };
}
