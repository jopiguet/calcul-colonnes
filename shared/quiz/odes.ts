/**
 * Differential equations, with an initial condition so the answer is one
 * function: y′ = ay and y′ = ay + b at lycée; at university also y′ = axy
 * (separable) and y″ + py′ + qy = 0 with distinct real, double, or complex
 * roots of the characteristic equation.
 *
 * The check script substitutes each option into the equation (numerical
 * derivatives) and checks the initial values; it does not use the formulas
 * below. Classic mistakes: the constant set to y(0) without the particular
 * solution, the double root without its x, cos and sin swapped.
 */
import { frac, kx, lines, numTex, sum, type Frac } from "./tex";
import { tag, type Generator, type Option } from "./types";

/** e^{rx} as tex: "" for r = 0 (a constant), else e^{2x}, e^{-x}. */
const ex = (r: number | Frac, v = "x"): string => {
  const f = typeof r === "number" ? frac(r) : r;
  if (f.n === 0) return "";
  const k = f.d === 1 ? (f.n === 1 ? v : f.n === -1 ? `-${v}` : `${f.n}${v}`) : `${numTex(f)}${v}`;
  return `e^{${k}}`;
};
/** An option is the function itself (no "y =": the question asks for the solution, and a phone keeps it on one line). */
const fnOption = (tex: string, fn: (x: number) => number): Option => ({ tex, fn });

// ------------------------------------------------------------------ school

const homogeneous: Generator = (rng) => {
  const a = rng.nonZero(-4, 4);
  const y0 = rng.nonZero(-5, 6);
  const sol = (c: number, k: number | Frac) => {
    const kv = typeof k === "number" ? k : k.n / k.d;
    return fnOption(sum([[c, ex(k)]]), (x) => c * Math.exp(kv * x));
  };
  return {
    prompt: { key: "odeSolution", tex: lines(`y' = ${sum([[a, "y"]])}`, `y(0) = ${y0}`) },
    correct: sol(y0, a),
    wrong: [
      tag(fnOption(sum([[1, ex(a)], [y0 - 1, ""]]), (x) => Math.exp(a * x) + y0 - 1), "initialConditionMisapplied"),
      tag(sol(y0, -a), "signError"),
      tag(sol(y0 * a, a), "wrongFactor"),
      tag(sol(y0, frac(1, a)), "invertedRatio"),
      tag(fnOption(sum([[y0, `e^{x}`]]), (x) => y0 * Math.exp(x)), "termDropped"),
    ],
    explanation: { key: "odeHomogeneous", tex: `y = Ce^{${kx(a)}}, \\quad y(0) = C = ${y0}` },
    verify: { kind: "ode", equation: (y, dy) => dy - a * y, y0 },
  };
};

const affine: Generator = (rng) => {
  const a = rng.nonZero(-3, 3);
  const l = rng.nonZero(-4, 4); // the constant solution: a·ℓ + b = 0
  const b = -a * l;
  let y0 = rng.int(-4, 6);
  if (y0 === l) y0 += 2;
  const sol = (c: number, k: number, shift: number) => fnOption(sum([[c, ex(k)], [shift, ""]]), (x) => c * Math.exp(k * x) + shift);
  return {
    prompt: { key: "odeSolution", tex: lines(`y' = ${sum([[a, "y"], [b, ""]])}`, `y(0) = ${y0}`) },
    correct: sol(y0 - l, a, l),
    wrong: [
      tag(sol(y0, a, l), "initialConditionMisapplied"),
      tag(sol(y0 - l, a, -l), "signError"),
      tag(sol(y0 + l, a, -l), "signError"),
      tag(sol(y0 - l, -a, l), "signError"),
      tag(sol(y0, a, 0), "initialConditionMisapplied"),
    ],
    explanation: {
      key: "odeAffine",
      tex: `y = Ce^{${kx(a)}} ${l < 0 ? "-" : "+"} ${Math.abs(l)} \\quad \\left(${numTex(l)} = -\\tfrac{${b}}{${a}}\\right), \\qquad y(0) = C ${l < 0 ? "-" : "+"} ${Math.abs(l)} = ${y0}`,
    },
    verify: { kind: "ode", equation: (y, dy) => dy - a * y - b, y0 },
  };
};

