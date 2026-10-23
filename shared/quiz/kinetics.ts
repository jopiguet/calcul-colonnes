/**
 * Physical chemistry, Focuses 17–18: chemical kinetics and reaction dynamics
 * (Atkins Topics 17A–18E). Integrated rate laws and half-lives, the Arrhenius
 * equation, relaxation, enzymes, polymers and photochemistry; collision
 * theory, diffusion control, transition-state theory, isotope effects and
 * Marcus theory.
 */
import { lines } from "./tex";
import { K_B, KELVIN, N_A, R, asked, draw, mistakeIn, sig, valueIn } from "./units";
import { LIGHT, PLANCK } from "./quantum";
import type { Generator, Option } from "./types";

const M = "mol\\,dm^{-3}";
const S1 = "s^{-1}";
const K2 = "dm^{3}\\,mol^{-1}\\,s^{-1}";
const kJmol = "kJ\\,mol^{-1}";
/** Options spanning powers of ten are chosen, never typed. */
const choice = (o: Option): Option => ({ ...o, choiceOnly: true });
/** A slip can overflow (a temperature in °C near 0) or underflow: such options are left out. */
const shown = (options: Option[]): Option[] => options.filter((o) => Number.isFinite(o.num!) && Math.abs(o.num!) > 1e-250 && Math.abs(o.num!) < 1e250);

// --------------------------------------------------------------- Focus 17

/** [A] after t for A → P, first order. */
const firstOrderConcentration: Generator = (rng) => {
  const A0 = draw(rng, 0.1, 2, 0.05);
  const k = draw(rng, 1, 9, 0.1) * 1e-3; // s⁻¹
  const t = draw(rng, 60, 600, 10); // s
  const A = A0 * Math.exp(-k * t);
  return {
    prompt: { key: "firstOrderConcentration", tex: lines(`[\\mathrm{A}]_0 = ${sig(A0)}\\,\\mathrm{${M}}`, `k_\\mathrm{r} = ${sig(k * 1e3, 2)} \\times 10^{-3}\\,\\mathrm{${S1}}`, `t = ${t}\\,\\mathrm{s}`, asked("[\\mathrm{A}]", M)) },
    correct: valueIn(A, M),
    wrong: [
      mistakeIn(A0 * 10 ** (-k * t), M, "logBase"),
      mistakeIn(A0 / (1 + k * t * A0), M, "orderConfused"),
      mistakeIn(A0 * Math.exp(-(k * t) / Math.LN2), M, "halfLifeForTau"),
      ...(k * t < 1 ? [mistakeIn(A0 * (1 - k * t), M, "orderConfused")] : []),
    ],
    explanation: {
      key: "firstOrderConcentration",
      tex: lines(
        `[\\mathrm{A}] = [\\mathrm{A}]_0\\mathrm{e}^{-k_\\mathrm{r}t}`,
        `= ${sig(A0)} \\times \\mathrm{e}^{-${sig(k * t)}}\\,\\mathrm{${M}}`,
        `= ${sig(A)}\\,\\mathrm{${M}}`,
      ),
    },
    verify: { kind: "value", value: A },
  };
};

/** Half-life of a first-order reaction from its rate constant, in minutes. */
const firstOrderHalfLife: Generator = (rng) => {
  const k = draw(rng, 1, 9.9, 0.1) * 1e-4; // s⁻¹
  const half = Math.LN2 / k / 60;
  return {
    prompt: { key: "firstOrderHalfLife", tex: lines(`k_\\mathrm{r} = ${sig(k * 1e4, 2)} \\times 10^{-4}\\,\\mathrm{${S1}}`, asked("t_{1/2}", "min")) },
    correct: valueIn(half, "min"),
    wrong: [
      mistakeIn(1 / k / 60, "min", "halfLifeForTau"),
      mistakeIn(Math.LOG10E * Math.LN2 / k / 60, "min", "logBase"),
      mistakeIn(Math.LN2 / k, "min", "timeUnits"),
      mistakeIn(0.5 / k / 60, "min", "orderConfused"),
    ],
    explanation: {
      key: "firstOrderHalfLife",
      tex: lines(
        `t_{1/2} = \\frac{\\ln 2}{k_\\mathrm{r}}`,
        `= \\frac{0.693}{${sig(k)}\\,\\mathrm{s^{-1}}}`,
        `= ${sig(Math.LN2 / k)}\\,\\mathrm{s}`,
        `= ${sig(half)}\\,\\mathrm{min}`,
      ),
    },
    verify: { kind: "value", value: half },
  };
};

