/**
 * A coin: the engine of the coins lab (src/discover/coins.ts), about streaks.
 *
 * Three ideas, each with its numbers:
 *   - a coin has no memory: after a run of the same side, the next flip is
 *     still one in two (`afterStreak` measures it);
 *   - long runs are normal: in 100 flips, the longest run is most often 6 or
 *     7 (`longestRunDistribution`, exact);
 *   - every precise sequence of 6 flips has the same chance, 1 in 64, the
 *     all-heads one included (`sequenceProbability`).
 *
 * As with the dice, an experiment is its seed: the same number gives the same
 * flips, whatever the batches. `npm run check:discover` verifies the exact
 * formulas against a brute-force count, and the generator by chi-square tests.
 */
import { createRng, type Rng } from "../quiz/rng";
import { recordPoint } from "./experiment";

export type Side = "heads" | "tails";

/** A run this long or longer is a streak: what comes after it is counted. */
export const STREAK = 3;
/** Flips shown in the ribbon: the latest 100. */
export const RIBBON = 100;
/** Run lengths counted one by one up to this; longer ones together ("10 or more"). */
export const RUN_BUCKETS = 10;
/** The longest run is compared on the first 100 flips. */
export const SERIES = 100;

export interface CoinExperiment {
  seed: number;
  rng: Rng;
  flips: number;
  heads: number;
  last: Side | null;
  /** The run in progress. */
  current: { side: Side | null; length: number };
  /** The longest run so far, of either side. */
  longest: number;
  /** The longest run within the first 100 flips, once there are 100. */
  longestInSeries: number | null;
  /** Finished runs by length, index 1 to RUN_BUCKETS (the last: that length or more). */
  runs: number[];
  /** After a run of STREAK or more: did the next flip continue it or break it? */
  afterStreak: { same: number; other: number };
  /** The latest flips, oldest first, for the ribbon. */
  recent: Side[];
  /** Running share of heads: [flips, heads] after selected flips. */
  path: [number, number][];
}

export function newCoinExperiment(seed: number): CoinExperiment {
  return {
    seed,
    rng: createRng(seed),
    flips: 0,
    heads: 0,
    last: null,
    current: { side: null, length: 0 },
    longest: 0,
    longestInSeries: null,
    runs: Array<number>(RUN_BUCKETS + 1).fill(0),
    afterStreak: { same: 0, other: 0 },
    recent: [],
    path: [],
  };
}

export const flip = (rng: Rng): Side => (rng.next() < 0.5 ? "heads" : "tails");

const bucket = (length: number): number => Math.min(length, RUN_BUCKETS);

/** Flips `count` times. Returns the flips when 10 or fewer, for the animation. */
export function flipBatch(e: CoinExperiment, count: number): Side[] {
  const kept: Side[] = [];
  for (let i = 0; i < count; i++) {
    const side = flip(e.rng);
    // What follows a streak, measured before the streak changes.
    if (e.current.side !== null && e.current.length >= STREAK) {
      if (side === e.current.side) e.afterStreak.same++;
      else e.afterStreak.other++;
    }
    if (side === e.current.side) e.current.length++;
    else {
      if (e.current.side !== null) e.runs[bucket(e.current.length)]!++;
      e.current = { side, length: 1 };
    }
    e.longest = Math.max(e.longest, e.current.length);
    e.flips++;
    if (side === "heads") e.heads++;
    e.last = side;
    if (e.flips === SERIES) e.longestInSeries = e.longest;
    e.recent.push(side);
    if (e.recent.length > RIBBON) e.recent.shift();
    if (recordPoint(e.flips)) e.path.push([e.flips, e.heads]);
    if (count <= 10) kept.push(side);
  }
  return kept;
}

/** Runs by length, the run in progress included (index 1 to RUN_BUCKETS). */
export function runCounts(e: CoinExperiment): number[] {
  const out = [...e.runs];
  if (e.current.side !== null) out[bucket(e.current.length)]!++;
  return out;
}

/**
 * Probability that no run in `n` fair flips is longer than `k`, either side.
 * Such a sequence is a first side, then runs of 1 to k alternating sides:
 * a composition of n into parts of at most k. With f(m) = compositions of m
 * divided by 2^m, f(m) = Σ f(m − j) / 2^j for j = 1…k, and the probability is
 * 2 · f(n) (two choices of first side). Floating point, no large integers.
 */
export function longestRunAtMost(n: number, k: number): number {
  if (n === 0) return 1;
  if (k <= 0) return 0;
  if (k >= n) return 1;
  const f = Array<number>(n + 1).fill(0);
  f[0] = 1;
  for (let m = 1; m <= n; m++) {
    let sum = 0;
    let weight = 0.5;
    for (let j = 1; j <= Math.min(k, m); j++, weight /= 2) sum += f[m - j]! * weight;
    f[m] = sum;
  }
  return 2 * f[n]!;
}

/** P(longest run = k) for k = 1…n, in n fair flips (index 0 unused). */
export function longestRunDistribution(n: number): number[] {
  const out = [0];
  for (let k = 1; k <= n; k++) out.push(longestRunAtMost(n, k) - longestRunAtMost(n, k - 1));
  return out;
}

/** Probability of at least one run of `k` or more, either side, in `n` fair flips. */
export const runAtLeast = (n: number, k: number): number => 1 - longestRunAtMost(n, k - 1);

/** Probability of one precise sequence of `length` flips: (1/2)^length. */
export const sequenceProbability = (length: number): number => 0.5 ** length;

/**
 * Expected number of runs of exactly `k` (a maximal run, either side) in `n`
 * fair flips. A run on positions i…i+k−1 needs k − 1 equal neighbours and a
 * different flip on each side that exists: (1/2)^(k−1+b), b the number of
 * sides inside the sequence. Two placements touch an edge (b = 1), n − k − 1
 * do not (b = 2); a run of the whole sequence touches both (b = 0).
 * Each longer run is about half as frequent: the halving the lab shows.
 */
export function expectedRuns(n: number, k: number): number {
  if (k < 1 || k > n) return 0;
  if (k === n) return 0.5 ** (n - 1);
  return 2 * 0.5 ** k + (n - k - 1) * 0.5 ** (k + 1);
}

/** Expected runs per bucket of the run chart: 1 to RUN_BUCKETS − 1, then that length or more. */
export function expectedRunBuckets(n: number): number[] {
  const out = Array<number>(RUN_BUCKETS + 1).fill(0);
  for (let k = 1; k <= n; k++) out[bucket(k)]! += expectedRuns(n, k);
  return out;
}
