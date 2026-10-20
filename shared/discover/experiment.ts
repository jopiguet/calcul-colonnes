/**
 * What every Discover experiment shares: an experiment number (its seed), the
 * points of a running chart, and the chi-square statistic used by the checks.
 */

/** Experiment numbers shown to the learner: easy to read out and type. */
export const MAX_SEED = 9999;

/** A fresh experiment number, from the browser's or Node's secure generator. */
export function freshSeed(): number {
  const buffer = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buffer);
  return 1 + (buffer[0]! % MAX_SEED);
}

/**
 * Points of a running share: after every trial up to 100, then every 10 up to
 * 1,000, every 100 up to 10,000 and every 1,000 beyond. Enough for a chart on
 * a logarithmic axis, at a fixed cost however long the experiment.
 */
export function recordPoint(trials: number): boolean {
  const step = trials <= 100 ? 1 : trials <= 1000 ? 10 : trials <= 10_000 ? 100 : 1000;
  return trials % step === 0;
}

/**
 * Pearson's chi-square statistic of observed counts against expected ones.
 * Used by the check script to test the generators, not shown to learners.
 */
export function chiSquare(observed: number[], expectedCounts: number[]): number {
  return observed.reduce((sum, o, i) => {
    const e = expectedCounts[i]!;
    return e > 0 ? sum + ((o - e) * (o - e)) / e : sum;
  }, 0);
}