/** [A] after t for 2A → P with d[A]/dt = −k[A]². */
const secondOrderConcentration: Generator = (rng) => {
  const A0 = draw(rng, 0.05, 1, 0.05);
  const k = draw(rng, 0.01, 0.5, 0.01); // dm³ mol⁻¹ s⁻¹
  const t = draw(rng, 20, 600, 10);
  const A = A0 / (1 + k * t * A0);
  return {
    prompt: { key: "secondOrderConcentration", tex: lines(`[\\mathrm{A}]_0 = ${sig(A0)}\\,\\mathrm{${M}}`, `k_\\mathrm{r} = ${sig(k)}\\,\\mathrm{${K2}}`, `t = ${t}\\,\\mathrm{s}`, asked("[\\mathrm{A}]", M)) },
    correct: valueIn(A, M),
    wrong: [
      mistakeIn(A0 * Math.exp(-k * t), M, "orderConfused"),
      mistakeIn(A0 / (1 + k * t), M, "termDropped"),
      ...(k * t * A0 < 1 ? [mistakeIn(A0 - k * t * A0 * A0, M, "orderConfused")] : []),
      mistakeIn(A0 / (1 + 2 * k * t * A0), M, "stoichiometryForgotten"),
    ],
    explanation: {
      key: "secondOrderConcentration",
      tex: lines(
        `\\frac{1}{[\\mathrm{A}]} = \\frac{1}{[\\mathrm{A}]_0} + k_\\mathrm{r}t`,
        `= ${sig(1 / A0)} + ${sig(k * t)}`,
        `= ${sig(1 / A)}\\,\\mathrm{dm^{3}\\,mol^{-1}}`,
        `[\\mathrm{A}] = ${sig(A)}\\,\\mathrm{${M}}`,
      ),
    },
    verify: { kind: "value", value: A },
  };
};

/** Half-life of a second-order reactant: 1/(k[A]₀). */
const secondOrderHalfLife: Generator = (rng) => {
  const A0 = draw(rng, 0.01, 0.5, 0.01);
  const k = draw(rng, 0.1, 9.9, 0.1) * 1e-2;
  const half = 1 / (k * A0);
  return {
    prompt: { key: "secondOrderHalfLife", tex: lines(`[\\mathrm{A}]_0 = ${sig(A0)}\\,\\mathrm{${M}}`, `k_\\mathrm{r} = ${sig(k)}\\,\\mathrm{${K2}}`, asked("t_{1/2}", "s")) },
    correct: valueIn(half, "s"),
    wrong: [
      mistakeIn(Math.LN2 / k, "s", "orderConfused"),
      mistakeIn(A0 / k, "s", "formulaInverted"),
      mistakeIn(Math.LN2 / (k * A0), "s", "orderConfused"),
      mistakeIn(1 / (2 * k * A0), "s", "wrongFactor"),
    ],
    explanation: {
      key: "secondOrderHalfLife",
      tex: lines(
        `t_{1/2} = \\frac{1}{k_\\mathrm{r}[\\mathrm{A}]_0}`,
        `= \\frac{1}{${sig(k)} \\times ${sig(A0)}}\\,\\mathrm{s}`,
        `= ${sig(half)}\\,\\mathrm{s}`,
      ),
    },
    verify: { kind: "value", value: half },
  };
};

/** How much faster at θ₂ than at θ₁, temperatures in °C. */
const arrheniusRatio: Generator = (rng) => {
  const Ea = draw(rng, 20, 150, 1); // kJ mol⁻¹
  const t1 = draw(rng, 5, 50, 5);
  const t2 = t1 + draw(rng, 10, 50, 5);
  const [T1, T2] = [t1 + KELVIN, t2 + KELVIN];
  const x = ((Ea * 1000) / R) * (1 / T1 - 1 / T2);
  const ratio = Math.exp(x);
  return {
    prompt: { key: "arrheniusRatio", tex: lines(`E_\\mathrm{a} = ${Ea}\\,\\mathrm{${kJmol}}`, `\\theta_1 = ${t1}\\,\\mathrm{{}^{\\circ}C}`, `\\theta_2 = ${t2}\\,\\mathrm{{}^{\\circ}C}`, asked("k_2/k_1", "")) },
    correct: choice(valueIn(ratio, "")),
    wrong: shown([
      mistakeIn(Math.exp(((Ea * 1000) / R) * (1 / t1 - 1 / t2)), "", "celsiusForKelvin"),
      mistakeIn(Math.exp((Ea / R) * (1 / T1 - 1 / T2)), "", "energyUnits"),
      mistakeIn(1 / ratio, "", "signError"),
      mistakeIn(10 ** x, "", "logBase"),
    ]).map(choice),
    explanation: {
      key: "arrheniusRatio",
      tex: lines(
        `\\ln\\frac{k_2}{k_1} = \\frac{E_\\mathrm{a}}{R}\\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)`,
        `= \\frac{${Ea} \\times 10^{3}}{8.314}`,
        `\\times \\left(\\frac{1}{${sig(T1, 5)}} - \\frac{1}{${sig(T2, 5)}}\\right)`,
        `= ${sig(x)}`,
        `\\frac{k_2}{k_1} = ${sig(ratio)}`,
      ),
    },
    verify: { kind: "value", value: ratio },
  };
};

