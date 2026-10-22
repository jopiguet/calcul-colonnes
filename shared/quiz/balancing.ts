/**
 * Chemistry basics: balancing chemical equations.
 *
 * Each question is a reaction drawn from families (combustion, synthesis,
 * neutralization, displacement, decomposition), balanced by solving the atom
 * balance exactly: one equation per element, one unknown per substance, and
 * the one solution in smallest whole numbers. The wrong options are the
 * mistakes learners make: a subscript changed instead of a coefficient (the
 * atoms balance, but the substance is another one), coefficients that are not
 * the smallest, an element left unbalanced, O₂ written O.
 *
 * `npm run check:quiz` re-reads every option from what the player sees, with
 * its own formula parser, and counts the atoms on each side.
 */
import type { Draft, Generator, Level, MistakeKey, Option } from "./types";
import type { Rng } from "./rng";
import { lines } from "./tex";

export interface Reaction {
  reactants: string[];
  products: string[];
}

// ------------------------------------------------------------------ formulas

/** Atoms in a formula: "Ca(OH)2" → Ca 1, O 2, H 2. Parentheses may nest. */
export function atoms(formula: string): Map<string, number> {
  let i = 0;
  const number = (): number => {
    const m = /^\d+/.exec(formula.slice(i));
    if (!m) return 1;
    i += m[0].length;
    return Number(m[0]);
  };
  const group = (): Map<string, number> => {
    const counts = new Map<string, number>();
    const add = (element: string, n: number): void => {
      counts.set(element, (counts.get(element) ?? 0) + n);
    };
    while (i < formula.length && formula[i] !== ")") {
      if (formula[i] === "(") {
        i++;
        const inner = group();
        if (formula[i] !== ")") throw new Error(`unbalanced parenthesis in ${formula}`);
        i++;
        const k = number();
        for (const [e, n] of inner) add(e, n * k);
        continue;
      }
      const m = /^[A-Z][a-z]?/.exec(formula.slice(i));
      if (!m) throw new Error(`cannot read ${formula} at ${i}`);
      i += m[0].length;
      add(m[0], number());
    }
    return counts;
  };
  const counts = group();
  if (i !== formula.length) throw new Error(`cannot read ${formula}`);
  return counts;
}

/** A formula in TeX, subscripts lowered: \mathrm{Ca(OH)_{2}}. */
export const formulaTex = (formula: string): string => `\\mathrm{${formula.replace(/(\d+)/g, "_{$1}")}}`;

/** The same substance's formula with every count multiplied: what "a subscript changed" writes. */
export function multiplied(formula: string, k: number): string {
  // Top-level parts: an element or a parenthesised group, with its count.
  const parts: { body: string; n: number }[] = [];
  let i = 0;
  while (i < formula.length) {
    let body: string;
    if (formula[i] === "(") {
      let depth = 0;
      let j = i;
      do {
        if (formula[j] === "(") depth++;
        if (formula[j] === ")") depth--;
        j++;
      } while (depth > 0);
      body = formula.slice(i, j);
      i = j;
    } else {
      const m = /^[A-Z][a-z]?/.exec(formula.slice(i))!;
      body = m[0];
      i += body.length;
    }
    const m = /^\d+/.exec(formula.slice(i));
    const n = m ? Number(m[0]) : 1;
    if (m) i += m[0].length;
    parts.push({ body, n });
  }
  return parts.map(({ body, n }) => `${body}${n * k === 1 ? "" : n * k}`).join("");
}

// ------------------------------------------------------------------ balancing

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;

/** An exact fraction. */
type Q = [number, number];
const q = (n: number, d = 1): Q => {
  const g = gcd(n, d) || 1;
  const s = d < 0 ? -1 : 1;
  return [(s * n) / g, (s * d) / g];
};
const sub = (a: Q, b: Q): Q => q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const mul = (a: Q, b: Q): Q => q(a[0] * b[0], a[1] * b[1]);
const div = (a: Q, b: Q): Q => q(a[0] * b[1], a[1] * b[0]);

/**
 * The coefficients in smallest whole numbers, reactants then products; null
 * when the reaction cannot be balanced or can be in more than one way.
 */
