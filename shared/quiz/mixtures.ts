/**
 * Physical chemistry, Focus 5: simple mixtures (Atkins Topics 5A–5F).
 * Mixing, Raoult's and Henry's laws, colligative properties, the lever rule,
 * activities, ionic strength and the Debye–Hückel limiting law.
 */
import { lines } from "./tex";
import { R, R_ATM, KELVIN, asked, draw, given, mistakeIn, valueIn, sig } from "./units";
import type { Generator, Option } from "./types";
import type { Rng } from "./rng";

const kJ = "kJ";
const JK = "J\\,K^{-1}";
const kPa = "kPa";

const shown = (x: number, digits = 3): number => Number(x.toPrecision(digits));
const xlnx = (x: number, log: (y: number) => number = Math.log): number => (x > 0 ? x * log(x) : 0);

/** Two amounts and their mole fraction of A. */
function amounts(rng: Rng): { nA: number; nB: number; n: number; xA: number; xB: number } {
  const nA = draw(rng, 0.5, 5, 0.1);
  let nB = draw(rng, 0.5, 5, 0.1);
  if (nB === nA) nB = Number((nB + 0.3).toFixed(1));
  const n = nA + nB;
  return { nA, nB, n, xA: nA / n, xB: nB / n };
}
const amountsTex = (nA: number, nB: number): string => `${given("n_\\mathrm{A}", nA, "mol", 2)},\\quad ${given("n_\\mathrm{B}", nB, "mol", 2)}`;

