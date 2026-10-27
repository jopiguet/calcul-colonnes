/**
 * The fractal labs' mathematics (docs/discover.md#mathematical-curiosities):
 * the Koch snowflake, the Mandelbrot set and the chaos game. Pure functions;
 * `npm run check:math` checks them against their closed forms.
 */
import { createRng } from "../quiz/rng";

export type Point = [number, number];

// ------------------------------------------------------------------ Koch

/** The snowflake after n steps, from a triangle of side 1: its corners in order (3·4ⁿ of them). */
export function kochSnowflake(n: number): Point[] {
  const h = Math.sqrt(3) / 2;
  // Clockwise in screen coordinates (y down), so the bumps point outwards.
  let pts: Point[] = [
    [0, 0],
    [1, 0],
    [0.5, h],
  ];
  for (let s = 0; s < n; s++) {
    const next: Point[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i]!;
      const [bx, by] = pts[(i + 1) % pts.length]!;
      const dx = (bx - ax) / 3;
      const dy = (by - ay) / 3;
      const p1: Point = [ax + dx, ay + dy];
      const p2: Point = [ax + 2 * dx, ay + 2 * dy];
      // The bump: the middle third turned by 60°, outwards (to the left of a→b with y down… the side away from the inside).
      const peak: Point = [p1[0] + dx * 0.5 + dy * h, p1[1] + dy * 0.5 - dx * h];
      next.push([ax, ay], p1, peak, p2);
    }
    pts = next;
  }
  return pts;
}

/** Facts of step n, for a triangle of side 1. */
export function kochFacts(n: number): { segments: number; side: number; perimeter: number; area: number; areaRatio: number } {
  const a0 = Math.sqrt(3) / 4;
  const segments = 3 * 4 ** n;
  const side = 3 ** -n;
  const areaRatio = 1 + (3 / 5) * (1 - (4 / 9) ** n);
  return { segments, side, perimeter: segments * side, area: a0 * areaRatio, areaRatio };
}

/** The limit: 8/5 of the triangle. */
export const KOCH_AREA_LIMIT = 8 / 5;
/** log 4 / log 3: between a line (1) and a surface (2). */
export const KOCH_DIMENSION = Math.log(4) / Math.log(3);

/** The perimeter of a closed polygon. */
export function perimeter(pts: Point[]): number {
  let p = 0;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i]!;
    const [bx, by] = pts[(i + 1) % pts.length]!;
    p += Math.hypot(bx - ax, by - ay);
  }
  return p;
}

/** The area of a simple polygon (shoelace). */
export function polygonArea(pts: Point[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i]!;
    const [bx, by] = pts[(i + 1) % pts.length]!;
    s += ax * by - bx * ay;
  }
  return Math.abs(s) / 2;
}

/**
 * The length of the snowflake measured with a ruler of 3⁻ᵏ (the limit curve):
 * 3·4ᵏ steps. A coastline's length depends on the ruler.
 */
export function rulerLength(k: number): { steps: number; ruler: number; length: number } {
  const steps = 3 * 4 ** k;
  const ruler = 3 ** -k;
  return { steps, ruler, length: steps * ruler };
}

// ------------------------------------------------------------------ Mandelbrot

/** Once |z| > 2, z escapes to infinity: the escape radius. */
export const ESCAPE = 2;

/**
 * Iterations of z → z² + c from z = 0 until |z| > 2; `max` if it never
 * escapes within `max` (counted as in the set).
 */
export function escapeTime(cr: number, ci: number, max: number): number {
  let x = 0;
  let y = 0;
  for (let n = 0; n < max; n++) {
    const x2 = x * x;
    const y2 = y * y;
    if (x2 + y2 > ESCAPE * ESCAPE) return n;
    y = 2 * x * y + ci;
    x = x2 - y2 + cr;
  }
  return max;
}

/** The first values of z, from z₀ = 0: what the learner follows. Stops once escaped (that value included). */
export function orbit(cr: number, ci: number, count: number): Point[] {
  const out: Point[] = [[0, 0]];
  let [x, y] = [0, 0];
  for (let n = 0; n < count; n++) {
    [x, y] = [x * x - y * y + cr, 2 * x * y + ci];
    out.push([x, y]);
    if (x * x + y * y > ESCAPE * ESCAPE || !Number.isFinite(x)) break;
  }
  return out;
}

/** The orbit's long-run behaviour: escapes (after n steps), or ends in a cycle of period p, or neither seen within the limit. */
export function fate(cr: number, ci: number, max = 2000): { kind: "escapes"; steps: number } | { kind: "cycle"; period: number } | { kind: "bounded" } {
  const n = escapeTime(cr, ci, max);
  if (n < max) return { kind: "escapes", steps: n };
  // Run on, then look for the smallest period with a tolerance.
  let [x, y] = [0, 0];
  for (let i = 0; i < max; i++) [x, y] = [x * x - y * y + cr, 2 * x * y + ci];
  const seen: Point[] = [[x, y]];
  for (let p = 1; p <= 64; p++) {
    [x, y] = [x * x - y * y + cr, 2 * x * y + ci];
    if (Math.hypot(x - seen[0]![0], y - seen[0]![1]) < 1e-6) return { kind: "cycle", period: p };
    seen.push([x, y]);
  }
  return { kind: "bounded" };
}

