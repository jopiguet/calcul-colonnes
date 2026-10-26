/** What the exercise routes send (server/exercises.ts) and the app shows (src/exercises.ts). */
import type { Gap } from "./format.ts";
import type { ItemResult } from "./grade.ts";

export interface ExerciseBookInfo {
  id: string;
  title: string;
  source: string;
  level: string;
  kind: string;
  visibility: "private" | "shared";
  units: number;
  exercises: number;
  /** For the player asked about: exercises corrected, and their items right out of marked. */
  checked: number;
  score: number;
  total: number;
}

export interface ExerciseUnitInfo {
  n: number;
  title: string;
  exercises: number;
  checked: number;
  score: number;
  total: number;
}

export interface ExerciseBookView {
  book: ExerciseBookInfo;
  units: ExerciseUnitInfo[];
}

export interface ExerciseView {
  id: string;
  instruction: string;
  /** The image's address, with the book's revision so a browser may keep it. */
  image: string;
  width: number;
  height: number;
  open: boolean;
  items: { n: string; gaps: Gap[] }[];
  /** What the player typed, by item. */
  answers: Record<string, string[]>;
  /** Once corrected: each item's result and the key; the key's note and text for the whole exercise. */
  result: {
    items: { n: string; result: ItemResult; expected: string; overridden: boolean }[];
    score: number;
    total: number;
    note: string;
    keyText: string;
    at: number;
  } | null;
}

export interface ExerciseUnitView {
  book: { id: string; title: string; source: string };
  unit: { n: number; title: string };
  previous: number | null;
  next: number | null;
  exercises: ExerciseView[];
}
