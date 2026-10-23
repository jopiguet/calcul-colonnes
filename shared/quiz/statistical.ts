/**
 * Physical chemistry, Focus 13: statistical thermodynamics (Atkins Topics
 * 13A–13F). Boltzmann populations, the translational, rotational, vibrational
 * and electronic partition functions, mean energies and heat capacities, the
 * Sackur–Tetrode entropy and residual entropies.
 *
 * Every given has its own row and every explanation one equality per row, so
 * that the questions and their corrections fit a phone.
 */
import { lines } from "./tex";
import { K_B, KELVIN, N_A, R, asked, draw, mistakeIn, sig, valueIn } from "./units";
import { LIGHT, PLANCK } from "./quantum";
import type { Generator, MistakeKey, Option } from "./types";

const cm1 = "cm^{-1}";
const JKmol = "J\\,K^{-1}\\,mol^{-1}";
/** hc/k in cm K: a wavenumber in cm⁻¹ times this, over T, is βhcν̃. */
const HC_K = (PLANCK * LIGHT * 100) / K_B;
const whole = (n: number, mistake?: MistakeKey): Option => ({ tex: String(n), num: n, ...(mistake ? { mistake } : {}) });
const choice = (o: Option): Option => ({ ...o, choiceOnly: true });
/** Drops the options a slip makes infinite, zero or negative. */
const shown = (options: Option[]): Option[] => options.filter((o) => Number.isFinite(o.num!) && o.num! > 0);
/** The same, also dropping the vanishing values a slip in an exponent gives. */
const readable = (options: Option[]): Option[] => shown(options).filter((o) => o.num! > 1e-3);

/** Gases with their molar masses, g mol⁻¹. */
const GASES: { tex: string; M: number }[] = [
  { tex: "H_2", M: 2.016 },
  { tex: "He", M: 4.003 },
  { tex: "CH_4", M: 16.04 },
  { tex: "Ne", M: 20.18 },
  { tex: "N_2", M: 28.01 },
  { tex: "O_2", M: 32.0 },
  { tex: "Ar", M: 39.95 },
  { tex: "CO_2", M: 44.01 },
  { tex: "Kr", M: 83.8 },
  { tex: "Xe", M: 131.29 },
];
const NOBLE = GASES.filter((g) => ["He", "Ne", "Ar", "Kr", "Xe"].includes(g.tex));

/** Thermal wavelength, m, for a molar mass in g mol⁻¹. */
const lambdaOf = (M: number, T: number): number => PLANCK / Math.sqrt(2 * Math.PI * ((M / 1000) / N_A) * K_B * T);

// --------------------------------------------------------------- 13A