/** Activation energy from rate constants at two temperatures (°C). */
const activationEnergy: Generator = (rng) => {
  const Ea = draw(rng, 30, 150, 1);
  const t1 = draw(rng, 10, 50, 5);
  const t2 = t1 + draw(rng, 10, 40, 5);
  const [T1, T2] = [t1 + KELVIN, t2 + KELVIN];
  const k1 = draw(rng, 1, 9.9, 0.1) * 1e-3;
  const k2 = k1 * Math.exp(((Ea * 1000) / R) * (1 / T1 - 1 / T2));
  const lnRatio = Math.log(k2 / k1);
  const E = (R * lnRatio) / (1 / T1 - 1 / T2) / 1000;
  return {
    prompt: { key: "activationEnergy", tex: lines(`\\theta_1 = ${t1}\\,\\mathrm{{}^{\\circ}C}`, `\\theta_2 = ${t2}\\,\\mathrm{{}^{\\circ}C}`, `k_1 = ${sig(k1)}\\,\\mathrm{${S1}}`, `k_2 = ${sig(k2)}\\,\\mathrm{${S1}}`, asked("E_\\mathrm{a}", kJmol)) },
    correct: valueIn(E, kJmol),
    wrong: [
      mistakeIn((R * lnRatio) / (1 / t1 - 1 / t2) / 1000, kJmol, "celsiusForKelvin"),
      mistakeIn((R * Math.log10(k2 / k1)) / (1 / T1 - 1 / T2) / 1000, kJmol, "logBase"),
      mistakeIn((R * lnRatio) / (1 / T1 - 1 / T2), kJmol, "energyUnits"),
      mistakeIn(lnRatio / (1 / T1 - 1 / T2) / 1000, kJmol, "gasConstantUnits"),
    ],
    explanation: {
      key: "activationEnergy",
      tex: lines(
        `E_\\mathrm{a} = \\frac{R\\ln(k_2/k_1)}{1/T_1 - 1/T_2}`,
        `= \\frac{8.314 \\times ${sig(lnRatio)}}{1/${sig(T1, 5)} - 1/${sig(T2, 5)}}`,
        `= ${sig(E)}\\,\\mathrm{${kJmol}}`,
      ),
    },
    verify: { kind: "value", value: E },
  };
};

/** A ⇌ B after a temperature jump: τ and K give the forward constant. */
const relaxation: Generator = (rng) => {
  const tau = draw(rng, 1, 50, 1); // µs
  const K = rng.pick([0.2, 0.25, 0.5, 2, 3, 4, 5, 8, 10]);
  const sum = 1e6 / tau; // s⁻¹
  const k = (K * sum) / (1 + K);
  return {
    prompt: { key: "relaxation", tex: lines(`\\mathrm{A} \\rightleftharpoons \\mathrm{B}`, `\\tau = ${tau}\\,\\mathrm{\\mu s}`, `K = ${K}`, asked("k_\\mathrm{r}", S1)) },
    correct: valueIn(k, S1),
    wrong: [
      mistakeIn(sum / (1 + K), S1, "ratioInverted"),
      mistakeIn(sum, S1, "termDropped"),
      mistakeIn(K * sum, S1, "termDropped"),
      mistakeIn((K * tau) / (1 + K), S1, "formulaInverted"),
    ],
    explanation: {
      key: "relaxation",
      tex: lines(
        `k_\\mathrm{r} + k_\\mathrm{r}' = \\frac{1}{\\tau}`,
        `= ${sig(sum)}\\,\\mathrm{${S1}}`,
        `K = \\frac{k_\\mathrm{r}}{k_\\mathrm{r}'}`,
        `k_\\mathrm{r} = \\frac{K}{1 + K}\\cdot\\frac{1}{\\tau}`,
        `= ${sig(k)}\\,\\mathrm{${S1}}`,
      ),
    },
    verify: { kind: "value", value: k },
  };
};

