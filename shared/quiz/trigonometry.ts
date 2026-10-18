import { frac, lin, piTex, sum, val, type Frac, type Fn } from "./tex";
import type { Generator, Option } from "./types";

const R2 = Math.SQRT2 / 2;
const R3 = Math.sqrt(3);
/** Exact values met on the unit circle, by absolute value. */
const EXACT: [number, string][] = [
  [0, "0"],
  [0.5, "\\frac{1}{2}"],
  [R2, "\\frac{\\sqrt{2}}{2}"],
  [R3 / 2, "\\frac{\\sqrt{3}}{2}"],
  [1, "1"],
  [R3, "\\sqrt{3}"],
  [R3 / 3, "\\frac{\\sqrt{3}}{3}"],
];

/** Exact value nearest to v, as an option (number snapped to the exact value). */
function exact(v: number): Option {
  const [abs, tex] = EXACT.find(([a]) => Math.abs(Math.abs(v) - a) < 1e-9) ?? [NaN, "?"];
  const negative = v < 0 && abs !== 0;
  return { tex: (negative ? "-" : "") + tex, num: negative ? -abs : abs };
}

const angleOption = (r: Frac): Option => ({ tex: piTex(r), num: val(r) * Math.PI });

const exactValue: Generator = (rng) => {
  const fnName = rng.pick(["sin", "cos", "tan"] as const);
  const angles: Frac[] = [];
  for (const q of [1, 2, 3, 4, 6]) {
    for (let p = 1; p < 2 * q; p++) {
      const r = frac(p, q);
      if (r.d !== q) continue; // already listed with a smaller denominator
      if (fnName === "tan" && Math.abs(Math.cos(val(r) * Math.PI)) < 1e-9) continue;
      angles.push(r);
    }
  }
  const r = rng.pick(angles);
  const x = val(r) * Math.PI;
  const value = Math[fnName](x);
  const correct = exact(value);
  const other = fnName === "sin" ? Math.cos(x) : fnName === "cos" ? Math.sin(x) : Math.abs(value) < 1e-9 ? 1 : 1 / value;
  const pool = fnName === "tan" ? [0, R3 / 3, 1, R3] : [0, 0.5, R2, R3 / 2, 1];
  const wrong = [exact(-value), exact(other), exact(-other)];
  for (const v of rng.shuffle(pool)) wrong.push(exact(rng.int(0, 1) === 0 ? v : -v));
  const call = `\\${fnName}\\left(${piTex(r)}\\right)`;
  return {
    prompt: { key: "exactValue", tex: call },
    correct,
    wrong,
    explanation: { key: "unitCircle", tex: `${call} = ${correct.tex}` },
    verify: { kind: "value", value },
  };
};

const setOption = (angles: Frac[]): Option => {
  const sorted = [...angles].sort((a, b) => val(a) - val(b));
  return {
    tex: `\\left\\{ ${sorted.map(piTex).join(",\\ ")} \\right\\}`,
    set: sorted.map((r) => val(r) * Math.PI),
  };
};

const trigEquation: Generator = (rng) => {
  // Angles α in ]0, π/2[ and their sine/cosine.
  const base = rng.pick([
    { r: frac(1, 6), sin: "\\frac{1}{2}", cos: "\\frac{\\sqrt{3}}{2}" },
    { r: frac(1, 4), sin: "\\frac{\\sqrt{2}}{2}", cos: "\\frac{\\sqrt{2}}{2}" },
    { r: frac(1, 3), sin: "\\frac{\\sqrt{3}}{2}", cos: "\\frac{1}{2}" },
  ]);
  const a = base.r;
  const A = (k: number, sign: 1 | -1): Frac => frac(k * a.d + sign * a.n, a.d); // kπ ± α
  const negative = rng.int(0, 1) === 1;
  const lo = 0;
  const hi = 2 * Math.PI;
  const interval = "0 \\le x < 2\\pi";

  if (rng.int(0, 1) === 0) {
    // cos x = v: x = ±β + 2kπ with β = α, or π − α when v < 0
    const beta = negative ? A(1, -1) : a;
    const v = (negative ? -1 : 1) * Math.cos(val(a) * Math.PI);
    const b = (k: number, sign: 1 | -1): Frac => frac(k * beta.d + sign * beta.n, beta.d);
    return {
      prompt: { key: "solveInterval", tex: `\\cos x = ${negative ? "-" : ""}${base.cos}, \\quad ${interval}` },
      correct: setOption([beta, b(2, -1)]),
      wrong: [
        setOption([beta, b(1, -1)]),
        setOption([beta]),
        setOption([b(0, -1), beta]),
        setOption([b(1, -1), b(1, 1)]),
        setOption([beta, b(1, 1)]),
      ],
      explanation: { key: "trigEquation", tex: `x = \\pm ${piTex(beta)} + 2k\\pi` },
      verify: { kind: "solutions", f: (x) => Math.cos(x) - v, lo, hi },
    };
  }
  // sin x = v: x = α + 2kπ or π − α + 2kπ (α < 0 when v < 0)
  const v = (negative ? -1 : 1) * Math.sin(val(a) * Math.PI);
  const prompt = { key: "solveInterval" as const, tex: `\\sin x = ${negative ? "-" : ""}${base.sin}, \\quad ${interval}` };
  const verify = { kind: "solutions" as const, f: (x: number) => Math.sin(x) - v, lo, hi };
  if (!negative) {
    return {
      prompt,
      correct: setOption([a, A(1, -1)]),
      wrong: [setOption([a, A(2, -1)]), setOption([a]), setOption([a, A(1, 1)]), setOption([A(0, -1), a])],
      explanation: { key: "trigEquation", tex: `x = ${piTex(a)} + 2k\\pi, \\quad x = \\pi - ${piTex(a)} + 2k\\pi` },
      verify,
    };
  }
  return {
    prompt,
    correct: setOption([A(1, 1), A(2, -1)]),
    wrong: [setOption([A(0, -1), A(1, 1)]), setOption([A(1, 1)]), setOption([a, A(1, -1)]), setOption([A(1, -1), A(1, 1)])],
    explanation: { key: "trigEquation", tex: `x = -${piTex(a)} + 2k\\pi, \\quad x = \\pi + ${piTex(a)} + 2k\\pi` },
    verify,
  };
};

