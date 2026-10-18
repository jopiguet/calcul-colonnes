import { ePow, frac, kx, lin, numTex, poly, sum, val, type Coef, type Fn } from "./tex";
import { tag, type Generator, type Option } from "./types";

const C = " + C";
const prim = (tex: string, fn: Fn): Option => ({ tex: tex + C, fn });
const number = (c: Coef, tex = numTex(c)): Option => ({ tex, num: val(c) });

const powerPrimitive: Generator = (rng) => {
  const n = rng.int(1, 4);
  const a = rng.nonZero(-6, 6);
  const b = rng.nonZero(-9, 9);
  const f = poly([[a, n], [b, 0]]);
  const P = (p: { tex: string; fn: Fn }): Option => prim(p.tex, p.fn);
  return {
    prompt: { key: "primitive", tex: `f(x) = ${f.tex}` },
    correct: P(poly([[frac(a, n + 1), n + 1], [b, 1]])),
    wrong: [
      tag(P(poly([[a * n, n - 1]])), "derivedInstead"),
      tag(P(poly([[frac(a, n), n + 1], [b, 1]])), "wrongPowerDivisor"),
      tag(P(poly([[frac(a, n + 1), n + 1]])), "constantNotIntegrated"),
      tag(P(poly([[a, n + 1], [b, 1]])), "wrongPowerDivisor"),
    ],
    explanation: { key: "powerPrimitive", tex: "\\int x^{n}\\,dx = \\frac{x^{n+1}}{n+1} + C" },
    verify: { kind: "primitive", f: f.fn },
  };
};

const definitePolynomial: Generator = (rng) => {
  const k = rng.int(1, 4);
  const a = rng.int(1, 6);
  const b = rng.nonZero(-5, 5);
  return {
    prompt: { key: "integral", tex: `\\int_{0}^{${k}} (${lin(a, b)})\\,dx` },
    correct: number(frac(a * k * k + 2 * b * k, 2)),
    wrong: [
      tag(number(a * k * k + b * k), "wrongPowerDivisor"),
      tag(number(frac(a * k * k, 2)), "constantNotIntegrated"),
      tag(number(a * k + b), "boundsError"), // f(k) instead of F(k) − F(0)
      tag(number(frac(a * k * k - 2 * b * k, 2)), "signError"),
      tag(number(frac(a * k, 2)), "wrongPowerDivisor"),
    ],
    explanation: { key: "fundamental", tex: "\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)" },
    verify: { kind: "integral", f: (x) => a * x + b, a: 0, b: k },
  };
};

const trigPrimitive: Generator = (rng) => {
  const a = rng.int(2, 6);
  const sin = `\\sin(${a}x)`;
  const cos = `\\cos(${a}x)`;
  const S = (k: Coef): Option => prim(sum([[k, sin]]), (x) => val(k) * Math.sin(a * x));
  const K = (k: Coef): Option => prim(sum([[k, cos]]), (x) => val(k) * Math.cos(a * x));
  if (rng.int(0, 1) === 0) {
    return {
      prompt: { key: "primitive", tex: `f(x) = ${cos}` },
      correct: S(frac(1, a)),
      wrong: [
        tag(S(a), "multipliedInsteadOfDivided"),
        tag(S(frac(-1, a)), "signError"),
        tag(K(frac(1, a)), "sinCosSwapped"),
        tag(S(1), "wrongFactor"),
      ],
      explanation: { key: "linearPrimitive", tex: "\\int \\cos(ax)\\,dx = \\frac{1}{a}\\sin(ax) + C" },
      verify: { kind: "primitive", f: (x) => Math.cos(a * x) },
    };
  }
  return {
    prompt: { key: "primitive", tex: `f(x) = ${sin}` },
    correct: K(frac(-1, a)),
    wrong: [
      tag(K(frac(1, a)), "signError"),
      tag(K(-a), "multipliedInsteadOfDivided"),
      tag(S(frac(-1, a)), "sinCosSwapped"),
      tag(K(-1), "wrongFactor"),
    ],
    explanation: { key: "linearPrimitive", tex: "\\int \\sin(ax)\\,dx = -\\frac{1}{a}\\cos(ax) + C" },
    verify: { kind: "primitive", f: (x) => Math.sin(a * x) },
  };
};

