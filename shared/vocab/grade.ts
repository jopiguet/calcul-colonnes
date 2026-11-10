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
 * A word printed with its plural ("die Ehre, -n", "der Plan, ¨e") or a verb
 * with its forms ("finden, findet, fand, hat gefunden") is right on its own:
 * "die Ehre", "finden"; the case it governs ("+ D") is optional. A separable
 * verb's bar ("an|sehen") is not typed: "ansehen".
 *
 * French and English answers (the language of the meanings): an article is
 * optional ("la patience" or "patience", "l'honneur" or "honneur").
 *
 * Arabic answers are written in Arabic script or in the book's transliteration
 * (the entry's reading). Vowel marks are optional: كتاب and كِتاب are both
 * right. Another form of alef, alif maqsura for ya, ta marbuta for ha (أ/ا,
 * ى/ي, ة/ه) is "accent"; the article ال (al) left out or added is "typo".
 * Transliteration is compared by its letters: case, spaces, hyphens,
 * apostrophes and the spelling of long vowels (ee/i, ou/u, aa/a) do not count.
 *
 * Japanese answers are written in kana or kanji (with a Japanese keyboard) or
 * in rōmaji, the entry's reading. Rōmaji is compared without its long-vowel
 * marks: "gacho", "gachou" and "gachō" are all ガチョウ. Full-width and
 * half-width characters are the same, and Japanese punctuation is ignored.
 *
 * Chinese, Sumerian (cuneiform) and Egyptian (hieroglyphs) are answered in
 * their script or by the entry's reading (pinyin, a sign's reading, an
 * Egyptological transliteration), compared by its letters: tones, diacritics
 * and the signs ꜣ, ꜥ written 3 or ' do not count. Portuguese takes articles
 * like Spanish; Swahili is plain text.
 *
 * Malayalam is answered in its script or in transliteration, scholarly or
 * "Manglish" (kēraḷaṁ, keralam): as printed it is right; the same by the
 * course's Malayalam key (long and short vowels, ട and ത, ള and ല… one) it is
 * "accent", so the spelling is shown. Inuktitut (syllabics or Roman
 * orthography) and Tibetan (script or Wylie) are graded the same way, each by its key.
 */

import { hasKana, kanaToRomaji } from "./kana";
import { inuktitutKey, malayalamKey, tibetanKey } from "../lessons/grade";

export type Verdict = "right" | "accent" | "typo" | "article" | "wrong";
export type AnswerLang = "en" | "fr" | "es" | "de" | "ja" | "ar" | "pt" | "sw" | "zh" | "sux" | "egy" | "ml" | "iu" | "bo";

/** Languages written in their own script and also answered by their reading (as Arabic). */
export const SCRIPT_LANGS: ReadonlySet<string> = new Set(["ja", "ar", "zh", "sux", "egy", "ml", "iu", "bo"]);

/** The grading rules for a book language: those it has, else English (plain text). */
export function answerLangOf(code: string): AnswerLang {
  const known: readonly string[] = ["en", "fr", "es", "de", "ja", "ar", "pt", "sw", "zh", "sux", "egy", "ml", "iu", "bo"];
  return (known.includes(code) ? code : "en") as AnswerLang;
}

export const COUNTS_AS_RIGHT: ReadonlySet<Verdict> = new Set(["right", "accent", "typo"]);

