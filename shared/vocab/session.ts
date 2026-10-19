/**
 * Builds a practice session: which cards, in which order, asked how.
 *
 * 1. Cards due for review (their wait is over), oldest first.
 * 2. Recall cards that just became available (recognition reached box 2).
 * 3. New entries, in the book's order, at most NEW_PER_SESSION.
 *
 * A wrong answer is asked again at the end of the session (by the browser).
 */
import { acceptedForms, display, normalise, writable } from "./grade";
import { NEW_PER_SESSION, RECALL_AFTER, askMode, type CardState, type Direction, type ModePreference } from "./schedule";
import type { VocabCard } from "../types";

export interface SessionEntry {
  id: number;
  sectionId: number;
  position: number;
  en: string;
  es: string;
  group: string;
  feminine: boolean;
}

export type ProgressMap = Map<string, CardState>;
export const progressKey = (entryId: number, direction: Direction): string => `${entryId}:${direction}`;

/** The side shown and the side to answer. */
export function sides(entry: SessionEntry, direction: Direction): { prompt: string; answer: string } {
  return direction === "recognise" ? { prompt: entry.es, answer: entry.en } : { prompt: entry.en, answer: entry.es };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Three wrong options: entries of the same group first, then of the same
 * section, then of the pool (the lesson). Never an option that reads like the
 * answer or like another option.
 */
export function distractors(entry: SessionEntry, direction: Direction, pool: SessionEntry[], random: () => number): string[] {
  const answer = sides(entry, direction).answer;
  const taken = new Set(acceptedForms(answer));
  taken.add(normalise(answer));
  const words = answer.split(" ").length;
  const tiers = [
    pool.filter((e) => e.sectionId === entry.sectionId && e.group === entry.group),
    pool.filter((e) => e.sectionId === entry.sectionId),
    pool,
  ];
  const chosen: string[] = [];
  for (const tier of tiers) {
    // Similar length first, so the answer does not stand out by its size.
    const candidates = shuffle(tier, random).sort(
      (a, b) =>
        Math.abs(sides(a, direction).answer.split(" ").length - words) -
        Math.abs(sides(b, direction).answer.split(" ").length - words),
    );
    for (const other of candidates) {
      if (chosen.length === 3) return chosen;
      if (other.id === entry.id) continue;
      const text = sides(other, direction).answer;
      const key = normalise(text);
      if (taken.has(key) || acceptedForms(text).some((f) => taken.has(f))) continue;
      taken.add(key);
      chosen.push(display(text));
    }
  }
  return chosen;
}

export interface SessionRequest {
  /** Entries to practise (a section, a lesson, or everything for "due"). */
  entries: SessionEntry[];
  /** Where wrong options are drawn from (the entries' lessons). */
  pool: SessionEntry[];
  progress: ProgressMap;
  now: number;
  size: number;
  preference: ModePreference;
  /** Only cards already started and due: no new entries. */
  dueOnly: boolean;
  random: () => number;
}

export function buildSession(req: SessionRequest): VocabCard[] {
  const { entries, progress, now, size } = req;
  const picked: { entry: SessionEntry; direction: Direction; box: number }[] = [];

  const due: { entry: SessionEntry; direction: Direction; state: CardState }[] = [];
  const recallReady: SessionEntry[] = [];
  const fresh: SessionEntry[] = [];
  for (const entry of entries) {
    const recognise = progress.get(progressKey(entry.id, "recognise"));
    const recall = progress.get(progressKey(entry.id, "recall"));
    if (!recognise && !recall) fresh.push(entry);
    if (recognise && recognise.dueAt <= now) due.push({ entry, direction: "recognise", state: recognise });
    if (recall && recall.dueAt <= now) due.push({ entry, direction: "recall", state: recall });
    if (recognise && !recall && recognise.box >= RECALL_AFTER) recallReady.push(entry);
  }
  due.sort((a, b) => a.state.dueAt - b.state.dueAt);

  for (const d of due) if (picked.length < size) picked.push({ entry: d.entry, direction: d.direction, box: d.state.box });
  if (!req.dueOnly) {
    for (const entry of recallReady) if (picked.length < size) picked.push({ entry, direction: "recall", box: 0 });
    for (const entry of fresh.sort((a, b) => a.sectionId - b.sectionId || a.position - b.position).slice(0, NEW_PER_SESSION)) {
      if (picked.length < size) picked.push({ entry, direction: "recognise", box: 0 });
    }
  }

  // Reviews and new cards mixed, so a session does not end with all the new words.
  return shuffle(picked, req.random).map(({ entry, direction, box }) => {
    const { prompt, answer } = sides(entry, direction);
    const mode = askMode(box, req.preference, writable(answer));
    const card: VocabCard = {
      entryId: entry.id,
      direction,
      mode,
      box,
      prompt: display(prompt),
      ...(entry.group ? { group: entry.group } : {}),
      ...(direction === "recognise" && entry.feminine ? { feminine: true } : {}),
    };
    if (mode === "choice") card.options = shuffle([display(answer), ...distractors(entry, direction, req.pool, req.random)], req.random);
    return card;
  });
}
