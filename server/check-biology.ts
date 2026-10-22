/**
 * npm run check:biology — the chemistry-and-biology labs' models.
 *
 *   molecules  one way, and only one, to satisfy every valence on each
 *              skeleton; the shapes (VSEPR) and their angles
 *   genetics   Punnett squares against direct enumeration of the alleles;
 *              thousands of seeded offspring against the ratios (chi-square);
 *              the p-value against tabulated values, and uniform under chance
 *   cells      6s² by counting exposed faces; the ratio 6/s; cutting a cube;
 *              random walks spreading as 2Dt, so crossing times grow as L²
 *   ecology    Lotka–Volterra: the invariant kept by RK4 and lost by Euler,
 *              the averages over a cycle at the equilibrium, the prey's peak
 *              ahead of the predators', the period of small cycles
 */
import { MOLECULES, VALENCE, idealAngle, molecule, satisfied, shapeAt, solutions } from "../shared/discover/molecules.ts";
import { breed, combine, gametes, phenotype, phenotypeShares, pValue, punnett } from "../shared/discover/genetics.ts";
import { chiSquare } from "../shared/discover/experiment.ts";
import { diffusionTime, exposedFaces, randomWalk, ratio, splitSurface, surface, volume } from "../shared/discover/cells.ts";
import { HARES_LYNXES, equilibrium, euler, invariant, peaks, run, smallPeriod, type State } from "../shared/discover/ecology.ts";

let failures = 0;
let checks = 0;
function expect(ok: boolean, what: string): void {
  checks++;
  if (!ok) {
    failures++;
    if (failures <= 30) console.log(`  ✗ ${what}`);
  }
}
const near = (a: number, b: number, tol: number): boolean => Math.abs(a - b) <= tol;
const rel = (a: number, b: number, tol: number): boolean => Math.abs(a - b) <= tol * Math.max(Math.abs(a), Math.abs(b), 1e-300);

// ------------------------------------------------------------ molecules

const expected: Record<string, { orders: number[]; shapes: string[] }> = {
  water: { orders: [1, 1], shapes: ["bent"] },
  carbonDioxide: { orders: [2, 2], shapes: ["linear"] },
  ammonia: { orders: [1, 1, 1], shapes: ["trigonalPyramidal"] },
  methane: { orders: [1, 1, 1, 1], shapes: ["tetrahedral"] },
  oxygen: { orders: [2], shapes: [] },
  nitrogen: { orders: [3], shapes: [] },
  hydrogenCyanide: { orders: [1, 3], shapes: ["linear"] },
  formaldehyde: { orders: [2, 1, 1], shapes: ["trigonalPlanar"] },
  ethylene: { orders: [2, 1, 1, 1, 1], shapes: ["trigonalPlanar", "trigonalPlanar"] },
  acetylene: { orders: [1, 3, 1], shapes: ["linear", "linear"] },
};
for (const m of MOLECULES) {
  const all = solutions(m);
  const want = expected[m.id]!;
  expect(all.length === 1, `${m.id}: ${all.length} ways to satisfy the valences`);
  expect(JSON.stringify(all[0]) === JSON.stringify(want.orders), `${m.id}: bonds ${JSON.stringify(all[0])}`);
  expect(satisfied(m, want.orders), `${m.id}: valences`);
  // The formula, from the atoms.
  const counts = new Map<string, number>();
  for (const a of m.atoms) counts.set(a, (counts.get(a) ?? 0) + 1);
  const written = [...m.formula.matchAll(/([A-Z][a-z]?)(\d*)/g)].reduce((map, [, e, n]) => map.set(e!, (map.get(e!) ?? 0) + Number(n || 1)), new Map<string, number>());
  expect([...counts].every(([e, n]) => written.get(e) === n) && counts.size === written.size, `${m.id}: formula ${m.formula}`);
  m.centres.forEach((c, k) => {
    const s = shapeAt(m, want.orders, c);
    expect(s.name === want.shapes[k], `${m.id}: shape ${s.name}`);
    expect(Number.isInteger(s.lonePairs) && s.lonePairs >= 0, `${m.id}: lone pairs ${s.lonePairs}`);
    // An octet: the shared electrons (two per bond) and the lone pairs make eight.
    expect(2 * VALENCE[m.atoms[c]!] + 2 * s.lonePairs === 8, `${m.id}: octet`);
  });
  // A wrong bond order breaks a valence.
  for (let i = 0; i < want.orders.length; i++) {
    const off = [...want.orders];
    off[i] = off[i] === 3 ? 1 : off[i]! + 1;
    expect(!satisfied(m, off), `${m.id}: a wrong order still satisfies the valences`);
  }
}
expect(shapeAt(molecule("water"), [1, 1], 0).angle < idealAngle(4) && shapeAt(molecule("ammonia"), [1, 1, 1], 0).angle < idealAngle(4), "lone pairs squeeze the bonds");
expect(near(idealAngle(4), 109.47, 0.01), "tetrahedral angle");
expect(shapeAt(molecule("water"), [1, 1], 0).angle === 104.5 && shapeAt(molecule("carbonDioxide"), [2, 2], 0).angle === 180, "water bent at 104.5°, CO₂ straight");

