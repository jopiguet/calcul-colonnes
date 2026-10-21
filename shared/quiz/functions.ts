/**
 * Function study: tangent lines, extrema, roots of a quadratic, inflection
 * points; at university also oblique asymptotes.
 *
 * Classic mistakes: the tangent through the wrong point (x + a), f(a) and
 * f′(a) swapped; the abscissa given for the value of an extremum; f′ used
 * where f″ is needed; sum and product of the roots taken for the roots.
 */
import { frac, lines, numTex, poly, sum, type Fn } from "./tex";
import { tag, type Generator, type Option } from "./types";

const numOption = (x: number): Option => ({ tex: numTex(x), num: x });
/** y = mx + p. */
const lineOption = (m: number, p: number): Option => ({ tex: `y = ${sum([[m, "x"], [p, ""]])}`, fn: (x) => m * x + p });

// ------------------------------------------------------------- both levels

const tangent: Generator = (rng) => {
  const c3 = rng.int(0, 1) ? rng.nonZero(-2, 2) : 0;
  const c2 = rng.nonZero(-3, 3);
  const c1 = rng.int(-4, 4);
  const c0 = rng.int(-5, 5);
  const f = poly([[c3, 3], [c2, 2], [c1, 1], [c0, 0]]);
  const a = rng.nonZero(-2, 2);
  const m = 3 * c3 * a * a + 2 * c2 * a + c1;
  const v = f.fn(a);
  return {
    prompt: { key: "tangentLine", tex: lines(`f(x) = ${f.tex}`, `a = ${a}`) },
    correct: lineOption(m, v - m * a),
    wrong: [
      tag(lineOption(m, v + m * a), "signError"),
      tag(lineOption(m, v), "tangentPointForgotten"),
      tag(lineOption(v, m - v * a), "tangentRolesSwapped"),
      tag(lineOption(m, -m * a), "termDropped"),
    ],
    explanation: { key: "tangentLine", tex: `f'(${a}) = ${m}, \\quad f(${a}) = ${v}, \\quad y = ${m}(x ${a < 0 ? "+" : "-"} ${Math.abs(a)}) ${v < 0 ? "-" : "+"} ${Math.abs(v)}` },
    verify: { kind: "tangent", f: f.fn, a },
  };
};

const vertex: Generator = (rng) => {
  const p = rng.nonZero(-3, 3);
  const h = rng.nonZero(-4, 4);
  const q = -2 * p * h;
  const r = rng.int(-6, 6);
  const f = poly([[p, 2], [q, 1], [r, 0]]);
  const value = f.fn(h);
  return {
    prompt: { key: "extremumAbscissa", tex: `f(x) = ${f.tex}` },
    correct: numOption(h),
    wrong: [
      tag(numOption(-h), "signError"),
      tag(numOption(2 * h), "wrongFactor"),
      tag(numOption(value), "valueAbscissaConfused"),
      tag(numOption(h / 2), "wrongFactor"),
    ],
    explanation: { key: "vertex", tex: `f'(x) = ${sum([[2 * p, "x"], [q, ""]])} = 0 \\iff x = -\\frac{b}{2a} = ${h}` },
    verify: { kind: "root", f: (x) => 2 * p * x + q },
  };
};

const quadraticRoots: Generator = (rng) => {
  const k = rng.nonZero(-2, 3);
  let [r1, r2] = [rng.int(-5, 5), rng.int(-5, 5)];
  if (r1 === r2) r2 = r1 + rng.nonZero(-3, 3);
  [r1, r2] = r1 < r2 ? [r1, r2] : [r2, r1];
  const f = poly([[k, 2], [-k * (r1 + r2), 1], [k * r1 * r2, 0]]);
  const set = (u: number, v: number): Option => {
    const [a, b] = u < v ? [u, v] : [v, u];
    return { tex: `\\left\\{ ${numTex(a)},\\ ${numTex(b)} \\right\\}`, set: a === b ? [a] : [a, b] };
  };
  return {
    prompt: { key: "solveInterval", tex: `${f.tex} = 0` },
    correct: set(r1, r2),
    wrong: [
      tag(set(-r1, -r2), "signError"),
      tag(set(r1 + r2, r1 * r2), "vietaConfused"),
      tag(set(k * r1, k * r2), "wrongFactor"),
      tag(set(2 * r1, 2 * r2), "wrongFactor"),
      tag(set(r1 - r2, r1 + r2), "vietaConfused"),
    ],
    explanation: { key: "quadraticRoots", tex: `\\Delta = ${(k * (r1 + r2)) ** 2 - 4 * k * k * r1 * r2}, \\quad x = \\frac{${k * (r1 + r2)} \\pm \\sqrt{\\Delta}}{${2 * k}}` },
    verify: { kind: "solutions", f: f.fn, lo: -30, hi: 30 },
  };
};