type Case = { lhs: string; f: Fn; correct: [string, Fn][]; wrong: [string, Fn][] };
const { sin, cos, tan } = Math;

const SCHOOL_IDENTITIES: Case[] = [
  {
    lhs: "\\cos(2x)",
    f: (x) => cos(2 * x),
    correct: [
      ["1 - 2\\sin^{2}x", (x) => 1 - 2 * sin(x) ** 2],
      ["2\\cos^{2}x - 1", (x) => 2 * cos(x) ** 2 - 1],
      ["\\cos^{2}x - \\sin^{2}x", (x) => cos(x) ** 2 - sin(x) ** 2],
    ],
    wrong: [
      ["2\\sin^{2}x - 1", (x) => 2 * sin(x) ** 2 - 1],
      ["1 - 2\\cos^{2}x", (x) => 1 - 2 * cos(x) ** 2],
      ["2\\cos x", (x) => 2 * cos(x)],
      ["1 + 2\\sin^{2}x", (x) => 1 + 2 * sin(x) ** 2],
    ],
  },
  {
    lhs: "\\sin(2x)",
    f: (x) => sin(2 * x),
    correct: [["2\\sin x\\cos x", (x) => 2 * sin(x) * cos(x)]],
    wrong: [
      ["2\\sin x", (x) => 2 * sin(x)],
      ["\\sin x\\cos x", (x) => sin(x) * cos(x)],
      ["\\sin^{2}x - \\cos^{2}x", (x) => sin(x) ** 2 - cos(x) ** 2],
      ["2\\cos x", (x) => 2 * cos(x)],
    ],
  },
  ...(
    [
      ["\\cos(\\pi - x)", (x: number) => cos(Math.PI - x), "-c"],
      ["\\sin(\\pi - x)", (x: number) => sin(Math.PI - x), "s"],
      ["\\sin\\left(\\frac{\\pi}{2} - x\\right)", (x: number) => sin(Math.PI / 2 - x), "c"],
      ["\\sin(x + \\pi)", (x: number) => sin(x + Math.PI), "-s"],
      ["\\cos\\left(x + \\frac{\\pi}{2}\\right)", (x: number) => cos(x + Math.PI / 2), "-s"],
    ] as const
  ).map(([lhs, f, answer]): Case => {
    const all: [string, string, Fn][] = [
      ["s", "\\sin x", sin],
      ["-s", "-\\sin x", (x) => -sin(x)],
      ["c", "\\cos x", cos],
      ["-c", "-\\cos x", (x) => -cos(x)],
    ];
    return {
      lhs,
      f,
      correct: all.filter(([k]) => k === answer).map(([, t, g]) => [t, g]),
      wrong: all.filter(([k]) => k !== answer).map(([, t, g]) => [t, g]),
    };
  }),
];

