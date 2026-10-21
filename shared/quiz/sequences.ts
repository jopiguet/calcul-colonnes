/**
 * Sequences: arithmetic and geometric terms and sums, limits of qⁿ, and
 * u(n+1) = a·u(n) + b (its limit, and at university its explicit term).
 * The classic mistake is counted first: off by one, on the index or on the
 * number of terms of a sum.
 */
import { frac, lines, numTex, sum, val, type Frac } from "./tex";
import { tag, type Generator, type Option } from "./types";

const numOption = (x: number): Option => ({ tex: numTex(x), num: x });
const fracOption = (f: Frac): Option => ({ tex: numTex(f), num: val(f) });

/** The first index: u₀ or u₁, so that the off-by-one mistake has something to bite on. */
const startOf = (rng: Parameters<Generator>[0]): 0 | 1 => (rng.int(0, 1) as 0 | 1);

// ------------------------------------------------------------------ school

const arithmeticTerm: Generator = (rng) => {
  const s = startOf(rng);
  const u = rng.int(-9, 12);
  const r = rng.nonZero(-6, 7);
  const n = rng.int(8, 30);
  const steps = n - s;
  return {
    prompt: { key: "arithmeticTerm", tex: lines(`u_{${s}} = ${u}, \\quad r = ${r}`, `u_{${n}} = \\ ?`) },
    correct: numOption(u + steps * r),
    wrong: [
      tag(numOption(u + (steps + (s === 0 ? -1 : 1)) * r), "offByOne"),
      tag(numOption(u - steps * r), "signError"),
      tag(numOption(u * r ** Math.min(steps, 3)), "arithmeticGeometricConfused"),
      tag(numOption(steps * r), "firstTermKept"),
      tag(numOption(u + n * r + (s === 0 ? r : 0)), "offByOne"),
    ],
    explanation: { key: "arithmeticTerm", tex: `u_{n} = u_{${s}} + (n - ${s})r, \\quad u_{${n}} = ${u} + ${steps} \\cdot ${r < 0 ? `(${r})` : r}` },
    verify: { kind: "value", value: u + steps * r },
  };
};

const geometricTerm: Generator = (rng) => {
  const s = startOf(rng);
  const u = rng.nonZero(-5, 6);
  const q = rng.pick([2, 3, -2, -3]);
  const n = s + rng.int(3, 7);
  const steps = n - s;
  return {
    prompt: { key: "geometricTerm", tex: lines(`u_{${s}} = ${u}, \\quad q = ${q}`, `u_{${n}} = \\ ?`) },
    correct: numOption(u * q ** steps),
    wrong: [
      tag(numOption(u * q ** (steps + (s === 0 ? -1 : 1))), "offByOne"),
      tag(numOption(u + steps * q), "arithmeticGeometricConfused"),
      tag(numOption(u * steps * q), "wrongFactor"),
      tag(numOption(q ** steps), "firstTermKept"),
    ],
    explanation: { key: "geometricTerm", tex: `u_{n} = u_{${s}} \\, q^{\\,n - ${s}}, \\quad u_{${n}} = ${u} \\cdot ${q < 0 ? `(${q})` : q}^{${steps}}` },
    verify: { kind: "value", value: u * q ** steps },
  };
};

const arithmeticSum: Generator = (rng) => {
  const u0 = rng.int(-5, 10);
  const r = rng.nonZero(-3, 5);
  const n = rng.int(9, 40);
  const last = u0 + n * r;
  const S = ((n + 1) * (u0 + last)) / 2;
  return {
    prompt: { key: "arithmeticSum", tex: lines(`u_{0} = ${u0}, \\quad r = ${r}`, `\\sum_{k=0}^{${n}} u_{k} = \\ ?`) },
    correct: numOption(S),
    wrong: [
      tag(fracOption(frac(n * (u0 + last), 2)), "offByOne"),
      tag(numOption((n + 1) * (u0 + last)), "wrongFactor"),
      tag(numOption((n + 1) * last), "firstTermKept"),
      tag(fracOption(frac((n + 1) * (u0 + last - r), 2)), "offByOne"),
    ],
    explanation: {
      key: "arithmeticSum",
      tex: `\\sum_{k=0}^{${n}} u_{k} = ${n + 1} \\cdot \\frac{u_{0} + u_{${n}}}{2} = ${n + 1} \\cdot \\frac{${u0} + ${last < 0 ? `(${last})` : last}}{2}`,
    },
    verify: { kind: "value", value: Array.from({ length: n + 1 }, (_, k) => u0 + k * r).reduce((a, b) => a + b, 0) },
  };
};

const geometricSum: Generator = (rng) => {
  const u0 = rng.nonZero(-4, 5);
  const q = rng.pick([2, 3, -2, -3]);
  const n = rng.int(4, 9);
  const S = (u0 * (1 - q ** (n + 1))) / (1 - q);
  return {
    prompt: { key: "geometricSum", tex: lines(`u_{0} = ${u0}, \\quad q = ${q}`, `\\sum_{k=0}^{${n}} u_{k} = \\ ?`) },
    correct: numOption(S),
    wrong: [
      tag(numOption((u0 * (1 - q ** n)) / (1 - q)), "offByOne"),
      tag(numOption(-S), "signError"),
      tag(numOption(u0 * (1 - q ** (n + 1))), "wrongFactor"),
      tag(numOption(u0 * q ** n * (n + 1)), "arithmeticGeometricConfused"),
    ],
    explanation: { key: "geometricSum", tex: `\\sum_{k=0}^{${n}} u_{0} q^{k} = u_{0} \\, \\frac{1 - q^{${n + 1}}}{1 - q} = ${u0} \\cdot \\frac{1 - (${q})^{${n + 1}}}{1 - (${q})}` },
    verify: { kind: "value", value: Array.from({ length: n + 1 }, (_, k) => u0 * q ** k).reduce((a, b) => a + b, 0) },
  };
};