export function balance(r: Reaction): number[] | null {
  const species = [...r.reactants, ...r.products];
  const counts = species.map(atoms);
  const elements = [...new Set(counts.flatMap((c) => [...c.keys()]))];
  // One row per element: Σ (reactant atoms) − Σ (product atoms) = 0.
  const m: Q[][] = elements.map((e) => species.map((_, j) => q((counts[j]!.get(e) ?? 0) * (j < r.reactants.length ? 1 : -1))));
  const n = species.length;
  const pivots: number[] = [];
  let row = 0;
  for (let col = 0; col < n && row < m.length; col++) {
    const p = m.findIndex((line, i) => i >= row && line[col]![0] !== 0);
    if (p < 0) continue;
    [m[row], m[p]] = [m[p]!, m[row]!];
    const pivot = m[row]![col]!;
    m[row] = m[row]!.map((x) => div(x, pivot));
    for (let i = 0; i < m.length; i++) {
      if (i === row || m[i]![col]![0] === 0) continue;
      const f = m[i]![col]!;
      m[i] = m[i]!.map((x, j) => sub(x, mul(f, m[row]![j]!)));
    }
    pivots.push(col);
    row++;
  }
  const free = [...Array(n).keys()].filter((c) => !pivots.includes(c));
  if (free.length !== 1) return null;
  const f = free[0]!;
  const x: Q[] = Array.from({ length: n }, () => q(0));
  x[f] = q(1);
  pivots.forEach((col, i) => {
    x[col] = sub(q(0), m[i]![f]!);
  });
  const scale = x.reduce((acc, v) => lcm(acc, v[1]), 1);
  let ints = x.map((v) => (v[0] * scale) / v[1]);
  if (ints.every((v) => v < 0)) ints = ints.map((v) => -v);
  if (!ints.every((v) => v > 0)) return null;
  const g = ints.reduce((acc, v) => gcd(acc, v), 0);
  return ints.map((v) => v / g);
}

/** The equation in TeX, coefficients of 1 left out. */
export function equationTex(r: Reaction, c: (number | null)[]): string {
  const term = (formula: string, k: number | null): string => (k === null ? `{?}\\,${formulaTex(formula)}` : k === 1 ? formulaTex(formula) : `${k}\\,${formulaTex(formula)}`);
  const side = (list: string[], from: number): string => list.map((f, i) => term(f, c[from + i]!)).join(" + ");
  return `${side(r.reactants, 0)} \\longrightarrow ${side(r.products, r.reactants.length)}`;
}

/**
 * An equation as display rows: on one line when it fits a phone, otherwise
 * broken after the arrow. Options stay on one line (they wrap as text).
 */
export function rows(tex: string): string[] {
  const visible = tex.replace(/\\mathrm|\\,|\\longrightarrow|[{}_ ]/g, "").length;
  if (visible <= 14) return [tex];
  const [left, right] = tex.split(" \\longrightarrow ");
  return [`${left} \\longrightarrow`, right!];
}

/** The skeleton, as asked: no coefficients. */
export const skeletonTex = (r: Reaction): string =>
  `${r.reactants.map(formulaTex).join(" + ")} \\longrightarrow ${r.products.map(formulaTex).join(" + ")}`;

/** The atom count on each side, element by element, for the explanation. */
export function countTex(r: Reaction, c: number[]): string[] {
  const species = [...r.reactants, ...r.products];
  const counts = species.map(atoms);
  const elements = [...new Set(counts.flatMap((m) => [...m.keys()]))];
  const side = (e: string, from: number, to: number): string => {
    const terms: string[] = [];
    for (let j = from; j < to; j++) {
      const n = (counts[j]!.get(e) ?? 0) * c[j]!;
      if (n > 0) terms.push(String(n));
    }
    return terms.join(" + ");
  };
  const each = elements.map((e) => `\\mathrm{${e}}: ${side(e, 0, r.reactants.length)} = ${side(e, r.reactants.length, species.length)}`);
  // Two to a line when they are short enough for a phone.
  const width = (t: string): number => t.replace(/\\mathrm|[{}\\ ]/g, "").length;
  const out: string[] = [];
  for (let i = 0; i < each.length; i++) {
    const next = each[i + 1];
    if (next !== undefined && width(each[i]!) + width(next) <= 16) {
      out.push(`${each[i]}\\qquad ${next}`);
      i++;
    } else out.push(each[i]!);
  }
  return out;
}