/** ΔmixG = nRT(x_A ln x_A + x_B ln x_B), perfect gases or an ideal solution; T in °C. */
const gibbsMixing: Generator = (rng) => {
  const { nA, nB, n, xA, xB } = amounts(rng);
  const t = draw(rng, 0, 80, 5);
  const T = t + KELVIN;
  const mix = (temperature: number, a: number, b: number, log?: (y: number) => number): number => (n * R * temperature * (xlnx(a, log) + xlnx(b, log))) / 1000;
  const G = mix(T, xA, xB);
  return {
    prompt: { key: "gibbsMixing", tex: lines(amountsTex(nA, nB), `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, asked("\\Delta_\\mathrm{mix}G", kJ)) },
    correct: valueIn(G, kJ),
    wrong: [
      mistakeIn(-G, kJ, "signError"),
      mistakeIn(mix(T, xA, xB, Math.log10), kJ, "logBase"),
      mistakeIn(mix(T, nA / nB, nB / nA), kJ, "moleFractionError"),
      ...(t > 0 ? [mistakeIn(mix(t, xA, xB), kJ, "celsiusForKelvin")] : []),
      mistakeIn(G * 1000, kJ, "energyUnits"),
    ],
    explanation: {
      key: "gibbsMixing",
      tex: `x_\\mathrm{A} = ${sig(xA)},\\ x_\\mathrm{B} = ${sig(xB)},\\quad \\Delta_\\mathrm{mix}G = nRT(x_\\mathrm{A}\\ln x_\\mathrm{A} + x_\\mathrm{B}\\ln x_\\mathrm{B}) = ${sig(n, 2)} \\times 8.314 \\times ${sig(T, 5)} \\times (${sig(xlnx(xA) + xlnx(xB))})\\,\\mathrm{J} = ${sig(G)}\\,\\mathrm{kJ}`,
    },
    verify: { kind: "value", value: G },
  };
};

/** ΔmixS = −nR(x_A ln x_A + x_B ln x_B). */
const entropyMixing: Generator = (rng) => {
  const { nA, nB, n, xA, xB } = amounts(rng);
  const mix = (amount: number, a: number, b: number, log?: (y: number) => number): number => -amount * R * (xlnx(a, log) + xlnx(b, log));
  const S = mix(n, xA, xB);
  return {
    prompt: { key: "entropyMixing", tex: lines(amountsTex(nA, nB), asked("\\Delta_\\mathrm{mix}S", JK)) },
    correct: valueIn(S, JK),
    wrong: [
      mistakeIn(-S, JK, "signError"),
      mistakeIn(mix(n, xA, xB, Math.log10), JK, "logBase"),
      mistakeIn(mix(1, xA, xB), JK, "stoichiometryForgotten"),
      mistakeIn(mix(n, nA / nB, nB / nA), JK, "moleFractionError"),
    ],
    explanation: {
      key: "entropyMixing",
      tex: `\\Delta_\\mathrm{mix}S = -nR(x_\\mathrm{A}\\ln x_\\mathrm{A} + x_\\mathrm{B}\\ln x_\\mathrm{B}) = -${sig(n, 2)} \\times 8.314 \\times (${sig(xlnx(xA) + xlnx(xB))}) = ${sig(S)}\\,\\mathrm{${JK}}`,
    },
    verify: { kind: "value", value: S },
  };
};

/** Two vapour pressures of pure liquids, in kPa, the first the higher. */
function pures(rng: Rng): [number, number] {
  const a = draw(rng, 20, 100, 0.5);
  const b = draw(rng, 5, a - 5, 0.5);
  return [a, b];
}

/** Raoult's law: total vapour pressure of an ideal solution. */
const raoultPressure: Generator = (rng) => {
  const { nA, nB, xA, xB } = amounts(rng);
  const [pA, pB] = pures(rng);
  const p = xA * pA + xB * pB;
  return {
    prompt: { key: "raoultPressure", tex: lines(amountsTex(nA, nB), `p_\\mathrm{A}^{*} = ${sig(pA)}\\,\\mathrm{kPa},\\quad p_\\mathrm{B}^{*} = ${sig(pB)}\\,\\mathrm{kPa}`, asked("p", kPa)) },
    correct: valueIn(p, kPa),
    wrong: [
      mistakeIn(xB * pA + xA * pB, kPa, "componentsSwapped"),
      mistakeIn((nA / nB) * pA + (nB / nA) * pB, kPa, "moleFractionError"),
      mistakeIn(xA * pA, kPa, "termDropped"),
      mistakeIn(xB * pB, kPa, "termDropped"),
    ],
    explanation: {
      key: "raoult",
      tex: `p = x_\\mathrm{A}p_\\mathrm{A}^{*} + x_\\mathrm{B}p_\\mathrm{B}^{*} = ${sig(xA)} \\times ${sig(pA)} + ${sig(xB)} \\times ${sig(pB)} = ${sig(p)}\\,\\mathrm{kPa}`,
    },
    verify: { kind: "value", value: p },
  };
};

/** Composition of the vapour over an ideal solution: y_A = x_A p_A* / p. */
const vapourComposition: Generator = (rng) => {
  const xA = draw(rng, 0.1, 0.9, 0.05);
  const xB = 1 - xA;
  const [pA, pB] = pures(rng);
  const p = xA * pA + xB * pB;
  const y = (xA * pA) / p;
  return {
    prompt: { key: "vapourComposition", tex: lines(`x_\\mathrm{A} = ${sig(xA, 2)}`, `p_\\mathrm{A}^{*} = ${sig(pA)}\\,\\mathrm{kPa},\\quad p_\\mathrm{B}^{*} = ${sig(pB)}\\,\\mathrm{kPa}`, asked("y_\\mathrm{A}", "")) },
    correct: valueIn(y, ""),
    wrong: [
      mistakeIn(xA, "", "phaseCompositionConfused"),
      mistakeIn(1 - y, "", "complementTaken"),
      mistakeIn(pA / p, "", "termDropped"),
      mistakeIn((xA * pB) / p, "", "componentsSwapped"),
    ],
    explanation: {
      key: "vapourComposition",
      tex: `p = x_\\mathrm{A}p_\\mathrm{A}^{*} + x_\\mathrm{B}p_\\mathrm{B}^{*} = ${sig(p)}\\,\\mathrm{kPa},\\quad y_\\mathrm{A} = \\frac{x_\\mathrm{A}p_\\mathrm{A}^{*}}{p} = \\frac{${sig(xA * pA)}}{${sig(p)}} = ${sig(y)}`,
    },
    verify: { kind: "value", value: y },
  };
};

/** Henry's law constants in water at 298 K, kPa kg mol⁻¹ (b = p/K). */
const HENRY: { tex: string; K: number }[] = [
  { tex: "\\mathrm{O_2}", K: 7.92e4 },
  { tex: "\\mathrm{N_2}", K: 1.56e5 },
  { tex: "\\mathrm{CO_2}", K: 3.01e3 },
  { tex: "\\mathrm{H_2}", K: 1.28e5 },
];

/** Henry's law: molality of a gas dissolved from a gas mixture, in mmol kg⁻¹. */
const henrySolubility: Generator = (rng) => {
  const g = rng.pick(HENRY);
  const p = draw(rng, 100, 500, 10); // total pressure, kPa
  const y = draw(rng, 0.05, 0.6, 0.01);
  const b = ((y * p) / g.K) * 1000;
  const u = "mmol\\,kg^{-1}";
  return {
    prompt: {
      key: "henrySolubility",
      tex: lines(`${g.tex}:\\ K = ${sig(g.K)}\\,\\mathrm{kPa\\,kg\\,mol^{-1}}`, `p = ${p}\\,\\mathrm{kPa}`, `y_{${g.tex}} = ${sig(y, 2)}`, asked(`b_{${g.tex}}`, u)),
      id: `${g.tex}${p}${y}`,
    },
    correct: valueIn(b, u),
    wrong: [
      mistakeIn((p / g.K) * 1000, u, "totalForPartial"),
      mistakeIn((g.K / (y * p)) * 1000, u, "formulaInverted"),
      mistakeIn(b * 1000, u, "pressureUnits"),
      mistakeIn(b / 1000, u, "wrongFactor"),
    ],
    explanation: {
      key: "henry",
      tex: `p_{${g.tex}} = yp = ${sig(y * p)}\\,\\mathrm{kPa},\\quad b = \\frac{p_{${g.tex}}}{K} = \\frac{${sig(y * p)}}{${sig(g.K)}}\\,\\mathrm{mol\\,kg^{-1}} = ${sig(b)}\\,\\mathrm{${u}}`,
    },
    verify: { kind: "value", value: b },
  };
};

/** Solvents: cryoscopic and ebullioscopic constants, K kg mol⁻¹. */
const SOLVENTS: { tex: string; Kf: number; Kb: number; water: boolean }[] = [
  { tex: "\\mathrm{H_2O}", Kf: 1.86, Kb: 0.51, water: true },
  { tex: "\\mathrm{C_6H_6}", Kf: 5.12, Kb: 2.53, water: false },
  { tex: "\\mathrm{C_6H_{12}}", Kf: 20.0, Kb: 2.79, water: false },
  { tex: "\\mathrm{CCl_4}", Kf: 30.0, Kb: 4.95, water: false },
];
/** Solutes: molar mass (g mol⁻¹) and ions per formula unit (1: not dissociated). */
const SOLUTES: { tex: string; M: number; i: number }[] = [
  { tex: "\\mathrm{C_6H_{12}O_6}", M: 180.16, i: 1 },
  { tex: "\\mathrm{C_{12}H_{22}O_{11}}", M: 342.3, i: 1 },
  { tex: "\\mathrm{CO(NH_2)_2}", M: 60.06, i: 1 },
  { tex: "\\mathrm{C_{10}H_8}", M: 128.17, i: 1 },
  { tex: "\\mathrm{NaCl}", M: 58.44, i: 2 },
  { tex: "\\mathrm{KNO_3}", M: 101.1, i: 2 },
  { tex: "\\mathrm{CaCl_2}", M: 110.98, i: 3 },
];

/** ΔT = i K b: freezing-point depression or boiling-point elevation (ideal, dilute). */
function colligative(kind: "freezing" | "boiling"): Generator {
  return (rng) => {
    const solvent = rng.pick(SOLVENTS);
    // Salts dissociate in water only; naphthalene does not dissolve in it.
    const solute = rng.pick(SOLUTES.filter((s) => (solvent.water ? s.tex !== "\\mathrm{C_{10}H_8}" : s.i === 1)));
    const m = draw(rng, 1, 20, 0.5); // g of solute
    const w = draw(rng, 100, 1000, 50); // g of solvent
    const K = kind === "freezing" ? solvent.Kf : solvent.Kb;
    const b = m / solute.M / (w / 1000);
    const dT = solute.i * K * b;
    const symbol = kind === "freezing" ? "f" : "b";
    return {
      prompt: {
        key: kind === "freezing" ? "freezingDepression" : "boilingElevation",
        tex: lines(
          `${solute.tex}:\\ m = ${m}\\,\\mathrm{g}`, `M = ${solute.M}\\,\\mathrm{g\\,mol^{-1}}`,
          `${solvent.tex}:\\ m = ${w}\\,\\mathrm{g}`, `K_\\mathrm{${symbol}} = ${K}\\,\\mathrm{K\\,kg\\,mol^{-1}}`,
          asked(`\\Delta T_\\mathrm{${symbol}}`, "K"),
        ),
        id: `${solute.tex}${solvent.tex}${m}${w}`,
      },
      correct: valueIn(dT, "K"),
      wrong: [
        ...(solute.i > 1 ? [mistakeIn(K * b, "K", "particlesForgotten")] : []),
        mistakeIn(dT / 1000, "K", "massUnits"),
        mistakeIn(solute.i * K * (m / solute.M), "K", "termDropped"),
        mistakeIn((solute.i * K) / b, "K", "formulaInverted"),
      ],
      explanation: {
        key: "colligative",
        tex: `b = \\frac{${m}/${solute.M}}{${sig(w / 1000)}}\\,\\mathrm{mol\\,kg^{-1}} = ${sig(b)}\\,\\mathrm{mol\\,kg^{-1}},\\quad \\Delta T_\\mathrm{${symbol}} = iK_\\mathrm{${symbol}}b = ${solute.i} \\times ${K} \\times ${sig(b)} = ${sig(dT)}\\,\\mathrm{K}`,
      },
      verify: { kind: "value", value: dT },
    };
  };
}
const freezingDepression = colligative("freezing");
const boilingElevation = colligative("boiling");

/** Molar mass of a macromolecule from its osmotic pressure: M = cRT/Π (van 't Hoff), in kg mol⁻¹. */
const osmoticMolarMass: Generator = (rng) => {
  const c = draw(rng, 1, 20, 0.5); // g dm⁻³ = kg m⁻³
  const M0 = draw(rng, 10, 200, 1); // kg mol⁻¹
  const t = draw(rng, 5, 37, 1);
  const T = t + KELVIN;
  const Pi = shown((c * R * T) / M0); // Pa
  const M = (c * R * T) / Pi;
  const u = "kg\\,mol^{-1}";
  return {
    prompt: { key: "osmoticMolarMass", tex: lines(`c = ${sig(c)}\\,\\mathrm{g\\,dm^{-3}}`, `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, given("\\Pi", Pi, "Pa"), asked("M", u)) },
    correct: valueIn(M, u),
    wrong: [
      mistakeIn((c * R * t) / Pi, u, "celsiusForKelvin"),
      mistakeIn(Pi / (c * R * T), u, "formulaInverted"),
      ...(M * 1000 < 1e5 ? [mistakeIn(M * 1000, u, "massUnits")] : []),
      mistakeIn(M / 1000, u, "volumeUnits"),
      mistakeIn((c * R_ATM * T) / Pi, u, "gasConstantUnits"),
    ],
    explanation: {
      key: "osmosis",
      tex: `\\Pi = [\\mathrm{B}]RT = \\frac{c}{M}RT \\Rightarrow M = \\frac{cRT}{\\Pi} = \\frac{${sig(c)}\\,\\mathrm{kg\\,m^{-3}} \\times 8.314 \\times ${sig(T, 5)}}{${sig(Pi)}\\,\\mathrm{Pa}} = ${sig(M)}\\,\\mathrm{${u}}`,
    },
    verify: { kind: "value", value: M },
  };
};

