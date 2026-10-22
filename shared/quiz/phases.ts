/**
 * Physical chemistry, Focus 4: physical transformations of pure substances
 * (Atkins Topics 4A–4B). The phase rule, the Clapeyron and Clausius–Clapeyron
 * equations, the chemical potential of a condensed phase.
 */
import { lines } from "./tex";
import { R, R_BAR, KELVIN, asked, draw, mistakeIn, valueIn, sig } from "./units";
import type { Generator, MistakeKey, Option } from "./types";

const kJmol = "kJ\\,mol^{-1}";
const Jmol = "J\\,mol^{-1}";

/** Rounded as shown: a value computed from data, written to `digits` figures. */
const shown = (x: number, digits = 3): number => Number(x.toPrecision(digits));

/** A whole number as an option: 2, not 2.00. */
const whole = (n: number, mistake?: MistakeKey): Option => ({ tex: String(n), num: n, ...(mistake ? { mistake } : {}) });

/** F = C − P + 2. */
const phaseRule: Generator = (rng) => {
  const C = rng.int(1, 3);
  const P = rng.int(1, C + 2);
  const F = C - P + 2;
  return {
    prompt: { key: "phaseRule", tex: lines(`C = ${C},\\quad P = ${P}`, asked("F", "")) },
    correct: whole(F),
    wrong: [
      whole(C - P, "termDropped"),
      whole(P - C + 2, "formulaInverted"),
      whole(C + P - 2, "signError"),
      whole(C - P + 1, "wrongFactor"),
      whole(C + P, "signError"),
    ],
    explanation: { key: "phaseRule", tex: `F = C - P + 2 = ${C} - ${P} + 2 = ${F}` },
    verify: { kind: "value", value: F },
  };
};

/** Slope of a solid–liquid boundary: dp/dT = ΔfusH / (T ΔfusV), in bar K⁻¹. Melting point in °C. */
const clapeyronSlope: Generator = (rng) => {
  const H = draw(rng, 2, 30, 0.1); // kJ mol⁻¹
  const t = draw(rng, -100, 300, 1); // °C
  const dV = draw(rng, 0.5, 9.5, 0.1) * rng.pick([1, 1, 1, -1]); // cm³ mol⁻¹
  const T = t + KELVIN;
  const slope = (H * 1000) / (T * dV * 1e-6) / 1e5; // bar K⁻¹
  const u = "bar\\,K^{-1}";
  return {
    prompt: {
      key: "clapeyronSlope",
      tex: lines(`\\Delta_\\mathrm{fus}H = ${sig(H)}\\,\\mathrm{${kJmol}}`, `\\theta_\\mathrm{f} = ${t}\\,\\mathrm{{}^{\\circ}C}`, `\\Delta_\\mathrm{fus}V = ${sig(dV, 2)}\\,\\mathrm{cm^{3}\\,mol^{-1}}`, asked("\\mathrm{d}p/\\mathrm{d}T", u)),
    },
    correct: valueIn(slope, u),
    wrong: [
      mistakeIn(slope / 1000, u, "energyUnits"),
      mistakeIn(slope * 1e5, u, "pressureUnits"),
      ...(t !== 0 ? [mistakeIn((H * 1000) / (t * dV * 1e-6) / 1e5, u, "celsiusForKelvin")] : []),
      mistakeIn(-slope, u, "signError"),
      mistakeIn(slope * 1e-6, u, "volumeUnits"),
    ],
    explanation: {
      key: "clapeyron",
      tex: `\\frac{\\mathrm{d}p}{\\mathrm{d}T} = \\frac{\\Delta_\\mathrm{fus}H}{T\\Delta_\\mathrm{fus}V} = \\frac{${sig(H)} \\times 10^{3}}{${sig(T, 5)} \\times (${sig(dV, 2)} \\times 10^{-6})}\\,\\mathrm{Pa\\,K^{-1}} = ${sig(slope)}\\,\\mathrm{${u}}`,
    },
    verify: { kind: "value", value: slope },
  };
};

/** Liquids: enthalpy of vaporization (kJ mol⁻¹) and normal boiling point (°C). */
const LIQUIDS: { tex: string; H: number; tb: number }[] = [
  { tex: "\\mathrm{H_2O}", H: 40.7, tb: 100.0 },
  { tex: "\\mathrm{C_6H_6}", H: 30.8, tb: 80.1 },
  { tex: "\\mathrm{C_2H_5OH}", H: 38.6, tb: 78.3 },
  { tex: "\\mathrm{CH_3OH}", H: 35.3, tb: 64.5 },
  { tex: "\\mathrm{CCl_4}", H: 30.0, tb: 76.7 },
  { tex: "\\mathrm{(CH_3)_2CO}", H: 29.1, tb: 56.2 },
  { tex: "\\mathrm{C_6H_5CH_3}", H: 33.2, tb: 110.6 },
];
const ATM = 101.3; // kPa, the normal boiling pressure as shown

