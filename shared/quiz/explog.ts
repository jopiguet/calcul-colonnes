import { frac, lin, numTex, sum, val, type Coef } from "./tex";
import type { Generator, Option } from "./types";

const valueOption = (tex: string, num: number): Option => ({ tex, num });

const solveExp: Generator = (rng) => {
  const a = rng.nonZero(-4, 4);
  const b = rng.nonZero(-5, 5);
  const c = rng.int(2, 9);
  const over = (top: string, num: number): Option =>
    valueOption(a === 1 ? top : a === -1 ? `-(${top})` : `\\frac{${top}}{${a}}`, num / a);
  return {
    prompt: { key: "solve", tex: `e^{${lin(a, b)}} = ${c}` },
    correct: over(sum([[1, `\\ln ${c}`], [-b, ""]]), Math.log(c) - b),
    wrong: [
      over(sum([[1, `\\ln ${c}`], [b, ""]]), Math.log(c) + b),
      over(numTex(c - b), c - b),
      valueOption(sum([[frac(1, a), `\\ln ${c}`], [-b, ""]]), Math.log(c) / a - b),
      over(`e^{${c}} ${b > 0 ? "-" : "+"} ${Math.abs(b)}`, Math.exp(c) - b),
    ],
    explanation: { key: "expLog", tex: `${lin(a, b)} = \\ln ${c}` },
    verify: { kind: "root", f: (x) => Math.exp(a * x + b) - c },
  };
};

const logRules: Generator = (rng) => {
  const a = rng.pick([2, 3, 5, 7]);
  const n = rng.int(3, 9);
  const m = rng.int(1, n - 1);
  const L = (k: Coef, arg = a): Option => valueOption(sum([[k, `\\ln ${arg}`]]), val(k) * Math.log(arg));
  return {
    prompt: { key: "simplify", tex: `\\ln\\left(${a}^{${n}}\\right) - \\ln\\left(${a}^{${m}}\\right)` },
    correct: L(n - m),
    wrong: [L(frac(n, m)), L(n + m), L(1, n - m), L(n * m)],
    explanation: { key: "logRules", tex: `\\ln\\left(a^{n}\\right) = n\\ln a, \\quad ${n}\\ln ${a} - ${m}\\ln ${a} = ${sum([[n - m, `\\ln ${a}`]])}` },
    verify: { kind: "value", value: Math.log(a ** n) - Math.log(a ** m) },
  };
};

const expOfLogs: Generator = (rng) => {
  const a = rng.int(2, 9);
  const b = rng.int(2, 9);
  return {
    prompt: { key: "simplify", tex: `e^{\\ln ${a} + \\ln ${b}}` },
    correct: valueOption(String(a * b), a * b),
    wrong: [
      valueOption(String(a + b), a + b),
      valueOption(`\\ln ${a * b}`, Math.log(a * b)),
      valueOption(`e^{${a + b}}`, Math.exp(a + b)),
      valueOption(`e^{${a * b}}`, Math.exp(a * b)),
    ],
    explanation: { key: "expLog", tex: `e^{\\ln ${a} + \\ln ${b}} = e^{\\ln ${a}} \\cdot e^{\\ln ${b}} = ${a} \\cdot ${b}` },
    verify: { kind: "value", value: Math.exp(Math.log(a) + Math.log(b)) },
  };
};

const solveLn: Generator = (rng) => {
  const k = rng.nonZero(-3, 4);
  const wrong: Option[] = [
    valueOption(`e^{${-k}}`, Math.exp(-k)),
    valueOption(`10^{${k}}`, 10 ** k),
    valueOption(numTex(k), k),
    valueOption(`${k === 1 ? "" : k === -1 ? "-" : k}e`, k * Math.E),
  ];
  if (k > 0) wrong.push(valueOption(`\\ln ${k}`, Math.log(k)));
  return {
    prompt: { key: "solve", tex: `\\ln x = ${k}` },
    correct: valueOption(k === 1 ? "e" : `e^{${k}}`, Math.exp(k)),
    wrong,
    explanation: { key: "expLog", tex: `\\ln x = ${k} \\iff x = e^{${k}}` },
    verify: { kind: "root", f: (x) => Math.log(x) - k },
  };
};