/** Lever rule: the fraction of the amount in the liquid phase. */
const leverRule: Generator = (rng) => {
  const xl = draw(rng, 0.1, 0.5, 0.05);
  const xv = Number((xl + draw(rng, 0.2, 0.4, 0.05)).toFixed(2));
  const steps = Math.round((xv - xl) / 0.05);
  const z = Number((xl + rng.int(1, steps - 1) * 0.05).toFixed(2));
  const f = (xv - z) / (xv - xl);
  return {
    prompt: {
      key: "leverRule",
      tex: lines(`z_\\mathrm{B} = ${sig(z, 2)}`, `x_\\mathrm{B}(\\mathrm{l}) = ${sig(xl, 2)},\\quad x_\\mathrm{B}(\\mathrm{v}) = ${sig(xv, 2)}`, asked("n_\\mathrm{l}/n", "")),
    },
    correct: valueIn(f, ""),
    wrong: [
      mistakeIn(1 - f, "", "complementTaken"),
      mistakeIn((xv - z) / (z - xl), "", "moleFractionError"),
      mistakeIn(z, "", "phaseCompositionConfused"),
      mistakeIn((z - xl) / (xv - z), "", "ratioInverted"),
    ],
    explanation: {
      key: "leverRule",
      tex: `n_\\mathrm{l}l_\\mathrm{l} = n_\\mathrm{v}l_\\mathrm{v} \\Rightarrow \\frac{n_\\mathrm{l}}{n} = \\frac{x_\\mathrm{B}(\\mathrm{v}) - z_\\mathrm{B}}{x_\\mathrm{B}(\\mathrm{v}) - x_\\mathrm{B}(\\mathrm{l})} = \\frac{${sig(xv - z, 2)}}{${sig(xv - xl, 2)}} = ${sig(f)}`,
    },
    verify: { kind: "value", value: f },
  };
};

