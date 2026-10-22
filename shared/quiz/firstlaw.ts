/**
 * Physical chemistry, Focus 2: the First Law (Atkins Topics 2A–2E).
 * Work, internal energy, enthalpy, thermochemistry, adiabatic changes.
 */
import { lines } from "./tex";
import { R, KELVIN, asked, draw, given, mistakeIn, valueIn, sig } from "./units";
import type { Generator, Option } from "./types";

/** w = −p_ex ΔV, p in kPa, ΔV in dm³: w in J. */
const expansionWork: Generator = (rng) => {
  const p = draw(rng, 50, 300, 5);
  const dV = draw(rng, 0.5, 20, 0.5);
  const w = -p * dV; // kPa dm³ = J
  return {
    prompt: { key: "expansionWork", tex: lines(given("p_\\mathrm{ex}", p, "kPa"), given("\\Delta V", dV, "dm^{3}"), asked("w", "J")) },
    correct: valueIn(w, "J"),
    wrong: [
      mistakeIn(-w, "J", "signError"),
      mistakeIn(w * 1000, "J", "volumeUnits"),
      mistakeIn(w / 1000, "J", "volumeUnits"),
      mistakeIn(-w * 1000, "J", "signError"),
    ],
    explanation: { key: "expansionWork", tex: `w = -p_\\mathrm{ex}\\Delta V = -${p} \\times 10^{3}\\,\\mathrm{Pa} \\times ${sig(dV)} \\times 10^{-3}\\,\\mathrm{m^{3}} = ${sig(w)}\\,\\mathrm{J}` },
    verify: { kind: "value", value: w },
  };
};

/** w = −nRT ln(V_f/V_i), in kJ. */
const reversibleWork: Generator = (rng) => {
  const n = draw(rng, 0.5, 4, 0.1);
  const T = draw(rng, 270, 400, 1);
  const Vi = draw(rng, 1, 10, 0.5);
  const factor = rng.pick([1.5, 2, 2.5, 3, 4, 5, 0.5, 0.25]);
  const Vf = Number((Vi * factor).toPrecision(3));
  const w = (-n * R * T * Math.log(Vf / Vi)) / 1000;
  return {
    prompt: {
      key: "reversibleWork",
      tex: lines(`${given("n", n, "mol", 2)},\\quad ${given("T", T, "K")}`, `V_\\mathrm{i} = ${sig(Vi)}\\,\\mathrm{dm^{3}} \\to V_\\mathrm{f} = ${sig(Vf)}\\,\\mathrm{dm^{3}}`, asked("w", "kJ")),
    },
    correct: valueIn(w, "kJ"),
    wrong: [
      mistakeIn(-w, "kJ", "signError"),
      mistakeIn((-n * R * T * Math.log10(Vf / Vi)) / 1000, "kJ", "logBase"),
      mistakeIn(-n * R * T * Math.log(Vf / Vi), "kJ", "energyUnits"),
      mistakeIn((-n * R * T * (Vf / Vi - 1)) / 1000, "kJ", "linearForLog"),
      mistakeIn((-n * R * (T - KELVIN) * Math.log(Vf / Vi)) / 1000, "kJ", "celsiusForKelvin"),
    ],
    explanation: { key: "reversibleWork", tex: `w = -nRT\\ln\\frac{V_\\mathrm{f}}{V_\\mathrm{i}} = -${sig(n, 2)} \\times 8.314 \\times ${T} \\times \\ln ${sig(Vf / Vi)}\\,\\mathrm{J} = ${sig(w)}\\,\\mathrm{kJ}` },
    verify: { kind: "value", value: w },
  };
};

