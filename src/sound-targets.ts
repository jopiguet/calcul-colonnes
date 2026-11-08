/**
 * Where a lesson can be listened to (docs/sounds.md): the words of a rendered
 * lesson text that may carry a ▶ button. The same function picks them in the
 * browser and in server/sounds-build.ts, which makes the sounds, so the two
 * always agree on the words and on their keys.
 *
 * A word is: an italic (*nfr*, a transliteration), a table cell holding only
 * text (the letter "ꜣ" of the table of signs), or a run of Malayalam script.
 * Exercises are left out: a sound there would give the answer away.
 */

/** The key of a word: its text, composed, without the spaces around it. */
export const soundKey = (text: string): string => text.normalize("NFC").replace(/\s+/g, " ").trim();

/** The elements of a rendered lesson text that may be listened to. */
export function soundTargets(root: Element): Element[] {
  const out: Element[] = [];
  for (const node of root.querySelectorAll("em, td, span.script-malayalam")) {
    if (node.tagName === "TD" && node.children.length > 0) continue;
    if (node.closest(".course-exercise")) continue;
    if (soundKey(node.textContent ?? "") === "") continue;
    out.push(node);
  }
  return out;
}