/** Clausius–Clapeyron: vapour pressure at θ from the normal boiling point. */
const vapourPressure: Generator = (rng) => {
  const l = rng.pick(LIQUIDS);
  const t = draw(rng, Math.round(l.tb) - 60, Math.round(l.tb) - 10, 5);
  const T = t + KELVIN;
  const Tb = l.tb + KELVIN;
  const at = (H: number, a: number, b: number): number => ATM * Math.exp((-H / R) * (1 / a - 1 / b));
  const p = at(l.H * 1000, T, Tb);
  const u = "kPa";
  return {
    prompt: {
      key: "vapourPressure",
      tex: lines(`${l.tex}:\\ \\Delta_\\mathrm{vap}H = ${l.H}\\,\\mathrm{${kJmol}}`, `\\theta_\\mathrm{b} = ${l.tb}\\,\\mathrm{{}^{\\circ}C}\\ (p = ${ATM}\\,\\mathrm{kPa})`, `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}:\\ ${asked("p^{*}", u)}`),
      id: `${l.tex}${t}`,
    },
    correct: valueIn(p, u),
    wrong: [
      mistakeIn(ATM * Math.exp((l.H * 1000 / R) * (1 / T - 1 / Tb)), u, "signError"),
      mistakeIn(at(l.H, T, Tb), u, "energyUnits"),
      mistakeIn(ATM * 10 ** ((-l.H * 1000 / R) * (1 / T - 1 / Tb)), u, "logBase"),
      ...(t > 0 && Math.abs((l.H * 1000 / R) * (1 / t - 1 / l.tb)) < 30 ? [mistakeIn(at(l.H * 1000, t, l.tb), u, "celsiusForKelvin")] : []),
    ],
    explanation: {
      key: "clausiusClapeyron",
      tex: `p^{*} = p_\\mathrm{b}\\,\\mathrm{e}^{-\\chi},\\ \\chi = \\frac{\\Delta_\\mathrm{vap}H}{R}\\left(\\frac{1}{T} - \\frac{1}{T_\\mathrm{b}}\\right) = \\frac{${l.H} \\times 10^{3}}{8.314}\\left(\\frac{1}{${sig(T, 5)}} - \\frac{1}{${sig(Tb, 5)}}\\right) = ${sig((l.H * 1000 / R) * (1 / T - 1 / Tb))},\\ p^{*} = ${sig(p)}\\,\\mathrm{${u}}`,
    },
    verify: { kind: "value", value: p },
  };
};

/** ΔvapH from the vapour pressure at two temperatures (°C). */
const vaporizationEnthalpy: Generator = (rng) => {
  const l = rng.pick(LIQUIDS);
  const t1 = draw(rng, Math.round(l.tb) - 60, Math.round(l.tb) - 30, 5);
  const t2 = t1 + draw(rng, 10, 30, 5);
  const T1 = t1 + KELVIN;
  const T2 = t2 + KELVIN;
  const pAt = (T: number): number => shown(ATM * Math.exp((-l.H * 1000 / R) * (1 / T - 1 / (l.tb + KELVIN))));
  const p1 = pAt(T1);
  const p2 = pAt(T2);
  const H = (R * Math.log(p2 / p1)) / (1 / T1 - 1 / T2) / 1000;
  return {
    prompt: {
      key: "vaporizationEnthalpy",
      tex: lines(`${l.tex}:\\ p^{*}(${t1}\\,\\mathrm{{}^{\\circ}C}) = ${sig(p1)}\\,\\mathrm{kPa}`, `p^{*}(${t2}\\,\\mathrm{{}^{\\circ}C}) = ${sig(p2)}\\,\\mathrm{kPa}`, asked("\\Delta_\\mathrm{vap}H", kJmol)),
      id: `${l.tex}${t1}`,
    },
    correct: valueIn(H, kJmol),
    wrong: [
      mistakeIn(-H, kJmol, "signError"),
      mistakeIn((R * Math.log10(p2 / p1)) / (1 / T1 - 1 / T2) / 1000, kJmol, "logBase"),
      ...(t1 > 0 ? [mistakeIn((R * Math.log(p2 / p1)) / (1 / t1 - 1 / t2) / 1000, kJmol, "celsiusForKelvin")] : []),
      mistakeIn((R_BAR * Math.log(p2 / p1)) / (1 / T1 - 1 / T2) / 1000, kJmol, "gasConstantUnits"),
      mistakeIn(H * 1000, kJmol, "energyUnits"),
    ],
    explanation: {
      key: "vaporizationEnthalpy",
      tex: `\\Delta_\\mathrm{vap}H = \\frac{R\\ln(p_2/p_1)}{1/T_1 - 1/T_2} = \\frac{8.314 \\times \\ln ${sig(p2 / p1)}}{1/${sig(T1, 5)} - 1/${sig(T2, 5)}}\\,\\mathrm{J\\,mol^{-1}} = ${sig(H)}\\,\\mathrm{${kJmol}}`,
    },
    verify: { kind: "value", value: H },
  };
};

