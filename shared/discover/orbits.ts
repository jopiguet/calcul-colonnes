/**
 * The planets' orbits, from Kepler's laws.
 *
 * 1. Each planet moves on an ellipse with the Sun at one focus.
 * 2. The line Sun–planet sweeps equal areas in equal times: a planet is
 *    fastest at perihelion.
 * 3. The square of the period is proportional to the cube of the semi-major
 *    axis: in years and astronomical units, T = a^1.5.
 *
 * The model is geometric (Kepler's equation), and `npm run check:astronomy`
 * checks it against a direct integration of Newton's gravity. It also shows
 * Mars' retrograde loop: seen from the Earth, Mars backs up for a couple of
 * months when the Earth overtakes it.
 */
import { eccentricAnomaly } from "./seasons";

export interface Planet {
  name: "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn";
  /** Semi-major axis, astronomical units. */
  a: number;
  e: number;
  /** Longitude of the perihelion, degrees; and mean longitude at the start, degrees. */
  perihelion: number;
  start: number;
}

export const PLANETS: readonly Planet[] = [
  { name: "mercury", a: 0.387, e: 0.2056, perihelion: 77.5, start: 252.3 },
  { name: "venus", a: 0.723, e: 0.0068, perihelion: 131.6, start: 182.0 },
  { name: "earth", a: 1.0, e: 0.0167, perihelion: 102.9, start: 100.5 },
  { name: "mars", a: 1.524, e: 0.0934, perihelion: 336.1, start: 355.4 },
  { name: "jupiter", a: 5.203, e: 0.0484, perihelion: 14.3, start: 34.4 },
  { name: "saturn", a: 9.537, e: 0.0539, perihelion: 93.1, start: 50.1 },
];

export const planet = (name: Planet["name"]): Planet => PLANETS.find((p) => p.name === name)!;

/** Kepler's third law: the period in years. */
export const period = (a: number): number => a ** 1.5;

const rad = (deg: number): number => (deg * Math.PI) / 180;

/** GM of the Sun in AU³/year²: 4π². */
export const GM = 4 * Math.PI * Math.PI;

export interface Position {
  x: number;
  y: number;
  /** Distance to the Sun. */
  r: number;
}

/** Where a planet with semi-major axis a and eccentricity e is, t years after perihelion; perihelion along +x. */
export function positionAt(a: number, e: number, t: number, perihelion = 0): Position {
  const mean = (2 * Math.PI * t) / period(a);
  const E = eccentricAnomaly(((mean % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), e);
  const px = a * (Math.cos(E) - e);
  const py = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const w = rad(perihelion);
  return { x: px * Math.cos(w) - py * Math.sin(w), y: px * Math.sin(w) + py * Math.cos(w), r: a * (1 - e * Math.cos(E)) };
}

/** A planet of the table, t years from the start. */
export function planetAt(p: Planet, t: number): Position {
  const sincePerihelion = (((p.start - p.perihelion) / 360) * period(p.a)) + t;
  return positionAt(p.a, p.e, sincePerihelion, p.perihelion);
}

/** Speed (AU/year) from the vis-viva equation: v² = GM (2/r − 1/a). */
export const speedAt = (a: number, r: number): number => Math.sqrt(GM * (2 / r - 1 / a));

/** Area swept between two times (AU²), by summing thin triangles from the Sun. */
export function sweptArea(a: number, e: number, t0: number, t1: number, steps = 2000): number {
  let area = 0;
  let prev = positionAt(a, e, t0);
  for (let i = 1; i <= steps; i++) {
    const next = positionAt(a, e, t0 + ((t1 - t0) * i) / steps);
    area += (prev.x * next.y - prev.y * next.x) / 2;
    prev = next;
  }
  return area;
}

/** `count` equal-time sectors of one orbit: their corner points, for drawing. */
export function sectors(a: number, e: number, count: number, perSector = 24): Position[][] {
  const T = period(a);
  const out: Position[][] = [];
  for (let k = 0; k < count; k++) {
    const arc: Position[] = [];
    for (let i = 0; i <= perSector; i++) arc.push(positionAt(a, e, (T * (k + i / perSector)) / count));
    out.push(arc);
  }
  return out;
}

/** Direction of Mars seen from the Earth (degrees, along the ecliptic), t years from the start. */
export function marsFromEarth(t: number): number {
  const m = planetAt(planet("mars"), t);
  const e = planetAt(planet("earth"), t);
  return (((Math.atan2(m.y - e.y, m.x - e.x) * 180) / Math.PI) % 360 + 360) % 360;
}

/** Mars' direction from the Earth every `step` years over `years`: degrees, unwrapped so the curve is continuous. */
export function marsTrack(years: number, step = 1 / 365.25): { t: number; longitude: number }[] {
  const out: { t: number; longitude: number }[] = [];
  let last = marsFromEarth(0);
  let offset = 0;
  for (let t = 0; t <= years + 1e-9; t += step) {
    const l = marsFromEarth(t);
    if (l - last > 180) offset -= 360;
    if (l - last < -180) offset += 360;
    last = l;
    out.push({ t, longitude: l + offset });
  }
  return out;
}

/** The retrograde spells in a track: when the direction decreases. In days. */
export function retrogradeSpells(track: { t: number; longitude: number }[]): { start: number; days: number }[] {
  const out: { start: number; days: number }[] = [];
  let start: number | null = null;
  for (let i = 1; i < track.length; i++) {
    const back = track[i]!.longitude < track[i - 1]!.longitude;
    if (back && start === null) start = track[i - 1]!.t;
    if (!back && start !== null) {
      out.push({ start: start * 365.25, days: (track[i - 1]!.t - start) * 365.25 });
      start = null;
    }
  }
  return out;
}

/**
 * Newton's gravity, integrated (velocity Verlet), starting at perihelion:
 * the check that Kepler's ellipse is what gravity does.
 */
export function integrateOrbit(a: number, e: number, years: number, dt = 1e-5): { x: number; y: number; vx: number; vy: number } {
  let x = a * (1 - e);
  let y = 0;
  let vx = 0;
  let vy = speedAt(a, x);
  const accel = (px: number, py: number): [number, number] => {
    const r3 = Math.hypot(px, py) ** 3;
    return [(-GM * px) / r3, (-GM * py) / r3];
  };
  let [ax, ay] = accel(x, y);
  const steps = Math.round(years / dt);
  for (let i = 0; i < steps; i++) {
    vx += (ax * dt) / 2;
    vy += (ay * dt) / 2;
    x += vx * dt;
    y += vy * dt;
    [ax, ay] = accel(x, y);
    vx += (ax * dt) / 2;
    vy += (ay * dt) / 2;
  }
  return { x, y, vx, vy };
}
