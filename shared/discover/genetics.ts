/**
 * Genetics: Mendel's crosses, the Punnett square, and real offspring drawn by
 * chance.
 *
 * Each parent passes one of its two alleles per gene, each with probability
 * 1/2, and the genes sort independently. The Punnett square lists the
 * equally likely gametes, so its cells give the exact probabilities; the
 * offspring are drawn with a seeded generator, as the probability labs draw
 * dice and coins. `npm run check:biology` checks the squares against direct
 * enumeration, the draws against the probabilities (chi-square), and the
 * chi-square p-value itself.
 */
import { createRng, type Rng } from "../quiz/rng";

/** A genotype for one gene: two alleles, upper case dominant ("Aa"). */
export type Genotype = string;

/** The gametes of a parent, equally likely: "AaBb" → AB, Ab, aB, ab. */
export function gametes(parent: string): string[] {
  const genes: string[] = [];
  for (let i = 0; i < parent.length; i += 2) genes.push(parent.slice(i, i + 2));
  let out = [""];
  for (const g of genes) out = out.flatMap((prefix) => [prefix + g[0], prefix + g[1]]);
  return out;
}

/** A child from two gametes: per gene, the dominant allele first ("aA" → "Aa"). */
export function combine(a: string, b: string): string {
  let out = "";
  for (let i = 0; i < a.length; i++) {
    const pair = [a[i]!, b[i]!].sort((x, y) => (x === x.toUpperCase() ? 0 : 1) - (y === y.toUpperCase() ? 0 : 1));
    out += pair.join("");
  }
  return out;
}

/** The phenotype: per gene, dominant (upper case) shown if present. "AaBB" → "AB", "aabb" → "ab". */
export function phenotype(genotype: string): string {
  let out = "";
  for (let i = 0; i < genotype.length; i += 2) {
    const g = genotype.slice(i, i + 2);
    out += g[0] === g[0]!.toUpperCase() ? g[0]!.toUpperCase() : g[0]!.toLowerCase();
  }
  return out;
}

/** The Punnett square: rows the first parent's gametes, columns the second's. */
export function punnett(mother: string, father: string): { rows: string[]; cols: string[]; cells: string[][] } {
  const rows = gametes(mother);
  const cols = gametes(father);
  return { rows, cols, cells: rows.map((r) => cols.map((c) => combine(r, c))) };
}

/** Exact probabilities of each phenotype, from the square, largest first. */
export function phenotypeShares(mother: string, father: string): { phenotype: string; share: number }[] {
  const { cells } = punnett(mother, father);
  const all = cells.flat();
  const counts = new Map<string, number>();
  for (const g of all) counts.set(phenotype(g), (counts.get(phenotype(g)) ?? 0) + 1);
  return [...counts]
    .map(([p, n]) => ({ phenotype: p, share: n / all.length }))
    .sort((a, b) => b.share - a.share || (a.phenotype < b.phenotype ? 1 : -1));
}

/** One child, drawn: one allele from each parent for each gene. */
export function child(rng: Rng, mother: string, father: string): string {
  let a = "";
  let b = "";
  for (let i = 0; i < mother.length; i += 2) {
    a += mother[i + (rng.next() < 0.5 ? 0 : 1)];
    b += father[i + (rng.next() < 0.5 ? 0 : 1)];
  }
  return combine(a, b);
}

/** `count` children of a seeded experiment, counted by phenotype. */
export function breed(seed: number, mother: string, father: string, count: number, skip = 0): Map<string, number> {
  const rng = createRng(seed * 7919 + 17);
  for (let i = 0; i < skip; i++) child(rng, mother, father);
  const counts = new Map<string, number>();
  for (let i = 0; i < count; i++) {
    const p = phenotype(child(rng, mother, father));
    counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  return counts;
}

// ------------------------------------------------------------------ chi-square

/** ln Γ(x), Lanczos. */
function lnGamma(x: number): number {
  const g = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  x -= 1;
  let a = 0.99999999999980993;
  const t = x + 7.5;
  g.forEach((c, i) => (a += c / (x + i + 1)));
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/** The regularized lower incomplete gamma function P(s, x). */
function lowerGamma(s: number, x: number): number {
  if (x <= 0) return 0;
  if (x < s + 1) {
    let sum = 1 / s;
    let term = sum;
    for (let n = 1; n < 500; n++) {
      term *= x / (s + n);
      sum += term;
      if (term < sum * 1e-15) break;
    }
    return sum * Math.exp(-x + s * Math.log(x) - lnGamma(s));
  }
  // Continued fraction for Q, then P = 1 − Q.
  let b = x + 1 - s;
  let c = 1e300;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - s);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-15) break;
  }
  return 1 - Math.exp(-x + s * Math.log(x) - lnGamma(s)) * h;
}

/** The chance of a chi-square at least this large by chance alone, with `df` degrees of freedom. */
export const pValue = (chi2: number, df: number): number => 1 - lowerGamma(df / 2, chi2 / 2);
