/**
 * What a generated economics question is about, as data: the generator
 * (`econ-output.ts`) computes the answer from it, and `check:quiz` computes
 * it again with its own evaluator (`server/check-econ.ts`). Each option's
 * formula (`tex`) is the answer in a canonical form: a number written with a
 * point and fixed decimals ("12.50"), a pair "L,w" ("4.00,9.00"), letters
 * joined by "+" ("C+E"), an allocation's letter ("B"), a Gini "G = 0.312".
 *
 * Linear curves are written P = a − bQ (demand, marginal benefit) and
 * P = c + dQ (supply, marginal cost).
 */

export type EconModel =
  /** A per-unit tax t on a market: the buyers' share in percent (one decimal) or the deadweight loss (two decimals). */
  | { type: "incidence"; a: number; b: number; c: number; d: number; t: number; on: "sellers" | "buyers"; ask: "buyerShare" | "dwl" }
  /** The same market, its areas lettered: which letters make the asked quantity (letters sorted, joined by "+"). */
  | { type: "areas"; a: number; b: number; c: number; d: number; t: number; ask: "dwl" | "revenue" | "consumerLoss" | "producerLoss"; polygons: { label: string; points: [number, number][] }[] }
  /** Marginal benefit a − bQ, marginal private cost c + dQ, marginal external cost eQ: the Pigouvian tax or the efficient quantity (two decimals). */
  | { type: "pigou"; a: number; b: number; c: number; d: number; e: number; ask: "tax" | "quantity" }
  /** A public good: each person's marginal benefit a − bG (zero beyond), marginal cost mc: the efficient quantity (two decimals). */
  | { type: "samuelson"; people: { a: number; b: number }[]; mc: number }
  /** Quintile income shares (poorest first, summing to 1): the Gini coefficient (three decimals). */
  | { type: "gini"; shares: number[] }
  /** Several distributions by quintile: the one whose Lorenz curve lies above the others, named by its Gini ("G = 0.215"). */
  | { type: "lorenz"; sets: number[][] }
  /** Wage w, income tax t on earnings, a benefit B withdrawn at rate τ of gross earnings (t and τ as fractions): the effective marginal rate (percent, one decimal) or the hours where the benefit ends (two decimals). */
  | { type: "benefit"; w: number; t: number; B: number; tau: number; ask: "emtr" | "breakEven" }
  /** Two goods with independent demands of elasticities e1, e2, good 1 taxed at t1 %: the Ramsey rate on good 2 (percent, one decimal). */
  | { type: "ramsey"; e1: number; e2: number; t1: number }
  /** Pareto parameter a, elasticity of taxable income e: the revenue-maximising top rate in percent (one decimal). */
  | { type: "saez"; a: number; e: number }
  /** Labour supply w = c + dL to a monopsonist with marginal revenue product m − kL: its choice "L,w", or employment under a minimum wage (two decimals). */
  | { type: "monopsony"; c: number; d: number; m: number; k: number; ask: "choice" | "minWage"; minWage?: number }
  /** A bracket schedule (each bracket's lower bound and rate in percent): tax owed (no decimals) or average rate (percent, one decimal). */
  | { type: "schedule"; brackets: { from: number; rate: number }[]; income: number; ask: "tax" | "average" }
  /** Voters' ideal points with single-peaked preferences: the majority-rule outcome (two decimals). */
  | { type: "median"; ideals: number[] }
  /** Utility allocations (u1, u2) lettered A, B…: the one a criterion chooses. */
  | { type: "swf"; allocations: [number, number][]; criterion: "utilitarian" | "rawls" | "nash" }
  /** Wealth W, a loss L with probability p, logarithmic utility: the most one would pay for full insurance (one decimal). */
  | { type: "insurance"; W: number; L: number; p: number };
