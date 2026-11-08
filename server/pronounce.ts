/**
 * How a word of a course is spoken (docs/sounds.md): the input given to
 * eSpeak NG by server/sounds-build.ts, at build time only.
 *
 * Malayalam is spoken from its own script with eSpeak's Malayalam voice.
 * Egyptian, Akkadian and Sumerian have no living speaker and no voice: their
 * transliterations are turned into eSpeak phonemes by the rules below, read
 * with the Italian voice for its plain vowels.
 *   Egyptian: the Egyptological convention taught in schools (an e between two
 *     consonants, ꜣ and ꜥ as a, j as i: nfr "nefer", ꜥnḫ "ankh"). It is a way
 *     of saying the words aloud, not the language as it sounded.
 *   Akkadian: the usual reconstruction (š "sh", ḫ "kh", long vowels long,
 *     the stress on the last long or closed syllable before the end).
 *   Sumerian: the conventional values of the signs (ĝ "ng", ḫ "kh"), the
 *     sign numbers dropped.
 * A transliteration with a character these rules do not know is not spoken.
 */

export interface Speech {
  /** eSpeak voice. */
  voice: string;
  /** Text, or phonemes in eSpeak's [[…]] notation. */
  input: string;
  /** The word as read aloud, in plain letters ("nefer"), when it differs from the key. */
  reading?: string;
}

const ANCIENT_VOICE = "it";

// -------------------------------------------------------------- Malayalam

const ML_RUN = /^[ഀ-ൿ‌‍ ,.?!]+$/u;
// A vowel sign or the virama alone: no word to say.
const ML_SIGN_ALONE = /^[ംഃാ-്ൗ]/u;
// A chillu alone is said after a, as it sounds at the end of a word.
const CHILLUS = new Set(["ൺ", "ൻ", "ർ", "ൽ", "ൾ", "ൿ"]);

export function malayalamSpeech(key: string): Speech | null {
  if (!ML_RUN.test(key) || !/[ഀ-ൿ]/u.test(key) || ML_SIGN_ALONE.test(key)) return null;
  return { voice: "ml", input: CHILLUS.has(key) ? `അ${key}` : key };
}

// -------------------------------------------------------------- shared

type Seg = { ph: string; vowel: boolean; long?: boolean; circumflex?: boolean };

const phonemes = (words: Seg[][], stress: (w: Seg[]) => number): string =>
  `[[${words
    .map((w) => {
      const at = stress(w);
      let vowelIndex = -1;
      return w
        .map((s) => {
          if (!s.vowel) return s.ph;
          vowelIndex++;
          return (vowelIndex === at ? "'" : "") + s.ph + (s.long ? ":" : "");
        })
        .join("");
    })
    .join(" ")}]]`;

// -------------------------------------------------------------- Egyptian

const EGY = /^[ꜣjyꜥwbpfmnrhḥḫẖzsšḳqkgtṯdḏia.=\- ,]+$/u;
const EGY_CONSONANT: Record<string, [string, string]> = {
  b: ["b", "b"], p: ["p", "p"], f: ["f", "f"], m: ["m", "m"], n: ["n", "n"], r: ["r", "r"],
  h: ["h", "h"], ḥ: ["h", "h"], ḫ: ["x", "kh"], ẖ: ["x", "kh"], z: ["s", "s"], s: ["s", "s"],
  š: ["S", "sh"], ḳ: ["k", "k"], q: ["k", "k"], k: ["k", "k"], g: ["g", "g"], t: ["t", "t"],
  ṯ: ["tS", "tj"], d: ["d", "d"], ḏ: ["dZ", "dj"],
};
/** Words the convention says otherwise than the rule. */
const EGY_WORDS: Record<string, string> = { ꜥnḫ: "ankh", ankh: "ankh", ptḥ: "ptah", jmn: "imen" };
const EGY_LETTER: Record<string, string> = {};
for (const [k, [, l]] of Object.entries(EGY_CONSONANT)) EGY_LETTER[k] = l;

/** An Egyptian word in the school reading: "nfr" → "nefer". */
export function egyptianReading(word: string): string {
  const w = word.toLowerCase().replace(/[.=]/g, "");
  if (EGY_WORDS[w]) return EGY_WORDS[w]!;
  const out: string[] = [];
  const chars = [...w];
  // Vowel-like letters, then e between consonants left side by side.
  const isStrong = (c: string | undefined) => c !== undefined && c in EGY_CONSONANT;
  chars.forEach((c, i) => {
    const prev = chars[i - 1];
    const next = chars[i + 1];
    let piece: string;
    if (c === "ꜣ" || c === "ꜥ" || c === "a") piece = "a";
    else if (c === "j" || c === "i") piece = "i";
    else if (c === "y") piece = isStrong(prev) || prev === undefined ? "i" : "y";
    else if (c === "w") {
      // w is a consonant beside a vowel-like letter, u between consonants and at the ends.
      const vowelNear = (x: string | undefined) => x !== undefined && !isStrong(x) && x !== "w";
      piece = vowelNear(next) || (vowelNear(prev) && next !== undefined) ? "w" : "u";
    } else piece = EGY_LETTER[c] ?? "";
    if (isStrong(c) && isStrong(prev)) out.push("e");
    out.push(piece);
  });
  let s = out.join("");
  // A letter alone ("b", in the table of signs) is said with e after it; a suffix alone (".f") with e before.
  if (chars.length === 1 && isStrong(chars[0])) s = /^[.=]/.test(word) ? `e${s}` : `${s}e`;
  return s;
}

