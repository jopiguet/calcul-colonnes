/**
 * Series (university): geometric series from n = 0 or n = 1, telescoping
 * sums of 1/(n(n + k)), the exponential series, radii of convergence.
 *
 * The check script sums the terms numerically and estimates radii from the
 * coefficients; it does not use the formulas below. Classic mistakes: the
 * first index ignored, a/(1 + q), only one of the partial fractions summed,
 * the radius inverted, the square root forgotten for x^(2n).
 */
import { add, ePow, frac, numTex, type Frac } from "./tex";
import { tag, type Generator, type Option } from "./types";

const fracOption = (f: Frac): Option => ({ tex: numTex(f), num: f.n / f.d });
const mul = (a: Frac, b: Frac): Frac => frac(a.n * b.n, a.d * b.d);
const div = (a: Frac, b: Frac): Frac => frac(a.n * b.d, a.d * b.n);
const fracPow = (f: Frac, k: number): Frac => frac(f.n ** k, f.d ** k);
const parenTex = (f: Frac): string => (f.n < 0 || f.d !== 1 ? `\\left(${numTex(f)}\\right)` : numTex(f));
const sumTex = (from: number, body: string): string => `\\sum_{n=${from}}^{+\\infty} ${body}`;

const RATIOS: Frac[] = [frac(1, 2), frac(1, 3), frac(2, 3), frac(1, 4), frac(3, 4), frac(2, 5), frac(-1, 2), frac(-1, 3), frac(-2, 3)];

const geometricSeries: Generator = (rng) => {
  const q = rng.pick(RATIOS);
  const a = rng.nonZero(-4, 5);
  const from = rng.int(0, 1);
  const oneMinusQ = add(1, frac(-q.n, q.d));
  /** a·q^start / den. */
  const over = (start: number, den: Frac, coef = a): Frac => div(mul(frac(coef), fracPow(q, start)), den);
  const qv = q.n / q.d;
  return {
    prompt: { key: "seriesSum", tex: sumTex(from, `${a === 1 ? "" : a === -1 ? "-" : a}${parenTex(q)}^{n}`) },
    correct: fracOption(over(from, oneMinusQ)),
    wrong: [
      tag(fracOption(over(1 - from, oneMinusQ)), "offByOne"),
      tag(fracOption(over(from, add(1, q))), "signError"),
      tag(fracOption(over(from, oneMinusQ, 1)), "termDropped"),
      tag(fracOption(over(from, fracPow(oneMinusQ, 2))), "wrongFactor"),
    ],
    explanation: { key: "geometricSeries", tex: `${sumTex(from, "a q^{n}")} = \\frac{a q^{${from}}}{1 - q}, \\quad |q| = ${numTex(frac(Math.abs(q.n), q.d))} < 1` },
    verify: { kind: "series", term: (n) => a * qv ** n, from, terms: 4000 },
  };
};

/** 1 + 1/2 + … + 1/k. */
const harmonic = (k: number): Frac => {
  let h = frac(0);
  for (let i = 1; i <= k; i++) h = add(h, frac(1, i));
  return h;
};

const telescoping: Generator = (rng) => {
  const k = rng.int(2, 4);
  const c = rng.pick([1, 2, 3, 4, 6, 12]);
  const scaled = (h: Frac, d: number): Frac => mul(frac(c, d), h);
  return {
    prompt: { key: "seriesSum", tex: sumTex(1, `\\frac{${c}}{n(n + ${k})}`) },
    correct: fracOption(scaled(harmonic(k), k)),
    wrong: [
      tag(fracOption(frac(c, k)), "telescopingTerms"),
      tag(fracOption(scaled(harmonic(k), 1)), "telescopingTerms"),
      tag(fracOption(scaled(harmonic(k + 1), k)), "offByOne"),
      tag(fracOption(scaled(harmonic(k - 1), k)), "offByOne"),
      tag(fracOption(scaled(harmonic(k), 2 * k)), "wrongFactor"),
    ],
    explanation: {
      key: "telescoping",
      tex: `\\frac{1}{n(n + ${k})} = \\frac{1}{${k}}\\left(\\frac{1}{n} - \\frac{1}{n + ${k}}\\right), \\quad \\sum = \\frac{${c}}{${k}}\\left(${Array.from({ length: k }, (_, i) => (i === 0 ? "1" : `\\frac{1}{${i + 1}}`)).join(" + ")}\\right)`,
    },
    verify: { kind: "series", term: (n) => c / (n * (n + k)), from: 1, terms: 100000 },
  };
};