const inflection: Generator = (rng) => {
  const a = rng.nonZero(-2, 2);
  const h = rng.nonZero(-3, 3);
  const b = -3 * a * h;
  const c = rng.int(-6, 6);
  const d = rng.int(-5, 5);
  const f = poly([[a, 3], [b, 2], [c, 1], [d, 0]]);
  return {
    prompt: { key: "inflection", tex: `f(x) = ${f.tex}` },
    correct: numOption(h),
    wrong: [
      tag(numOption(-h), "signError"),
      tag(numOption(3 * h), "wrongFactor"),
      // −b/(2a) on the cubic's coefficients: the parabola's formula, i.e. thinking of f′ instead of f″.
      tag({ tex: numTex(frac(3 * h, 2)), num: (3 * h) / 2 }, "derivativeOrder"),
      tag(numOption(0), "derivativeOrder"),
    ],
    explanation: { key: "inflection", tex: `f''(x) = ${sum([[6 * a, "x"], [2 * b, ""]])} = 0 \\iff x = ${h}` },
    verify: { kind: "root", f: (x) => 6 * a * x + 2 * b },
  };
};

const localMaximum: Generator = (rng) => {
  const k = rng.int(1, 3);
  const c = rng.int(-6, 6);
  const f = poly([[1, 3], [-3 * k * k, 1], [c, 0]]);
  const at = (x: number): number => f.fn(x);
  return {
    prompt: { key: "localMaximum", tex: `f(x) = ${f.tex}` },
    correct: numOption(at(-k)),
    wrong: [
      tag(numOption(at(k)), "maxMinConfused"),
      tag(numOption(-k), "valueAbscissaConfused"),
      tag(numOption(c), "termDropped"),
      tag(numOption(k), "valueAbscissaConfused"),
    ],
    explanation: { key: "localExtremum", tex: `f'(x) = 3x^{2} - ${3 * k * k} = 0 \\iff x = \\pm ${k}, \\quad f(-${k}) = ${at(-k)}` },
    verify: { kind: "value", value: at(-k) },
  };
};

// ------------------------------------------------------------- university

const obliqueAsymptote: Generator = (rng) => {
  const a = rng.nonZero(-3, 3);
  const b = rng.int(-5, 5);
  const c = rng.nonZero(-6, 6);
  const d = rng.nonZero(-4, 4);
  const top = sum([[a, "x^{2}"], [b, "x"], [c, ""]]);
  const f: Fn = (x) => (a * x * x + b * x + c) / (x + d);
  const p = b - a * d;
  return {
    prompt: { key: "obliqueAsymptote", tex: `f(x) = \\frac{${top}}{${sum([[1, "x"], [d, ""]])}}` },
    correct: lineOption(a, p),
    wrong: [
      tag(lineOption(a, b), "asymptoteDivision"),
      tag(lineOption(a, b + a * d), "signError"),
      tag(lineOption(a, 0), "termDropped"),
      tag(lineOption(0, a), "dominantTerms"),
    ],
    explanation: { key: "obliqueAsymptote", tex: `\\frac{${top}}{${sum([[1, "x"], [d, ""]])}} = ${sum([[a, "x"], [p, ""]])} + \\frac{${c - p * d}}{${sum([[1, "x"], [d, ""]])}}` },
    verify: { kind: "asymptote", f },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const functions = {
  school: { tangent, vertex, quadraticRoots, inflection, localMaximum },
  university: { tangent, inflection, localMaximum, obliqueAsymptote },
};