/** Activity coefficient of a solvent (Raoult's law convention): γ_A = p_A / (x_A p_A*). */
const activityCoefficient: Generator = (rng) => {
  const xA = draw(rng, 0.5, 0.95, 0.05);
  const pStar = draw(rng, 10, 100, 0.5);
  const g0 = draw(rng, 0.6, 1.4, 0.01);
  if (Math.abs(g0 - 1) < 0.05) return activityCoefficient(rng);
  const pA = shown(g0 * xA * pStar);
  const gamma = pA / (xA * pStar);
  return {
    prompt: { key: "activityCoefficient", tex: lines(`x_\\mathrm{A} = ${sig(xA, 2)}`, `p_\\mathrm{A}^{*} = ${sig(pStar)}\\,\\mathrm{kPa}`, `p_\\mathrm{A} = ${sig(pA)}\\,\\mathrm{kPa}`, asked("\\gamma_\\mathrm{A}", "")) },
    correct: valueIn(gamma, ""),
    wrong: [
      mistakeIn(pA / pStar, "", "termDropped"),
      mistakeIn((xA * pStar) / pA, "", "ratioInverted"),
      mistakeIn(pA / ((1 - xA) * pStar), "", "complementTaken"),
    ],
    explanation: {
      key: "activity",
      tex: `a_\\mathrm{A} = \\frac{p_\\mathrm{A}}{p_\\mathrm{A}^{*}} = ${sig(pA / pStar)},\\quad \\gamma_\\mathrm{A} = \\frac{a_\\mathrm{A}}{x_\\mathrm{A}} = \\frac{${sig(pA / pStar)}}{${sig(xA, 2)}} = ${sig(gamma)}`,
    },
    verify: { kind: "value", value: gamma },
  };
};

