/**
 * Spaced repetition with Leitner boxes.
 *
 * Every entry is learnt in two directions, each with its own box:
 *
 *   recognise   Spanish shown, find the meaning     ("la llave" → "key")
 *   recall      meaning shown, give the Spanish     ("key" → "la llave")
 *
 * A right answer moves the card up one box, and the next review waits longer:
 * 10 minutes, then 1, 3, 7, 16 and 35 days. A wrong answer sends it back to
 * box 1; the browser asks it again at the end of the session.
 *
 * A card answered before its review is due (a review ahead of time, or the
 * repeat of a mistake in the same session) does not move up: being right a few
 * minutes after seeing the answer says little about memory. A wrong answer
 * still sends it back to box 1. Recall starts once
 * recognition has reached box 2, since producing a word is harder than
 * recognising it.
 *
 * How a card is asked depends on its box: multiple choice while the word is
 * new (boxes 1–2), written once it is known (box 3 and up), when the answer is
 * short enough to type (see `writable`).
 */

export type Direction = "recognise" | "recall";
export type AskMode = "choice" | "written";
/** Player's choice: the app decides by box, or always one kind. */
export type ModePreference = "mixed" | "choice" | "written";

export const MINUTE = 60 * 1000;
export const DAY = 24 * 60 * MINUTE;

/** Wait after reaching each box, by box number (index 0 unused). */
export const INTERVALS = [0, 10 * MINUTE, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
export const TOP_BOX = INTERVALS.length - 1;
/** From this box a card is known; at TOP_BOX it is mastered. */
export const KNOWN_BOX = 4;
/** Recall is offered once recognition has reached this box. */
export const RECALL_AFTER = 2;
/** Written answers from this box on, in mixed mode. */
export const WRITTEN_FROM = 3;
/** New entries introduced per session, at most. */
export const NEW_PER_SESSION = 8;

export interface CardState {
  box: number;
  dueAt: number;
  /** Last answer, for ordering reviews; absent when unknown. */
  lastAt?: number;
}

export function nextState(previous: CardState | null, correct: boolean, now: number): CardState {
  // Right, but before the review was due: the card stays where it is.
  if (previous && correct && previous.dueAt > now) return { box: previous.box, dueAt: previous.dueAt };
  const box = correct ? Math.min((previous?.box ?? 0) + 1, TOP_BOX) : 1;
  return { box, dueAt: now + (INTERVALS[box] ?? 0) };
}

export function askMode(box: number, preference: ModePreference, canWrite: boolean): AskMode {
  if (!canWrite) return "choice";
  if (preference !== "mixed") return preference;
  return box >= WRITTEN_FROM ? "written" : "choice";
}

/** An entry's status for progress displays, from its two boxes (0 = never asked). */
export type EntryStatus = "new" | "learning" | "known" | "mastered";

export function entryStatus(recognise: number, recall: number): EntryStatus {
  if (recognise === 0 && recall === 0) return "new";
  const both = Math.min(recognise, recall);
  if (both >= TOP_BOX) return "mastered";
  if (both >= KNOWN_BOX) return "known";
  return "learning";
}
