/**
 * Physical chemistry, Focus 3: the Second and Third Laws (Atkins Topics 3A–3E).
 * Entropy changes, heat engines, the Third Law, Gibbs energy.
 */
import { lines } from "./tex";
import { R, KELVIN, asked, draw, given, mistakeIn, valueIn, sig } from "./units";
import type { Generator } from "./types";

const JK = "J\\,K^{-1}";
const JKmol = "J\\,K^{-1}\\,mol^{-1}";
const kJmol = "kJ\\,mol^{-1}";

/** Isothermal expansion of a perfect gas: ΔS = nR ln(V_f/V_i). */
const entropyExpansion: Generator = (rng) => {
  const n = draw(rng, 0.5, 5, 0.1);
  const Vi = draw(rng, 1, 10, 0.5);
  const factor = rng.pick([2, 3, 4, 5, 10, 0.5, 0.2]);
  const Vf = Number((Vi * factor).toPrecision(3));
  const S = n * R * Math.log(Vf / Vi);
  return {
    prompt: { key: "entropyExpansion", tex: lines(given("n", n, "mol", 2), `V: ${sig(Vi)}\\,\\mathrm{dm^{3}} \\to ${sig(Vf)}\\,\\mathrm{dm^{3}}\\ (T\\ \\text{constant})`, asked("\\Delta S", JK)) },
    correct: valueIn(S, JK),
    wrong: [
      mistakeIn(-S, JK, "ratioInverted"),
      mistakeIn(n * R * Math.log10(Vf / Vi), JK, "logBase"),
      mistakeIn(n * Math.log(Vf / Vi), JK, "termDropped"),
      mistakeIn(R * Math.log(Vf / Vi), JK, "stoichiometryForgotten"),
      mistakeIn(n * R * (Vf / Vi - 1), JK, "linearForLog"),
    ],
    explanation: { key: "entropyExpansion", tex: `\\Delta S = nR\\ln\\frac{V_\\mathrm{f}}{V_\\mathrm{i}} = ${sig(n, 2)} \\times 8.314 \\times \\ln ${sig(Vf / Vi)} = ${sig(S)}\\,\\mathrm{${JK}}` },
    verify: { kind: "value", value: S },
  };
};

/** Heating at constant pressure: ΔS = n C_p,m ln(T_f/T_i). Temperatures given in °C. */
const entropyHeating: Generator = (rng) => {
  const n = draw(rng, 0.5, 5, 0.1);
  const Cp = rng.pick([75.3, 29.1, 37.1, 112.3, 24.4]);
  const ti = draw(rng, 0, 40, 5);
  const tf = ti + draw(rng, 20, 80, 5);
  const Ti = ti + KELVIN;
  const Tf = tf + KELVIN;
  const S = n * Cp * Math.log(Tf / Ti);
  return {
    prompt: {
      key: "entropyHeating",
      tex: lines(`${given("n", n, "mol", 2)},\\quad C_{p,\\mathrm{m}} = ${Cp}\\,\\mathrm{${JKmol}}`, `\\theta: ${ti}\\,\\mathrm{{}^{\\circ}C} \\to ${tf}\\,\\mathrm{{}^{\\circ}C}`, asked("\\Delta S", JK)),
    },
    correct: valueIn(S, JK),
    wrong: [
      mistakeIn(ti === 0 ? n * Cp * Math.log(tf / 5) : n * Cp * Math.log(tf / ti), JK, "celsiusForKelvin"),
      mistakeIn(n * Cp * ((Tf - Ti) / Ti), JK, "linearForLog"),
      mistakeIn(n * (Cp - R) * Math.log(Tf / Ti), JK, "cpCvConfused"),
      mistakeIn(n * Cp * Math.log10(Tf / Ti), JK, "logBase"),
      mistakeIn(Cp * Math.log(Tf / Ti), JK, "stoichiometryForgotten"),
    ],
    explanation: { key: "entropyHeating", tex: `\\Delta S = nC_{p,\\mathrm{m}}\\ln\\frac{T_\\mathrm{f}}{T_\\mathrm{i}} = ${sig(n, 2)} \\times ${Cp} \\times \\ln\\frac{${sig(Tf, 5)}}{${sig(Ti, 5)}} = ${sig(S)}\\,\\mathrm{${JK}}` },
    verify: { kind: "value", value: S },
  };
};

