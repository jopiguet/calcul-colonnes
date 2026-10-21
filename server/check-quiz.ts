/**
 * Checks the question generators over many seeds:
 *   - the marked answer is right, computed independently (numerical derivative,
 *     integral, limit, roots…), and no wrong option is also right;
 *   - four options with distinct LaTeX; every formula renders with KaTeX;
 *   - the same seed always gives the same test.
 *
 *   npm run check:quiz [-- seeds]
 */
import katex from "katex";
import { generateQuiz, LEVELS, MISTAKES, reviewCount, skillsFor, topicsFor, type Option, type Question } from "../shared/quiz/index.ts";

const SAMPLES = [0.37, 0.81, 1.3, 1.9, 2.6];
const near = (a: number, b: number, tol: number): boolean =>
  a === b || (Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b)));

function derivative(f: (x: number) => number, x: number): number {
  const h = 1e-5 * Math.max(1, Math.abs(x));
  return (f(x + h) - f(x - h)) / (2 * h);
}

function simpson(f: (x: number) => number, a: number, b: number, n = 2000): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** Whether an option is a right answer to the question, computed without the generator. */
function isRight(q: Question, o: Option): boolean {
  const v = q.verify;
  switch (v.kind) {
    case "derivative":
      return SAMPLES.every((x) => near(o.fn!(x), derivative(v.f, x), 1e-5));
    case "primitive":
      return SAMPLES.every((x) => near(derivative(o.fn!, x), v.f(x), 1e-5));
    case "identity":
      return SAMPLES.every((x) => near(o.fn!(x), v.f(x), 1e-9));
    case "integral":
      return near(o.num!, simpson(v.f, v.a, v.b), 1e-8);
    case "value":
      return near(o.num!, v.value, 1e-9);
    case "root":
      return Number.isFinite(o.num!) && Math.abs(v.f(o.num!)) < 1e-9;
    case "limit": {
      const y = v.f(v.probe);
      if (o.num === Infinity) return y > 1e5;
      if (o.num === -Infinity) return y < -1e5;
      return Math.abs(y - o.num!) <= 1e-3 * Math.max(1, Math.abs(o.num!));
    }
    case "solutions": {
      // All roots of f in [lo, hi[ by sign changes on a fine grid, refined by bisection.
      const roots: number[] = [];
      const n = 200_000;
      const step = (v.hi - v.lo) / n;
      for (let i = 0; i < n; i++) {
        let a = v.lo + i * step;
        let b = a + step;
        let fa = v.f(a);
        if (Math.abs(fa) < 1e-12) {
          roots.push(a);
          continue;
        }
        if (fa * v.f(b) >= 0) continue;
        for (let k = 0; k < 80; k++) {
          const m = (a + b) / 2;
          if (fa * v.f(m) <= 0) b = m;
          else [a, fa] = [m, v.f(m)];
        }
        roots.push((a + b) / 2);
      }
      // A root on a grid point is also seen by the next interval: merge near-duplicates.
      const unique = roots.filter((r, i) => i === 0 || Math.abs(r - roots[i - 1]!) > 1e-6);
      return unique.length === o.set!.length && unique.every((r, i) => near(r, o.set![i]!, 1e-7));
    }
    case "complex":
      return near(o.z![0], v.re, 1e-9) && near(o.z![1], v.im, 1e-9);
    case "complexRoots": {
      // Every number of the option is a root (Horner in ℂ), they are distinct, and there are as many as the degree.
      const zs = o.zs!;
      const isRoot = ([x, y]: [number, number]): boolean => {
        let re = 0;
        let im = 0;
        for (const c of v.coefficients) [re, im] = [re * x - im * y + c, re * y + im * x];
        return Math.hypot(re, im) < 1e-9;
      };
      const distinct = zs.every((z, i) => zs.every((w, j) => i === j || Math.hypot(z[0] - w[0], z[1] - w[1]) > 1e-9));
      return zs.length === v.coefficients.length - 1 && distinct && zs.every(isRoot);
    }
    case "ode": {
      // y′ and y″ by central differences; the equation's residual small at every sample, and the initial values.
      const f = o.fn!;
      const h = 1e-4;
      const d1 = (x: number): number => (f(x + h) - f(x - h)) / (2 * h);
      const d2 = (x: number): number => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
      const solves = SAMPLES.every((x) => {
        const scale = Math.max(1, Math.abs(f(x)), Math.abs(d1(x)), Math.abs(d2(x)));
        return Math.abs(v.equation(f(x), d1(x), d2(x), x)) <= 1e-4 * scale;
      });
      const start = Math.abs(f(0) - v.y0) < 1e-9 && (v.dy0 === undefined || Math.abs(d1(0) - v.dy0) < 1e-6 * Math.max(1, Math.abs(v.dy0)));
      return solves && start;
    }
    case "tangent": {
      // f(a) + f′(a)(x − a), with f′(a) by central difference.
      const slope = derivative(v.f, v.a);
      return SAMPLES.every((x) => near(o.fn!(x), v.f(v.a) + slope * (x - v.a), 1e-6));
    }
    case "asymptote":
      // A line (two points determine it) along which f − ℓ vanishes at ±∞.
      return [1e6, -1e6].every((x) => Math.abs(v.f(x) - o.fn!(x)) < 1e-4) && near(o.fn!(2) - o.fn!(1), o.fn!(1) - o.fn!(0), 1e-12);
    case "crossProduct": {
      const [a, b, c] = v.u as [number, number, number];
      const [d, e, f] = v.v as [number, number, number];
      return sameList(o.set!, [b * f - c * e, c * d - a * f, a * e - b * d]);
    }
    case "plane": {
      // (a, b, c) parallel to the normal (their cross product is zero), not zero, and the point on the plane.
      const [a, b, c, d] = o.set as [number, number, number, number];
      const [p, q, r] = v.normal as [number, number, number];
      const parallel = [b * r - c * q, c * p - a * r, a * q - b * p].every((x) => Math.abs(x) < 1e-9) && Math.hypot(a, b, c) > 0;
      const [x, y, z] = v.point as [number, number, number];
      return parallel && Math.abs(a * x + b * y + c * z + d) < 1e-9;
    }
    case "series": {
      // Partial sums S(N) and S(2N); a 1/N tail cancels in 2·S(2N) − S(N).
      const partial = (count: number): number => {
        let s = 0;
        for (let n = v.from; n < v.from + count; n++) s += v.term(n);
        return s;
      };
      return near(o.num!, 2 * partial(2 * v.terms) - partial(v.terms), 1e-6);
    }
    case "radius": {
      // |aₙ|^(1/n) at a large n, then R = (1 / that)^(1/power).
      const n = 1e7;
      return near(o.num!, Math.exp(-v.logCoef(n) / n) ** (1 / v.power), 1e-4);
    }
    case "partial": {
      const [p, q] = v.at;
      const h = 1e-5;
      const d = v.variable === "x" ? (v.f(p + h, q) - v.f(p - h, q)) / (2 * h) : (v.f(p, q + h) - v.f(p, q - h)) / (2 * h);
      return near(o.num!, d, 1e-6);
    }
    case "gradient": {
      const [p, q] = v.at;
      const h = 1e-5;
      return sameList(o.set!, [(v.f(p + h, q) - v.f(p - h, q)) / (2 * h), (v.f(p, q + h) - v.f(p, q - h)) / (2 * h)], 1e-6);
    }
    case "critical": {
      const [p, q] = o.set as [number, number];
      const h = 1e-5;
      return [(v.f(p + h, q) - v.f(p - h, q)) / (2 * h), (v.f(p, q + h) - v.f(p, q - h)) / (2 * h)].every((g) => Math.abs(g) < 1e-6);
    }
    case "doubleIntegral": {
      const [a, b] = v.x;
      const [c, d] = v.y;
      return near(o.num!, simpson((x) => simpson((y) => v.f(x, y), c, d, 40), a, b, 40), 1e-9);
    }
    case "determinant":
      return near(o.num!, det(v.a), 1e-9);
    case "rank":
      return o.num === rank(v.a);
    case "matrixProduct": {
      const ab = v.a.map((row) => v.b[0]!.map((_, j) => row.reduce((s, x, k) => s + x * v.b[k]![j]!, 0)));
      return sameList(o.set!, ab.flat());
    }
    case "matrixInverse": {
      const n = v.a.length;
      const m = (i: number, j: number): number => o.set![i * n + j]!;
      return o.set!.length === n * n && v.a.every((row, i) => row.every((_, j) => near(row.reduce((s, x, k) => s + x * m(k, j), 0), i === j ? 1 : 0, 1e-9)));
    }
    case "linearSolution":
      return o.set!.length === v.b.length && v.a.every((row, i) => near(row.reduce((s, x, k) => s + x * o.set![k]!, 0), v.b[i]!, 1e-9));
    case "eigenvalues": {
      // Each value λ makes A − λI singular, they are distinct and as many as the size (here, eigenvalues are simple).
      const n = v.a.length;
      const shifted = (l: number): number[][] => v.a.map((row, i) => row.map((x, j) => x - (i === j ? l : 0)));
      const values = o.set!;
      return values.length === n && new Set(values).size === n && values.every((l) => Math.abs(det(shifted(l))) < 1e-9 * Math.max(1, Math.abs(l) ** n));
    }
    case "complexRoot": {
      // zⁿ by repeated multiplication, against the target.
      const [x, y] = o.z!;
      let re = 1;
      let im = 0;
      for (let k = 0; k < v.n; k++) [re, im] = [re * x - im * y, re * y + im * x];
      return Math.hypot(re - v.re, im - v.im) < 1e-9 * Math.max(1, Math.hypot(v.re, v.im));
    }
  }
}

