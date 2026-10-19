/**
 * The vocabulary file read by `npm run vocab:import`, as written by
 * tools/vocab-extract.py. See docs/vocabulary.md.
 *
 * {
 *   "format": 1,
 *   "languages": ["en", "es"],
 *   "lessons": [
 *     { "title": { "en": "Transport", "es": "Los medios de transporte" },
 *       "sections": [
 *         { "title": { "en": "Car", "es": "El coche" },
 *           "entries": [
 *             { "en": "roof rack", "es": "la baca", "group": "Vocabulary" },
 *             { "en": "water", "es": "el agua", "feminine": true }
 *           ] } ] } ]
 * }
 */

export interface VocabTitle {
  en: string;
  es: string;
}

export interface VocabFileEntry {
  en: string;
  es: string;
  /** Heading inside the section ("Vocabulary", "Interior"…). */
  group?: string;
  /** Feminine noun taking "el" ("el agua"). */
  feminine?: boolean;
}

export interface VocabFile {
  lessons: { title: VocabTitle; sections: { title: VocabTitle; entries: VocabFileEntry[] }[] }[];
}

const text = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim() && value.length <= max ? value.trim() : null;

function title(value: unknown, where: string): VocabTitle {
  const v = (value ?? {}) as Record<string, unknown>;
  const en = text(v.en, 200);
  const es = text(v.es, 200);
  if (!en || !es) throw new Error(`${where}: title needs "en" and "es"`);
  return { en, es };
}

/** Validates a parsed vocabulary file; throws with the place of the first problem. */
export function parseVocabFile(data: unknown): VocabFile {
  const root = (data ?? {}) as Record<string, unknown>;
  if (root.format !== 1) throw new Error('unsupported file: "format" must be 1');
  if (!Array.isArray(root.lessons) || root.lessons.length === 0) throw new Error('"lessons" must be a non-empty list');
  return {
    lessons: root.lessons.map((rawLesson, l) => {
      const lesson = (rawLesson ?? {}) as Record<string, unknown>;
      const where = `lesson ${l + 1}`;
      if (!Array.isArray(lesson.sections) || lesson.sections.length === 0) throw new Error(`${where}: no sections`);
      return {
        title: title(lesson.title, where),
        sections: lesson.sections.map((rawSection, s) => {
          const section = (rawSection ?? {}) as Record<string, unknown>;
          const at = `${where}, section ${s + 1}`;
          if (!Array.isArray(section.entries) || section.entries.length === 0) throw new Error(`${at}: no entries`);
          return {
            title: title(section.title, at),
            entries: section.entries.map((rawEntry, e) => {
              const entry = (rawEntry ?? {}) as Record<string, unknown>;
              const en = text(entry.en, 300);
              const es = text(entry.es, 300);
              if (!en || !es) throw new Error(`${at}, entry ${e + 1}: needs "en" and "es"`);
              const group = text(entry.group, 100);
              return { en, es, ...(group ? { group } : {}), ...(entry.feminine === true ? { feminine: true } : {}) };
            }),
          };
        }),
      };
    }),
  };
}