/** Substances with their normal boiling point (K) and enthalpy of vaporization (kJ mol⁻¹). */
const LIQUIDS: { tex: string; Tb: number; H: number }[] = [
  { tex: "\\mathrm{H_2O}", Tb: 373.2, H: 40.7 },
  { tex: "\\mathrm{C_6H_6}", Tb: 353.2, H: 30.8 },
  { tex: "\\mathrm{C_2H_5OH}", Tb: 351.5, H: 38.6 },
  { tex: "\\mathrm{CH_3OH}", Tb: 337.7, H: 35.3 },
  { tex: "\\mathrm{CCl_4}", Tb: 350.0, H: 30.0 },
  { tex: "\\mathrm{NH_3}", Tb: 239.7, H: 23.4 },
  { tex: "\\mathrm{(C_2H_5)_2O}", Tb: 307.6, H: 26.0 },
];

/** ΔtrsS = ΔtrsH / Ttrs. */
const transitionEntropy: Generator = (rng) => {
  const l = rng.pick(LIQUIDS);
  const S = (l.H * 1000) / l.Tb;
  return {
    prompt: { key: "transitionEntropy", tex: lines(`${l.tex}:\\ \\Delta_\\mathrm{vap}H = ${l.H}\\,\\mathrm{${kJmol}},\\quad T_\\mathrm{b} = ${l.Tb}\\,\\mathrm{K}`, asked("\\Delta_\\mathrm{vap}S", JKmol)), id: l.tex },
    correct: valueIn(S, JKmol),
    wrong: [
      mistakeIn(l.H / l.Tb, JKmol, "energyUnits"),
      mistakeIn((l.H * 1000) / (l.Tb - KELVIN), JKmol, "celsiusForKelvin"),
      mistakeIn(-S, JKmol, "signError"),
      mistakeIn(l.H * l.Tb, JKmol, "formulaInverted"),
    ],
    explanation: { key: "transitionEntropy", tex: `\\Delta_\\mathrm{vap}S = \\frac{\\Delta_\\mathrm{vap}H}{T_\\mathrm{b}} = \\frac{${l.H} \\times 10^{3}}{${l.Tb}} = ${sig(S)}\\,\\mathrm{${JKmol}}` },
    verify: { kind: "value", value: S },
  };
};

/** Trouton's rule: ΔvapH ≈ 85 J K⁻¹ mol⁻¹ × Tb. Boiling point given in °C. */
const trouton: Generator = (rng) => {
  const t = draw(rng, 30, 200, 1);
  const H = (85 * (t + KELVIN)) / 1000;
  return {
    prompt: { key: "trouton", tex: lines(`\\theta_\\mathrm{b} = ${t}\\,\\mathrm{{}^{\\circ}C}`, asked("\\Delta_\\mathrm{vap}H", kJmol)) },
    correct: valueIn(H, kJmol),
    wrong: [
      mistakeIn((85 * t) / 1000, kJmol, "celsiusForKelvin"),
      mistakeIn(85 * (t + KELVIN), kJmol, "energyUnits"),
      mistakeIn(85 / (t + KELVIN), kJmol, "formulaInverted"),
      mistakeIn((85 * (t + KELVIN)) / 1000 / R, kJmol, "gasConstantUnits"),
    ],
    explanation: { key: "trouton", tex: `\\Delta_\\mathrm{vap}H \\approx 85\\,\\mathrm{${JKmol}} \\times T_\\mathrm{b} = 85 \\times ${sig(t + KELVIN, 5)}\\,\\mathrm{J\\,mol^{-1}} = ${sig(H)}\\,\\mathrm{${kJmol}}` },
    verify: { kind: "value", value: H },
  };
};

