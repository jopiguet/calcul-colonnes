/**
 * Checks the models of the mathematical curiosities (docs/discover.md#math-checks):
 *
 *   npm run check:math
 *
 * Each figure the labs teach, computed again another way.
 */
import {
  KOCH_AREA_LIMIT,
  KOCH_DIMENSION,
  SIERPINSKI_DIMENSION,
  chaosCorners,
  escapeTime,
  fate,
  filledShare,
  inMiddleHole,
  kochFacts,
  kochSnowflake,
  orbit,
  perimeter,
  playChaos,
  polygonArea,
  rulerLength,
} from "../shared/discover/fractals.ts";
import { CHAOS_ONSET, DOUBLINGS, FEIGENBAUM, LYAPUNOV, LORENZ_START, PERIOD_THREE, divergenceTime, longRun, lyapunov, rk4, series, twins, type Vec3 } from "../shared/discover/chaos.ts";

let failures = 0;
let checks = 0;
function expect(what: string, ok: boolean, detail = ""): void {
  checks++;
  if (!ok) {
    failures++;
    console.error(`✗ ${what}${detail ? `: ${detail}` : ""}`);
  }
}
const near = (a: number, b: number, tol: number): boolean => Math.abs(a - b) <= tol;

// ---------------------------------------------------------------- Koch
for (let n = 0; n <= 6; n++) {
  const pts = kochSnowflake(n);
  const f = kochFacts(n);
  expect(`Koch ${n}: 3·4ⁿ corners`, pts.length === f.segments, `${pts.length}`);
  expect(`Koch ${n}: perimeter by summing the sides`, near(perimeter(pts), f.perimeter, 1e-9), `${perimeter(pts)} against ${f.perimeter}`);
  expect(`Koch ${n}: area by the shoelace formula`, near(polygonArea(pts), f.area, 1e-9), `${polygonArea(pts)} against ${f.area}`);
}
expect("Koch: the perimeter grows by 4/3 each step", near(kochFacts(5).perimeter / kochFacts(4).perimeter, 4 / 3, 1e-12));
expect("Koch: perimeter above 100 after 13 steps", kochFacts(13).perimeter > 100 && kochFacts(12).perimeter < 100);
expect("Koch: the area tends to 8/5 of the triangle", near(kochFacts(60).areaRatio, KOCH_AREA_LIMIT, 1e-12) && kochFacts(6).areaRatio < KOCH_AREA_LIMIT);
// Box counting on the 6th step: the dimension by measuring with smaller rulers.
{
  const pts = kochSnowflake(6);
  const count = (eps: number): number => {
    const cells = new Set<string>();
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i]!;
      const [bx, by] = pts[(i + 1) % pts.length]!;
      for (let t = 0; t <= 1; t += 0.25) cells.add(`${Math.floor((ax + (bx - ax) * t) / eps)},${Math.floor((ay + (by - ay) * t) / eps)}`);
    }
    return cells.size;
  };
  const slope = (Math.log(count(1 / 243)) - Math.log(count(1 / 27))) / Math.log(9);
  expect("Koch: box-counting dimension near log 4 / log 3", near(slope, KOCH_DIMENSION, 0.08), slope.toFixed(3));
  const r = (k: number) => rulerLength(k);
  expect("Koch: the ruler's length grows by 4/3 when the ruler shrinks by 3", near(r(3).length / r(2).length, 4 / 3, 1e-12));
}

