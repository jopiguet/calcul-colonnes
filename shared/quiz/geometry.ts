/**
 * Vectors and geometry in space: dot product, norm, angle between vectors,
 * the plane through a point with a normal, the distance from a point to a
 * plane; at university also the cross product and where a line meets a plane.
 *
 * Classic mistakes: the norm not divided in the distance, the normal and the
 * point swapped, the supplementary angle, v × u for u × v.
 */
import { frac, lines, numTex, piTex, sum, type Frac } from "./tex";
import { tag, type Generator, type Option } from "./types";

type V = [number, number, number];

const dot = (u: number[], v: number[]): number => u.reduce((s, x, i) => s + x * v[i]!, 0);
const vecTex = (name: string, v: number[]): string => `\\vec{${name}} = \\left(${v.join(",\\ ")}\\right)`;
const pointTex = (name: string, v: number[]): string => `${name}\\left(${v.join(",\\ ")}\\right)`;
const numOption = (x: number): Option => ({ tex: numTex(x), num: x });
const fracOption = (f: Frac): Option => ({ tex: numTex(f), num: f.n / f.d });
const small = (rng: Parameters<Generator>[0]): V => [rng.int(-4, 4), rng.int(-4, 4), rng.int(-4, 4)];
const nonZeroVec = (rng: Parameters<Generator>[0]): V => {
  let v = small(rng);
  while (v.every((x) => x === 0) || v.filter((x) => x === 0).length > 1) v = small(rng);
  return v;
};

/** Vectors with a whole norm: (1, 2, 2) has norm 3, (2, 3, 6) norm 7… */
const WHOLE: [V, number][] = [
  [[1, 2, 2], 3],
  [[2, 3, 6], 7],
  [[1, 4, 8], 9],
  [[4, 4, 7], 9],
  [[2, 6, 9], 11],
  [[0, 3, 4], 5],
  [[6, 6, 7], 11],
];

/** A whole-norm vector, its coordinates shuffled and their signs at random. */
function wholeNorm(rng: Parameters<Generator>[0]): [V, number] {
  const [v, n] = rng.pick(WHOLE);
  const shuffled = rng.shuffle([...v]).map((x) => (rng.int(0, 1) ? -x : x)) as V;
  return [shuffled, n];
}

/** The plane ax + by + cz + d = 0. */
const planeTex = ([a, b, c, d]: number[]): string => `${sum([[a!, "x"], [b!, "y"], [c!, "z"], [d!, ""]])} = 0`;
const planeOption = (p: number[]): Option => ({ tex: planeTex(p), set: p });

// ------------------------------------------------------------- both levels

const dotProduct: Generator = (rng) => {
  const u = nonZeroVec(rng);
  const v = nonZeroVec(rng);
  const s = dot(u, v);
  return {
    prompt: { key: "dotProduct", tex: lines(vecTex("u", u), vecTex("v", v)) },
    correct: numOption(s),
    wrong: [
      tag(numOption(u[0] * v[0] + u[1] * v[1]), "termDropped"),
      tag(numOption(u[0] * v[0] - u[1] * v[1] + u[2] * v[2]), "signError"),
      tag(numOption((u[0] + u[1] + u[2]) * (v[0] + v[1] + v[2])), "componentwise"),
      tag(numOption(u[0] * v[1] + u[1] * v[2] + u[2] * v[0]), "componentsMismatched"),
    ],
    explanation: { key: "dotProduct", tex: `\\vec{u} \\cdot \\vec{v} = ${u.map((x, i) => `${x < 0 ? `(${x})` : x} \\cdot ${v[i]! < 0 ? `(${v[i]})` : v[i]}`).join(" + ")}` },
    verify: { kind: "value", value: s },
  };
};