// ------------------------------------------------------------------ reactions

const hydrocarbon = (c: number, h: number): string => `C${c === 1 ? "" : c}H${h}`;

function combustionOf(rng: Rng): Reaction {
  const family = rng.int(0, 3);
  let fuel: string;
  if (family === 0) {
    const n = rng.int(1, 8);
    fuel = hydrocarbon(n, 2 * n + 2); // alkane
  } else if (family === 1) {
    const n = rng.int(2, 6);
    fuel = hydrocarbon(n, 2 * n); // alkene
  } else if (family === 2) {
    const n = rng.int(1, 5);
    fuel = `${hydrocarbon(n, 2 * n + 1)}OH`; // alcohol
  } else fuel = rng.pick(["C6H12O6", "C2H2", "C6H6", "C12H22O11", "CH3COOH"]);
  return { reactants: [fuel, "O2"], products: ["CO2", "H2O"] };
}

const METALS: { symbol: string; charge: number }[] = [
  { symbol: "Li", charge: 1 },
  { symbol: "Na", charge: 1 },
  { symbol: "K", charge: 1 },
  { symbol: "Mg", charge: 2 },
  { symbol: "Ca", charge: 2 },
  { symbol: "Zn", charge: 2 },
  { symbol: "Ba", charge: 2 },
  { symbol: "Al", charge: 3 },
  { symbol: "Fe", charge: 3 },
];

/** An ionic compound from its ions: Al³⁺ and SO₄²⁻ give Al2(SO4)3. */
export function salt(cation: string, charge: number, anion: string, anionCharge: number): string {
  const g = gcd(charge, anionCharge);
  const nCation = anionCharge / g;
  const nAnion = charge / g;
  const polyatomic = /[A-Z].*[A-Z]|\d/.test(anion);
  const cationPart = `${cation}${nCation === 1 ? "" : nCation}`;
  const anionPart = nAnion === 1 ? anion : polyatomic ? `(${anion})${nAnion}` : `${anion}${nAnion}`;
  return cationPart + anionPart;
}

function synthesisOf(rng: Rng): Reaction {
  const kind = rng.int(0, 2);
  if (kind === 0) {
    const metal = rng.pick(METALS);
    return { reactants: [metal.symbol, "O2"], products: [salt(metal.symbol, metal.charge, "O", 2)] };
  }
  if (kind === 1) {
    const metal = rng.pick(METALS);
    return { reactants: [metal.symbol, "Cl2"], products: [salt(metal.symbol, metal.charge, "Cl", 1)] };
  }
  return rng.pick<Reaction>([
    { reactants: ["N2", "H2"], products: ["NH3"] },
    { reactants: ["P4", "O2"], products: ["P4O10"] },
    { reactants: ["N2", "O2"], products: ["NO2"] },
    { reactants: ["S", "O2"], products: ["SO3"] },
    { reactants: ["SO2", "O2"], products: ["SO3"] },
    { reactants: ["H2", "O2"], products: ["H2O"] },
    { reactants: ["CO", "O2"], products: ["CO2"] },
    { reactants: ["NO", "O2"], products: ["NO2"] },
  ]);
}

const ACIDS: { formula: string; anion: string; charge: number }[] = [
  { formula: "HCl", anion: "Cl", charge: 1 },
  { formula: "HNO3", anion: "NO3", charge: 1 },
  { formula: "H2SO4", anion: "SO4", charge: 2 },
  { formula: "H3PO4", anion: "PO4", charge: 3 },
];

