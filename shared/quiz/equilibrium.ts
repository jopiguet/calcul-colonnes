/**
 * Physical chemistry, Focus 6: chemical equilibrium (Atkins Topics 6A–6D).
 * K and ΔrG°, the reaction quotient, the van 't Hoff equation, the response
 * to pressure, cells and electrode potentials.
 */
import { lines } from "./tex";
import { R, KELVIN, FARADAY, asked, draw, mistakeIn, valueIn, sig } from "./units";
import type { Generator, Option } from "./types";
import type { Rng } from "./rng";

const kJmol = "kJ\\,mol^{-1}";
const shown = (x: number, digits = 3): number => Number(x.toPrecision(digits));
/** An equilibrium constant and its wrong values span powers of ten: choices only. */
const constant = (o: Option): Option => ({ ...o, choiceOnly: true });

/** A value of K drawn as m × 10ⁿ, written to 2 figures. */
function drawK(rng: Rng, low: number, high: number): number {
  return shown(draw(rng, 1, 9.9, 0.1) * 10 ** rng.int(low, high), 2);
}

/** K = exp(−ΔrG°/RT), temperature in °C. */
const constantFromGibbs: Generator = (rng) => {
  let G = draw(rng, -30, 30, 0.1);
  if (Math.abs(G) < 1) G = G < 0 ? -1.5 : 1.5;
  const t = draw(rng, 25, 500, 5);
  const T = t + KELVIN;
  const K = Math.exp((-G * 1000) / (R * T));
  return {
    prompt: { key: "constantFromGibbs", tex: lines(`\\Delta_\\mathrm{r}G^{\\ominus} = ${sig(G)}\\,\\mathrm{${kJmol}}`, `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, asked("K", "")) },
    correct: constant(valueIn(K, "")),
    wrong: [
      mistakeIn(1 / K, "", "signError"),
      mistakeIn(Math.exp(-G / (R * T)), "", "energyUnits"),
      mistakeIn(10 ** ((-G * 1000) / (R * T)), "", "logBase"),
      mistakeIn(Math.exp((-G * 1000) / (R * t)), "", "celsiusForKelvin"),
    ].map(constant),
    explanation: {
      key: "constantFromGibbs",
      tex: `\\ln K = -\\frac{\\Delta_\\mathrm{r}G^{\\ominus}}{RT} = -\\frac{${sig(G)} \\times 10^{3}}{8.314 \\times ${sig(T, 5)}} = ${sig((-G * 1000) / (R * T))},\\quad K = ${sig(K)}`,
    },
    verify: { kind: "value", value: K },
  };
};

/** ΔrG° = −RT ln K, temperature in °C. */
const gibbsFromK: Generator = (rng) => {
  let K = drawK(rng, -12, 12);
  if (K === 1) K = 2;
  const t = draw(rng, 25, 500, 5);
  const T = t + KELVIN;
  const G = (-R * T * Math.log(K)) / 1000;
  return {
    prompt: { key: "gibbsFromK", tex: lines(`K = ${sig(K, 2)},\\quad \\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, asked("\\Delta_\\mathrm{r}G^{\\ominus}", kJmol)) },
    correct: valueIn(G, kJmol),
    wrong: [
      mistakeIn(-G, kJmol, "signError"),
      mistakeIn((-R * T * Math.log10(K)) / 1000, kJmol, "logBase"),
      mistakeIn(G * 1000, kJmol, "energyUnits"),
      mistakeIn((-R * t * Math.log(K)) / 1000, kJmol, "celsiusForKelvin"),
    ],
    explanation: {
      key: "gibbsFromK",
      tex: `\\Delta_\\mathrm{r}G^{\\ominus} = -RT\\ln K = -8.314 \\times ${sig(T, 5)} \\times (${sig(Math.log(K))})\\,\\mathrm{J\\,mol^{-1}} = ${sig(G)}\\,\\mathrm{${kJmol}}`,
    },
    verify: { kind: "value", value: G },
  };
};

