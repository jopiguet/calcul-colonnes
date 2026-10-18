import { ePow, frac, numTex, poly, val, type Coef } from "./tex";
import { tag, type Generator, type Option } from "./types";

const number = (c: Coef): Option => ({ tex: numTex(c), num: val(c) });
const PLUS_INF: Option = { tex: "+\\infty", num: Infinity };
const MINUS_INF: Option = { tex: "-\\infty", num: -Infinity };
const ZERO = number(0);

const rationalAtInfinity: Generator = (rng) => {
  const p = rng.int(1, 3);
  const q = rng.int(1, 3);
  const a = rng.nonZero(-6, 6);
  const b = rng.nonZero(-9, 9);
  const d = rng.int(1, 6);
  const e = rng.nonZero(-9, 9);
  const P = poly([[a, p], [b, 0]]);
  const Q = poly([[d, q], [e, 0]]);
  const correct = p < q ? ZERO : p === q ? number(frac(a, d)) : a > 0 ? PLUS_INF : MINUS_INF;
  return {
    prompt: { key: "limit", tex: `\\lim_{x \\to +\\infty} \\frac{${P.tex}}{${Q.tex}}` },
    correct,
    wrong: [
      tag(ZERO, "dominantTerms"),
      tag(number(frac(a, d)), "dominantTerms"),
      tag(number(frac(b, e)), "dominantTerms"),
      // The opposite infinity is a sign error; any other infinity, a wrong reading of the degrees.
      tag(PLUS_INF, correct === MINUS_INF ? "signError" : "dominantTerms"),
      tag(MINUS_INF, correct === PLUS_INF ? "signError" : "dominantTerms"),
      tag(number(1), "indeterminateGuess"),
      tag(number(a), "dominantTerms"),
    ],
    explanation: {
      key: "dominantTerms",
      tex: `\\frac{${P.tex}}{${Q.tex}} \\sim \\frac{${poly([[a, p]]).tex}}{${poly([[d, q]]).tex}}`,
    },
    verify: { kind: "limit", f: (x) => P.fn(x) / Q.fn(x), probe: 1e8 },
  };
};

const sinOverX: Generator = (rng) => {
  const a = rng.int(2, 7);
  const b = rng.int(1, 5);
  return {
    prompt: { key: "limit", tex: `\\lim_{x \\to 0} \\frac{\\sin(${a}x)}{${b === 1 ? "" : b}x}` },
    correct: number(frac(a, b)),
    wrong: [
      tag(number(frac(b, a)), "invertedRatio"),
      tag(number(1), "wrongInnerFactor"),
      tag(ZERO, "indeterminateGuess"),
      tag(PLUS_INF, "indeterminateGuess"),
      tag(number(a), "wrongInnerFactor"),
    ],
    explanation: { key: "sinOverX", tex: `\\lim_{u \\to 0} \\frac{\\sin u}{u} = 1, \\quad \\frac{\\sin(${a}x)}{${b === 1 ? "" : b}x} = \\frac{${a}}{${b}} \\cdot \\frac{\\sin(${a}x)}{${a}x}` },
    verify: { kind: "limit", f: (x) => Math.sin(a * x) / (b * x), probe: 1e-6 },
  };
};

const growth: Generator = (rng) => {
  const n = rng.int(2, 4);
  const cases = [
    { tex: `\\frac{e^{x}}{x^{${n}}}`, f: (x: number) => Math.exp(x) / x ** n, probe: 300, limit: PLUS_INF },
    { tex: `x^{${n}}e^{-x}`, f: (x: number) => x ** n * Math.exp(-x), probe: 300, limit: ZERO },
    { tex: `\\frac{\\ln x}{x^{${n}}}`, f: (x: number) => Math.log(x) / x ** n, probe: 1e8, limit: ZERO },
    { tex: `\\frac{x^{${n}}}{\\ln x}`, f: (x: number) => x ** n / Math.log(x), probe: 1e8, limit: PLUS_INF },
  ];
  const c = rng.pick(cases);
  return {
    prompt: { key: "limit", tex: `\\lim_{x \\to +\\infty} ${c.tex}` },
    correct: c.limit,
    wrong: [
      tag(ZERO, "growthReversed"),
      tag(PLUS_INF, "growthReversed"),
      tag(number(1), "indeterminateGuess"),
      tag(number(n), "indeterminateGuess"),
      tag(MINUS_INF, "signError"),
    ],
    explanation: { key: "growth", tex: "\\ln x \\ll x^{n} \\ll e^{x}" },
    verify: { kind: "limit", f: c.f, probe: c.probe },
  };
};

