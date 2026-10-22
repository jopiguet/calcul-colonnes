/**
 * npm run check:physics — the physics playground's simulations against the
 * exact solutions, and against the conservation laws. A physics simulation
 * that drifts teaches the wrong thing.
 *
 *   projectile  the integrated flight against the formulas of uniformly
 *               accelerated motion; energy; 45° and complementary angles
 *   pendulum    the integrated period against the elliptic-integral period,
 *               at angles up to 170°; energy over 100 swings; mass; and a
 *               naive integrator, which must fail the same test
 *   lenses      traced rays against the thin lens equation; the card
 *   circuits    nodal analysis against the series and parallel formulas;
 *               Kirchhoff's current law and energy at every junction
 */
import { G, bestAngle, dropAndThrow, energyPerKg as flightEnergy, exactFlight, exactPosition, groundRange, simulate } from "../shared/discover/projectile.ts";
import {
  agm,
  angularAcceleration,
  ellipticK,
  energyPerKg,
  exactPeriod,
  measuredPeriod,
  release,
  rk4,
  smallAnglePeriod,
  type Pendulum,
  type State,
} from "../shared/discover/pendulum.ts";
import { APERTURE, blurWidth, bundle, heightAt, image, isSharp, onScreen, principalRays, type Bench } from "../shared/discover/lenses.ts";
import { CIRCUITS, LAYOUT, RESISTANCE, SINGLE_POWER, VOLTAGE, bulbsOf, solve, type BulbName } from "../shared/discover/circuits.ts";

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

// ------------------------------------------------------------ projectile

let flights = 0;
for (const speed of [2, 5, 10, 15, 20, 25]) {
  for (let angle = 0; angle <= 85; angle += 5) {
    for (const height of [0, 1.5, 10, 20]) {
      if (angle === 0 && height === 0) continue;
      for (const mass of [0.06, 0.5, 5]) {
        const l = { speed, angle, height, mass };
        const sim = simulate(l);
        const exact = exactFlight(l);
        flights++;
        const where = `v=${speed} θ=${angle} h=${height} m=${mass}`;
        expect(near(sim.range, exact.range, 1e-6), `range ${where}: ${sim.range} against ${exact.range}`);
        expect(near(sim.time, exact.time, 1e-9), `time ${where}`);
        // The apex is sampled every 1/240 s: within what a step can miss.
        expect(sim.apex <= exact.apex + 1e-9 && exact.apex - sim.apex < 2e-3, `apex ${where}: ${sim.apex} against ${exact.apex}`);
        // Every integrated point on the exact parabola, and the energy constant.
        const e0 = flightEnergy(l, 0);
        for (const [t, x, y] of sim.points) {
          const [ex, ey] = exactPosition(l, t);
          if (!(near(x, ex, 1e-9) && near(y, ey, 1e-9))) {
            expect(false, `position at t=${t} ${where}`);
            break;
          }
          if (!rel(flightEnergy(l, t), e0, 1e-12)) {
            expect(false, `energy at t=${t} ${where}`);
            break;
          }
        }
      }
    }
  }
}
// From the ground: 45° is best, complementary angles tie, the textbook formula holds.
for (const speed of [5, 15, 25]) {
  expect(bestAngle(speed, 0) === 45, `best angle from the ground at ${speed} m/s`);
  for (const a of [15, 20, 30, 40]) {
    expect(near(exactFlight({ speed, angle: a, height: 0 }).range, exactFlight({ speed, angle: 90 - a, height: 0 }).range, 1e-9), `${a}° and ${90 - a}° tie`);
    expect(near(groundRange(speed, a), simulate({ speed, angle: a, height: 0 }).range, 1e-6), `v² sin 2θ / g at ${a}°`);
  }
  for (const h of [1.5, 10, 20]) expect(bestAngle(speed, h) < 45, `from ${h} m, the best angle is below 45°`);
}
// The taught figure: 15 m/s at 30° from the ground lands at 19.9 m.
expect(near(groundRange(15, 30), 19.86, 0.01), "15 m/s at 30°: 19.9 m");
// Dropped and thrown together: same height at every flash.
for (const shot of dropAndThrow(1.2, 3)) expect(near(shot.dropped[1], shot.thrown[1], 1e-12), `dropped and thrown at t=${shot.t}`);
expect(near(exactFlight({ speed: 0, angle: 0, height: 1.25 }).time, Math.sqrt((2 * 1.25) / G), 1e-12), "free fall time √(2h/g)");

// ------------------------------------------------------------ pendulum

