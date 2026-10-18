import { kx, lin, poly, pow, sum, type Fn } from "./tex";
import { tag, type Generator, type Option } from "./types";

const opt = (tex: string, fn: Fn): Option => ({ tex, fn });
const fromPoly = (p: { tex: string; fn: Fn }): Option => opt(p.tex, p.fn);

const polynomial: Generator = (rng) => {
  const n = rng.int(2, 5);
  const m = rng.int(1, n - 1);
  const a = rng.nonZero(-6, 6);
  const b = rng.nonZero(-9, 9);
  const c = rng.nonZero(-9, 9);
  const f = poly([[a, n], [b, m], [c, 0]]);
  return {
    prompt: { key: "derivative", tex: `f(x) = ${f.tex}` },
    correct: fromPoly(poly([[n * a, n - 1], [m * b, m - 1]])),
    wrong: [
      tag(fromPoly(poly([[n * a, n], [m * b, m]])), "exponentKept"),
      tag(fromPoly(poly([[a, n - 1], [b, m - 1]])), "coefficientMissing"),
      tag(fromPoly(poly([[n * a, n - 1], [m * b, m - 1], [c, 0]])), "constantKept"),
      tag(fromPoly(poly([[n * a, n - 1], [-m * b, m - 1]])), "signError"),
      tag(fromPoly(poly([[n * a, n - 1]])), "termDropped"),
    ],
    explanation: { key: "powerRule", tex: "(x^{n})' = n\\,x^{n-1}" },
    verify: { kind: "derivative", f: f.fn },
  };
};

const trig: Generator = (rng) => {
  const a = rng.nonZero(-5, 5);
  const b = rng.int(2, 6);
  const sin = `\\sin(${b}x)`;
  const cos = `\\cos(${b}x)`;
  const S = (k: number): Option => opt(sum([[k, sin]]), (x) => k * Math.sin(b * x));
  const C = (k: number): Option => opt(sum([[k, cos]]), (x) => k * Math.cos(b * x));
  if (rng.int(0, 1) === 0) {
    return {
      prompt: { key: "derivative", tex: `f(x) = ${sum([[a, sin]])}` },
      correct: C(a * b),
      wrong: [
        tag(C(a), "chainRuleForgotten"),
        tag(C(-a * b), "signError"),
        tag(S(a * b), "sinCosSwapped"),
        tag(C(b), "coefficientMissing"),
        tag(S(-a), "sinCosSwapped"),
      ],
      explanation: { key: "chainRule", tex: "(\\sin u)' = u'\\cos u" },
      verify: { kind: "derivative", f: (x) => a * Math.sin(b * x) },
    };
  }
  return {
    prompt: { key: "derivative", tex: `f(x) = ${sum([[a, cos]])}` },
    correct: S(-a * b),
    wrong: [
      tag(S(a * b), "signError"),
      tag(S(-a), "chainRuleForgotten"),
      tag(C(-a * b), "sinCosSwapped"),
      tag(S(a), "chainRuleForgotten"),
      tag(C(a * b), "sinCosSwapped"),
    ],
    explanation: { key: "chainRule", tex: "(\\cos u)' = -u'\\sin u" },
    verify: { kind: "derivative", f: (x) => a * Math.cos(b * x) },
  };
};

const exponential: Generator = (rng) => {
  const a = rng.nonZero(-5, 5);
  const b = rng.nonZero(-6, 6);
  const e = `e^{${lin(a, b)}}`;
  const E = (k: number, body = e, fn: Fn = (x) => Math.exp(a * x + b)): Option =>
    opt(sum([[k, body]]), (x) => k * fn(x));
  return {
    prompt: { key: "derivative", tex: `f(x) = ${e}` },
    correct: E(a),
    wrong: [
      tag(E(1), "chainRuleForgotten"),
      tag(E(b), "wrongInnerFactor"),
      tag(opt(`(${lin(a, b)})${e}`, (x) => (a * x + b) * Math.exp(a * x + b)), "powerRuleOnExponential"),
      tag(E(a, `e^{${kx(a)}}`, (x) => Math.exp(a * x)), "termDropped"),
      tag(E(-a), "signError"),
    ],
    explanation: { key: "chainRule", tex: "(e^{u})' = u'\\,e^{u}" },
    verify: { kind: "derivative", f: (x) => Math.exp(a * x + b) },
  };
};