// ---------------------------------------------------------------- Mandelbrot
expect("c = 0 stays", escapeTime(0, 0, 1000) === 1000);
expect("c = −1: the cycle 0, −1", (() => {
  const f = fate(-1, 0);
  return f.kind === "cycle" && f.period === 2;
})());
expect("c = −1: 0, −1, 0, −1", orbit(-1, 0, 4).every(([x, y], i) => near(x, i % 2 === 0 ? 0 : -1, 1e-12) && y === 0));
expect("c = −2: stays (the tip)", escapeTime(-2, 0, 5000) === 5000);
expect("c = 1/4: stays, creeping to 1/2", escapeTime(0.25, 0, 5000) === 5000 && near(orbit(0.25, 0, 5000).at(-1)![0], 0.5, 1e-3));
expect("c = 0.26: escapes, slowly", (() => {
  const n = escapeTime(0.26, 0, 5000);
  return n > 20 && n < 100;
})(), String(escapeTime(0.26, 0, 5000)));
expect("c = 1: 0, 1, 2, 5: out at the third step", escapeTime(1, 0, 100) === 3);
expect("c = i: the cycle −1 + i, −i", (() => {
  const f = fate(0, 1);
  return f.kind === "cycle" && f.period === 2;
})());
expect("c = −0.75 + 0.1i escapes after a while", (() => {
  const n = escapeTime(-0.75, 0.1, 5000);
  return n > 25 && n < 200;
})(), String(escapeTime(-0.75, 0.1, 5000)));
// Once |z| > 2 it never comes back: checked along 2,000 escaping orbits.
{
  let back = 0;
  for (let i = 0; i < 2000; i++) {
    const cr = -2 + 3 * ((i * 0.618034) % 1);
    const ci = -1.5 + 3 * ((i * 0.414214) % 1);
    let [x, y] = [0, 0];
    let out = false;
    for (let n = 0; n < 60; n++) {
      [x, y] = [x * x - y * y + cr, 2 * x * y + ci];
      if (x * x + y * y > 4) out = true;
      else if (out) back++;
      if (x * x + y * y > 1e10) break;
    }
  }
  expect("past |z| = 2, never back", back === 0, `${back} returns`);
}
// The set is symmetric, and its area about 1.506.
{
  let inside = 0;
  let asym = 0;
  const h = 0.005;
  for (let x = -2 + h / 2; x < 0.5; x += h) {
    for (let y = h / 2; y < 1.25; y += h) {
      const a = escapeTime(x, y, 600) === 600;
      if (a) inside++;
      if (y < 0.3 && a !== (escapeTime(x, -y, 600) === 600)) asym++;
    }
  }
  const area = 2 * inside * h * h;
  expect("area of the set near 1.51", near(area, 1.51, 0.03), area.toFixed(3));
  expect("symmetric about the real axis", asym === 0, String(asym));
}

// ---------------------------------------------------------------- chaos game
{
  const g = playChaos("triangle", 4821, 50_000);
  const holes = g.xs.slice(20).filter((x, i) => inMiddleHole(x, g.ys[i + 20]!)).length;
  expect("triangle: no dot in the middle hole after the first jumps", holes === 0, String(holes));
  const early = g.xs.slice(0, 20).filter((x, i) => inMiddleHole(x, g.ys[i]!)).length;
  expect("triangle: the start can be anywhere", early <= 3);
  expect("same seed, same dots", JSON.stringify(playChaos("triangle", 4821, 100).xs) === JSON.stringify(g.xs.slice(0, 100)));
  expect("another seed, other dots", JSON.stringify(playChaos("triangle", 4822, 100).xs) !== JSON.stringify(g.xs.slice(0, 100)));
  // Box counting: at each halving, three times the cells.
  const cells = (n: number) => filledShare(g, n) * n * n;
  const d = Math.log(cells(64) / cells(16)) / Math.log(4);
  expect("triangle: box-counting dimension near log 3 / log 2", near(d, SIERPINSKI_DIMENSION, 0.08), d.toFixed(3));
  const sq = playChaos("square", 4821, 50_000);
  expect("square: the dots fill the square", filledShare(sq, 32) > 0.99, filledShare(sq, 32).toFixed(3));
  const nr = playChaos("squareNoRepeat", 4821, 50_000);
  expect("square, never the same corner twice: holes", filledShare(nr, 32) < 0.8, filledShare(nr, 32).toFixed(3));
  expect("square, never the same corner twice: the rule holds", nr.picks.every((k, i) => i === 0 || k !== nr.picks[i - 1]));
  const pent = playChaos("pentagon", 4821, 50_000);
  expect("pentagon: holes too", filledShare(pent, 32) < 0.6, filledShare(pent, 32).toFixed(3));
  // A fair choice of corners.
  const counts = [0, 0, 0];
  for (const k of g.picks) counts[k]!++;
  expect("corners picked about equally", counts.every((c) => near(c / g.picks.length, 1 / 3, 0.01)), counts.join(" "));
  expect("triangle's corners", chaosCorners("triangle").corners.length === 3 && chaosCorners("triangle").fraction === 0.5);
}