/** Boltzmann population ratio of two levels with degeneracies. */
const boltzmannRatio: Generator = (rng) => {
  const g0 = rng.pick([1, 1, 2]);
  const g1 = rng.pick([2, 3, 4, 5]);
  const t = draw(rng, 20, 500, 5);
  const T = t + KELVIN;
  const target = draw(rng, 0.1, 3, 0.05); // βhcΔν̃, so that the ratio stays readable
  const nu = Math.max(10, Math.round((target * T) / HC_K / 10) * 10);
  const x = (HC_K * nu) / T;
  const ratio = (g1 / g0) * Math.exp(-x);
  return {
    prompt: {
      key: "boltzmannRatio",
      tex: lines(`\\Delta\\tilde{\\nu} = ${nu}\\,\\mathrm{${cm1}}`, `g_0 = ${g0}`, `g_1 = ${g1}`, `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, asked("N_1/N_0", "")),
    },
    correct: valueIn(ratio, ""),
    wrong: readable([
      mistakeIn(Math.exp(-x), "", "degeneracyIgnored"),
      mistakeIn((g1 / g0) * Math.exp((-HC_K * nu) / t), "", "celsiusForKelvin"),
      mistakeIn(1 / ratio, "", "ratioInverted"),
      mistakeIn((g1 / g0) * 10 ** -x, "", "lnForLog"),
    ]),
    explanation: {
      key: "boltzmannRatio",
      tex: lines(`T = ${sig(T, 4)}\\,\\mathrm{K}`, `x = \\frac{hc\\Delta\\tilde{\\nu}}{kT} = ${sig(x)}`, `\\frac{N_1}{N_0} = \\frac{g_1}{g_0}\\mathrm{e}^{-x}`, `= ${sig(ratio)}`),
    },
    verify: { kind: "value", value: ratio },
  };
};

/** Temperature at which a two-level system has a given population ratio. */
const populationTemperature: Generator = (rng) => {
  const nu = draw(rng, 100, 2000, 10);
  const r = rng.pick([0.5, 0.4, 0.3, 0.25, 0.2, 0.1, 0.05, 0.02, 0.01]);
  const T = (HC_K * nu) / Math.log(1 / r);
  return {
    prompt: { key: "populationTemperature", tex: lines(`\\Delta\\tilde{\\nu} = ${nu}\\,\\mathrm{${cm1}}`, `N_1/N_0 = ${sig(r, 2)}`, asked("T", "K")) },
    correct: valueIn(T, "K"),
    wrong: shown([
      mistakeIn((HC_K * nu) / Math.log10(1 / r), "K", "logBase"),
      mistakeIn(T - KELVIN, "K", "celsiusForKelvin"),
      mistakeIn(T * 2 * Math.PI, "K", "hbarForH"),
      mistakeIn(nu / (HC_K * Math.log(1 / r)), "K", "formulaInverted"),
    ]),
    explanation: {
      key: "populationTemperature",
      tex: lines(`\\frac{N_1}{N_0} = \\mathrm{e}^{-hc\\Delta\\tilde{\\nu}/kT}`, `T = \\frac{hc\\Delta\\tilde{\\nu}/k}{\\ln(N_0/N_1)}`, `= \\frac{${sig(HC_K * nu, 4)}\\,\\mathrm{K}}{${sig(Math.log(1 / r))}}`, `= ${sig(T)}\\,\\mathrm{K}`),
    },
    verify: { kind: "value", value: T },
  };
};

// --------------------------------------------------------------- 13B

/** Thermal wavelength of a gas, pm. */
const thermalWavelength: Generator = (rng) => {
  const g = rng.pick(GASES);
  const t = draw(rng, 20, 600, 5);
  const T = t + KELVIN;
  const L = lambdaOf(g.M, T) * 1e12;
  return {
    prompt: { key: "thermalWavelength", tex: lines(`\\mathrm{${g.tex}}`, `M = ${g.M}\\,\\mathrm{g\\,mol^{-1}}`, `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, asked("\\Lambda", "pm")) },
    correct: valueIn(L, "pm"),
    wrong: shown([
      mistakeIn(L / Math.sqrt(1000), "pm", "massUnits"),
      mistakeIn(L * Math.sqrt(T / t), "pm", "celsiusForKelvin"),
      mistakeIn(L / (2 * Math.PI), "pm", "hbarForH"),
      mistakeIn(L * Math.sqrt(2 * Math.PI), "pm", "wrongFactor"),
    ]),
    explanation: {
      key: "thermalWavelength",
      tex: lines(`m = M/N_\\mathrm{A}`, `= ${sig((g.M / 1000) / N_A)}\\,\\mathrm{kg}`, `T = ${sig(T, 4)}\\,\\mathrm{K}`, `\\Lambda = \\frac{h}{(2\\pi mkT)^{1/2}}`, `= ${sig(L)}\\,\\mathrm{pm}`),
    },
    verify: { kind: "value", value: L },
  };
};

/** Translational partition function q = V/Λ³ of a gas in a vessel. */
const translationalPartition: Generator = (rng) => {
  const g = rng.pick(GASES);
  const V = rng.pick([1, 10, 50, 100, 250, 500, 1000]); // cm³
  const T = draw(rng, 200, 1000, 10);
  const L = lambdaOf(g.M, T);
  const q = (V * 1e-6) / L ** 3;
  return {
    prompt: { key: "translationalPartition", tex: lines(`\\mathrm{${g.tex}}`, `M = ${g.M}\\,\\mathrm{g\\,mol^{-1}}`, `V = ${V}\\,\\mathrm{cm^{3}}`, `T = ${T}\\,\\mathrm{K}`, asked("q^\\mathrm{T}", "")) },
    correct: choice(valueIn(q, "")),
    wrong: [
      choice(mistakeIn(q * 1e6, "", "volumeUnits")),
      choice(mistakeIn(q * 1e-3, "", "volumeUnits")),
      choice(mistakeIn(q * 1000 ** 1.5, "", "massUnits")),
      choice(mistakeIn(q * (2 * Math.PI) ** 3, "", "hbarForH")),
    ],
    explanation: {
      key: "translationalPartition",
      tex: lines(`\\Lambda = \\frac{h}{(2\\pi mkT)^{1/2}}`, `= ${sig(L * 1e12)}\\,\\mathrm{pm}`, `q^\\mathrm{T} = \\frac{V}{\\Lambda^{3}}`, `= \\frac{${sig(V * 1e-6)}\\,\\mathrm{m^{3}}}{(${sig(L)}\\,\\mathrm{m})^{3}}`, `= ${sig(q)}`),
    },
    verify: { kind: "value", value: q },
  };
};