/** Determinant by Gaussian elimination with partial pivoting. */
function det(a: number[][]): number {
  const m = a.map((row) => [...row]);
  const n = m.length;
  let d = 1;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(m[r]![c]!) > Math.abs(m[p]![c]!)) p = r;
    if (Math.abs(m[p]![c]!) < 1e-12) return 0;
    if (p !== c) {
      [m[p], m[c]] = [m[c]!, m[p]!];
      d = -d;
    }
    d *= m[c]![c]!;
    for (let r = c + 1; r < n; r++) {
      const f = m[r]![c]! / m[c]![c]!;
      for (let k = c; k < n; k++) m[r]![k]! -= f * m[c]![k]!;
    }
  }
  return d;
}

/** Rank by Gaussian elimination. */
function rank(a: number[][]): number {
  const m = a.map((row) => [...row]);
  let r = 0;
  for (let c = 0; c < m[0]!.length && r < m.length; c++) {
    let p = r;
    for (let i = r + 1; i < m.length; i++) if (Math.abs(m[i]![c]!) > Math.abs(m[p]![c]!)) p = i;
    if (Math.abs(m[p]![c]!) < 1e-9) continue;
    [m[p], m[r]] = [m[r]!, m[p]!];
    for (let i = r + 1; i < m.length; i++) {
      const f = m[i]![c]! / m[r]![c]!;
      for (let k = c; k < m[0]!.length; k++) m[i]![k]! -= f * m[r]![k]!;
    }
    r++;
  }
  return r;
}