// The elliptic integral, independently: its power series converges for k < 1.
function kSeries(k: number): number {
  let sum = 0;
  let term = 1;
  for (let n = 0; n < 4000; n++) {
    sum += term * term * k ** (2 * n);
    term *= (2 * n + 1) / (2 * n + 2);
  }
  return (Math.PI / 2) * sum;
}
for (const k of [0, 0.1, 0.3, 0.5, 0.7, 0.85]) expect(rel(ellipticK(k), kSeries(k), 1e-12), `K(${k}) by AGM against the series`);
expect(rel(agm(1, Math.SQRT1_2), 0.8472130847939790866, 1e-15), "agm(1, 1/√2), Gauss's constant");
// The taught figures: at 90°, 18.0 % longer than the small-angle period; at 60°, 7.3 %; at 20°, 0.77 %.
const factor = (angle: number): number => exactPeriod({ length: 1, mass: 1, angle }) / smallAnglePeriod(1);
expect(near(factor(90), 1.18034, 1e-5), "period at 90°");
expect(near(factor(60), 1.07318, 1e-5), "period at 60°");
expect(near(factor(20), 1.00767, 1e-5), "period at 20°");
// Small angles: T ≈ T₀(1 + θ²/16).
for (const angle of [1, 3, 5]) {
  const th = (angle * Math.PI) / 180;
  expect(rel(factor(angle), 1 + (th * th) / 16, 1e-6), `small-angle correction at ${angle}°`);
}

let pendulums = 0;
for (const length of [0.25, 0.5, 1, 1.5, 2.5]) {
  for (const angle of [2, 5, 10, 20, 30, 45, 60, 80, 120, 170]) {
    const p: Pendulum = { length, mass: 1, angle };
    pendulums++;
    const measured = measuredPeriod(p, 10);
    expect(rel(measured, exactPeriod(p), 1e-7), `period L=${length} θ=${angle}: ${measured} against ${exactPeriod(p)}`);
    // The mass cancels: the same motion, number for number, at another mass.
    expect(rel(measuredPeriod({ length, angle, mass: 0.05 }, 10), measured, 1e-12), `mass L=${length} θ=${angle}`);
    // Energy over 100 swings: no drift.
    const dt = 1 / 1000;
    let s: State = release(p);
    const e0 = energyPerKg(p, s);
    let worst = 0;
    const steps = Math.round((100 * exactPeriod(p)) / dt);
    for (let i = 0; i < steps; i++) {
      s = rk4(p, s, dt);
      if (i % 50 === 0) worst = Math.max(worst, Math.abs(energyPerKg(p, s) - e0));
    }
    expect(worst <= 1e-8 * Math.max(e0, 1e-6), `energy drift L=${length} θ=${angle}: ${worst} of ${e0}`);
  }
}
// The check catches a drifting simulation: plain Euler, same step, gains energy.
{
  const p: Pendulum = { length: 1, mass: 1, angle: 30 };
  let [theta, omega] = release(p);
  const e0 = energyPerKg(p, [theta, omega]);
  const dt = 1 / 1000;
  for (let i = 0; i < Math.round((100 * exactPeriod(p)) / dt); i++) [theta, omega] = [theta + dt * omega, omega + dt * angularAcceleration(p, theta)];
  expect(energyPerKg(p, [theta, omega]) > e0 * 1.1, "plain Euler drifts (the energy test would catch it)");
}

// ------------------------------------------------------------ lenses

let benches = 0;
for (const focal of [10, 15, 20]) {
  for (let object = 3; object <= 60; object += 1) {
    if (object === focal) {
      expect(image({ focal, object }) === null, `no image at the focal point f=${focal}`);
      continue;
    }
    const i = image({ focal, object })!;
    benches++;
    const where = `f=${focal} d=${object}`;
    expect(i.real === object > focal, `real image only beyond f: ${where}`);
    expect(near(1 / object + 1 / i.distance, 1 / focal, 1e-12), `thin lens equation ${where}`);
    for (const card of [false, true]) {
      const b: Bench = { focal, object, height: 3, screen: i.real ? i.distance : 30, card };
      // Every traced ray passes through the image point (forwards if real, backwards if virtual).
      const tipY = 3 * i.magnification;
      for (const r of bundle(b, 21)) {
        if (!near(heightAt(r.after, i.distance), tipY, 1e-9)) {
          expect(false, `ray through ${r.at} misses the image ${where}${card ? " with the card" : ""}`);
          break;
        }
      }
      // The card halves the light, not the image.
      const seen = onScreen(b);
      expect(near(seen.light, card ? 21 / 41 : 1, 1e-12), `light through the lens ${where} card=${card}`);
      if (i.real) {
        expect(isSharp(b), `sharp at the image distance ${where}`);
        expect(near(seen.blur, 0, 1e-9) && near(seen.centre, tipY, 1e-9), `screen at the image: a point ${where} card=${card}`);
      }
      // The blur formula against the traced spread, at other screen positions.
      for (const screen of [5, 17.5, 40, 90]) {
        const s: Bench = { ...b, screen };
        expect(near(onScreen(s).blur, blurWidth(s), 1e-9), `blur at ${screen} ${where} card=${card}`);
      }
    }
    // The three principal rays meet at the image (behind the lens, or traced back in front).
    for (const ray of principalRays({ focal, object, height: 3, screen: 0, card: false }, 50)) {
      const [x1, y1] = ray[1]!;
      const [x2, y2] = ray[2]!;
      const y = y1 + ((y2 - y1) / (x2 - x1)) * (i.distance - x1);
      expect(near(y, 3 * i.magnification, 1e-9), `principal ray meets the image ${where}`);
    }
  }
}
expect(near(image({ focal: 10, object: 20 })!.distance, 20, 1e-12) && near(image({ focal: 10, object: 20 })!.magnification, -1, 1e-12), "at 2f: same size, upside down");
expect(APERTURE > 0, "aperture");