/** Gas-phase reactions with ΔrG° at 298 K (kJ mol⁻¹) and their species [ν, TeX] (ν < 0: reactant). */
const REACTIONS: { tex: string; G: number; species: [number, string][] }[] = [
  { tex: "\\mathrm{N_2(g) + 3\\,H_2(g) \\rightleftharpoons 2\\,NH_3(g)}", G: -32.9, species: [[-1, "N_2"], [-3, "H_2"], [2, "NH_3"]] },
  { tex: "\\mathrm{N_2O_4(g) \\rightleftharpoons 2\\,NO_2(g)}", G: 4.73, species: [[-1, "N_2O_4"], [2, "NO_2"]] },
  { tex: "\\mathrm{2\\,SO_2(g) + O_2(g) \\rightleftharpoons 2\\,SO_3(g)}", G: -141.7, species: [[-2, "SO_2"], [-1, "O_2"], [2, "SO_3"]] },
  { tex: "\\mathrm{H_2(g) + I_2(g) \\rightleftharpoons 2\\,HI(g)}", G: -15.9, species: [[-1, "H_2"], [-1, "I_2"], [2, "HI"]] },
  { tex: "\\mathrm{CO(g) + H_2O(g) \\rightleftharpoons CO_2(g) + H_2(g)}", G: -28.6, species: [[-1, "CO"], [-1, "H_2O"], [1, "CO_2"], [1, "H_2"]] },
  { tex: "\\mathrm{PCl_5(g) \\rightleftharpoons PCl_3(g) + Cl_2(g)}", G: 37.2, species: [[-1, "PCl_5"], [1, "PCl_3"], [1, "Cl_2"]] },
];

/** ΔrG = ΔrG° + RT ln Q at 298 K, partial pressures in bar. */
const reactionGibbs: Generator = (rng) => {
  const r = rng.pick(REACTIONS);
  const p = r.species.map(() => draw(rng, 0.1, 5, 0.1));
  const T = 298;
  const lnQ = (exponents: boolean): number => r.species.reduce((s, [nu], i) => s + (exponents ? nu : Math.sign(nu)) * Math.log(p[i]!), 0);
  const G = r.G + (R * T * lnQ(true)) / 1000;
  if (Math.abs(lnQ(true)) < 0.3) return reactionGibbs(rng);
  const each = r.species.map(([, s], i) => `p_{\\mathrm{${s}}} = ${sig(p[i]!, 2)}\\,\\mathrm{bar}`);
  const pressures = [each.slice(0, 2).join(",\\quad "), each.slice(2).join(",\\quad ")].filter(Boolean);
  return {
    prompt: {
      key: "reactionGibbs",
      tex: lines(r.tex, `\\Delta_\\mathrm{r}G^{\\ominus} = ${r.G}\\,\\mathrm{${kJmol}},\\quad T = ${T}\\,\\mathrm{K}`, ...pressures, asked("\\Delta_\\mathrm{r}G", kJmol)),
      id: `${r.tex}${p.join()}`,
    },
    correct: valueIn(G, kJmol),
    wrong: [
      mistakeIn(r.G - (R * T * lnQ(true)) / 1000, kJmol, "ratioInverted"),
      mistakeIn(r.G + (R * T * lnQ(false)) / 1000, kJmol, "stoichiometryForgotten"),
      mistakeIn(r.G + R * T * lnQ(true), kJmol, "energyUnits"),
      mistakeIn(r.G, kJmol, "termDropped"),
    ],
    explanation: {
      key: "reactionGibbs",
      tex: `\\ln Q = \\sum_\\mathrm{J}\\nu_\\mathrm{J}\\ln\\frac{p_\\mathrm{J}}{p^{\\ominus}} = ${sig(lnQ(true))},\\quad \\Delta_\\mathrm{r}G = \\Delta_\\mathrm{r}G^{\\ominus} + RT\\ln Q = ${r.G} + 8.314 \\times 10^{-3} \\times ${T} \\times (${sig(lnQ(true))}) = ${sig(G)}\\,\\mathrm{${kJmol}}`,
    },
    verify: { kind: "value", value: G },
  };
};