// ---------------------------------------------------------------- Lorenz
{
  // RK4 against itself at half the step: the same over 5 time units.
  let a: Vec3 = LORENZ_START;
  let b: Vec3 = LORENZ_START;
  for (let i = 0; i < 1000; i++) a = rk4(a, 0.005);
  for (let i = 0; i < 2000; i++) b = rk4(b, 0.0025);
  expect("RK4 converged (step halved)", Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 1e-4);
  const tw = twins(1e-6, 40);
  expect("the attractor stays bounded", tw.a.every(([x, y, z]) => Math.abs(x) < 25 && Math.abs(y) < 30 && z > 0 && z < 55));
  expect("both wings visited", tw.a.some(([x]) => x > 8) && tw.a.some(([x]) => x < -8));
  const lam = lyapunov();
  expect("Lyapunov exponent near 0.906", near(lam, LYAPUNOV, 0.05), lam.toFixed(3));
  // Each tenfold precision adds about ln 10 / λ ≈ 2.5 time units of forecast.
  const times = [1e-3, 1e-6, 1e-9].map((d) => divergenceTime(twins(d, 60)) ?? Infinity);
  const gain = (times[2]! - times[0]!) / 6;
  expect("divergence later with a smaller start", times[0]! < times[1]! && times[1]! < times[2]!, times.join(" "));
  expect("about 2.5 time units per factor 10", near(gain, Math.log(10) / LYAPUNOV, 0.9), gain.toFixed(2));
  expect("a millionth apart: lost within 10 to 30 units", times[1]! > 10 && times[1]! < 30, String(times[1]));
}

// ---------------------------------------------------------------- logistic map
{
  const k = (r: number) => longRun(r);
  expect("r = 0.8: dies out", k(0.8).kind === "extinct");
  const f = k(2.5);
  expect("r = 2.5: settles at 1 − 1/r = 0.6", f.kind === "fixed" && near(f.value, 0.6, 1e-5));
  const two = k(3.2);
  expect("r = 3.2: two values", two.kind === "cycle" && two.period === 2);
  const four = k(3.5);
  expect("r = 3.5: four values", four.kind === "cycle" && four.period === 4);
  const eight = k(3.56);
  expect("r = 3.56: eight values", eight.kind === "cycle" && eight.period === 8);
  expect("r = 3.9: never repeats", k(3.9).kind === "chaos");
  const three = k(3.83);
  expect("r = 3.83: the window of period 3", three.kind === "cycle" && three.period === 3);
  expect("period 3 opens at 1 + √8", k(PERIOD_THREE + 0.001).kind === "cycle" && k(PERIOD_THREE - 0.01).kind === "chaos");
  // Each doubling, checked on both sides.
  const periods = [1, 2, 4, 8];
  for (let i = 0; i < 3; i++) {
    const before = k(DOUBLINGS[i]! - 0.002);
    const after = k(DOUBLINGS[i]! + 0.002);
    const per = (x: ReturnType<typeof longRun>) => (x.kind === "fixed" ? 1 : x.kind === "cycle" ? x.period : 0);
    expect(`doubling at ${DOUBLINGS[i]!.toFixed(4)}`, per(before) === periods[i] && per(after) === periods[i + 1], `${per(before)} → ${per(after)}`);
  }
  const ratio = (DOUBLINGS[2]! - DOUBLINGS[1]!) / (DOUBLINGS[3]! - DOUBLINGS[2]!);
  expect("Feigenbaum's ratio already near 4.67", near(ratio, FEIGENBAUM, 0.05), ratio.toFixed(3));
  expect("chaos past 3.5699", CHAOS_ONSET > DOUBLINGS.at(-1)! && CHAOS_ONSET < 3.57);
  // Sensitive at r = 3.9: a billionth grows to a difference of 0.1 within 60 years; at 3.2, it vanishes.
  const a = series(3.9, 0.2, 80);
  const b = series(3.9, 0.2 + 1e-9, 80);
  expect("r = 3.9: a billionth grows", a.some((x, i) => Math.abs(x - b[i]!) > 0.1));
  const c = series(3.2, 0.2, 200);
  const d = series(3.2, 0.2 + 1e-3, 200);
  expect("r = 3.2: differences die out", Math.abs(c.at(-1)! - d.at(-1)!) < 1e-6);
}

console.log(`${checks} checks, ${failures} failures`);
process.exit(failures === 0 ? 0 : 1);