/** Carnot efficiency, temperatures in °C: η = 1 − T_c/T_h. */
const carnot: Generator = (rng) => {
  const th = draw(rng, 150, 600, 10);
  const tc = draw(rng, 5, 60, 5);
  const eta = 1 - (tc + KELVIN) / (th + KELVIN);
  return {
    prompt: { key: "carnot", tex: lines(`\\theta_\\mathrm{h} = ${th}\\,\\mathrm{{}^{\\circ}C},\\quad \\theta_\\mathrm{c} = ${tc}\\,\\mathrm{{}^{\\circ}C}`, asked("\\eta", "")) },
    correct: valueIn(eta, ""),
    wrong: [
      mistakeIn(1 - tc / th, "", "celsiusForKelvin"),
      mistakeIn((tc + KELVIN) / (th + KELVIN), "", "complementTaken"),
      mistakeIn((th + KELVIN) / (tc + KELVIN) - 1, "", "ratioInverted"),
      mistakeIn((th - tc) / (tc + KELVIN), "", "formulaInverted"),
    ],
    explanation: { key: "carnot", tex: `\\eta = 1 - \\frac{T_\\mathrm{c}}{T_\\mathrm{h}} = 1 - \\frac{${sig(tc + KELVIN, 5)}}{${sig(th + KELVIN, 5)}} = ${sig(eta)}` },
    verify: { kind: "value", value: eta },
  };
};

/** Standard molar entropies at 298 K, J K⁻¹ mol⁻¹ (common data). Elements are not zero. */
const ENTROPY: Record<string, number> = {
  "H_2(g)": 130.68, "O_2(g)": 205.14, "N_2(g)": 191.61, "H_2O(l)": 69.91, "H_2O(g)": 188.83, "CO_2(g)": 213.74,
  "CH_4(g)": 186.26, "NH_3(g)": 192.45, "CO(g)": 197.67, "C(s)": 5.74, "NO(g)": 210.76, "NO_2(g)": 240.06,
  "CaCO_3(s)": 92.9, "CaO(s)": 39.75, "C_2H_4(g)": 219.56, "C_2H_6(g)": 229.6,
};
type Side = [number, string][];
const ENTROPY_REACTIONS: { reactants: Side; products: Side }[] = [
  { reactants: [[2, "H_2(g)"], [1, "O_2(g)"]], products: [[2, "H_2O(l)"]] },
  { reactants: [[1, "N_2(g)"], [3, "H_2(g)"]], products: [[2, "NH_3(g)"]] },
  { reactants: [[1, "CaCO_3(s)"]], products: [[1, "CaO(s)"], [1, "CO_2(g)"]] },
  { reactants: [[1, "CH_4(g)"], [2, "O_2(g)"]], products: [[1, "CO_2(g)"], [2, "H_2O(l)"]] },
  { reactants: [[2, "CO(g)"], [1, "O_2(g)"]], products: [[2, "CO_2(g)"]] },
  { reactants: [[1, "C_2H_4(g)"], [1, "H_2(g)"]], products: [[1, "C_2H_6(g)"]] },
  { reactants: [[2, "NO(g)"], [1, "O_2(g)"]], products: [[2, "NO_2(g)"]] },
  { reactants: [[1, "C(s)"], [1, "O_2(g)"]], products: [[1, "CO_2(g)"]] },
];
const ELEMENTS = new Set(["H_2(g)", "O_2(g)", "N_2(g)", "C(s)"]);
const sideTex = (side: Side): string => side.map(([nu, s]) => `${nu === 1 ? "" : `${nu}\\,`}\\mathrm{${s}}`).join(" + ");
const sum = (side: Side, keep: (s: string) => boolean = () => true, coefficients = true): number =>
  side.reduce((t, [nu, s]) => t + (keep(s) ? (coefficients ? nu : 1) * ENTROPY[s]! : 0), 0);