/** Linear molecules: rotational constant (cm⁻¹) and symmetry number. */
const LINEAR: { tex: string; B: number; sigma: 1 | 2 }[] = [
  { tex: "^{1}H^{35}Cl", B: 10.591, sigma: 1 },
  { tex: "^{1}H^{81}Br", B: 8.465, sigma: 1 },
  { tex: "^{12}C^{16}O", B: 1.931, sigma: 1 },
  { tex: "^{14}N^{16}O", B: 1.705, sigma: 1 },
  { tex: "HCN", B: 1.478, sigma: 1 },
  { tex: "^{14}N_2", B: 1.998, sigma: 2 },
  { tex: "^{16}O_2", B: 1.446, sigma: 2 },
  { tex: "^{35}Cl_2", B: 0.2441, sigma: 2 },
  { tex: "^{127}I_2", B: 0.0374, sigma: 2 },
  { tex: "CO_2", B: 0.3902, sigma: 2 },
];

/** High-temperature rotational partition function kT/σhcB̃. */
const rotationalPartition: Generator = (rng) => {
  const m = rng.pick(LINEAR);
  const t = draw(rng, 20, 500, 5);
  const T = t + KELVIN;
  const q = T / (m.sigma * HC_K * m.B);
  return {
    prompt: { key: "rotationalPartition", tex: lines(`\\mathrm{${m.tex}}`, `\\tilde{B} = ${m.B}\\,\\mathrm{${cm1}}`, `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, asked("q^\\mathrm{R}", "")) },
    correct: valueIn(q, ""),
    wrong: shown([
      m.sigma === 2 ? mistakeIn(2 * q, "", "symmetryIgnored") : mistakeIn(q / 2, "", "wrongFactor"),
      mistakeIn((q * t) / T, "", "celsiusForKelvin"),
      mistakeIn(q / 100, "", "lengthUnits"),
      mistakeIn(1 / q, "", "formulaInverted"),
    ]),
    explanation: {
      key: "rotationalPartition",
      tex: lines(`\\sigma = ${m.sigma}`, `kT/hc = ${sig(T / HC_K, 4)}\\,\\mathrm{${cm1}}`, `q^\\mathrm{R} = \\frac{kT}{\\sigma hc\\tilde{B}}`, `= ${sig(q)}`),
    },
    verify: { kind: "value", value: q },
  };
};

/** Symmetry numbers, with the rotations that make them and tempting wrong counts. */
const SYMMETRIC: { tex: string; sigma: number; how: string; wrong: number[] }[] = [
  { tex: "H_2O", sigma: 2, how: "1 + 1", wrong: [1, 3, 4] },
  { tex: "NH_3", sigma: 3, how: "1 + 2", wrong: [1, 6, 4] },
  { tex: "CH_4", sigma: 12, how: "4 \\times 3", wrong: [4, 24, 6] },
  { tex: "C_6H_6", sigma: 12, how: "6 \\times 2", wrong: [6, 24, 2] },
  { tex: "CO_2", sigma: 2, how: "1 + 1", wrong: [1, 4, 3] },
  { tex: "HCl", sigma: 1, how: "1", wrong: [2, 3, 4] },
  { tex: "N_2", sigma: 2, how: "1 + 1", wrong: [1, 4, 3] },
  { tex: "BF_3", sigma: 6, how: "3 \\times 2", wrong: [3, 2, 12] },
  { tex: "C_2H_4", sigma: 4, how: "1 + 3", wrong: [2, 8, 6] },
  { tex: "SF_6", sigma: 24, how: "6 \\times 4", wrong: [6, 12, 48] },
  { tex: "CH_3Cl", sigma: 3, how: "1 + 2", wrong: [1, 6, 4] },
  { tex: "CH_2Cl_2", sigma: 2, how: "1 + 1", wrong: [1, 4, 3] },
];

/** Number of indistinguishable orientations of a molecule. */
const symmetryNumber: Generator = (rng) => {
  const m = rng.pick(SYMMETRIC);
  return {
    prompt: { key: "symmetryNumber", tex: lines(`\\mathrm{${m.tex}}`, asked("\\sigma", "")) },
    correct: whole(m.sigma),
    wrong: m.wrong.map((n) => whole(n, n === 1 ? "symmetryIgnored" : "rotationsMiscounted")),
    explanation: { key: "symmetryNumber", tex: lines(`\\sigma = ${m.how}`, `= ${m.sigma}`) },
    verify: { kind: "value", value: m.sigma },
  };
};

/** A wavenumber and a temperature with βhcν̃ between 0.3 and 4. */
function vibration(rng: Parameters<Generator>[0]): { nu: number; T: number; x: number } {
  const nu = draw(rng, 100, 3000, 10);
  const target = draw(rng, 0.3, 4, 0.05);
  const T = Math.max(50, Math.round((HC_K * nu) / target / 10) * 10);
  return { nu, T, x: (HC_K * nu) / T };
}

/** Vibrational partition function of a harmonic oscillator. */
const vibrationalPartition: Generator = (rng) => {
  const { nu, T, x } = vibration(rng);
  const q = 1 / (1 - Math.exp(-x));
  return {
    prompt: { key: "vibrationalPartition", tex: lines(`\\tilde{\\nu} = ${nu}\\,\\mathrm{${cm1}}`, `T = ${T}\\,\\mathrm{K}`, asked("q^\\mathrm{V}", "")) },
    correct: valueIn(q, "", 4),
    wrong: shown([
      mistakeIn(1 / x, "", "classicalLimit", 4),
      mistakeIn(1 / (1 + Math.exp(-x)), "", "signError", 4),
      mistakeIn(Math.exp(-x / 2) / (1 - Math.exp(-x)), "", "zeroPointConfused", 4),
      mistakeIn(1 / (1 - 10 ** -x), "", "lnForLog", 4),
    ]),
    explanation: {
      key: "vibrationalPartition",
      tex: lines(`x = \\frac{hc\\tilde{\\nu}}{kT} = ${sig(x)}`, `q^\\mathrm{V} = \\frac{1}{1 - \\mathrm{e}^{-x}}`, `= ${sig(q, 4)}`),
    },
    verify: { kind: "value", value: q },
  };
};

/** Electronic partition function of two degenerate levels. */
const electronicPartition: Generator = (rng) => {
  const g0 = rng.pick([1, 2, 2, 4]);
  const g1 = rng.pick([2, 3, 4]);
  const nu = draw(rng, 50, 1500, 10);
  const T = draw(rng, 100, 2000, 50);
  const x = (HC_K * nu) / T;
  const q = g0 + g1 * Math.exp(-x);
  return {
    prompt: {
      key: "electronicPartition",
      tex: lines(`g_0 = ${g0}`, `g_1 = ${g1}`, `\\tilde{\\nu}_1 = ${nu}\\,\\mathrm{${cm1}}`, `T = ${T}\\,\\mathrm{K}`, asked("q^\\mathrm{E}", "")),
    },
    correct: valueIn(q, ""),
    wrong: shown([
      mistakeIn(1 + Math.exp(-x), "", "degeneracyIgnored"),
      mistakeIn(g0, "", "termDropped"),
      mistakeIn(g0 + g1 * 10 ** -x, "", "lnForLog"),
      mistakeIn(g0 + g1 * Math.exp(-x / (2 * Math.PI)), "", "hbarForH"),
    ]),
    explanation: {
      key: "electronicPartition",
      tex: lines(`x = \\frac{hc\\tilde{\\nu}_1}{kT} = ${sig(x)}`, `q^\\mathrm{E} = g_0 + g_1\\mathrm{e}^{-x}`, `= ${g0} + ${g1} \\times ${sig(Math.exp(-x))}`, `= ${sig(q)}`),
    },
    verify: { kind: "value", value: q },
  };
};

// --------------------------------------------------------------- 13C, 13E

/** Mean vibrational energy above the zero-point level, as a wavenumber. */
const meanVibrationalEnergy: Generator = (rng) => {
  const { nu, T, x } = vibration(rng);
  const e = nu / (Math.exp(x) - 1);
  return {
    prompt: { key: "meanVibrationalEnergy", tex: lines(`\\tilde{\\nu} = ${nu}\\,\\mathrm{${cm1}}`, `T = ${T}\\,\\mathrm{K}`, asked("\\langle\\varepsilon^\\mathrm{V}\\rangle/hc", cm1)) },
    correct: valueIn(e, cm1),
    wrong: shown([
      mistakeIn(T / HC_K, cm1, "classicalLimit"),
      mistakeIn(e + nu / 2, cm1, "zeroPointConfused"),
      mistakeIn(nu / (Math.exp(x) + 1), cm1, "signError"),
      mistakeIn(nu * Math.exp(-x), cm1, "termDropped"),
    ]),
    explanation: {
      key: "meanVibrationalEnergy",
      tex: lines(`x = \\frac{hc\\tilde{\\nu}}{kT} = ${sig(x)}`, `\\frac{\\langle\\varepsilon^\\mathrm{V}\\rangle}{hc} = \\frac{\\tilde{\\nu}}{\\mathrm{e}^{x} - 1}`, `= ${sig(e)}\\,\\mathrm{${cm1}}`),
    },
    verify: { kind: "value", value: e },
  };
};

/** Mean energy of a two-level system, as a wavenumber. */
const twoLevelEnergy: Generator = (rng) => {
  const nu = draw(rng, 50, 1500, 10);
  const T = draw(rng, 100, 1500, 50);
  const x = (HC_K * nu) / T;
  const e = nu / (Math.exp(x) + 1);
  return {
    prompt: { key: "twoLevelEnergy", tex: lines(`\\varepsilon/hc = ${nu}\\,\\mathrm{${cm1}}`, `T = ${T}\\,\\mathrm{K}`, asked("\\langle\\varepsilon\\rangle/hc", cm1)) },
    correct: valueIn(e, cm1),
    wrong: shown([
      mistakeIn(nu / (Math.exp(x) - 1), cm1, "signError"),
      mistakeIn(nu * Math.exp(-x), cm1, "termDropped"),
      mistakeIn(nu / 2, cm1, "classicalLimit"),
      mistakeIn(nu - e, cm1, "ratioInverted"),
    ]),
    explanation: {
      key: "twoLevelEnergy",
      tex: lines(`x = \\frac{\\varepsilon}{kT} = ${sig(x)}`, `\\frac{\\langle\\varepsilon\\rangle}{hc} = \\frac{\\varepsilon/hc}{\\mathrm{e}^{x} + 1}`, `= ${sig(e)}\\,\\mathrm{${cm1}}`),
    },
    verify: { kind: "value", value: e },
  };
};

/** Vibrational contribution to the molar heat capacity (Einstein function). */
const vibrationalHeatCapacity: Generator = (rng) => {
  const thetaV = draw(rng, 300, 4000, 10);
  const target = draw(rng, 0.3, 4, 0.05);
  const T = Math.max(50, Math.round(thetaV / target / 10) * 10);
  const x = thetaV / T;
  const f = (x * x * Math.exp(x)) / (Math.exp(x) - 1) ** 2;
  const C = R * f;
  return {
    prompt: { key: "vibrationalHeatCapacity", tex: lines(`\\theta^\\mathrm{V} = ${thetaV}\\,\\mathrm{K}`, `T = ${T}\\,\\mathrm{K}`, asked("C_{V,\\mathrm{m}}^\\mathrm{V}", JKmol)) },
    correct: valueIn(C, JKmol),
    wrong: shown([
      mistakeIn(R, JKmol, "classicalLimit"),
      mistakeIn((R * x * x) / (Math.exp(x) - 1) ** 2, JKmol, "termDropped"),
      mistakeIn((R * x * Math.exp(x)) / (Math.exp(x) - 1) ** 2, JKmol, "wrongFactor"),
      mistakeIn(R * x * x * Math.exp(-x), JKmol, "termDropped"),
    ]),
    explanation: {
      key: "vibrationalHeatCapacity",
      tex: lines(`x = \\theta^\\mathrm{V}/T = ${sig(x)}`, `\\frac{C_{V,\\mathrm{m}}^\\mathrm{V}}{R} = \\frac{x^{2}\\mathrm{e}^{x}}{(\\mathrm{e}^{x} - 1)^{2}}`, `= ${sig(f)}`, `C_{V,\\mathrm{m}}^\\mathrm{V} = ${sig(C)}\\,\\mathrm{${JKmol}}`),
    },
    verify: { kind: "value", value: C },
  };
};

/** Standard molar entropy of a monatomic perfect gas (Sackur–Tetrode), at 1 bar. */
const sackurTetrode: Generator = (rng) => {
  const g = rng.pick(NOBLE);
  const T = draw(rng, 200, 1000, 10);
  const L = lambdaOf(g.M, T);
  const p = 1e5;
  const y = (K_B * T) / (p * L ** 3);
  const S = R * (Math.log(y) + 2.5);
  return {
    prompt: { key: "sackurTetrode", tex: lines(`\\mathrm{${g.tex}}`, `M = ${g.M}\\,\\mathrm{g\\,mol^{-1}}`, `T = ${T}\\,\\mathrm{K}`, `p = 1\\,\\mathrm{bar}`, asked("S_\\mathrm{m}^{\\ominus}", JKmol)) },
    correct: valueIn(S, JKmol),
    wrong: shown([
      mistakeIn(S + 1.5 * R * Math.log(1000), JKmol, "massUnits"),
      mistakeIn(S - R, JKmol, "termDropped"),
      mistakeIn(S + R * Math.log(1e5), JKmol, "pressureUnits"),
      mistakeIn(R * (Math.log10(y) + 2.5 / Math.LN10), JKmol, "logBase"),
    ]),
    explanation: {
      key: "sackurTetrode",
      tex: lines(`\\Lambda = ${sig(L * 1e12)}\\,\\mathrm{pm}`, `\\frac{kT}{p\\Lambda^{3}} = ${sig(y)}`, `S_\\mathrm{m}^{\\ominus} = R\\ln\\frac{kT\\mathrm{e}^{5/2}}{p\\Lambda^{3}}`, `= ${sig(Math.log(y) + 2.5)}\\,R`, `= ${sig(S)}\\,\\mathrm{${JKmol}}`),
    },
    verify: { kind: "value", value: S },
  };
};

/** Solids with their orientations per molecule at T = 0. */
const DISORDERED: { tex: string; W: number; Wtex: string }[] = [
  { tex: "CO", W: 2, Wtex: "2" },
  { tex: "N_2O", W: 2, Wtex: "2" },
  { tex: "CH_3D", W: 4, Wtex: "4" },
  { tex: "FClO_3", W: 4, Wtex: "4" },
  { tex: "CH_2D_2", W: 6, Wtex: "6" },
  { tex: "H_2O(s)", W: 1.5, Wtex: "\\tfrac{3}{2}" },
];

/** Residual molar entropy S_m(0) = R ln W. */
const residualEntropy: Generator = (rng) => {
  const d = rng.pick(DISORDERED);
  const S = R * Math.log(d.W);
  return {
    prompt: { key: "residualEntropy", tex: lines(`\\mathrm{${d.tex}}`, `W = ${d.Wtex}`, asked("S_\\mathrm{m}(0)", JKmol)) },
    correct: valueIn(S, JKmol),
    wrong: shown([
      mistakeIn(R * Math.log10(d.W), JKmol, "logBase"),
      mistakeIn(R * d.W, JKmol, "logRules"),
      choice(mistakeIn(K_B * Math.log(d.W), JKmol, "wrongFactor")),
    ]),
    explanation: {
      key: "residualEntropy",
      tex: lines(`S = k\\ln W^{N}`, `S_\\mathrm{m}(0) = R\\ln ${d.Wtex}`, `= ${sig(S)}\\,\\mathrm{${JKmol}}`),
    },
    verify: { kind: "value", value: S },
  };
};

export const statistical = {
  chemistry: {
    boltzmannRatio,
    populationTemperature,
    thermalWavelength,
    translationalPartition,
    rotationalPartition,
    symmetryNumber,
    vibrationalPartition,
    electronicPartition,
    meanVibrationalEnergy,
    twoLevelEnergy,
    vibrationalHeatCapacity,
    sackurTetrode,
    residualEntropy,
  },
};
