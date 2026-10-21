/**
 * Complex numbers: algebraic form (product, quotient), modulus, argument,
 * exponential form, second-degree equations with a negative discriminant;
 * at university De Moivre and n-th roots.
 *
 * Answers are complex numbers (`z`) or sets of them (`zs`); exact forms use
 * the angles whose cosine and sine are known (multiples of π/6 and π/4).
 * The classic mistakes: i² taken as +1, a quotient divided component by
 * component, the argument in the wrong quadrant.
 */
import { frac, numTex, piTex, sum, type Frac } from "./tex";
import { tag, type Generator, type Option } from "./types";

type C = [number, number];

const mulC = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const powC = (a: C, n: number): C => Array.from({ length: n }).reduce<C>((p) => mulC(p, a), [1, 0]);
const polar = (r: number, theta: number): C => [r * Math.cos(theta), r * Math.sin(theta)];

/** a + bi with exact fractions: "3 - 2i", "-i", "\frac{1}{5} + \frac{2}{5}i". */
export function cTex(re: Frac | number, im: Frac | number): string {
  const R = typeof re === "number" ? frac(re) : re;
  const I = typeof im === "number" ? frac(im) : im;
  const imAbs = frac(Math.abs(I.n), I.d);
  const imTex = imAbs.n === 1 && imAbs.d === 1 ? "i" : `${numTex(imAbs)}i`;
  if (I.n === 0) return numTex(R);
  if (R.n === 0) return (I.n < 0 ? "-" : "") + imTex;
  return `${numTex(R)} ${I.n < 0 ? "-" : "+"} ${imTex}`;
}

const zOption = (re: Frac | number, im: Frac | number): Option => {
  const R = typeof re === "number" ? frac(re) : re;
  const I = typeof im === "number" ? frac(im) : im;
  return { tex: cTex(R, I), z: [R.n / R.d, I.n / I.d] };
};

/** Angles with known cosine and sine, and a number of that argument with simple components. */
interface Nice {
  /** The angle as a multiple of π. */
  k: Frac;
  /** Modulus: tex and value. */
  r: { tex: string; v: number };
  /** Components, as tex. */
  re: string;
  im: string;
}

const S3 = "\\sqrt{3}";
const NICE: Nice[] = [
  { k: frac(0), r: { tex: "2", v: 2 }, re: "2", im: "0" },
  { k: frac(1, 6), r: { tex: "2", v: 2 }, re: S3, im: "1" },
  { k: frac(1, 4), r: { tex: "\\sqrt{2}", v: Math.SQRT2 }, re: "1", im: "1" },
  { k: frac(1, 3), r: { tex: "2", v: 2 }, re: "1", im: S3 },
  { k: frac(1, 2), r: { tex: "2", v: 2 }, re: "0", im: "2" },
  { k: frac(2, 3), r: { tex: "2", v: 2 }, re: "-1", im: S3 },
  { k: frac(3, 4), r: { tex: "\\sqrt{2}", v: Math.SQRT2 }, re: "-1", im: "1" },
  { k: frac(5, 6), r: { tex: "2", v: 2 }, re: `-${S3}`, im: "1" },
  { k: frac(1), r: { tex: "2", v: 2 }, re: "-2", im: "0" },
  { k: frac(-1, 6), r: { tex: "2", v: 2 }, re: S3, im: "-1" },
  { k: frac(-1, 4), r: { tex: "\\sqrt{2}", v: Math.SQRT2 }, re: "1", im: "-1" },
  { k: frac(-1, 3), r: { tex: "2", v: 2 }, re: "1", im: `-${S3}` },
  { k: frac(-1, 2), r: { tex: "2", v: 2 }, re: "0", im: "-2" },
  { k: frac(-2, 3), r: { tex: "2", v: 2 }, re: "-1", im: `-${S3}` },
  { k: frac(-3, 4), r: { tex: "\\sqrt{2}", v: Math.SQRT2 }, re: "-1", im: "-1" },
  { k: frac(-5, 6), r: { tex: "2", v: 2 }, re: `-${S3}`, im: "-1" },
];

/** "1 + \sqrt{3}i", "-2i", "\sqrt{3} - i" from component tex. */
function niceTex(n: Nice): string {
  const im = n.im.replace("-", "");
  const imTex = im === "1" ? "i" : im === S3 ? `${S3}\\,i` : `${im}i`;
  if (n.im === "0") return n.re;
  if (n.re === "0") return (n.im.startsWith("-") ? "-" : "") + imTex;
  return `${n.re} ${n.im.startsWith("-") ? "-" : "+"} ${imTex}`;
}