const expPrimitive: Generator = (rng) => {
  const a = rng.pick([-4, -3, -2, 2, 3, 4, 5]);
  const e = `e^{${kx(a)}}`;
  const E = (k: Coef, body = e, b = a): Option => prim(sum([[k, body]]), (x) => val(k) * Math.exp(b * x));
  return {
    prompt: { key: "primitive", tex: `f(x) = ${e}` },
    correct: E(frac(1, a)),
    wrong: [
      tag(E(a), "multipliedInsteadOfDivided"),
      tag(E(1), "wrongFactor"),
      tag(E(frac(1, a + 1), `e^{${kx(a + 1)}}`, a + 1), "powerRuleOnExponential"),
      tag(E(frac(-1, a)), "signError"),
    ],
    explanation: { key: "linearPrimitive", tex: "\\int e^{ax}\\,dx = \\frac{1}{a}e^{ax} + C" },
    verify: { kind: "primitive", f: (x) => Math.exp(a * x) },
  };
};

const inversePrimitive: Generator = (rng) => {
  const a = rng.int(2, 9);
  return {
    prompt: { key: "primitive", tex: `f(x) = \\frac{${a}}{x}` },
    correct: prim(`${a}\\ln|x|`, (x) => a * Math.log(Math.abs(x))),
    wrong: [
      tag(prim(`-\\frac{${a}}{x^{2}}`, (x) => -a / (x * x)), "derivedInstead"),
      tag(prim(`\\frac{${a}}{2}x^{2}`, (x) => (a / 2) * x * x), "logPrimitiveError"),
      tag(prim(`\\ln|${a}x|`, (x) => Math.log(a * x)), "wrongFactor"), // a primitive of 1/x, not of a/x
      tag(prim(`${a}x\\ln x`, (x) => a * x * Math.log(x)), "logPrimitiveError"),
      tag(prim(`\\frac{1}{${a}}\\ln|x|`, (x) => Math.log(Math.abs(x)) / a), "wrongFactor"),
    ],
    explanation: { key: "logPrimitive", tex: "\\int \\frac{1}{x}\\,dx = \\ln|x| + C" },
    verify: { kind: "primitive", f: (x) => a / x },
  };
};

// ------------------------------------------------------------- university

const partsExp: Generator = (rng) => {
  const a = rng.pick([-3, -2, 2, 3, 4]);
  const e = `e^{${kx(a)}}`;
  const ex = (x: number): number => Math.exp(a * x);
  const W = (p: Coef, q: Coef): Option =>
    prim(`${e}\\left(${sum([[p, "x"], [q, ""]])}\\right)`, (x) => ex(x) * (val(p) * x + val(q)));
  return {
    prompt: { key: "primitive", tex: `f(x) = x${e}` },
    correct: W(frac(1, a), frac(-1, a * a)),
    wrong: [
      tag(W(frac(1, a), frac(1, a * a)), "signError"),
      tag(W(frac(1, a), 0), "byParts"),
      tag(prim(`\\frac{x^{2}}{2}${e}`, (x) => ((x * x) / 2) * ex(x)), "byParts"),
      tag(W(a, -1), "multipliedInsteadOfDivided"),
    ],
    explanation: { key: "parts", tex: "\\int u'v\\,dx = uv - \\int uv'\\,dx" },
    verify: { kind: "primitive", f: (x) => x * ex(x) },
  };
};

