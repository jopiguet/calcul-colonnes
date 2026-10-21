/**
 * Functions of two variables (university): a partial derivative at a point,
 * the gradient, the critical point of a quadratic, a double integral over a
 * rectangle.
 *
 * Every f is a polynomial Σ c·xⁱyʲ, so the generators work on its terms; the
 * check script differentiates and integrates numerically instead. Classic
 * mistakes: the other variable differentiated, terms without x kept, the
 * exponent not brought down, the cross term ignored, one integration skipped.
 */
import { add, frac, lines, numTex, pow, sum, type Frac } from "./tex";
import { tag, type Fn2, type Generator, type Option } from "./types";

/** c·xⁱyʲ. */
type Term = [c: number, i: number, j: number];

const polyTex = (terms: Term[]): string => sum(terms.map(([c, i, j]) => [c, pow(i, "x") + pow(j, "y")]));
const polyFn = (terms: Term[]): Fn2 => (x, y) => terms.reduce((s, [c, i, j]) => s + c * x ** i * y ** j, 0);
const numOption = (x: number): Option => ({ tex: numTex(x), num: x });
const pairOption = (a: number | Frac, b: number | Frac): Option => {
  const v = (f: number | Frac): number => (typeof f === "number" ? f : f.n / f.d);
  return { tex: `\\left(${numTex(a)},\\ ${numTex(b)}\\right)`, set: [v(a), v(b)] };
};
/** f(x, y) with its quadratic and linear parts on two rows: a phone has no room for five terms on one. */
function twoRows(terms: Term[]): string {
  const quadratic = `f(x, y) = ${polyTex(terms.filter(([, i, j]) => i + j === 2))}`;
  const linear = terms.filter(([c, i, j]) => i + j < 2 && c !== 0);
  if (linear.length === 0) return quadratic;
  const rest = polyTex(linear);
  return lines(quadratic, rest.startsWith("-") ? rest : `+ ${rest}`);
}
const pointTex = (p: number, q: number): string => `\\left(${p},\\ ${q}\\right)`;

/** ∂/∂x of the terms (j = 0 terms vanish), or with the classic mistakes. */
function dx(terms: Term[], mistake?: "constantKept" | "coefficientMissing"): Term[] {
  return terms.flatMap(([c, i, j]): Term[] => {
    if (i === 0) return mistake === "constantKept" ? [[c, 0, j]] : [];
    return [[mistake === "coefficientMissing" ? c : c * i, i - 1, j]];
  });
}
const swap = (terms: Term[]): Term[] => terms.map(([c, i, j]) => [c, j, i]);
const dy = (terms: Term[], mistake?: "constantKept" | "coefficientMissing"): Term[] => swap(dx(swap(terms), mistake));

/** A polynomial in x and y with an x-only, a y-only and a mixed term at least. */
function randomPoly(rng: Parameters<Generator>[0]): Term[] {
  const shapes: [number, number][] = [
    [2, 1],
    [1, 2],
    [1, 1],
    [2, 0],
    [3, 0],
    [0, 2],
    [0, 3],
    [1, 0],
    [0, 1],
  ];
  const mixed = rng.pick(shapes.slice(0, 3));
  const xOnly = rng.pick(shapes.filter(([i, j]) => i > 0 && j === 0));
  const yOnly = rng.pick(shapes.filter(([i, j]) => i === 0 && j > 0));
  return [mixed, xOnly, yOnly].map(([i, j]): Term => [rng.nonZero(-3, 3), i, j]);
}

const partialDerivative: Generator = (rng) => {
  const terms = randomPoly(rng);
  const variable = rng.pick(["x", "y"] as const);
  const p = rng.nonZero(-2, 2);
  const q = rng.nonZero(-2, 2);
  const [d, other] = variable === "x" ? [dx, dy] : [dy, dx];
  const at = (t: Term[]): Option => numOption(polyFn(t)(p, q));
  return {
    prompt: { key: "partialDerivative", tex: lines(`f(x, y) = ${polyTex(terms)}`, `\\frac{\\partial f}{\\partial ${variable}}${pointTex(p, q)}`) },
    correct: at(d(terms)),
    wrong: [
      tag(at(other(terms)), "variableConfused"),
      tag(at(d(terms, "constantKept")), "constantKept"),
      tag(at(d(terms, "coefficientMissing")), "coefficientMissing"),
      tag(at(terms), "termDropped"),
    ],
    explanation: { key: "partialDerivative", tex: `\\frac{\\partial f}{\\partial ${variable}} = ${polyTex(d(terms))}` },
    verify: { kind: "partial", f: polyFn(terms), at: [p, q], variable },
  };
};

