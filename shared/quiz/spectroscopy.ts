/**
 * Physical chemistry, Focuses 11–12: molecular spectroscopy and magnetic
 * resonance (Atkins Topics 11A–12D). The Beer–Lambert law, linewidths,
 * rotational and vibrational spectra, normal modes; NMR and EPR frequencies,
 * shifts, multiplets, relaxation and spin densities.
 *
 * Every given has its own row and every explanation one equality per row, so
 * that the questions and their corrections fit a phone.
 */
import { lines } from "./tex";
import { K_B, KELVIN, N_A, asked, draw, mistakeIn, sig, valueIn } from "./units";
import { AMU, DIATOMICS, HBAR, LIGHT, PLANCK, reduced } from "./quantum";
import type { Generator, MistakeKey, Option } from "./types";

const cm1 = "cm^{-1}";
const whole = (n: number, mistake?: MistakeKey): Option => ({ tex: String(n), num: n, ...(mistake ? { mistake } : {}) });

// --------------------------------------------------------------- Focus 11

/** Transmittance from the Beer–Lambert law, in per cent. */
const beerLambert: Generator = (rng) => {
  const eps = draw(rng, 50, 900, 10); // dm³ mol⁻¹ cm⁻¹
  const c = draw(rng, 0.1, 5, 0.1); // mmol dm⁻³
  const L = rng.pick([0.5, 1, 2, 5]); // cm
  const A = eps * c * 1e-3 * L;
  const T = 100 * 10 ** -A;
  return {
    prompt: {
      key: "beerLambert",
      tex: lines(`\\varepsilon = ${eps}\\,\\mathrm{dm^{3}\\,mol^{-1}\\,cm^{-1}}`, `[\\mathrm{J}] = ${sig(c, 2)}\\,\\mathrm{mmol\\,dm^{-3}}`, `L = ${L}\\,\\mathrm{cm}`, asked("T", "\\%")),
    },
    correct: valueIn(T, "\\%"),
    wrong: [
      mistakeIn(100 * Math.exp(-A), "\\%", "lnForLog"),
      mistakeIn(100 - T, "\\%", "formulaInverted"),
      mistakeIn(100 * 10 ** (-A / 10), "\\%", "lengthUnits"),
      mistakeIn(100 * 10 ** (-A * 1000), "\\%", "volumeUnits"),
    ].filter((o) => o.num! > 1e-6),
    explanation: {
      key: "beerLambert",
      tex: lines(`A = \\varepsilon[\\mathrm{J}]L`, `= ${eps} \\times ${sig(c * 1e-3, 2)} \\times ${L}`, `= ${sig(A)}`, `T = 10^{-A} = ${sig(T)}\\,\\%`),
    },
    verify: { kind: "value", value: T },
  };
};

/** Frequency of the rotational line J → J + 1, in GHz. */
const rotationalLine: Generator = (rng) => {
  const d = rng.pick(DIATOMICS);
  const mu = reduced(d.mA, d.mB) * AMU;
  const B = HBAR / (4 * Math.PI * LIGHT * 100 * mu * (d.R * 1e-12) ** 2); // cm⁻¹
  const Bshown = Number(sig(B, 4));
  const J = rng.int(0, 6);
  const nu = 2 * Bshown * (J + 1) * LIGHT * 100 / 1e9; // GHz
  return {
    prompt: { key: "rotationalLine", tex: lines(`\\mathrm{${d.tex}}:\\ \\tilde{B} = ${sig(B, 4)}\\,\\mathrm{${cm1}}`, `J = ${J} \\to ${J + 1}`, asked("\\nu", "GHz")) },
    correct: valueIn(nu, "GHz"),
    wrong: [
      mistakeIn(nu / 100, "GHz", "lengthUnits"),
      mistakeIn(nu / 2, "GHz", "wrongFactor"),
      mistakeIn(4 * Bshown * (J + 1.5) * LIGHT * 100 / 1e9, "GHz", "selectionRuleConfused"),
      ...(J > 0 ? [mistakeIn(2 * Bshown * J * LIGHT * 100 / 1e9, "GHz", "termDropped")] : []),
    ],
    explanation: {
      key: "rotationalLine",
      tex: lines(`\\tilde{\\nu} = 2\\tilde{B}(J + 1)`, `= ${sig(2 * Bshown * (J + 1), 4)}\\,\\mathrm{${cm1}}`, `\\nu = c\\tilde{\\nu}`, `= ${sig(nu)}\\,\\mathrm{GHz}`),
    },
    verify: { kind: "value", value: nu },
  };
};