/** Perfect gas heated at constant volume: ΔU = n C_V,m ΔT, with C_V,m = C_p,m − R. */
const internalEnergyChange: Generator = (rng) => {
  const n = draw(rng, 0.5, 5, 0.1);
  const Cp = rng.pick([29.1, 29.4, 37.1, 35.3, 20.8]);
  const Ti = draw(rng, 280, 350, 1);
  const dT = draw(rng, 10, 150, 5);
  const Cv = Cp - R;
  const dU = (n * Cv * dT) / 1000;
  return {
    prompt: {
      key: "internalEnergyChange",
      tex: lines(`${given("n", n, "mol", 2)},\\quad C_{p,\\mathrm{m}} = ${Cp}\\,\\mathrm{J\\,K^{-1}\\,mol^{-1}}`, `T: ${Ti}\\,\\mathrm{K} \\to ${Ti + dT}\\,\\mathrm{K}`, asked("\\Delta U", "kJ")),
    },
    correct: valueIn(dU, "kJ"),
    wrong: [
      mistakeIn((n * Cp * dT) / 1000, "kJ", "cpCvConfused"),
      mistakeIn(n * Cv * dT, "kJ", "energyUnits"),
      mistakeIn((Cv * dT) / 1000, "kJ", "stoichiometryForgotten"),
      mistakeIn((n * (Cp + R) * dT) / 1000, "kJ", "signError"),
    ],
    explanation: { key: "internalEnergy", tex: `C_{V,\\mathrm{m}} = C_{p,\\mathrm{m}} - R = ${sig(Cv)}\\,\\mathrm{J\\,K^{-1}\\,mol^{-1}}, \\quad \\Delta U = nC_{V,\\mathrm{m}}\\Delta T = ${sig(dU)}\\,\\mathrm{kJ}` },
    verify: { kind: "value", value: dU },
  };
};

/** Reactions with the change in the amount of gas they bring. */
const GAS_REACTIONS: { tex: string; dn: number }[] = [
  { tex: "\\mathrm{CH_4(g) + 2\\,O_2(g) \\to CO_2(g) + 2\\,H_2O(l)}", dn: -2 },
  { tex: "\\mathrm{C_6H_{12}O_6(s) + 6\\,O_2(g) \\to 6\\,CO_2(g) + 6\\,H_2O(l)}", dn: 0 },
  { tex: "\\mathrm{2\\,H_2(g) + O_2(g) \\to 2\\,H_2O(l)}", dn: -3 },
  { tex: "\\mathrm{N_2(g) + 3\\,H_2(g) \\to 2\\,NH_3(g)}", dn: -2 },
  { tex: "\\mathrm{CaCO_3(s) \\to CaO(s) + CO_2(g)}", dn: 1 },
  { tex: "\\mathrm{C_2H_5OH(l) + 3\\,O_2(g) \\to 2\\,CO_2(g) + 3\\,H_2O(l)}", dn: -1 },
  { tex: "\\mathrm{2\\,NH_3(g) \\to N_2(g) + 3\\,H_2(g)}", dn: 2 },
];

/** ΔH = ΔU + Δn_g RT. */
const enthalpyFromEnergy: Generator = (rng) => {
  const reaction = rng.pick(GAS_REACTIONS.filter((r) => r.dn !== 0));
  const dU = draw(rng, -900, 200, 0.1);
  const T = 298;
  const dH = dU + (reaction.dn * R * T) / 1000;
  const unitK = "kJ\\,mol^{-1}";
  return {
    prompt: { key: "enthalpyFromEnergy", tex: lines(reaction.tex, `\\Delta_\\mathrm{r} U = ${sig(dU, 4)}\\,\\mathrm{${unitK}}, \\quad T = 298\\,\\mathrm{K}`, asked("\\Delta_\\mathrm{r} H", unitK)), id: reaction.tex },
    correct: valueIn(dH, unitK, 4),
    wrong: [
      mistakeIn(dU - (reaction.dn * R * T) / 1000, unitK, "signError", 4),
      mistakeIn(dU + reaction.dn * R * T, unitK, "energyUnits", 4),
      mistakeIn(dU, unitK, "termDropped", 4),
      mistakeIn(dU + ((reaction.dn + rng.pick([1, -1])) * R * T) / 1000, unitK, "stoichiometryForgotten", 4),
    ],
    explanation: { key: "enthalpyEnergy", tex: `\\Delta_\\mathrm{r} H = \\Delta_\\mathrm{r} U + \\Delta\\nu_\\mathrm{gas}RT = ${sig(dU, 4)} + (${reaction.dn}) \\times 8.314 \\times 10^{-3} \\times 298 = ${sig(dH, 4)}\\,\\mathrm{${unitK}}` },
    verify: { kind: "value", value: dH },
  };
};