/** Michaelis–Menten rate. */
const michaelisMenten: Generator = (rng) => {
  const vmax = draw(rng, 0.1, 5, 0.1); // mmol dm⁻³ s⁻¹
  const KM = draw(rng, 1, 50, 1); // mmol dm⁻³
  const S = draw(rng, 1, 100, 1);
  const v = (vmax * S) / (KM + S);
  const u = "mmol\\,dm^{-3}\\,s^{-1}";
  return {
    prompt: { key: "michaelisMenten", tex: lines(`v_\\mathrm{max} = ${sig(vmax, 2)}\\,\\mathrm{${u}}`, `K_\\mathrm{M} = ${KM}\\,\\mathrm{mmol\\,dm^{-3}}`, `[\\mathrm{S}]_0 = ${S}\\,\\mathrm{mmol\\,dm^{-3}}`, asked("v", u)) },
    correct: valueIn(v, u),
    wrong: [
      mistakeIn((vmax * S) / KM, u, "termDropped"),
      mistakeIn((vmax * KM) / (KM + S), u, "ratioInverted"),
      mistakeIn((vmax * KM) / S, u, "formulaInverted"),
      ...(S !== KM ? [mistakeIn(vmax / 2, u, "termDropped")] : []),
    ],
    explanation: {
      key: "michaelisMenten",
      tex: lines(
        `v = \\frac{v_\\mathrm{max}[\\mathrm{S}]_0}{K_\\mathrm{M} + [\\mathrm{S}]_0}`,
        `= \\frac{${sig(vmax, 2)} \\times ${S}}{${KM} + ${S}}`,
        `= ${sig(v)}\\,\\mathrm{${u}}`,
      ),
    },
    verify: { kind: "value", value: v },
  };
};

/** Degree of polymerization of a stepwise polymer. */
const polymerization: Generator = (rng) => {
  const p = rng.pick([0.9, 0.95, 0.98, 0.99, 0.995, 0.998, 0.999, 0.8, 0.75, 0.96]);
  const N = 1 / (1 - p);
  return {
    prompt: { key: "polymerization", tex: lines(`p = ${p}`, asked("\\langle N \\rangle", "")) },
    correct: valueIn(N, ""),
    wrong: [
      mistakeIn(p / (1 - p), "", "termDropped"),
      mistakeIn(1 / p, "", "formulaInverted"),
      mistakeIn(1 / (1 - p) ** 2, "", "orderConfused"),
      mistakeIn(Math.sqrt(1 / (1 - p)), "", "orderConfused"),
    ],
    explanation: {
      key: "polymerization",
      tex: lines(
        `\\langle N \\rangle = \\frac{1}{1 - p}`,
        `= \\frac{1}{${sig(1 - p)}}`,
        `= ${sig(N)}`,
      ),
    },
    verify: { kind: "value", value: N },
  };
};

/** Primary quantum yield from an irradiation experiment. */
const quantumYield: Generator = (rng) => {
  const lambda = draw(rng, 300, 600, 10); // nm
  const P = draw(rng, 0.5, 5, 0.1); // W
  const t = draw(rng, 600, 3600, 100); // s
  const f = draw(rng, 0.3, 0.9, 0.05);
  const photons = (P * t * f * lambda * 1e-9) / (PLANCK * LIGHT) / N_A; // mol
  const phi = draw(rng, 0.1, 1.5, 0.05);
  const n = phi * photons * 1e3; // mmol
  return {
    prompt: { key: "quantumYield", tex: lines(`\\lambda = ${lambda}\\,\\mathrm{nm}`, `P = ${sig(P, 2)}\\,\\mathrm{W}`, `t = ${t}\\,\\mathrm{s}`, `f = ${Math.round(f * 100)}\\,\\%`, `n = ${sig(n)}\\,\\mathrm{mmol}`, asked("\\phi", "")) },
    correct: valueIn(phi, ""),
    wrong: [
      mistakeIn(phi * f, "", "termDropped"),
      mistakeIn(1 / phi, "", "formulaInverted"),
      mistakeIn(phi * 1e-9, "", "lengthUnits"),
      mistakeIn(phi / f, "", "termDropped"),
    ],
    explanation: {
      key: "quantumYield",
      tex: lines(
        `n_\\mathrm{abs} = \\frac{fPt\\lambda}{hcN_\\mathrm{A}}`,
        `= ${sig(photons * 1e3)}\\,\\mathrm{mmol}`,
        `\\phi = \\frac{n}{n_\\mathrm{abs}}`,
        `= ${sig(phi)}`,
      ),
    },
    verify: { kind: "value", value: phi },
  };
};

