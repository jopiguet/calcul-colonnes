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
export type Fold = "macrons" | "ij" | "uv" | "translit" | "aleph3" | "accents" | "subscripts" | "egyptian" | "greek" | "persian" | "arabic" | "hebrew" | "malayalam" | "quechua";
export const FOLDS: readonly Fold[] = ["macrons", "ij", "uv", "translit", "aleph3", "accents", "subscripts", "egyptian", "greek", "persian", "arabic", "hebrew", "malayalam", "quechua"];

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

/** Latin letters as Greek ones, digraphs first: "logos", "anthrōpos", "psychē" spelt in Greek. */
const GREEK_FROM_LATIN: [RegExp, string][] = [
  [/rh/g, "ρ"], [/th/g, "θ"], [/ph/g, "φ"], [/[ck]h/g, "χ"], [/ps/g, "ψ"], [/ks/g, "ξ"],
  [/h/g, ""], [/a/g, "α"], [/[bv]/g, "β"], [/g/g, "γ"], [/d/g, "δ"], [/e/g, "ε"], [/z/g, "ζ"],
  [/[ij]/g, "ι"], [/[kcq]/g, "κ"], [/l/g, "λ"], [/m/g, "μ"], [/n/g, "ν"], [/x/g, "ξ"], [/o/g, "ο"],
  [/p/g, "π"], [/r/g, "ρ"], [/s/g, "σ"], [/t/g, "τ"], [/[uyw]/g, "υ"], [/f/g, "φ"],
];

/**
 * Ancient Greek compared without its accents and breathings, in Greek letters or in transliteration:
 * λόγος = logos, ψυχή = psychē = psuche, ἄγγελος = angelos; η is ε and ω is ο, so the long vowels are tested by choices.
 */
