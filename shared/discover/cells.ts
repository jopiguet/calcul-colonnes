/**
 * Why cells are small: surface against volume, and diffusion.
 *
 * A cube of side s has surface 6s² and volume s³: the ratio 6/s halves when
 * the side doubles. Everything a cell takes in or gets rid of crosses its
 * surface, and everything inside needs it. Inside, molecules move by
 * diffusion: a random walk, whose typical distance grows as √(2Dt), so the
 * time to cross a distance L grows as L². `npm run check:biology` checks the
 * ratio by counting unit faces, and the diffusion law with seeded random walks.
 */
import { createRng } from "../quiz/rng";

/** Oxygen in water at 25 °C, m²/s. */
export const D_OXYGEN = 2.1e-9;

export const surface = (side: number): number => 6 * side * side;
export const volume = (side: number): number => side ** 3;
export const ratio = (side: number): number => surface(side) / volume(side);

/** A cube of side L cut into n × n × n small cubes: total surface, same volume. */
export const splitSurface = (side: number, n: number): number => n ** 3 * surface(side / n);

/** Time for a molecule to diffuse a distance x in one direction (mean square displacement 2Dt = x²), s. */
export const diffusionTime = (distance: number, D = D_OXYGEN): number => (distance * distance) / (2 * D);

/** Surface of a block of unit cubes, by counting exposed faces: the check for 6s². */
export function exposedFaces(n: number): number {
  let faces = 0;
  const inside = (x: number, y: number, z: number): boolean => x >= 0 && y >= 0 && z >= 0 && x < n && y < n && z < n;
  for (let x = 0; x < n; x++)
    for (let y = 0; y < n; y++)
      for (let z = 0; z < n; z++)
        for (const [dx, dy, dz] of [
          [1, 0, 0],
          [-1, 0, 0],
          [0, 1, 0],
          [0, -1, 0],
          [0, 0, 1],
          [0, 0, -1],
        ] as const)
          if (!inside(x + dx, y + dy, z + dz)) faces++;
  return faces;
}

/**
 * Seeded random walks in one dimension: `walkers` walkers take `steps` steps
 * of ±1; returns the mean square displacement after each step count in `at`.
 */
export function randomWalk(seed: number, walkers: number, steps: number, at: number[]): number[] {
  const rng = createRng(seed);
  const pos = new Float64Array(walkers);
  const out: number[] = [];
  let k = 0;
  for (let s = 1; s <= steps; s++) {
    for (let w = 0; w < walkers; w++) pos[w]! += rng.next() < 0.5 ? -1 : 1;
    if (s === at[k]) {
      let sum = 0;
      for (let w = 0; w < walkers; w++) sum += pos[w]! * pos[w]!;
      out.push(sum / walkers);
      k++;
    }
  }
  return out;
}

/** A readable duration: seconds to years. Returns [value, unit]. */
export function duration(seconds: number): [number, "ms" | "s" | "min" | "h" | "d" | "y"] {
  if (seconds < 1) return [seconds * 1000, "ms"];
  if (seconds < 120) return [seconds, "s"];
  if (seconds < 7200) return [seconds / 60, "min"];
  if (seconds < 172_800) return [seconds / 3600, "h"];
  if (seconds < 3 * 365.25 * 86400) return [seconds / 86400, "d"];
  return [seconds / (365.25 * 86400), "y"];
}
