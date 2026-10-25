/**
 * The answers to generated economics questions, computed again for
 * `check:quiz` without the generator's code, and where possible by another
 * route: equilibria from the curves, areas by the shoelace formula and checked
 * to tile the surpluses, the Gini by the mean absolute difference, a public
 * good's level and a benefit's end by bisection, a monopsonist's choice by
 * searching its profit, the median voter as the Condorcet winner, tax band by
 * band. Each answer is written as the generator's canonical formula (`tex`).
 */
import type { EconModel } from "../shared/quiz/index.ts";

/** A root of an increasing or decreasing function on [lo, hi]. */
function bisect(f: (x: number) => number, lo: number, hi: number): number {
  let flo = f(lo);
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.sign(fm) === Math.sign(flo)) {
      lo = mid;
      flo = fm;
    } else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The maximum of a single-peaked function on [lo, hi] (golden section). */
function argmax(f: (x: number) => number, lo: number, hi: number): number {
  const g = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 300; i++) {
    const x1 = hi - g * (hi - lo);
    const x2 = lo + g * (hi - lo);
    if (f(x1) < f(x2)) lo = x1;
    else hi = x2;
  }
  return (lo + hi) / 2;
}

const shoelace = (pts: [number, number][]): number =>
  Math.abs(pts.reduce((s, [x1, y1], i) => {
    const [x2, y2] = pts[(i + 1) % pts.length]!;
    return s + x1 * y2 - x2 * y1;
  }, 0)) / 2;

/** Mean absolute difference over equal-sized groups: Σ|yᵢ − yⱼ| / (2n²μ). */
function gini(shares: number[]): number {
  const n = shares.length;
  const mean = shares.reduce((s, x) => s + x, 0) / n;
  let sum = 0;
  for (const a of shares) for (const b of shares) sum += Math.abs(a - b);
  return sum / (2 * n * n * mean);
}

/** A tax market: equilibria without and with a per-unit tax (where it is levied does not matter). */
function taxed(a: number, b: number, c: number, d: number, t: number) {
  const q0 = bisect((q) => a - b * q - (c + d * q), 0, a / b);
  const qt = bisect((q) => a - b * q - (c + d * q) - t, 0, a / b);
  return { q0, p0: a - b * q0, qt, pb: a - b * qt, ps: c + d * qt };
}

/** The option is `value` written with `digits` decimals (either rounding of a tie accepted). */
function is(option: string, value: number, digits: number): boolean {
  if (!new RegExp(digits === 0 ? "^-?\\d+$" : `^-?\\d+\\.\\d{${digits}}$`).test(option)) return false;
  return Math.abs(Number(option) - value) <= 0.5 * 10 ** -digits + 1e-7;
}

