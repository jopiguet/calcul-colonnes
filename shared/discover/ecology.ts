/**
 * Predators and prey: the Lotka–Volterra model.
 *
 *   dx/dt = αx − βxy     prey grow, and are eaten
 *   dy/dt = δxy − γy     predators grow by eating, and die
 *
 * The populations cycle forever, the prey's peak ahead of the predators'.
 * The quantity V = δx − γ ln x + βy − α ln y stays constant along a cycle: a
 * good integrator keeps it, a naive one (Euler) lets it drift outwards and
 * the cycles grow. Over a cycle the averages are the equilibrium,
 * x* = γ/δ and y* = α/β, whatever the start. `npm run check:biology` checks
 * all of this.
 */

export interface Ecosystem {
  /** Prey growth, per year. */
  alpha: number;
  /** Predation: prey eaten per predator per prey per year. */
  beta: number;
  /** Predator growth per prey eaten. */
  delta: number;
  /** Predator death, per year. */
  gamma: number;
}

/** Hares and lynxes, in thousands, per year: a cycle of about ten years. */
export const HARES_LYNXES: Ecosystem = { alpha: 0.55, beta: 0.028, delta: 0.0084, gamma: 0.84 };

export type State = [number, number];

const rate = (e: Ecosystem, [x, y]: State): State => [e.alpha * x - e.beta * x * y, e.delta * x * y - e.gamma * y];

export function rk4(e: Ecosystem, s: State, dt: number): State {
  const k1 = rate(e, s);
  const k2 = rate(e, [s[0] + (dt / 2) * k1[0], s[1] + (dt / 2) * k1[1]]);
  const k3 = rate(e, [s[0] + (dt / 2) * k2[0], s[1] + (dt / 2) * k2[1]]);
  const k4 = rate(e, [s[0] + dt * k3[0], s[1] + dt * k3[1]]);
  return [s[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), s[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])];
}

/** The naive step: the negative control of the check. */
export function euler(e: Ecosystem, s: State, dt: number): State {
  const r = rate(e, s);
  return [s[0] + dt * r[0], s[1] + dt * r[1]];
}

/** The conserved quantity. */
export const invariant = (e: Ecosystem, [x, y]: State): number => e.delta * x - e.gamma * Math.log(x) + e.beta * y - e.alpha * Math.log(y);

export const equilibrium = (e: Ecosystem): State => [e.gamma / e.delta, e.alpha / e.beta];

/** Period of small cycles around the equilibrium, years. */
export const smallPeriod = (e: Ecosystem): number => (2 * Math.PI) / Math.sqrt(e.alpha * e.gamma);

export interface Run {
  t: number[];
  prey: number[];
  predators: number[];
}

/** The populations over `years`, sampled every `every` years (steps of `dt`). */
export function run(e: Ecosystem, start: State, years: number, every = 0.1, dt = 0.01, step = rk4): Run {
  const out: Run = { t: [0], prey: [start[0]], predators: [start[1]] };
  let s = start;
  const per = Math.round(every / dt);
  const n = Math.round(years / dt);
  for (let i = 1; i <= n; i++) {
    s = step(e, s, dt);
    if (i % per === 0) {
      out.t.push(i * dt);
      out.prey.push(s[0]);
      out.predators.push(s[1]);
    }
  }
  return out;
}

/** Times of the local maxima of a series. */
export function peaks(t: number[], values: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < values.length - 1; i++) if (values[i]! > values[i - 1]! && values[i]! >= values[i + 1]!) out.push(t[i]!);
  return out;
}
