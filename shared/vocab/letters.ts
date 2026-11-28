/**
 * The Latin letters a book's typed answers use that a usual keyboard lacks: ł in Inuktitut,
 * š ž in Bulgarian or Georgian transliteration, ḥ ꜥ in Egyptian, ā ṣ ʿ in Arabic or Aramaic.
 * The written card shows them as buttons under the field (src/vocab.ts). Taken from the whole
 * book, never from one word, so they give no hint of the answer.
 */

/**
 * On a French, Swiss, Spanish or German keyboard, directly or with a dead key (^ ¨ ` ´ ~):
 * not offered. Plain ASCII is assumed.
 */
const ON_KEYBOARDS = new Set([..."àâäáãçéèêëíìîïñóòôöõúùûüÿœæß"]);

/** A letter of a transliteration: Latin script, or a modifier letter (ʾ ʿ ʼ). */
const LETTER = /[\p{Script=Latin}\p{Lm}]/u;

/** At most this many: a longer row would be more hunting than typing. */
export const MAX_LETTERS = 24;

/** The letters, lower case, most frequent first, then in alphabetical order of their base letter. */
export function missingLetters(answers: Iterable<string>): string[] {
  const counts = new Map<string, number>();
  for (const answer of answers) {
    for (const ch of answer.normalize("NFC").toLowerCase()) {
      if (ch.charCodeAt(0) < 128 || ON_KEYBOARDS.has(ch) || !LETTER.test(ch)) continue;
      counts.set(ch, (counts.get(ch) ?? 0) + 1);
    }
  }
  const base = (ch: string): string => ch.normalize("NFD").replace(/\p{M}/gu, "");
  return [...counts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_LETTERS)
    .map(([ch]) => ch)
    .sort((a, b) => base(a).localeCompare(base(b), "en") || a.localeCompare(b, "en"));
}