export function econAnswer(m: EconModel, option: string): boolean {
  switch (m.type) {
    case "incidence": {
      const { q0, p0, qt, pb } = taxed(m.a, m.b, m.c, m.d, m.t);
      return m.ask === "buyerShare" ? is(option, (100 * (pb - p0)) / m.t, 1) : is(option, (m.t * (q0 - qt)) / 2, 2);
    }
    case "areas": {
      const { q0, p0, qt, pb, ps } = taxed(m.a, m.b, m.c, m.d, m.t);
      const area = new Map(m.polygons.map((p) => [p.label, shoelace(p.points)]));
      // The lettered areas must tile the surpluses before the tax.
      const total = [...area.values()].reduce((s, x) => s + x, 0);
      const before = (q0 * (m.a - m.c)) / 2;
      if (Math.abs(total - before) > 1e-6) throw new Error(`areas ${total} do not tile the surpluses ${before}`);
      const wanted = {
        dwl: (m.t * (q0 - qt)) / 2,
        revenue: m.t * qt,
        consumerLoss: (pb - p0) * qt + ((pb - p0) * (q0 - qt)) / 2,
        producerLoss: (p0 - ps) * qt + ((p0 - ps) * (q0 - qt)) / 2,
      }[m.ask];
      const letters = option.split("+");
      if (letters.some((l) => !area.has(l)) || [...letters].sort().join("+") !== option) return false;
      return Math.abs(letters.reduce((s, l) => s + area.get(l)!, 0) - wanted) < 1e-6;
    }
    case "pigou": {
      const q = bisect((x) => m.a - m.b * x - (m.c + m.d * x + m.e * x), 0, m.a / m.b);
      return is(option, m.ask === "tax" ? m.e * q : q, 2);
    }
    case "samuelson": {
      const total = (g: number): number => m.people.reduce((s, p) => s + Math.max(0, p.a - p.b * g), 0) - m.mc;
      return is(option, bisect(total, 0, Math.max(...m.people.map((p) => p.a / p.b))), 2);
    }
    case "gini":
      return is(option, gini(m.shares), 3);
    case "lorenz": {
      const cum = (s: number[]) => s.map((_, i) => s.slice(0, i + 1).reduce((a, x) => a + x, 0));
      const best = m.sets.find((s) => m.sets.every((o) => cum(s).every((v, i) => v >= cum(o)[i]! - 1e-12)));
      if (!best) throw new Error("no Lorenz curve above the others");
      return option.startsWith("G = ") && is(option.slice(4), gini(best), 3);
    }
    case "benefit": {
      const benefit = (h: number): number => Math.max(0, m.B - m.tau * m.w * h);
      const end = bisect((h) => m.B - m.tau * m.w * h, 0, 1000);
      if (m.ask === "breakEven") return is(option, end, 2);
      const net = (h: number): number => (1 - m.t) * m.w * h + benefit(h);
      const h = end / 2;
      const kept = (net(h + 1e-4) - net(h)) / (m.w * 1e-4);
      return is(option, 100 * (1 - kept), 1);
    }
    case "ramsey":
      // Equal proportional falls in demand: t₁ε₁ = t₂ε₂.
      return is(option, (m.t1 * m.e1) / m.e2, 1);
    case "saez":
      return is(option, 100 / (1 + m.a * m.e), 1);
    case "monopsony": {
      const mrp = (l: number): number => m.m - m.k * l;
      if (m.ask === "minWage") {
        const w = m.minWage!;
        return is(option, Math.min((w - m.c) / m.d, (m.m - w) / m.k), 2);
      }
      const profit = (l: number): number => m.m * l - (m.k * l * l) / 2 - (m.c + m.d * l) * l;
      const l = argmax(profit, 0, m.m / m.k);
      if (mrp(l) < m.c + m.d * l) throw new Error("monopsony wage above the marginal revenue product");
      const [lo, wo] = option.split(",");
      return lo !== undefined && wo !== undefined && is(lo, l, 2) && is(wo, m.c + m.d * l, 2);
    }
    case "schedule": {
      const sorted = [...m.brackets].sort((x, y) => x.from - y.from);
      let tax = 0;
      sorted.forEach((br, i) => {
        const top = sorted[i + 1]?.from ?? Infinity;
        tax += (br.rate / 100) * Math.max(0, Math.min(m.income, top) - br.from);
      });
      return m.ask === "tax" ? is(option, tax, 0) : is(option, (100 * tax) / m.income, 1);
    }
    case "median": {
      const beats = (x: number, y: number): boolean => m.ideals.filter((v) => Math.abs(v - x) < Math.abs(v - y)).length > m.ideals.length / 2;
      const winner = m.ideals.find((x) => m.ideals.every((y) => y === x || beats(x, y)));
      if (winner === undefined) throw new Error("no Condorcet winner");
      return is(option, winner, 2);
    }
    case "swf": {
      const f = { utilitarian: ([x, y]: [number, number]) => x + y, rawls: ([x, y]: [number, number]) => Math.min(x, y), nash: ([x, y]: [number, number]) => x * y }[m.criterion];
      const values = m.allocations.map(f);
      const best = Math.max(...values);
      if (values.filter((v) => v === best).length !== 1) throw new Error("two allocations tie");
      return option === "ABCD"[values.indexOf(best)];
    }
    case "insurance": {
      const eu = (1 - m.p) * Math.log(m.W) + m.p * Math.log(m.W - m.L);
      const ce = bisect((w) => Math.log(w) - eu, m.W - m.L, m.W);
      return is(option, m.W - ce, 1);
    }
  }
}