/** van 't Hoff: K at another temperature, temperatures in °C. */
const vantHoff: Generator = (rng) => {
  const H = draw(rng, 20, 150, 1) * rng.pick([1, -1]);
  const K1 = drawK(rng, -4, 4);
  const t1 = 25;
  const t2 = draw(rng, 50, 500, 10);
  const T1 = t1 + KELVIN;
  const T2 = t2 + KELVIN;
  const x = ((-H * 1000) / R) * (1 / T2 - 1 / T1);
  const K2 = K1 * Math.exp(x);
  return {
    prompt: {
      key: "vantHoff",
      tex: lines(`K(${t1}\\,\\mathrm{{}^{\\circ}C}) = ${sig(K1, 2)}`, `\\Delta_\\mathrm{r}H^{\\ominus} = ${H > 0 ? "+" : ""}${H}\\,\\mathrm{${kJmol}}`, `\\theta = ${t2}\\,\\mathrm{{}^{\\circ}C}:\\ ${asked("K", "")}`),
    },
    correct: constant(valueIn(K2, "")),
    wrong: [
      mistakeIn(K1 * Math.exp(-x), "", "signError"),
      mistakeIn(K1 * Math.exp(((-H) / R) * (1 / T2 - 1 / T1)), "", "energyUnits"),
      mistakeIn(K1 * 10 ** x, "", "logBase"),
      ...(Math.abs(((H * 1000) / R) * (1 / t2 - 1 / t1)) < 600 ? [mistakeIn(K1 * Math.exp(((-H * 1000) / R) * (1 / t2 - 1 / t1)), "", "celsiusForKelvin")] : []),
    ].map(constant),
    explanation: {
      key: "vantHoff",
      tex: `\\ln\\frac{K_2}{K_1} = -\\frac{\\Delta_\\mathrm{r}H^{\\ominus}}{R}\\left(\\frac{1}{T_2} - \\frac{1}{T_1}\\right) = -\\frac{${H} \\times 10^{3}}{8.314}\\left(\\frac{1}{${sig(T2, 5)}} - \\frac{1}{${sig(T1, 5)}}\\right) = ${sig(x)},\\quad K_2 = ${sig(K2)}`,
    },
    verify: { kind: "value", value: K2 },
  };
};

/** ΔrH° from K at two temperatures (°C). */
const vantHoffEnthalpy: Generator = (rng) => {
  const H0 = draw(rng, 20, 150, 1) * rng.pick([1, -1]);
  const K1 = drawK(rng, -4, 4);
  const t1 = draw(rng, 25, 300, 25);
  const t2 = t1 + draw(rng, 25, 200, 25);
  const T1 = t1 + KELVIN;
  const T2 = t2 + KELVIN;
  const K2 = shown(K1 * Math.exp(((-H0 * 1000) / R) * (1 / T2 - 1 / T1)), 3);
  const H = (-R * Math.log(K2 / K1)) / (1 / T2 - 1 / T1) / 1000;
  return {
    prompt: {
      key: "vantHoffEnthalpy",
      tex: lines(`K(${t1}\\,\\mathrm{{}^{\\circ}C}) = ${sig(K1, 2)}`, `K(${t2}\\,\\mathrm{{}^{\\circ}C}) = ${sig(K2)}`, asked("\\Delta_\\mathrm{r}H^{\\ominus}", kJmol)),
    },
    correct: valueIn(H, kJmol),
    wrong: [
      mistakeIn(-H, kJmol, "signError"),
      mistakeIn((-R * Math.log10(K2 / K1)) / (1 / T2 - 1 / T1) / 1000, kJmol, "logBase"),
      mistakeIn(H * 1000, kJmol, "energyUnits"),
      mistakeIn((-R * Math.log(K2 / K1)) / (1 / t2 - 1 / t1) / 1000, kJmol, "celsiusForKelvin"),
    ],
    explanation: {
      key: "vantHoffEnthalpy",
      tex: `\\Delta_\\mathrm{r}H^{\\ominus} = -\\frac{R\\ln(K_2/K_1)}{1/T_2 - 1/T_1} = -\\frac{8.314 \\times (${sig(Math.log(K2 / K1))})}{1/${sig(T2, 5)} - 1/${sig(T1, 5)}}\\,\\mathrm{J\\,mol^{-1}} = ${sig(H)}\\,\\mathrm{${kJmol}}`,
    },
    verify: { kind: "value", value: H },
  };
};