// ------------------------------------------------------------ genetics

/** Offspring by enumerating every pair of alleles directly: the check for the square. */
function enumerate(mother: string, father: string): Map<string, number> {
  const genes = mother.length / 2;
  const counts = new Map<string, number>();
  for (let m = 0; m < 2 ** genes; m++) {
    for (let f = 0; f < 2 ** genes; f++) {
      let shown = "";
      for (let g = 0; g < genes; g++) {
        const a = mother[2 * g + ((m >> g) & 1)]!;
        const b = father[2 * g + ((f >> g) & 1)]!;
        shown += a === a.toUpperCase() || b === b.toUpperCase() ? a.toUpperCase() : a;
      }
      counts.set(shown, (counts.get(shown) ?? 0) + 1 / 4 ** genes);
    }
  }
  return counts;
}
const CROSSES: [string, string][] = [
  ["Aa", "Aa"],
  ["Aa", "aa"],
  ["AA", "aa"],
  ["AA", "Aa"],
  ["AaBb", "AaBb"],
  ["AaBb", "aabb"],
  ["AABb", "aaBb"],
  ["AaBB", "Aabb"],
];
for (const [m, f] of CROSSES) {
  const shares = phenotypeShares(m, f);
  const direct = enumerate(m, f);
  expect(shares.length === direct.size, `${m}×${f}: phenotypes`);
  for (const s of shares) expect(near(s.share, direct.get(s.phenotype) ?? -1, 1e-12), `${m}×${f}: ${s.phenotype} ${s.share}`);
  expect(near(shares.reduce((a, s) => a + s.share, 0), 1, 1e-12), `${m}×${f}: shares add up`);
  const { rows, cols, cells } = punnett(m, f);
  expect(rows.length === gametes(m).length && cells.length * cells[0]!.length === rows.length * cols.length, `${m}×${f}: square`);
}
expect(JSON.stringify(phenotypeShares("Aa", "Aa").map((s) => s.share)) === JSON.stringify([0.75, 0.25]), "3 : 1");
expect(JSON.stringify(phenotypeShares("AaBb", "AaBb").map((s) => s.share * 16)) === JSON.stringify([9, 3, 3, 1]), "9 : 3 : 3 : 1");
expect(combine("a", "A") === "Aa" && phenotype("aaBb") === "aB", "dominant first; phenotype");
// Tabulated chi-square values: p = 0.05 at 3.841 (1 df), 7.815 (3 df); p = 0.01 at 6.635 (1 df).
expect(near(pValue(3.841, 1), 0.05, 2e-4) && near(pValue(7.815, 3), 0.05, 2e-4) && near(pValue(6.635, 1), 0.01, 1e-4), "p-values against the tables");
expect(near(pValue(0, 2), 1, 1e-12) && near(pValue(2, 2), Math.exp(-1), 1e-9), "2 df: p = e^(−χ²/2)");
let rejected = 0;
const trials = 2000;
for (let seed = 1; seed <= trials; seed++) {
  const [m, f] = CROSSES[seed % CROSSES.length]!;
  const shares = phenotypeShares(m, f);
  if (shares.length < 2) continue;
  const n = 200;
  const counts = breed(seed, m, f, n);
  const chi = chiSquare(shares.map((s) => counts.get(s.phenotype) ?? 0), shares.map((s) => s.share * n));
  if (pValue(chi, shares.length - 1) < 0.05) rejected++;
}
const usable = CROSSES.filter(([m, f]) => phenotypeShares(m, f).length >= 2).length;
const rate = rejected / ((trials * usable) / CROSSES.length);
expect(rate > 0.025 && rate < 0.08, `chance alone is rejected about 5 % of the time: ${(100 * rate).toFixed(1)} %`);
const many = breed(4242, "Aa", "Aa", 100_000);
expect(near((many.get("a") ?? 0) / 100_000, 0.25, 0.005), "a quarter recessive over 100 000 children");
// The same experiment number gives the same children, and continuing gives what follows.
const a = breed(7, "AaBb", "AaBb", 50);
const b = breed(7, "AaBb", "AaBb", 50);
expect(JSON.stringify([...a]) === JSON.stringify([...b]), "seeded");