/** Hess's law: a target reaction from two others, with their coefficients. */
const HESS: { target: string; one: string; two: string; a: number; b: number }[] = [
  // C + ½O₂ → CO from C + O₂ → CO₂ and CO + ½O₂ → CO₂
  { target: "\\mathrm{C(s) + \\tfrac{1}{2}O_2(g) \\to CO(g)}", one: "\\mathrm{C(s) + O_2(g) \\to CO_2(g)}", two: "\\mathrm{CO(g) + \\tfrac{1}{2}O_2(g) \\to CO_2(g)}", a: 1, b: -1 },
  // 2 NO₂ ← N₂ + 2 O₂ from N₂ + O₂ → 2 NO and 2 NO + O₂ → 2 NO₂
  { target: "\\mathrm{N_2(g) + 2\\,O_2(g) \\to 2\\,NO_2(g)}", one: "\\mathrm{N_2(g) + O_2(g) \\to 2\\,NO(g)}", two: "\\mathrm{2\\,NO(g) + O_2(g) \\to 2\\,NO_2(g)}", a: 1, b: 1 },
  // S → SO₃ via SO₂: S + O₂ → SO₂, 2 SO₂ + O₂ → 2 SO₃
  { target: "\\mathrm{S(s) + \\tfrac{3}{2}O_2(g) \\to SO_3(g)}", one: "\\mathrm{S(s) + O_2(g) \\to SO_2(g)}", two: "\\mathrm{2\\,SO_2(g) + O_2(g) \\to 2\\,SO_3(g)}", a: 1, b: 0.5 },
  // 2 C + O₂ → 2 CO: twice (1), less (2)
  { target: "\\mathrm{2\\,C(s) + O_2(g) \\to 2\\,CO(g)}", one: "\\mathrm{C(s) + O_2(g) \\to CO_2(g)}", two: "\\mathrm{2\\,CO(g) + O_2(g) \\to 2\\,CO_2(g)}", a: 2, b: -1 },
];

const hessLaw: Generator = (rng) => {
  const h = rng.pick(HESS);
  const H1 = draw(rng, -600, -50, 0.1);
  const H2 = draw(rng, -600, -50, 0.1);
  const H = h.a * H1 + h.b * H2;
  const u = "kJ\\,mol^{-1}";
  const coefficient = (c: number): string => (c === 1 ? "" : c === -1 ? "-" : c === 0.5 ? "\\tfrac{1}{2}" : String(c));
  return {
    prompt: {
      key: "hessLaw",
      tex: lines(`(1)\\ ${h.one}\\quad \\Delta H_1 = ${sig(H1, 4)}\\,\\mathrm{${u}}`, `(2)\\ ${h.two}\\quad \\Delta H_2 = ${sig(H2, 4)}\\,\\mathrm{${u}}`, `${h.target}:\\ ${asked("\\Delta H", u)}`),
      id: h.target,
    },
    correct: valueIn(H, u, 4),
    wrong: [
      mistakeIn(h.a * H1 - h.b * H2, u, "signError", 4),
      mistakeIn(H1 + Math.sign(h.b) * H2, u, "stoichiometryForgotten", 4),
      mistakeIn(-H, u, "signError", 4),
      mistakeIn(h.b * H1 + h.a * H2, u, "orderSwapped", 4),
      mistakeIn(-h.a * H1 + h.b * H2, u, "signError", 4),
      mistakeIn(h.a * H1 + 2 * h.b * H2, u, "stoichiometryForgotten", 4),
    ],
    explanation: { key: "hessLaw", tex: `\\Delta H = ${coefficient(h.a)}\\Delta H_1 ${h.b < 0 ? "-" : "+"} ${coefficient(Math.abs(h.b))}\\Delta H_2 = ${sig(H, 4)}\\,\\mathrm{${u}}` },
    verify: { kind: "value", value: H },
  };
};