const vectorNorm: Generator = (rng) => {
  const [u, n] = wholeNorm(rng);
  const squares = u[0] ** 2 + u[1] ** 2 + u[2] ** 2;
  return {
    prompt: { key: "vectorNorm", tex: vecTex("u", u) },
    correct: numOption(n),
    wrong: [
      tag(numOption(squares), "sqrtForgotten"),
      tag(numOption(Math.abs(u[0]) + Math.abs(u[1]) + Math.abs(u[2])), "componentwise"),
      tag({ tex: `\\sqrt{${u[0] ** 2 + u[1] ** 2}}`, num: Math.hypot(u[0], u[1]) }, "termDropped"),
    ],
    explanation: { key: "vectorNorm", tex: `\\|\\vec{u}\\| = \\sqrt{${u.map((x) => (x < 0 ? `(${x})^{2}` : `${x}^{2}`)).join(" + ")}} = \\sqrt{${squares}}` },
    verify: { kind: "value", value: Math.hypot(...u) },
  };
};

/** Pairs at a known angle (multiple of π); coordinates permuted, signs flipped and lengths scaled keep it. */
const ANGLES: [V, V, Frac][] = [
  [[1, 0, 0], [1, 1, 0], frac(1, 4)],
  [[1, 0, 0], [-1, 1, 0], frac(3, 4)],
  [[1, 1, 0], [0, 1, 1], frac(1, 3)],
  [[1, 1, 0], [-1, 0, 1], frac(2, 3)],
  [[1, 1, 0], [1, -1, 0], frac(1, 2)],
  [[1, 2, 2], [2, 1, -2], frac(1, 2)],
  [[1, 1, 1], [-1, -1, -1], frac(1)],
  [[0, 1, 1], [1, 0, 1], frac(1, 3)],
];

const vectorAngle: Generator = (rng) => {
  const [u0, v0, k] = rng.pick(ANGLES);
  const order = rng.shuffle([0, 1, 2]);
  const signs = order.map(() => (rng.int(0, 1) ? -1 : 1));
  const move = (v: V, scale: number): V => order.map((i, j) => v[i]! * signs[j]! * scale) as V;
  const u = move(u0, rng.int(1, 3));
  const v = move(v0, rng.int(1, 3));
  const angle = (f: Frac): Option => ({ tex: piTex(f), num: (Math.PI * f.n) / f.d });
  const sub = (a: Frac, b: Frac): Frac => frac(a.n * b.d - b.n * a.d, a.d * b.d);
  return {
    prompt: { key: "vectorAngle", tex: lines(vecTex("u", u), vecTex("v", v)) },
    correct: angle(k),
    wrong: [
      tag(angle(sub(frac(1), k)), "supplementaryAngle"),
      tag(angle(sub(frac(1, 2), k).n > 0 ? sub(frac(1, 2), k) : sub(k, frac(1, 2))), "sinCosSwapped"),
      tag(angle(frac(k.n, k.d * 2)), "wrongFactor"),
      tag(angle(frac(1, 6)), "exactValueError"),
      tag(angle(frac(5, 6)), "exactValueError"),
    ],
    explanation: { key: "vectorAngle", tex: `\\cos\\theta = \\frac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{u}\\| \\, \\|\\vec{v}\\|} = \\frac{${dot(u, v)}}{\\sqrt{${dot(u, u)}} \\sqrt{${dot(v, v)}}}` },
    verify: { kind: "value", value: Math.acos(dot(u, v) / Math.sqrt(dot(u, u) * dot(v, v))) },
  };
};

const planeEquation: Generator = (rng) => {
  const n = nonZeroVec(rng);
  let A = small(rng);
  while (dot(n, A) === 0 || A.every((x, i) => x === n[i])) A = small(rng);
  const d = -dot(n, A);
  return {
    prompt: { key: "planeEquation", tex: lines(pointTex("A", A), vecTex("n", n)) },
    correct: planeOption([...n, d]),
    wrong: [
      tag(planeOption([...n, -d]), "signError"),
      tag(planeOption([...A, -dot(A, n)]), "normalPointSwapped"),
      tag(planeOption([...n, -(n[0] + n[1] + n[2])]), "termDropped"),
      tag(planeOption([...n, 0]), "termDropped"),
    ],
    explanation: { key: "planeEquation", tex: `${sum([[n[0], "x"], [n[1], "y"], [n[2], "z"]])} + d = 0, \\quad d = -\\vec{n} \\cdot \\overrightarrow{OA} = ${d}` },
    verify: { kind: "plane", normal: n, point: A },
  };
};