const reactionEntropy: Generator = (rng) => {
  const r = rng.pick(ENTROPY_REACTIONS);
  const S = sum(r.products) - sum(r.reactants);
  const notElement = (s: string): boolean => !ELEMENTS.has(s);
  const species = [...r.reactants, ...r.products].map(([, s]) => s);
  return {
    prompt: {
      key: "reactionEntropy",
      tex: lines(`${sideTex(r.reactants)} \\to ${sideTex(r.products)}`, species.map((s) => `S_\\mathrm{m}^{\\ominus}(\\mathrm{${s}}) = ${ENTROPY[s]}`).join(",\\ ") + `\\ \\mathrm{${JKmol}}`, asked("\\Delta_\\mathrm{r}S^{\\ominus}", JKmol)),
      id: sideTex(r.reactants),
    },
    correct: valueIn(S, JKmol, 4),
    wrong: [
      mistakeIn(-S, JKmol, "productsReactantsSwapped", 4),
      mistakeIn(sum(r.products, notElement) - sum(r.reactants, notElement), JKmol, "elementsZero", 4),
      mistakeIn(sum(r.products, undefined, false) - sum(r.reactants, undefined, false), JKmol, "stoichiometryForgotten", 4),
      mistakeIn(sum(r.products) + sum(r.reactants), JKmol, "signError", 4),
    ],
    explanation: { key: "reactionEntropy", tex: `\\Delta_\\mathrm{r}S^{\\ominus} = \\sum_\\text{products}\\nu S_\\mathrm{m}^{\\ominus} - \\sum_\\text{reactants}\\nu S_\\mathrm{m}^{\\ominus} = ${sig(sum(r.products), 4)} - ${sig(sum(r.reactants), 4)} = ${sig(S, 4)}\\,\\mathrm{${JKmol}}` },
    verify: { kind: "value", value: S },
  };
};

/** ΔG = ΔH − TΔS, ΔH in kJ mol⁻¹, ΔS in J K⁻¹ mol⁻¹. */
const gibbsEnergy: Generator = (rng) => {
  const H = draw(rng, -300, 200, 0.1);
  const S = draw(rng, -250, 250, 0.1);
  const T = draw(rng, 250, 1200, 10);
  const G = H - (T * S) / 1000;
  return {
    prompt: { key: "gibbsEnergy", tex: lines(`\\Delta H = ${sig(H, 4)}\\,\\mathrm{${kJmol}},\\quad \\Delta S = ${sig(S, 4)}\\,\\mathrm{${JKmol}}`, given("T", T, "K"), asked("\\Delta G", kJmol)) },
    correct: valueIn(G, kJmol, 4),
    wrong: [
      mistakeIn(H - T * S, kJmol, "energyUnits", 4),
      mistakeIn(H + (T * S) / 1000, kJmol, "signError", 4),
      mistakeIn(H - ((T - KELVIN) * S) / 1000, kJmol, "celsiusForKelvin", 4),
      mistakeIn(H - S / T, kJmol, "formulaInverted", 4),
    ],
    explanation: { key: "gibbsEnergy", tex: `\\Delta G = \\Delta H - T\\Delta S = ${sig(H, 4)} - ${T} \\times (${sig(S, 4)} \\times 10^{-3}) = ${sig(G, 4)}\\,\\mathrm{${kJmol}}` },
    verify: { kind: "value", value: G },
  };
};

/** Temperature at which ΔG changes sign: T = ΔH/ΔS (same signs). */
const crossoverTemperature: Generator = (rng) => {
  const sign = rng.pick([1, -1]);
  const H = sign * draw(rng, 20, 250, 0.1);
  const S = sign * draw(rng, 40, 300, 0.1);
  const T = (H * 1000) / S;
  return {
    prompt: { key: "crossoverTemperature", tex: lines(`\\Delta H = ${sig(H, 4)}\\,\\mathrm{${kJmol}},\\quad \\Delta S = ${sig(S, 4)}\\,\\mathrm{${JKmol}}`, asked("T", "K")) },
    correct: valueIn(T, "K"),
    wrong: [
      mistakeIn(H / S, "K", "energyUnits"),
      mistakeIn(S / (H * 1000), "K", "formulaInverted"),
      mistakeIn(T - KELVIN, "K", "celsiusForKelvin"),
      mistakeIn((H * 1000) / S / R, "K", "gasConstantUnits"),
    ],
    explanation: { key: "crossoverTemperature", tex: `\\Delta G = \\Delta H - T\\Delta S = 0 \\Rightarrow T = \\frac{\\Delta H}{\\Delta S} = \\frac{${sig(H, 4)} \\times 10^{3}}{${sig(S, 4)}} = ${sig(T)}\\,\\mathrm{K}` },
    verify: { kind: "value", value: T },
  };
};