/** Bond length from the rotational constant of a diatomic, pm. */
const bondLength: Generator = (rng) => {
  const d = rng.pick(DIATOMICS);
  const mu = reduced(d.mA, d.mB) * AMU;
  const B = Number(sig(HBAR / (4 * Math.PI * LIGHT * 100 * mu * (d.R * 1e-12) ** 2), 4));
  const R = Math.sqrt(HBAR / (4 * Math.PI * LIGHT * 100 * B * mu)) * 1e12;
  return {
    prompt: { key: "bondLength", tex: lines(`\\mathrm{${d.tex}}`, `\\tilde{B} = ${sig(B, 4)}\\,\\mathrm{${cm1}}`, asked("R", "pm")) },
    correct: valueIn(R, "pm"),
    wrong: [
      mistakeIn(R * Math.sqrt(mu / ((d.mA + d.mB) * AMU)), "pm", "reducedMass"),
      mistakeIn(R * 10, "pm", "lengthUnits"),
      mistakeIn(R * Math.sqrt(2 * Math.PI), "pm", "hbarForH"),
      mistakeIn(R * R / 100, "pm", "sqrtForgotten"),
    ],
    explanation: {
      key: "bondLength",
      tex: lines(`\\mu = ${sig(reduced(d.mA, d.mB), 4)}\\,m_\\mathrm{u}`, `I = \\frac{\\hbar}{4\\pi c\\tilde{B}}`, `= ${sig(HBAR / (4 * Math.PI * LIGHT * 100 * B))}\\,\\mathrm{kg\\,m^{2}}`, `R = (I/\\mu)^{1/2} = ${sig(R)}\\,\\mathrm{pm}`),
    },
    verify: { kind: "value", value: R },
  };
};

/** Stokes line of a rotational Raman spectrum: shift for J → J + 2. */
const ramanShift: Generator = (rng) => {
  const B = draw(rng, 0.3, 12, 0.01);
  const J = rng.int(0, 8);
  const shift = 4 * B * (J + 1.5);
  return {
    prompt: { key: "ramanShift", tex: lines(`\\tilde{B} = ${sig(B)}\\,\\mathrm{${cm1}}`, `J = ${J} \\to ${J + 2}`, asked("|\\Delta\\tilde{\\nu}|", cm1)) },
    correct: valueIn(shift, cm1),
    wrong: [
      mistakeIn(2 * B * (J + 1), cm1, "selectionRuleConfused"),
      mistakeIn(4 * B * (J + 1), cm1, "termDropped"),
      mistakeIn(2 * B * (J + 1.5), cm1, "wrongFactor"),
      mistakeIn(B * ((J + 2) * (J + 3)), cm1, "termDropped"),
    ],
    explanation: {
      key: "ramanShift",
      tex: lines(`\\Delta\\tilde{\\nu} = F(J + 2) - F(J)`, `= 4\\tilde{B}(J + \\tfrac{3}{2})`, `= ${sig(shift)}\\,\\mathrm{${cm1}}`),
    },
    verify: { kind: "value", value: shift },
  };
};

