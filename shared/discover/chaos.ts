/**
 * Chaos (docs/discover.md#mathematical-curiosities): the Lorenz attractor and
 * the butterfly effect, and the logistic map's period doubling. Pure
 * functions; `npm run check:math` checks them.
 */

// ------------------------------------------------------------------ Lorenz

export type Vec3 = [number, number, number];

/** Lorenz's parameters (1963): σ = 10, ρ = 28, β = 8/3. */
export const LORENZ = { sigma: 10, rho: 28, beta: 8 / 3 };

export function lorenzField([x, y, z]: Vec3, p = LORENZ): Vec3 {
  return [p.sigma * (y - x), x * (p.rho - z) - y, x * y - p.beta * z];
}

/** One Runge–Kutta step. */
export function rk4(s: Vec3, h: number, p = LORENZ): Vec3 {
  const add = (a: Vec3, b: Vec3, k: number): Vec3 => [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2]];
  const k1 = lorenzField(s, p);
  const k2 = lorenzField(add(s, k1, h / 2), p);
  const k3 = lorenzField(add(s, k2, h / 2), p);
  const k4 = lorenzField(add(s, k3, h), p);
  return [
    s[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    s[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    s[2] + (h / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
  ];
}

/** Lorenz's start, on the attractor already (after a transient from (1, 1, 1)). */
export const LORENZ_START: Vec3 = (() => {
  let s: Vec3 = [1, 1, 1];
  for (let i = 0; i < 2000; i++) s = rk4(s, 0.01);
  return s;
})();

export const LORENZ_STEP = 0.005;
/** Points kept: one every `every` steps. */
const EVERY = 4;

export interface Twins {
  t: number[];
  a: Vec3[];
  b: Vec3[];
  /** Distance between the two at each kept time. */
  gap: number[];
}

/**
 * Two runs, the second started `delta` away in x: the butterfly effect. Up to `until` time units.
 */
export function twins(delta: number, until: number, start: Vec3 = LORENZ_START): Twins {
  let a = start;
  let b: Vec3 = [start[0] + delta, start[1], start[2]];
  const out: Twins = { t: [0], a: [a], b: [b], gap: [delta] };
  const steps = Math.round(until / LORENZ_STEP);
  for (let i = 1; i <= steps; i++) {
    a = rk4(a, LORENZ_STEP);
    b = rk4(b, LORENZ_STEP);
    if (i % EVERY === 0) {
      out.t.push(i * LORENZ_STEP);
      out.a.push(a);
      out.b.push(b);
      out.gap.push(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    }
  }
  return out;
}

/** The forecast is lost when the two runs are this far apart (the attractor is about 40 wide). */
export const LOST = 10;

/** The first time the two runs are `LOST` apart, or null. */
export function divergenceTime(tw: Twins): number | null {
  const i = tw.gap.findIndex((g) => g >= LOST);
  return i < 0 ? null : tw.t[i]!;
}

/**
 * The largest Lyapunov exponent, by Benettin's method: a neighbour kept
 * `d0` away, its stretching averaged over `time` units. About 0.906.
 */
export function lyapunov(time = 200, d0 = 1e-8, start: Vec3 = LORENZ_START): number {
  let a = start;
  let b: Vec3 = [start[0] + d0, start[1], start[2]];
  let sum = 0;
  const renorm = 0.5;
  const steps = Math.round(time / LORENZ_STEP);
  const every = Math.round(renorm / LORENZ_STEP);
  for (let i = 1; i <= steps; i++) {
    a = rk4(a, LORENZ_STEP);
    b = rk4(b, LORENZ_STEP);
    if (i % every === 0) {
      const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      sum += Math.log(d / d0);
      b = [a[0] + ((b[0] - a[0]) * d0) / d, a[1] + ((b[1] - a[1]) * d0) / d, a[2] + ((b[2] - a[2]) * d0) / d];
    }
  }
  return sum / (steps * LORENZ_STEP);
}

/** The value taught: λ ≈ 0.9 per time unit. */
export const LYAPUNOV = 0.906;

// ------------------------------------------------------------------ logistic map

/** One year: x → r x (1 − x). */
export const logistic = (r: number, x: number): number => r * x * (1 - x);

/** The first `years` values from x₀. */
export function series(r: number, x0: number, years: number): number[] {
  const out = [x0];
  let x = x0;
  for (let i = 0; i < years; i++) {
    x = logistic(r, x);
    out.push(x);
  }
  return out;
}

/**
 * What the population does in the long run: dies out, settles on a value,
 * repeats with a period, or never repeats (chaos), judged after a long run.
 */
export function longRun(r: number, x0 = 0.2): { kind: "extinct" } | { kind: "fixed"; value: number } | { kind: "cycle"; period: number; values: number[] } | { kind: "chaos" } {
  let x = x0;
  for (let i = 0; i < 20000; i++) x = logistic(r, x);
  if (x < 1e-6) return { kind: "extinct" };
  const start = x;
  const values = [x];
  for (let p = 1; p <= 64; p++) {
    x = logistic(r, x);
    if (Math.abs(x - start) < 1e-6) {
      return p === 1 ? { kind: "fixed", value: start } : { kind: "cycle", period: p, values: [...values].sort((a, b) => a - b) };
    }
    values.push(x);
  }
  return { kind: "chaos" };
}

/** The bifurcation diagram: for each r of a grid, the values visited after a transient. */
export function bifurcation(rMin: number, rMax: number, columns: number, keep = 120, transient = 600): { r: number; xs: number[] }[] {
  const out: { r: number; xs: number[] }[] = [];
  for (let c = 0; c < columns; c++) {
    const r = rMin + ((rMax - rMin) * (c + 0.5)) / columns;
    let x = 0.2;
    for (let i = 0; i < transient; i++) x = logistic(r, x);
    const xs: number[] = [];
    for (let i = 0; i < keep; i++) {
      x = logistic(r, x);
      xs.push(x);
    }
    out.push({ r, xs });
  }
  return out;
}

/** Where the period doubles: 3, 1 + √6, then the known values; and where chaos starts. */
export const DOUBLINGS = [3, 1 + Math.sqrt(6), 3.5440903, 3.5644073, 3.5687594];
export const CHAOS_ONSET = 3.5699456;
/** The window of period 3 opens at 1 + √8. */
export const PERIOD_THREE = 1 + Math.sqrt(8);
/** Feigenbaum's constant: the ratio of successive doubling intervals. */
export const FEIGENBAUM = 4.6692016;
