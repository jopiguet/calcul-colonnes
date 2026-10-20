/**
 * Checks the Discover engines: `npm run check:discover`.
 *
 * Two dice: the exact distribution (36 pairs, 6 make 7, sums to 1), the
 * reproducibility of an experiment from its seed, and the generator itself:
 * a chi-square test on a million rolls per seed, for the sums and for each
 * face of each die.
 *
 * A coin: the exact streak formulas against a brute-force count of every
 * sequence, the bookkeeping of runs on a hand-made sequence, and the
 * generator: heads against tails, the flip after a streak, and the longest
 * run of 20,000 series of 100 against its exact distribution.
 */
import {
  OUTCOMES,
  SUMS,
  TARGET,
  chiSquare,
  expected,
  freshSeed,
  mostFrequent,
  newExperiment,
  pairsFor,
  probability,
  rollBatch,
  ways,
  MAX_SEED,
} from "../shared/discover/dice.ts";
import {
  RIBBON,
  flipBatch,
  longestRunAtMost,
  longestRunDistribution,
  newCoinExperiment,
  runAtLeast,
  runCounts,
  sequenceProbability,
  expectedRuns,
  type Side,
} from "../shared/discover/coins.ts";

let failures = 0;
function expect(label: string, actual: unknown, wanted: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    failures++;
    console.error(`✘ ${label}: got ${JSON.stringify(actual)}, wanted ${JSON.stringify(wanted)}`);
  }
}

// Exact distribution.
expect("ways per sum", SUMS.map(ways), [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]);
expect("all pairs counted", SUMS.reduce((n, s) => n + ways(s), 0), OUTCOMES);
expect("pairs listed match ways", SUMS.every((s) => pairsFor(s).length === ways(s)), true);
expect("P(7) = 1/6", probability(7), { numerator: 1, denominator: 6 });
expect("P(2) = 1/36", probability(2), { numerator: 1, denominator: 36 });
expect("P(6) = 5/36", probability(6), { numerator: 5, denominator: 36 });
expect("P(4) = 1/12", probability(4), { numerator: 1, denominator: 12 });
expect("impossible sums", [ways(1), ways(13)], [0, 0]);
expect("7 is the most likely sum", SUMS.filter((s) => ways(s) === Math.max(...SUMS.map(ways))), [TARGET]);

// Reproducible: same seed, same rolls, whatever the batches.
{
  const one = newExperiment(4821);
  rollBatch(one, 10);
  rollBatch(one, 100);
  const two = newExperiment(4821);
  rollBatch(two, 110);
  expect("same seed, same counts in other batches", one.bySum, two.bySum);
  expect("same seed, same last roll", one.last, two.last);
  expect("series only for batches of 10", [one.series.length, two.series.length], [1, 0]);
  const other = newExperiment(4822);
  rollBatch(other, 110);
  if (JSON.stringify(other.bySum) === JSON.stringify(one.bySum)) expect("another seed, other rolls", "same", "different");
  expect("counts add up", one.bySum.reduce((a, b) => a + b, 0), 110);
  expect("path recorded after each of the first 100 rolls, then every 10", one.path.length, 101);
  expect("path ends at the current count", one.path.at(-1), [110, one.bySum[TARGET]]);
  expect("most frequent is a sum rolled", mostFrequent(one).every((s) => one.bySum[s]! > 0), true);
}

// Seeds for learners: 1 to 9999.
for (let i = 0; i < 1000; i++) {
  const s = freshSeed();
  if (!Number.isInteger(s) || s < 1 || s > MAX_SEED) expect("fresh seed in range", s, `1..${MAX_SEED}`);
}

// The generator: a million rolls per seed. Critical values at p = 0.001:
// 29.59 for 10 degrees of freedom (11 sums), 20.52 for 5 (6 faces).
const ROLLS = 1_000_000;
for (const seed of [1, 7, 4821, 9999, 123456789]) {
  const e = newExperiment(seed);
  rollBatch(e, ROLLS);
  const sums = chiSquare(SUMS.map((s) => e.bySum[s]!), SUMS.map((s) => expected(s, ROLLS)));
  if (sums > 29.59) expect(`seed ${seed}: sums chi-square`, Number(sums.toFixed(2)), "≤ 29.59");
  for (const die of ["a", "b"] as const) {
    const faces = chiSquare(e.faces[die].slice(1), Array(6).fill(ROLLS / 6));
    if (faces > 20.52) expect(`seed ${seed}: die ${die} chi-square`, Number(faces.toFixed(2)), "≤ 20.52");
  }
  const share = e.bySum[TARGET]! / ROLLS;
  if (Math.abs(share - 1 / 6) > 0.002) expect(`seed ${seed}: share of 7s`, share, "1/6 ± 0.002");
}

// ------------------------------------------------------------------ coins

