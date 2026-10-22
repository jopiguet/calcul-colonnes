/**
 * A thin converging lens on an optical bench: an object (a lit arrow), the
 * lens at x = 0, and a screen. Distances in centimetres, light going from left
 * to right; the object stands at x = −d.
 *
 * The image comes from the thin lens equation, 1/d + 1/d′ = 1/f. The rays are
 * traced separately (a thin lens bends a ray by −y/f), and
 * `npm run check:physics` checks that the traced rays meet where the
 * equation puts the image.
 */

/** Half the lens's height: rays pass through it between −APERTURE and +APERTURE, cm. */
export const APERTURE = 2.5;

export interface Bench {
  /** Focal length, cm (positive: converging). */
  focal: number;
  /** Object distance in front of the lens, cm. */
  object: number;
  /** Object height, cm. */
  height: number;
  /** Screen distance behind the lens, cm. */
  screen: number;
  /** The top half of the lens covered by a card. */
  card: boolean;
}

export interface Image {
  /** Image distance behind the lens, cm; negative for a virtual image (in front of the lens). */
  distance: number;
  /** Magnification: negative when the image is upside down. */
  magnification: number;
  real: boolean;
}

/** The image by the thin lens equation; null when the object is at the focal point (image at infinity). */
export function image(b: Pick<Bench, "focal" | "object">): Image | null {
  if (Math.abs(b.object - b.focal) < 1e-9) return null;
  const distance = 1 / (1 / b.focal - 1 / b.object);
  return { distance, magnification: -distance / b.object, real: distance > 0 };
}

/** A ray: a point and a slope (dy/dx). */
export interface Ray {
  x: number;
  y: number;
  slope: number;
}

/** Height of a ray at abscissa x. */
export const heightAt = (r: Ray, x: number): number => r.y + r.slope * (x - r.x);

/**
 * A ray from the object's tip through the lens at height `at`: before the
 * lens, and after it, bent by the lens (slope − at/f). Null when the card
 * stops it.
 */
export function traceThrough(b: Bench, at: number): { before: Ray; after: Ray } | null {
  if (Math.abs(at) > APERTURE + 1e-12) return null;
  if (b.card && at > 0) return null;
  const before: Ray = { x: -b.object, y: b.height, slope: (at - b.height) / b.object };
  const after: Ray = { x: 0, y: at, slope: before.slope - at / b.focal };
  return { before, after };
}

/** Rays through `n` heights spread evenly over the lens; those the card stops are left out. */
export function bundle(b: Bench, n = 11): { at: number; before: Ray; after: Ray }[] {
  const rays: { at: number; before: Ray; after: Ray }[] = [];
  for (let i = 0; i < n; i++) {
    const at = -APERTURE + (2 * APERTURE * i) / (n - 1);
    const traced = traceThrough(b, at);
    if (traced) rays.push({ at, ...traced });
  }
  return rays;
}

/**
 * What the screen shows of the object's tip: where the light lands (the ray
 * through the centre of the open part of the lens), how far it spreads, and
 * how much of the light gets through.
 */
export function onScreen(b: Bench): { centre: number; blur: number; light: number } {
  const rays = bundle(b, 41);
  const hits = rays.map((r) => heightAt(r.after, b.screen));
  const top = Math.max(...hits);
  const bottom = Math.min(...hits);
  return { centre: (top + bottom) / 2, blur: top - bottom, light: rays.length / 41 };
}

/**
 * The spread of the tip's light on the screen, from the geometry of the
 * cone: the open aperture times |1 − screen/image|. Infinite when there is no
 * image.
 */
export function blurWidth(b: Bench): number {
  const i = image(b);
  const open = b.card ? APERTURE : 2 * APERTURE;
  if (!i) return open; // object at the focal point: the tip's rays leave parallel, as wide as the lens
  return open * Math.abs(1 - b.screen / i.distance);
}

/** Sharp enough to count as focused: the screen within 3 % of the image distance. */
export function isSharp(b: Bench): boolean {
  const i = image(b);
  return i !== null && i.real && Math.abs(b.screen - i.distance) <= 0.03 * i.distance;
}

/**
 * The three rays of a ray diagram, from the object's tip: parallel to the
 * axis, then through the far focal point; through the centre, undeviated;
 * through the near focal point, then parallel. Each given as the points it
 * passes through, up to `end` cm behind the lens.
 */
export function principalRays(b: Bench, end: number): [number, number][][] {
  const tip: [number, number] = [-b.object, b.height];
  const parallel: [number, number][] = [tip, [0, b.height], [end, b.height - (b.height / b.focal) * end]];
  const centre: [number, number][] = [tip, [0, 0], [end, (-b.height / b.object) * end]];
  // Through the near focal point F (x = −f), or coming from its direction when the object is inside f:
  // it meets the lens at height −hf/(d − f) and leaves parallel to the axis.
  const atLens = b.object === b.focal ? null : (-b.height * b.focal) / (b.object - b.focal);
  const rays = [parallel, centre];
  if (atLens !== null && Math.abs(atLens) < 40) rays.push([tip, [0, atLens], [end, atLens]]);
  return rays;
}