/** Efficiency of resonance energy transfer at distance R. */
const fretEfficiency: Generator = (rng) => {
  const R0 = draw(rng, 2, 7, 0.1); // nm
  let Rd = draw(rng, 1, 10, 0.1);
  if (Math.abs(Rd - R0) < 0.05) Rd = R0 + 1;
  const eta = R0 ** 6 / (R0 ** 6 + Rd ** 6);
  return {
    prompt: { key: "fretEfficiency", tex: lines(`R_0 = ${sig(R0, 2)}\\,\\mathrm{nm}`, `R = ${sig(Rd, 2)}\\,\\mathrm{nm}`, asked("\\eta_\\mathrm{T}", "")) },
    correct: valueIn(eta, ""),
    wrong: [
      mistakeIn(Rd ** 6 / (R0 ** 6 + Rd ** 6), "", "ratioInverted"),
      mistakeIn(R0 / (R0 + Rd), "", "distancePower"),
      mistakeIn(R0 ** 3 / (R0 ** 3 + Rd ** 3), "", "distancePower"),
      mistakeIn(Math.min(1, (R0 / Rd) ** 6), "", "termDropped"),
    ],
    explanation: {
      key: "fretEfficiency",
      tex: lines(
        `\\eta_\\mathrm{T} = \\frac{R_0^6}{R_0^6 + R^6}`,
        `= \\frac{1}{1 + (${sig(Rd, 2)}/${sig(R0, 2)})^6}`,
        `= ${sig(eta)}`,
      ),
    },
    verify: { kind: "value", value: eta },
  };
};

/** Quenching rate constant from lifetimes with and without quencher. */
const sternVolmer: Generator = (rng) => {
  const tau0 = draw(rng, 2, 20, 0.5); // ns
  const kQ = draw(rng, 0.5, 9.5, 0.5) * 1e9; // dm³ mol⁻¹ s⁻¹
  const Q = draw(rng, 1, 50, 1) * 1e-3; // mol dm⁻³
  const tau = 1 / (1 / (tau0 * 1e-9) + kQ * Q) * 1e9; // ns
  const shown = Number(sig(tau, 3));
  const k = (1 / (shown * 1e-9) - 1 / (tau0 * 1e-9)) / Q;
  return {
    prompt: { key: "sternVolmer", tex: lines(`\\tau_0 = ${sig(tau0)}\\,\\mathrm{ns}`, `\\tau = ${sig(tau, 3)}\\,\\mathrm{ns}`, `[\\mathrm{Q}] = ${sig(Q * 1e3)}\\,\\mathrm{mmol\\,dm^{-3}}`, asked("k_\\mathrm{Q}", K2)) },
    correct: choice(valueIn(k, K2)),
    wrong: [
      mistakeIn(1 / (shown * 1e-9) / Q, K2, "termDropped"),
      mistakeIn((tau0 / shown - 1) / Q, K2, "termDropped"),
      mistakeIn(k / 1e3, K2, "volumeUnits"),
      mistakeIn(k * 1e3, K2, "volumeUnits"),
    ].map(choice),
    explanation: {
      key: "sternVolmer",
      tex: lines(
        `\\frac{1}{\\tau} = \\frac{1}{\\tau_0} + k_\\mathrm{Q}[\\mathrm{Q}]`,
        `k_\\mathrm{Q} = \\frac{1/\\tau - 1/\\tau_0}{[\\mathrm{Q}]}`,
        `= ${sig(k)}\\,\\mathrm{${K2}}`,
      ),
    },
    verify: { kind: "value", value: k },
  };
};

// --------------------------------------------------------------- Focus 18

/** Gases for collision theory: σ in nm², molar mass in g mol⁻¹. */
const GASES: { tex: string; sigma: number; M: number }[] = [
  { tex: "H_2", sigma: 0.27, M: 2.016 },
  { tex: "N_2", sigma: 0.43, M: 28.02 },
  { tex: "O_2", sigma: 0.4, M: 32.0 },
  { tex: "CO_2", sigma: 0.52, M: 44.01 },
  { tex: "C_2H_4", sigma: 0.64, M: 28.05 },
  { tex: "Ar", sigma: 0.36, M: 39.95 },
];