// ------------------------------------------------------------- university

const separable: Generator = (rng) => {
  const a = rng.pick([1, 2, 4, 6, -1, -2, -4]);
  const y0 = rng.nonZero(-4, 5);
  const half = frac(a, 2);
  const sol = (c: number, k: Frac, v = "x^{2}", p = 2) => fnOption(sum([[c, ex(k, v)]]), (x) => c * Math.exp((k.n / k.d) * x ** p));
  return {
    prompt: { key: "odeSolution", tex: lines(`y' = ${sum([[a, "xy"]])}`, `y(0) = ${y0}`) },
    correct: sol(y0, half),
    wrong: [
      tag(sol(y0, frac(a), "x", 1), "separationError"),
      tag(sol(y0, frac(a)), "wrongFactor"),
      tag(sol(y0, frac(-a, 2)), "signError"),
      tag(fnOption(sum([[1, ex(half, "x^{2}")], [y0 - 1, ""]]), (x) => Math.exp((a / 2) * x * x) + y0 - 1), "initialConditionMisapplied"),
    ],
    explanation: { key: "odeSeparable", tex: `\\frac{y'}{y} = ${kx(a)} \\Rightarrow \\ln|y| = ${numTex(half)}x^{2} + c \\Rightarrow y = y(0)\\,${ex(half, "x^{2}")}` },
    verify: { kind: "ode", equation: (y, dy, _d2, x) => dy - a * x * y, y0 },
  };
};

/** y″ + py′ + qy as tex. */
const second = (p: number, q: number): string => `${sum([[1, "y''"], [p, "y'"], [q, "y"]])} = 0`;
const conditions = (y0: number, y1: number): string => `y(0) = ${y0}, \\quad y'(0) = ${y1}`;

const distinctRoots: Generator = (rng) => {
  const [r1, r2] = rng.shuffle([-3, -2, -1, 1, 2, 3]).slice(0, 2) as [number, number];
  const A = rng.nonZero(-3, 3);
  const B = rng.nonZero(-3, 3);
  const p = -(r1 + r2);
  const q = r1 * r2;
  const y0 = A + B;
  const y1 = r1 * A + r2 * B;
  const sol = (a: number, s: number, b: number, t: number) =>
    fnOption(sum([[a, ex(s)], [b, ex(t)]]), (x) => a * Math.exp(s * x) + b * Math.exp(t * x));
  return {
    prompt: { key: "odeSolution", tex: lines(second(p, q), conditions(y0, y1)) },
    correct: sol(A, r1, B, r2),
    wrong: [
      tag(sol(A, -r1, B, -r2), "characteristicRoots"),
      tag(sol(B, r1, A, r2), "initialConditionMisapplied"),
      tag(sol(y0, r1, y1, r2), "initialConditionMisapplied"),
      tag(fnOption(`\\left(${sum([[A, ""], [B, "x"]])}\\right)${ex(r1)}`, (x) => (A + B * x) * Math.exp(r1 * x)), "doubleRootFactor"),
    ],
    explanation: { key: "odeDistinct", tex: `r^{2} ${p < 0 ? "-" : "+"} ${Math.abs(p)}r ${q < 0 ? "-" : "+"} ${Math.abs(q)} = (r ${r1 < 0 ? "+" : "-"} ${Math.abs(r1)})(r ${r2 < 0 ? "+" : "-"} ${Math.abs(r2)}) = 0` },
    verify: { kind: "ode", equation: (y, dy, d2y) => d2y + p * dy + q * y, y0, dy0: y1 },
  };
};

