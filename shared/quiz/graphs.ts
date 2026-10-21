/**
 * Reading graphs: which curve is f′, which curve has this formula, which
 * formula has this curve, which curve is f(x − c), the slope of a drawn
 * tangent, how many times a curve meets a level, which plane has this
 * equation. The app draws the curves (SVG); the generators give the functions.
 *
 * These test understanding where formulas test technique, and the wrong
 * options are still named mistakes: f taken for f′, the sign of the slope,
 * a shift in the wrong direction, a transformation along the other axis.
 */
import { frac, lines, numTex, poly, sum, type Coef, type Fn, type Frac } from "./tex";
import { tag, type Generator, type Graph, type Option } from "./types";

type Rng = Parameters<Generator>[0];

const X: [number, number] = [-4, 4];
const Y: [number, number] = [-4, 4];

const curves = (fns: Fn[], extra: Partial<Extract<Graph, { type: "curves" }>> = {}): Graph => ({
  type: "curves",
  x: X,
  y: Y,
  curves: fns.map((fn) => ({ fn })),
  ...extra,
});
/** An option drawn as a curve; its formula is shown in the corrections. */
const curveOption = (tex: string, fn: Fn): Option => ({ tex, fn, graph: curves([fn]) });
const numOption = (x: number | Frac): Option =>
  typeof x === "number" ? { tex: numTex(x), num: x } : { tex: numTex(x), num: x.n / x.d };
const val = (c: Coef): number => (typeof c === "number" ? c : c.n / c.d);

/** Polynomial from coefficients, highest degree first, as tex and function. */
const polyOf = (coefs: Coef[]): { tex: string; fn: Fn } => poly(coefs.map((c, i) => [c, coefs.length - 1 - i]));

// --------------------------------------------------------------- f and f′

/**
 * f with f′(x) = a(x − p)(x − q): a cubic whose turning points are at p and q,
 * shifted so that they sit inside the window.
 */
function cubicWithTurns(rng: Rng): { a: Frac; p: number; q: number; f: Coef[]; d: Coef[]; d2: Coef[]; F: Coef[] } {
  const p = rng.int(-3, 1);
  const q = p + rng.int(2, 3);
  const a = rng.pick([frac(1, 2), frac(-1, 2), frac(1, 3), frac(-1, 3)]);
  // f′ = a x² − a(p + q) x + a p q
  const d: Coef[] = [a, frac(-a.n * (p + q), a.d), frac(a.n * p * q, a.d)];
  // f = a/3 x³ − a(p + q)/2 x² + a p q x + c, with c centring the turning values.
  const raw: Coef[] = [frac(a.n, 3 * a.d), frac(-a.n * (p + q), 2 * a.d), frac(a.n * p * q, a.d), 0];
  const at = (x: number): number => raw.reduce<number>((s, c, i) => s + val(c) * x ** (3 - i), 0);
  const c = -Math.round((at(p) + at(q)) / 2);
  const f: Coef[] = [raw[0]!, raw[1]!, raw[2]!, c];
  const d2: Coef[] = [frac(2 * a.n, a.d), frac(-a.n * (p + q), a.d)];
  // A primitive of f, zero at 0 (the curve a student may take for f′).
  const F: Coef[] = [frac(a.n, 12 * a.d), frac(-a.n * (p + q), 6 * a.d), frac(a.n * p * q, 2 * a.d), c, 0];
  return { a, p, q, f, d, d2, F };
}

const derivativeCurve: Generator = (rng) => {
  const { p, q, f, d, d2, F } = cubicWithTurns(rng);
  const fp = polyOf(f);
  const dp = polyOf(d);
  const neg = polyOf(d.map((c) => (typeof c === "number" ? -c : frac(-c.n, c.d))));
  const opt = (name: string, poly: { tex: string; fn: Fn }) => curveOption(`${name} = ${poly.tex}`, poly.fn);
  return {
    prompt: { key: "derivativeCurve", tex: "", graph: curves([fp.fn]), id: `f=${fp.tex}` },
    correct: opt("y", dp),
    wrong: [
      tag(opt("y", neg), "signError"),
      tag(opt("y", fp), "givenCurveChosen"),
      tag(opt("y", polyOf(F)), "primitiveForDerivative"),
      tag(opt("y", polyOf(d2)), "derivativeOrder"),
    ],
    explanation: { key: "derivativeCurve", tex: `f'(${p}) = f'(${q}) = 0` },
    verify: { kind: "derivative", f: fp.fn },
  };
};

