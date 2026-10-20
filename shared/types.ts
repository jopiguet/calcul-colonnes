/** Types shared by the browser app and the API server. */

export type Operator = "+" | "−" | "×" | "÷";

export interface User {
  id: number;
  name: string;
  createdAt: number; // epoch milliseconds
}

/**
 * What the app sends for each answered operation; the server decides if it is correct.
 * For a division, `top` is the dividend, `bottom` the divisor, `given` the quotient
 * and `givenRemainder` the remainder. It is null for the other operations.
 */
export interface NewAttempt {
  userId: number;
  maximum: number;
  operator: Operator;
  top: number;
  bottom: number;
  given: number;
  givenRemainder: number | null;
}

export interface UserStats {
  user: User;
  total: number;
  correct: number;
  todayTotal: number;
  todayCorrect: number;
  /** Multiple-choice tests: number of tests, right answers, questions. */
  quizTests: number;
  quizCorrect: number;
  quizQuestions: number;
}

/** A finished multiple-choice test. The server regenerates it from the seed and grades it. */
export interface NewQuizResult {
  userId: number;
  seed: number;
  level: string;
  topics: string[];
  count: number;
  /** Option index chosen for each question, or -1 when left blank. */
  answers: number[];
  /** Kinds of question brought back for review (see generateQuiz). */
  focus?: string[];
  /** Generator version used by the browser; must be the server's. */
  version?: number;
}

export interface SkillProgress {
  /** Kind of question, e.g. "derivatives.product". */
  skill: string;
  topic: string;
  total: number;
  correct: number;
  /** Latest answers, newest first (at most five). */
  recent: boolean[];
  lastAt: number;
  status: "review" | "learning" | "mastered";
}

export interface MistakeProgress {
  /** Mistake type, e.g. "chainRuleForgotten" (MISTAKES in shared/quiz/types.ts). */
  mistake: string;
  count: number;
  lastAt: number;
  /** Kinds of question where it was made, most recent first. */
  skills: string[];
}

export interface OperatorProgress {
  operator: Operator;
  total: number;
  correct: number;
  todayTotal: number;
  todayCorrect: number;
}

export interface Profile {
  user: User;
  skills: SkillProgress[];
  /** Mistakes made in tests, most frequent first. */
  mistakes: MistakeProgress[];
  operators: OperatorProgress[];
}

// ------------------------------------------------------------- authentication

/** Who is signed in. A player session (own login of a child) is limited to that player. */
export interface AuthState {
  authenticated: boolean;
  account?: { id: number; name: string; email: string | null };
  player?: { id: number; name: string } | null;
}

/** How one can sign in on this server. */
export interface AuthOptions {
  providers: { id: string; name: string }[];
  /** New accounts may be created (always true while there is no account yet). */
  registration: boolean;
  /** PUBLIC_URL: the address the app expects to be opened at. */
  publicUrl: string;
}

/** A way to sign in, attached to the account or to one of its players. */
export interface SignInMethod {
  id: number;
  type: "password" | "oauth" | "passkey" | "email_link";
  /** Provider id for "oauth" ("google", "github"…); empty otherwise. */
  provider: string;
  /** Email or username for a password, name or email at the provider. */
  label: string | null;
  /** Set for a player's own login. */
  playerId: number | null;
  createdAt: number;
  lastUsedAt: number | null;
}

// ---------------------------------------------------------------- vocabulary

/** One card of a vocabulary session (see shared/vocab/session.ts). */
export interface VocabCard {
  entryId: number;
  /** recognise: Spanish shown, meaning asked; recall: meaning shown, Spanish asked. */
  direction: "recognise" | "recall";
  mode: "choice" | "written";
  /** Leitner box before this answer; 0 for a card never asked. */
  box: number;
  prompt: string;
  /** Languages of the prompt and of the answer ("es", "en"). */
  promptLang: string;
  answerLang: string;
  /** Heading inside the section ("Interior"), as a hint. */
  group?: string;
  /** Feminine noun taking "el" ("el agua"), shown with the prompt. */
  feminine?: boolean;
  /** Multiple choice only: four options, one right. */
  options?: string[];
  /** How the prompt reads (Japanese: its rōmaji), shown under it. */
  promptReading?: string;
  /** Multiple choice: how each option reads, in the order of `options` ("" when none). */
  optionReadings?: string[];
}

export interface VocabSectionInfo {
  id: number;
  /** Title in the language studied; subtitle in the other, when the book has one. */
  title: string;
  subtitle: string;
  entries: number;
}

export interface VocabLessonInfo {
  id: number;
  title: string;
  subtitle: string;
  sections: VocabSectionInfo[];
}

/** A vocabulary book and its lessons. */
export interface VocabBookInfo {
  id: number;
  slug: string;
  title: string;
  kind: "translation" | "definition";
  /** Language studied, and language of the meanings ("es", "en"). */
  term: string;
  meaning: string;
  /** "alphabetical": a word list; new words come at random by default. */
  order: "book" | "alphabetical";
  entries: number;
  lessons: VocabLessonInfo[];
}

/** Counts of entries by status, for one section. */
export interface VocabSectionProgress {
  new: number;
  learning: number;
  known: number;
  mastered: number;
  /** Cards whose review is due now. */
  due: number;
}

export interface VocabProgress {
  sections: Record<number, VocabSectionProgress>;
  /** Per book: cards due, entries started. */
  books: Record<number, { due: number; started: number }>;
  due: number;
  /** Answers since the `since` given. */
  today: { answers: number; right: number };
}

export interface VocabAnswer {
  userId: number;
  entryId: number;
  direction: "recognise" | "recall";
  mode: "choice" | "written";
  given: string;
}

export interface VocabAnswerResult {
  verdict: "right" | "accent" | "typo" | "article" | "wrong";
  correct: boolean;
  /** The answer as printed in the book. */
  expected: string;
  feminine: boolean;
  /** How the term reads (Japanese: its rōmaji), "" when the book gives none. */
  reading: string;
  /** Example or remark from the book, if any. */
  note: string;
  box: number;
  dueAt: number;
}

/** A share of answers: how many, how many right. */
export interface VocabTally {
  answers: number;
  right: number;
}

/** A player's statistics on one book (GET /api/vocab/stats). Days are the player's local days. */
export interface VocabStats {
  /** Entries of the book, by status (both directions considered, see entryStatus). */
  words: { total: number; new: number; learning: number; known: number; mastered: number };
  /** Cards per Leitner box, per direction: index 1–6; index 0 is unused. */
  boxes: { recognise: number[]; recall: number[] };
  /** Every answer on this book. */
  all: VocabTally;
  /** The last 30 days, oldest first: answers, right ones, and entries seen for the first time. */
  days: { day: string; answers: number; right: number; newWords: number }[];
  /** Days in a row with at least one answer, up to today (or yesterday, if nothing yet today); and the longest. */
  streak: { current: number; best: number };
  /** Cards due: index 0 is today, overdue included; then the next 13 days. */
  forecast: number[];
  /** Over every answer: by question kind and direction; written answers by verdict. */
  byMode: { choice: VocabTally; written: VocabTally };
  byDirection: { recognise: VocabTally; recall: VocabTally };
  verdicts: { right: number; accent: number; typo: number; article: number; wrong: number };
  lessons: { id: number; title: string; total: number; new: number; learning: number; known: number; mastered: number }[];
  /** The entries most often answered wrong, at most 12. */
  hardest: { entryId: number; term: string; meaning: string; reading: string; wrong: number; answers: number; box: number }[];
}
