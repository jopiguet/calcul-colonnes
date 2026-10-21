/**
 * Probability: the binomial law, conditional probability (trees, Bayes),
 * counting, expectation; at university also Poisson, exponential and normal
 * laws. Answers are exact fractions where they can be; each wrong option is a
 * named mistake, the classic ones first: the binomial coefficient forgotten,
 * P(A | B) taken for P(B | A), and the base rate ignored.
 */
import { frac, lines, numTex, val, type Frac } from "./tex";
import { tag, type Generator, type Option } from "./types";

const fracOption = (f: Frac): Option => ({ tex: numTex(f), num: val(f) });
const mul = (...fs: Frac[]): Frac => fs.reduce((a, b) => frac(a.n * b.n, a.d * b.d), frac(1));
const plus = (a: Frac, b: Frac): Frac => frac(a.n * b.d + b.n * a.d, a.d * b.d);
const minus = (a: Frac, b: Frac): Frac => frac(a.n * b.d - b.n * a.d, a.d * b.d);
const powF = (f: Frac, k: number): Frac => frac(f.n ** k, f.d ** k);
const div = (a: Frac, b: Frac): Frac => frac(a.n * b.d, a.d * b.n);
const one = frac(1);

export function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}
const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

/** \left(\frac{1}{3}\right)^{2}, or nothing when the exponent is 0. */
const powTex = (f: Frac, k: number): string => (k === 0 ? "" : k === 1 ? `${numTex(f)}` : `\\left(${numTex(f)}\\right)^{${k}}`);
const PROBS: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5]];

// ------------------------------------------------------------------ school

const binomial: Generator = (rng) => {
  const n = rng.int(3, 6);
  const k = rng.int(1, n - 1);
  const [a, b] = rng.pick(PROBS);
  const p = frac(a, b);
  const q = minus(one, p);
  const C = binom(n, k);
  const right = mul(frac(C), powF(p, k), powF(q, n - k));
  return {
    prompt: { key: "probability", tex: lines(`X \\sim \\mathcal{B}\\left(${n},\\ ${numTex(p)}\\right)`, `P(X = ${k}) = \\ ?`) },
    correct: fracOption(right),
    wrong: [
      tag(fracOption(mul(powF(p, k), powF(q, n - k))), "binomialCoefficient"),
      tag(fracOption(mul(frac(C), powF(p, k))), "complementForgotten"),
      tag(fracOption(mul(frac(C), powF(p, n - k), powF(q, k))), "powersSwapped"),
      tag(fracOption(mul(frac(n), powF(p, k), powF(q, n - k))), "binomialCoefficient"),
      tag(fracOption(powF(p, k)), "binomialCoefficient"),
    ],
    explanation: {
      key: "binomial",
      tex: `P(X = ${k}) = \\binom{${n}}{${k}} ${powTex(p, k)} ${powTex(q, n - k)} = ${C} \\cdot ${numTex(mul(powF(p, k), powF(q, n - k)))}`,
    },
    verify: { kind: "value", value: C * val(p) ** k * val(q) ** (n - k) },
  };
};

const binomialMean: Generator = (rng) => {
  const [a, b] = rng.pick(PROBS);
  const n = b * rng.int(2, 6);
  const p = frac(a, b);
  const q = minus(one, p);
  return {
    prompt: { key: "expectation", tex: `X \\sim \\mathcal{B}\\left(${n},\\ ${numTex(p)}\\right)` },
    correct: fracOption(mul(frac(n), p)),
    wrong: [
      tag(fracOption(mul(frac(n), p, q)), "meanVarianceConfused"),
      tag(fracOption(mul(frac(n), q)), "complementTaken"),
      tag(fracOption(div(frac(n), p)), "invertedRatio"),
      tag(fracOption(p), "wrongFactor"),
    ],
    explanation: { key: "binomialMoments", tex: `E(X) = np = ${n} \\cdot ${numTex(p)} = ${numTex(mul(frac(n), p))}` },
    verify: { kind: "value", value: n * val(p) },
  };
};