// Exact formulas against brute force: every sequence of n flips, n up to 16 for
// each k, and the whole distribution for n = 20 (1,048,576 sequences).
const longestOf = (bits: number, n: number): number => {
  let best = 1;
  let run = 1;
  for (let i = 1; i < n; i++) {
    run = ((bits >> i) & 1) === ((bits >> (i - 1)) & 1) ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
};
for (let n = 1; n <= 16; n++) {
  const counts = Array<number>(n + 1).fill(0);
  for (let bits = 0; bits < 2 ** n; bits++) counts[longestOf(bits, n)]!++;
  let atMost = 0;
  for (let k = 1; k <= n; k++) {
    atMost += counts[k]!;
    const exact = longestRunAtMost(n, k);
    if (Math.abs(exact - atMost / 2 ** n) > 1e-12) expect(`P(longest ≤ ${k} in ${n})`, exact, atMost / 2 ** n);
  }
}
{
  const n = 20;
  const counts = Array<number>(n + 1).fill(0);
  for (let bits = 0; bits < 2 ** n; bits++) counts[longestOf(bits, n)]!++;
  const exact = longestRunDistribution(n);
  for (let k = 1; k <= n; k++) {
    if (Math.abs(exact[k]! - counts[k]! / 2 ** n) > 1e-12) expect(`P(longest = ${k} in 20)`, exact[k], counts[k]! / 2 ** n);
  }
  expect("run of 4 or more in 20 flips (taught: about 3 in 4)", Number(runAtLeast(20, 4).toFixed(3)), 0.768);
}
// Expected runs of each length, against every sequence of 12 flips.
{
  const n = 12;
  const totals = Array<number>(n + 1).fill(0);
  for (let bits = 0; bits < 2 ** n; bits++) {
    let run = 1;
    for (let i = 1; i <= n; i++) {
      if (i < n && ((bits >> i) & 1) === ((bits >> (i - 1)) & 1)) run++;
      else {
        totals[run]!++;
        run = 1;
      }
    }
  }
  for (let k = 1; k <= n; k++) {
    if (Math.abs(expectedRuns(n, k) - totals[k]! / 2 ** n) > 1e-12) expect(`expected runs of ${k} in ${n}`, expectedRuns(n, k), totals[k]! / 2 ** n);
  }
}
const hundred = longestRunDistribution(100);
expect("distribution sums to 1", Number(hundred.reduce((a, b) => a + b, 0).toFixed(12)), 1);
expect("most likely longest run in 100 flips (taught: 6)", hundred.indexOf(Math.max(...hundred)), 6);
expect("run of 6 or more in 100 flips (taught: about 4 in 5)", Number(runAtLeast(100, 6).toFixed(3)), 0.807);
expect("one precise sequence of 6 flips", sequenceProbability(6), 1 / 64);

// Counting: runs add up, the streak tally, reproducible from the seed.
{
  const one = newCoinExperiment(4821);
  flipBatch(one, 10);
  flipBatch(one, 990);
  const two = newCoinExperiment(4821);
  flipBatch(two, 1000);
  expect("same seed, same flips in other batches", [one.heads, one.longest, one.runs], [two.heads, two.longest, two.runs]);
  expect("same ribbon", one.recent.join(), two.recent.join());
  const runs = runCounts(one);
  expect("run lengths add up to the flips", runs.reduce((sum, r, len) => sum + r * len, 0) <= one.flips, true);
  expect("ribbon keeps the latest 100", one.recent.length, RIBBON);
  expect("longest in the first 100 is set", one.longestInSeries !== null && one.longestInSeries <= one.longest, true);
  const flips = one.recent.reduce((n, s, i) => n + (i > 0 && s !== one.recent[i - 1] ? 1 : 0), 0);
  expect("ribbon is a sequence of sides", flips > 0, true);
}
{
  // A hand-made sequence through the same bookkeeping: H H H T H H H H T.
  const e = newCoinExperiment(1);
  const sides: Side[] = ["heads", "heads", "heads", "tails", "heads", "heads", "heads", "heads", "tails"];
  let i = 0;
  e.rng = { ...e.rng, next: () => (sides[i++] === "heads" ? 0.1 : 0.9) };
  flipBatch(e, sides.length);
  expect("hand-made: heads", e.heads, 7);
  expect("hand-made: longest", e.longest, 4);
  // After HHH: T (other). After HHH (4th H coming): H (same), then after HHHH: T (other).
  expect("hand-made: after a streak of 3", e.afterStreak, { same: 1, other: 2 });
  expect("hand-made: runs (finished + current)", runCounts(e).slice(1, 5), [2, 0, 1, 1]);
}

// The generator, for a coin: a million flips per seed. Heads against tails:
// limit 10.83 (1 degree of freedom, p = 0.001); after a streak: one in two
// within 0.005. Then the longest run of 20,000 series of 100 against the exact
// distribution: limit 24.32 (7 degrees of freedom).
for (const seed of [1, 7, 4821, 9999, 123456789]) {
  const e = newCoinExperiment(seed);
  flipBatch(e, ROLLS);
  const chi = chiSquare([e.heads, ROLLS - e.heads], [ROLLS / 2, ROLLS / 2]);
  if (chi > 10.83) expect(`seed ${seed}: heads chi-square`, Number(chi.toFixed(2)), "≤ 10.83");
  const after = e.afterStreak.same / (e.afterStreak.same + e.afterStreak.other);
  if (Math.abs(after - 0.5) > 0.005) expect(`seed ${seed}: same side after a streak`, after, "1/2 ± 0.005");
}
{
  const SERIES_COUNT = 20_000;
  const buckets = (k: number): number => (k <= 4 ? 0 : Math.min(k, 11) - 4); // ≤4, 5, 6, …, 10, 11+
  const observed = Array<number>(8).fill(0);
  for (let s = 1; s <= SERIES_COUNT; s++) {
    const e = newCoinExperiment(s);
    flipBatch(e, 100);
    observed[buckets(e.longest)]!++;
  }
  const exact = Array<number>(8).fill(0);
  hundred.forEach((p, k) => {
    if (k > 0) exact[buckets(k)]! += p * SERIES_COUNT;
  });
  const chi = chiSquare(observed, exact);
  if (chi > 24.32) expect("longest run in 20,000 series of 100: chi-square", Number(chi.toFixed(2)), "≤ 24.32");
}

if (failures > 0) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.log(
  "discover checks passed (two dice: distribution, seeds, 5 × 1,000,000 rolls; " +
    "a coin: streak formulas against every sequence up to 20 flips, 5 × 1,000,000 flips, 20,000 series of 100)",
);
