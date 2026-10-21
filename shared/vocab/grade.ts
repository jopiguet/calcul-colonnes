/**
 * Grading of written vocabulary answers. Used by the browser (immediate
 * feedback) and by the server (what is recorded), so both always agree.
 *
 * Entries come from a phrase book, so the expected answer is often not a
 * single word:
 *
 *   "el amigo / la amiga"        two accepted answers
 *   "Buenas tardes / noches."    "buenas tardes" or "buenas noches"
 *   "Este / Esta es mi..."       "este es mi" or "esta es mi"
 *   "¿Cómo está (él / ella)?"    the bracketed part is optional
 *   "Hello/Hi!"                  "hello" or "hi"
 *
 * Verdicts, from best to worst:
 *
 *   right    exact, ignoring case, punctuation and spacing
 *   accent   right letters, missing or wrong accents (á, ñ, ü…)
 *   typo     one letter off, in an answer of at least 5 letters
 *   article  right word, missing or wrong article (el/la/los/las/un/una)
 *   wrong
 *
 * right, accent and typo count as right for the spaced repetition: the
 * correct spelling is shown. article counts as wrong: the gender is part of
 * the word in Spanish and in German.
 *
 * German: capitals are not checked (nouns are capitalised, a phone may not
 * be); ß may be written ss (as in Switzerland) and ä, ö, ü as ae, oe, ue:
 * both are right. A plain vowel for an umlaut (Mutter for Mütter) is "accent".
 *
 * Japanese answers are written in kana or kanji (with a Japanese keyboard) or
 * in rōmaji, the entry's reading. Rōmaji is compared without its long-vowel
 * marks: "gacho", "gachou" and "gachō" are all ガチョウ. Full-width and
 * half-width characters are the same, and Japanese punctuation is ignored.
 */

import { hasKana, kanaToRomaji } from "./kana";

export type Verdict = "right" | "accent" | "typo" | "article" | "wrong";
export type AnswerLang = "en" | "es" | "de" | "ja";

export const COUNTS_AS_RIGHT: ReadonlySet<Verdict> = new Set(["right", "accent", "typo"]);

const ARTICLES: Record<AnswerLang, string[]> = {
  es: ["el", "la", "los", "las", "un", "una", "unos", "unas"],
  de: ["der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem", "einer", "eines"],
  // English entries have no article ("key"), but "the key" and "to walk" are fine.
  en: ["the", "a", "an", "to"],
  ja: [],
};

/** Text as shown: book typography cleaned, "..." for an open end. */
export function display(text: string): string {
  return text.replace(/…/g, "...").replace(/\s+/g, " ").trim();
}