const factor: Generator = (rng) => {
  const a = rng.nonZero(-9, 9);
  const minus = a > 0 ? `- ${a}` : `+ ${-a}`;
  return {
    prompt: { key: "limit", tex: `\\lim_{x \\to ${a}} \\frac{x^{2} - ${a * a}}{x ${minus}}` },
    correct: number(2 * a),
    wrong: [
      tag(number(a), "factorisationError"),
      tag(ZERO, "indeterminateGuess"),
      tag(number(a * a), "factorisationError"),
      tag(PLUS_INF, "indeterminateGuess"),
      tag(number(-2 * a), "signError"),
    ],
    explanation: { key: "factor", tex: `\\frac{x^{2} - ${a * a}}{x ${minus}} = x ${a > 0 ? `+ ${a}` : `- ${-a}`}` },
    verify: { kind: "limit", f: (x) => (x * x - a * a) / (x - a), probe: a + 1e-7 },
  };
};

// ------------------------------------------------------------- university

const expLimit: Generator = (rng) => {
  const a = rng.int(1, 5);
  const E = (k: number): Option => ({ tex: ePow(k), num: Math.exp(k) });
  return {
    prompt: { key: "limit", tex: `\\lim_{x \\to +\\infty} \\left(1 + \\frac{${a}}{x}\\right)^{x}` },
    correct: E(a),
    wrong: [
      tag(number(1), "indeterminateGuess"), // 1^∞ taken as 1
      tag(E(1), "wrongInnerFactor"),
      tag(PLUS_INF, "indeterminateGuess"),
      tag(number(a), "expLogInverse"),
      tag({ tex: `e^{\\frac{1}{${a}}}`, num: Math.exp(1 / a) }, "invertedRatio"),
    ],
    explanation: {
      key: "expLimit",
      tex: `\\left(1 + \\frac{${a}}{x}\\right)^{x} = e^{x\\ln\\left(1 + \\frac{${a}}{x}\\right)}, \\quad x\\ln\\left(1 + \\frac{${a}}{x}\\right) \\to ${a}`,
    },
    verify: { kind: "limit", f: (x) => (1 + a / x) ** x, probe: 1e7 },
  };
};

const rateAtZero: Generator = (rng) => {
  const a = rng.int(2, 7);
  const exp = rng.int(0, 1) === 0;
  return {
    prompt: {
      key: "limit",
      tex: exp ? `\\lim_{x \\to 0} \\frac{e^{${a}x} - 1}{x}` : `\\lim_{x \\to 0} \\frac{\\ln(1 + ${a}x)}{x}`,
    },
    correct: number(a),
    wrong: [
      tag(number(1), "wrongInnerFactor"),
      tag(ZERO, "indeterminateGuess"),
      tag(number(frac(1, a)), "invertedRatio"),
      tag(PLUS_INF, "indeterminateGuess"),
      tag(number(-a), "signError"),
    ],
    explanation: {
      key: "derivativeAtZero",
      tex: exp ? `(e^{${a}x})'\\big|_{x=0} = ${a}` : `(\\ln(1 + ${a}x))'\\big|_{x=0} = ${a}`,
    },
    verify: {
      kind: "limit",
      f: exp ? (x) => Math.expm1(a * x) / x : (x) => Math.log1p(a * x) / x,
      probe: 1e-9,
    },
  };
};

const taylor: Generator = (rng) => {
  const a = rng.int(1, 4);
  if (rng.int(0, 1) === 0) {
    const ax = a === 1 ? "x" : `${a}x`;
    return {
      prompt: { key: "limit", tex: `\\lim_{x \\to 0} \\frac{1 - \\cos(${ax})}{x^{2}}` },
      correct: number(frac(a * a, 2)),
      wrong: [
        tag(number(frac(a, 2)), "taylorError"),
        tag(number(a * a), "taylorError"),
        tag(ZERO, "indeterminateGuess"),
        tag(number(frac(1, 2)), "wrongInnerFactor"),
        tag(PLUS_INF, "indeterminateGuess"),
      ],
      explanation: { key: "taylor", tex: "\\cos u = 1 - \\frac{u^{2}}{2} + o(u^{2})" },
      verify: { kind: "limit", f: (x) => (2 * Math.sin((a * x) / 2) ** 2) / (x * x), probe: 1e-5 },
    };
  }
  const ax = a === 1 ? "x" : `${a}x`;
  return {
    prompt: { key: "limit", tex: `\\lim_{x \\to 0} \\frac{\\sin(${ax}) - ${ax}}{x^{3}}` },
    correct: number(frac(-(a ** 3), 6)),
    wrong: [
      tag(number(frac(a ** 3, 6)), "signError"),
      tag(ZERO, "indeterminateGuess"),
      tag(number(frac(-a, 6)), "taylorError"),
      tag(number(frac(-(a ** 3), 2)), "taylorError"),
      tag(MINUS_INF, "indeterminateGuess"),
    ],
    explanation: { key: "taylor", tex: "\\sin u = u - \\frac{u^{3}}{6} + o(u^{3})" },
    // probe chosen so that the cancellation in sin(ax) − ax stays far from rounding noise
    verify: { kind: "limit", f: (x) => (Math.sin(a * x) - a * x) / x ** 3, probe: 1e-3 },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const limits = {
  school: { rationalAtInfinity, sinOverX, growth, factor },
  university: { expLimit, rateAtZero, taylor, growth, rationalAtInfinity },
};