export function greekKey(text: string): string {
  let t = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC").toLowerCase();
  t = t.replace(/['’‘ʼ᾽`·\-.]/g, "").replace(/\s+/g, " ").trim();
  for (const [from, to] of GREEK_FROM_LATIN) t = t.replace(from, to);
  return t.replace(/η/g, "ε").replace(/ω/g, "ο").replace(/ς/g, "σ").replace(/γ([γκξχ])/g, "ν$1");
}

/** Persian letters to the consonant they write; vowels, ه and ع are dropped (see persianKey). */
const PERSIAN_LETTERS: Record<string, string> = {
  "ب": "b", "پ": "p", "ت": "t", "ط": "t", "ث": "s", "س": "s", "ص": "s", "ج": "j", "چ": "č", "خ": "x",
  "د": "d", "ذ": "z", "ز": "z", "ض": "z", "ظ": "z", "ر": "r", "ژ": "ž", "ش": "š", "غ": "q", "ق": "q",
  "ف": "f", "ک": "k", "ك": "k", "گ": "g", "ل": "l", "م": "m", "ن": "n",
};

/** Romanised Persian as typed: digraphs first, then the vowels, h, v, y and ' dropped like their letters. */
const PERSIAN_FROM_LATIN: [RegExp, string][] = [
  [/kh|x|ḵ/g, "x"], [/sh|š/g, "š"], [/ch|č/g, "č"], [/zh|ž/g, "ž"], [/gh|ğ|ġ|q/g, "q"], [/c/g, "k"],
];

/**
 * Persian compared by its consonants, in Persian script or in transliteration: کتاب = ketâb = ketab,
 * می‌خواهم = mikhâham. Short vowels are not written in Persian, so every vowel is dropped, and with them
 * the letters that also write vowels (ا و ی), and ه ح ع ء: h, v, y and the glottal stop are tested by choices.
 */
export function persianKey(text: string): string {
  let t = text.normalize("NFC").toLowerCase();
  t = t.replace(/[\u064B-\u065F\u0670\u0640\u200C\u200D]/g, "");
  for (const [from, to] of PERSIAN_FROM_LATIN) t = t.replace(from, to);
  t = t.replace(/[šžč]/g, (c) => ({ š: "\u0001", ž: "\u0002", č: "\u0003" })[c] ?? c);
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC");
  t = t.replace(/[\u0001\u0002\u0003]/g, (c) => ({ "\u0001": "š", "\u0002": "ž", "\u0003": "č" })[c] ?? c);
  t = t.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  t = [...t].map((c) => PERSIAN_LETTERS[c] ?? c).join("");
  return t.replace(/[aeiouâāēīōūyvwh'ʼ’ʿʾ`\-\s.]/g, "").replace(/[^\p{L}\p{N}]/gu, "").replace(/[\u0600-\u06FF]/g, "");
}

/** Romanised Arabic read as Arabic letters, digraphs and dotted letters first; vowels, w, y, h-less glottals dropped. */
const ARABIC_FROM_LATIN: [RegExp, string][] = [
  [/th|ṯ/g, "ث"], [/dh|ḏ/g, "ذ"], [/kh|x|ḫ|ḵ/g, "خ"], [/sh|š/g, "ش"], [/gh|ġ|ḡ/g, "غ"], [/ḥ/g, "ه"], [/ṣ/g, "س"], [/ḍ/g, "د"],
  [/ṭ/g, "ت"], [/ẓ/g, "ز"], [/ǧ|dj/g, "ج"],
];
const ARABIC_LATIN_LETTERS: Record<string, string> = {
  b: "ب", t: "ت", j: "ج", g: "ج", d: "د", r: "ر", z: "ز", s: "س", f: "ف", q: "ق", k: "ك", c: "ك", l: "ل", m: "م", n: "ن", h: "ه", p: "ب", v: "ف",
};
/** Arabic letters folded together: the emphatics with their plain partners, ح with ه, Persian forms with Arabic ones. */
const ARABIC_LETTERS: Record<string, string> = {
  "ص": "س", "ض": "د", "ط": "ت", "ظ": "ز", "ح": "ه", "ک": "ك", "ی": "", "ي": "", "ى": "", "و": "", "ا": "", "أ": "", "إ": "", "آ": "", "ٱ": "",
  "ء": "", "ؤ": "", "ئ": "", "ع": "", "ة": "", "گ": "ج", "پ": "ب", "چ": "ج", "ژ": "ز",
};

/**
 * Arabic compared by its consonants, in the script (with or without vowel marks) or in transliteration:
 * كتاب = kitāb = kitab, الشمس = ash-shams = al-shams. Short vowels are not written, so vowels, the letters
 * that carry long vowels (ا و ي ى), hamza, ʿayn and tāʾ marbūṭa are dropped; the emphatic letters fold into
 * the plain ones (ص س، ض د، ط ت، ظ ز، ح ه) and doubled consonants count once: these are tested by choices.
 */
export function arabicKey(text: string): string {
  let t = text.normalize("NFC").toLowerCase();
  t = t.replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED\u200C\u200D]/g, "");
  // The article before a "sun letter": ash-shams, ar-raḥmān are al-shams, al-raḥmān.
  t = t.replace(/(^|[\s])[ae]([tdrzsnl]h?|sh|[šṯḏṣḍṭẓ])-(?=\2)/g, "$1al-");
  for (const [from, to] of ARABIC_FROM_LATIN) t = t.replace(from, to);
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC");
  t = [...t].map((c) => ARABIC_LATIN_LETTERS[c] ?? ARABIC_LETTERS[c] ?? c).join("");
  t = t.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  t = t.replace(/[^\u0621-\u064A0-9]/g, "");
  return t.replace(/(.)\1+/g, "$1");
}

/** Romanised Hebrew read as Hebrew letters: kh, ch, ḥ and x are כ (with ח), ts and tz צ, sh ש; b and v both ב. */
const HEBREW_FROM_LATIN: [RegExp, string][] = [
  [/ts|tz|ṣ|ẓ/g, "צ"], [/sh|š|ś/g, "ש"], [/kh|ch|ḥ|ḫ|x/g, "כ"], [/zh|ž/g, "ז"], [/ph/g, "פ"],
];
const HEBREW_LATIN_LETTERS: Record<string, string> = {
  b: "ב", v: "ב", g: "ג", j: "ג", d: "ד", z: "ז", t: "ת", k: "כ", q: "כ", c: "כ", l: "ל", m: "מ", n: "נ", s: "ש", p: "פ", f: "פ", r: "ר",
};
const HEBREW_LETTERS: Record<string, string> = {
  "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ", "ח": "כ", "ק": "כ", "ט": "ת", "ס": "ש", "א": "", "ה": "", "ע": "", "י": "",
};

/**
 * Hebrew compared by its consonants, in the script (with or without niqqud) or in transliteration:
 * שלום = shalom, בוקר טוב = boker tov, לחם = lechem = leḥem. Vowels, א ה ע י and a vowel ו are dropped; a ו at the
 * start of a word or doubled (וו) is the consonant v, read as ב; letters of one sound fold together (כ ח ק, ת ט, ש ס)
 * and doubled consonants count once: these are tested by choices.
 */
export function hebrewKey(text: string): string {
  let t = text.normalize("NFC").toLowerCase();
  t = t.replace(/[\u0591-\u05C7\u05F3\u05F4'"׳״]/g, "");
  t = t.replace(/(^|[\s\-])ו(?!ו)/g, "$1ב").replace(/וו/g, "ב").replace(/ו/g, "");
  for (const [from, to] of HEBREW_FROM_LATIN) t = t.replace(from, to);
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC");
  t = [...t].map((c) => HEBREW_LATIN_LETTERS[c] ?? (c in HEBREW_LETTERS ? HEBREW_LETTERS[c] : c)).join("");
  t = t.replace(/[^\u05D0-\u05EA0-9]/g, "");
  return t.replace(/(.)\1+/g, "$1");
}

/** Malayalam letters in a plain Latin transliteration (ISO 15919 without its marks): consonants, vowels, vowel signs. */
const ML_VOWELS: Record<string, string> = {
  "അ": "a", "ആ": "aa", "ഇ": "i", "ഈ": "ii", "ഉ": "u", "ഊ": "uu", "ഋ": "ri", "എ": "e", "ഏ": "e", "ഐ": "ai", "ഒ": "o", "ഓ": "o", "ഔ": "au",
};
const ML_SIGNS: Record<string, string> = {
  "\u0D3E": "aa", "\u0D3F": "i", "\u0D40": "ii", "\u0D41": "u", "\u0D42": "uu", "\u0D43": "ri", "\u0D46": "e", "\u0D47": "e",
  "\u0D48": "ai", "\u0D4A": "o", "\u0D4B": "o", "\u0D4C": "au", "\u0D57": "au",
};
const ML_CONSONANTS: Record<string, string> = {
  "ക": "k", "ഖ": "kh", "ഗ": "g", "ഘ": "gh", "ങ": "ng", "ച": "c", "ഛ": "ch", "ജ": "j", "ഝ": "jh", "ഞ": "ny",
  "ട": "t", "ഠ": "th", "ഡ": "d", "ഢ": "dh", "ണ": "n", "ത": "t", "ഥ": "th", "ദ": "d", "ധ": "dh", "ന": "n",
  "പ": "p", "ഫ": "ph", "ബ": "b", "ഭ": "bh", "മ": "m", "യ": "y", "ര": "r", "ല": "l", "വ": "v", "ശ": "s",
  "ഷ": "s", "സ": "s", "ഹ": "h", "ള": "l", "ഴ": "zh", "റ": "r", "ഩ": "n", "ഺ": "t",
};
/** The chillu letters (consonants without a vowel) and the anusvara. */
const ML_FINALS: Record<string, string> = { "ൺ": "n", "ൻ": "n", "ർ": "r", "ൽ": "l", "ൾ": "l", "ൿ": "k", "ൔ": "m", "ൕ": "y", "ൖ": "zh", "ം": "m", "ഃ": "h", "ൎ": "r" };

/** Malayalam script as Latin letters: each consonant with its vowel sign, its inherent a, or none after the virama. */
function malayalamLatin(text: string): string {
  // റ്റ and ന്റ are read tt and nt (the alveolar stop), not rr and nr.
  const chars = [...text.replace(/[\u200C\u200D]/g, "").replace(/റ്റ/g, "ട്ട").replace(/ന്റ|ൻറ/g, "ന്ട")];
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    const next = chars[i + 1] ?? "";
    if (c in ML_CONSONANTS) {
      out += ML_CONSONANTS[c];
      if (next === "്") {
        // Virama: no vowel; at the end of a word the half-u (ŭ) is heard.
        const after = chars[i + 2] ?? "";
        if (!(after in ML_CONSONANTS)) out += "u";
        i++;
      } else if (next in ML_SIGNS) {
        out += ML_SIGNS[next];
        i++;
      } else out += "a";
    } else if (c in ML_VOWELS) out += ML_VOWELS[c];
    else if (c in ML_FINALS) out += ML_FINALS[c];
    else if (c === "്" || c in ML_SIGNS) continue;
    else out += c;
  }
  return out;
}

/** Latin spellings of Malayalam folded together, longest first: Manglish "zh", "ch", "th", "ee", "oo"… */
const ML_LATIN: [RegExp, string][] = [
  [/[ṟr]/g, "r"], [/[ṭt]h|[ṭt]/g, "t"], [/[ḍd]h|[ḍd]/g, "t"], [/c+h+|c/g, "c"], [/[śṣ]|sh/g, "s"],
  [/kh/g, "k"], [/gh/g, "g"], [/ph|f/g, "p"], [/bh/g, "b"], [/jh/g, "j"], [/[ṅñṇ]|ng|ny|nj/g, "n"], [/[ḷ]/g, "l"],
  [/w/g, "v"], [/[ṁṃ]/g, "m"], [/[ḥ]/g, "h"], [/q/g, "k"], [/x/g, "ks"], [/z/g, "Z"],
];

/**
 * Malayalam compared in its script or in transliteration, scholarly or as typed in "Manglish": കേരളം = kēraḷaṁ = keralam,
 * മലയാളം = malayāḷaṁ = malayalam, പഴം = pazham. Long and short vowels are one (ee and oo, as typed for ī and ū, are i and u), and so
 * are the retroflex and dental pairs (ട ത, ണ ന, ള ല), t and d (വീട് is typed veedu), the sibilants (ശ ഷ സ), ര and റ, aspirated and plain
 * consonants; ഴ (zh) stays itself. Doubled letters count once, and a final half-u (ŭ, ്) may be left out.
 */
export function malayalamKey(text: string): string {
  let t = malayalamLatin(text.normalize("NFC")).toLowerCase();
  t = t.replace(/r̥|ṛ/g, "ri").replace(/ḻ|l̤|zh/g, "Z");
  t = t.normalize("NFD").replace(/[̀-̂̄-ͯ]/g, "").normalize("NFC");
  for (const [from, to] of ML_LATIN) t = t.replace(from, to);
  t = t.replace(/ee/g, "i").replace(/oo/g, "u").replace(/[^a-zZ0-9\s]/g, "");
  t = t.replace(/(.)\1+/g, "$1");
  // A final half-u: written ് and read ŭ, often typed u or left out.
  t = t.replace(/([^aeiou\s])u(?=\s|$)/g, "$1");
  return t.replace(/\s+/g, " ").trim();
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

/**
 * Southern Quechua as typed: the official three vowels or five (e, o near q), Spanish spellings
 * (hu, j, c, qu: huasi, jatun, cuntur, quilla), -nchis for -nchik; aspirates and ejectives kept apart.
 */
export function quechuaKey(text: string): string {
  return text
    .normalize("NFD").replace(/[\u0300-\u0302\u0304\u0308]/g, "").normalize("NFC")
    .replace(/[-.]/g, "")
    .replace(/(^|[^a-zñ'])hu(?=[aeiou])/g, "$1w").replace(/([aeiou])hu(?=[aeiou])/g, "$1w")
    .replace(/j/g, "h")
    .replace(/qu(?=[ei])/g, "k").replace(/c(?![h])/g, "k")
    .replace(/e/g, "i").replace(/o/g, "u")
    .replace(/nchis\b/g, "nchik");
}

const SUBSCRIPTS: Record<string, string> = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };

/** The text as compared: lower case, single spaces, no punctuation but the apostrophe and the period, the course's folds. */
export function fold(text: string, folds: readonly Fold[]): string {
  let t = text.normalize("NFC").toLowerCase().replace(/[’‘ʼ]/g, "'").replace(/\s+/g, " ").trim();
  t = t.replace(/^[«"“'¿¡(]+|[.!?;:,»"”)]+$/g, "").trim();
  // Commas and the like inside an answer are the learner's choice: "amīce, venī" or "amice veni".
  t = t.replace(/\s*[,;:!?¡¿«»"“”]\s*/g, " ").replace(/\s+/g, " ").trim();
  if (folds.includes("egyptian")) return egyptianKey(t);
  if (folds.includes("greek")) return greekKey(t);
  if (folds.includes("persian")) return persianKey(t);
  if (folds.includes("arabic")) return arabicKey(t);
  if (folds.includes("hebrew")) return hebrewKey(t);
  if (folds.includes("malayalam")) return malayalamKey(t);
  if (folds.includes("quechua")) return quechuaKey(t);
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
    const f = folds.filter((x) => !["egyptian", "greek", "persian", "arabic", "hebrew", "malayalam", "quechua"].includes(x));
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