/** Lower case, no punctuation, single spaces. Accents are kept. */
export function normalise(text: string): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[’`´]/g, "'")
    .replace(/\.\.\.|…/g, " ")
    .replace(/[¿?¡!.,;:"«»“”()]/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}

/** German spellings without special letters: "Straße" and "Strasse", "Mütter" and "Muetter" are one. */
export function germanFold(text: string): string {
  return text.replace(/ß/g, "ss").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue");
}

/** Without accents or tilde: "niño" → "nino". */
export function plain(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Every way of writing the answer that the entry accepts, normalised. */
export function acceptedForms(expected: string): string[] {
  // As printed, brackets read as spaces: "embarcar(se)", "(fish)bone".
  const forms = new Set<string>([normalise(expected)]);
  // An optional bracketed part: with and without it.
  const variants = [expected.replace(/\(([^)]*)\)/g, "$1"), expected.replace(/\([^)]*\)/g, " ")];
  for (const variant of variants) {
    // Typed out in full, alternatives included, is fine too.
    if (variant.includes("/")) forms.add(normalise(variant));
    for (const words of expandWordSlashes(variant)) {
      for (const form of expandSlashes(words)) {
        const n = normalise(form);
        if (n) forms.add(n);
      }
    }
  }
  return [...forms];
}

/**
 * A slash between two words with no space ("his/her", "hard/soft") offers a
 * choice of that word only: "to take his/her pulse" → "to take his pulse",
 * "to take her pulse". A first side ending in "-" ("step-/half-brother") takes
 * the end of the second ("step-brother").
 */
function expandWordSlashes(text: string): string[] {
  const match = /(^|\s)([^\s/]+(?:\/[^\s/]+)+)(?=\s|$|[?!.,])/.exec(text);
  if (!match) return [text];
  const token = match[2]!;
  const options = token.split("/");
  const last = options[options.length - 1]!;
  const start = match.index + match[1]!.length;
  const words = options.map((o) => (o.endsWith("-") && last.includes("-") ? o + last.slice(last.indexOf("-") + 1) : o));
  return words.flatMap((w) => expandWordSlashes(text.slice(0, start) + w + text.slice(start + token.length)));
}

/**
 * "A / B" alternatives. When the two sides differ in length, the shorter side
 * replaces the matching end (or start) of the longer one:
 * "buenas tardes / noches" → "buenas noches"; "este / esta es mi" → "este es mi".
 */
function expandSlashes(text: string): string[] {
  if (!text.includes("/")) return [text];
  const parts = text.split("/").map((p) => normalise(p).split(" ").filter(Boolean));
  const first = parts[0] ?? [];
  const out: string[] = [first.join(" ")];
  for (const part of parts.slice(1)) {
    if (part.length === 0) continue;
    if (part.length === first.length) out.push(part.join(" "));
    else if (part.length < first.length) out.push([...first.slice(0, first.length - part.length), ...part].join(" "));
    else {
      // First side shorter: it replaces the start of the longer one.
      out[0] = [...first, ...part.slice(first.length)].join(" ");
      out.push(part.join(" "));
    }
  }
  return out;
}

/** Levenshtein distance, stopping early above `limit`. */
function distance(a: string, b: string, limit = 2): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + cost);
      current.push(value);
      best = Math.min(best, value);
    }
    if (best > limit) return limit + 1;
    previous = current;
  }
  return previous[b.length]!;
}

function withoutArticle(text: string, lang: AnswerLang): string {
  const words = text.split(" ");
  return words.length > 1 && ARTICLES[lang].includes(words[0]!) ? words.slice(1).join(" ") : text;
}

/** Japanese text: full-width forms folded (ＣＤ → CD, （ → (), Japanese punctuation and spaces dropped. */
function japanese(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[［\[]/g, "(")
    .replace(/[］\]]/g, ")")
    .replace(/[。、・「」『』〜~ー\s]+$/u, "")
    .replace(/[。、・「」『』〜~\s]/gu, "");
}

/**
 * Rōmaji without what varies between ways of writing it: case, spaces,
 * hyphens and apostrophes, long-vowel marks (ō → o) and the spellings of a
 * long vowel (ou, oo, uu, aa, ii, ee → one vowel).
 */
export function romajiKey(text: string): string {
  return plain(text.normalize("NFKC").toLowerCase())
    .replace(/[^a-z]/g, "")
    .replace(/m(?=[bpm])/g, "n") // shimbun, shinbun
    .replace(/ou/g, "o")
    .replace(/([aeiou])\1+/g, "$1");
}

function gradeJapanese(given: string, expected: string, reading: string): Verdict {
  const answer = normalise(japanese(given)).replace(/\s/g, "");
  if (!answer) return "wrong";
  // In Japanese script: as printed, or without an optional bracketed reading ("CD（シーディー）").
  const forms = acceptedForms(japanese(expected)).map((f) => f.replace(/\s/g, ""));
  if (forms.includes(answer)) return "right";
  if (!reading) return "wrong";
  // In rōmaji: any of the reading's alternatives.
  const typed = normalise(given);
  const readings = acceptedForms(reading);
  if (readings.includes(typed)) return "right";
  // Kana is compared by its sound: ねこ for 猫 (neko).
  const key = romajiKey(hasKana(given) ? kanaToRomaji(answer) : given);
  const keys = readings.map(romajiKey).filter(Boolean);
  if (!key) return "wrong";
  if (keys.includes(key)) return "right";
  if (keys.some((k) => k.length >= 5 && distance(key, k, 1) <= 1)) return "typo";
  return "wrong";
}

/**
 * The verdict for a written answer. `reading` is the term's reading, for a
 * Japanese term: rōmaji is accepted for it.
 */
export function grade(given: string, expected: string, lang: AnswerLang, reading = ""): Verdict {
  if (lang === "ja") return gradeJapanese(given, expected, reading);
  const answer = normalise(given);
  if (!answer) return "wrong";
  const forms = acceptedForms(expected);

  // English: an article or "to" is optional on either side.
  const candidates = lang === "en" ? forms.flatMap((f) => [f, withoutArticle(f, "en")]) : forms;
  const tried = lang === "en" ? [answer, withoutArticle(answer, "en")] : [answer];

  if (candidates.some((f) => tried.includes(f))) return "right";
  if (lang === "de" && candidates.some((f) => tried.some((t) => germanFold(t) === germanFold(f)))) return "right";
  if (candidates.some((f) => tried.some((t) => plain(t) === plain(f)))) return "accent";

  if (lang === "es" || lang === "de") {
    // Right word, wrong or missing article.
    const fold = (t: string): string => (lang === "de" ? plain(germanFold(t)) : plain(t));
    const bare = fold(withoutArticle(answer, lang));
    if (forms.some((f) => withoutArticle(f, lang) !== f && fold(withoutArticle(f, lang)) === bare)) return "article";
  }

  // One letter off, on answers long enough for that to be a slip.
  const longEnough = (f: string): boolean => withoutArticle(f, lang).length >= 5;
  if (candidates.some((f) => longEnough(f) && tried.some((t) => distance(plain(t), plain(f), 1) <= 1))) return "typo";
  return "wrong";
}

/** Written answers are asked only for short entries; long phrases stay multiple choice. */
export const MAX_WRITTEN_WORDS = 4;

export function writable(expected: string): boolean {
  const single = acceptedForms(expected).filter((f) => !f.includes("/"));
  const longest = Math.max(...single.map((f) => f.split(" ").length));
  return longest <= MAX_WRITTEN_WORDS;
}
