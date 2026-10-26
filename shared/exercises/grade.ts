/**
 * Marking a workbook answer against the key as printed (docs/exercises.md#marking).
 *
 * The key's conventions, from the Cambridge "in Use" books:
 * - "I've been looking / I have been looking": alternatives;
 * - "ill/unwell": either word;
 * - "(money)": optional words; a long bracket is a comment, "(in either order)" a rule;
 * - "fell … hurt": the parts of an item with several gaps;
 * - "… watching television": the rest as printed, only the end changes;
 * - "b", "a and c are true": letters, in any order.
 * What the key cannot foresee, the player can mark as right himself.
 */

export type ItemResult = "right" | "wrong" | "blank" | "open";

/** Lower case, one kind of apostrophe, no punctuation, single spaces. */
export function normalise(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘`´ʼ]/g, "'")
    .replace(/[“”«»"]/g, " ")
    .replace(/(^|\s)'+|'+(\s|$)/g, "$1$2")
    .replace(/[.,!?;:()[\]{}…–—-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ELLIPSIS = /…|\.\.\./g;
/** Options for one word-level choice: "ill/unwell" → ["ill", "unwell"]. */
const WORD_CHOICE = /(^|\s)([^\s/()]+(?:\/[^\s/()]+)+)(?=\s|$)/;
const SHORT_BRACKET = /\(([^()]{1,30})\)/;
const LIMIT = 64;

/** Every way of writing an alternative: word choices and optional words spelt out. */
export function spellings(alt: string): string[] {
  let out = [alt];
  for (let guard = 0; guard < 8; guard++) {
    const next: string[] = [];
    let changed = false;
    for (const s of out) {
      const choice = WORD_CHOICE.exec(s);
      const bracket = SHORT_BRACKET.exec(s);
      if (choice) {
        changed = true;
        for (const option of choice[2]!.split("/")) next.push(s.slice(0, choice.index) + choice[1] + option + s.slice(choice.index + choice[0].length));
      } else if (bracket && bracket[1]!.trim().split(/\s+/).length <= 2) {
        changed = true;
        next.push(s.slice(0, bracket.index) + bracket[1] + s.slice(bracket.index + bracket[0].length));
        next.push(s.slice(0, bracket.index) + s.slice(bracket.index + bracket[0].length));
      } else next.push(s);
    }
    out = [...new Set(next)].slice(0, LIMIT);
    if (!changed) break;
  }
  return out;
}

export interface Key {
  /** The alternatives, each as printed. */
  alternatives: string[];
  /** Parts of an item with several gaps may come in any order. */
  anyOrder: boolean;
  /** What to show in the correction. */
  shown: string;
}

/** The key's text for one item, read. */
export function readKey(answer: string): Key {
  let text = answer.replace(/\s+/g, " ").trim();
  const anyOrder = /\(in (either|any) order\)/i.test(text);
  // Long brackets are comments: "(it means very upset)".
  text = text.replace(/\(([^()]*)\)/g, (m, inner: string) => (inner.trim().split(/\s+/).length > 2 ? " " : m)).replace(/\s+/g, " ").trim();
  const alternatives = text
    .split(/\s+\/\s+/)
    .flatMap((a) => a.split(/\s+or\s+(?=…|\.\.\.|[A-Z])/))
    .map((a) => a.trim())
    .filter((a) => a !== "");
  return { alternatives, anyOrder, shown: answer.trim() };
}

const LETTERS = /^([a-h])((\s+(and|or)?\s*[a-h])*)(\s+(is|are)\s+(true|correct|right))?$/;

/** "a and c are true" → "ac"; null if the answer is not letters. */
function lettersOf(s: string): string | null {
  const n = normalise(s);
  if (!LETTERS.test(n)) return null;
  return [...new Set(n.replace(/\b(and|or|is|are|true|correct|right)\b/g, "").replace(/\s+/g, "").split(""))].sort().join("");
}

/** Whether one written answer matches one alternative of the key (with ellipses at either end). */
function matchesOne(given: string, alt: string): boolean {
  const g = normalise(given);
  if (!g) return false;
  const letters = lettersOf(alt);
  if (letters !== null) {
    const gl = lettersOf(given) ?? [...new Set(g.replace(/[^a-h]/g, "").split(""))].sort().join("");
    return gl === letters;
  }
  const starts = /^\s*(…|\.\.\.)/.test(alt);
  const ends = /(…|\.\.\.)\s*$/.test(alt);
  for (const spelt of spellings(alt.replace(ELLIPSIS, " "))) {
    const e = normalise(spelt);
    if (!e) continue;
    if (g === e) return true;
    // The word's first letter printed before the gap ("w……… up"): the rest is enough.
    if (e.length >= 5 && !e.includes(" ") && g === e.slice(1)) return true;
    if (starts && g.endsWith(" " + e)) return true;
    if (ends && g.startsWith(e + " ")) return true;
  }
  return false;
}

/** The parts of an alternative for an item with several gaps. */
function partsOf(alt: string, count: number): string[] | null {
  for (const sep of [/\s*(?:…|\.\.\.)\s*/, /\s*;\s*/, /\s*,\s*/]) {
    const parts = alt.split(sep).map((p) => p.trim()).filter((p) => p !== "");
    if (parts.length === count) return parts;
  }
  return null;
}

/** Marks one item: what was typed in each of its gaps (or its one field). */
export function markItem(answer: string, given: string[]): ItemResult {
  if (!answer.trim()) return "open";
  const typed = given.map((g) => g.trim());
  if (typed.every((t) => t === "") && !/^\s*[–—-]/.test(answer)) return "blank";
  const key = readKey(answer);
  // "–": nothing goes in the gap.
  if (key.alternatives.every((a) => normalise(a.replace(/\(.*?\)/g, "")) === "")) {
    return typed.every((t) => /^[-–—x]?$|^(nothing|no word|none)$/i.test(t)) ? "right" : "wrong";
  }
  const joined = typed.filter((t) => t !== "").join(" ");
  for (const alt of key.alternatives) {
    if (typed.length > 1) {
      const parts = partsOf(alt, typed.length);
      if (parts) {
        if (parts.every((p, i) => matchesOne(typed[i]!, p))) return "right";
        if (key.anyOrder || /;/.test(alt)) {
          const left = [...parts];
          if (typed.every((t) => {
            const i = left.findIndex((p) => matchesOne(t, p));
            return i >= 0 && left.splice(i, 1).length === 1;
          })) return "right";
        }
      }
      // The whole answer typed across the gaps, or in the first one.
      if (matchesOne(joined, alt)) return "right";
    } else if (matchesOne(typed[0]!, alt)) return "right";
  }
  return "wrong";
}

export interface MarkedItem {
  n: string;
  result: ItemResult;
  /** The key's answer, shown in the correction (empty for an open item without one). */
  expected: string;
}

export interface MarkedExercise {
  id: string;
  items: MarkedItem[];
  /** Items right, out of the items marked (open ones are not counted). */
  score: number;
  total: number;
}

/** Marks an exercise: answers by item, each a list of gaps. */
export function markExercise(
  exercise: { id: string; open: boolean; items: { n: string; answer: string; gaps: unknown[] }[] },
  answers: Record<string, string[]>,
  overrides: Record<string, boolean> = {},
): MarkedExercise {
  const items = exercise.items.map((it): MarkedItem => {
    const given = answers[it.n] ?? [];
    const slots = Math.max(1, it.gaps.length);
    const typed = Array.from({ length: slots }, (_, i) => given[i] ?? "");
    // Free answers are the player's to mark: never counted until he does.
    let result: ItemResult = exercise.open ? "open" : markItem(it.answer, typed);
    if (overrides[it.n] === true && result !== "blank") result = "right";
    if (overrides[it.n] === false && result === "open") result = "wrong";
    return { n: it.n, result, expected: it.answer };
  });
  const counted = items.filter((i) => i.result !== "open");
  return { id: exercise.id, items, score: counted.filter((i) => i.result === "right").length, total: counted.length };
}