const primitiveCurve: Generator = (rng) => {
  // g = f′, a parabola; the question gives f(0) = c and asks for f.
  const { f, d } = cubicWithTurns(rng);
  const c = val(f[3]!);
  const g = polyOf(d);
  const F = polyOf(f);
  const dg = polyOf([frac(2 * (d[0] as Frac).n, (d[0] as Frac).d), d[1]!]);
  const delta = c === 0 ? 2 : -2 * Math.sign(c);
  const lifted = polyOf([...f.slice(0, 3), c + delta]);
  const opposite = polyOf([...f.slice(0, 3).map((x) => (typeof x === "number" ? -x : frac(-x.n, x.d))), c]);
  const opt = (poly: { tex: string; fn: Fn }) => curveOption(`y = ${poly.tex}`, poly.fn);
  return {
    prompt: { key: "primitiveCurve", tex: `f(0) = ${c}`, graph: curves([g.fn]), id: `g=${g.tex}` },
    correct: opt(F),
    wrong: [
      tag(opt(g), "givenCurveChosen"),
      tag(opt(dg), "derivedInstead"),
      tag(opt(opposite), "signError"),
      tag(opt(lifted), "initialConditionMisapplied"),
    ],
    explanation: { key: "primitiveCurve", tex: `f' = g, \\quad f(0) = ${c}` },
    verify: { kind: "ode", equation: (_y, dy, _d2, x) => dy - g.fn(x), y0: c },
  };
};

// ------------------------------------------------------- formula ↔ curve

/** (x − h) as tex: x - 2, x + 3, x. */
const shifted = (h: number): string => sum([[1, "x"], [-h, ""]]);
const wrapped = (h: number): string => (h === 0 ? "x" : `\\left(${shifted(h)}\\right)`);

const formulaToCurve: Generator = (rng) => {
  let h = rng.int(-2, 2);
  let k = rng.int(-2, 2);
  if (h === 0 && k === 0) h = 1;
  if (h === k) k = -k || 1;
  const a = rng.pick([1, -1, 2, -2, frac(1, 2), frac(-1, 2)]);
  const quad = (A: Coef, H: number, K: number): Option => {
    const tex = `y = ${sum([[A, `${wrapped(H)}^{2}`], [K, ""]])}`;
    return curveOption(tex, (x) => val(A) * (x - H) ** 2 + K);
  };
  const neg = typeof a === "number" ? -a : frac(-a.n, a.d);
  return {
    prompt: { key: "formulaToCurve", tex: `f(x) = ${sum([[a, `${wrapped(h)}^{2}`], [k, ""]])}` },
    correct: quad(a, h, k),
    wrong: [
      tag(quad(a, -h, k), "shiftDirection"),
      tag(quad(neg, h, k), "signError"),
      tag(quad(a, k, h), "orderSwapped"),
      tag(quad(a, h, -k), "signError"),
      tag(quad(a, -h, -k), "shiftDirection"),
    ],
    explanation: { key: "formulaToCurve", tex: `S\\left(${h},\\ ${k}\\right)` },
    verify: { kind: "identity", f: (x) => val(a) * (x - h) ** 2 + k },
  };
};