const doubleRoot: Generator = (rng) => {
  const r = rng.pick([-2, -1, 1, 2]);
  const A = rng.nonZero(-3, 4);
  const B = rng.nonZero(-3, 3);
  const p = -2 * r;
  const q = r * r;
  const y1 = r * A + B;
  const sol = (a: number, b: number, s: number) =>
    fnOption(`\\left(${sum([[a, ""], [b, "x"]])}\\right)${ex(s)}`, (x) => (a + b * x) * Math.exp(s * x));
  return {
    prompt: { key: "odeSolution", tex: lines(second(p, q), conditions(A, y1)) },
    correct: sol(A, B, r),
    wrong: [
      tag(fnOption(sum([[A + B, ex(r)]]), (x) => (A + B) * Math.exp(r * x)), "doubleRootFactor"),
      tag(sol(A, y1, r), "initialConditionMisapplied"),
      tag(sol(A, B, -r), "characteristicRoots"),
      tag(fnOption(sum([[A, ex(r)], [B, "x"]]), (x) => A * Math.exp(r * x) + B * x), "doubleRootFactor"),
    ],
    explanation: { key: "odeDouble", tex: `r^{2} ${p < 0 ? "-" : "+"} ${Math.abs(p)}r + ${q} = (r ${r < 0 ? "+" : "-"} ${Math.abs(r)})^{2}: \\quad y = (A + Bx)${ex(r)}` },
    verify: { kind: "ode", equation: (y, dy, d2y) => d2y + p * dy + q * y, y0: A, dy0: y1 },
  };
};

const complexRoots: Generator = (rng) => {
  const alpha = rng.pick([-1, 0, 1]);
  const beta = rng.pick([1, 2, 3]);
  const A = rng.nonZero(-3, 3);
  const B = rng.nonZero(-3, 3);
  const p = -2 * alpha;
  const q = alpha * alpha + beta * beta;
  const y1 = alpha * A + beta * B;
  const trig = (f: "cos" | "sin", k: number): string => (k === 1 ? `\\${f} x` : `\\${f} ${k}x`);
  const sol = (e: number, a: number, fa: "cos" | "sin", b: number, fb: "cos" | "sin", k: number) =>
    fnOption(
      `${ex(e)}${e === 0 ? "" : "\\left("}${sum([[a, trig(fa, k)], [b, trig(fb, k)]])}${e === 0 ? "" : "\\right)"}`,
      (x) => Math.exp(e * x) * (a * Math[fa](k * x) + b * Math[fb](k * x)),
    );
  const wrong: Option[] = [
    tag(sol(alpha, A, "sin", B, "cos", beta), "sinCosSwapped"),
    tag(sol(alpha, A, "cos", y1, "sin", beta), "initialConditionMisapplied"),
    tag(sol(-alpha, A, "cos", B, "sin", beta), "characteristicRoots"),
    tag(sol(beta, A, "cos", B, "sin", Math.max(1, Math.abs(alpha))), "characteristicRoots"),
    tag(sol(alpha, A, "cos", -B, "sin", beta), "signError"),
  ];
  return {
    prompt: { key: "odeSolution", tex: lines(second(p, q), conditions(A, y1)) },
    correct: sol(alpha, A, "cos", B, "sin", beta),
    wrong,
    explanation: {
      key: "odeComplex",
      tex: `r = ${alpha} \\pm ${beta}i: \\quad y = ${ex(alpha)}\\left(A\\cos ${beta === 1 ? "" : beta}x + B\\sin ${beta === 1 ? "" : beta}x\\right), \\quad A = ${A}, \\ ${alpha === 0 ? "" : `${alpha}A + `}${beta === 1 ? "" : beta}B = ${y1}`,
    },
    verify: { kind: "ode", equation: (y, dy, d2y) => d2y + p * dy + q * y, y0: A, dy0: y1 },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const odes = {
  school: { homogeneous, affine },
  university: { affine, separable, distinctRoots, doubleRoot, complexRoots },
};