/** P(A), P(B | A), P(B | Ā) in tenths. */
function tree(rng: Parameters<Generator>[0]): { pa: Frac; pb: Frac; pc: Frac; given: string[] } {
  const pa = frac(rng.int(1, 9), 10);
  const pb = frac(rng.int(1, 9), 10);
  let pc = frac(rng.int(1, 9), 10);
  while (pc.n === pb.n && pc.d === pb.d) pc = frac(rng.int(1, 9), 10);
  const given = [`P(A) = ${numTex(pa)}`, `P(B \\mid A) = ${numTex(pb)}`, `P(B \\mid \\bar{A}) = ${numTex(pc)}`];
  return { pa, pb, pc, given };
}

const totalProbability: Generator = (rng) => {
  const { pa, pb, pc, given } = tree(rng);
  const total = plus(mul(pa, pb), mul(minus(one, pa), pc));
  return {
    prompt: { key: "probability", tex: lines(...given, `P(B) = \\ ?`) },
    correct: fracOption(total),
    wrong: [
      tag(fracOption(mul(pa, pb)), "branchForgotten"),
      tag(fracOption(div(plus(pb, pc), frac(2))), "notWeighted"),
      tag(fracOption(plus(mul(pa, pb), mul(pa, pc))), "complementForgotten"),
      tag(fracOption(plus(pb, pc)), "notWeighted"),
    ],
    explanation: {
      key: "totalProbability",
      tex: `P(B) = P(A)P(B \\mid A) + P(\\bar{A})P(B \\mid \\bar{A}) = ${numTex(pa)} \\cdot ${numTex(pb)} + ${numTex(minus(one, pa))} \\cdot ${numTex(pc)}`,
    },
    verify: { kind: "value", value: val(pa) * val(pb) + (1 - val(pa)) * val(pc) },
  };
};

const bayes: Generator = (rng) => {
  const { pa, pb, pc, given } = tree(rng);
  const joint = mul(pa, pb);
  const total = plus(joint, mul(minus(one, pa), pc));
  return {
    prompt: { key: "probability", tex: lines(...given, `P(A \\mid B) = \\ ?`) },
    correct: fracOption(div(joint, total)),
    wrong: [
      tag(fracOption(pb), "conditionalReversed"),
      tag(fracOption(joint), "jointForConditional"),
      tag(fracOption(div(pb, plus(pb, pc))), "baseRateIgnored"),
      tag(fracOption(total), "jointForConditional"),
      tag(fracOption(pa), "conditionalReversed"),
    ],
    explanation: {
      key: "bayes",
      tex: `P(A \\mid B) = \\frac{P(A)P(B \\mid A)}{P(B)} = \\frac{${numTex(joint)}}{${numTex(total)}}`,
    },
    verify: { kind: "value", value: (val(pa) * val(pb)) / (val(pa) * val(pb) + (1 - val(pa)) * val(pc)) },
  };
};

const combinations: Generator = (rng) => {
  const n = rng.int(5, 10);
  const k = rng.int(2, Math.min(4, n - 2));
  const C = binom(n, k);
  const arrangements = factorial(n) / factorial(n - k);
  const option = (x: number): Option => ({ tex: String(x), num: x });
  return {
    prompt: { key: "chooseUnordered", tex: `n = ${n}, \\qquad k = ${k}` },
    correct: option(C),
    wrong: [
      tag(option(arrangements), "orderCounted"),
      tag(option(n ** k), "withReplacement"),
      tag(option(n * k), "countingError"),
      tag(option(binom(n, k - 1)), "countingError"),
    ],
    explanation: { key: "combinations", tex: `\\binom{${n}}{${k}} = \\frac{${n}!}{${k}!\\,${n - k}!} = \\frac{${arrangements}}{${factorial(k)}} = ${C}` },
    verify: { kind: "value", value: C },
  };
};