const geometricLimit: Generator = (rng) => {
  const u = rng.nonZero(-5, 6);
  // |q| < 1 (towards 0) or q > 1 (towards ±∞); q ≤ −1 has no limit and is not asked.
  const q = rng.pick([frac(1, 2), frac(2, 3), frac(3, 4), frac(-1, 2), frac(-2, 5), frac(3, 2), frac(5, 4), frac(2), frac(4, 3)]);
  const big = val(q) > 1;
  const inf = (sign: number): Option => ({ tex: sign > 0 ? "+\\infty" : "-\\infty", num: sign > 0 ? Infinity : -Infinity });
  const correct = big ? inf(u) : numOption(0);
  return {
    prompt: { key: "limit", tex: `\\lim_{n \\to +\\infty} ${u === 1 ? "" : u === -1 ? "-" : u}\\left(${numTex(q)}\\right)^{n}` },
    correct,
    wrong: [
      tag(big ? numOption(0) : inf(u), "convergenceMisjudged"),
      tag(numOption(u), "firstTermKept"),
      tag(big ? inf(-u) : numOption(1), big ? "signError" : "indeterminateGuess"),
      tag(fracOption(frac(u * q.d, q.d - q.n)), "convergenceMisjudged"),
    ],
    explanation: { key: "geometricLimit", tex: `\\left|${numTex(q)}\\right| ${big ? ">" : "<"} 1 \\Rightarrow \\left(${numTex(q)}\\right)^{n} \\to ${big ? "+\\infty" : "0"}` },
    verify: { kind: "limit", f: (x) => u * val(q) ** Math.round(x), probe: 400 },
  };
};

const fixedPoint: Generator = (rng) => {
  const a = rng.pick([frac(1, 2), frac(1, 3), frac(2, 3), frac(-1, 2), frac(1, 4), frac(3, 4)]);
  const b = rng.nonZero(-6, 8);
  const u0 = rng.int(-5, 9);
  const l = div(frac(b), minus1(a));
  const iterate = (n: number): number => {
    let x = u0;
    for (let i = 0; i < n; i++) x = val(a) * x + b;
    return x;
  };
  return {
    prompt: {
      key: "limit",
      tex: lines(`u_{0} = ${u0}, \\quad u_{n+1} = ${sum([[a, "u_{n}"], [b, ""]])}`, `\\lim_{n \\to +\\infty} u_{n} = \\ ?`),
    },
    correct: fracOption(l),
    wrong: [
      tag(fracOption(div(frac(b), plus1(a))), "signError"),
      tag(numOption(b), "termDropped"),
      tag(numOption(u0), "firstTermKept"),
      tag(fracOption(div(frac(b), a)), "invertedRatio"),
      tag(fracOption(div(frac(-b), minus1(a))), "signError"),
    ],
    explanation: { key: "fixedPoint", tex: `\\ell = ${numTex(a)}\\,\\ell ${b < 0 ? "-" : "+"} ${Math.abs(b)} \\iff \\ell = ${numTex(l)}` },
    verify: { kind: "limit", f: (x) => iterate(Math.round(x)), probe: 200 },
  };
};

const div = (x: Frac, y: Frac): Frac => frac(x.n * y.d, x.d * y.n);
const minus1 = (a: Frac): Frac => frac(a.d - a.n, a.d);
const plus1 = (a: Frac): Frac => frac(a.d + a.n, a.d);

// ------------------------------------------------------------- university

/** u(n+1) = a·u(n) + b, a > 1: uₙ = aⁿ(u₀ − ℓ) + ℓ. Options are functions of n. */
const explicitTerm: Generator = (rng) => {
  const a = rng.pick([2, 3, 4]);
  const l = rng.nonZero(-4, 5);
  const b = l * (1 - a); // so that ℓ = b/(1 − a) is a whole number
  let u0 = rng.int(-4, 8);
  if (u0 === l) u0 += 2;
  const c = u0 - l;
  const term = (k: number, shift: number): { tex: string; fn: (x: number) => number } => ({
    tex: sum([[k, `${a}^{n}`], [shift, ""]]),
    fn: (x) => k * a ** x + shift,
  });
  return {
    prompt: { key: "explicitTerm", tex: lines(`u_{0} = ${u0}`, `u_{n+1} = ${sum([[a, "u_{n}"], [b, ""]])}`) },
    correct: term(c, l),
    wrong: [
      tag(term(u0, l), "fixedPointForgotten"),
      tag(term(c, -l), "signError"),
      tag(term(u0, 0), "fixedPointForgotten"),
      tag({ tex: sum([[c, `${a}^{n-1}`], [l, ""]]), fn: (x) => c * a ** (x - 1) + l }, "offByOne"),
      tag(term(u0 + l, -l), "signError"),
    ],
    explanation: { key: "explicitTerm", tex: `\\ell = ${numTex(l)}, \\quad v_{n} = u_{n} - \\ell = ${a}^{n}(u_{0} - \\ell) = ${c} \\cdot ${a}^{n}` },
    verify: { kind: "identity", f: (x) => a ** x * c + l },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const sequences = {
  school: { arithmeticTerm, geometricTerm, arithmeticSum, geometricSum, geometricLimit, fixedPoint },
  university: { geometricSum, geometricLimit, fixedPoint, explicitTerm },
};