/** A reading in plain letters → eSpeak phonemes. */
function readingSegs(r: string): Seg[] {
  const segs: Seg[] = [];
  const re = /kh|sh|tj|dj|[aeiou]|[a-z]/g;
  for (const m of r.match(re) ?? []) {
    if ("aeiou".includes(m)) segs.push({ ph: m === "e" ? "E" : m, vowel: true });
    else segs.push({ ph: { kh: "x", sh: "S", tj: "tS", dj: "dZ", y: "j" }[m] ?? m, vowel: false });
  }
  return segs;
}

export function egyptianSpeech(key: string): Speech | null {
  if (!EGY.test(key) || !/[^ ,.\-=]/u.test(key)) return null;
  // "z, s": two letters; "ḥm-nṯr": two words.
  const words = key.split(/[\s,\-]+/).filter(Boolean);
  if (words.length === 0 || words.length > 8) return null;
  const read = words.map(egyptianReading);
  if (read.some((r) => r === "")) return null;
  const segs = read.map(readingSegs);
  return { voice: ANCIENT_VOICE, input: phonemes(segs, () => 0), reading: read.join(" ") };
}

// -------------------------------------------------------------- Akkadian and Sumerian

const AKK = /^[abdeghiklmnpqrstuwyzâèêîûāēīūšʾḥḫṣṭ\- ()]+$/u;
const SUX = /^[abdeghiklmnprstuzĝšḫṭřáàéèíìúù₀-₉x\- ()]+$/u;

const VOWELS: Record<string, [string, boolean]> = {
  a: ["a", false], e: ["e", false], i: ["i", false], u: ["u", false],
  ā: ["a", true], ē: ["e", true], ī: ["i", true], ū: ["u", true],
  â: ["a", true], ê: ["e", true], î: ["i", true], û: ["u", true],
  á: ["a", false], à: ["a", false], é: ["e", false], è: ["e", false], í: ["i", false], ì: ["i", false], ú: ["u", false], ù: ["u", false],
};
const CONS: Record<string, [string, string]> = {
  b: ["b", "b"], d: ["d", "d"], g: ["g", "g"], h: ["x", "kh"], k: ["k", "k"], l: ["l", "l"], m: ["m", "m"], n: ["n", "n"],
  p: ["p", "p"], q: ["q", "q"], r: ["r", "r"], s: ["s", "s"], t: ["t", "t"], w: ["w", "w"], y: ["j", "y"], z: ["z", "z"],
  š: ["S", "sh"], ʾ: ["?", "'"], ḥ: ["x", "kh"], ḫ: ["x", "kh"], ṣ: ["s", "s"], ṭ: ["t", "t"], ĝ: ["N", "ng"], ř: ["r", "r"],
};

function semiticSegs(word: string): Seg[] | null {
  const segs: Seg[] = [];
  for (const c of word) {
    if (VOWELS[c]) segs.push({ ph: VOWELS[c]![0], vowel: true, long: VOWELS[c]![1], circumflex: "âêîû".includes(c) });
    else if (CONS[c]) segs.push({ ph: CONS[c]![0], vowel: false });
    else return null;
  }
  return segs;
}

const plainLetters = (word: string): string =>
  [...word].map((c) => (VOWELS[c] ? c : CONS[c]?.[1] ?? c)).join("");

/** The stressed vowel of an Akkadian word: the last long or closed syllable before the final one; a contracted final vowel; else the first. */
function akkadianStress(w: Seg[]): number {
  const vowels: { heavy: boolean; circumflex: boolean }[] = [];
  w.forEach((s, i) => {
    if (!s.vowel) return;
    const closed = w[i + 1] !== undefined && !w[i + 1]!.vowel && (w[i + 2] === undefined || !w[i + 2]!.vowel);
    vowels.push({ heavy: Boolean(s.long) || closed, circumflex: Boolean(s.circumflex) });
  });
  if (vowels.length <= 1) return 0;
  if (vowels[vowels.length - 1]!.circumflex) return vowels.length - 1;
  for (let v = vowels.length - 2; v >= 0; v--) if (vowels[v]!.heavy) return v;
  return 0;
}

function cuneiformSpeech(key: string, language: "akk" | "sux"): Speech | null {
  const allowed = language === "akk" ? AKK : SUX;
  if (!allowed.test(key)) return null;
  const clean = key.replace(/[()]/g, "").replace(/[₀-₉]/g, "").replace(/x$/u, "");
  // Akkadian: a hyphenated spelling is read sign by sign (ša-ar-ru-um); Sumerian joins the signs of a word (e₂-gal).
  const parts = language === "akk" ? clean.split(/[\s-]+/) : clean.replace(/-/g, "").split(/\s+/);
  const words = parts.filter(Boolean);
  if (words.length === 0 || words.length > 10) return null;
  // A consonant alone ("d", "ṭ", the ending "-m") is said with a short vowel after it.
  const segs: Seg[][] = [];
  for (const w of words) {
    const s = semiticSegs(w);
    if (!s || s.length === 0) return null;
    if (!s.some((x) => x.vowel)) s.push({ ph: "@", vowel: true });
    segs.push(s);
  }
  const read = words.map(plainLetters).join(" ");
  return {
    voice: ANCIENT_VOICE,
    input: phonemes(segs, language === "akk" ? akkadianStress : () => 0),
    ...(read !== key ? { reading: read } : {}),
  };
}

export const akkadianSpeech = (key: string): Speech | null => cuneiformSpeech(key, "akk");
export const sumerianSpeech = (key: string): Speech | null => cuneiformSpeech(key, "sux");

/** The speech for a course language, or null when the language has none. */
export function speakerFor(language: string): ((key: string) => Speech | null) | null {
  switch (language) {
    case "ml": return malayalamSpeech;
    case "egy": return egyptianSpeech;
    case "akk": return akkadianSpeech;
    case "sux": return sumerianSpeech;
    default: return null;
  }
}