const expectation: Generator = (rng) => {
  const size = rng.int(3, 4);
  const values = rng.shuffle([-3, -2, -1, 0, 1, 2, 3, 4, 5, 6]).slice(0, size).sort((a, b) => a - b);
  // Probabilities in tenths, each at least 1, summing to 10.
  const weights = Array<number>(size).fill(1);
  for (let left = 10 - size; left > 0; left--) weights[rng.int(0, size - 1)]!++;
  const probs = weights.map((w) => frac(w, 10));
  const E = probs.reduce((s, p, i) => plus(s, mul(p, frac(values[i]!))), frac(0));
  const mean = frac(values.reduce((a, b) => a + b, 0), size);
  const dropped = minus(E, mul(probs[0]!, frac(values[0]!)));
  const table = `\\begin{array}{c|${"c".repeat(size)}} x & ${values.join(" & ")} \\\\ \\hline P(X = x) & ${probs.map(numTex).join(" & ")} \\end{array}`;
  return {
    prompt: { key: "expectation", tex: table },
    correct: fracOption(E),
    wrong: [
      tag(fracOption(mean), "unweightedMean"),
      tag(fracOption(dropped), "termDropped"),
      tag(fracOption(frac(values.reduce((a, v, i) => a + v * weights[i]!, 0))), "wrongFactor"),
      tag(fracOption(probs.reduce((s, p, i) => plus(s, mul(p, frac(Math.abs(values[i]!)))), frac(0))), "signError"),
    ],
    explanation: { key: "expectation", tex: `E(X) = \\sum x \\, P(X = x) = ${values.map((v, i) => `${v < 0 ? `(${v})` : v} \\cdot ${numTex(probs[i]!)}`).join(" + ")}` },
    verify: { kind: "value", value: values.reduce((s, v, i) => s + v * val(probs[i]!), 0) },
  };
};

const union: Generator = (rng) => {
  const pa = frac(rng.int(1, 4), rng.pick([5, 6]));
  const pb = frac(rng.int(1, 3), rng.pick([4, 5]));
  const both = mul(pa, pb);
  return {
    prompt: { key: "independent", tex: lines(`P(A) = ${numTex(pa)}, \\quad P(B) = ${numTex(pb)}`, `P(A \\cup B) = \\ ?`) },
    correct: fracOption(minus(plus(pa, pb), both)),
    wrong: [
      tag(fracOption(plus(pa, pb)), "unionNotSubtracted"),
      tag(fracOption(both), "unionNotSubtracted"),
      tag(fracOption(mul(minus(one, pa), minus(one, pb))), "complementForgotten"),
      tag(fracOption(minus(plus(pa, pb), frac(both.n, both.d * 2))), "wrongFactor"),
    ],
    explanation: {
      key: "union",
      tex: `P(A \\cup B) = P(A) + P(B) - P(A)P(B) = ${numTex(pa)} + ${numTex(pb)} - ${numTex(both)}`,
    },
    verify: { kind: "value", value: val(pa) + val(pb) - val(pa) * val(pb) },
  };
};

// ------------------------------------------------------------- university

const binomialVariance: Generator = (rng) => {
  const [a, b] = rng.pick(PROBS);
  const n = b * b * rng.int(1, 3);
  const p = frac(a, b);
  const q = minus(one, p);
  const V = mul(frac(n), p, q);
  return {
    prompt: { key: "variance", tex: `X \\sim \\mathcal{B}\\left(${n},\\ ${numTex(p)}\\right)` },
    correct: fracOption(V),
    wrong: [
      tag(fracOption(mul(frac(n), p)), "meanVarianceConfused"),
      tag(fracOption(mul(frac(n), p, p)), "wrongFactor"),
      tag({ tex: `\\sqrt{${numTex(V)}}`, num: Math.sqrt(val(V)) }, "sdVarianceConfused"),
      tag(fracOption(mul(frac(n), p, q, q)), "wrongFactor"),
    ],
    explanation: { key: "binomialMoments", tex: `V(X) = np(1 - p) = ${n} \\cdot ${numTex(p)} \\cdot ${numTex(q)} = ${numTex(V)}` },
    verify: { kind: "value", value: n * val(p) * val(q) },
  };
};

/** λ^k / k! · e^{−λ} as a fraction times e^{−λ}. */
function eTimes(c: Frac, exponent: number): Option {
  const e = exponent === 1 ? "e" : `e^{${exponent}}`;
  const coef = c.n === 1 && c.d === 1 ? "" : c.d === 1 ? String(c.n) : numTex(c);
  return { tex: `${coef}${e}`, num: val(c) * Math.exp(exponent) };
}

