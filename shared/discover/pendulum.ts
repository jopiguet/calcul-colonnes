/**
 * A simple pendulum: a bob of mass m on a string of length L, released at
 * rest from an angle θ₀, without friction.
 *
 * The motion is integrated (fourth-order Runge–Kutta) from the force on the
 * bob, sin θ and all: no small-angle shortcut. The exact period at any angle
 * comes from the complete elliptic integral of the first kind, computed by
 * the arithmetic–geometric mean. `npm run check:physics` compares the two,
 * and checks that the energy does not drift.
 */
import { G } from "./projectile";

export interface Pendulum {
  /** String length, m. */
  length: number;
  /** Bob mass, kg. */
  mass: number;
  /** Release angle from the vertical, degrees. */
  angle: number;
}

/** State: angle (rad) and angular velocity (rad/s). */
export type State = [number, number];

const rad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Angular acceleration from the force: the tangential component of the
 * weight, −mg sin θ, over the bob's mass and the string's length. The mass
 * is in the computation, and it cancels.
 */
export function angularAcceleration(p: Pendulum, theta: number): number {
  const force = -p.mass * G * Math.sin(theta);
  return force / (p.mass * p.length);
}

/** One step of fourth-order Runge–Kutta. */
export function rk4(p: Pendulum, [theta, omega]: State, dt: number): State {
  const f = (s: State): State => [s[1], angularAcceleration(p, s[0])];
  const k1 = f([theta, omega]);
  const k2 = f([theta + (dt / 2) * k1[0], omega + (dt / 2) * k1[1]]);
  const k3 = f([theta + (dt / 2) * k2[0], omega + (dt / 2) * k2[1]]);
  const k4 = f([theta + dt * k3[0], omega + dt * k3[1]]);
  return [theta + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), omega + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])];
}

export const release = (p: Pendulum): State => [rad(p.angle), 0];

/** Energy per kilogram: ½(Lω)² + gL(1 − cos θ). */
export const energyPerKg = (p: Pendulum, [theta, omega]: State): number =>
  0.5 * (p.length * omega) ** 2 + G * p.length * (1 - Math.cos(theta));

/**
 * The period measured on the simulation, as a stopwatch would: the time of
 * `swings` full swings (from one pass through the bottom, going the same way,
 * to the next), crossings interpolated within a step.
 */
export function measuredPeriod(p: Pendulum, swings = 10, dt = 1 / 1000): number {
  let s = release(p);
  let t = 0;
  const crossings: number[] = [];
  while (crossings.length <= swings) {
    const next = rk4(p, s, dt);
    // Through the bottom, moving towards positive angles.
    if (s[0] < 0 && next[0] >= 0) crossings.push(t + (dt * -s[0]) / (next[0] - s[0]));
    s = next;
    t += dt;
    if (t > 1e4) throw new Error("no swing");
  }
  return (crossings[swings]! - crossings[0]!) / swings;
}

/** Arithmetic–geometric mean. */
export function agm(a: number, b: number): number {
  for (let i = 0; i < 60 && Math.abs(a - b) > 1e-15 * a; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  return (a + b) / 2;
}

/** Complete elliptic integral of the first kind, K(k) = π / (2 agm(1, √(1 − k²))). */
export const ellipticK = (k: number): number => Math.PI / (2 * agm(1, Math.sqrt(1 - k * k)));

/** The small-angle period: 2π√(L/g). */
export const smallAnglePeriod = (length: number): number => 2 * Math.PI * Math.sqrt(length / G);

/** The exact period at any release angle: 4√(L/g) K(sin(θ₀/2)). */
export const exactPeriod = (p: Pendulum): number => 4 * Math.sqrt(p.length / G) * ellipticK(Math.sin(rad(p.angle) / 2));

/** The positions over one period, `frames` of them: for the animation. */
export function swingFrames(p: Pendulum, frames: number): number[] {
  const T = exactPeriod(p);
  const dt = T / frames;
  const steps = 20;
  let s = release(p);
  const out: number[] = [s[0]];
  for (let i = 1; i < frames; i++) {
    for (let k = 0; k < steps; k++) s = rk4(p, s, dt / steps);
    out.push(s[0]);
  }
  return out;
}
