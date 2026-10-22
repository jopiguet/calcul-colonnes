/**
 * A thrown ball, without air: the anchor of the physics playground.
 *
 * The flight is integrated step by step (velocity Verlet), as a simulation
 * with forces would be; the exact formulas of uniformly accelerated motion
 * are written separately, and `npm run check:physics` compares the two.
 */

/** Gravitational acceleration at the Earth's surface, m s⁻². */
export const G = 9.81;

export interface Launch {
  /** Speed at release, m/s. */
  speed: number;
  /** Angle above the horizontal, degrees. */
  angle: number;
  /** Height of release above the ground, m. */
  height: number;
  /** Mass, kg: it enters the force and cancels out (no air). */
  mass?: number;
}

export interface Flight {
  /** Positions every `dt` seconds from release, ending exactly on the ground: [t, x, y]. */
  points: [number, number, number][];
  /** Horizontal distance at landing, m. */
  range: number;
  /** Time in the air, s. */
  time: number;
  /** Highest point above the ground, m. */
  apex: number;
}

const rad = (deg: number): number => (deg * Math.PI) / 180;

/** The exact flight: time, range and highest point. */
export function exactFlight(l: Launch): { range: number; time: number; apex: number } {
  const vx = l.speed * Math.cos(rad(l.angle));
  const vy = l.speed * Math.sin(rad(l.angle));
  const time = (vy + Math.sqrt(vy * vy + 2 * G * l.height)) / G;
  return { range: vx * time, time, apex: l.height + (vy > 0 ? (vy * vy) / (2 * G) : 0) };
}

/** Range from the ground, the textbook formula: v² sin 2θ / g. */
export const groundRange = (speed: number, angle: number): number => (speed * speed * Math.sin(2 * rad(angle))) / G;

/** The exact position at time t. */
export function exactPosition(l: Launch, t: number): [number, number] {
  const vx = l.speed * Math.cos(rad(l.angle));
  const vy = l.speed * Math.sin(rad(l.angle));
  return [vx * t, l.height + vy * t - 0.5 * G * t * t];
}

/**
 * The flight, integrated with time step `dt` from the forces on the ball
 * (its weight only). The last point is placed on the ground by
 * interpolating the final step.
 */
export function simulate(l: Launch, dt = 1 / 240): Flight {
  const m = l.mass ?? 0.5;
  const force = (): [number, number] => [0, -m * G];
  let t = 0;
  let x = 0;
  let y = l.height;
  let vx = l.speed * Math.cos(rad(l.angle));
  let vy = l.speed * Math.sin(rad(l.angle));
  let [fx, fy] = force();
  let apex = y;
  const points: [number, number, number][] = [[0, x, y]];
  for (let guard = 0; guard < 1e6; guard++) {
    // Velocity Verlet: position with the current acceleration, then velocity with the average.
    const nx = x + vx * dt + 0.5 * (fx / m) * dt * dt;
    const ny = y + vy * dt + 0.5 * (fy / m) * dt * dt;
    const [gx, gy] = force();
    const nvx = vx + 0.5 * ((fx + gx) / m) * dt;
    const nvy = vy + 0.5 * ((fy + gy) / m) * dt;
    if (ny < 0 || (ny === 0 && nvy < 0)) {
      // The ground is crossed in this step: solve y(s) = 0 on it (a parabola within the step).
      const a = 0.5 * (fy / m);
      const s = a === 0 ? -y / vy : (-vy - Math.sqrt(vy * vy - 4 * a * y)) / (2 * a);
      const landX = x + vx * s + 0.5 * (fx / m) * s * s;
      points.push([t + s, landX, 0]);
      return { points, range: landX, time: t + s, apex };
    }
    [x, y, vx, vy, fx, fy] = [nx, ny, nvx, nvy, gx, gy];
    t += dt;
    apex = Math.max(apex, y);
    points.push([t, x, y]);
  }
  throw new Error("the ball never landed");
}

/** Mechanical energy per kilogram at a point of the flight: ½v² + gy. */
export function energyPerKg(l: Launch, t: number): number {
  const vx = l.speed * Math.cos(rad(l.angle));
  const vy = l.speed * Math.sin(rad(l.angle)) - G * t;
  const [, y] = exactPosition(l, t);
  return 0.5 * (vx * vx + vy * vy) + G * y;
}

/** The angle, to the degree, that throws farthest at this speed and height. */
export function bestAngle(speed: number, height: number): number {
  let best = 0;
  let far = -1;
  for (let a = 1; a <= 89; a++) {
    const r = exactFlight({ speed, angle: a, height }).range;
    if (r > far) [best, far] = [a, r];
  }
  return best;
}

/**
 * Two balls released at the same moment from height h: one dropped, one
 * pushed off horizontally at `speed`. Their positions every `every` seconds
 * until both land: a multi-flash picture.
 */
export function dropAndThrow(height: number, speed: number, every = 0.1): { t: number; dropped: [number, number]; thrown: [number, number] }[] {
  const dropped: Launch = { speed: 0, angle: 0, height };
  const thrown: Launch = { speed, angle: 0, height };
  const end = exactFlight(thrown).time;
  const shots: { t: number; dropped: [number, number]; thrown: [number, number] }[] = [];
  for (let k = 0; k * every < end; k++) shots.push({ t: k * every, dropped: exactPosition(dropped, k * every), thrown: exactPosition(thrown, k * every) });
  shots.push({ t: end, dropped: [0, 0], thrown: [exactFlight(thrown).range, 0] });
  return shots;
}
