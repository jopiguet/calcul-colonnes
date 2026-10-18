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