/** Standard enthalpies of formation at 298 K, kJ mol⁻¹ (common data). */
const FORMATION: Record<string, number> = {
  "CH_4(g)": -74.81, "CO_2(g)": -393.51, "H_2O(l)": -285.83, "H_2O(g)": -241.82, "C_2H_6(g)": -84.68,
  "C_2H_4(g)": 52.26, "NH_3(g)": -46.11, "NO(g)": 90.25, "NO_2(g)": 33.18, "CO(g)": -110.53,
  "C_2H_5OH(l)": -277.69, "CH_3OH(l)": -238.66, "C_3H_8(g)": -103.85, "SO_2(g)": -296.83, "H_2S(g)": -20.63,
};

type Side = [number, string][];
const FORMATION_REACTIONS: { reactants: Side; products: Side }[] = [
  { reactants: [[1, "CH_4(g)"], [2, "O_2(g)"]], products: [[1, "CO_2(g)"], [2, "H_2O(l)"]] },
  { reactants: [[1, "C_2H_6(g)"], [3.5, "O_2(g)"]], products: [[2, "CO_2(g)"], [3, "H_2O(l)"]] },
  { reactants: [[1, "C_2H_4(g)"], [1, "H_2(g)"]], products: [[1, "C_2H_6(g)"]] },
  { reactants: [[4, "NH_3(g)"], [5, "O_2(g)"]], products: [[4, "NO(g)"], [6, "H_2O(g)"]] },
  { reactants: [[1, "C_2H_5OH(l)"], [3, "O_2(g)"]], products: [[2, "CO_2(g)"], [3, "H_2O(l)"]] },
  { reactants: [[1, "C_3H_8(g)"], [5, "O_2(g)"]], products: [[3, "CO_2(g)"], [4, "H_2O(l)"]] },
  { reactants: [[2, "H_2S(g)"], [3, "O_2(g)"]], products: [[2, "SO_2(g)"], [2, "H_2O(l)"]] },
  { reactants: [[2, "NO(g)"], [1, "O_2(g)"]], products: [[2, "NO_2(g)"]] },
  { reactants: [[1, "CO(g)"], [1, "H_2O(g)"]], products: [[1, "CO_2(g)"], [1, "H_2(g)"]] },
];

const sideTex = (side: Side): string =>
  side.map(([nu, s]) => `${nu === 1 ? "" : nu === 3.5 ? "\\tfrac{7}{2}\\," : `${nu}\\,`}\\mathrm{${s}}`).join(" + ");
const formation = (s: string): number => FORMATION[s] ?? 0; // elements in their reference state: 0
const total = (side: Side, withCoefficients = true): number => side.reduce((t, [nu, s]) => t + (withCoefficients ? nu : 1) * formation(s), 0);