const pointPlaneDistance: Generator = (rng) => {
  const [n, norm] = wholeNorm(rng);
  const d = rng.int(-9, 9);
  let M = small(rng);
  while (dot(n, M) + d === 0) M = small(rng);
  const value = dot(n, M) + d;
  return {
    prompt: { key: "pointPlaneDistance", tex: lines(pointTex("M", M), `\\mathcal{P}: ${planeTex([...n, d])}`) },
    correct: fracOption(frac(Math.abs(value), norm)),
    wrong: [
      tag(numOption(Math.abs(value)), "normForgotten"),
      tag(fracOption(frac(Math.abs(value), norm * norm)), "sqrtForgotten"),
      tag(fracOption(frac(Math.abs(dot(n, M)), norm)), "termDropped"),
      tag(fracOption(frac(Math.abs(dot(n, M) - d), norm)), "signError"),
    ],
    explanation: { key: "pointPlaneDistance", tex: `d = \\frac{\\left|${value}\\right|}{\\sqrt{${norm * norm}}} = \\frac{${Math.abs(value)}}{${norm}}` },
    verify: { kind: "value", value: Math.abs(value) / Math.hypot(...n) },
  };
};

// ------------------------------------------------------------- university

const crossProduct: Generator = (rng) => {
  let u = nonZeroVec(rng);
  let v = nonZeroVec(rng);
  const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  while (cross(u, v).every((x) => x === 0)) {
    u = nonZeroVec(rng);
    v = nonZeroVec(rng);
  }
  const vecOption = (w: number[]): Option => ({ tex: `\\left(${w.join(",\\ ")}\\right)`, set: w });
  const c = cross(u, v);
  return {
    prompt: { key: "crossProduct", tex: lines(vecTex("u", u), vecTex("v", v)) },
    correct: vecOption(c),
    wrong: [
      tag(vecOption(cross(v, u)), "orderSwapped"),
      tag(vecOption(u.map((x, i) => x * v[i]!)), "componentwise"),
      tag(vecOption([c[0], -c[1], c[2]]), "cofactorSign"),
      tag(vecOption([u[1] * v[2] + u[2] * v[1], u[2] * v[0] + u[0] * v[2], u[0] * v[1] + u[1] * v[0]]), "signError"),
    ],
    explanation: { key: "crossProduct", tex: `\\vec{u} \\times \\vec{v} = \\left(u_{2}v_{3} - u_{3}v_{2},\\ u_{3}v_{1} - u_{1}v_{3},\\ u_{1}v_{2} - u_{2}v_{1}\\right)` },
    verify: { kind: "crossProduct", u, v },
  };
};

const linePlane: Generator = (rng) => {
  const n = nonZeroVec(rng);
  let u = nonZeroVec(rng);
  while (dot(n, u) === 0) u = nonZeroVec(rng);
  const A = small(rng);
  let d = rng.int(-9, 9);
  let top = dot(n, A) + d;
  while (top === 0) top = dot(n, A) + ++d;
  const t = frac(-top, dot(n, u));
  return {
    prompt: {
      key: "linePlane",
      tex: lines(`\\mathcal{D}: \\ M(t) = A + t\\,\\vec{u}`, pointTex("A", A), vecTex("u", u), `\\mathcal{P}: ${planeTex([...n, d])}`),
    },
    correct: fracOption(t),
    wrong: [
      tag(fracOption(frac(top, dot(n, u))), "signError"),
      tag(numOption(-top), "denominatorForgotten"),
      tag(fracOption(frac(-dot(n, A), dot(n, u))), "termDropped"),
      tag(fracOption(frac(-dot(n, u), top)), "invertedRatio"),
    ],
    explanation: { key: "linePlane", tex: `\\vec{n} \\cdot (A + t\\vec{u}) + d = 0 \\iff ${dot(n, A)} + ${dot(n, u) < 0 ? `(${dot(n, u)})` : dot(n, u)}\\,t ${d < 0 ? "-" : "+"} ${Math.abs(d)} = 0` },
    verify: { kind: "root", f: (x) => dot(n, A.map((a, i) => a + x * u[i]!)) + d },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const geometry = {
  school: { dotProduct, vectorNorm, vectorAngle, planeEquation, pointPlaneDistance },
  university: { vectorAngle, planeEquation, pointPlaneDistance, crossProduct, linePlane },
};
