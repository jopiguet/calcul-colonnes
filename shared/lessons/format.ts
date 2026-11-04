/**
 * Language courses (docs/language-courses.md): a course is a folder of
 * lessons, each written once per interface language as Markdown with
 * exercise blocks. This module reads a lesson: its text, its exercises and
 * their blanks, and gives the browser the lesson without the answers.
 *
 * In a lesson's Markdown, besides what src/markdown-parse.ts reads:
 *
 *   ::: exercise first-declension-genitive
 *   Give the genitive singular.
 *
 *   - rosa → [[rosae]]
 *   - via → [[viae]]
 *   :::
 *
 *   ::: summary
 *   - The genitive singular of the first declension ends in *-ae*.
 *   :::
 *
 * Blanks, in list items and table cells of an exercise:
 *   [[rosae / rosā]]     strict: one of the answers, " / " between; the same in every language
 *   {{The girl sings.}}  free: a model answer, in the interface's language; matched loosely,
 *                        otherwise the player compares and may mark it right
 *   ((nom. / gen.* / dat.)) a choice; "*" marks the right option, at the same place in every language
 */

export type BlankKind = "strict" | "free" | "choice";

export interface Blank {
  kind: BlankKind;
  /** strict, free: the accepted answers; choice: the options. */
  answers: string[];
  /** choice: the right option's index. */
  right?: number;
}

/** A piece of an item's text: words, or a blank (its index in the exercise). */
export type Segment = string | { blank: number };

export interface ExerciseItem {
  segments: Segment[];
}

export interface ExerciseTable {
  header: Segment[][];
  rows: Segment[][][];
}

export interface Exercise {
  id: string;
  /** Markdown paragraphs: what to do. */
  prompt: string;
  items: ExerciseItem[];
  table: ExerciseTable | null;
  blanks: Blank[];
}

export type LessonPart =
  | { kind: "text"; markdown: string }
  | { kind: "exercise"; exercise: Exercise }
  | { kind: "summary"; markdown: string };

export interface Lesson {
  title: string;
  parts: LessonPart[];
}

const BLANK = /\[\[(.+?)\]\]|\{\{(.+?)\}\}|\(\((.+?)\)\)/g;
export const EXERCISE_ID = /^[a-z0-9][a-z0-9-]{1,60}$/;
/** Alternatives inside a blank: " / ", spaces around, so "he/she" stays one answer. */
const ALTERNATIVES = /\s+\/\s+/;

/** Splits a text on its blanks, adding them to the exercise's list. */
function segmentsOf(text: string, blanks: Blank[], where: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(BLANK)) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    const raw = (m[1] ?? m[2] ?? m[3])!;
    const parts = raw.split(ALTERNATIVES).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) throw new Error(`${where}: an empty blank`);
    if (m[3] !== undefined) {
      const right = parts.findIndex((p) => p.endsWith("*"));
      if (right < 0 || parts.filter((p) => p.endsWith("*")).length > 1 || parts.length < 2) {
        throw new Error(`${where}: a choice needs two options or more and one marked "*": ((${raw}))`);
      }
      blanks.push({ kind: "choice", answers: parts.map((p) => p.replace(/\*$/, "").trim()), right });
    } else blanks.push({ kind: m[1] !== undefined ? "strict" : "free", answers: parts });
    out.push({ blank: blanks.length - 1 });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (line: string): string[] => {
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return inner.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
};

function exerciseOf(id: string, body: string[], where: string): Exercise {
  if (!EXERCISE_ID.test(id)) throw new Error(`${where}: exercise id "${id}": lower-case letters, digits and "-"`);
  const blanks: Blank[] = [];
  const prompt: string[] = [];
  const items: ExerciseItem[] = [];
  let table: ExerciseTable | null = null;
  let i = 0;
  while (i < body.length) {
    const line = body[i]!;
    if (line.trim() === "") {
      i++;
      continue;
    }
    if (/^\s*-\s+/.test(line)) {
      let text = line.replace(/^\s*-\s+/, "");
      i++;
      while (i < body.length && /^\s{2,}\S/.test(body[i]!) && !/^\s*-\s+/.test(body[i]!)) text += " " + body[i++]!.trim();
      items.push({ segments: segmentsOf(text, blanks, `${where}, item ${items.length + 1}`) });
      continue;
    }
    if (line.trimStart().startsWith("|")) {
      if (table) throw new Error(`${where}: one table per exercise`);
      const rows: string[][] = [];
      while (i < body.length && body[i]!.trimStart().startsWith("|")) rows.push(cells(body[i++]!));
      const [header = [], , ...rest] = rows;
      table = {
        header: header.map((c) => segmentsOf(c, blanks, `${where}, table head`)),
        rows: rest.map((r, n) => r.map((c) => segmentsOf(c, blanks, `${where}, table row ${n + 1}`))),
      };
      continue;
    }
    if (items.length || table) throw new Error(`${where}: text after the items; put the instructions first`);
    prompt.push(line);
    i++;
  }
  if (blanks.length === 0) throw new Error(`${where}: no blank to fill`);
  if (blanks.length > 120) throw new Error(`${where}: more than 120 blanks`);
  return { id, prompt: prompt.join("\n").trim(), items, table, blanks };
}

