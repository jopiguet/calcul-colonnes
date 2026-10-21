/**
 * Linear algebra: determinants (2 × 2, 3 × 3, of k·A), product and inverse of
 * 2 × 2 matrices, 2 × 2 systems; at university also eigenvalues and rank.
 * Matrices are in the Spanish bachillerato (Matemáticas II) as well, hence
 * both levels.
 *
 * Matrices and vectors are options with `set` (row by row); the check script
 * multiplies, inverts and eliminates on its own. Classic mistakes: AB taken
 * for BA, the inverse without 1/det, the cofactor's sign, det(kA) = k·det A.
 */
import { frac, numTex, val, type Frac } from "./tex";
import { tag, type Generator, type Option } from "./types";

type M = number[][];

const matTex = (rows: (number | Frac)[][]): string =>
  `\\begin{pmatrix} ${rows.map((r) => r.map((x) => numTex(x)).join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;
const matOption = (rows: (number | Frac)[][]): Option => ({
  tex: matTex(rows),
  set: rows.flat().map((x) => (typeof x === "number" ? x : val(x))),
});
const numOption = (x: number): Option => ({ tex: numTex(x), num: x });
const mul = (a: M, b: M): M => a.map((row) => b[0]!.map((_, j) => row.reduce((s, x, k) => s + x * b[k]![j]!, 0)));
const det2 = (a: M): number => a[0]![0]! * a[1]![1]! - a[0]![1]! * a[1]![0]!;
const det3 = (a: M): number =>
  a[0]![0]! * (a[1]![1]! * a[2]![2]! - a[1]![2]! * a[2]![1]!) -
  a[0]![1]! * (a[1]![0]! * a[2]![2]! - a[1]![2]! * a[2]![0]!) +
  a[0]![2]! * (a[1]![0]! * a[2]![1]! - a[1]![1]! * a[2]![0]!);

const small = (rng: Parameters<Generator>[0], lo = -5, hi = 5): number => rng.int(lo, hi);
const matrix = (rng: Parameters<Generator>[0], n: number, lo = -4, hi = 5): M =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => small(rng, lo, hi)));

// ------------------------------------------------------------- both levels

const determinant2: Generator = (rng) => {
  let a = matrix(rng, 2);
  while (det2(a) === 0 || a.flat().some((x) => x === 0)) a = matrix(rng, 2);
  const [[p, q], [r, s]] = a as [[number, number], [number, number]];
  return {
    prompt: { key: "determinant", tex: `\\det ${matTex(a)}` },
    correct: numOption(p * s - q * r),
    wrong: [
      tag(numOption(p * s + q * r), "signError"),
      tag(numOption(p * r - q * s), "determinantPattern"),
      tag(numOption(p * q - r * s), "determinantPattern"),
      tag(numOption(q * r - p * s), "signError"),
    ],
    explanation: { key: "determinant2", tex: `${p} \\cdot ${s < 0 ? `(${s})` : s} - ${q < 0 ? `(${q})` : q} \\cdot ${r < 0 ? `(${r})` : r}` },
    verify: { kind: "determinant", a },
  };
};

const determinant3: Generator = (rng) => {
  let a = matrix(rng, 3, -3, 3);
  while (det3(a) === 0) a = matrix(rng, 3, -3, 3);
  const g = (i: number, j: number): number => a[i]![j]!;
  const plus = g(0, 0) * g(1, 1) * g(2, 2) + g(0, 1) * g(1, 2) * g(2, 0) + g(0, 2) * g(1, 0) * g(2, 1);
  const minus = g(0, 2) * g(1, 1) * g(2, 0) + g(0, 0) * g(1, 2) * g(2, 1) + g(0, 1) * g(1, 0) * g(2, 2);
  const cofactorPlus =
    g(0, 0) * (g(1, 1) * g(2, 2) - g(1, 2) * g(2, 1)) +
    g(0, 1) * (g(1, 0) * g(2, 2) - g(1, 2) * g(2, 0)) +
    g(0, 2) * (g(1, 0) * g(2, 1) - g(1, 1) * g(2, 0));
  return {
    prompt: { key: "determinant", tex: `\\det ${matTex(a)}` },
    correct: numOption(plus - minus),
    wrong: [
      tag(numOption(cofactorPlus), "cofactorSign"),
      tag(numOption(plus + minus), "signError"),
      tag(numOption(plus), "termDropped"),
      tag(numOption(minus - plus), "signError"),
      tag(numOption(g(0, 0) * g(1, 1) * g(2, 2)), "determinantPattern"),
    ],
    explanation: { key: "determinant3", tex: `${plus} - ${minus < 0 ? `(${minus})` : minus}` },
    verify: { kind: "determinant", a },
  };
};

const scaledDeterminant: Generator = (rng) => {
  const n = rng.pick([2, 3]);
  const k = rng.pick([2, 3, -2, -1]);
  const d = rng.nonZero(-6, 6);
  const correct = k ** n * d;
  // A matrix with this determinant, for the check: diagonal (d, 1, …).
  const diag = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? (i === 0 ? d * k : k) : 0)));
  return {
    prompt: { key: "scaledDeterminant", tex: `A \\in \\mathcal{M}_{${n}}(\\mathbb{R}), \\quad \\det A = ${d} \\qquad \\det(${k}A) = \\ ?` },
    correct: numOption(correct),
    wrong: [
      tag(numOption(k * d), "scalarPower"),
      tag(numOption(k ** (n === 2 ? 3 : 2) * d), "scalarPower"),
      tag(numOption(d), "scalarPower"),
      tag(numOption(-correct), "signError"),
    ],
    explanation: { key: "scaledDeterminant", tex: `\\det(kA) = k^{${n}} \\det A = ${k < 0 ? `(${k})` : k}^{${n}} \\cdot ${d < 0 ? `(${d})` : d}` },
    verify: { kind: "determinant", a: diag },
  };
};

const product: Generator = (rng) => {
  let a = matrix(rng, 2, -3, 4);
  let b = matrix(rng, 2, -3, 4);
  while (JSON.stringify(mul(a, b)) === JSON.stringify(mul(b, a))) {
    a = matrix(rng, 2, -3, 4);
    b = matrix(rng, 2, -3, 4);
  }
  const bt = b[0]!.map((_, j) => b.map((row) => row[j]!));
  return {
    prompt: { key: "matrixProduct", tex: `A = ${matTex(a)}, \\quad B = ${matTex(b)} \\qquad AB = \\ ?` },
    correct: matOption(mul(a, b)),
    wrong: [
      tag(matOption(mul(b, a)), "orderSwapped"),
      tag(matOption(a.map((row, i) => row.map((x, j) => x * b[i]![j]!))), "componentwise"),
      tag(matOption(mul(a, bt)), "rowByRow"),
      tag(matOption(mul(a, b).map((row, i) => row.map((x, j) => (i === j ? x : -x)))), "signError"),
    ],
    explanation: { key: "matrixProduct", tex: `(AB)_{ij} = \\sum_{k} a_{ik} \\, b_{kj}` },
    verify: { kind: "matrixProduct", a, b },
  };
};

const inverse: Generator = (rng) => {
  // det = ±1 or ±2 keeps the entries readable.
  let a = matrix(rng, 2, -4, 5);
  while (![1, -1, 2, -2].includes(det2(a)) || a.flat().filter((x) => x === 0).length > 1) a = matrix(rng, 2, -4, 5);
  const D = det2(a);
  const [[p, q], [r, s]] = a as [[number, number], [number, number]];
  const over = (rows: number[][], d: number): (number | Frac)[][] => rows.map((row) => row.map((x) => frac(x, d)));
  return {
    prompt: { key: "matrixInverse", tex: `A = ${matTex(a)}` },
    correct: matOption(over([[s, -q], [-r, p]], D)),
    wrong: [
      tag(matOption([[s, -q], [-r, p]]), D === 1 ? "signError" : "wrongFactor"),
      tag(matOption(over([[p, -q], [-r, s]], D)), "adjugateError"),
      tag(matOption(over([[s, q], [r, p]], D)), "signError"),
      tag(matOption(over([[s, -r], [-q, p]], D)), "adjugateError"),
      tag(matOption(over([[s, -q], [-r, p]], -D)), "signError"),
    ],
    explanation: { key: "matrixInverse", tex: `A^{-1} = \\frac{1}{${D}} ${matTex([[s, -q], [-r, p]])}` },
    verify: { kind: "matrixInverse", a },
  };
};

const system: Generator = (rng) => {
  const x = rng.nonZero(-4, 5);
  let y = rng.nonZero(-4, 5);
  if (y === x) y = -x;
  let a = matrix(rng, 2, -4, 5);
  while (det2(a) === 0 || a.flat().some((v) => v === 0)) a = matrix(rng, 2, -4, 5);
  const b = a.map((row) => row[0]! * x + row[1]! * y);
  const D = det2(a);
  const eq = (row: number[], rhs: number): string => {
    const [c1, c2] = row as [number, number];
    return `${c1 === 1 ? "" : c1 === -1 ? "-" : c1}x ${c2 < 0 ? "-" : "+"} ${Math.abs(c2) === 1 ? "" : Math.abs(c2)}y = ${rhs}`;
  };
  const pair = (u: number | Frac, v: number | Frac): Option => ({
    tex: `(x, y) = \\left(${numTex(u)},\\ ${numTex(v)}\\right)`,
    set: [typeof u === "number" ? u : val(u), typeof v === "number" ? v : val(v)],
  });
  const Dx = b[0]! * a[1]![1]! - a[0]![1]! * b[1]!;
  const Dy = a[0]![0]! * b[1]! - b[0]! * a[1]![0]!;
  return {
    prompt: { key: "linearSystem", tex: `\\begin{cases} ${eq(a[0]!, b[0]!)} \\\\ ${eq(a[1]!, b[1]!)} \\end{cases}` },
    correct: pair(x, y),
    wrong: [
      tag(pair(y, x), "orderSwapped"),
      tag(pair(-x, y), "signError"),
      tag(pair(x, -y), "signError"),
      tag(pair(frac(Dy, D), frac(Dx, D)), "orderSwapped"),
      tag(pair(Dx, Dy), "wrongFactor"),
    ],
    explanation: { key: "linearSystem", tex: `x = \\frac{${Dx}}{${D}} = ${x}, \\quad y = \\frac{${Dy}}{${D}} = ${y}` },
    verify: { kind: "linearSolution", a, b },
  };
};

// ------------------------------------------------------------- university

const eigenvalues: Generator = (rng) => {
  // A = P D P⁻¹ with P of determinant ±1: whole entries, eigenvalues λ₁ < λ₂.
  const [l1, l2] = rng.shuffle([-3, -2, -1, 1, 2, 3, 4]).slice(0, 2).sort((u, v) => u - v) as [number, number];
  const P = rng.pick([[[1, 1], [0, 1]], [[1, 0], [1, 1]], [[2, 1], [1, 1]], [[1, 2], [1, 3]], [[1, -1], [0, 1]], [[1, 1], [1, 2]]]);
  const d = det2(P);
  const Pinv = [[P[1]![1]! / d, -P[0]![1]! / d], [-P[1]![0]! / d, P[0]![0]! / d]];
  const A = mul(mul(P, [[l1, 0], [0, l2]]), Pinv).map((row) => row.map((x) => Math.round(x)));
  const tr = A[0]![0]! + A[1]![1]!;
  const dt = det2(A);
  const setOption = (values: number[]): Option => {
    const sorted = [...values].sort((u, v) => u - v);
    return { tex: `\\left\\{ ${sorted.map((v) => numTex(v)).join(",\\ ")} \\right\\}`, set: sorted };
  };
  return {
    prompt: { key: "eigenvalues", tex: `A = ${matTex(A)}` },
    correct: setOption([l1, l2]),
    wrong: [
      tag(setOption([A[0]![0]!, A[1]![1]!].filter((v, i, all) => all.indexOf(v) === i).concat(A[0]![0]! === A[1]![1]! ? [A[0]![0]! + 1] : [])), "diagonalTaken"),
      tag(setOption([-l1, -l2]), "signError"),
      tag(setOption(tr === dt ? [tr, tr + 1] : [tr, dt]), "traceDeterminantConfused"),
      tag(setOption([l1 + l2, l1 * l2].filter((v, i, all) => all.indexOf(v) === i).concat(l1 + l2 === l1 * l2 ? [0] : [])), "traceDeterminantConfused"),
    ],
    explanation: { key: "eigenvalues", tex: `\\lambda^{2} - ${tr < 0 ? `(${tr})` : tr}\\lambda + ${dt < 0 ? `(${dt})` : dt} = (\\lambda ${l1 < 0 ? "+" : "-"} ${Math.abs(l1)})(\\lambda ${l2 < 0 ? "+" : "-"} ${Math.abs(l2)}) = 0` },
    verify: { kind: "eigenvalues", a: A },
  };
};

const rank: Generator = (rng) => {
  const r = rng.pick([1, 2, 2, 3]);
  // Rows: r independent ones, then combinations of them.
  const base = [
    [1, rng.int(-2, 3), rng.int(-2, 3)],
    [0, 1, rng.int(-3, 3)],
    [0, 0, rng.nonZero(-3, 3)],
  ];
  const rows = base.slice(0, r);
  while (rows.length < 3) {
    const c1 = rng.nonZero(-2, 2);
    const c2 = r > 1 ? rng.int(-2, 2) : 0;
    rows.push(rows[0]!.map((x, j) => c1 * x + c2 * (rows[1] && r > 1 ? rows[1]![j]! : 0)));
  }
  // Mix the rows so the structure does not show.
  const mixed = [rows[0]!, rows[1]!.map((x, j) => x + rows[0]![j]!), rows[2]!.map((x, j) => x - rows[1]![j]!)];
  const a = rng.shuffle(mixed);
  const option = (k: number): Option => ({ tex: String(k), num: k });
  return {
    prompt: { key: "rank", tex: matTex(a) },
    correct: option(r),
    wrong: [0, 1, 2, 3].filter((k) => k !== r).map((k) => tag(option(k), "rankMiscounted")),
    explanation: { key: "rank", tex: `r = ${r}` },
    verify: { kind: "rank", a },
  };
};

// Keys are the stable ids of the question kinds (stored with each answer); keep the order: it is part of what a seed means.
export const linear = {
  school: { determinant2, determinant3, scaledDeterminant, product, inverse, system },
  university: { determinant3, scaledDeterminant, product, inverse, system, eigenvalues, rank },
};