const formulaToCurveAdvanced: Generator = (rng) => {
  let h = rng.int(-2, 2);
  let k = rng.int(-2, 2);
  if (h === k) k = h === 0 ? 1 : -k;
  const family = rng.pick(["exp", "inverse"] as const);
  const formula = (H: number, K: number, s: 1 | -1): string => {
    const head = family === "exp" ? `e^{${shifted(H)}}` : `\\frac{1}{${shifted(H)}}`;
    return `${s < 0 ? "-" : ""}${head} ${K < 0 ? "-" : "+"} ${Math.abs(K)}`;
  };
  const fn = (H: number, K: number, s: 1 | -1): Fn => (family === "exp" ? (x) => s * Math.exp(x - H) + K : (x) => s / (x - H) + K);
  const make = (H: number, K: number, s: 1 | -1): Option => curveOption(`y = ${formula(H, K, s)}`, fn(H, K, s));
  return {
    prompt: { key: "formulaToCurve", tex: `f(x) = ${formula(h, k, 1)}` },
    correct: make(h, k, 1),
    wrong: [
      tag(make(-h, k, 1), "shiftDirection"),
      tag(make(h, k, -1), "signError"),
      tag(make(k, h, 1), "orderSwapped"),
      tag(make(h, -k, 1), "signError"),
    ],
    explanation: {
      key: "formulaToCurve",
      tex: family === "exp" ? `y = e^{x} \\ \\to \\ \\vec{v} = \\left(${h},\\ ${k}\\right)` : `x = ${h}, \\quad y = ${k}`,
    },
    verify: { kind: "identity", f: fn(h, k, 1) },
  };
};

const SLOPES: Frac[] = [frac(1), frac(-1), frac(2), frac(-2), frac(1, 2), frac(-1, 2), frac(3), frac(-3), frac(1, 3), frac(-1, 3)];

const curveToFormula: Generator = (rng) => {
  const m = rng.pick(SLOPES);
  let p = rng.int(-3, 3);
  if (p === val(m)) p = -p || 2;
  const line = (M: Coef, P: Coef): Option => ({ tex: `y = ${sum([[M, "x"], [P, ""]])}`, fn: (x) => val(M) * x + val(P) });
  // Two lattice points on the line, marked: (0, p) and one step of m.d further.
  const points = [
    { x: 0, y: p },
    { x: m.d, y: p + m.n },
  ];
  const wrong = [
    tag(line(frac(-m.n, m.d), p), "signError"),
    tag(line(m, -p), "signError"),
    tag(line(p, m), "orderSwapped"),
  ];
  if (Math.abs(m.n) !== Math.abs(m.d)) wrong.push(tag(line(frac(m.d, m.n), p), "invertedRatio"));
  return {
    prompt: { key: "curveToFormula", tex: "", graph: curves([(x) => val(m) * x + p], { points }), id: `${numTex(m)},${p}` },
    correct: line(m, p),
    wrong,
    explanation: { key: "curveToFormula", tex: `m = \\frac{\\Delta y}{\\Delta x} = \\frac{${m.n}}{${m.d}}, \\quad p = ${p}` },
    verify: { kind: "identity", f: (x) => val(m) * x + p },
  };
};

// --------------------------------------------------------- transformations

/** Base curves: not even, not odd, with features to follow. */
const BASES: { tex: string; fn: Fn }[] = [
  { tex: "3e^{-\\frac{(x - 1)^{2}}{2}} - 1", fn: (x) => 3 * Math.exp(-((x - 1) ** 2) / 2) - 1 },
  { tex: "\\frac{x^{3} - 4x}{4} + 1", fn: (x) => (x ** 3 - 4 * x) / 4 + 1 },
  { tex: "\\frac{4}{1 + e^{-x}} - 1", fn: (x) => 4 / (1 + Math.exp(-x)) - 1 },
];

type Transform = { tex: string; fn: (f: Fn) => Fn };

