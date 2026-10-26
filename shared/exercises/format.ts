/**
 * Workbook exercises (docs/exercises.md): the file made by
 * tools/exercises-extract.py from a book you own, imported with
 * `npm run exercises:import`. An exercise is the page's own image, cropped,
 * with its gaps; the key gives each item's answer.
 */

/** A gap on the image: left, baseline and width, as fractions of the image's width and height. */
export type Gap = [x: number, y: number, w: number];

export interface ExerciseItem {
  /** The item's number in the book ("2"), or a number and a letter ("1b"). */
  n: string;
  /** The key's text for the item, as printed: "I've been looking / I have been looking". Empty: not marked. */
  answer: string;
  /** Where to write on the image; none: the item is answered in a field under it. */
  gaps: Gap[];
}

export interface BookExercise {
  /** "9.4": unit 9, exercise 4. */
  id: string;
  unit: number;
  page: number;
  instruction: string;
  image: string;
  width: number;
  height: number;
  /** Free answers: the key shows possible answers, and the player marks his own. */
  open: boolean;
  /** The key's note, such as "Example answers:". */
  note: string;
  /** The key of an exercise without numbered items. */
  keyText: string;
  items: ExerciseItem[];
}

export interface ExerciseBookFile {
  format: 1;
  book: { id: string; title: string; source: string; level: string; kind: string; language: string };
  units: { n: number; title: string }[];
  exercises: BookExercise[];
}

const isFraction = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= -0.05 && v <= 1.05;
const isText = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;

/** A book file, checked; throws with the first problem found. */
export function parseExerciseBook(raw: unknown): ExerciseBookFile {
  const fail = (what: string): never => {
    throw new Error(`exercise book: ${what}`);
  };
  const f = raw as ExerciseBookFile;
  if (!f || typeof f !== "object" || f.format !== 1) fail("format must be 1");
  const b = f.book;
  if (!b || !/^[a-z0-9][a-z0-9-]{1,60}$/.test(String(b.id))) fail("book.id must be a slug");
  for (const k of ["title", "source", "level", "kind", "language"] as const) if (!isText(b[k], 200)) fail(`book.${k}`);
  if (!Array.isArray(f.units) || !Array.isArray(f.exercises) || f.exercises.length === 0) fail("units and exercises are lists");
  const units = new Set<number>();
  for (const u of f.units) {
    if (!Number.isInteger(u.n) || u.n < 0 || !isText(u.title, 300)) fail(`unit ${String(u.n)}`);
    units.add(u.n);
  }
  const ids = new Set<string>();
  for (const e of f.exercises) {
    const where = `exercise ${String(e?.id)}`;
    if (!/^\d{1,3}\.\d{1,2}$/.test(String(e.id)) || ids.has(e.id)) fail(`${where}: id "d.d", once`);
    ids.add(e.id);
    if (!units.has(e.unit) || Number(e.id.split(".")[0]) !== e.unit) fail(`${where}: unit`);
    if (!/^[\w.-]+\.(webp|png|jpe?g)$/.test(String(e.image)) || !(e.width > 0) || !(e.height > 0)) fail(`${where}: image`);
    if (typeof e.open !== "boolean" || !isText(e.instruction, 2000) || !isText(e.note, 500) || !isText(e.keyText, 5000)) fail(where);
    if (!Array.isArray(e.items) || e.items.length > 80) fail(`${where}: items`);
    const names = new Set<string>();
    for (const it of e.items) {
      if (!/^\d{1,2}[a-h]?$/.test(String(it.n)) || names.has(it.n)) fail(`${where}: item ${String(it.n)}`);
      names.add(it.n);
      if (!isText(it.answer, 3000) || !Array.isArray(it.gaps) || it.gaps.length > 60) fail(`${where}: item ${it.n}`);
      for (const g of it.gaps) if (!Array.isArray(g) || g.length !== 3 || !g.every(isFraction)) fail(`${where}: item ${it.n}, gap`);
    }
  }
  return f;
}