const sameList = (a: number[], b: number[], tol = 1e-9): boolean => a.length === b.length && a.every((x, i) => near(x, b[i]!, tol));

function render(tex: string, where: string): void {
  try {
    katex.renderToString(tex, { throwOnError: true });
  } catch (error) {
    throw new Error(`${where}: KaTeX cannot render ${JSON.stringify(tex)}: ${(error as Error).message}`);
  }
}

const seeds = Number(process.argv[2] ?? 400);
const failures: string[] = [];
const prompts = new Map<string, number>();
const mistakesSeen = new Map<string, number>();
let checked = 0;

for (const level of LEVELS) {
  for (let seed = 1; seed <= seeds; seed++) {
    // Every other test brings back three kinds of question, as for a player with mistakes to review.
    const topics = topicsFor(level);
    const kinds = skillsFor(level, topics);
    const focus = seed % 2 === 0 ? [0, 1, 2].map((k) => kinds[(seed * 7 + k * 13) % kinds.length]!) : [];
    const spec = { seed, level, topics, count: 20, focus: [...new Set(focus)] };
    const quiz = generateQuiz(spec);
    const reviews = quiz.filter((q) => q.review);
    if (reviews.length !== reviewCount(20, spec.focus) || reviews.some((q) => !spec.focus.includes(q.skill))) {
      failures.push(`${level} seed ${seed}: review questions do not match the focus`);
    }
    const again = generateQuiz(spec);
    if (JSON.stringify(quiz.map((q) => q.options.map((o) => o.tex))) !== JSON.stringify(again.map((q) => q.options.map((o) => o.tex)))) {
      failures.push(`${level} seed ${seed}: not deterministic`);
    }
    for (const q of quiz) {
      checked += 1;
      const where = `${level} seed ${seed} ${q.topic} ${q.prompt.tex}`;
      prompts.set(`${level}/${q.topic}/${q.prompt.key}`, (prompts.get(`${level}/${q.topic}/${q.prompt.key}`) ?? 0) + 1);
      try {
        if (q.options.length !== 4) throw new Error("not 4 options");
        if (new Set(q.options.map((o) => o.tex)).size !== 4) throw new Error("repeated option");
        render(q.prompt.tex, where);
        render(q.explanation.tex, where);
        q.options.forEach((o) => render(o.tex, where));
        q.options.forEach((o, i) => {
          const right = isRight(q, o);
          if (i === q.correct && !right) throw new Error(`marked answer is wrong: ${o.tex}`);
          if (i !== q.correct && right) throw new Error(`wrong option is also right: ${o.tex}`);
          if (i !== q.correct && !(MISTAKES as readonly string[]).includes(o.mistake ?? "")) {
            throw new Error(`wrong option without a mistake label: ${o.tex}`);
          }
          if (i !== q.correct) mistakesSeen.set(o.mistake!, (mistakesSeen.get(o.mistake!) ?? 0) + 1);
        });
      } catch (error) {
        failures.push(`${where}: ${(error as Error).message}`);
      }
    }
  }
}

for (const [key, n] of [...prompts].sort()) console.log(`${key.padEnd(40)} ${n}`);
const unused = MISTAKES.filter((m) => !mistakesSeen.has(m));
if (unused.length > 0) failures.push(`mistake types never shown: ${unused.join(", ")}`);
console.log(`\n${mistakesSeen.size} of ${MISTAKES.length} mistake types shown`);
console.log(`${checked} questions checked, ${failures.length} failures`);
for (const f of [...new Set(failures)].slice(0, 25)) console.log("  ✗", f);
process.exit(failures.length === 0 ? 0 : 1);