const UNIVERSITY_IDENTITIES: Case[] = [
  {
    lhs: "\\cos^{2}x",
    f: (x) => cos(x) ** 2,
    correct: [["\\frac{1 + \\cos(2x)}{2}", (x) => (1 + cos(2 * x)) / 2]],
    wrong: [
      ["\\frac{1 - \\cos(2x)}{2}", (x) => (1 - cos(2 * x)) / 2],
      ["\\frac{1 + \\cos x}{2}", (x) => (1 + cos(x)) / 2],
      ["1 + \\cos(2x)", (x) => 1 + cos(2 * x)],
      ["2\\cos(2x)", (x) => 2 * cos(2 * x)],
    ],
  },
  {
    lhs: "\\sin^{2}x",
    f: (x) => sin(x) ** 2,
    correct: [["\\frac{1 - \\cos(2x)}{2}", (x) => (1 - cos(2 * x)) / 2]],
    wrong: [
      ["\\frac{1 + \\cos(2x)}{2}", (x) => (1 + cos(2 * x)) / 2],
      ["\\frac{1 - \\cos x}{2}", (x) => (1 - cos(x)) / 2],
      ["\\frac{\\sin(2x)}{2}", (x) => sin(2 * x) / 2],
    ],
  },
  {
    lhs: "\\tan(2x)",
    f: (x) => tan(2 * x),
    correct: [["\\frac{2\\tan x}{1 - \\tan^{2}x}", (x) => (2 * tan(x)) / (1 - tan(x) ** 2)]],
    wrong: [
      ["2\\tan x", (x) => 2 * tan(x)],
      ["\\frac{2\\tan x}{1 + \\tan^{2}x}", (x) => (2 * tan(x)) / (1 + tan(x) ** 2)],
      ["\\frac{\\tan x}{1 - \\tan^{2}x}", (x) => tan(x) / (1 - tan(x) ** 2)],
    ],
  },
  {
    lhs: "\\sin(3x)",
    f: (x) => sin(3 * x),
    correct: [["3\\sin x - 4\\sin^{3}x", (x) => 3 * sin(x) - 4 * sin(x) ** 3]],
    wrong: [
      ["3\\sin x", (x) => 3 * sin(x)],
      ["3\\sin x + 4\\sin^{3}x", (x) => 3 * sin(x) + 4 * sin(x) ** 3],
      ["4\\sin^{3}x - 3\\sin x", (x) => 4 * sin(x) ** 3 - 3 * sin(x)],
    ],
  },
];

const identity = (cases: Case[]): Generator => (rng) => {
  const c = rng.pick(cases);
  const [tex, fn] = rng.pick(c.correct);
  return {
    prompt: { key: "identity", tex: c.lhs },
    correct: { tex, fn },
    wrong: c.wrong.map(([t, g]) => ({ tex: t, fn: g })),
    explanation: { key: "trigFormula", tex: `${c.lhs} = ${tex}` },
    verify: { kind: "identity", f: c.f },
  };
};

const period: Generator = (rng) => {
  const a = rng.nonZero(-4, 4);
  const b = rng.int(2, 6);
  const c = rng.int(1, 5);
  const name = rng.pick(["\\sin", "\\cos"]);
  const T = frac(2, b);
  return {
    prompt: { key: "period", tex: `f(x) = ${sum([[a, `${name}(${lin(b, c)})`]])}` },
    correct: angleOption(T),
    wrong: [angleOption(frac(1, b)), angleOption(frac(2 * b)), angleOption(frac(2)), angleOption(frac(b, 2))],
    explanation: { key: "period", tex: `T = \\frac{2\\pi}{${b}} = ${piTex(T)}` },
    verify: { kind: "value", value: (2 * Math.PI) / b },
  };
};

const inverseTrig: Generator = (rng) => {
  const v = rng.pick([-1, -R3 / 2, -R2, -0.5, 0, 0.5, R2, R3 / 2]);
  const fnName = rng.pick(["acos", "asin"] as const);
  const angle = Math[fnName](v);
  const r = frac(Math.round((angle / Math.PI) * 12), 12);
  const vTex = exact(v).tex;
  const name = fnName === "acos" ? "\\arccos" : "\\arcsin";
  const back = fnName === "acos" ? "\\cos" : "\\sin";
  return {
    prompt: { key: "exactValue", tex: `${name}\\left(${vTex}\\right)` },
    correct: angleOption(r),
    wrong: [
      angleOption(frac(-r.n, r.d)),
      angleOption(frac(r.d - r.n, r.d)), // π − θ
      angleOption(frac(r.d + 2 * r.n, 2 * r.d)), // θ + π/2
      angleOption(frac(r.d - 2 * r.n, 2 * r.d)), // π/2 − θ
      angleOption(frac(2 * r.d - r.n, r.d)), // 2π − θ
    ],
    explanation: { key: "inverseTrig", tex: `${back}\\left(${piTex(r)}\\right) = ${vTex}` },
    verify: { kind: "value", value: angle },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
const schoolIdentity = identity(SCHOOL_IDENTITIES);
const universityIdentity = identity(UNIVERSITY_IDENTITIES);

export const trigonometry = {
  school: { exactValue, trigEquation, schoolIdentity },
  university: { universityIdentity, period, inverseTrig, trigEquation },
};