const transformCurve =
  (university: boolean): Generator =>
  (rng) => {
    const base = rng.pick(BASES);
    const f = base.fn;
    const c = rng.pick([1, 2, -1, -2]);
    const minus = (k: number): string => (k < 0 ? `+ ${-k}` : `- ${k}`);
    const plus = (k: number): string => (k < 0 ? `- ${-k}` : `+ ${k}`);
    const T = {
      right: { tex: `f(x ${minus(c)})`, fn: (g: Fn) => (x: number) => g(x - c) },
      left: { tex: `f(x ${plus(c)})`, fn: (g: Fn) => (x: number) => g(x + c) },
      up: { tex: `f(x) ${plus(c)}`, fn: (g: Fn) => (x: number) => g(x) + c },
      down: { tex: `f(x) ${minus(c)}`, fn: (g: Fn) => (x: number) => g(x) - c },
      negate: { tex: "-f(x)", fn: (g: Fn) => (x: number) => -g(x) },
      mirror: { tex: "f(-x)", fn: (g: Fn) => (x: number) => g(-x) },
      both: { tex: "-f(-x)", fn: (g: Fn) => (x: number) => -g(-x) },
      double: { tex: "2f(x)", fn: (g: Fn) => (x: number) => 2 * g(x) },
      squeeze: { tex: "f(2x)", fn: (g: Fn) => (x: number) => g(2 * x) },
      stretch: { tex: "f\\left(\\frac{x}{2}\\right)", fn: (g: Fn) => (x: number) => g(x / 2) },
      abs: { tex: "\\left|f(x)\\right|", fn: (g: Fn) => (x: number) => Math.abs(g(x)) },
      absIn: { tex: "f\\left(|x|\\right)", fn: (g: Fn) => (x: number) => g(Math.abs(x)) },
    } satisfies Record<string, Transform>;
    type Name = keyof typeof T;
    // The transformation asked, and the classic wrong readings of it.
    const cases: [Name, [Name, Parameters<typeof tag>[1]][]][] = [
      ["right", [["left", "shiftDirection"], ["down", "axisConfused"], ["up", "axisConfused"]]],
      ["up", [["down", "signError"], ["left", "axisConfused"], ["right", "axisConfused"]]],
      ["negate", [["mirror", "axisConfused"], ["both", "axisConfused"], ["abs", "signError"]]],
      ["mirror", [["negate", "axisConfused"], ["both", "signError"], ["absIn", "axisConfused"]]],
    ];
    if (university) {
      cases.push(
        ["squeeze", [["stretch", "invertedRatio"], ["double", "axisConfused"], ["right", "wrongFactor"]]],
        ["double", [["squeeze", "axisConfused"], ["stretch", "axisConfused"], ["up", "wrongFactor"]]],
        ["abs", [["absIn", "axisConfused"], ["negate", "signError"], ["mirror", "axisConfused"]]],
      );
    }
    const [asked, wrongs] = rng.pick(cases);
    const option = (name: Name): Option => curveOption(`g(x) = ${T[name].tex}`, T[name].fn(f));
    return {
      prompt: { key: "transformCurve", tex: `g(x) = ${T[asked].tex}`, graph: curves([f]), id: base.tex },
      correct: option(asked),
      wrong: wrongs.map(([name, mistake]) => tag(option(name), mistake)),
      explanation: { key: "transformCurve", tex: `f(x) = ${base.tex}` },
      verify: { kind: "identity", f: T[asked].fn(f) },
    };
  };

// ---------------------------------------------------------- reading values

const tangentSlope: Generator = (rng) => {
  const a = rng.int(-2, 2);
  const b = rng.int(-2, 2);
  const m = rng.pick([frac(1), frac(-1), frac(2), frac(-2), frac(1, 2), frac(-1, 2)]);
  const alpha = rng.pick([frac(1, 2), frac(-1, 2), frac(1), frac(-1)]);
  const mv = m.n / m.d;
  const f: Fn = (x) => val(alpha) * (x - a) ** 2 + mv * (x - a) + b;
  const tangent: Fn = (x) => mv * (x - a) + b;
  const intercept = b - mv * a;
  const wrong = [
    tag(numOption(frac(-m.n, m.d)), "signError"),
    tag(numOption(b), "tangentRolesSwapped"),
    tag(numOption(intercept), "interceptForSlope"),
  ];
  if (Math.abs(m.n) !== Math.abs(m.d)) wrong.push(tag(numOption(frac(m.d, m.n)), "invertedRatio"));
  return {
    prompt: {
      key: "tangentSlope",
      tex: `a = ${a}`,
      graph: {
        type: "curves",
        x: X,
        y: Y,
        curves: [{ fn: f }, { fn: tangent, style: "guide" }],
        points: [
          { x: a, y: b, label: "A" },
          { x: a + m.d, y: b + m.n },
        ],
      },
      id: `${a},${b},${numTex(m)},${numTex(alpha)}`,
    },
    correct: numOption(m),
    wrong,
    explanation: { key: "tangentSlope", tex: `f'(${a}) = \\frac{\\Delta y}{\\Delta x} = \\frac{${m.n}}{${m.d}}` },
    verify: { kind: "slope", f, a },
  };
};