/** Most populated rotational level of a linear molecule. */
const mostPopulatedJ: Generator = (rng) => {
  const B = draw(rng, 0.2, 20, 0.1);
  const T = draw(rng, 100, 1000, 10);
  const x = (K_B * T) / (2 * PLANCK * LIGHT * 100 * B);
  const Jmax = Math.max(0, Math.round(Math.sqrt(x) - 0.5));
  const near = (v: number): number => Math.max(0, Math.round(v));
  return {
    prompt: { key: "mostPopulatedJ", tex: lines(`\\tilde{B} = ${sig(B)}\\,\\mathrm{${cm1}}`, `T = ${T}\\,\\mathrm{K}`, asked("J_\\mathrm{max}", "")) },
    correct: whole(Jmax),
    wrong: [
      whole(near(Math.sqrt(2 * x) - 0.5), "wrongFactor"),
      whole(near(x), "sqrtForgotten"),
      whole(0, "termDropped"),
      whole(Jmax + 2, "wrongFactor"),
    ],
    explanation: {
      key: "mostPopulatedJ",
      tex: lines(`J_\\mathrm{max} \\approx \\left(\\frac{kT}{2hc\\tilde{B}}\\right)^{1/2} - \\tfrac{1}{2}`, `= ${sig(Math.sqrt(x) - 0.5)}`, `\\approx ${Jmax}`),
    },
    verify: { kind: "value", value: Jmax },
  };
};

/** Fundamental or first overtone of an anharmonic oscillator. */
const anharmonicLine: Generator = (rng) => {
  const nu = draw(rng, 500, 4000, 10);
  const xe = draw(rng, 0.005, 0.03, 0.001);
  const overtone = rng.int(0, 1) === 1;
  const value = overtone ? 2 * nu - 6 * xe * nu : nu - 2 * xe * nu;
  return {
    prompt: { key: overtone ? "anharmonicOvertone" : "anharmonicFundamental", tex: lines(`\\tilde{\\nu} = ${nu}\\,\\mathrm{${cm1}}`, `x_\\mathrm{e} = ${sig(xe, 2)}`, asked(overtone ? "\\tilde{\\nu}(0 \\to 2)" : "\\tilde{\\nu}(0 \\to 1)", cm1)) },
    correct: valueIn(value, cm1, 4),
    wrong: overtone
      ? [mistakeIn(2 * nu, cm1, "termDropped", 4), mistakeIn(2 * (nu - 2 * xe * nu), cm1, "wrongFactor", 4), mistakeIn(2 * nu - 2 * xe * nu, cm1, "wrongFactor", 4), mistakeIn(2 * nu + 6 * xe * nu, cm1, "signError", 4)]
      : [mistakeIn(nu, cm1, "termDropped", 4), mistakeIn(nu - xe * nu, cm1, "wrongFactor", 4), mistakeIn(nu + 2 * xe * nu, cm1, "signError", 4)],
    explanation: {
      key: overtone ? "anharmonicOvertone" : "anharmonicFundamental",
      tex: overtone
        ? lines(`G(2) - G(0) = 2\\tilde{\\nu} - 6x_\\mathrm{e}\\tilde{\\nu}`, `= ${sig(value, 4)}\\,\\mathrm{${cm1}}`)
        : lines(`G(1) - G(0) = \\tilde{\\nu} - 2x_\\mathrm{e}\\tilde{\\nu}`, `= ${sig(value, 4)}\\,\\mathrm{${cm1}}`),
    },
    verify: { kind: "value", value },
  };
};

