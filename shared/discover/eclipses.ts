/**
 * Eclipses, from the Moon's tilted orbit.
 *
 * The Moon's orbit is tilted by about 5° to the Earth's. At most new moons
 * the Moon passes above or below the Sun, and at most full moons above or
 * below the Earth's shadow. An eclipse needs a new or full moon close to one
 * of the two nodes, where the orbits cross; the Sun comes back to a node
 * every half eclipse year, about 173 days, which gives two eclipse seasons a
 * year. The Moon's distance changes too (eccentricity 0.055): far from the
 * Earth it looks smaller than the Sun, and a central solar eclipse is
 * annular instead of total.
 */
import { EARTH_RADIUS, MOON_RADIUS, SUN_DISTANCE, SUN_RADIUS, SYNODIC, shadowAt } from "./moon";

/** Tilt of the Moon's orbit to the ecliptic, degrees. */
export const INCLINATION = 5.145;
/** From the Sun at a node to the Sun at the same node again, days. */
export const ECLIPSE_YEAR = 346.62;
/** From one perigee to the next, days. */
export const ANOMALISTIC = 27.55455;
export const MOON_SEMI_AXIS = 384_400; // km
export const MOON_ECCENTRICITY = 0.0549;

const rad = (deg: number): number => (deg * Math.PI) / 180;
const deg = (r: number): number => (r * 180) / Math.PI;

/** The Moon's latitude above the ecliptic, degrees, when it is `fromNode` degrees past its ascending node. */
export const latitude = (fromNode: number, inclination = INCLINATION): number => deg(Math.asin(Math.sin(rad(inclination)) * Math.sin(rad(fromNode))));

/** The Moon's distance (km) at its anomaly `M` (degrees from perigee, mean). */
export function moonDistance(meanAnomaly: number): number {
  // To first order in e: r = a(1 − e cos M); enough for the size of the disc.
  return MOON_SEMI_AXIS * (1 - MOON_ECCENTRICITY * Math.cos(rad(meanAnomaly)));
}

/** Apparent radii, in degrees, as seen from the Earth's centre. */
export const sunRadius = (): number => deg(Math.asin(SUN_RADIUS / SUN_DISTANCE));
export const moonRadius = (distance: number): number => deg(Math.asin(MOON_RADIUS / distance));
/** The Moon's horizontal parallax: how far the Moon shifts against the Sun between the Earth's centre and its edge, degrees. */
export const parallax = (distance: number): number => deg(Math.asin(EARTH_RADIUS / distance));

/**
 * A solar eclipse is seen somewhere on the Earth when the Moon's latitude is
 * under the sum of the two discs and the parallax: about 1.5° (it reaches
 * from 1.4° to 1.6° with the Moon's distance).
 */
export const solarLimit = (distance = MOON_SEMI_AXIS): number => sunRadius() + moonRadius(distance) + parallax(distance);

/** The Moon touches the Earth's umbra when its latitude is under this, degrees. */
export function lunarLimit(distance = MOON_SEMI_AXIS): number {
  return deg(Math.atan((shadowAt(distance).umbra + MOON_RADIUS) / distance));
}

/** Seen from the place under the Moon, the central kind: the Moon's disc covers the Sun's, or leaves a ring. */
export const centralKind = (distance: number): "total" | "annular" => (umbraWidth(distance) >= 0 ? "total" : "annular");

export interface Eclipse {
  kind: "solar" | "lunar";
  /** Days from the start of the run. */
  day: number;
  /** The Moon's latitude at that syzygy, degrees. */
  beta: number;
  /** Solar: total, annular or partial; lunar: total or partial. */
  type: "total" | "annular" | "partial";
}

export interface Syzygy {
  kind: "new" | "full";
  day: number;
  beta: number;
  /** Earth–Moon distance, km. */
  distance: number;
  eclipse: Eclipse | null;
}

/**
 * Every new and full moon over `days` days, starting with a new moon when
 * the Moon is `node` degrees past its ascending node and `anomaly` degrees
 * past its perigee, with the eclipse each makes, if any.
 */
export function syzygies(days: number, node = 0, anomaly = 0, inclination = INCLINATION): Syzygy[] {
  const out: Syzygy[] = [];
  // The Moon gains on the node one turn per draconic month; at successive
  // syzygies its argument from the node grows by 180° + the Sun's drift.
  const draconic = 1 / (1 / SYNODIC + 1 / ECLIPSE_YEAR); // 27.21 days
  for (let k = 0; k * (SYNODIC / 2) <= days; k++) {
    const day = (k * SYNODIC) / 2;
    const beta = latitude(node + (360 * day) / draconic, inclination);
    const distance = moonDistance(anomaly + (360 * day) / ANOMALISTIC);
    let eclipse: Eclipse | null = null;
    if (k % 2 === 0) {
      if (Math.abs(beta) < solarLimit(distance)) {
        // Central when the axis of the Moon's shadow meets the Earth.
        const central = Math.abs(beta) < parallax(distance);
        eclipse = { kind: "solar", day, beta, type: central ? centralKind(distance) : "partial" };
      }
    } else if (Math.abs(beta) < lunarLimit(distance)) {
      const total = Math.abs(beta) + moonRadius(distance) <= deg(Math.atan(shadowAt(distance).umbra / distance));
      eclipse = { kind: "lunar", day, beta, type: total ? "total" : "partial" };
    }
    out.push({ kind: k % 2 === 0 ? "new" : "full", day, beta, distance, eclipse });
  }
  return out;
}

/** The eclipses alone. */
export const eclipsesOver = (days: number, node = 0, anomaly = 0, inclination = INCLINATION): Eclipse[] =>
  syzygies(days, node, anomaly, inclination).flatMap((s) => (s.eclipse ? [s.eclipse] : []));

/**
 * The width of the strip where a central solar eclipse is total (km), with
 * the Moon straight overhead: the Moon's umbra where it meets the Earth.
 * Negative: the umbra ends before the Earth, the eclipse is annular.
 */
export function umbraWidth(distance: number): number {
  const toGround = distance - EARTH_RADIUS;
  // The Moon's umbra narrows by (R☉ − R☾)/D☉ per km behind the Moon.
  return 2 * (MOON_RADIUS - (toGround * (SUN_RADIUS - MOON_RADIUS)) / SUN_DISTANCE);
}