/** Iterations worth computing at a zoom (the edge needs more as one zooms in). */
export const iterationsFor = (scale: number): number => Math.min(3000, Math.round(80 + 60 * Math.log2(Math.max(1, 3 / scale))));

/** The view at the start: the whole set. `scale` is the width of the picture in the plane. */
export const MANDELBROT_HOME = { cx: -0.6, cy: 0, scale: 3.2 };

/** Points worth following, with what they do. */
export const MANDELBROT_POINTS: { re: number; im: number }[] = [
  { re: -1, im: 0 },
  { re: 0.25, im: 0 },
  { re: 0.26, im: 0 },
  { re: 1, im: 0 },
  { re: 0, im: 1 },
  { re: -0.75, im: 0.1 },
];

// ------------------------------------------------------------------ chaos game

export type ChaosShape = "triangle" | "square" | "squareNoRepeat" | "pentagon";

/** The corners, in a unit box, y down, and the fraction of the way each jump goes. */
export function chaosCorners(shape: ChaosShape): { corners: Point[]; fraction: number } {
  if (shape === "triangle") {
    const h = Math.sqrt(3) / 2;
    return {
      corners: [
        [0.5, 0.5 - h / 2],
        [0, 0.5 + h / 2],
        [1, 0.5 + h / 2],
      ],
      fraction: 0.5,
    };
  }
  if (shape === "pentagon") {
    const corners: Point[] = Array.from({ length: 5 }, (_, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / 5;
      return [0.5 + 0.5 * Math.cos(a), 0.53 + 0.5 * Math.sin(a)] as Point;
    });
    // 1 − 1/φ²… the jump that makes five copies just touch: r = 1 / (1 + φ), the fraction 1 − r.
    const phi = (1 + Math.sqrt(5)) / 2;
    return { corners, fraction: 1 - 1 / (1 + phi) };
  }
  return {
    corners: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    fraction: 0.5,
  };
}

export interface ChaosGame {
  shape: ChaosShape;
  seed: number;
  /** The dots so far, x and y interleaved. */
  xs: number[];
  ys: number[];
  /** The corners picked, in order (for the first moves' lines). */
  picks: number[];
}

/** Where the dot starts: anywhere, even outside the shape. */
export const CHAOS_START: Point = [0.15, 0.1];

/** The dots of a game: `count` jumps from the start, from its own seeded sequence. */
export function playChaos(shape: ChaosShape, seed: number, count: number): ChaosGame {
  const { corners, fraction } = chaosCorners(shape);
  const rng = createRng(seed * 7919 + shape.length);
  const xs: number[] = [];
  const ys: number[] = [];
  const picks: number[] = [];
  let [x, y] = CHAOS_START;
  let last = -1;
  for (let i = 0; i < count; i++) {
    let k = rng.int(0, corners.length - 1);
    if (shape === "squareNoRepeat") while (k === last) k = rng.int(0, corners.length - 1);
    last = k;
    const [cx, cy] = corners[k]!;
    x += (cx - x) * fraction;
    y += (cy - y) * fraction;
    xs.push(x);
    ys.push(y);
    picks.push(k);
  }
  return { shape, seed, xs, ys, picks };
}

/** Whether a point lies in the triangle's middle hole (the triangle of its sides' midpoints). */
export function inMiddleHole(x: number, y: number): boolean {
  const [a, b, c] = chaosCorners("triangle").corners as [Point, Point, Point];
  const mid = (p: Point, q: Point): Point => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  return inTriangle([x, y], mid(a, b), mid(b, c), mid(c, a));
}

export function inTriangle(p: Point, a: Point, b: Point, c: Point): boolean {
  const sign = (p1: Point, p2: Point, p3: Point): number => (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

/** Share of the grid's cells (n × n over the unit box) holding at least one dot, skipping the first jumps. */
export function filledShare(game: ChaosGame, n: number, skip = 20): number {
  const cells = new Set<number>();
  for (let i = skip; i < game.xs.length; i++) {
    const cx = Math.min(n - 1, Math.floor(game.xs[i]! * n));
    const cy = Math.min(n - 1, Math.floor(game.ys[i]! * n));
    if (cx >= 0 && cy >= 0) cells.add(cy * n + cx);
  }
  return cells.size / (n * n);
}

/** The Sierpinski triangle's dimension: three copies at half size. */
export const SIERPINSKI_DIMENSION = Math.log(3) / Math.log(2);
