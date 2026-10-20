/**
 * Checks the Discover engines: `npm run check:discover`.
 *
 * Two dice: the exact distribution (36 pairs, 6 make 7, sums to 1), the
 * reproducibility of an experiment from its seed, and the generator itself:
 * a chi-square test on a million rolls per seed, for the sums and for each
 * face of each die.
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

if (failures > 0) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.log("discover checks passed (two dice: distribution, seeds, 5 × 1,000,000 rolls)");