const poisson: Generator = (rng) => {
  const lambda = rng.int(1, 4);
  const k = rng.int(1, 4);
  const c = frac(lambda ** k, factorial(k));
  return {
    prompt: { key: "probability", tex: lines(`X \\sim \\mathcal{P}(${lambda})`, `P(X = ${k}) = \\ ?`) },
    correct: eTimes(c, -lambda),
    wrong: [
      tag(eTimes(frac(lambda ** k), -lambda), "factorialForgotten"),
      tag(eTimes(c, lambda), "signError"),
      tag(eTimes(frac(1, factorial(k)), -lambda), "termDropped"),
      tag(fracOption(c), "termDropped"),
      tag(eTimes(frac(lambda * k, factorial(k)), -lambda), "wrongFactor"),
    ],
    explanation: { key: "poisson", tex: `P(X = k) = e^{-\\lambda}\\frac{\\lambda^{k}}{k!} = e^{-${lambda}}\\frac{${lambda}^{${k}}}{${k}!}` },
    verify: { kind: "value", value: (Math.exp(-lambda) * lambda ** k) / factorial(k) },
  };
};

const exponential: Generator = (rng) => {
  const lambda = rng.pick([frac(1, 2), frac(1), frac(2), frac(3), frac(1, 3)]);
  const t = rng.int(1, 4);
  const exp = (x: Frac, sign = -1): Option => {
    const e = mul(frac(sign), x);
    return { tex: e.n === 0 ? "1" : `e^{${numTex(e)}}`, num: Math.exp(val(e)) };
  };
  const lt = mul(lambda, frac(t));
  return {
    prompt: { key: "probability", tex: lines(`X \\sim \\mathcal{E}\\left(${numTex(lambda)}\\right)`, `P(X > ${t}) = \\ ?`) },
    correct: exp(lt),
    wrong: [
      tag({ tex: `1 - ${exp(lt).tex}`, num: 1 - Math.exp(-val(lt)) }, "complementTaken"),
      tag(exp(div(frac(t), lambda)), "rateMeanConfused"),
      tag({ tex: `${numTex(lambda)}${exp(lt).tex}`, num: val(lambda) * Math.exp(-val(lt)) }, "densityForProbability"),
      tag(exp(lt, 1), "signError"),
    ],
    explanation: { key: "exponentialLaw", tex: `P(X > t) = \\int_{t}^{+\\infty} \\lambda e^{-\\lambda x}\\,dx = e^{-\\lambda t} = e^{-${numTex(lt)}}` },
    verify: { kind: "value", value: Math.exp(-val(lt)) },
  };
};

const standardize: Generator = (rng) => {
  const mu = rng.int(2, 20) * 5;
  const sigma = rng.int(2, 10);
  // x stays a whole number (no decimal point, whose sign differs by language).
  const k = rng.pick(sigma % 2 === 0 ? [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5] : [-2, -1, 1, 2, 3]);
  const x = mu + k * sigma;
  const z = frac(Math.round((x - mu) * 2), 2 * sigma);
  const option = (f: Frac): Option => fracOption(f);
  return {
    prompt: { key: "standardize", tex: lines(`X \\sim \\mathcal{N}\\left(${mu},\\ ${sigma}^{2}\\right)`, `x = ${String(x)}`) },
    correct: option(z),
    wrong: [
      tag(option(frac(Math.round((x - mu) * 2), 2 * sigma * sigma)), "sdVarianceConfused"),
      tag(option(frac(Math.round((mu - x) * 2), 2 * sigma)), "signError"),
      tag(option(frac(Math.round(x * 2), 2 * sigma)), "termDropped"),
      tag(option(frac(Math.round((x - mu) * 2 * sigma), 2)), "invertedRatio"),
    ],
    explanation: { key: "standardize", tex: `z = \\frac{x - \\mu}{\\sigma} = \\frac{${String(x)} - ${mu}}{${sigma}} = ${numTex(z)}` },
    verify: { kind: "value", value: (x - mu) / sigma },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const probability = {
  school: { binomial, binomialMean, totalProbability, bayes, combinations, expectation, union },
  university: { binomialVariance, bayes, poisson, exponential, standardize, combinations },
};