/** Degree of dissociation of A(g) ⇌ 2 B(g) at total pressure p: α = (1 + 4p/Kp°)^(−1/2). */
const dissociationDegree: Generator = (rng) => {
  const K = draw(rng, 0.05, 5, 0.01);
  const p = draw(rng, 10, 500, 10); // kPa
  const ratio = p / 100; // p/p°, p° = 1 bar
  if (Math.abs(Math.log(ratio / K)) < 0.4) return dissociationDegree(rng); // p/p° ≈ K: K and p swapped would give the same α
  const alpha = (1 + (4 * ratio) / K) ** -0.5;
  return {
    prompt: { key: "dissociationDegree", tex: lines(`\\mathrm{A(g) \\rightleftharpoons 2\\,B(g)}`, `K = ${sig(K)}`, `p = ${p}\\,\\mathrm{kPa}`, `p^{\\ominus} = 1\\,\\mathrm{bar}`, asked("\\alpha", "")) },
    correct: valueIn(alpha, ""),
    wrong: [
      mistakeIn((1 + (4 * K) / ratio) ** -0.5, "", "formulaInverted"),
      mistakeIn((1 + (4 * ratio) / K) ** -1, "", "sqrtForgotten"),
      mistakeIn((1 + ratio / K) ** -0.5, "", "wrongFactor"),
      mistakeIn((1 + (4 * p) / K) ** -0.5, "", "pressureUnits"),
    ],
    explanation: {
      key: "dissociationDegree",
      tex: `K = \\frac{4\\alpha^{2}(p/p^{\\ominus})}{1 - \\alpha^{2}} \\Rightarrow \\alpha = \\left(1 + \\frac{4p}{Kp^{\\ominus}}\\right)^{-1/2} = \\left(1 + \\frac{4 \\times ${sig(ratio)}}{${sig(K)}}\\right)^{-1/2} = ${sig(alpha)}`,
    },
    verify: { kind: "value", value: alpha },
  };
};

/** ΔrG° = −νFE°cell, in kJ mol⁻¹. */
const cellGibbs: Generator = (rng) => {
  const nu = rng.pick([2, 3, 4, 6]);
  let E = draw(rng, -1.5, 2, 0.01);
  if (Math.abs(E) < 0.05) E = 0.25;
  const G = (-nu * FARADAY * E) / 1000;
  return {
    prompt: { key: "cellGibbs", tex: lines(`E_\\mathrm{cell}^{\\ominus} = ${sig(E)}\\,\\mathrm{V},\\quad \\nu = ${nu}`, asked("\\Delta_\\mathrm{r}G^{\\ominus}", kJmol)) },
    correct: valueIn(G, kJmol),
    wrong: [
      mistakeIn((-FARADAY * E) / 1000, kJmol, "stoichiometryForgotten"),
      mistakeIn(-G, kJmol, "signError"),
      mistakeIn(G * 1000, kJmol, "energyUnits"),
      mistakeIn((-FARADAY * E) / nu / 1000, kJmol, "formulaInverted"),
    ],
    explanation: {
      key: "cellGibbs",
      tex: `\\Delta_\\mathrm{r}G^{\\ominus} = -\\nu FE_\\mathrm{cell}^{\\ominus} = -${nu} \\times 96\\,485 \\times (${sig(E)})\\,\\mathrm{J\\,mol^{-1}} = ${sig(G)}\\,\\mathrm{${kJmol}}`,
    },
    verify: { kind: "value", value: G },
  };
};