/** Salts: their ions as [number per formula unit, charge]. */
const SALTS: { tex: string; ions: [number, number][] }[] = [
  { tex: "\\mathrm{NaCl}", ions: [[1, 1], [1, -1]] },
  { tex: "\\mathrm{KNO_3}", ions: [[1, 1], [1, -1]] },
  { tex: "\\mathrm{MgCl_2}", ions: [[1, 2], [2, -1]] },
  { tex: "\\mathrm{CaCl_2}", ions: [[1, 2], [2, -1]] },
  { tex: "\\mathrm{Na_2SO_4}", ions: [[2, 1], [1, -2]] },
  { tex: "\\mathrm{CuSO_4}", ions: [[1, 2], [1, -2]] },
  { tex: "\\mathrm{MgSO_4}", ions: [[1, 2], [1, -2]] },
  { tex: "\\mathrm{AlCl_3}", ions: [[1, 3], [3, -1]] },
  { tex: "\\mathrm{K_3PO_4}", ions: [[3, 1], [1, -3]] },
];
type Salt = (typeof SALTS)[number];
/** ½ Σ b ν f(z): the ionic strength with f(z) = z², or a mistake's version. */
const strength = (salt: Salt, b: number, f: (z: number) => number = (z) => z * z, count = true): number =>
  0.5 * salt.ions.reduce((s, [nu, z]) => s + (count ? nu : 1) * b * f(z), 0);