// ------------------------------------------------------------ circuits

const single = VOLTAGE / RESISTANCE;
const formulas: Record<string, Partial<Record<BulbName, number>>> = {
  one: { A: single },
  series2: { A: single / 2, B: single / 2 },
  series3: { A: single / 3, B: single / 3, C: single / 3 },
  parallel2: { A: single, B: single },
  parallel3: { A: single, B: single, C: single },
  mixed: { A: VOLTAGE / (1.5 * RESISTANCE), B: VOLTAGE / (1.5 * RESISTANCE) / 2, C: VOLTAGE / (1.5 * RESISTANCE) / 2 },
};
let circuits = 0;
for (const c of CIRCUITS) {
  const names = bulbsOf(c);
  // Every subset of bulbs removed.
  for (let mask = 0; mask < 1 << names.length; mask++) {
    const removed = names.filter((_, i) => mask & (1 << i));
    const s = solve(c, removed);
    circuits++;
    const where = `${c} without ${removed.join("") || "none"}`;
    // Kirchhoff's current law at every junction, and the battery's current at its terminals.
    const nodes = Math.max(...LAYOUT[c].flatMap((p) => [p.from, p.to]));
    for (let n = 0; n <= nodes; n++) {
      let net = n === 1 ? s.battery : n === 0 ? -s.battery : 0;
      for (const p of LAYOUT[c]) {
        const reading = s.bulbs.find((b) => b.bulb === p.bulb)!;
        if (p.from === n) net -= reading.current;
        if (p.to === n) net += reading.current;
      }
      expect(near(net, 0, 1e-9), `current law at junction ${n}, ${where}`);
    }
    // Energy: what the battery gives is what the bulbs use.
    expect(near(s.power, s.bulbs.reduce((t, b) => t + b.power, 0), 1e-9), `energy ${where}`);
    // A removed bulb carries nothing.
    for (const b of s.bulbs) if (!b.in) expect(b.current === 0, `removed bulb ${b.bulb}, ${where}`);
    if (removed.length === 0) {
      for (const b of s.bulbs) expect(near(b.current, formulas[c]![b.bulb]!, 1e-9), `formula for ${b.bulb} in ${c}`);
    }
  }
}
// What the lab teaches.
const s2 = solve("series2");
expect(near(s2.bulbs[0]!.current, s2.bulbs[1]!.current, 1e-9), "series: the same current through both bulbs");
expect(near(s2.bulbs[0]!.brightness, 0.25, 1e-9), "series of two: each a quarter of a bulb alone");
expect(solve("series2", ["A"]).bulbs.every((b) => near(b.current, 0, 1e-9)), "series: one out, all out");
expect(near(solve("parallel2", ["A"]).bulbs[1]!.brightness, 1, 1e-9), "parallel: one out, the other unchanged");
expect(near(solve("parallel3").battery, 3 * single, 1e-9), "parallel of three: three times the current from the battery");
expect(near(solve("mixed").bulbs[0]!.brightness, 4 / 9, 1e-9), "mixed: the first bulb at 4/9");
expect(near(SINGLE_POWER, 3, 1e-12), "one bulb: 3 W");

if (failures > 0) {
  console.log(`\n${failures} of ${checks} physics checks failed`);
  process.exit(1);
}
console.log(
  `physics checks passed (${checks} checks: ${flights} flights integrated against the exact parabola; ${pendulums} pendulums up to 170°, period to 1e-7 and energy over 100 swings; ${benches} lens positions with and without the card; ${circuits} circuits with every bulb in or out)`,
);