const ARTICLES: Record<AnswerLang, string[]> = {
  es: ["el", "la", "los", "las", "un", "una", "unos", "unas"],
  de: ["der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem", "einer", "eines"],
  // English entries have no article ("key"), but "the key" and "to walk" are fine.
  en: ["the", "a", "an", "to"],
  // French, answered in one's own language: an article is optional ("l'" is elided, see withoutArticle).
  fr: ["le", "la", "les", "un", "une", "des", "du"],
  ja: [],
  ar: [],
  pt: ["o", "a", "os", "as", "um", "uma", "uns", "umas"],
  sw: [],
  zh: [],
  sux: [],
  egy: [],
  ml: [],
  iu: [],
  bo: [],
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
    // A separable verb's bar: "an|sehen" is typed "ansehen".
    .replace(/(\p{L})\|(\p{L})/gu, "$1$2")
    .replace(/\.\.\.|…/g, " ")
    .replace(/[¿?¡!.,;:"«»“”()؟،؛]/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}

/** English negatives whose stem changes: "won't" is "will not". */
const IRREGULAR_NOT: Record<string, string> = { "won't": "will not", "can't": "can not", "cannot": "can not", "shan't": "shall not", "ain't": "am not" };
/** Words whose "'s" is "is" ("it's"), not a possessive ("John's"). */
const IS_BEFORE = new Set(["he", "she", "it", "that", "what", "there", "here", "who", "where", "how", "when", "why", "this"]);

/**
 * English contractions written out, on a normalised text: "I'm" and "I am",
 * "don't" and "do not", "it's" and "it is" are one answer, either way round.
 * "'d" reads "would", "'s" reads "is" (after a pronoun only: "John's" stays).
 */
export function expandEnglish(text: string): string {
  return text
    .split(" ")
    .map((word) => {
      if (IRREGULAR_NOT[word]) return IRREGULAR_NOT[word];
      if (word === "let's") return "let us";
      if (word === "y'all") return "you all";
      const n = /^(\p{L}+)n't$/u.exec(word);
      if (n) return `${n[1]} not`;
      const m = /^(\p{L}+)'(m|re|ve|ll|d|s)$/u.exec(word);
      if (!m) return word;
      const [, stem, tail] = m;
      if (tail === "s") return IS_BEFORE.has(stem!) ? `${stem} is` : word;
      return `${stem} ${{ m: "am", re: "are", ve: "have", ll: "will", d: "would" }[tail!]}`;
    })
    .join(" ");
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
  // "lord; ruler": each side of a semicolon is an answer of its own.
  const sides = expected.split(/;(?![^(]*\))/).map((side) => side.trim()).filter(Boolean);
  if (sides.length > 1) return [...new Set([normalise(expected), ...sides.flatMap(acceptedForms)])];
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
    else if (part.length < first.length && formsOf(part, first)) {
      // Second side shorter, a variant of the longer one's start: "la jugadora de baloncesto / el jugador".
      out.push([...part, ...first.slice(part.length)].join(" "));
    } else if (part.length < first.length && part.every((w, i) => w === first[i])) {
      // The start of the longer side, word for word: an answer of its own ("to go up / to go").
      out.push(part.join(" "));
    } else if (part.length < first.length) out.push([...first.slice(0, first.length - part.length), ...part].join(" "));
    else if (formsOf(first, part)) {
      // First side shorter, a variant of the longer one's start: it replaces it
      // ("este / esta es mi", "el jugador / la jugadora de baloncesto").
      out[0] = [...first, ...part.slice(first.length)].join(" ");
      out.push(part.join(" "));
    } else {
      // Two answers of their own: "becoming / process of coming-to-be".
      out.push(part.join(" "));
    }
  }
  return out;
}

/** Every article of every language: "el / la", "der / die" are forms of one another. */
const ANY_ARTICLE = new Set(Object.values(ARTICLES).flat());

/**
 * The short side is another form of the long side's first words, word by
 * word: the same word, two articles, or two forms of one word ("el jugador"
 * and "la jugadora de …", "der / die Büroangestellte"), one of them changed.
 */
function formsOf(short: string[], long: string[]): boolean {
  let word = false;
  let changed = false;
  for (const [i, a] of short.entries()) {
    const b = long[i]!;
    if (a !== b) changed = true;
    if (ANY_ARTICLE.has(a) && ANY_ARTICLE.has(b)) continue;
    if (a !== b && !sharesStem(a, b)) return false;
    word = true;
  }
  // Articles alone count too: "der / die Büroangestellte".
  return changed && (word || short.length === 1);
}

/** Two forms of one word: "este" and "esta", "his" and "her" (the same first letter and length close). */
function sharesStem(a: string, b: string): boolean {
  return a.length >= 2 && b.length >= 2 && a[0] === b[0] && Math.abs(a.length - b.length) <= 2 && distance(a, b, 2) <= 2;
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
  if (lang === "fr" && /^[ld]'\p{L}/u.test(text)) return text.slice(2);
  const words = text.split(" ");
  return words.length > 1 && ARTICLES[lang].includes(words[0]!) ? words.slice(1).join(" ") : text;
}

/** A plural after a German noun: "-n", "¨e", "-", "-ns", "die Charaktere". */
const PLURAL = /^(?:-\S*|¨\S*|"\S*|(?:der|die|das)\s+\S+)$/;
/** The last form of a German verb: "hat gefunden", "ist gelungen + D". */
const PERFECT = /^(?:\(?sich\)?\s+)?(?:hat|ist)\s/;

/**
 * The German word without what the book prints with it: its plural ("die
 * Ehre, -n" → "die Ehre"), its forms ("finden, findet, fand, hat gefunden" →
 * "finden"), the case it governs ("+ D"). [] when there is nothing to leave out.
 */
export function germanHeads(expected: string): string[] {
  const heads = new Set<string>();
  const alternatives = expected.split(/\s+\/\s+/);
  for (const printed of alternatives) {
    // Brackets holding forms or a case ("(sieht … an, sah … an, hat angesehen)", "(+ D)") are left out;
    // others stay optional, as everywhere ("(sich) an|sehen").
    const alternative = printed.replace(/\s*\([^()]*[,+][^()]*\)/g, "").trim();
    const parts = alternative.split(/,\s*/).map((p) => p.trim()).filter(Boolean);
    let head = alternative;
    if (parts.length >= 2) {
      const rest = parts.slice(1).map((p) => p.replace(/\s*\+\s*[DAG]\b.*$/, "").trim());
      if (rest.every((p) => PLURAL.test(p)) || (rest.length >= 2 && PERFECT.test(rest[rest.length - 1]!))) head = parts[0]!;
    }
    head = head.replace(/\s*\(?\+\s*[DAG]\)?/g, "").trim();
    // Each side of " / " on its own too: "der Täter, - / die Täterin".
    if (head && (head !== printed.trim() || alternatives.length > 1)) heads.add(head);
  }
  return [...heads];
}

/** Every form accepted in this language: as printed, and for German the word alone. */
function formsFor(expected: string, lang: AnswerLang): string[] {
  const forms = acceptedForms(expected);
  if (lang !== "de") return forms;
  return [...new Set([...forms, ...germanHeads(expected).flatMap(acceptedForms)])];
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

/** Arabic letters only: no vowel marks, no tatweel, no punctuation, no spaces. */
export function arabicKey(text: string): string {
  return normalise(text.normalize("NFKC"))
    .replace(/[\u064b-\u065f\u0670\u0640]/g, "")
    .replace(/\s/g, "");
}

/** Spellings that vary: forms of alef, alif maqsura, ta marbuta, hamza seats. */
const arabicLoose = (key: string): string =>
  key.replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي");

/** Without the article: الـ at the start of a word ("اليوم" → "يوم"). */
const withoutAl = (key: string): string => key.replace(/^ال/, "");

/** A transliteration by its letters: "al usbou’", "alusbu" and "Al-Usbu" are one. */
export function latinKey(text: string): string {
  return plain(text.normalize("NFKC").toLowerCase())
    .replace(/[^a-z]/g, "")
    .replace(/ou|oo/g, "u")
    .replace(/ee/g, "i")
    .replace(/e/g, "i")
    .replace(/o/g, "u")
    .replace(/([a-z])\1+/g, "$1");
}

function gradeArabic(given: string, expected: string, reading: string): Verdict {
  if (!normalise(given)) return "wrong";
  // Arabic script: each accepted form, without its vowel marks.
  if (/[\u0600-\u06ff]/.test(given)) {
    const answer = arabicKey(given);
    const forms = acceptedForms(expected.normalize("NFKC")).map(arabicKey);
    if (forms.includes(answer)) return "right";
    if (forms.some((f) => arabicLoose(f) === arabicLoose(answer))) return "accent";
    if (forms.some((f) => withoutAl(arabicLoose(f)) === withoutAl(arabicLoose(answer)))) return "typo";
    if (forms.some((f) => f.length >= 5 && distance(arabicLoose(f), arabicLoose(answer), 1) <= 1)) return "typo";
    return "wrong";
  }
  if (!reading) return "wrong";
  // Transliteration.
  const key = latinKey(given);
  // Each side of a "/" on its own: the book spaces them unevenly ("al muhandes/ almuhandesa").
  const keys = [...acceptedForms(reading), ...reading.split("/").flatMap(acceptedForms)].map(latinKey).filter(Boolean);
  if (!key) return "wrong";
  if (keys.includes(key)) return "right";
  const bare = (k: string): string => k.replace(/^a[lshdtrnz]?(?=[a-z]{2})/, "");
  if (keys.some((k) => /^al/.test(k) !== /^al/.test(key) && bare(k) === bare(key))) return "typo";
  if (keys.some((k) => k.length >= 5 && distance(key, k, 1) <= 1)) return "typo";
  return "wrong";
}

/** Script, spaces and punctuation aside: "人 们" and "人们" are one. */
function scriptKey(text: string): string {
  return normalise(text.normalize("NFKC")).replace(/\s/g, "");
}

/**
 * A reading by its letters: "rén", "ren2", "Ren" are one. In Egyptian, ꜣ may be
 * typed 3 or a and ꜥ may be typed ' or left out ("ꜥnḫ", "'nh", "anh").
 */
function readingKey(text: string, lang: AnswerLang): string {
  const egyptian = lang === "egy" ? text.replace(/[ꜣꜢ3]/g, "a").replace(/[ꜥꜤʿʾ']/g, "") : text;
  return latinKey(egyptian);
}

/** An Egyptian reading's keys: ꜣ and ꜥ read as "a" or left out ("rꜥ" is "ra" or "r"). */
function readingKeys(text: string, lang: AnswerLang): string[] {
  if (lang !== "egy") return [readingKey(text, lang)];
  return [readingKey(text, lang), latinKey(text.replace(/[ꜣꜢꜥꜤʿ3]/g, "a"))];
}

/** Chinese, cuneiform, hieroglyphs: the script itself, or the reading. */
function gradeScript(given: string, expected: string, reading: string, lang: AnswerLang): Verdict {
  if (!normalise(given)) return "wrong";
  if (/[^\p{Script=Latin}\p{N}\p{P}\p{Z}\p{M}]/u.test(given)) {
    const answer = scriptKey(given);
    return acceptedForms(expected.normalize("NFKC")).map(scriptKey).includes(answer) ? "right" : "wrong";
  }
  if (!reading) return "wrong";
  const givenKeys = readingKeys(given, lang).filter(Boolean);
  if (givenKeys.length === 0) return "wrong";
  const key = givenKeys[0]!;
  const keys = [...acceptedForms(reading), ...reading.split(/[/;,]/).flatMap(acceptedForms)].flatMap((k) => readingKeys(k, lang)).filter(Boolean);
  if (givenKeys.some((k) => keys.includes(k))) return "right";
  if (keys.some((k) => k.length >= 5 && distance(key, k, 1) <= 1)) return "typo";
  return "wrong";
}

/**
 * The verdict for a written answer. `reading` is the term's reading, for a
 * Japanese term: rōmaji is accepted for it.
 */
export function grade(given: string, expected: string, lang: AnswerLang, reading = ""): Verdict {
  if (lang === "ja") return gradeJapanese(given, expected, reading);
  if (lang === "ar") return gradeArabic(given, expected, reading);
  if (lang === "zh" || lang === "sux" || lang === "egy") return gradeScript(given, expected, reading, lang);
  if (lang === "ml") return gradeKeyed(given, expected, reading, malayalamKey);
  if (lang === "iu") return gradeKeyed(given, expected, reading, inuktitutKey);
  if (lang === "bo") return gradeKeyed(given, expected, reading, tibetanKey);
  // English: contractions written out on both sides ("I'm" and "I am").
  const english = (t: string): string => (lang === "en" ? expandEnglish(t) : t);
  const answer = english(normalise(given));
  if (!answer) return "wrong";
  const forms = formsFor(expected, lang).map(english);

  // English and French: an article (or "to") is optional on either side.
  const optional = lang === "en" || lang === "fr";
  const candidates = optional ? forms.flatMap((f) => [f, withoutArticle(f, lang)]) : forms;
  const tried = optional ? [answer, withoutArticle(answer, lang)] : [answer];

  if (candidates.some((f) => tried.includes(f))) return "right";
  if (lang === "de" && candidates.some((f) => tried.some((t) => germanFold(t) === germanFold(f)))) return "right";
  if (candidates.some((f) => tried.some((t) => plain(t) === plain(f)))) return "accent";

  if (lang === "es" || lang === "de" || lang === "pt") {
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

/**
 * Malayalam, Inuktitut, Tibetan: the script as printed, or the reading (transliteration, Roman
 * orthography, Wylie); then the same by the language's key, "accent", so the spelling is shown.
 */
function gradeKeyed(given: string, expected: string, reading: string, key: (t: string) => string): Verdict {
  const answer = normalise(given);
  if (!answer) return "wrong";
  const forms = [...acceptedForms(expected), ...(reading ? acceptedForms(reading) : [])];
  if (forms.map(normalise).includes(answer)) return "right";
  const k = key(answer);
  return k && forms.some((f) => key(f) === k) ? "accent" : "wrong";
}

/** Written answers are asked only for short entries; long phrases stay multiple choice. */
export const MAX_WRITTEN_WORDS = 4;

export function writable(expected: string, lang = ""): boolean {
  // German printed with its forms: the word alone is what is typed.
  const heads = lang === "de" ? germanHeads(expected) : [];
  // "lord; ruler": each meaning on its own, not the two run together.
  const sides = expected.split(/;(?![^(]*\))/).map((side) => side.trim()).filter(Boolean);
  const forms = heads.length ? heads.flatMap(acceptedForms) : sides.length > 1 ? sides.flatMap(acceptedForms) : acceptedForms(expected);
  const single = forms.filter((f) => !f.includes("/"));
  const longest = Math.max(...single.map((f) => f.split(" ").length));
  return longest <= MAX_WRITTEN_WORDS;
}
