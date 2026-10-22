/**
 * The seasons, from the Earth's tilted axis.
 *
 * The axis keeps its direction in space while the Earth goes round the Sun,
 * so for half the year the northern hemisphere leans towards the Sun: the Sun
 * stands higher at noon, days are longer, and each square metre receives more
 * sunlight. The Earth's distance to the Sun changes too, by about 3 %, but the
 * Earth is closest in early January, in the northern winter. With the tilt
 * set to zero, the model keeps the distance and loses the seasons: that is
 * what `npm run check:astronomy` shows.
 */

export const TILT = 23.44; // degrees
export const ECCENTRICITY = 0.0167;
/** Day of the year (from 1 January, 0-based) of the perihelion. */
export const PERIHELION_DAY = 3;
/** Longitude of the perihelion, measured from the March equinox, degrees. */
export const PERIHELION_LONGITUDE = 282.9;
/** Sunlight above the atmosphere at 1 astronomical unit, W/m². */
export const SOLAR_CONSTANT = 1361;
export const YEAR = 365.2422; // days

const rad = (deg: number): number => (deg * Math.PI) / 180;
const deg = (r: number): number => (r * 180) / Math.PI;

/** Solves Kepler's equation M = E − e·sin E for E (radians). */
export function eccentricAnomaly(mean: number, e: number): number {
  let E = e < 0.8 ? mean : Math.PI;
  for (let i = 0; i < 50; i++) {
    const step = (E - e * Math.sin(E) - mean) / (1 - e * Math.cos(E));
    E -= step;
    if (Math.abs(step) < 1e-14) break;
  }
  return E;
}

/** The true anomaly (radians) and the distance (in units of the mean distance), from the mean anomaly. */
export function onEllipse(mean: number, e: number): { trueAnomaly: number; distance: number } {
  const E = eccentricAnomaly(mean, e);
  const trueAnomaly = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  return { trueAnomaly, distance: 1 - e * Math.cos(E) };
}

export interface Sky {
  /** The Sun's longitude along the ecliptic from the March equinox, degrees. */
  longitude: number;
  /** Earth–Sun distance, astronomical units. */
  distance: number;
  /** The Sun's declination, degrees: + north of the equator. */
  declination: number;
}

/** Where the Sun is on day `day` of the year (0 = 1 January), for an axis tilted by `tilt`. */
export function sky(day: number, tilt = TILT, e = ECCENTRICITY): Sky {
  const mean = (2 * Math.PI * (day - PERIHELION_DAY)) / YEAR;
  const { trueAnomaly, distance } = onEllipse(mean, e);
  const longitude = (((deg(trueAnomaly) + PERIHELION_LONGITUDE) % 360) + 360) % 360;
  const declination = deg(Math.asin(Math.sin(rad(tilt)) * Math.sin(rad(longitude))));
  return { longitude, distance, declination };
}

/** The Sun's height above the horizon at noon, degrees (negative: it does not rise). */
export const noonHeight = (latitude: number, declination: number): number => 90 - Math.abs(latitude - declination);

/** Hours of daylight, from the hour angle of sunset: cos H₀ = −tan φ · tan δ. */
export function dayLength(latitude: number, declination: number): number {
  const c = -Math.tan(rad(latitude)) * Math.tan(rad(declination));
  if (c <= -1) return 24;
  if (c >= 1) return 0;
  return (2 * deg(Math.acos(c))) / 15;
}

/**
 * Sunlight received over a whole day on a square metre of flat ground (with
 * no atmosphere), averaged over 24 h, W/m²:
 * Q = S₀/π · (1/r²) · (H₀ sin φ sin δ + cos φ cos δ sin H₀).
 */
export function dailyInsolation(latitude: number, s: Sky): number {
  const phi = rad(latitude);
  const delta = rad(s.declination);
  const c = -Math.tan(phi) * Math.tan(delta);
  const H0 = c <= -1 ? Math.PI : c >= 1 ? 0 : Math.acos(c);
  return (SOLAR_CONSTANT / Math.PI / s.distance ** 2) * (H0 * Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.sin(H0));
}

/** The same, by summing the sunlight minute by minute over the day: the check for the formula. */
export function dailyInsolationBySum(latitude: number, s: Sky, steps = 1440): number {
  const phi = rad(latitude);
  const delta = rad(s.declination);
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    const h = -Math.PI + (2 * Math.PI * (i + 0.5)) / steps;
    const sinHeight = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(h);
    if (sinHeight > 0) sum += sinHeight;
  }
  return ((SOLAR_CONSTANT / s.distance ** 2) * sum) / steps;
}

/** The first day of each month, 0-based, in a common year. */
export const MONTH_STARTS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334] as const;

/** The day of the year of the 21st of a month (0-based month). */
export const day21 = (month: number): number => MONTH_STARTS[month]! + 20;