const logarithm: Generator = (rng) => {
  const a = rng.int(1, 6);
  const b = rng.int(1, 9);
  const l = lin(a, b);
  return {
    prompt: { key: "derivative", tex: `f(x) = \\ln(${l})` },
    correct: opt(`\\frac{${a}}{${l}}`, (x) => a / (a * x + b)),
    wrong: [
      tag(opt(`\\frac{1}{${l}}`, (x) => 1 / (a * x + b)), "chainRuleForgotten"),
      tag(opt(`\\frac{${a}}{x}`, (x) => a / x), "logDerivative"),
      tag(opt(`\\frac{1}{${kx(a)}}`, (x) => 1 / (a * x)), "logDerivative"),
      tag(opt(`-\\frac{${a}}{(${l})^{2}}`, (x) => -a / (a * x + b) ** 2), "logDerivative"),
      tag(opt(sum([[a, `\\ln(${l})`]]), (x) => a * Math.log(a * x + b)), "logDerivative"),
    ],
    explanation: { key: "chainRule", tex: "(\\ln u)' = \\frac{u'}{u}" },
    verify: { kind: "derivative", f: (x) => Math.log(a * x + b) },
  };
};

const product: Generator = (rng) => {
  const n = rng.int(2, 4);
  const a = rng.nonZero(-3, 3);
  const e = `e^{${kx(a)}}`;
  const ex = (x: number): number => Math.exp(a * x);
  const withE = (p: { tex: string; fn: Fn }): Option => opt(`(${p.tex})${e}`, (x) => p.fn(x) * ex(x));
  return {
    prompt: { key: "derivative", tex: `f(x) = ${pow(n)}${e}` },
    correct: withE(poly([[a, n], [n, n - 1]])),
    wrong: [
      tag(opt(sum([[n * a, `${pow(n - 1)}${e}`]]), (x) => n * a * x ** (n - 1) * ex(x)), "productRule"), // u'v'
      tag(opt(sum([[n, `${pow(n - 1)}${e}`]]), (x) => n * x ** (n - 1) * ex(x)), "productRule"),
      tag(opt(sum([[a, `${pow(n)}${e}`]]), (x) => a * x ** n * ex(x)), "productRule"),
      tag(withE(poly([[-a, n], [n, n - 1]])), "signError"),
    ],
    explanation: { key: "productRule", tex: "(uv)' = u'v + uv'" },
    verify: { kind: "derivative", f: (x) => x ** n * ex(x) },
  };
};

// ------------------------------------------------------------- university

const logComposite: Generator = (rng) => {
  const a = rng.int(1, 9);
  const u = `x^{2} + ${a}`;
  return {
    prompt: { key: "derivative", tex: `f(x) = \\ln(${u})` },
    correct: opt(`\\frac{2x}{${u}}`, (x) => (2 * x) / (x * x + a)),
    wrong: [
      tag(opt(`\\frac{1}{${u}}`, (x) => 1 / (x * x + a)), "chainRuleForgotten"),
      tag(opt(`\\frac{x}{${u}}`, (x) => x / (x * x + a)), "wrongInnerFactor"),
      tag(opt(`2x\\ln(${u})`, (x) => 2 * x * Math.log(x * x + a)), "logDerivative"),
      tag(opt(`\\frac{1}{2x}`, (x) => 1 / (2 * x)), "logDerivative"),
    ],
    explanation: { key: "chainRule", tex: "(\\ln u)' = \\frac{u'}{u}" },
    verify: { kind: "derivative", f: (x) => Math.log(x * x + a) },
  };
};