const BASES: { formula: string; cation: string; charge: number }[] = [
  { formula: "NaOH", cation: "Na", charge: 1 },
  { formula: "KOH", cation: "K", charge: 1 },
  { formula: "Ca(OH)2", cation: "Ca", charge: 2 },
  { formula: "Mg(OH)2", cation: "Mg", charge: 2 },
  { formula: "Ba(OH)2", cation: "Ba", charge: 2 },
  { formula: "Al(OH)3", cation: "Al", charge: 3 },
];

function neutralizationOf(rng: Rng): Reaction {
  const acid = rng.pick(ACIDS);
  const base = rng.pick(BASES);
  return { reactants: [acid.formula, base.formula], products: [salt(base.cation, base.charge, acid.anion, acid.charge), "H2O"] };
}

const ACTIVE: { symbol: string; charge: number }[] = [
  { symbol: "Zn", charge: 2 },
  { symbol: "Mg", charge: 2 },
  { symbol: "Al", charge: 3 },
  { symbol: "Fe", charge: 2 },
  { symbol: "Na", charge: 1 },
];

function displacementOf(rng: Rng): Reaction {
  const metal = rng.pick(ACTIVE);
  if (rng.int(0, 1) === 0) {
    // A metal in an acid gives hydrogen.
    const acid = rng.pick(ACIDS.slice(0, 3).filter((a) => a.anion !== "NO3"));
    return { reactants: [metal.symbol, acid.formula], products: [salt(metal.symbol, metal.charge, acid.anion, acid.charge), "H2"] };
  }
  // A more reactive metal takes the place of a less reactive one in its salt.
  const target = rng.pick<{ formula: string; metal: string; anion: string; anionCharge: number }>([
    { formula: "CuSO4", metal: "Cu", anion: "SO4", anionCharge: 2 },
    { formula: "CuCl2", metal: "Cu", anion: "Cl", anionCharge: 1 },
    { formula: "AgNO3", metal: "Ag", anion: "NO3", anionCharge: 1 },
  ]);
  const m = metal.symbol === "Na" ? { symbol: "Mg", charge: 2 } : metal; // sodium reacts with the water first
  return { reactants: [m.symbol, target.formula], products: [salt(m.symbol, m.charge, target.anion, target.anionCharge), target.metal] };
}

function decompositionOf(rng: Rng): Reaction {
  return rng.pick<Reaction>([
    { reactants: ["KClO3"], products: ["KCl", "O2"] },
    { reactants: ["H2O2"], products: ["H2O", "O2"] },
    { reactants: ["NaHCO3"], products: ["Na2CO3", "H2O", "CO2"] },
    { reactants: ["Al2O3"], products: ["Al", "O2"] },
    { reactants: ["NaN3"], products: ["Na", "N2"] },
    { reactants: ["HgO"], products: ["Hg", "O2"] },
    { reactants: ["H2O"], products: ["H2", "O2"] },
    { reactants: ["NH3"], products: ["N2", "H2"] },
    { reactants: ["Fe2O3", "C"], products: ["Fe", "CO2"] },
    { reactants: ["Pb(NO3)2"], products: ["PbO", "NO2", "O2"] },
  ]);
}

/** A reaction of a family that needs balancing (not all coefficients 1), with its coefficients. */
function draw(rng: Rng, family: (rng: Rng) => Reaction): { r: Reaction; c: number[] } {
  for (;;) {
    const r = family(rng);
    const c = balance(r);
    if (c && c.some((k) => k > 1) && Math.max(...c) <= 30) return { r, c };
  }
}

// ------------------------------------------------------------------ mistakes

const DIATOMIC = ["O2", "H2", "N2", "Cl2"];

/** O₂ written O (and so on), then balanced: what forgetting that the element comes in pairs gives. */
function monatomic(r: Reaction): { r: Reaction; c: number[] } | null {
  const one = (f: string): string => (DIATOMIC.includes(f) ? f.slice(0, -1) : f);
  if (![...r.reactants, ...r.products].some((f) => DIATOMIC.includes(f))) return null;
  const changed = { reactants: r.reactants.map(one), products: r.products.map(one) };
  const c = balance(changed);
  return c ? { r: changed, c } : null;
}

const option = (r: Reaction, c: number[], mistake?: MistakeKey): Option => ({ tex: equationTex(r, c), ...(mistake ? { mistake } : {}) });

