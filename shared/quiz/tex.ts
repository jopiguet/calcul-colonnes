/** Small helpers to write exact coefficients and expressions in LaTeX. */

export interface Frac {
  n: number;
  d: number;
}
export type Coef = number | Frac;
export type Fn = (x: number) => number;

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

export function frac(n: number, d = 1): Frac {
  if (d === 0) throw new Error("zero denominator");
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(Math.abs(n), d) || 1;
  return { n: n / g, d: d / g };
}

const toFrac = (c: Coef): Frac => (typeof c === "number" ? frac(c) : c);
export const val = (c: Coef): number => {
  const f = toFrac(c);
  return f.n / f.d;
};
export const add = (a: Coef, b: Coef): Frac => {
  const x = toFrac(a);
  const y = toFrac(b);
  return frac(x.n * y.d + y.n * x.d, x.d * y.d);
};

function absTex(f: Frac): string {
  const n = Math.abs(f.n);
  return f.d === 1 ? String(n) : `\\frac{${n}}{${f.d}}`;
}

/** A number: 3, -2, \frac{1}{3}. */
export function numTex(c: Coef): string {
  const f = toFrac(c);
  return (f.n < 0 ? "-" : "") + absTex(f);
}

/** Sum of coefficient × body terms with clean signs: [[3, "x^{2}"], [-1, "x"], [5, ""]] → 3x^{2} - x + 5. */
export function sum(terms: [Coef, string][]): string {
  let out = "";
  for (const [c, body] of terms) {
    const f = toFrac(c);
    if (f.n === 0) continue;
    const one = Math.abs(f.n) === 1 && f.d === 1;
    const glue = /^[0-9]/.test(body) ? "\\cdot " : "";
    const term = body === "" ? absTex(f) : one ? body : absTex(f) + glue + body;
    if (out === "") out = (f.n < 0 ? "-" : "") + term;
    else out += (f.n < 0 ? " - " : " + ") + term;
  }
  return out === "" ? "0" : out;
}

export const pow = (n: number, v = "x"): string => (n === 0 ? "" : n === 1 ? v : `${v}^{${n}}`);
export const kx = (k: number): string => (k === 1 ? "x" : k === -1 ? "-x" : `${k}x`);
export const lin = (a: number, b: number): string => sum([[a, "x"], [b, ""]]);
export const ePow = (k: number): string => (k === 1 ? "e" : `e^{${k}}`);

/** Multiple of π: \frac{\pi}{6}, \frac{5\pi}{6}, 2\pi, -\frac{\pi}{3}. */
export function piTex(c: Coef): string {
  const f = toFrac(c);
  if (f.n === 0) return "0";
  const n = Math.abs(f.n);
  const top = n === 1 ? "\\pi" : `${n}\\pi`;
  return (f.n < 0 ? "-" : "") + (f.d === 1 ? top : `\\frac{${top}}{${f.d}}`);
}

/** Polynomial from [coefficient, exponent] pairs: equal exponents merged, sorted by degree. */
export function poly(terms: [Coef, number][]): { tex: string; fn: Fn } {
  const merged = new Map<number, Frac>();
  for (const [c, e] of terms) merged.set(e, add(merged.get(e) ?? frac(0), c));
  const sorted = [...merged].sort((a, b) => b[0] - a[0]);
  return {
    tex: sum(sorted.map(([e, c]) => [c, pow(e)])),
    fn: (x) => sorted.reduce((s, [e, c]) => s + val(c) * x ** e, 0),
  };
}

/**
 * Several lines, centred: the givens of a question one under the other, so a
 * phone does not cut them off (a KaTeX `gathered` block).
 */
export const lines = (...rows: string[]): string => `\\begin{gathered} ${rows.join(" \\\\ ")} \\end{gathered}`;
