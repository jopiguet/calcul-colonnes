/**
 * A player's statistics on one vocabulary book, from their progress and their
 * answers. Pure: the server loads the rows, this file counts them, so
 * `npm run check:vocab` can test it without a database.
 */
import type { VocabStats, VocabTally } from "../types";
import { DAY, TOP_BOX, entryStatus, type CardState, type Direction } from "./schedule";

export interface StatsEntry {
  id: number;
  lessonId: number;
  term: string;
  meaning: string;
  reading: string;
}

export interface StatsAnswer {
  entryId: number;
  direction: Direction;
  mode: "choice" | "written";
  at: number;
  verdict: string;
  correct: boolean;
}

export interface StatsInput {
  entries: StatsEntry[];
  lessons: { id: number; title: string }[];
  /** The player's cards on this book, by entry. */
  progress: Map<number, Partial<Record<Direction, CardState & { wrong: number }>>>;
  answers: StatsAnswer[];
  now: number;
  /** The player's offset from UTC, in minutes (+120 in Madrid in summer). */
  offsetMinutes: number;
}

export const HISTORY_DAYS = 30;
export const FORECAST_DAYS = 14;
export const HARDEST = 12;

const tally = (): VocabTally => ({ answers: 0, right: 0 });
const add = (t: VocabTally, correct: boolean): void => {
  t.answers++;
  if (correct) t.right++;
};

export function computeStats(input: StatsInput): VocabStats {
  const { entries, progress, answers, now } = input;
  const offset = input.offsetMinutes * 60_000;
  /** Local day number: days since 1970-01-01 in the player's time zone. */
  const dayOf = (at: number): number => Math.floor((at + offset) / DAY);
  const today = dayOf(now);
  const label = (day: number): string => new Date(day * DAY).toISOString().slice(0, 10);

  // Words by status, overall and per lesson; cards per box; what comes due.
  const words = { total: 0, new: 0, learning: 0, known: 0, mastered: 0 };
  const boxes = { recognise: Array<number>(TOP_BOX + 1).fill(0), recall: Array<number>(TOP_BOX + 1).fill(0) };
  const forecast = Array<number>(FORECAST_DAYS).fill(0);
  const perLesson = new Map(input.lessons.map((l) => [l.id, { id: l.id, title: l.title, total: 0, new: 0, learning: 0, known: 0, mastered: 0 }]));
  for (const entry of entries) {
    const cards = progress.get(entry.id) ?? {};
    const status = entryStatus(cards.recognise?.box ?? 0, cards.recall?.box ?? 0);
    words.total++;
    words[status]++;
    const lesson = perLesson.get(entry.lessonId);
    if (lesson) {
      lesson.total++;
      lesson[status]++;
    }
    for (const direction of ["recognise", "recall"] as const) {
      const card = cards[direction];
      if (!card) continue;
      boxes[direction][Math.min(Math.max(card.box, 1), TOP_BOX)]!++;
      const inDays = Math.max(0, dayOf(card.dueAt) - today);
      if (inDays < FORECAST_DAYS) forecast[inDays]!++;
    }
  }

  // Answers: by day, kind, direction and verdict; first sight of each entry.
  const all = tally();
  const byMode = { choice: tally(), written: tally() };
  const byDirection = { recognise: tally(), recall: tally() };
  const verdicts = { right: 0, accent: 0, typo: 0, article: 0, wrong: 0 };
  const perDay = new Map<number, { answers: number; right: number; newWords: number }>();
  const firstSeen = new Map<number, number>();
  const answered = new Map<number, { wrong: number; answers: number }>();
  const activeDays = new Set<number>();
  for (const a of answers) {
    add(all, a.correct);
    add(byMode[a.mode], a.correct);
    add(byDirection[a.direction], a.correct);
    if (a.mode === "written" && a.verdict in verdicts) verdicts[a.verdict as keyof typeof verdicts]++;
    const day = dayOf(a.at);
    activeDays.add(day);
    const d = perDay.get(day) ?? { answers: 0, right: 0, newWords: 0 };
    d.answers++;
    if (a.correct) d.right++;
    perDay.set(day, d);
    const first = firstSeen.get(a.entryId);
    if (first === undefined || a.at < first) firstSeen.set(a.entryId, a.at);
    const e = answered.get(a.entryId) ?? { wrong: 0, answers: 0 };
    e.answers++;
    if (!a.correct) e.wrong++;
    answered.set(a.entryId, e);
  }
  for (const at of firstSeen.values()) {
    const d = perDay.get(dayOf(at));
    if (d) d.newWords++;
  }
  const days = Array.from({ length: HISTORY_DAYS }, (_, i) => {
    const day = today - (HISTORY_DAYS - 1 - i);
    return { day: label(day), ...(perDay.get(day) ?? { answers: 0, right: 0, newWords: 0 }) };
  });

  // Streaks: a day without an answer breaks one; today does not until it is over.
  const sorted = [...activeDays].sort((x, y) => x - y);
  let best = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    run = i > 0 && sorted[i]! === sorted[i - 1]! + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  let current = 0;
  for (let day = activeDays.has(today) ? today : today - 1; activeDays.has(day); day--) current++;

  // Hardest: most wrong answers, then the worst share, then the lowest box.
  const byId = new Map(entries.map((e) => [e.id, e]));
  const lowestBox = (id: number): number => {
    const cards = progress.get(id) ?? {};
    return Math.min(cards.recognise?.box ?? TOP_BOX, cards.recall?.box ?? TOP_BOX);
  };
  const hardest = [...answered.entries()]
    .filter(([id, e]) => e.wrong > 0 && byId.has(id))
    .sort(([a, x], [b, y]) => y.wrong - x.wrong || y.wrong / y.answers - x.wrong / x.answers || lowestBox(a) - lowestBox(b))
    .slice(0, HARDEST)
    .map(([id, e]) => {
      const entry = byId.get(id)!;
      return { entryId: id, term: entry.term, meaning: entry.meaning, reading: entry.reading, wrong: e.wrong, answers: e.answers, box: lowestBox(id) };
    });

  return {
    words,
    boxes,
    all,
    days,
    streak: { current, best },
    forecast,
    byMode,
    byDirection,
    verdicts,
    lessons: [...perLesson.values()],
    hardest,
  };
}