/** The wrong equations for a reaction balanced by `c`. */
function wrongEquations(r: Reaction, c: number[]): Option[] {
  const n = c.length;
  const wrong: Option[] = [option(r, c.map((k) => 2 * k), "notLowestTerms")];
  // A coefficient folded into the formula: the atoms balance, the substance is another.
  c.forEach((k, j) => {
    if (k < 2) return;
    const formulas = [...r.reactants, ...r.products];
    formulas[j] = multiplied(formulas[j]!, k);
    const changed = { reactants: formulas.slice(0, r.reactants.length), products: formulas.slice(r.reactants.length) };
    wrong.push(option(changed, c.map((x, i) => (i === j ? 1 : x)), "subscriptChanged"));
  });
  const single = monatomic(r);
  if (single) wrong.push(option(single.r, single.c, "diatomicForgotten"));
  // One coefficient off: an element left unbalanced.
  for (let j = 0; j < n; j++) {
    for (const d of [1, -1]) {
      const k = c[j]! + d;
      if (k < 1) continue;
      wrong.push(option(r, c.map((x, i) => (i === j ? k : x)), "elementUnbalanced"));
    }
  }
  return wrong;
}

/** A question: which equation is balanced, in the smallest whole numbers? */
const equationQuestion =
  (family: (rng: Rng) => Reaction): Generator =>
  (rng) => {
    const { r, c } = draw(rng, family);
    const wrong = wrongEquations(r, c);
    // Keep the instructive mistakes in front: finalize takes three of the shuffled candidates.
    const typed = wrong.filter((o) => o.mistake !== "elementUnbalanced");
    const off = rng.shuffle(wrong.filter((o) => o.mistake === "elementUnbalanced")).slice(0, 3);
    const draft: Draft = {
      prompt: { key: "balanceEquation", tex: lines(...rows(skeletonTex(r))) },
      correct: option(r, c),
      wrong: [...typed, ...off],
      explanation: { key: "balanceEquation", tex: lines(...rows(equationTex(r, c)), ...countTex(r, c)) },
      verify: { kind: "equation", reactants: r.reactants, products: r.products },
    };
    return draft;
  };

const whole = (n: number, mistake?: MistakeKey): Option => ({ tex: String(n), num: n, ...(mistake ? { mistake } : {}) });

/** A question: which coefficient goes in front of one substance? */
const coefficient: Generator = (rng) => {
  const family = rng.pick([combustionOf, synthesisOf, neutralizationOf, displacementOf, decompositionOf]);
  const { r, c } = draw(rng, family);
  const species = [...r.reactants, ...r.products];
  // Ask for one whose coefficient is not 1, so that "1" is a mistake to offer.
  const candidates = c.map((k, j) => (k > 1 ? j : -1)).filter((j) => j >= 0);
  const j = rng.pick(candidates);
  const k = c[j]!;
  const wrong = [whole(2 * k, "notLowestTerms"), whole(k + 1, "elementUnbalanced"), whole(k - 1, "elementUnbalanced"), whole(k + 2, "elementUnbalanced")];
  const single = monatomic(r);
  if (single && DIATOMIC.includes(species[j]!)) wrong.push(whole(single.c[j]!, "diatomicForgotten"));
  const ask: (number | null)[] = c.map(() => 1);
  ask[j] = null;
  return {
    prompt: { key: "balanceCoefficient", tex: lines(...rows(equationTex(r, ask))) },
    correct: whole(k),
    wrong,
    explanation: { key: "balanceEquation", tex: lines(...rows(equationTex(r, c)), ...countTex(r, c)) },
    verify: { kind: "coefficient", reactants: r.reactants, products: r.products, coefficients: c, species: j },
  };
};

export const balancing: Partial<Record<Level, Record<string, Generator>>> = {
  chembio: {
    combustion: equationQuestion(combustionOf),
    synthesis: equationQuestion(synthesisOf),
    neutralization: equationQuestion(neutralizationOf),
    displacement: equationQuestion(displacementOf),
    decomposition: equationQuestion(decompositionOf),
    coefficient,
  },
};