const reactionEnthalpy: Generator = (rng) => {
  const r = rng.pick(FORMATION_REACTIONS);
  const H = total(r.products) - total(r.reactants);
  const u = "kJ\\,mol^{-1}";
  const species = [...r.reactants, ...r.products].map(([, s]) => s).filter((s) => FORMATION[s] !== undefined);
  return {
    prompt: {
      key: "reactionEnthalpy",
      tex: lines(`${sideTex(r.reactants)} \\to ${sideTex(r.products)}`, species.map((s) => `\\Delta_\\mathrm{f}H^{\\ominus}(\\mathrm{${s}}) = ${FORMATION[s]}`).join(",\\ ") + `\\ \\mathrm{${u}}`, asked("\\Delta_\\mathrm{r}H^{\\ominus}", u)),
      id: sideTex(r.reactants),
    },
    correct: valueIn(H, u, 4),
    wrong: [
      mistakeIn(-H, u, "productsReactantsSwapped", 4),
      mistakeIn(total(r.products, false) - total(r.reactants, false), u, "stoichiometryForgotten", 4),
      mistakeIn(total(r.products), u, "termDropped", 4),
      mistakeIn(total(r.products) + total(r.reactants), u, "signError", 4),
    ],
    explanation: { key: "formationEnthalpies", tex: `\\Delta_\\mathrm{r}H^{\\ominus} = \\sum_\\text{products}\\nu\\Delta_\\mathrm{f}H^{\\ominus} - \\sum_\\text{reactants}\\nu\\Delta_\\mathrm{f}H^{\\ominus} = ${sig(total(r.products), 4)} - (${sig(total(r.reactants), 4)}) = ${sig(H, 4)}\\,\\mathrm{${u}}` },
    verify: { kind: "value", value: H },
  };
};

/** Kirchhoff's law: ΔH(T₂) = ΔH(T₁) + ΔCp (T₂ − T₁). */
const kirchhoff: Generator = (rng) => {
  const H1 = draw(rng, -400, 200, 0.1);
  const dCp = draw(rng, -60, 60, 0.5) || 12.5;
  const T2 = draw(rng, 350, 1000, 10);
  const H2 = H1 + (dCp * (T2 - 298)) / 1000;
  const u = "kJ\\,mol^{-1}";
  return {
    prompt: {
      key: "kirchhoff",
      tex: lines(`\\Delta_\\mathrm{r}H^{\\ominus}(298\\,\\mathrm{K}) = ${sig(H1, 4)}\\,\\mathrm{${u}}`, `\\Delta_\\mathrm{r}C_p^{\\ominus} = ${dCp}\\,\\mathrm{J\\,K^{-1}\\,mol^{-1}}`, asked(`\\Delta_\\mathrm{r}H^{\\ominus}(${T2}\\,\\mathrm{K})`, u)),
    },
    correct: valueIn(H2, u, 4),
    wrong: [
      mistakeIn(H1 + dCp * (T2 - 298), u, "energyUnits", 4),
      mistakeIn(H1 - (dCp * (T2 - 298)) / 1000, u, "signError", 4),
      mistakeIn(H1 + (dCp * T2) / 1000, u, "termDropped", 4),
      mistakeIn(H1 + (dCp * Math.log(T2 / 298)) / 1000, u, "linearForLog", 4),
    ],
    explanation: { key: "kirchhoff", tex: `\\Delta_\\mathrm{r}H^{\\ominus}(T_2) = \\Delta_\\mathrm{r}H^{\\ominus}(T_1) + \\Delta_\\mathrm{r}C_p^{\\ominus}(T_2 - T_1) = ${sig(H1, 4)} + ${dCp} \\times 10^{-3} \\times ${T2 - 298} = ${sig(H2, 4)}\\,\\mathrm{${u}}` },
    verify: { kind: "value", value: H2 },
  };
};

/** Monatomic (c = 3/2) or diatomic (c = 5/2) perfect gas. */
const KINDS = [
  { name: "\\mathrm{Ar}", c: 1.5 },
  { name: "\\mathrm{N_2}", c: 2.5 },
];