/** Collision-theory frequency factor σ(8kT/πμ)^½ N_A for A + B. */
const collisionFactor: Generator = (rng) => {
  const [a, b] = rng.shuffle(GASES).slice(0, 2) as [(typeof GASES)[number], (typeof GASES)[number]];
  const T = draw(rng, 300, 1000, 10);
  const sigma = draw(rng, 0.3, 0.8, 0.01); // nm²
  const mu = (a.M * b.M) / (a.M + b.M) / 1000 / N_A; // kg
  const speed = Math.sqrt((8 * K_B * T) / (Math.PI * mu));
  const A = sigma * 1e-18 * speed * N_A * 1e3; // dm³ mol⁻¹ s⁻¹
  return {
    prompt: { key: "collisionFactor", tex: lines(`\\mathrm{${a.tex}} + \\mathrm{${b.tex}}`, `\\sigma = ${sig(sigma, 2)}\\,\\mathrm{nm^{2}}`, `T = ${T}\\,\\mathrm{K}`, asked("A", K2)) },
    correct: choice(valueIn(A, K2)),
    wrong: [
      mistakeIn(A / 1e3, K2, "volumeUnits"),
      mistakeIn(A * Math.sqrt(mu / (a.M / 1000 / N_A)), K2, "reducedMass"),
      mistakeIn(A / Math.sqrt(1000), K2, "massUnits"),
      mistakeIn(A / N_A, K2, "termDropped"),
    ].map(choice),
    explanation: {
      key: "collisionFactor",
      tex: lines(
        `\\mu = ${sig(mu * N_A * 1000)}\\,\\mathrm{g\\,mol^{-1}}`,
        `\\left(\\frac{8kT}{\\pi\\mu}\\right)^{1/2} = ${sig(speed)}\\,\\mathrm{m\\,s^{-1}}`,
        `A = \\sigma\\left(\\frac{8kT}{\\pi\\mu}\\right)^{1/2}N_\\mathrm{A}`,
        `= ${sig(A)}\\,\\mathrm{${K2}}`,
      ),
    },
    verify: { kind: "value", value: A },
  };
};

/** Viscosities of solvents at 25 °C, mPa s (cP). */
const VISCOSITIES = [0.3, 0.54, 0.6, 0.89, 1.07, 1.2, 1.9, 0.42];

/** Diffusion-controlled rate constant, 8RT/3η, at 25 °C. */
const diffusionLimit: Generator = (rng) => {
  const eta = rng.pick(VISCOSITIES);
  const t = 25;
  const T = t + KELVIN;
  const k = ((8 * R * T) / (3 * eta * 1e-3)) * 1e3; // dm³ mol⁻¹ s⁻¹
  return {
    prompt: { key: "diffusionLimit", tex: lines(`\\eta = ${sig(eta, 2)}\\,\\mathrm{mPa\\,s}`, `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, asked("k_\\mathrm{d}", K2)) },
    correct: choice(valueIn(k, K2)),
    wrong: [
      mistakeIn(k / 1e3, K2, "volumeUnits"),
      mistakeIn(k * 3, K2, "wrongFactor"),
      mistakeIn((k * t) / T, K2, "celsiusForKelvin"),
      mistakeIn((k * K_B) / R, K2, "gasConstantUnits"),
    ].map(choice),
    explanation: {
      key: "diffusionLimit",
      tex: lines(
        `k_\\mathrm{d} = \\frac{8RT}{3\\eta}`,
        `= \\frac{8 \\times 8.314 \\times ${sig(T, 5)}}{3 \\times ${sig(eta, 2)} \\times 10^{-3}}`,
        `= ${sig(k / 1e3)}\\,\\mathrm{m^{3}\\,mol^{-1}\\,s^{-1}}`,
        `= ${sig(k)}\\,\\mathrm{${K2}}`,
      ),
    },
    verify: { kind: "value", value: k },
  };
};

/** Enthalpy of activation of a reaction in solution: Ea − RT. */
const activationEnthalpy: Generator = (rng) => {
  const Ea = draw(rng, 20, 150, 0.5);
  const t = draw(rng, 0, 100, 5);
  const T = t + KELVIN;
  const H = Ea - (R * T) / 1000;
  return {
    prompt: { key: "activationEnthalpy", tex: lines(`E_\\mathrm{a} = ${sig(Ea, 4)}\\,\\mathrm{${kJmol}}`, `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, asked("\\Delta^{\\ddagger}H", kJmol)) },
    correct: valueIn(H, kJmol, 4),
    wrong: [
      mistakeIn(Ea, kJmol, "termDropped", 4),
      mistakeIn(Ea + (R * T) / 1000, kJmol, "signError", 4),
      mistakeIn(Ea - (2 * R * T) / 1000, kJmol, "wrongFactor", 4),
      mistakeIn(Ea - (R * t) / 1000, kJmol, "celsiusForKelvin", 4),
    ],
    explanation: {
      key: "activationEnthalpy",
      tex: lines(
        `\\Delta^{\\ddagger}H = E_\\mathrm{a} - RT`,
        `= ${sig(Ea, 4)} - \\frac{8.314 \\times ${sig(T, 5)}}{1000}`,
        `= ${sig(H, 4)}\\,\\mathrm{${kJmol}}`,
      ),
    },
    verify: { kind: "value", value: H },
  };
};