/** Ionic strength of a solution of two salts. */
const ionicStrength: Generator = (rng) => {
  const one = rng.pick(SALTS);
  const two = rng.pick(SALTS.filter((s) => s !== one && s.ions.join() !== one.ions.join()));
  const b1 = draw(rng, 0.005, 0.1, 0.005);
  const b2 = draw(rng, 0.005, 0.1, 0.005);
  const both = (f?: (z: number) => number, count?: boolean): number => strength(one, b1, f, count) + strength(two, b2, f, count);
  const I = both();
  return {
    prompt: {
      key: "ionicStrength",
      tex: lines(`${sig(b1)}\\,\\mathrm{mol\\,kg^{-1}}\\ ${one.tex}`, `+\\ ${sig(b2)}\\,\\mathrm{mol\\,kg^{-1}}\\ ${two.tex}`, asked("I", "")),
      id: `${one.tex}${two.tex}${b1}${b2}`,
    },
    correct: valueIn(I, ""),
    wrong: [
      mistakeIn(2 * I, "", "wrongFactor"),
      mistakeIn(both(Math.abs), "", "chargeNotSquared"),
      mistakeIn(both(undefined, false), "", "stoichiometryForgotten"),
      mistakeIn(b1 + b2, "", "termDropped"),
    ],
    explanation: {
      key: "ionicStrength",
      tex: `I = \\tfrac{1}{2}\\sum_i z_i^{2}(b_i/b^{\\ominus}) = ${sig(strength(one, b1))} + ${sig(strength(two, b2))} = ${sig(I)}`,
    },
    verify: { kind: "value", value: I },
  };
};

const A_DH = 0.509;

/** Debye–Hückel limiting law: log γ± = −A|z₊z₋|√I, for a salt alone in water at 25 °C. */
const debyeHuckel: Generator = (rng) => {
  const salt = rng.pick(SALTS);
  const b = draw(rng, 0.0005, 0.01, 0.0005);
  const I = strength(salt, b);
  const zz = Math.abs(salt.ions[0]![1] * salt.ions[1]![1]);
  const log = -A_DH * zz * Math.sqrt(I);
  const gamma = 10 ** log;
  const wrong: Option[] = [
    mistakeIn(Math.exp(log), "", "lnForLog"),
    mistakeIn(10 ** (-A_DH * zz * I), "", "sqrtForgotten"),
    mistakeIn(10 ** -log, "", "signError"),
  ];
  if (zz !== 1) wrong.push(mistakeIn(10 ** (-A_DH * Math.sqrt(I)), "", "termDropped"));
  if (Math.abs(I - b) > 1e-12) wrong.push(mistakeIn(10 ** (-A_DH * zz * Math.sqrt(b)), "", "stoichiometryForgotten"));
  return {
    prompt: { key: "debyeHuckel", tex: lines(`${sig(b)}\\,\\mathrm{mol\\,kg^{-1}}\\ ${salt.tex}(\\mathrm{aq})`, `25\\,\\mathrm{{}^{\\circ}C},\\quad A = ${A_DH}`, asked("\\gamma_{\\pm}", "")), id: `${salt.tex}${b}` },
    correct: valueIn(gamma, ""),
    wrong,
    explanation: {
      key: "debyeHuckel",
      tex: `I = ${sig(I)},\\quad \\log\\gamma_{\\pm} = -A|z_+z_-|I^{1/2} = -${A_DH} \\times ${zz} \\times ${sig(Math.sqrt(I))} = ${sig(log)},\\quad \\gamma_{\\pm} = ${sig(gamma)}`,
    },
    verify: { kind: "value", value: gamma },
  };
};

export const mixtures = {
  chemistry: {
    gibbsMixing,
    entropyMixing,
    raoultPressure,
    vapourComposition,
    henrySolubility,
    freezingDepression,
    boilingElevation,
    osmoticMolarMass,
    leverRule,
    activityCoefficient,
    ionicStrength,
    debyeHuckel,
  },
};