/** A lesson's Markdown read: title, text, exercises, summary. Throws with the place of the first problem. */
export function parseLesson(source: string, where = "lesson"): Lesson {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const first = lines.findIndex((l) => l.trim() !== "");
  const title = /^#\s+(.+)$/.exec(lines[first] ?? "")?.[1]?.trim();
  if (!title) throw new Error(`${where}: the first line is the title, "# …"`);
  const parts: LessonPart[] = [];
  const ids = new Set<string>();
  let text: string[] = [];
  const flush = (): void => {
    const markdown = text.join("\n").trim();
    if (markdown) parts.push({ kind: "text", markdown });
    text = [];
  };
  for (let i = first + 1; i < lines.length; i++) {
    const line = lines[i]!;
    const open = /^:::\s*(exercise|summary)\b\s*(\S*)\s*$/.exec(line);
    if (!open) {
      if (/^:::/.test(line)) throw new Error(`${where}, line ${i + 1}: "${line.trim()}" is not a block (::: exercise id, ::: summary, :::)`);
      text.push(line);
      continue;
    }
    flush();
    const body: string[] = [];
    const start = i;
    for (i++; i < lines.length && !/^:::\s*$/.test(lines[i]!); i++) body.push(lines[i]!);
    if (i >= lines.length) throw new Error(`${where}, line ${start + 1}: block not closed by ":::"`);
    if (open[1] === "summary") {
      parts.push({ kind: "summary", markdown: body.join("\n").trim() });
      continue;
    }
    const id = open[2]!;
    if (ids.has(id)) throw new Error(`${where}: exercise "${id}" twice`);
    ids.add(id);
    parts.push({ kind: "exercise", exercise: exerciseOf(id, body, `${where}, exercise ${id}`) });
  }
  flush();
  return { title, parts };
}

/** What the browser gets of an exercise: the blanks without their answers (a choice keeps its options). */
export interface PublicBlank {
  kind: BlankKind;
  options?: string[];
  /** A width for the field, in characters: the longest answer's, so that its size says nothing more. */
  size: number;
}

export type PublicExercise = Omit<Exercise, "blanks"> & { blanks: PublicBlank[] };

export function publicExercise(e: Exercise): PublicExercise {
  return {
    ...e,
    blanks: e.blanks.map((b) =>
      b.kind === "choice"
        ? { kind: "choice", options: b.answers, size: 0 }
        : { kind: b.kind, size: Math.min(60, Math.max(4, ...b.answers.map((a) => [...a].length + 2))) },
    ),
  };
}

export const exercisesOf = (lesson: Lesson): Exercise[] =>
  lesson.parts.flatMap((p) => (p.kind === "exercise" ? [p.exercise] : []));

/**
 * The same lesson in two languages, compared: the same exercises in the same
 * order, the same blanks, the same strict answers, the same choices' right
 * option; the same number of headings, tables and summary. Returns the
 * differences, empty when the two agree.
 */
export function compareLessons(a: Lesson, b: Lesson): string[] {
  const out: string[] = [];
  const ea = exercisesOf(a);
  const eb = exercisesOf(b);
  if (ea.map((e) => e.id).join() !== eb.map((e) => e.id).join()) out.push(`exercises ${ea.map((e) => e.id).join(", ")} ≠ ${eb.map((e) => e.id).join(", ")}`);
  for (const x of ea) {
    const y = eb.find((e) => e.id === x.id);
    if (!y) continue;
    if (x.items.length !== y.items.length) out.push(`${x.id}: ${x.items.length} items ≠ ${y.items.length}`);
    if (Boolean(x.table) !== Boolean(y.table) || (x.table && y.table && (x.table.rows.length !== y.table.rows.length))) out.push(`${x.id}: tables differ`);
    if (x.blanks.length !== y.blanks.length) {
      out.push(`${x.id}: ${x.blanks.length} blanks ≠ ${y.blanks.length}`);
      continue;
    }
    x.blanks.forEach((bx, n) => {
      const by = y.blanks[n]!;
      if (bx.kind !== by.kind) out.push(`${x.id}, blank ${n + 1}: ${bx.kind} ≠ ${by.kind}`);
      else if (bx.kind === "strict" && bx.answers.join(" / ") !== by.answers.join(" / ")) out.push(`${x.id}, blank ${n + 1}: [[${bx.answers.join(" / ")}]] ≠ [[${by.answers.join(" / ")}]]`);
      else if (bx.kind === "choice" && (bx.right !== by.right || bx.answers.length !== by.answers.length)) out.push(`${x.id}, blank ${n + 1}: choices differ`);
    });
  }
  const shape = (l: Lesson): string =>
    l.parts.map((p) => (p.kind === "text" ? (p.markdown.match(/^#{2,4}\s/gm) ?? []).length + "h" + (p.markdown.match(/^\|.*\|\s*$/gm) ?? []).length + "t" : p.kind[0])).join(" ");
  if (shape(a) !== shape(b)) out.push(`structure (headings, table lines, blocks): ${shape(a)} ≠ ${shape(b)}`);
  return out;
}