/** Perfect gas: ΔG_m = RT ln(p_f/p_i). */
const gibbsPressure: Generator = (rng) => {
  const T = draw(rng, 270, 500, 5);
  const pi = draw(rng, 0.5, 5, 0.5);
  const factor = rng.pick([2, 3, 5, 10, 0.5, 0.1, 20]);
  const pf = Number((pi * factor).toPrecision(3));
  const G = (R * T * Math.log(pf / pi)) / 1000;
  return {
    prompt: { key: "gibbsPressure", tex: lines(given("T", T, "K"), `p: ${sig(pi)}\\,\\mathrm{bar} \\to ${sig(pf)}\\,\\mathrm{bar}`, asked("\\Delta G_\\mathrm{m}", kJmol)) },
    correct: valueIn(G, kJmol),
    wrong: [
      mistakeIn(-G, kJmol, "ratioInverted"),
      mistakeIn((R * T * Math.log10(pf / pi)) / 1000, kJmol, "logBase"),
      mistakeIn(R * T * Math.log(pf / pi), kJmol, "energyUnits"),
      mistakeIn((R * (T - KELVIN) * Math.log(pf / pi)) / 1000, kJmol, "celsiusForKelvin"),
    ],
    explanation: { key: "gibbsPressure", tex: `\\Delta G_\\mathrm{m} = RT\\ln\\frac{p_\\mathrm{f}}{p_\\mathrm{i}} = 8.314 \\times ${T} \\times \\ln ${sig(pf / pi)}\\,\\mathrm{J\\,mol^{-1}} = ${sig(G)}\\,\\mathrm{${kJmol}}` },
    verify: { kind: "value", value: G },
  };
};

/** Debye T³ law at low temperature: S_m(T) = C_p,m(T)/3. */
const debyeEntropy: Generator = (rng) => {
  const T = draw(rng, 2, 15, 1);
  const a = draw(rng, 0.5, 9, 0.1) * 1e-4; // C = aT³, J K⁻⁴ mol⁻¹
  const C = a * T ** 3;
  const S = C / 3;
  return {
    prompt: { key: "debyeEntropy", tex: lines(given("T", T, "K"), `C_{p,\\mathrm{m}}(T) = ${sig(C)}\\,\\mathrm{${JKmol}}`, asked("S_\\mathrm{m}(T)", JKmol)) },
    correct: valueIn(S, JKmol),
    wrong: [
      mistakeIn(C, JKmol, "wrongFactor"),
      mistakeIn(C / T, JKmol, "formulaInverted"),
      mistakeIn(3 * C, JKmol, "formulaInverted"),
      mistakeIn(C * Math.log(T), JKmol, "linearForLog"),
    ],
    explanation: { key: "debyeEntropy", tex: `C_{p,\\mathrm{m}} = aT^{3} \\Rightarrow S_\\mathrm{m}(T) = \\int_0^T \\frac{aT'^{3}}{T'}\\,\\mathrm{d}T' = \\tfrac{1}{3}aT^{3} = \\tfrac{1}{3}C_{p,\\mathrm{m}}(T) = ${sig(S)}\\,\\mathrm{${JKmol}}` },
    verify: { kind: "value", value: S },
  };
};

export const secondLaw = {
  chemistry: { entropyExpansion, entropyHeating, transitionEntropy, trouton, carnot, reactionEntropy, gibbsEnergy, crossoverTemperature, gibbsPressure, debyeEntropy },
};