const partsCos: Generator = (rng) => {
  const a = rng.int(1, 4);
  const s = `\\sin(${kx(a)})`;
  const c = `\\cos(${kx(a)})`;
  const W = (p: Coef, q: Coef): Option =>
    prim(sum([[p, `x${s}`], [q, c]]), (x) => val(p) * x * Math.sin(a * x) + val(q) * Math.cos(a * x));
  return {
    prompt: { key: "primitive", tex: `f(x) = x${c}` },
    correct: W(frac(1, a), frac(1, a * a)),
    wrong: [
      tag(W(frac(1, a), frac(-1, a * a)), "signError"),
      tag(W(frac(1, a), 0), "byParts"),
      tag(W(frac(-1, a), frac(1, a * a)), "signError"),
      tag(W(a, 1), "multipliedInsteadOfDivided"),
    ],
    explanation: { key: "parts", tex: "\\int u'v\\,dx = uv - \\int uv'\\,dx" },
    verify: { kind: "primitive", f: (x) => x * Math.cos(a * x) },
  };
};

const substitution: Generator = (rng) => {
  const b = rng.int(1, 9);
  const u = `x^{2} + ${b}`;
  const L = (k: Coef): Option => prim(sum([[k, `\\ln(${u})`]]), (x) => val(k) * Math.log(x * x + b));
  return {
    prompt: { key: "primitive", tex: `f(x) = \\frac{x}{${u}}` },
    correct: L(frac(1, 2)),
    wrong: [
      tag(L(1), "wrongFactor"),
      tag(L(2), "wrongFactor"),
      tag(prim(`\\frac{x^{2}}{2(${u})}`, (x) => (x * x) / (2 * (x * x + b))), "substitutionError"),
      tag(L(-1), "signError"),
    ],
    explanation: { key: "substitution", tex: "\\int \\frac{u'}{u}\\,dx = \\ln|u| + C" },
    verify: { kind: "primitive", f: (x) => x / (x * x + b) },
  };
};

const logPrimitive: Generator = (rng) => {
  const a = rng.int(1, 5);
  const l = `\\ln(${kx(a)})`;
  const ln = (x: number): number => Math.log(a * x);
  return {
    prompt: { key: "primitive", tex: `f(x) = ${l}` },
    correct: prim(`x${l} - x`, (x) => x * ln(x) - x),
    wrong: [
      tag(prim(`x${l}`, (x) => x * ln(x)), "byParts"),
      tag(prim(`x${l} + x`, (x) => x * ln(x) + x), "signError"),
      tag(prim("\\frac{1}{x}", (x) => 1 / x), "derivedInstead"),
      tag(prim(`\\frac{(${l})^{2}}{2}`, (x) => ln(x) ** 2 / 2), "substitutionError"),
    ],
    explanation: { key: "parts", tex: `\\int 1 \\cdot ${l}\\,dx = x${l} - \\int x \\cdot \\frac{1}{x}\\,dx` },
    verify: { kind: "primitive", f: (x) => ln(x) },
  };
};

const definiteParts: Generator = (rng) => {
  const k = rng.int(1, 4);
  const E = Math.exp(k);
  const N = (p: number, q: number): Option => ({ tex: sum([[p, ePow(k)], [q, ""]]), num: p * E + q });
  return {
    prompt: { key: "integral", tex: `\\int_{0}^{${k}} x\\,e^{x}\\,dx` },
    correct: N(k - 1, 1),
    wrong: [
      tag(N(k - 1, -1), "signError"),
      tag(N(k, 0), "byParts"),
      tag(N(k + 1, -1), "signError"),
      tag(N(k - 1, 0), "boundsError"), // F(0) forgotten
      tag(N(k, -1), "byParts"),
    ],
    explanation: { key: "parts", tex: `\\int_{0}^{${k}} x\\,e^{x}\\,dx = \\Big[(x - 1)e^{x}\\Big]_{0}^{${k}}` },
    verify: { kind: "integral", f: (x) => x * Math.exp(x), a: 0, b: k },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const integrals = {
  school: { powerPrimitive, definitePolynomial, trigPrimitive, expPrimitive, inversePrimitive },
  university: { partsExp, partsCos, substitution, logPrimitive, definiteParts, trigPrimitive },
};