/** Angle in ]−π, π], as a multiple of π. */
function reduce(k: Frac): Frac {
  let x = k.n / k.d;
  let n = k.n;
  while (x > 1) {
    n -= 2 * k.d;
    x -= 2;
  }
  while (x <= -1) {
    n += 2 * k.d;
    x += 2;
  }
  return frac(n, k.d);
}
const angleOption = (k: Frac): Option => ({ tex: piTex(reduce(k)), num: (Math.PI * reduce(k).n) / reduce(k).d });
const addF = (a: Frac, b: Frac): Frac => frac(a.n * b.d + b.n * a.d, a.d * b.d);

/** r·e^{iθ}: "2e^{i\frac{\pi}{3}}", "e^{-i\frac{\pi}{2}}". */
function expTex(rTex: string, k: Frac): string {
  const a = reduce(k);
  const r = rTex === "1" ? "" : rTex;
  if (a.n === 0) return rTex;
  const angle = piTex(frac(Math.abs(a.n), a.d));
  return `${r}e^{${a.n < 0 ? "-" : ""}i${angle}}`;
}
const expOption = (rTex: string, r: number, k: Frac): Option => ({ tex: expTex(rTex, k), z: polar(r, (Math.PI * k.n) / k.d) });

const smallNonZero = (rng: Parameters<Generator>[0]): number => rng.nonZero(-5, 5);

// ------------------------------------------------------------------ school

const product: Generator = (rng) => {
  const [a, b, c, d] = [smallNonZero(rng), smallNonZero(rng), smallNonZero(rng), smallNonZero(rng)];
  const [re, im] = mulC([a, b], [c, d]);
  const factor = (x: number, y: number): string => `\\left(${cTex(x, y)}\\right)`;
  return {
    prompt: { key: "algebraicForm", tex: `${factor(a, b)}${factor(c, d)}` },
    correct: zOption(re, im),
    wrong: [
      tag(zOption(a * c + b * d, im), "iSquared"),
      tag(zOption(a * c, b * d), "componentwise"),
      tag(zOption(re, a * d - b * c), "signError"),
      tag(zOption(a * c - b * d, a * d), "termDropped"),
    ],
    explanation: { key: "complexProduct", tex: `${factor(a, b)}${factor(c, d)} = ${a * c} + ${a * d}i + ${b * c}i + ${b * d}i^{2}, \\quad i^{2} = -1` },
    verify: { kind: "complex", re, im },
  };
};

const quotient: Generator = (rng) => {
  const [a, b] = [smallNonZero(rng), smallNonZero(rng)];
  let [c, d] = [rng.nonZero(-4, 4), rng.nonZero(-4, 4)];
  if (c * c === d * d) d += d > 0 ? 1 : -1;
  const m = c * c + d * d;
  const re = frac(a * c + b * d, m);
  const im = frac(b * c - a * d, m);
  return {
    prompt: { key: "algebraicForm", tex: `\\frac{${cTex(a, b)}}{${cTex(c, d)}}` },
    correct: zOption(re, im),
    wrong: [
      tag(zOption(frac(a, c), frac(b, d)), "componentwise"),
      tag(zOption(frac(a * c - b * d, m), frac(b * c + a * d, m)), "conjugateForgotten"),
      tag(zOption(frac(a * c + b * d, c * c - d * d), frac(b * c - a * d, c * c - d * d)), "signError"),
      tag(zOption(a * c + b * d, b * c - a * d), "termDropped"),
    ],
    explanation: {
      key: "complexQuotient",
      tex: `\\frac{${cTex(a, b)}}{${cTex(c, d)}} = \\frac{\\left(${cTex(a, b)}\\right)\\left(${cTex(c, -d)}\\right)}{${c}^{2} + ${d < 0 ? `(${d})` : d}^{2}}`,
    },
    verify: { kind: "complex", re: (a * c + b * d) / m, im: (b * c - a * d) / m },
  };
};

/** √n simplified: 5, 2\sqrt{2}, \sqrt{13}. */
function sqrtTex(n: number): string {
  let k = 1;
  let m = n;
  for (let f = 2; f * f <= m; f++) {
    while (m % (f * f) === 0) {
      k *= f;
      m /= f * f;
    }
  }
  return m === 1 ? String(k) : `${k === 1 ? "" : k}\\sqrt{${m}}`;
}
const sqrtOption = (n: number): Option => ({ tex: sqrtTex(n), num: Math.sqrt(n) });

