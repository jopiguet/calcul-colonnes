/**
 * The Moon's phases, from the positions of the Sun, the Earth and the Moon.
 *
 * Seen from above the Earth's north pole, the Sun far away on one side, the
 * Moon goes round the Earth in a synodic month. Its elongation φ is the angle
 * Sun–Earth–Moon: 0° at new moon, 180° at full moon. Half the Moon is always
 * lit; from the Earth we see a part of that half, the illuminated fraction
 * (1 − cos φ)/2. `npm run check:astronomy` checks that formula against a
 * direct integration over the Moon's visible face, and that the Earth's
 * shadow reaches the Moon only near φ = 180°.
 */

/** From one new moon to the next, days. */
export const SYNODIC = 29.530589;

export const EARTH_RADIUS = 6371; // km
export const MOON_RADIUS = 1737; // km
export const MOON_DISTANCE = 384_400; // km, mean
export const SUN_RADIUS = 696_000; // km
export const SUN_DISTANCE = 149_598_000; // km, mean

/** The eight named phases, by elongation. */
export const PHASES = ["new", "waxingCrescent", "firstQuarter", "waxingGibbous", "full", "waningGibbous", "lastQuarter", "waningCrescent"] as const;
export type Phase = (typeof PHASES)[number];

const rad = (deg: number): number => (deg * Math.PI) / 180;

/** Elongation (degrees, 0 to 360) after `day` days from new moon. */
export const elongation = (day: number): number => (((360 * day) / SYNODIC) % 360 + 360) % 360;

/** Share of the Moon's visible disc that is lit. */
export const illuminated = (phi: number): number => (1 - Math.cos(rad(phi))) / 2;

/** The phase's name: the nearest of the eight, each 45° wide. */
export const phaseOf = (phi: number): Phase => PHASES[Math.round((((phi % 360) + 360) % 360) / 45) % 8]!;

/** Waxing (growing) from new to full moon. */
export const waxing = (phi: number): boolean => (((phi % 360) + 360) % 360) < 180;

/** About when the Moon rises, in hours of the day: 6 h at new moon, 18 h at full moon. */
export const riseHour = (phi: number): number => (6 + (((phi % 360) + 360) % 360) / 15) % 24;

/**
 * The lit share of the visible disc, by integrating over the Moon's surface:
 * each surface element counts by its area projected towards the Earth, when
 * the Earth sees it and the Sun lights it. The Sun's direction is +x; the
 * Moon's direction from the Earth makes the angle φ with it.
 */
export function illuminatedByIntegration(phi: number, steps = 600): number {
  const toEarth: [number, number, number] = [-Math.cos(rad(phi)), -Math.sin(rad(phi)), 0];
  let lit = 0;
  let seen = 0;
  for (let i = 0; i < steps; i++) {
    const theta = (Math.PI * (i + 0.5)) / steps; // from the pole
    for (let j = 0; j < 2 * steps; j++) {
      const lon = (Math.PI * (j + 0.5)) / steps;
      const n = [Math.sin(theta) * Math.cos(lon), Math.sin(theta) * Math.sin(lon), Math.cos(theta)];
      const facing = n[0]! * toEarth[0] + n[1]! * toEarth[1] + n[2]! * toEarth[2];
      if (facing <= 0) continue;
      const weight = facing * Math.sin(theta); // projected area of the element
      seen += weight;
      if (n[0]! > 0) lit += weight; // lit by the Sun, in direction +x
    }
  }
  return lit / seen;
}

/** The Earth's shadow at the Moon's distance: umbra and penumbra radii, km. */
export function shadowAt(distance = MOON_DISTANCE): { umbra: number; penumbra: number } {
  return {
    umbra: EARTH_RADIUS - (distance * (SUN_RADIUS - EARTH_RADIUS)) / SUN_DISTANCE,
    penumbra: EARTH_RADIUS + (distance * (SUN_RADIUS + EARTH_RADIUS)) / SUN_DISTANCE,
  };
}

/**
 * How much of the Earth's shadow the Moon is in, at elongation φ and
 * ecliptic latitude β (degrees; 0 for an orbit in the Earth's plane).
 */
export function inShadow(phi: number, beta = 0, distance = MOON_DISTANCE): "none" | "penumbral" | "partial" | "total" {
  // The shadow points away from the Sun: its axis is at elongation 180°.
  const fromAxis = Math.acos(Math.max(-1, Math.min(1, -Math.cos(rad(phi)) * Math.cos(rad(beta)))));
  if (fromAxis > Math.PI / 2) return "none";
  const offset = distance * Math.sin(fromAxis);
  const { umbra, penumbra } = shadowAt(distance);
  if (offset + MOON_RADIUS <= umbra) return "total";
  if (offset - MOON_RADIUS < umbra) return "partial";
  if (offset - MOON_RADIUS < penumbra) return "penumbral";
  return "none";
}