const exponentialSeries: Generator = (rng) => {
  const k = rng.pick([1, 2, 3, -1, -2]);
  const from = rng.int(0, 1);
  const value = (e: number, start: number): Option => ({ tex: start === 0 ? ePow(e) : `${ePow(e)} - 1`, num: Math.exp(e) - start });
  const wrong: Option[] = [
    tag(value(k, 1 - from), "offByOne"),
    tag(value(-k, from), "signError"),
    tag({ tex: `${k === -1 ? "-" : k}${ePow(k)}${from === 0 ? "" : " - 1"}`, num: k * Math.exp(k) - from }, "wrongFactor"),
  ];
  if (k !== 1) wrong.push(tag({ tex: numTex(frac(1, 1 - k)), num: 1 / (1 - k) - from }, "arithmeticGeometricConfused"));
  const kn = k === 1 ? "1" : k < 0 ? `(${k})^{n}` : `${k}^{n}`;
  return {
    prompt: { key: "seriesSum", tex: sumTex(from, `\\frac{${kn}}{n!}`) },
    correct: value(k, from),
    wrong,
    explanation: { key: "exponentialSeries", tex: `e^{x} = \\sum_{n=0}^{+\\infty} \\frac{x^{n}}{n!}, \\quad x = ${k}` },
    verify: {
      kind: "series",
      term: (n) => {
        let t = 1;
        for (let i = 1; i <= n; i++) t *= k / i;
        return t;
      },
      from,
      terms: 80,
    },
  };
};

const radius: Generator = (rng) => {
  const square = rng.int(0, 2) === 0;
  const p = rng.int(0, 2);
  const np = p === 0 ? "" : p === 1 ? "n" : "n^{2}";
  const num = (x: number): Option => ({ tex: numTex(x), num: x });
  const inv = (x: number): Option => fracOption(frac(1, x));
  if (square) {
    const s = rng.pick([2, 3, 4]);
    const r = s * s;
    return {
      prompt: { key: "radius", tex: sumTex(1, `\\frac{${np || "1"}}{${r}^{n}} x^{2n}`) },
      correct: num(s),
      wrong: [tag(num(r), "sqrtForgotten"), tag(inv(s), "invertedRatio"), tag(inv(r), "invertedRatio"), tag(num(1), "dominantTerms")],
      explanation: { key: "radius", tex: `\\left|\\frac{${np || "1"}}{${r}^{n}} x^{2n}\\right|^{1/n} \\to \\frac{x^{2}}{${r}} < 1 \\iff |x| < ${s}` },
      verify: { kind: "radius", logCoef: (n) => p * Math.log(n) - n * Math.log(r), power: 2 },
    };
  }
  const r = rng.pick([2, 3, 4, 5]);
  const up = rng.int(0, 1) === 0; // rⁿ in the numerator: R = 1/r
  const body = up ? (np ? `\\frac{${r}^{n}}{${np}}` : `${r}^{n}`) : `\\frac{${np || "1"}}{${r}^{n}}`;
  const R = up ? inv(r) : num(r);
  return {
    prompt: { key: "radius", tex: sumTex(1, `${body} x^{n}`) },
    correct: R,
    wrong: [
      tag(up ? num(r) : inv(r), "invertedRatio"),
      tag(num(1), "dominantTerms"),
      tag(up ? inv(r * r) : num(r * r), "powerMisapplied"),
      tag(up ? fracOption(frac(p + 1, r)) : num(r * (p + 1)), "wrongFactor"),
    ],
    explanation: { key: "radius", tex: `|a_{n}|^{1/n} \\to ${up ? r : `\\frac{1}{${r}}`}, \\quad R = ${up ? `\\frac{1}{${r}}` : r}` },
    verify: { kind: "radius", logCoef: (n) => (up ? 1 : -1) * (n * Math.log(r) - p * Math.log(n)), power: 1 },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const series = {
  school: {},
  university: { geometricSeries, telescoping, exponentialSeries, radius },
};