const modulus: Generator = (rng) => {
  const a = smallNonZero(rng) * rng.int(1, 2);
  let b = smallNonZero(rng);
  if (Math.abs(a) === Math.abs(b)) b += b > 0 ? 1 : -1;
  const s = a * a + b * b;
  return {
    prompt: { key: "modulus", tex: `z = ${cTex(a, b)}` },
    correct: sqrtOption(s),
    wrong: [
      tag({ tex: String(s), num: s }, "sqrtForgotten"),
      tag({ tex: String(Math.abs(a) + Math.abs(b)), num: Math.abs(a) + Math.abs(b) }, "componentwise"),
      tag(sqrtOption(Math.abs(a * a - b * b)), "signError"),
      tag(sqrtOption(Math.abs(a) + Math.abs(b)), "componentwise"),
    ],
    explanation: { key: "modulus", tex: `|z| = \\sqrt{${a < 0 ? `(${a})` : a}^{2} + ${b < 0 ? `(${b})` : b}^{2}} = \\sqrt{${s}}` },
    verify: { kind: "value", value: Math.hypot(a, b) },
  };
};

const argument: Generator = (rng) => {
  const n = rng.pick(NICE.filter((x) => x.re !== "0" && x.im !== "0"));
  const k = n.k;
  return {
    prompt: { key: "argument", tex: `z = ${niceTex(n)}` },
    correct: angleOption(k),
    wrong: [
      tag(angleOption(frac(-k.n, k.d)), "argumentSign"),
      tag(angleOption(addF(k, frac(1))), "argumentQuadrant"),
      tag(angleOption(addF(frac(1), frac(-k.n, k.d))), "argumentQuadrant"),
      tag(angleOption(addF(frac(1, 2), frac(-k.n, k.d))), "sinCosSwapped"),
    ],
    explanation: { key: "argument", tex: `|z| = ${n.r.tex}, \\quad \\cos\\theta = \\frac{${n.re}}{${n.r.tex}}, \\quad \\sin\\theta = \\frac{${n.im}}{${n.r.tex}}` },
    verify: { kind: "value", value: Math.atan2(polar(1, (Math.PI * k.n) / k.d)[1], polar(1, (Math.PI * k.n) / k.d)[0]) },
  };
};

const exponentialForm: Generator = (rng) => {
  const n = rng.pick(NICE);
  const k = n.k;
  const r2 = n.r.v ** 2;
  return {
    prompt: { key: "exponentialForm", tex: `z = ${niceTex(n)}` },
    correct: expOption(n.r.tex, n.r.v, k),
    wrong: [
      tag(expOption(String(Math.round(r2)), r2, k), "sqrtForgotten"),
      tag(expOption(n.r.tex, n.r.v, frac(-k.n, k.d)), "argumentSign"),
      tag(expOption(n.r.tex, n.r.v, addF(k, frac(1))), "argumentQuadrant"),
      tag(expOption(n.r.tex, n.r.v, addF(frac(1, 2), frac(-k.n, k.d))), "sinCosSwapped"),
    ],
    explanation: { key: "exponentialForm", tex: `|z| = ${n.r.tex}, \\quad \\arg z = ${piTex(k)}` },
    verify: { kind: "complex", re: polar(n.r.v, (Math.PI * k.n) / k.d)[0], im: polar(n.r.v, (Math.PI * k.n) / k.d)[1] },
  };
};

const quadratic: Generator = (rng) => {
  const alpha = rng.int(-3, 3);
  const beta = rng.int(1, 4);
  const p = -2 * alpha;
  const q = alpha * alpha + beta * beta;
  const pair = (x: number, y: number): Option => ({
    tex: `\\left\\{ ${cTex(x, -y)},\\ ${cTex(x, y)} \\right\\}`,
    zs: [[x, -y], [x, y]],
  });
  const reals = (x: number, y: number): Option => ({ tex: `\\left\\{ ${numTex(x - y)},\\ ${numTex(x + y)} \\right\\}`, zs: [[x - y, 0], [x + y, 0]] });
  const wrong: Option[] = [
    tag(pair(-alpha, beta), "signError"),
    tag(pair(alpha, beta * beta), "sqrtForgotten"),
    tag(reals(alpha, beta), "discriminantSign"),
    tag(pair(alpha, 2 * beta), "wrongFactor"),
    tag(pair(2 * alpha, 2 * beta), "wrongFactor"), // −b ± i√|Δ| not divided by 2a
    tag(reals(alpha, beta * beta), "discriminantSign"),
  ];
  return {
    prompt: { key: "complexRoots", tex: `${sum([[1, "z^{2}"], [p, "z"], [q, ""]])} = 0` },
    correct: pair(alpha, beta),
    wrong,
    explanation: { key: "complexQuadratic", tex: `\\Delta = ${p * p} - ${4 * q} = ${p * p - 4 * q} = \\left(${2 * beta}i\\right)^{2}, \\quad z = \\frac{${-p} \\pm ${2 * beta}i}{2}` },
    verify: { kind: "complexRoots", coefficients: [1, p, q] },
  };
};