/** Morse dissociation energy D̃₀ from ν̃ and x_e. */
const dissociationEnergy: Generator = (rng) => {
  const nu = draw(rng, 500, 4000, 10);
  const xe = draw(rng, 0.005, 0.03, 0.001);
  const De = nu / (4 * xe);
  const G0 = nu / 2 - (xe * nu) / 4;
  const D0 = De - G0;
  return {
    prompt: { key: "dissociationEnergy", tex: lines(`\\tilde{\\nu} = ${nu}\\,\\mathrm{${cm1}}`, `x_\\mathrm{e} = ${sig(xe, 2)}`, asked("\\tilde{D}_0", cm1)) },
    correct: valueIn(D0, cm1, 4),
    wrong: [
      mistakeIn(De, cm1, "termDropped", 4),
      mistakeIn(De + G0, cm1, "signError", 4),
      mistakeIn(nu / (2 * xe) - G0, cm1, "wrongFactor", 4),
      mistakeIn(4 * xe * nu, cm1, "formulaInverted", 4),
    ],
    explanation: {
      key: "dissociationEnergy",
      tex: lines(`\\tilde{D}_\\mathrm{e} = \\frac{\\tilde{\\nu}}{4x_\\mathrm{e}}`, `= ${sig(De, 4)}\\,\\mathrm{${cm1}}`, `G(0) = \\tfrac{1}{2}\\tilde{\\nu} - \\tfrac{1}{4}x_\\mathrm{e}\\tilde{\\nu}`, `= ${sig(G0, 4)}\\,\\mathrm{${cm1}}`, `\\tilde{D}_0 = \\tilde{D}_\\mathrm{e} - G(0)`, `= ${sig(D0, 4)}\\,\\mathrm{${cm1}}`),
    },
    verify: { kind: "value", value: D0 },
  };
};

/** Molecules: formula, number of atoms, linear or not. */
const MOLECULES: { tex: string; N: number; linear: boolean }[] = [
  { tex: "CO_2", N: 3, linear: true },
  { tex: "H_2O", N: 3, linear: false },
  { tex: "HCN", N: 3, linear: true },
  { tex: "C_2H_2", N: 4, linear: true },
  { tex: "NH_3", N: 4, linear: false },
  { tex: "CH_4", N: 5, linear: false },
  { tex: "C_6H_6", N: 12, linear: false },
  { tex: "SF_6", N: 7, linear: false },
  { tex: "C_2H_4", N: 6, linear: false },
  { tex: "N_2O", N: 3, linear: true },
  { tex: "CS_2", N: 3, linear: true },
  { tex: "C_4H_2", N: 6, linear: true },
];

/** Number of normal modes: 3N − 6, or 3N − 5 when linear. */
const normalModes: Generator = (rng) => {
  const m = rng.pick(MOLECULES);
  const n = 3 * m.N - (m.linear ? 5 : 6);
  return {
    prompt: { key: "normalModes", tex: `\\mathrm{${m.tex}}` },
    correct: whole(n),
    wrong: [whole(3 * m.N - (m.linear ? 6 : 5), "linearityConfused"), whole(3 * m.N, "termDropped"), whole(3 * m.N - 3, "termDropped"), whole(m.N - 1, "termDropped")],
    explanation: {
      key: "normalModes",
      tex: lines(`N = ${m.N}`, m.linear ? `3N - 5 = ${n}` : `3N - 6 = ${n}`),
    },
    verify: { kind: "value", value: n },
  };
};

