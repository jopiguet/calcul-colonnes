/**
 * Physical chemistry, Focus 1: the properties of gases (Atkins Topics 1A–1C).
 * Perfect gas law, mixtures, the kinetic model, real gases.
 */
import { lines } from "./tex";
import { R, R_ATM, R_BAR, K_B, KELVIN, asked, draw, given, mistakeIn, valueIn, sig } from "./units";
import type { Generator } from "./types";

/** Gases with their molar masses (g mol⁻¹). */
const GASES: { tex: string; M: number }[] = [
  { tex: "\\mathrm{He}", M: 4.003 },
  { tex: "\\mathrm{Ne}", M: 20.18 },
  { tex: "\\mathrm{Ar}", M: 39.95 },
  { tex: "\\mathrm{N_2}", M: 28.02 },
  { tex: "\\mathrm{O_2}", M: 32.0 },
  { tex: "\\mathrm{CO_2}", M: 44.01 },
  { tex: "\\mathrm{CH_4}", M: 16.04 },
  { tex: "\\mathrm{H_2}", M: 2.016 },
];

/** p = nRT/V, V in dm³, p in kPa. */
const perfectGasPressure: Generator = (rng) => {
  const n = draw(rng, 0.2, 5, 0.1);
  const T = draw(rng, 250, 450, 1);
  const V = draw(rng, 2, 50, 0.5);
  const kPa = (n * R * T) / V; // J dm⁻³ = kPa
  const celsius = T - KELVIN;
  return {
    prompt: { key: "gasPressure", tex: lines(given("n", n, "mol", 2), given("T", T, "K"), given("V", V, "dm^{3}"), asked("p", "kPa")) },
    correct: valueIn(kPa, "kPa"),
    wrong: [
      mistakeIn((n * R * celsius) / V, "kPa", "celsiusForKelvin"),
      mistakeIn(kPa / 1000, "kPa", "volumeUnits"),
      mistakeIn(kPa * 1000, "kPa", "volumeUnits"),
      mistakeIn((n * R_ATM * T) / V, "kPa", "gasConstantUnits"),
      mistakeIn((R * T) / (n * V), "kPa", "formulaInverted"),
    ],
    explanation: { key: "perfectGas", tex: `p = \\frac{nRT}{V} = \\frac{${sig(n, 2)} \\times 8.314 \\times ${T}}{${sig(V)} \\times 10^{-3}}\\,\\mathrm{Pa} = ${sig(kPa)}\\,\\mathrm{kPa}` },
    verify: { kind: "value", value: kPa },
  };
};

/** n = pV/RT. */
const perfectGasAmount: Generator = (rng) => {
  const p = draw(rng, 50, 500, 5);
  const V = draw(rng, 1, 25, 0.5);
  const T = draw(rng, 260, 400, 1);
  const n = (p * V) / (R * T);
  return {
    prompt: { key: "gasAmount", tex: lines(given("p", p, "kPa"), given("V", V, "dm^{3}"), given("T", T, "K"), asked("n", "mol")) },
    correct: valueIn(n, "mol"),
    wrong: [
      mistakeIn((p * V) / (R * (T - KELVIN)), "mol", "celsiusForKelvin"),
      mistakeIn((p * V) / (R * T) / 1000, "mol", "volumeUnits"),
      mistakeIn((p * V) / (R_ATM * T), "mol", "gasConstantUnits"),
      mistakeIn((R * T) / (p * V), "mol", "formulaInverted"),
    ],
    explanation: { key: "perfectGas", tex: `n = \\frac{pV}{RT} = \\frac{${p} \\times 10^{3} \\times ${sig(V)} \\times 10^{-3}}{8.314 \\times ${T}}\\,\\mathrm{mol} = ${sig(n)}\\,\\mathrm{mol}` },
    verify: { kind: "value", value: n },
  };
};