// ------------------------------------------------------------- university

const deMoivre: Generator = (rng) => {
  const n = rng.pick(NICE.filter((x) => x.re !== "0" && x.im !== "0"));
  const power = rng.int(3, 8);
  const rn = n.r.v ** power;
  // rⁿ exactly: 2ⁿ, or (√2)ⁿ = 2^(n/2) or 2^((n−1)/2)·√2.
  const rnTex = n.r.tex === "2" ? String(2 ** power) : power % 2 === 0 ? String(2 ** (power / 2)) : `${2 ** ((power - 1) / 2) === 1 ? "" : 2 ** ((power - 1) / 2)}\\sqrt{2}`;
  const kn = frac(n.k.n * power, n.k.d);
  const [re, im] = powC(polar(n.r.v, (Math.PI * n.k.n) / n.k.d), power);
  return {
    prompt: { key: "exponentialForm", tex: `z = \\left(${niceTex(n)}\\right)^{${power}}` },
    correct: expOption(rnTex, rn, kn),
    wrong: [
      tag(expOption(n.r.tex, n.r.v, kn), "powerMisapplied"),
      tag(expOption(rnTex, rn, n.k), "powerMisapplied"),
      tag(expOption(rnTex, rn, addF(kn, frac(1))), "argumentQuadrant"),
      // The modulus multiplied by n instead of raised to the n-th power.
      tag(expOption(n.r.tex === "2" ? String(2 * power) : `${power}\\sqrt{2}`, n.r.v * power, kn), "wrongFactor"),
    ],
    explanation: { key: "deMoivre", tex: `z = \\left(${n.r.tex}\\,e^{i${piTex(n.k)}}\\right)^{${power}} = ${n.r.tex}^{${power}} e^{i\\cdot${power}${piTex(n.k)}}` },
    verify: { kind: "complex", re, im },
  };
};

const nthRoot: Generator = (rng) => {
  const n = rng.int(2, 4);
  const r = rng.pick([1, 2]);
  const R = r ** n;
  // w = R·e^{iφ}, φ a multiple of π/2.
  const phi = rng.pick([frac(0), frac(1, 2), frac(1), frac(-1, 2)]);
  const [wre, wim] = polar(R, (Math.PI * phi.n) / phi.d).map((x) => Math.round(x * 1e9) / 1e9) as C;
  const kRoot = rng.int(0, n - 1);
  const rootAngle = (k: number): Frac => frac(phi.n * 2 + 4 * k * phi.d, 2 * n * phi.d); // (φ + 2kπ)/n, as multiples of π
  const rTex = String(r);
  const wTex = cTex(Math.round(wre), Math.round(wim));
  // A wrong option must not be a root after all (e^{iπ} is one of z³ = −1): kept only if zⁿ ≠ w.
  const isRoot = (o: Option): boolean => {
    const zn = powC(o.z!, n);
    return Math.hypot(zn[0] - wre, zn[1] - wim) < 1e-9 * Math.max(1, R);
  };
  const candidates: Option[] = [
    tag(expOption(String(R), R, rootAngle(kRoot)), "powerMisapplied"),
    tag(expOption(rTex, r, phi), "powerMisapplied"),
    tag(expOption(rTex, r, addF(rootAngle(kRoot), frac(1, n * 2))), "rootSpacing"),
    tag(expOption(rTex, r, addF(rootAngle(kRoot), frac(1, n === 2 ? 2 : n))), "rootSpacing"),
    tag(expOption(rTex, r, addF(rootAngle(kRoot), frac(-1, n * 2))), "rootSpacing"),
    tag(expOption(rTex, r, frac(phi.n, phi.d * n * 2)), "rootSpacing"),
  ];
  return {
    prompt: { key: "isRoot", tex: `z^{${n}} = ${wTex}` },
    correct: expOption(rTex, r, rootAngle(kRoot)),
    wrong: candidates.filter((o) => !isRoot(o)),
    explanation: { key: "nthRoots", tex: `z = ${R === 1 ? "" : `\\sqrt[${n}]{${R}}\\,`}e^{i\\frac{${piTex(phi)} + 2k\\pi}{${n}}}, \\quad k = 0, \\dots, ${n - 1}` },
    verify: { kind: "complexRoot", n, re: wre, im: wim },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const complex = {
  school: { product, quotient, modulus, argument, exponentialForm, quadratic },
  university: { quotient, argument, quadratic, deMoivre, nthRoot, exponentialForm },
};