const solutionCount: Generator = (rng) => {
  // A cubic with turning points p < q, and a level k that crosses it cleanly:
  // well away from both turning values and from the ends of [−4, 4].
  for (;;) {
    const { p, q, f } = cubicWithTurns(rng);
    const fn = polyOf(f).fn;
    const k = rng.int(-3, 3);
    if ([p, q, -4, 4].some((x) => Math.abs(fn(x) - k) < 0.4)) continue;
    const xs = Array.from({ length: 801 }, (_, i) => -4 + i / 100);
    const crossings = (level: number): number =>
      xs.filter((x, i) => i > 0 && Math.sign(fn(x) - level) !== Math.sign(fn(xs[i - 1]!) - level)).length;
    const count = crossings(k);
    const wrong = [
      tag(numOption(count + 1), "countingError"),
      tag(numOption(count + 2), "countingError"),
      tag(numOption(crossings(0)), "solvingError"),
    ];
    if (count > 0) wrong.push(tag(numOption(count - 1), "missingSolution"));
    return {
      prompt: {
        key: "solutionCount",
        tex: lines(`f(x) = ${k}`, `x \\in [-4,\\ 4]`),
        graph: { type: "curves", x: X, y: Y, curves: [{ fn }, { fn: () => k, style: "guide" }] },
        id: `${polyOf(f).tex}|${k}`,
      },
      correct: numOption(count),
      wrong,
      explanation: { key: "solutionCount", tex: `y = ${k}` },
      verify: { kind: "count", f: fn, k, lo: -4, hi: 4 },
    };
  }
};

// ----------------------------------------------------------------- planes

const planeFromEquation: Generator = (rng) => {
  // Intercepts whose least common multiple is small, so that every option fits the same axes.
  const [p, q, r] = rng.shuffle(rng.pick([[1, 2, 3], [1, 2, 6], [1, 3, 6], [2, 3, 6], [1, 2, 4], [1, 4, 4], [2, 2, 1]])) as [number, number, number];
  const lcm = (a: number, b: number): number => {
    const g = (x: number, y: number): number => (y === 0 ? x : g(y, x % y));
    return (a * b) / g(a, b);
  };
  const L = lcm(lcm(p, q), r);
  const [A, B, C] = [L / p, L / q, L / r];
  const candidates: [number, number, number, Parameters<typeof tag>[1] | null][] = [
    [p, q, r, null],
    [A, B, C, "coefficientsAsIntercepts"],
    [q, p, r, "orderSwapped"],
    [r, q, p, "orderSwapped"],
    [p, q, -r, "signError"],
  ];
  const extent = Math.max(...candidates.flatMap(([u, v, w]) => [u, v, w].map(Math.abs)));
  const option = (u: number, v: number, w: number): Option => ({
    tex: `\\left(${u},\\ 0,\\ 0\\right),\\ \\left(0,\\ ${v},\\ 0\\right),\\ \\left(0,\\ 0,\\ ${w}\\right)`,
    set: [1 / u, 1 / v, 1 / w, -1],
    graph: { type: "plane", intercepts: [u, v, w], extent },
  });
  const [, ...wrong] = candidates.map(([u, v, w, mistake]) => (mistake ? tag(option(u, v, w), mistake) : option(u, v, w)));
  return {
    prompt: { key: "planeFromEquation", tex: `${sum([[A, "x"], [B, "y"], [C, "z"]])} = ${L}` },
    correct: option(p, q, r),
    wrong,
    explanation: { key: "planeFromEquation", tex: `x = ${L} / ${A} = ${p}, \\quad y = ${L} / ${B} = ${q}, \\quad z = ${L} / ${C} = ${r}` },
    verify: { kind: "plane", normal: [A, B, C], point: [p, 0, 0] },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const graphs = {
  school: {
    derivativeCurve,
    formulaToCurve,
    curveToFormula,
    transformCurve: transformCurve(false),
    tangentSlope,
    solutionCount,
    planeFromEquation,
  },
  university: {
    derivativeCurve,
    primitiveCurve,
    formulaToCurveAdvanced,
    transformCurveAdvanced: transformCurve(true),
    tangentSlope,
    solutionCount,
    planeFromEquation,
  },
};