/** Dalton's law: pA = xA p. */
const partialPressure: Generator = (rng) => {
  const nA = draw(rng, 0.5, 4, 0.1);
  const nB = draw(rng, 0.5, 4, 0.1);
  const p = draw(rng, 80, 300, 5);
  const x = nA / (nA + nB);
  return {
    prompt: {
      key: "partialPressure",
      tex: lines(`n_\\mathrm{A} = ${sig(nA, 2)}\\,\\mathrm{mol},\\quad n_\\mathrm{B} = ${sig(nB, 2)}\\,\\mathrm{mol}`, given("p", p, "kPa"), asked("p_\\mathrm{A}", "kPa")),
    },
    correct: valueIn(x * p, "kPa"),
    wrong: [
      mistakeIn((nA / nB) * p, "kPa", "moleFractionError"),
      mistakeIn((1 - x) * p, "kPa", "complementTaken"),
      mistakeIn(p / 2, "kPa", "moleFractionError"),
      mistakeIn(p / x, "kPa", "formulaInverted"),
    ],
    explanation: { key: "dalton", tex: `x_\\mathrm{A} = \\frac{n_\\mathrm{A}}{n_\\mathrm{A} + n_\\mathrm{B}} = ${sig(x)}, \\quad p_\\mathrm{A} = x_\\mathrm{A}\\,p = ${sig(x * p)}\\,\\mathrm{kPa}` },
    verify: { kind: "value", value: x * p },
  };
};

/** v_rms = (3RT/M)^½, M in kg mol⁻¹. */
const rmsSpeed: Generator = (rng) => {
  const gas = rng.pick(GASES);
  const T = draw(rng, 200, 600, 5);
  const M = gas.M / 1000;
  const v = Math.sqrt((3 * R * T) / M);
  return {
    prompt: { key: "rmsSpeed", tex: lines(`${gas.tex},\\quad M = ${gas.M}\\,\\mathrm{g\\,mol^{-1}}`, given("T", T, "K"), asked("v_\\mathrm{rms}", "m\\,s^{-1}")) },
    correct: valueIn(v, "m\\,s^{-1}"),
    wrong: [
      mistakeIn(Math.sqrt((3 * R * T) / gas.M), "m\\,s^{-1}", "massUnits"),
      mistakeIn(Math.sqrt((8 * R * T) / (Math.PI * M)), "m\\,s^{-1}", "speedConfused"),
      mistakeIn(Math.sqrt((2 * R * T) / M), "m\\,s^{-1}", "speedConfused"),
      mistakeIn((3 * R * T) / M, "m\\,s^{-1}", "sqrtForgotten"),
      mistakeIn(Math.sqrt((3 * R * (T - KELVIN)) / M), "m\\,s^{-1}", "celsiusForKelvin"),
    ],
    explanation: { key: "rmsSpeed", tex: `v_\\mathrm{rms} = \\left(\\frac{3RT}{M}\\right)^{1/2} = \\left(\\frac{3 \\times 8.314 \\times ${T}}{${sig(M, 4)}}\\right)^{1/2}\\,\\mathrm{m\\,s^{-1}} = ${sig(v)}\\,\\mathrm{m\\,s^{-1}}` },
    verify: { kind: "value", value: v },
  };
};

/** Mean speeds of two gases at the same temperature: v₁/v₂ = (M₂/M₁)^½. */
const speedRatio: Generator = (rng) => {
  const [a, b] = rng.shuffle(GASES).slice(0, 2) as [(typeof GASES)[number], (typeof GASES)[number]];
  const ratio = Math.sqrt(b.M / a.M);
  return {
    prompt: {
      key: "speedRatio",
      tex: lines(`${a.tex}\\ (${a.M}\\,\\mathrm{g\\,mol^{-1}}), \\quad ${b.tex}\\ (${b.M}\\,\\mathrm{g\\,mol^{-1}})`, `\\frac{\\bar{c}(${a.tex})}{\\bar{c}(${b.tex})} = \;?`),
      id: `${a.tex}/${b.tex}`,
    },
    correct: valueIn(ratio, ""),
    wrong: [
      mistakeIn(1 / ratio, "", "ratioInverted"),
      mistakeIn(b.M / a.M, "", "sqrtForgotten"),
      mistakeIn(a.M / b.M, "", "ratioInverted"),
      mistakeIn(Math.sqrt(ratio), "", "exponentConfused"),
    ],
    explanation: { key: "speedRatio", tex: `\\bar{c} = \\left(\\frac{8RT}{\\pi M}\\right)^{1/2} \\Rightarrow \\frac{\\bar{c}_1}{\\bar{c}_2} = \\left(\\frac{M_2}{M_1}\\right)^{1/2} = \\left(\\frac{${b.M}}{${a.M}}\\right)^{1/2} = ${sig(ratio)}` },
    verify: { kind: "value", value: ratio },
  };
};

