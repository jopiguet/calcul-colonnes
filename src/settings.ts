import { CHEMISTRY_TOPICS, MATH_LEVELS, QUIZ_COUNTS, TOPICS, type AnswerMode, type Level, type Topic } from "../shared/quiz";
import type { Operator } from "../shared/types";
import { isLang, type Lang } from "./i18n";

/**
 * Settings of this browser, kept in localStorage. Players and scores are not
 * here: they are in the server's database.
 */
export interface Settings {
  lang: Lang;
  /** Maximum of the big number: top number, or dividend. */
  maximum: number;
  /** Maximum of the multiplier and of the divisor. */
  smallLimit: number;
  operators: Operator[];
  /** Which part of the app is shown: the home page or an activity. */
  mode: Mode;
  /** Vocabulary book open in the "vocab" activity (its id on the server). */
  vocabBook: number | null;
  /** Lab open in the "discover" activity. */
  discoverActivity: "dice" | "coins" | "puzzles";
  /** The mathematics test's level ("school" or "university"). */
  quizLevel: Level;
  quizTopics: Topic[];
  /** Which test the "quiz" activity shows: mathematics, or physical chemistry. */
  quizSubject: "maths" | "chemistry";
  /** Topics chosen for the physical chemistry test. */
  chemTopics: Topic[];
  quizCount: number;
  /** Mix the player's recent mistakes into new tests. */
  quizReview: boolean;
  /** Pick from four options, or type the number where the answer is one. */
  quizMode: AnswerMode;
}

export type Mode = "home" | "columns" | "quiz" | "vocab" | "discover";

export const OPERATORS: Operator[] = ["+", "−", "×", "÷"];

// By 10 up to 100, then by 100 up to 1000. It starts at 20 because the top number is at least 10.
export const LEVELS: number[] = [
  ...Array.from({ length: 9 }, (_, i) => 20 + i * 10),
  ...Array.from({ length: 9 }, (_, i) => 200 + i * 100),
];
export const SMALL_LEVELS: number[] = Array.from({ length: 11 }, (_, i) => 2 + i); // 2…12

const SETTINGS_KEY = "calcul-colonnes.settings";
const LEGACY_MAXIMUM_KEY = "calcul-colonnes.maximum";
const USER_KEY = "calcul-colonnes.user";

function nearest(levels: number[], value: unknown, fallback: number): number {
  const wanted = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return levels.reduce((best, level) =>
    Math.abs(level - wanted) < Math.abs(best - wanted) ? level : best,
  );
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // storage unavailable (private mode…): defaults are used
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // the setting just won't be remembered
  }
}

/** First visit: the browser's language if the app has it, French otherwise. */
function browserLanguage(): Lang {
  const code = navigator.language.slice(0, 2);
  return isLang(code) ? code : "fr";
}

export function loadSettings(): Settings {
  let saved: Partial<Record<keyof Settings, unknown>> = {};
  try {
    const parsed: unknown = JSON.parse(read(SETTINGS_KEY) ?? "{}");
    if (typeof parsed === "object" && parsed !== null) saved = parsed;
  } catch {
    // unreadable value: defaults are used
  }
  const legacyMaximum = Number(read(LEGACY_MAXIMUM_KEY) ?? NaN);
  const operators = Array.isArray(saved.operators)
    ? OPERATORS.filter((operator) => (saved.operators as unknown[]).includes(operator))
    : [];
  const quizTopics = Array.isArray(saved.quizTopics)
    ? TOPICS.filter((topic) => (saved.quizTopics as unknown[]).includes(topic))
    : [];
  const chemTopics = Array.isArray(saved.chemTopics)
    ? CHEMISTRY_TOPICS.filter((topic) => (saved.chemTopics as unknown[]).includes(topic))
    : [];
  return {
    mode: saved.mode === "columns" || saved.mode === "quiz" || saved.mode === "vocab" || saved.mode === "discover" ? saved.mode : "home",
    vocabBook: typeof saved.vocabBook === "number" && saved.vocabBook > 0 ? saved.vocabBook : null,
    discoverActivity: saved.discoverActivity === "coins" || saved.discoverActivity === "puzzles" ? saved.discoverActivity : "dice",
    quizLevel: MATH_LEVELS.includes(saved.quizLevel as Level) ? (saved.quizLevel as Level) : "school",
    quizTopics: quizTopics.length > 0 ? quizTopics : [...TOPICS],
    quizSubject: saved.quizSubject === "chemistry" ? "chemistry" : "maths",
    chemTopics: chemTopics.length > 0 ? chemTopics : [...CHEMISTRY_TOPICS],
    quizCount: nearest(QUIZ_COUNTS, saved.quizCount, 10),
    quizReview: saved.quizReview !== false,
    quizMode: saved.quizMode === "typed" ? "typed" : "choices",
    lang: isLang(saved.lang) ? saved.lang : browserLanguage(),
    maximum: nearest(LEVELS, saved.maximum ?? legacyMaximum, 100),
    smallLimit: nearest(SMALL_LEVELS, saved.smallLimit, 9),
    operators: operators.length > 0 ? operators : ["+", "−"],
  };
}

export function saveSettings(settings: Settings): void {
  write(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadUserId(): number | null {
  const saved = read(USER_KEY);
  return saved === null ? null : Number(saved);
}

export function saveUserId(id: number | null): void {
  write(USER_KEY, id === null ? null : String(id));
}