/** Reversible adiabatic expansion: T_f = T_i (V_i/V_f)^{1/c}. */
const adiabaticTemperature: Generator = (rng) => {
  const gas = rng.pick(KINDS);
  const Ti = draw(rng, 280, 500, 5);
  const factor = rng.pick([1.5, 2, 3, 4, 0.5]);
  const Vi = draw(rng, 1, 5, 0.5);
  const Vf = Number((Vi * factor).toPrecision(3));
  const Tf = Ti * (Vi / Vf) ** (1 / gas.c);
  const gamma = (gas.c + 1) / gas.c;
  const options: Option[] = [
    mistakeIn(Ti * (Vi / Vf) ** gamma, "K", "exponentConfused"),
    mistakeIn(Ti, "K", "isothermalForAdiabatic"),
    mistakeIn(Ti * (Vf / Vi) ** (1 / gas.c), "K", "ratioInverted"),
    mistakeIn(Ti * (Vi / Vf) ** (1 / gamma), "K", "exponentConfused"),
    mistakeIn(Ti * (Vi / Vf), "K", "exponentConfused"),
  ];
  return {
    prompt: {
      key: "adiabaticTemperature",
      tex: lines(`${gas.name}\\ (C_{V,\\mathrm{m}} = ${gas.c === 1.5 ? "\\tfrac{3}{2}" : "\\tfrac{5}{2}"}R),\\quad ${given("T_\\mathrm{i}", Ti, "K")}`, `V: ${sig(Vi)}\\,\\mathrm{dm^{3}} \\to ${sig(Vf)}\\,\\mathrm{dm^{3}}`, asked("T_\\mathrm{f}", "K")),
    },
    correct: valueIn(Tf, "K"),
    wrong: options,
    explanation: { key: "adiabaticTemperature", tex: `T_\\mathrm{f} = T_\\mathrm{i}\\left(\\frac{V_\\mathrm{i}}{V_\\mathrm{f}}\\right)^{1/c},\\ c = \\frac{C_{V,\\mathrm{m}}}{R} = ${gas.c}: \\quad T_\\mathrm{f} = ${Ti} \\times \\left(\\frac{${sig(Vi)}}{${sig(Vf)}}\\right)^{1/${gas.c}} = ${sig(Tf)}\\,\\mathrm{K}` },
    verify: { kind: "value", value: Tf },
  };
};

/** Reversible adiabatic change: p V^γ constant. */
const adiabaticPressure: Generator = (rng) => {
  const gas = rng.pick(KINDS);
  const gamma = (gas.c + 1) / gas.c;
  const pi = draw(rng, 50, 500, 10);
  const factor = rng.pick([1.5, 2, 3, 0.5, 0.25]);
  const Vi = draw(rng, 1, 5, 0.5);
  const Vf = Number((Vi * factor).toPrecision(3));
  const pf = pi * (Vi / Vf) ** gamma;
  return {
    prompt: {
      key: "adiabaticPressure",
      tex: lines(`${gas.name}\\ (\\gamma = ${gas.c === 1.5 ? "\\tfrac{5}{3}" : "\\tfrac{7}{5}"}),\\quad ${given("p_\\mathrm{i}", pi, "kPa")}`, `V: ${sig(Vi)}\\,\\mathrm{dm^{3}} \\to ${sig(Vf)}\\,\\mathrm{dm^{3}}`, asked("p_\\mathrm{f}", "kPa")),
    },
    correct: valueIn(pf, "kPa"),
    wrong: [
      mistakeIn(pi * (Vi / Vf), "kPa", "isothermalForAdiabatic"),
      mistakeIn(pi * (Vi / Vf) ** (1 / gamma), "kPa", "exponentConfused"),
      mistakeIn(pi * (Vf / Vi) ** gamma, "kPa", "ratioInverted"),
      mistakeIn(pi * (Vi / Vf) ** (gamma - 1), "kPa", "exponentConfused"),
    ],
    explanation: { key: "adiabaticPressure", tex: `p_\\mathrm{f} = p_\\mathrm{i}\\left(\\frac{V_\\mathrm{i}}{V_\\mathrm{f}}\\right)^{\\gamma} = ${pi} \\times \\left(\\frac{${sig(Vi)}}{${sig(Vf)}}\\right)^{${sig(gamma, 3)}} = ${sig(pf)}\\,\\mathrm{kPa}` },
    verify: { kind: "value", value: pf },
  };
};

export const firstLaw = {
  chemistry: { expansionWork, reversibleWork, internalEnergyChange, enthalpyFromEnergy, hessLaw, reactionEnthalpy, kirchhoff, adiabaticTemperature, adiabaticPressure },
};