/** Boiling temperature (°C) under another pressure, from the normal boiling point. */
const boilingTemperature: Generator = (rng) => {
  const l = rng.pick(LIQUIDS);
  const p = draw(rng, 40, 200, 5);
  if (p === 100 || p === 105) return boilingTemperature(rng);
  const Tb = l.tb + KELVIN;
  const H = l.H * 1000;
  const T = 1 / (1 / Tb - (R * Math.log(p / ATM)) / H);
  const t = T - KELVIN;
  const u = "{}^{\\circ}C";
  return {
    prompt: {
      key: "boilingTemperature",
      tex: lines(`${l.tex}:\\ \\Delta_\\mathrm{vap}H = ${l.H}\\,\\mathrm{${kJmol}}`, `\\theta_\\mathrm{b} = ${l.tb}\\,\\mathrm{{}^{\\circ}C}\\ (p = ${ATM}\\,\\mathrm{kPa})`, `p = ${p}\\,\\mathrm{kPa}:\\ ${asked("\\theta", u)}`),
      id: `${l.tex}${p}`,
    },
    correct: valueIn(t, u),
    wrong: [
      mistakeIn(1 / (1 / Tb + (R * Math.log(p / ATM)) / H) - KELVIN, u, "signError"),
      mistakeIn(1 / (1 / Tb - (R * Math.log10(p / ATM)) / H) - KELVIN, u, "logBase"),
      mistakeIn(T, u, "celsiusForKelvin"),
      mistakeIn(1 / (1 / Tb - (R * Math.log(p / ATM)) / l.H) - KELVIN, u, "energyUnits"),
    ],
    explanation: {
      key: "boilingTemperature",
      tex: `\\frac{1}{T} = \\frac{1}{T_\\mathrm{b}} - \\frac{R}{\\Delta_\\mathrm{vap}H}\\ln\\frac{p}{p_\\mathrm{b}} = \\frac{1}{${sig(Tb, 5)}} - \\frac{8.314}{${l.H} \\times 10^{3}}\\ln\\frac{${p}}{${ATM}} \\Rightarrow T = ${sig(T, 4)}\\,\\mathrm{K} = ${sig(t)}\\,\\mathrm{{}^{\\circ}C}`,
    },
    verify: { kind: "value", value: t },
  };
};

/** Condensed phases: molar mass (g mol⁻¹) and density (g cm⁻³). */
const CONDENSED: { tex: string; M: number; rho: number }[] = [
  { tex: "\\mathrm{H_2O(l)}", M: 18.02, rho: 0.997 },
  { tex: "\\mathrm{C_2H_5OH(l)}", M: 46.07, rho: 0.789 },
  { tex: "\\mathrm{C_6H_6(l)}", M: 78.11, rho: 0.879 },
  { tex: "\\mathrm{Hg(l)}", M: 200.59, rho: 13.53 },
  { tex: "\\mathrm{Fe(s)}", M: 55.85, rho: 7.87 },
  { tex: "\\mathrm{Cu(s)}", M: 63.55, rho: 8.96 },
  { tex: "\\mathrm{C(s)}", M: 12.01, rho: 3.51 },
];

/** Δμ = V_m Δp for a condensed phase, in J mol⁻¹. */
const condensedPotential: Generator = (rng) => {
  const s = rng.pick(CONDENSED);
  const pf = draw(rng, 10, 500, 10); // bar
  const T = 298;
  const Vm = s.M / s.rho; // cm³ mol⁻¹
  const mu = Vm * 1e-6 * (pf - 1) * 1e5;
  return {
    prompt: {
      key: "condensedPotential",
      tex: lines(`${s.tex}:\\ M = ${s.M}\\,\\mathrm{g\\,mol^{-1}}`, `\\rho = ${s.rho}\\,\\mathrm{g\\,cm^{-3}}`, `T = ${T}\\,\\mathrm{K}`, `p: 1\\,\\mathrm{bar} \\to ${pf}\\,\\mathrm{bar}`, asked("\\Delta\\mu", Jmol)),
      id: `${s.tex}${pf}`,
    },
    correct: valueIn(mu, Jmol),
    wrong: [
      mistakeIn(R * T * Math.log(pf), Jmol, "perfectForReal"),
      ...(mu * 1000 < 1e5 ? [mistakeIn(mu * 1000, Jmol, "volumeUnits")] : []),
      mistakeIn(mu / 1000, Jmol, "energyUnits"),
      mistakeIn((s.rho / s.M) * 1e-6 * (pf - 1) * 1e5, Jmol, "formulaInverted"),
      mistakeIn(mu / 1e5, Jmol, "pressureUnits"),
    ],
    explanation: {
      key: "condensedPotential",
      tex: `V_\\mathrm{m} = \\frac{M}{\\rho} = ${sig(Vm)}\\,\\mathrm{cm^{3}\\,mol^{-1}},\\quad \\Delta\\mu = V_\\mathrm{m}\\Delta p = ${sig(Vm)} \\times 10^{-6} \\times ${sig((pf - 1) * 1e5)}\\,\\mathrm{J\\,mol^{-1}} = ${sig(mu)}\\,\\mathrm{${Jmol}}`,
    },
    verify: { kind: "value", value: mu },
  };
};

export const phases = {
  chemistry: { phaseRule, clapeyronSlope, vapourPressure, vaporizationEnthalpy, boilingTemperature, condensedPotential },
};