/** Doppler linewidth of a gas-phase line, MHz. */
const dopplerWidth: Generator = (rng) => {
  const lambda = draw(rng, 200, 800, 10); // nm
  const M = draw(rng, 2, 200, 1); // g mol⁻¹
  const t = draw(rng, 20, 500, 10);
  const T = t + KELVIN;
  const m = (M / 1000) / N_A;
  const nu = LIGHT / (lambda * 1e-9);
  const width = ((2 * nu) / LIGHT) * Math.sqrt((2 * K_B * T * Math.LN2) / m) / 1e6; // MHz
  return {
    prompt: { key: "dopplerWidth", tex: lines(`\\lambda = ${lambda}\\,\\mathrm{nm}`, `M = ${M}\\,\\mathrm{g\\,mol^{-1}}`, `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, asked("\\delta\\nu", "MHz")) },
    correct: valueIn(width, "MHz"),
    wrong: [
      mistakeIn(width / Math.sqrt(1000), "MHz", "massUnits"),
      mistakeIn(width * Math.sqrt(t / T), "MHz", "celsiusForKelvin"),
      mistakeIn(width / Math.sqrt(Math.LN2), "MHz", "termDropped"),
      mistakeIn(width / 2, "MHz", "wrongFactor"),
    ],
    explanation: {
      key: "dopplerWidth",
      tex: lines(`\\delta\\nu = \\frac{2\\nu}{c}\\left(\\frac{2kT\\ln 2}{m}\\right)^{1/2}`, `\\nu = c/\\lambda = ${sig(nu)}\\,\\mathrm{Hz}`, `m = ${sig(m)}\\,\\mathrm{kg}`, `\\delta\\nu = ${sig(width)}\\,\\mathrm{MHz}`),
    },
    verify: { kind: "value", value: width },
  };
};

/** Lifetime broadening: δν̃ = 1/(2πcτ). */
const lifetimeWidth: Generator = (rng) => {
  const tau = draw(rng, 0.1, 100, 0.1); // ps
  const width = 1 / (2 * Math.PI * LIGHT * 100 * tau * 1e-12); // cm⁻¹
  return {
    prompt: { key: "lifetimeWidth", tex: lines(`\\tau = ${sig(tau)}\\,\\mathrm{ps}`, asked("\\delta\\tilde{\\nu}", cm1)) },
    correct: valueIn(width, cm1),
    wrong: [
      mistakeIn(width * 2 * Math.PI, cm1, "hbarForH"),
      mistakeIn(width / 100, cm1, "lengthUnits"),
      mistakeIn(tau / 5.31, cm1, "formulaInverted"),
      mistakeIn(width * 1000, cm1, "timeUnits"),
    ],
    explanation: {
      key: "lifetimeWidth",
      tex: lines(`\\delta\\tilde{\\nu} = \\frac{1}{2\\pi c\\tau}`, `= \\frac{5.31\\,\\mathrm{${cm1}}}{\\tau/\\mathrm{ps}}`, `= ${sig(width)}\\,\\mathrm{${cm1}}`),
    },
    verify: { kind: "value", value: width },
  };
};

// --------------------------------------------------------------- Focus 12

/** Magnetogyric ratios, 10⁷ T⁻¹ s⁻¹. */
const NUCLEI: { tex: string; gamma: number }[] = [
  { tex: "^{1}H", gamma: 26.752 },
  { tex: "^{13}C", gamma: 6.728 },
  { tex: "^{19}F", gamma: 25.18 },
  { tex: "^{31}P", gamma: 10.84 },
  { tex: "^{2}H", gamma: 4.107 },
];

/** Larmor frequency, MHz. */
const larmorFrequency: Generator = (rng) => {
  const n = rng.pick(NUCLEI);
  const B = rng.pick([4.7, 7.05, 9.4, 11.7, 14.1, 18.8, 23.5]);
  const nu = (n.gamma * 1e7 * B) / (2 * Math.PI) / 1e6;
  return {
    prompt: { key: "larmorFrequency", tex: lines(`\\mathrm{${n.tex}}`, `\\gamma = ${n.gamma} \\times 10^{7}\\,\\mathrm{T^{-1}\\,s^{-1}}`, `\\mathcal{B}_0 = ${B}\\,\\mathrm{T}`, asked("\\nu_\\mathrm{L}", "MHz")) },
    correct: valueIn(nu, "MHz"),
    wrong: [
      mistakeIn(nu * 2 * Math.PI, "MHz", "hbarForH"),
      mistakeIn(nu / (2 * Math.PI), "MHz", "wrongFactor"),
      mistakeIn((n.gamma * 1e7 * B * 2 * Math.PI) / 1e6, "MHz", "formulaInverted"),
      mistakeIn(nu / 10, "MHz", "wrongFactor"),
    ],
    explanation: {
      key: "larmorFrequency",
      tex: lines(`\\gamma\\mathcal{B}_0 = ${sig(2 * Math.PI * nu * 1e6, 3)}\\,\\mathrm{s^{-1}}`, `\\nu_\\mathrm{L} = \\frac{\\gamma\\mathcal{B}_0}{2\\pi}`, `= ${sig(nu)}\\,\\mathrm{MHz}`),
    },
    verify: { kind: "value", value: nu },
  };
};

/** Separation in hertz of two peaks given in ppm. */
const shiftInHertz: Generator = (rng) => {
  const nu0 = rng.pick([60, 200, 300, 400, 500, 600, 800, 900]);
  const d1 = draw(rng, 0.5, 9, 0.05);
  let d2 = draw(rng, 0.5, 9, 0.05);
  if (Math.abs(d1 - d2) < 0.1) d2 = d1 + 1.2;
  const dd = Math.abs(d1 - d2);
  const hz = dd * nu0;
  return {
    prompt: { key: "shiftInHertz", tex: lines(`\\delta_1 = ${sig(d1)}`, `\\delta_2 = ${sig(d2)}`, `\\nu_0 = ${nu0}\\,\\mathrm{MHz}`, asked("\\Delta\\nu", "Hz")) },
    correct: valueIn(hz, "Hz"),
    wrong: [
      mistakeIn(hz / 100, "Hz", "ppmConfused"),
      mistakeIn(hz * 1e4, "Hz", "ppmConfused"),
      mistakeIn(dd / nu0, "Hz", "formulaInverted"),
      mistakeIn((d1 + d2) * nu0, "Hz", "signError"),
    ],
    explanation: {
      key: "shiftInHertz",
      tex: lines(`\\Delta\\nu = \\Delta\\delta \\times 10^{-6} \\times \\nu_0`, `= ${sig(dd)} \\times ${nu0}\\,\\mathrm{Hz}`, `= ${sig(hz)}\\,\\mathrm{Hz}`),
    },
    verify: { kind: "value", value: hz },
  };
};

/** Lines from N equivalent nuclei of spin I: 2NI + 1. */
const multiplet: Generator = (rng) => {
  const nuc = rng.pick([
    { tex: "^{1}H", I: 0.5 },
    { tex: "^{1}H", I: 0.5 },
    { tex: "^{14}N", I: 1 },
    { tex: "^{2}H", I: 1 },
    { tex: "^{19}F", I: 0.5 },
  ]);
  const N = rng.int(2, nuc.I === 1 ? 3 : 6);
  const lines_ = 2 * N * nuc.I + 1;
  const epr = rng.int(0, 1) === 1;
  return {
    prompt: { key: epr ? "multipletEPR" : "multipletNMR", tex: lines(`${N} \\times \\mathrm{${nuc.tex}}`, `I = ${nuc.I === 1 ? "1" : "\\tfrac{1}{2}"}`) },
    correct: whole(lines_),
    wrong: [
      whole(N + 1, nuc.I === 1 ? "nuclearSpinIgnored" : "termDropped"),
      whole(Math.round((2 * nuc.I + 1) ** N), "equivalenceIgnored"),
      whole(N, "termDropped"),
      whole(2 * N + 2, "wrongFactor"),
    ],
    explanation: {
      key: "multiplet",
      tex: lines(`2NI + 1 = 2 \\times ${N} \\times ${nuc.I === 1 ? "1" : "\\tfrac{1}{2}"} + 1`, `= ${lines_}`),
    },
    verify: { kind: "value", value: lines_ },
  };
};

/** Population excess of the lower level, in parts per million. */
const populationExcess: Generator = (rng) => {
  const n = rng.pick(NUCLEI.slice(0, 4));
  const B = rng.pick([4.7, 9.4, 11.7, 14.1, 18.8, 23.5]);
  const t = draw(rng, 0, 50, 5);
  const T = t + KELVIN;
  const excess = ((n.gamma * 1e7 * HBAR * B) / (2 * K_B * T)) * 1e6;
  return {
    prompt: { key: "populationExcess", tex: lines(`\\mathrm{${n.tex}}`, `\\gamma = ${n.gamma} \\times 10^{7}\\,\\mathrm{T^{-1}\\,s^{-1}}`, `\\mathcal{B}_0 = ${B}\\,\\mathrm{T}`, `\\theta = ${t}\\,\\mathrm{{}^{\\circ}C}`, asked("(N_\\alpha - N_\\beta)/N", "ppm")) },
    correct: valueIn(excess, "ppm"),
    wrong: shownOptions([
      mistakeIn(excess * 2 * Math.PI, "ppm", "hbarForH"),
      mistakeIn(excess * 2, "ppm", "wrongFactor"),
      mistakeIn(t > 0 ? (excess * T) / t : NaN, "ppm", "celsiusForKelvin"),
      mistakeIn(excess / 1e6, "ppm", "ppmConfused"),
    ]),
    explanation: {
      key: "populationExcess",
      tex: lines(`\\frac{N_\\alpha - N_\\beta}{N} \\approx \\frac{\\gamma\\hbar\\mathcal{B}_0}{2kT}`, `= ${sig(excess / 1e6)}`, `= ${sig(excess)}\\,\\mathrm{ppm}`),
    },
    verify: { kind: "value", value: excess },
  };
};
const shownOptions = (options: Option[]): Option[] => options.filter((o) => Number.isFinite(o.num!));

/** g-value of a radical from its EPR resonance. */
const gValue: Generator = (rng) => {
  const nu = draw(rng, 9.2, 9.8, 0.01); // GHz
  const g = draw(rng, 1.98, 2.06, 0.0001);
  const B = (PLANCK * nu * 1e9) / (9.274e-24 * g) * 1e3; // mT
  const Bshown = Number(sig(B, 5));
  const value = (PLANCK * nu * 1e9) / (9.274e-24 * Bshown * 1e-3);
  return {
    prompt: { key: "gValue", tex: lines(`\\nu = ${sig(nu, 3)}\\,\\mathrm{GHz}`, `\\mathcal{B} = ${sig(B, 5)}\\,\\mathrm{mT}`, asked("g", "")) },
    correct: valueIn(value, "", 5),
    wrong: [
      mistakeIn(value / 1000, "", "fieldUnits", 5),
      mistakeIn(value / (2 * Math.PI), "", "hbarForH", 5),
      mistakeIn(1 / value, "", "formulaInverted", 5),
      mistakeIn(value * 1000, "", "fieldUnits", 5),
    ],
    explanation: {
      key: "gValue",
      tex: lines(
        `h\\nu = ${sig(PLANCK * nu * 1e9, 5)}\\,\\mathrm{J}`,
        `\\mu_\\mathrm{B}\\mathcal{B} = ${sig(9.274e-24 * Bshown * 1e-3, 5)}\\,\\mathrm{J}`,
        `g = \\frac{h\\nu}{\\mu_\\mathrm{B}\\mathcal{B}} = ${sig(value, 5)}`,
      ),
    },
    verify: { kind: "value", value },
  };
};

/** McConnell: spin density from a proton hyperfine constant. */
const spinDensity: Generator = (rng) => {
  const a = draw(rng, 0.1, 2, 0.01); // mT
  const rho = a / 2.25;
  return {
    prompt: { key: "spinDensity", tex: lines(`a = ${sig(a)}\\,\\mathrm{mT}`, `Q = 2.25\\,\\mathrm{mT}`, asked("\\rho", "")) },
    correct: valueIn(rho, ""),
    wrong: [
      mistakeIn(a * 2.25, "", "formulaInverted"),
      mistakeIn(2.25 / a, "", "ratioInverted"),
      mistakeIn(rho / 6, "", "wrongFactor"),
      mistakeIn(rho * 1000, "", "fieldUnits"),
    ],
    explanation: { key: "spinDensity", tex: lines(`a = Q\\rho`, `\\rho = \\frac{a}{Q} = \\frac{${sig(a)}}{2.25}`, `= ${sig(rho)}`) },
    verify: { kind: "value", value: rho },
  };
};

/** Lifetime of each site at the coalescence of two lines, ms. */
const coalescence: Generator = (rng) => {
  const dv = draw(rng, 10, 500, 5); // Hz
  const tau = (Math.SQRT2 / (Math.PI * dv)) * 1e3; // ms
  return {
    prompt: { key: "coalescence", tex: lines(`\\delta\\nu = ${dv}\\,\\mathrm{Hz}`, asked("\\tau", "ms")) },
    correct: valueIn(tau, "ms"),
    wrong: [
      mistakeIn(tau / Math.SQRT2, "ms", "termDropped"),
      mistakeIn(1000 / dv, "ms", "termDropped"),
      mistakeIn(tau / 1000, "ms", "timeUnits"),
      mistakeIn(tau / 2, "ms", "wrongFactor"),
    ],
    explanation: { key: "coalescence", tex: lines(`\\tau = \\frac{2^{1/2}}{\\pi\\delta\\nu}`, `= \\frac{1.414}{\\pi \\times ${dv}}\\,\\mathrm{s}`, `= ${sig(tau)}\\,\\mathrm{ms}`) },
    verify: { kind: "value", value: tau },
  };
};

/** Linewidth from the transverse relaxation time. */
const t2Linewidth: Generator = (rng) => {
  const T2 = draw(rng, 5, 2000, 5); // ms
  const width = 1 / (Math.PI * T2 * 1e-3);
  return {
    prompt: { key: "t2Linewidth", tex: lines(`T_2 = ${T2}\\,\\mathrm{ms}`, asked("\\Delta\\nu_{1/2}", "Hz")) },
    correct: valueIn(width, "Hz"),
    wrong: [
      mistakeIn(1 / (T2 * 1e-3), "Hz", "termDropped"),
      mistakeIn(1 / (2 * Math.PI * T2 * 1e-3), "Hz", "wrongFactor"),
      mistakeIn(width / 1000, "Hz", "timeUnits"),
      mistakeIn((T2 * 1e-3) / Math.PI, "Hz", "formulaInverted"),
    ],
    explanation: { key: "t2Linewidth", tex: lines(`\\Delta\\nu_{1/2} = \\frac{1}{\\pi T_2}`, `= \\frac{1}{\\pi \\times ${sig(T2 * 1e-3)}\\,\\mathrm{s}}`, `= ${sig(width)}\\,\\mathrm{Hz}`) },
    verify: { kind: "value", value: width },
  };
};

/** T₁ from the zero crossing of an inversion-recovery experiment. */
const inversionRecovery: Generator = (rng) => {
  const zero = draw(rng, 0.05, 5, 0.01); // s
  const T1 = zero / Math.LN2;
  return {
    prompt: { key: "inversionRecovery", tex: lines(`\\tau_\\mathrm{null} = ${sig(zero)}\\,\\mathrm{s}`, asked("T_1", "s")) },
    correct: valueIn(T1, "s"),
    wrong: [
      mistakeIn(zero, "s", "termDropped"),
      mistakeIn(zero * Math.LN2, "s", "formulaInverted"),
      mistakeIn(zero / Math.log10(2), "s", "logBase"),
      mistakeIn(zero / 2, "s", "wrongFactor"),
    ],
    explanation: { key: "inversionRecovery", tex: lines(`M_z = M_0(1 - 2\\mathrm{e}^{-\\tau/T_1}) = 0`, `\\tau_\\mathrm{null} = T_1\\ln 2`, `T_1 = \\frac{${sig(zero)}}{0.693}\\,\\mathrm{s} = ${sig(T1)}\\,\\mathrm{s}`) },
    verify: { kind: "value", value: T1 },
  };
};

export const spectroscopy = {
  chemistry: { beerLambert, rotationalLine, bondLength, ramanShift, mostPopulatedJ, anharmonicLine, dissociationEnergy, normalModes, dopplerWidth, lifetimeWidth },
};

export const resonance = {
  chemistry: { larmorFrequency, shiftInHertz, multiplet, populationExcess, gValue, spinDensity, coalescence, t2Linewidth, inversionRecovery },
};