/** Eyring: first-order rate constant from the Gibbs energy of activation. */
const eyringRate: Generator = (rng) => {
  const G = draw(rng, 50, 110, 1);
  const t = draw(rng, 5, 80, 5);
  const T = t + KELVIN;
  const pre = (K_B * T) / PLANCK;
  const k = pre * Math.exp((-G * 1000) / (R * T));
  return {
    prompt: { key: "eyringRate", tex: lines(`\\Delta^{\\ddagger}G = ${G}\\,\\mathrm{${kJmol}}`, `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, `\\kappa = 1`, asked("k_\\mathrm{r}", S1)) },
    correct: choice(valueIn(k, S1)),
    wrong: shown([
      mistakeIn(pre * 10 ** ((-G * 1000) / (R * T)), S1, "logBase"),
      mistakeIn(pre * 2 * Math.PI * Math.exp((-G * 1000) / (R * T)), S1, "hbarForH"),
      mistakeIn(pre * Math.exp((-G * 1000) / (R * t)), S1, "celsiusForKelvin"),
      mistakeIn(pre * Math.exp(-G / (R * T)), S1, "energyUnits"),
    ]).map(choice),
    explanation: {
      key: "eyringRate",
      tex: lines(
        `k_\\mathrm{r} = \\frac{kT}{h}\\mathrm{e}^{-\\Delta^{\\ddagger}G/RT}`,
        `= ${sig(pre)}\\,\\mathrm{s^{-1}} \\times \\mathrm{e}^{-${sig((G * 1000) / (R * T))}}`,
        `= ${sig(k)}\\,\\mathrm{${S1}}`,
      ),
    },
    verify: { kind: "value", value: k },
  };
};

/** Kinetic salt effect in water at 25 °C: log k = log k° + 2Az_Az_B√I. */
const saltEffect: Generator = (rng) => {
  const k0 = draw(rng, 1, 9.9, 0.1);
  const [zA, zB] = rng.pick([[1, 1], [1, -1], [2, 1], [2, -1], [1, -2], [2, 2], [-1, -1], [3, -1]] as [number, number][]);
  const I = draw(rng, 0.001, 0.05, 0.001);
  const A = 0.509;
  const x = 2 * A * zA * zB * Math.sqrt(I);
  const k = k0 * 10 ** x;
  const z = (n: number): string => (n > 0 ? `+${n}` : `${n}`);
  return {
    prompt: { key: "saltEffect", tex: lines(`k_\\mathrm{r}^{\\circ} = ${sig(k0, 2)}\\,\\mathrm{${K2}}`, `z_\\mathrm{A} = ${z(zA)}`, `z_\\mathrm{B} = ${z(zB)}`, `I = ${sig(I)}`, asked("k_\\mathrm{r}", K2)) },
    correct: valueIn(k, K2),
    wrong: [
      mistakeIn(k0 * Math.exp(x), K2, "lnForLog"),
      mistakeIn(k0 * 10 ** (2 * A * zA * zB * I), K2, "sqrtForgotten"),
      mistakeIn(k0 * 10 ** -x, K2, "signError"),
      mistakeIn(k0 * 10 ** (x / 2), K2, "wrongFactor"),
    ],
    explanation: {
      key: "saltEffect",
      tex: lines(
        `\\log k_\\mathrm{r} = \\log k_\\mathrm{r}^{\\circ}`,
        `+ 2Az_\\mathrm{A}z_\\mathrm{B}I^{1/2}`,
        `= ${sig(Math.log10(k0))} + 2 \\times 0.509`,
        `\\times (${zA * zB}) \\times ${sig(Math.sqrt(I))}`,
        `k_\\mathrm{r} = ${sig(k)}\\,\\mathrm{${K2}}`,
      ),
    },
    verify: { kind: "value", value: k },
  };
};

/** Primary kinetic isotope effect: k(C–D)/k(C–H) = e^(−ζ). */
const isotopeEffect: Generator = (rng) => {
  const nu = draw(rng, 2800, 3100, 10); // cm⁻¹
  const t = draw(rng, 0, 100, 5);
  const T = t + KELVIN;
  const muCH = (12 * 1) / 13;
  const muCD = (12 * 2) / 14;
  const half = (PLANCK * LIGHT * nu * 100) / (2 * K_B * T); // ħω/2kT
  const zeta = half * (1 - Math.sqrt(muCH / muCD));
  const ratio = Math.exp(-zeta);
  return {
    prompt: { key: "isotopeEffect", tex: lines(`\\tilde{\\nu}(\\mathrm{C{-}H}) = ${nu}\\,\\mathrm{cm^{-1}}`, `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, asked("k_\\mathrm{r}(\\mathrm{C{-}D})/k_\\mathrm{r}(\\mathrm{C{-}H})", "")) },
    correct: valueIn(ratio, ""),
    wrong: [
      mistakeIn(Math.exp(-half * (1 - Math.SQRT1_2)), "", "reducedMass"),
      mistakeIn(Math.exp(zeta), "", "signError"),
      mistakeIn(Math.exp(-2 * zeta), "", "wrongFactor"),
      mistakeIn(Math.exp(-zeta / (2 * Math.PI)), "", "hbarForH"),
    ],
    explanation: {
      key: "isotopeEffect",
      tex: lines(
        `\\zeta = \\frac{hc\\tilde{\\nu}}{2kT}\\left\\{1 - \\left(\\frac{\\mu_\\mathrm{CH}}{\\mu_\\mathrm{CD}}\\right)^{1/2}\\right\\}`,
        `= ${sig(half)} \\times ${sig(1 - Math.sqrt(muCH / muCD))}`,
        `= ${sig(zeta)}`,
        `\\mathrm{e}^{-\\zeta} = ${sig(ratio)}`,
      ),
    },
    verify: { kind: "value", value: ratio },
  };
};

