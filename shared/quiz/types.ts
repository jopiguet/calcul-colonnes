import type { Rng } from "./rng";
import type { Fn } from "./tex";

export type Level = "school" | "university";
export type Topic = "derivatives" | "integrals" | "trigonometry" | "limits" | "explog";

export const LEVELS: Level[] = ["school", "university"];
export const TOPICS: Topic[] = ["derivatives", "integrals", "trigonometry", "limits", "explog"];

/** Question sentences; translated by the app. */
export type PromptKey =
  | "derivative"
  | "primitive"
  | "integral"
  | "exactValue"
  | "solveInterval"
  | "solve"
  | "identity"
  | "limit"
  | "simplify"
  | "period";

/** Explanation sentences; translated by the app. */
export type ExplanationKey =
  | "powerRule"
  | "chainRule"
  | "productRule"
  | "quotientRule"
  | "powerPrimitive"
  | "linearPrimitive"
  | "logPrimitive"
  | "fundamental"
  | "parts"
  | "substitution"
  | "unitCircle"
  | "trigEquation"
  | "trigFormula"
  | "period"
  | "inverseTrig"
  | "dominantTerms"
  | "sinOverX"
  | "growth"
  | "factor"
  | "expLimit"
  | "derivativeAtZero"
  | "taylor"
  | "expLog"
  | "logRules"
  | "substituteExp";

/** An answer: its LaTeX, and what it stands for (function, number or set of numbers). */
export interface Option {
  tex: string;
  fn?: Fn;
  num?: number;
  set?: number[];
}

/** How the correct answer is defined; used to tell options apart and by the check script. */
export type Verify =
  | { kind: "derivative"; f: Fn } // options are f'
  | { kind: "primitive"; f: Fn } // options are primitives of f (equal up to a constant)
  | { kind: "identity"; f: Fn } // options are functions equal to f
  | { kind: "integral"; f: Fn; a: number; b: number } // options are numbers
  | { kind: "limit"; f: Fn; probe: number } // f(probe) is close to the limit
  | { kind: "value"; value: number }
  | { kind: "root"; f: Fn } // the option x satisfies f(x) = 0
  | { kind: "solutions"; f: Fn; lo: number; hi: number }; // all roots of f in [lo, hi[

export interface Draft {
  prompt: { key: PromptKey; tex: string };
  correct: Option;
  /** Candidate wrong answers (common mistakes); three distinct ones are kept. */
  wrong: Option[];
  explanation: { key: ExplanationKey; tex: string };
  verify: Verify;
}

export type Generator = (rng: Rng) => Draft;

export interface Question {
  topic: Topic;
  /** Kind of question, e.g. "derivatives.product"; answers are tracked per kind. */
  skill: string;
  /** Asked again because the player got this kind wrong recently. */
  review: boolean;
  prompt: Draft["prompt"];
  options: Option[];
  correct: number;
  explanation: Draft["explanation"];
  verify: Verify;
}