// ------------------------------------------------------------ cells

for (let n = 1; n <= 12; n++) {
  expect(exposedFaces(n) === surface(n), `faces of a ${n}-cube`);
  expect(rel(ratio(n), 6 / n, 1e-12), `ratio ${n}`);
  // Cut into unit cubes: n³ cubes, each with 6 faces.
  expect(rel(splitSurface(n, n), 6 * n ** 3, 1e-12) && rel(volume(n), n ** 3, 1e-12), `cut ${n}`);
}
expect(rel(ratio(2e-5) / ratio(4e-5), 2, 1e-12), "twice the side, half the ratio");
const at = [100, 400, 1600, 6400];
const msd = randomWalk(11, 4000, 6400, at);
at.forEach((t, i) => expect(rel(msd[i]!, t, 0.06), `random walk: mean square ${msd[i]} after ${t} steps`));
expect(rel(diffusionTime(2e-5) / diffusionTime(1e-5), 4, 1e-12), "twice the distance, four times the time");
expect(diffusionTime(1e-5) < 0.1 && diffusionTime(1e-3) > 100 && diffusionTime(1) > 1e8, "10 µm in milliseconds, 1 mm in minutes, 1 m in years");

// ------------------------------------------------------------ ecology

const e = HARES_LYNXES;
const [xs, ys] = equilibrium(e);
const still = run(e, [xs, ys], 50);
expect(still.prey.every((x) => rel(x, xs, 1e-9)) && still.predators.every((y) => rel(y, ys, 1e-9)), "the equilibrium stays put");
for (const start of [
  [40, 10],
  [150, 20],
  [100, 40],
  [60, 5],
] as State[]) {
  const r = run(e, start, 60, 0.01, 0.005);
  const v0 = invariant(e, start);
  const drift = Math.max(...r.prey.map((x, i) => Math.abs(invariant(e, [x, r.predators[i]!]) - v0)));
  expect(drift < 1e-6 * Math.abs(v0) + 1e-6, `RK4 keeps the invariant from ${start}: drift ${drift}`);
  const naive = run(e, start, 60, 0.01, 0.005, euler);
  const last = naive.prey.length - 1;
  const lost = invariant(e, [naive.prey[last]!, naive.predators[last]!]) - v0;
  expect(lost > 100 * drift, `Euler lets the cycles grow from ${start}: ${lost}`);
  // Averages over whole cycles: from one prey peak to the last.
  const p = peaks(r.t, r.prey);
  const from = r.t.indexOf(p[0]!);
  const to = r.t.indexOf(p.at(-1)!);
  let sx = 0;
  let sy = 0;
  for (let i = from; i < to; i++) {
    sx += r.prey[i]!;
    sy += r.predators[i]!;
  }
  expect(rel(sx / (to - from), xs, 0.01) && rel(sy / (to - from), ys, 0.01), `averages over the cycles at the equilibrium from ${start}: ${(sx / (to - from)).toFixed(2)}, ${(sy / (to - from)).toFixed(2)}`);
  // The prey peak first, the predators a quarter of a cycle or so later.
  const q = peaks(r.t, r.predators);
  const lag = q.find((t) => t > p[0]!)! - p[0]!;
  const period = p[1]! - p[0]!;
  expect(lag > 0.1 * period && lag < 0.5 * period, `predators peak after the prey from ${start}: ${lag.toFixed(2)} of ${period.toFixed(2)} years`);
}
const small = run(e, [xs * 1.01, ys], 40, 0.01, 0.005);
const ps = peaks(small.t, small.prey);
expect(rel(ps[1]! - ps[0]!, smallPeriod(e), 0.005), `small cycles: ${(ps[1]! - ps[0]!).toFixed(3)} against 2π/√(αγ) = ${smallPeriod(e).toFixed(3)}`);

console.log(`${checks} checks, ${failures} failures.`);
if (failures > 0) process.exit(1);