/** λ = kT/(σp): σ in nm², p in kPa, λ in nm. */
const meanFreePath: Generator = (rng) => {
  const sigma = draw(rng, 0.2, 0.6, 0.01); // nm²
  const p = draw(rng, 10, 200, 5); // kPa
  const T = draw(rng, 250, 500, 5);
  const lambda = (K_B * T) / (sigma * 1e-18 * p * 1e3) / 1e-9; // nm
  return {
    prompt: { key: "meanFreePath", tex: lines(given("\\sigma", sigma, "nm^{2}", 2), given("p", p, "kPa"), given("T", T, "K"), asked("\\lambda", "nm")) },
    correct: valueIn(lambda, "nm"),
    wrong: [
      mistakeIn((K_B * (T - KELVIN)) / (sigma * 1e-18 * p * 1e3) / 1e-9, "nm", "celsiusForKelvin"),
      mistakeIn(lambda * 1000, "nm", "pressureUnits"),
      mistakeIn((sigma * 1e-18 * p * 1e3) / (K_B * T) / 1e9, "nm", "formulaInverted"),
      mistakeIn((R * T) / (sigma * 1e-18 * p * 1e3) / 1e-9, "nm", "gasConstantUnits"),
    ],
    explanation: { key: "meanFreePath", tex: `\\lambda = \\frac{kT}{\\sigma p} = \\frac{1.381 \\times 10^{-23} \\times ${T}}{${sig(sigma, 2)} \\times 10^{-18} \\times ${p} \\times 10^{3}}\\,\\mathrm{m} = ${sig(lambda)}\\,\\mathrm{nm}` },
    verify: { kind: "value", value: lambda },
  };
};

/** Z = pV_m/RT. */
const compressionFactor: Generator = (rng) => {
  const T = draw(rng, 250, 400, 5);
  const p = draw(rng, 5, 60, 1); // bar
  const ideal = (R_BAR * T) / p; // dm³ mol⁻¹
  const Z = draw(rng, 0.7, 1.15, 0.01);
  const Vm = Number((Z * ideal).toPrecision(3));
  const z = (p * Vm) / (R_BAR * T);
  return {
    prompt: { key: "compressionFactor", tex: lines(given("p", p, "bar"), given("V_\\mathrm{m}", Vm, "dm^{3}\\,mol^{-1}"), given("T", T, "K"), asked("Z", "")) },
    correct: valueIn(z, ""),
    wrong: [
      mistakeIn(1 / z, "", "formulaInverted"),
      mistakeIn((p * Vm) / (R_BAR * (T - KELVIN)), "", "celsiusForKelvin"),
      mistakeIn((p * Vm) / (R * T), "", "gasConstantUnits"),
      mistakeIn(1, "", "perfectForReal"),
    ],
    explanation: { key: "compressionFactor", tex: `Z = \\frac{pV_\\mathrm{m}}{RT} = \\frac{${p} \\times ${sig(Vm)}}{0.08314 \\times ${T}} = ${sig(z)}` },
    verify: { kind: "value", value: z },
  };
};

