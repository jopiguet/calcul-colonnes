/**
 * Marking a language course's exercise (docs/language-courses.md#marking):
 * each blank on its own, against the answers of the lesson's Markdown.
 *
 * - strict: equal to an answer once both are folded: case, spaces, final
 *   punctuation, and the course's own folds (Latin: macrons, i for j, u for v);
 * - free: the same, then with all punctuation gone; otherwise "check": the
 *   model answer is shown and the player may mark his own right;
 * - choice: the right option.
 */
import type { Blank } from "./format";

export type BlankResult = "right" | "wrong" | "blank" | "check";

/** A course's folds: what may be written either way in its language. */
/**
 * translit: the special letters of Egyptian and Akkadian transliteration; aleph3: Egyptian ꜣ typed as "3";
 * egyptian: a strict Egyptian answer by its consonants, as a keyboard or the Egyptological pronunciation
 * writes them ("ankh", "anx", "ꜥnḫ"; "nefer", "nfr"); free answers keep their vowels.
 */
export type Fold = "macrons" | "ij" | "uv" | "translit" | "aleph3" | "accents" | "subscripts" | "egyptian";
export const FOLDS: readonly Fold[] = ["macrons", "ij", "uv", "translit", "aleph3", "accents", "subscripts", "egyptian"];

/**
 * An Egyptian transliteration as its consonant skeleton: ꜣ, ꜥ (3, ', a), the vowels a, e, o and the
 * morpheme dots are dropped; j, i, y are one letter; w and u one; the dotted and underlined letters
 * fall on their plain ones (ḥ ḫ ẖ h; š s; ṯ t; ḏ d; ḳ q k), and so do kh, x, sh, tj, dj.
 */
export function egyptianKey(text: string): string {
  let t = text.normalize("NFC").toLowerCase();
  t = t.replace(/[ꜣꜢ3ꜥꜤʿʾ'’‘`]/g, "").replace(/[-.=()⸗\s]/g, "");
  t = t.replace(/kh|x/g, "h").replace(/sh/g, "s").replace(/tj/g, "t").replace(/dj/g, "d");
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC");
  t = t.replace(/[ꞽỉ]/g, "i").replace(/[jy]/g, "i").replace(/u/g, "w").replace(/[qc]/g, "k");
  return t.replace(/[aeo]/g, "");
}

/** Egyptian and Akkadian transliterations as typed on a keyboard: ꜣ as 3 or a, ꜥ as ' or e, ḥ as h… */
const TRANSLIT: [RegExp, string][] = [
  [/[ꜣꜢ]/g, "a"],
  [/[ꜥꜤʿ‘’`'ʾ]/g, ""],
  [/[ḥḤ]/g, "h"],
  [/[ḫḪẖ]/g, "kh"],
  [/[šŠ]/g, "sh"],
  [/[ṯṮ]/g, "tj"],
  [/[ḏḎ]/g, "dj"],
  [/[ḳḲq]/g, "k"],
  [/[ṣṢ]/g, "s"],
  [/[ṭṬ]/g, "t"],
  [/[ĝĜ]/g, "g"],
  [/[ỉỈi̯]/g, "i"],
  [/[ꞽ]/g, "i"],
];

const SUBSCRIPTS: Record<string, string> = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };

/** The text as compared: lower case, single spaces, no punctuation but the apostrophe and the period, the course's folds. */
export function fold(text: string, folds: readonly Fold[]): string {
  let t = text.normalize("NFC").toLowerCase().replace(/[’‘ʼ]/g, "'").replace(/\s+/g, " ").trim();
  t = t.replace(/^[«"“'¿¡(]+|[.!?;:,»"”)]+$/g, "").trim();
  // Commas and the like inside an answer are the learner's choice: "amīce, venī" or "amice veni".
  t = t.replace(/\s*[,;:!?¡¿«»"“”]\s*/g, " ").replace(/\s+/g, " ").trim();
  if (folds.includes("egyptian")) return egyptianKey(t);
  if (folds.includes("subscripts")) t = t.replace(/[₀-₉]/g, (d) => SUBSCRIPTS[d] ?? d);
  if (folds.includes("aleph3")) t = t.replace(/3/g, "ꜣ");
  if (folds.includes("translit")) {
    // Hyphens and dots between morphemes (sḏm.n.f, lugal-e) as the learner likes.
    t = t.replace(/[-.=]/g, "");
    for (const [from, to] of TRANSLIT) t = t.replace(from, to);
  }
  if (folds.includes("macrons") || folds.includes("accents")) {
    t = t.normalize("NFD").replace(folds.includes("accents") ? /[̀-ͯ]/g : /[̄̆̂]/g, "").normalize("NFC");
  }
  if (folds.includes("ij")) t = t.replace(/j/g, "i");
  if (folds.includes("uv")) t = t.replace(/v/g, "u");
  return t;
}

/** Looser: no punctuation at all, for free answers (sentences). */
const loose = (text: string, folds: readonly Fold[]): string =>
  fold(text, folds).replace(/[^\p{L}\p{N}\s']/gu, " ").replace(/\s+/g, " ").trim();

export function markBlank(blank: Blank, given: string, folds: readonly Fold[]): BlankResult {
  if (blank.kind === "choice") {
    if (given === "") return "blank";
    return Number(given) === blank.right ? "right" : "wrong";
  }
  if (!given.trim()) return "blank";
  if (blank.kind === "free") {
    // A free answer is a sentence in the interface's language: the Egyptian consonant skeleton is for strict blanks only.
    const f = folds.filter((x) => x !== "egyptian");
    const exact = fold(given, f);
    if (blank.answers.some((a) => fold(a, f) === exact)) return "right";
    const l = loose(given, f);
    return blank.answers.some((a) => loose(a, f) === l) ? "right" : "check";
  }
  const g = fold(given, folds);
  if (blank.answers.some((a) => fold(a, folds) === g)) return "right";
  return "wrong";
}

export interface MarkedExercise {
  results: BlankResult[];
  /** Blanks right (or marked right by the player), out of all. */
  score: number;
  total: number;
}

/** An exercise marked: each blank, then the player's own marks on free (or wrong) blanks. */
export function markExercise(blanks: Blank[], given: string[], folds: readonly Fold[], overrides: Record<number, boolean> = {}): MarkedExercise {
  const results = blanks.map((b, i) => {
    const r = markBlank(b, given[i] ?? "", folds);
    if (overrides[i] === true && r !== "blank" && r !== "right" && b.kind !== "choice") return "right" as const;
    return r;
  });
  return { results, score: results.filter((r) => r === "right").length, total: blanks.length };
}

/** What is shown after the check: a choice's right option, or the first answer. */
export const expectedOf = (b: Blank): string => (b.kind === "choice" ? b.answers[b.right ?? 0]! : b.answers.join(" / "));