// ------------------------------------------------------------- university

const otherBase: Generator = (rng) => {
  const b = rng.pick([2, 3, 5, 10]);
  let c = rng.int(3, 40);
  while (Math.abs(Math.log(c) / Math.log(b) - Math.round(Math.log(c) / Math.log(b))) < 1e-9) c += 1;
  return {
    prompt: { key: "solve", tex: `${b}^{x} = ${c}` },
    correct: valueOption(`\\frac{\\ln ${c}}{\\ln ${b}}`, Math.log(c) / Math.log(b)),
    wrong: [
      valueOption(`\\frac{\\ln ${b}}{\\ln ${c}}`, Math.log(b) / Math.log(c)),
      valueOption(`\\ln ${c} - \\ln ${b}`, Math.log(c) - Math.log(b)),
      valueOption(`\\frac{${c}}{${b}}`, c / b),
      valueOption(`\\ln ${c}`, Math.log(c)),
    ],
    explanation: { key: "expLog", tex: `${b}^{x} = e^{x\\ln ${b}} = ${c} \\iff x\\ln ${b} = \\ln ${c}` },
    verify: { kind: "root", f: (x) => b ** x - c },
  };
};

const quadraticInExp: Generator = (rng) => {
  const a = rng.int(2, 9);
  const set = (tex: string, values: number[]): Option => ({
    tex: `\\left\\{ ${tex} \\right\\}`,
    set: [...values].sort((x, y) => x - y),
  });
  const la = Math.log(a);
  return {
    prompt: { key: "solveInterval", tex: `e^{2x} - ${a + 1}e^{x} + ${a} = 0, \\quad x \\in \\mathbb{R}` },
    correct: set(`0,\\ \\ln ${a}`, [0, la]),
    wrong: [
      set(`1,\\ ${a}`, [1, a]),
      set(`\\ln ${a}`, [la]),
      set(`0,\\ ${a}`, [0, a]),
      set(`-\\ln ${a},\\ 0`, [-la, 0]),
    ],
    explanation: { key: "substituteExp", tex: `X = e^{x}: \\ X^{2} - ${a + 1}X + ${a} = (X - 1)(X - ${a}) = 0` },
    verify: { kind: "solutions", f: (x) => Math.exp(2 * x) - (a + 1) * Math.exp(x) + a, lo: -20, hi: 20 },
  };
};

const expDerivative: Generator = (rng) => {
  const a = rng.pick([2, 3, 5, 10]);
  return {
    prompt: { key: "derivative", tex: `f(x) = ${a}^{x}` },
    correct: { tex: `${a}^{x}\\ln ${a}`, fn: (x) => a ** x * Math.log(a) },
    wrong: [
      { tex: `x \\cdot ${a}^{x-1}`, fn: (x) => x * a ** (x - 1) },
      { tex: `${a}^{x}`, fn: (x) => a ** x },
      { tex: `\\frac{${a}^{x}}{\\ln ${a}}`, fn: (x) => a ** x / Math.log(a) },
      { tex: `${a}^{x}\\ln x`, fn: (x) => a ** x * Math.log(x) },
    ],
    explanation: { key: "expLog", tex: `${a}^{x} = e^{x\\ln ${a}} \\Rightarrow (${a}^{x})' = \\ln ${a} \\cdot e^{x\\ln ${a}}` },
    verify: { kind: "derivative", f: (x) => a ** x },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const explog = {
  school: { solveExp, logRules, expOfLogs, solveLn },
  university: { otherBase, quadraticInExp, expDerivative, solveExp },
};