const gradient: Generator = (rng) => {
  const terms = randomPoly(rng);
  const p = rng.nonZero(-2, 2);
  let q = rng.nonZero(-2, 2);
  if (q === p) q = -p;
  const grad = (fx: Term[], fy: Term[], [a, b] = [p, q]): Option => pairOption(polyFn(fx)(a, b), polyFn(fy)(a, b));
  return {
    prompt: { key: "gradient", tex: lines(`f(x, y) = ${polyTex(terms)}`, `\\nabla f${pointTex(p, q)}`) },
    correct: grad(dx(terms), dy(terms)),
    wrong: [
      tag(grad(dy(terms), dx(terms)), "orderSwapped"),
      tag(grad(dx(terms), dy(terms), [q, p]), "orderSwapped"),
      tag(grad(dx(terms, "constantKept"), dy(terms, "constantKept")), "constantKept"),
      tag(grad(dx(terms, "coefficientMissing"), dy(terms, "coefficientMissing")), "coefficientMissing"),
    ],
    explanation: { key: "gradient", tex: `\\nabla f = \\left(${polyTex(dx(terms))},\\ ${polyTex(dy(terms))}\\right)` },
    verify: { kind: "gradient", f: polyFn(terms), at: [p, q] },
  };
};

const criticalPoint: Generator = (rng) => {
  const a = rng.nonZero(-3, 3);
  const b = rng.nonZero(-3, 3);
  let c = rng.nonZero(-3, 3);
  if (4 * a * b === c * c) c += c > 0 ? 1 : -1;
  const p = rng.int(-3, 3);
  const q = rng.nonZero(-3, 3);
  // ∂f/∂x = 2ax + cy + d and ∂f/∂y = 2by + cx + e vanish at (p, q).
  const d = -(2 * a * p + c * q);
  const e = -(2 * b * q + c * p);
  const terms: Term[] = [
    [a, 2, 0],
    [c, 1, 1],
    [b, 0, 2],
    [d, 1, 0],
    [e, 0, 1],
  ];
  return {
    prompt: { key: "criticalPoint", tex: twoRows(terms) },
    correct: pairOption(p, q),
    wrong: [
      tag(pairOption(-p, -q), "signError"),
      tag(pairOption(q, p), "orderSwapped"),
      tag(pairOption(frac(-d, 2 * a), frac(-e, 2 * b)), "termDropped"),
      tag(pairOption(frac(-d, a), frac(-e, b)), "wrongFactor"),
    ],
    explanation: {
      key: "criticalPoint",
      tex: `\\left\\{\\begin{aligned} ${sum([[2 * a, "x"], [c, "y"], [d, ""]])} &= 0 \\\\ ${sum([[c, "x"], [2 * b, "y"], [e, ""]])} &= 0 \\end{aligned}\\right.`,
    },
    verify: { kind: "critical", f: polyFn(terms) },
  };
};

const doubleIntegral: Generator = (rng) => {
  const shapes = rng.shuffle<[number, number]>([
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 0],
    [0, 2],
    [0, 0],
  ]).slice(0, 2);
  const terms: Term[] = shapes.map(([i, j]) => [rng.nonZero(-3, 3), i, j]);
  const A = rng.int(1, 3);
  let B = rng.int(1, 3);
  if (B === A) B = A === 3 ? 2 : A + 1;
  /** Σ c · X^(i+1)/(i+1) · Y^(j+1)/(j+1), with the divisors optional. */
  const integral = (X: number, Y: number, divX = true, divY = true, yDone = true): Frac =>
    terms.reduce<Frac>(
      (s, [c, i, j]) => add(s, frac(c * X ** (i + 1) * (yDone ? Y ** (j + 1) : Y ** j), (divX ? i + 1 : 1) * (divY && yDone ? j + 1 : 1))),
      frac(0),
    );
  const option = (f: Frac): Option => ({ tex: numTex(f), num: f.n / f.d });
  return {
    prompt: { key: "doubleIntegral", tex: `\\int_{0}^{${A}} \\int_{0}^{${B}} \\left(${polyTex(terms)}\\right) \\, dy \\, dx` },
    correct: option(integral(A, B)),
    wrong: [
      tag(option(integral(A, B, false, false)), "wrongPowerDivisor"),
      tag(option(integral(A, B, true, false)), "wrongPowerDivisor"),
      tag(option(integral(A, B, true, true, false)), "boundsError"),
      tag(option(integral(B, A)), "boundsError"),
    ],
    explanation: { key: "doubleIntegral", tex: `\\int_{0}^{${A}} \\left( \\int_{0}^{${B}} \\left(${polyTex(terms)}\\right) dy \\right) dx` },
    verify: { kind: "doubleIntegral", f: polyFn(terms), x: [0, A], y: [0, B] },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const multivariable = {
  school: {},
  university: { partialDerivative, gradient, criticalPoint, doubleIntegral },
};
