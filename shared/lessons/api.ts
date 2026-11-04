/** What the language-course routes send (server/lessons.ts) and the app shows (src/lessons.ts). */
import type { EntryInfo } from "../vocab/format";
import type { LessonPart, PublicExercise } from "./format";
import type { BlankResult } from "./grade";

export interface CourseInfo {
  id: string;
  icon: string;
  /** The language taught ("la"). */
  language: string;
  title: string;
  description: string;
  lessons: number;
  exercises: number;
  /** Exercises the player has all right. */
  done: number;
  /** The slug of the course's vocabulary book, if it has one. */
  vocabBook: string | null;
}

export interface CourseLessonInfo {
  n: number;
  slug: string;
  title: string;
  exercises: number;
  /** Exercises checked, all right, and blanks right out of those checked. */
  checked: number;
  done: number;
  score: number;
  total: number;
  /** Words of the lesson in the course's vocabulary book. */
  words: number;
}

export interface CourseView {
  course: CourseInfo;
  lessons: CourseLessonInfo[];
}

/** An exercise as the player left it: answers typed, and once checked, each blank's result and the key. */
export interface ExerciseState {
  given: string[];
  results?: BlankResult[];
  expected?: string[];
  /** Blanks the player marked right himself. */
  overridden?: number[];
  score?: number;
  total?: number;
}

export type PublicLessonPart = Exclude<LessonPart, { kind: "exercise" }> | { kind: "exercise"; exercise: PublicExercise };

export interface LessonView {
  course: { id: string; title: string; language: string; icon: string; vocabBook: string | null };
  lesson: {
    n: number;
    slug: string;
    title: string;
    parts: PublicLessonPart[];
    /** The lesson's words, their meaning in the interface's language. */
    vocab: { term: string; meaning: string; info?: EntryInfo; note?: string }[];
  };
  previous: { slug: string; n: number; title: string } | null;
  next: { slug: string; n: number; title: string } | null;
  exercises: Record<string, ExerciseState>;
}