/** Van der Waals gases (a in dm⁶ bar mol⁻², b in dm³ mol⁻¹). */
const VDW: { tex: string; a: number; b: number }[] = [
  { tex: "\\mathrm{CO_2}", a: 3.64, b: 0.0427 },
  { tex: "\\mathrm{N_2}", a: 1.37, b: 0.0387 },
  { tex: "\\mathrm{NH_3}", a: 4.23, b: 0.0371 },
  { tex: "\\mathrm{CH_4}", a: 2.28, b: 0.0428 },
  { tex: "\\mathrm{Ar}", a: 1.36, b: 0.0322 },
];

/** p = nRT/(V − nb) − a(n/V)². */
const vdwPressure: Generator = (rng) => {
  const gas = rng.pick(VDW);
  const n = draw(rng, 0.5, 3, 0.1);
  const V = draw(rng, 0.5, 5, 0.1);
  const T = draw(rng, 280, 500, 5);
  const p = (n * R_BAR * T) / (V - n * gas.b) - gas.a * (n / V) ** 2;
  return {
    prompt: {
      key: "vdwPressure",
      tex: lines(
        `${gas.tex}:\\ a = ${gas.a}\\,\\mathrm{dm^{6}\\,bar\\,mol^{-2}},\\ b = ${gas.b}\\,\\mathrm{dm^{3}\\,mol^{-1}}`,
        `${given("n", n, "mol", 2)},\\quad ${given("V", V, "dm^{3}", 2)},\\quad ${given("T", T, "K")}`,
        asked("p", "bar"),
      ),
    },
    correct: valueIn(p, "bar"),
    wrong: [
      mistakeIn((n * R_BAR * T) / V, "bar", "perfectForReal"),
      mistakeIn((n * R_BAR * T) / (V - n * gas.b) + gas.a * (n / V) ** 2, "bar", "attractionSign"),
      mistakeIn((n * R_BAR * T) / (V - n * gas.b) - gas.a * (n / V), "bar", "exponentConfused"),
      mistakeIn((n * R_BAR * T) / (V - gas.b) - gas.a * (1 / V) ** 2, "bar", "stoichiometryForgotten"),
    ],
    explanation: {
      key: "vanDerWaals",
      tex: `p = \\frac{nRT}{V - nb} - a\\frac{n^{2}}{V^{2}} = ${sig((n * R_BAR * T) / (V - n * gas.b))} - ${sig(gas.a * (n / V) ** 2)} = ${sig(p)}\\,\\mathrm{bar}`,
    },
    verify: { kind: "value", value: p },
  };
};

/** T_c = 8a/(27Rb). */
const criticalTemperature: Generator = (rng) => {
  const gas = rng.pick(VDW);
  const Tc = (8 * gas.a) / (27 * R_BAR * gas.b);
  return {
    prompt: {
      key: "criticalTemperature",
      tex: lines(`${gas.tex}:\\ a = ${gas.a}\\,\\mathrm{dm^{6}\\,bar\\,mol^{-2}},\\ b = ${gas.b}\\,\\mathrm{dm^{3}\\,mol^{-1}}`, asked("T_\\mathrm{c}", "K")),
      id: gas.tex,
    },
    correct: valueIn(Tc, "K"),
    wrong: [
      mistakeIn((27 * gas.a) / (8 * R_BAR * gas.b), "K", "ratioInverted"),
      mistakeIn((8 * gas.a) / (27 * gas.b), "K", "formulaInverted"),
      mistakeIn((8 * gas.a) / (27 * R * gas.b), "K", "gasConstantUnits"),
      mistakeIn(Tc - KELVIN, "K", "celsiusForKelvin"),
    ],
    explanation: { key: "criticalConstants", tex: `T_\\mathrm{c} = \\frac{8a}{27Rb} = \\frac{8 \\times ${gas.a}}{27 \\times 0.08314 \\times ${gas.b}}\\,\\mathrm{K} = ${sig(Tc)}\\,\\mathrm{K}` },
    verify: { kind: "value", value: Tc },
  };
};

export const gases = {
  chemistry: { perfectGasPressure, perfectGasAmount, partialPressure, rmsSpeed, speedRatio, meanFreePath, compressionFactor, vdwPressure, criticalTemperature },
};