/** K of a cell reaction: ln K = νFE°/RT, temperature in °C. */
const cellEquilibrium: Generator = (rng) => {
  const nu = rng.pick([1, 2, 3]);
  let E = draw(rng, -0.4, 0.5, 0.01);
  if (Math.abs(E) < 0.03) E = 0.12;
  const t = draw(rng, 15, 40, 1);
  const T = t + KELVIN;
  const x = (nu * FARADAY * E) / (R * T);
  const K = Math.exp(x);
  const wrong: Option[] = [mistakeIn(1 / K, "", "signError"), mistakeIn(10 ** x, "", "logBase")];
  if (nu > 1) wrong.push(mistakeIn(Math.exp(x / nu), "", "stoichiometryForgotten"));
  const celsius = (nu * FARADAY * E) / (R * t);
  if (Math.abs(celsius) < 600) wrong.push(mistakeIn(Math.exp(celsius), "", "celsiusForKelvin"));
  return {
    prompt: { key: "cellEquilibrium", tex: lines(`E_\\mathrm{cell}^{\\ominus} = ${sig(E)}\\,\\mathrm{V},\\quad \\nu = ${nu}`, `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, asked("K", "")) },
    correct: constant(valueIn(K, "")),
    wrong: wrong.map(constant),
    explanation: {
      key: "cellEquilibrium",
      tex: `\\ln K = \\frac{\\nu FE_\\mathrm{cell}^{\\ominus}}{RT} = \\frac{${nu} \\times 96\\,485 \\times (${sig(E)})}{8.314 \\times ${sig(T, 5)}} = ${sig(x)},\\quad K = ${sig(K)}`,
    },
    verify: { kind: "value", value: K },
  };
};

/** Nernst equation at 298 K. */
const nernst: Generator = (rng) => {
  const nu = rng.pick([1, 2, 2, 3]);
  const E0 = draw(rng, -1, 1.5, 0.01);
  let Q = drawK(rng, -4, 4);
  if (Math.abs(Math.log10(Q)) < 0.5) Q = shown(Q * 1000, 2);
  const T = 298;
  const c = (R * T) / FARADAY;
  const E = E0 - (c / nu) * Math.log(Q);
  const wrong: Option[] = [
    mistakeIn(E0 + (c / nu) * Math.log(Q), "V", "signError"),
    mistakeIn(E0 - (c / nu) * Math.log10(Q), "V", "logBase"),
    mistakeIn(E0, "V", "termDropped"),
  ];
  if (nu > 1) {
    wrong.push(mistakeIn(E0 - c * Math.log(Q), "V", "stoichiometryForgotten"));
    wrong.push(mistakeIn(E0 - c * nu * Math.log(Q), "V", "formulaInverted"));
  }
  return {
    prompt: { key: "nernst", tex: lines(`E_\\mathrm{cell}^{\\ominus} = ${sig(E0)}\\,\\mathrm{V},\\quad \\nu = ${nu}`, `Q = ${sig(Q, 2)},\\quad T = ${T}\\,\\mathrm{K}`, asked("E_\\mathrm{cell}", "V")) },
    correct: valueIn(E, "V"),
    wrong,
    explanation: {
      key: "nernst",
      tex: `E_\\mathrm{cell} = E_\\mathrm{cell}^{\\ominus} - \\frac{RT}{\\nu F}\\ln Q = ${sig(E0)} - \\frac{0.02568}{${nu}} \\times (${sig(Math.log(Q))}) = ${sig(E)}\\,\\mathrm{V}`,
    },
    verify: { kind: "value", value: E },
  };
};

/** Metal/metal-ion couples: standard potential at 298 K (V) and the charge of the ion. */
const COUPLES: { metal: string; z: number; E: number }[] = [
  { metal: "Ag", z: 1, E: 0.8 },
  { metal: "Cu", z: 2, E: 0.34 },
  { metal: "Pb", z: 2, E: -0.13 },
  { metal: "Ni", z: 2, E: -0.23 },
  { metal: "Cd", z: 2, E: -0.4 },
  { metal: "Fe", z: 2, E: -0.44 },
  { metal: "Zn", z: 2, E: -0.76 },
  { metal: "Al", z: 3, E: -1.66 },
  { metal: "Mg", z: 2, E: -2.36 },
];
const ion = (c: (typeof COUPLES)[number]): string => `\\mathrm{${c.metal}^{${c.z === 1 ? "" : c.z}+}}`;
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** E°cell = E°(R) − E°(L) for a cell L‖R of two metal electrodes. */
const cellPotential: Generator = (rng) => {
  const L = rng.pick(COUPLES);
  const Rc = rng.pick(COUPLES.filter((c) => c !== L && Math.abs(c.E - L.E) >= 0.1));
  const E = Number((Rc.E - L.E).toFixed(2));
  const m = (L.z * Rc.z) / gcd(L.z, Rc.z);
  const weighted = Number(((m / Rc.z) * Rc.E - (m / L.z) * L.E).toFixed(2));
  const wrong: Option[] = [
    mistakeIn(-E, "V", "signError"),
    mistakeIn(Number((Rc.E + L.E).toFixed(2)), "V", "signError"),
    mistakeIn(Rc.E, "V", "termDropped"),
  ];
  if (weighted !== E) wrong.push(mistakeIn(weighted, "V", "potentialTimesElectrons"));
  const potential = (c: (typeof COUPLES)[number]): string => `E^{\\ominus}(${ion(c)}/\\mathrm{${c.metal}}) = ${c.E > 0 ? "+" : ""}${c.E.toFixed(2)}\\,\\mathrm{V}`;
  return {
    prompt: {
      key: "cellPotential",
      tex: lines(`\\mathrm{${L.metal}(s)}|${ion(L)}\\mathrm{(aq)}\\|${ion(Rc)}\\mathrm{(aq)}|\\mathrm{${Rc.metal}(s)}`, `${potential(L)}`, `${potential(Rc)}`, asked("E_\\mathrm{cell}^{\\ominus}", "V")),
      id: `${L.metal}${Rc.metal}`,
    },
    correct: valueIn(E, "V"),
    wrong,
    explanation: {
      key: "cellPotential",
      tex: `E_\\mathrm{cell}^{\\ominus} = E^{\\ominus}(\\mathrm{R}) - E^{\\ominus}(\\mathrm{L}) = (${Rc.E.toFixed(2)}) - (${L.E.toFixed(2)}) = ${sig(E)}\\,\\mathrm{V}`,
    },
    verify: { kind: "value", value: E },
  };
};

/** A couple from two others sharing a species: ν_c E°(c) = ν_a E°(a) − ν_b E°(b). */
const COMBINED: { c: string; nc: number; a: string; na: number; Ea: number; b: string; nb: number; Eb: number }[] = [
  { c: "Fe^{3+}/Fe^{2+}", nc: 1, a: "Fe^{3+}/Fe", na: 3, Ea: -0.04, b: "Fe^{2+}/Fe", nb: 2, Eb: -0.44 },
  { c: "Cu^{2+}/Cu^{+}", nc: 1, a: "Cu^{2+}/Cu", na: 2, Ea: 0.34, b: "Cu^{+}/Cu", nb: 1, Eb: 0.52 },
  { c: "Au^{3+}/Au^{+}", nc: 2, a: "Au^{3+}/Au", na: 3, Ea: 1.4, b: "Au^{+}/Au", nb: 1, Eb: 1.69 },
  { c: "Cr^{3+}/Cr^{2+}", nc: 1, a: "Cr^{3+}/Cr", na: 3, Ea: -0.74, b: "Cr^{2+}/Cr", nb: 2, Eb: -0.91 },
  { c: "Tl^{3+}/Tl^{+}", nc: 2, a: "Tl^{3+}/Tl", na: 3, Ea: 0.72, b: "Tl^{+}/Tl", nb: 1, Eb: -0.34 },
  { c: "In^{3+}/In^{+}", nc: 2, a: "In^{3+}/In", na: 3, Ea: -0.34, b: "In^{+}/In", nb: 1, Eb: -0.14 },
];

const combinedPotential: Generator = (rng) => {
  const k = rng.pick(COMBINED);
  const E = (k.na * k.Ea - k.nb * k.Eb) / k.nc;
  const v = (x: number): string => `${x > 0 ? "+" : ""}${x.toFixed(2)}\\,\\mathrm{V}`;
  const wrong: Option[] = [
    mistakeIn(k.Ea - k.Eb, "V", "potentialsNotWeighted"),
    mistakeIn(-E, "V", "signError"),
    mistakeIn(k.Ea + k.Eb, "V", "potentialsNotWeighted"),
  ];
  if (k.nc !== 1) wrong.push(mistakeIn(k.na * k.Ea - k.nb * k.Eb, "V", "wrongFactor"));
  return {
    prompt: {
      key: "combinedPotential",
      tex: lines(`E^{\\ominus}(\\mathrm{${k.a}}) = ${v(k.Ea)}`, `E^{\\ominus}(\\mathrm{${k.b}}) = ${v(k.Eb)}`, asked(`E^{\\ominus}(\\mathrm{${k.c}})`, "V")),
      id: k.c,
    },
    correct: valueIn(E, "V"),
    wrong,
    explanation: {
      key: "combinedPotential",
      tex: `\\nu_\\mathrm{c}E^{\\ominus}(\\mathrm{c}) = \\nu_\\mathrm{a}E^{\\ominus}(\\mathrm{a}) - \\nu_\\mathrm{b}E^{\\ominus}(\\mathrm{b}):\\quad E^{\\ominus} = \\frac{${k.na} \\times (${k.Ea.toFixed(2)}) - ${k.nb} \\times (${k.Eb.toFixed(2)})}{${k.nc}} = ${sig(E)}\\,\\mathrm{V}`,
    },
    verify: { kind: "value", value: E },
  };
};

export const equilibrium = {
  chemistry: {
    constantFromGibbs,
    gibbsFromK,
    reactionGibbs,
    vantHoff,
    vantHoffEnthalpy,
    dissociationDegree,
    cellGibbs,
    cellEquilibrium,
    nernst,
    cellPotential,
    combinedPotential,
  },
};
