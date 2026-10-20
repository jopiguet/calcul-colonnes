/**
 * Two dice: the probability engine of the Probability Lab (src/discover/dice.ts).
 *
 * Pure functions, no DOM: the rolls come from a seeded generator, so an
 * experiment is its seed. The same seed gives the same rolls, whatever the
 * batches they are rolled in (10 then 100, or 110 at once), in tests and
 * between family members.
 *
 * `npm run check:discover` verifies the exact distribution, and checks the
 * generator itself with a chi-square test on a million rolls.
 */
import { createRng, type Rng } from "../quiz/rng";
import { recordPoint } from "./experiment";

export { MAX_SEED, chiSquare, freshSeed } from "./experiment";

export const FACES = 6;
export const OUTCOMES = FACES * FACES; // 36 equally likely pairs
export const SUMS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export type Sum = (typeof SUMS)[number];
/** The sum the lab asks about. */
export const TARGET: Sum = 7;

export interface Roll {
  a: number;
  b: number;
}

/** In how many of the 36 pairs the two dice add up to `sum`: 1 for 2 and 12, 6 for 7. */
export function ways(sum: number): number {
  return sum < 2 || sum > 12 ? 0 : FACES - Math.abs(sum - 7);
}

/** The pairs (die 1, die 2) that make `sum`. */
export function pairsFor(sum: number): Roll[] {
  const out: Roll[] = [];
  for (let a = 1; a <= FACES; a++) for (let b = 1; b <= FACES; b++) if (a + b === sum) out.push({ a, b });
  return out;
}

/** Exact probability of a sum, as a fraction reduced to lowest terms: 7 → 1/6, 2 → 1/36. */
export function probability(sum: number): { numerator: number; denominator: number } {
  const n = ways(sum);
  const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
  const d = n === 0 ? 1 : gcd(n, OUTCOMES);
  return { numerator: n / d, denominator: OUTCOMES / d };
}

/** One roll of two dice. */
export function roll(rng: Rng): Roll {
  return { a: rng.int(1, FACES), b: rng.int(1, FACES) };
}

/** A running experiment: every count needed by the screen, without keeping every roll. */
export interface Experiment {
  seed: number;
  rng: Rng;
  rolls: number;
  /** Count of each sum, indexed by the sum (0 and 1 unused). */
  bySum: number[];
  /** Count of each face of each die (index 1–6), to show both dice are fair. */
  faces: { a: number[]; b: number[] };
  /** The latest roll, for the dice shown. */
  last: Roll | null;
  /** Running share of the target sum: [rolls, target count] after selected rolls (see `recordPoint`). */
  path: [number, number][];
  /** Target count in each complete series of 10 rolls rolled as such: how much small samples vary. */
  series: number[];
}

export function newExperiment(seed: number): Experiment {
  return {
    seed,
    rng: createRng(seed),
    rolls: 0,
    bySum: Array<number>(13).fill(0),
    faces: { a: Array<number>(FACES + 1).fill(0), b: Array<number>(FACES + 1).fill(0) },
    last: null,
    path: [],
    series: [],
  };
}

/** Rolls `count` times; a batch of exactly 10 also adds a series. Returns the rolls when few, for animation. */
export function rollBatch(experiment: Experiment, count: number): Roll[] {
  const kept: Roll[] = [];
  let targets = 0;
  for (let i = 0; i < count; i++) {
    const r = roll(experiment.rng);
    const sum = r.a + r.b;
    experiment.rolls++;
    experiment.bySum[sum]!++;
    experiment.faces.a[r.a]!++;
    experiment.faces.b[r.b]!++;
    experiment.last = r;
    if (sum === TARGET) targets++;
    if (recordPoint(experiment.rolls)) experiment.path.push([experiment.rolls, experiment.bySum[TARGET]!]);
    if (count <= 10) kept.push(r);
  }
  if (count === 10) experiment.series.push(targets);
  return kept;
}

/** The sum (or sums) rolled most often so far. */
export function mostFrequent(experiment: Experiment): number[] {
  const max = Math.max(...SUMS.map((s) => experiment.bySum[s]!));
  return max === 0 ? [] : SUMS.filter((s) => experiment.bySum[s] === max);
}

/** Expected count of a sum after `rolls` rolls: rolls × ways / 36. */
export const expected = (sum: number, rolls: number): number => (rolls * ways(sum)) / OUTCOMES;