const arctan: Generator = (rng) => {
  const a = rng.int(2, 6);
  const den = `1 + ${a * a}x^{2}`;
  return {
    prompt: { key: "derivative", tex: `f(x) = \\arctan(${a}x)` },
    correct: opt(`\\frac{${a}}{${den}}`, (x) => a / (1 + a * a * x * x)),
    wrong: [
      tag(opt(`\\frac{1}{${den}}`, (x) => 1 / (1 + a * a * x * x)), "chainRuleForgotten"),
      tag(opt(`\\frac{${a}}{1 + x^{2}}`, (x) => a / (1 + x * x)), "wrongInnerFactor"),
      tag(opt(`\\frac{${a}}{1 + ${a}x^{2}}`, (x) => a / (1 + a * x * x)), "wrongInnerFactor"),
      tag(opt(`-\\frac{${a}}{${den}}`, (x) => -a / (1 + a * a * x * x)), "signError"),
    ],
    explanation: { key: "chainRule", tex: "(\\arctan u)' = \\frac{u'}{1 + u^{2}}" },
    verify: { kind: "derivative", f: (x) => Math.atan(a * x) },
  };
};

const powerLog: Generator = (rng) => {
  const n = rng.int(2, 5);
  const ln = (x: number): number => Math.log(x);
  return {
    prompt: { key: "derivative", tex: `f(x) = ${pow(n)}\\ln x` },
    correct: opt(sum([[n, `${pow(n - 1)}\\ln x`], [1, pow(n - 1)]]), (x) => n * x ** (n - 1) * ln(x) + x ** (n - 1)),
    wrong: [
      tag(opt(sum([[n, `${pow(n - 1)}\\ln x`]]), (x) => n * x ** (n - 1) * ln(x)), "productRule"),
      tag(opt(sum([[n, pow(n - 2)]]), (x) => n * x ** (n - 2)), "logDerivative"), // (ln x)' = 1/x applied to everything
      tag(opt(sum([[n, `${pow(n - 1)}\\ln x`], [-1, pow(n - 1)]]), (x) => n * x ** (n - 1) * ln(x) - x ** (n - 1)), "signError"),
      tag(opt(`${sum([[n, pow(n - 1)]])} + \\frac{1}{x}`, (x) => n * x ** (n - 1) + 1 / x), "productRule"),
    ],
    explanation: { key: "productRule", tex: "(uv)' = u'v + uv'" },
    verify: { kind: "derivative", f: (x) => x ** n * ln(x) },
  };
};

const quotient: Generator = (rng) => {
  const a = rng.nonZero(-4, 4);
  const e = `e^{${kx(a)}}`;
  const ex = (x: number): number => Math.exp(a * x);
  const over = (p: string, fn: Fn): Option => opt(`\\frac{(${p})${e}}{x^{2}}`, (x) => (fn(x) * ex(x)) / (x * x));
  return {
    prompt: { key: "derivative", tex: `f(x) = \\frac{${e}}{x}` },
    correct: over(lin(a, -1), (x) => a * x - 1),
    wrong: [
      tag(over(lin(a, 1), (x) => a * x + 1), "quotientRule"),
      tag(over(lin(-a, 1), (x) => 1 - a * x), "quotientRule"),
      tag(opt(sum([[a, e]]), (x) => a * ex(x)), "quotientRule"),
      tag(opt(`\\frac{${sum([[a, e]])}}{x}`, (x) => (a * ex(x)) / x), "quotientRule"),
    ],
    explanation: { key: "quotientRule", tex: "\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^{2}}" },
    verify: { kind: "derivative", f: (x) => ex(x) / x },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const derivatives = {
  school: { polynomial, trig, exponential, logarithm, product },
  university: { logComposite, arctan, powerLog, quotient, product, logarithm },
};