/** Marcus: Gibbs energy of activation of an electron transfer. */
const marcusBarrier: Generator = (rng) => {
  const ER = draw(rng, 40, 200, 5); // kJ mol⁻¹
  let G = draw(rng, -250, 50, 5);
  if (G === -ER || G === 0) G -= 10;
  const barrier = (G + ER) ** 2 / (4 * ER);
  return {
    prompt: { key: "marcusBarrier", tex: lines(`\\Delta_\\mathrm{r}G^{\\ominus} = ${G}\\,\\mathrm{${kJmol}}`, `\\Delta E_\\mathrm{R} = ${ER}\\,\\mathrm{${kJmol}}`, asked("\\Delta^{\\ddagger}G", kJmol)) },
    correct: valueIn(barrier, kJmol),
    wrong: [
      mistakeIn((G - ER) ** 2 / (4 * ER), kJmol, "signError"),
      mistakeIn((G + ER) ** 2 / (2 * ER), kJmol, "wrongFactor"),
      mistakeIn(ER / 4, kJmol, "termDropped"),
      mistakeIn((G * G + ER * ER) / (4 * ER), kJmol, "termDropped"),
    ],
    explanation: {
      key: "marcusBarrier",
      tex: lines(
        `\\Delta^{\\ddagger}G = \\frac{(\\Delta_\\mathrm{r}G^{\\ominus} + \\Delta E_\\mathrm{R})^2}{4\\Delta E_\\mathrm{R}}`,
        `= \\frac{(${G} + ${ER})^2}{4 \\times ${ER}}`,
        `= ${sig(barrier)}\\,\\mathrm{${kJmol}}`,
      ),
    },
    verify: { kind: "value", value: barrier },
  };
};

export const kinetics = {
  chemistry: {
    firstOrderConcentration,
    firstOrderHalfLife,
    secondOrderConcentration,
    secondOrderHalfLife,
    arrheniusRatio,
    activationEnergy,
    relaxation,
    michaelisMenten,
    polymerization,
    quantumYield,
    fretEfficiency,
    sternVolmer,
  },
};

export const dynamics = {
  chemistry: {
    collisionFactor,
    diffusionLimit,
    activationEnthalpy,
    eyringRate,
    saltEffect,
    isotopeEffect,
    marcusBarrier,
  },
};
