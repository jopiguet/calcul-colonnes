/**
 * Physical chemistry, Focus 7: quantum theory (Atkins Topics 7A–7F).
 * Photons, black-body radiation, the photoelectric effect, de Broglie
 * wavelengths, the uncertainty principle, the particle in a box, vibrating
 * and rotating diatomic molecules.
 */
import { lines } from "./tex";
import { K_B, asked, draw, mistakeIn, valueIn, sig } from "./units";
import type { Generator } from "./types";

/** Planck's constant (J s), ħ, the speed of light (m s⁻¹), electron mass (kg), elementary charge (C), atomic mass constant (kg). */
export const PLANCK = 6.626e-34;
export const HBAR = PLANCK / (2 * Math.PI);
export const LIGHT = 2.998e8;
export const ELECTRON = 9.109e-31;
export const CHARGE = 1.602e-19;
export const AMU = 1.6605e-27;
export const PROTON = 1.6726e-27;

const kms = "km\\,s^{-1}";
const cm1 = "cm^{-1}";

/** Number of photons from a lamp: N = PΔtλ/hc. */
const photonCount: Generator = (rng) => {
  const P = draw(rng, 1, 100, 1); // W
  const lambda = draw(rng, 300, 1000, 5); // nm
  const t = draw(rng, 0.1, 10, 0.1); // s
  const E = (PLANCK * LIGHT) / (lambda * 1e-9);
  const N = (P * t) / E;
  return {
    prompt: { key: "photonCount", tex: lines(`P = ${P}\\,\\mathrm{W},\\quad \\lambda = ${lambda}\\,\\mathrm{nm}`, `\\Delta t = ${sig(t, 2)}\\,\\mathrm{s}`, asked("N", "")) },
    correct: valueIn(N, ""),
    wrong: [
      mistakeIn(N * 1e9, "", "lengthUnits"),
      mistakeIn(N * 2 * Math.PI, "", "hbarForH"),
      mistakeIn(P * t * PLANCK * LIGHT / (lambda * 1e-9), "", "formulaInverted"),
      ...(t !== 1 ? [mistakeIn(N / t, "", "termDropped")] : []),
    ],
    explanation: {
      key: "photonCount",
      tex: `N = \\frac{P\\Delta t}{hc/\\lambda} = \\frac{${P} \\times ${sig(t, 2)} \\times ${lambda} \\times 10^{-9}}{6.626 \\times 10^{-34} \\times 2.998 \\times 10^{8}} = ${sig(N)}`,
    },
    verify: { kind: "value", value: N },
  };
};

/** Wien's law: λmax = c₂/5T, in nanometres. */
const wienPeak: Generator = (rng) => {
  const T = rng.pick([draw(rng, 250, 1500, 10), draw(rng, 1500, 12000, 100)]);
  const b = (PLANCK * LIGHT) / (5 * K_B); // m K
  const lambda = (b / T) * 1e9;
  return {
    prompt: { key: "wienPeak", tex: lines(`T = ${T}\\,\\mathrm{K}`, asked("\\lambda_\\mathrm{max}", "nm")) },
    correct: valueIn(lambda, "nm"),
    wrong: [
      mistakeIn(lambda * 5, "nm", "wrongFactor"),
      mistakeIn(lambda / 1000, "nm", "lengthUnits"),
      mistakeIn(lambda / (2 * Math.PI), "nm", "hbarForH"),
    ],
    explanation: {
      key: "wienPeak",
      tex: `\\lambda_\\mathrm{max} = \\frac{c_2}{5T} = \\frac{hc}{5kT} = \\frac{2.878 \\times 10^{-3}\\,\\mathrm{m\\,K}}{${T}\\,\\mathrm{K}} = ${sig(lambda)}\\,\\mathrm{nm}`,
    },
    verify: { kind: "value", value: lambda },
  };
};

/** Metals and their work functions, eV. */
const METALS: { name: string; phi: number }[] = [
  { name: "Cs", phi: 2.14 },
  { name: "K", phi: 2.29 },
  { name: "Na", phi: 2.36 },
  { name: "Li", phi: 2.93 },
  { name: "Mg", phi: 3.66 },
  { name: "Zn", phi: 4.33 },
];

/** Photoelectric effect: speed of the ejected electrons. */
const photoelectronSpeed: Generator = (rng) => {
  const metal = rng.pick(METALS);
  const maxLambda = (1239.8 / (metal.phi + 0.3)) - 5;
  const lambda = draw(rng, 120, Math.min(500, Math.max(130, maxLambda)), 5);
  const photon = (PLANCK * LIGHT) / (lambda * 1e-9);
  const phi = metal.phi * CHARGE;
  const Ek = photon - phi;
  if (Ek <= 0.1 * CHARGE) return photoelectronSpeed(rng);
  const v = Math.sqrt((2 * Ek) / ELECTRON) / 1000;
  return {
    prompt: {
      key: "photoelectronSpeed",
      tex: lines(`\\mathrm{${metal.name}}:\\ \\Phi = ${metal.phi.toFixed(2)}\\,\\mathrm{eV}`, `\\lambda = ${lambda}\\,\\mathrm{nm}`, asked("v", kms)),
      id: metal.name,
    },
    correct: valueIn(v, kms),
    wrong: [
      mistakeIn(Math.sqrt((2 * (photon + phi)) / ELECTRON) / 1000, kms, "signError"),
      mistakeIn(v / Math.SQRT2, kms, "wrongFactor"),
      mistakeIn(Math.sqrt((2 * photon) / ELECTRON) / 1000, kms, "termDropped"),
    ],
    explanation: {
      key: "photoelectronSpeed",
      tex: lines(
        `E_\\mathrm{k} = \\frac{hc}{\\lambda} - \\Phi = ${sig(photon / CHARGE)} - ${metal.phi.toFixed(2)} = ${sig(Ek / CHARGE)}\\,\\mathrm{eV}`,
        `v = \\left(\\frac{2E_\\mathrm{k}}{m_\\mathrm{e}}\\right)^{1/2} = ${sig(v)}\\,\\mathrm{${kms}}`,
      ),
    },
    verify: { kind: "value", value: v },
  };
};

/** de Broglie wavelength of an electron accelerated from rest through Δφ, in pm. */
const deBroglie: Generator = (rng) => {
  const mantissa = draw(rng, 1, 9.9, 0.1);
  const power = rng.int(1, 4);
  const V = Number((mantissa * 10 ** power).toPrecision(2));
  const p = Math.sqrt(2 * ELECTRON * CHARGE * V);
  const lambda = (PLANCK / p) * 1e12;
  const shown = V >= 1000 ? `${sig(V / 1000, 2)}\\,\\mathrm{kV}` : `${sig(V, 2)}\\,\\mathrm{V}`;
  return {
    prompt: { key: "deBroglie", tex: lines(`\\Delta\\phi = ${shown}`, asked("\\lambda", "pm")) },
    correct: valueIn(lambda, "pm"),
    wrong: [
      mistakeIn(lambda * Math.SQRT2, "pm", "wrongFactor"),
      mistakeIn(lambda / (2 * Math.PI), "pm", "hbarForH"),
      mistakeIn(V >= 1000 ? lambda * Math.sqrt(1000) : lambda / Math.sqrt(1000), "pm", "energyUnits"),
    ],
    explanation: {
      key: "deBroglie",
      tex: lines(
        `\\frac{p^2}{2m_\\mathrm{e}} = e\\Delta\\phi`,
        `\\lambda = \\frac{h}{(2m_\\mathrm{e}e\\Delta\\phi)^{1/2}} = \\frac{6.626 \\times 10^{-34}}{(2 \\times 9.109 \\times 10^{-31} \\times 1.602 \\times 10^{-19} \\times ${sig(V, 2)})^{1/2}}\\,\\mathrm{m} = ${sig(lambda)}\\,\\mathrm{pm}`,
      ),
    },
    verify: { kind: "value", value: lambda },
  };
};

/** Minimum uncertainty in speed of a confined electron or proton: Δv = ħ/2mΔx. */
const uncertaintySpeed: Generator = (rng) => {
  const proton = rng.int(0, 2) === 0;
  const m = proton ? PROTON : ELECTRON;
  const dx = proton ? draw(rng, 1, 50, 1) : draw(rng, 50, 2000, 10); // pm
  const dv = HBAR / (2 * m * dx * 1e-12) / 1000;
  return {
    prompt: {
      key: proton ? "uncertaintyProton" : "uncertaintyElectron",
      tex: lines(`\\Delta x = ${dx}\\,\\mathrm{pm}`, asked("\\Delta v_\\mathrm{min}", kms)),
    },
    correct: valueIn(dv, kms),
    wrong: [
      mistakeIn(dv * 2 * Math.PI, kms, "hbarForH"),
      mistakeIn(dv * 2, kms, "wrongFactor"),
      mistakeIn(dv / 1000, kms, "lengthUnits"),
    ],
    explanation: {
      key: "uncertaintySpeed",
      tex: `\\Delta p\\,\\Delta x \\geq \\tfrac{1}{2}\\hbar:\\quad \\Delta v_\\mathrm{min} = \\frac{\\hbar}{2m\\Delta x} = \\frac{1.055 \\times 10^{-34}}{2 \\times ${proton ? "1.673 \\times 10^{-27}" : "9.109 \\times 10^{-31}"} \\times ${dx} \\times 10^{-12}}\\,\\mathrm{m\\,s^{-1}} = ${sig(dv)}\\,\\mathrm{${kms}}`,
    },
    verify: { kind: "value", value: dv },
  };
};

/** Particle in a box: wavelength of the n → n + 1 absorption of an electron. */
const boxTransition: Generator = (rng) => {
  const L = draw(rng, 0.5, 3, 0.1); // nm
  const n = rng.int(1, 5);
  const unitE = (PLANCK * PLANCK) / (8 * ELECTRON * (L * 1e-9) ** 2);
  const dE = (2 * n + 1) * unitE;
  const lambda = ((PLANCK * LIGHT) / dE) * 1e9;
  return {
    prompt: { key: "boxTransition", tex: lines(`L = ${sig(L, 2)}\\,\\mathrm{nm},\\quad n = ${n} \\to ${n + 1}`, asked("\\lambda", "nm")) },
    correct: valueIn(lambda, "nm"),
    wrong: [
      mistakeIn(((PLANCK * LIGHT) / ((n + 1) ** 2 * unitE)) * 1e9, "nm", "termDropped"),
      mistakeIn(lambda * 4 * Math.PI * Math.PI, "nm", "hbarForH"),
      mistakeIn(lambda / 8, "nm", "wrongFactor"),
      mistakeIn(lambda * 1e-6, "nm", "lengthUnits"),
    ],
    explanation: {
      key: "boxTransition",
      tex: lines(
        `\\Delta E = E_{${n + 1}} - E_{${n}} = (2n + 1)\\frac{h^2}{8m_\\mathrm{e}L^2} = ${sig(dE)}\\,\\mathrm{J}`,
        `\\lambda = \\frac{hc}{\\Delta E} = ${sig(lambda)}\\,\\mathrm{nm}`,
      ),
    },
    verify: { kind: "value", value: lambda },
  };
};

/** Diatomic molecules: masses (mu), force constant (N m⁻¹), bond length (pm). */
export const DIATOMICS: { tex: string; mA: number; mB: number; k: number; R: number }[] = [
  { tex: "^{1}H^{35}Cl", mA: 1.0078, mB: 34.9688, k: 516.3, R: 127.5 },
  { tex: "^{1}H^{19}F", mA: 1.0078, mB: 18.9984, k: 965.7, R: 91.7 },
  { tex: "^{1}H^{79}Br", mA: 1.0078, mB: 78.9183, k: 411.5, R: 141.4 },
  { tex: "^{12}C^{16}O", mA: 12.0, mB: 15.9949, k: 1902, R: 112.8 },
  { tex: "^{14}N^{16}O", mA: 14.0031, mB: 15.9949, k: 1595, R: 115.1 },
  { tex: "^{1}H^{127}I", mA: 1.0078, mB: 126.9045, k: 314.2, R: 160.9 },
];

export const reduced = (mA: number, mB: number): number => (mA * mB) / (mA + mB);

/** Vibrational wavenumber of a diatomic molecule: ν̃ = (1/2πc)(k/μ)^½. */
const vibrationWavenumber: Generator = (rng) => {
  const d = rng.pick(DIATOMICS);
  const mu = reduced(d.mA, d.mB) * AMU;
  const nu = (k: number, m: number): number => Math.sqrt(k / m) / (2 * Math.PI * LIGHT * 100);
  const value = nu(d.k, mu);
  return {
    prompt: {
      key: "vibrationWavenumber",
      tex: lines(`\\mathrm{${d.tex}}:\\ k_\\mathrm{f} = ${d.k}\\,\\mathrm{N\\,m^{-1}}`, `m_\\mathrm{A} = ${d.mA}\\,m_\\mathrm{u},\\quad m_\\mathrm{B} = ${d.mB}\\,m_\\mathrm{u}`, asked("\\tilde{\\nu}", cm1)),
      id: d.tex,
    },
    correct: valueIn(value, cm1),
    wrong: [
      mistakeIn(nu(d.k, (d.mA + d.mB) * AMU), cm1, "reducedMass"),
      mistakeIn(value * 2 * Math.PI, cm1, "wrongFactor"),
      mistakeIn(value / Math.sqrt(1000), cm1, "massUnits"),
      mistakeIn(value * 100, cm1, "lengthUnits"),
    ],
    explanation: {
      key: "vibrationWavenumber",
      tex: lines(
        `\\mu = \\frac{m_\\mathrm{A}m_\\mathrm{B}}{m_\\mathrm{A} + m_\\mathrm{B}} = ${sig(reduced(d.mA, d.mB), 4)}\\,m_\\mathrm{u}`,
        `\\tilde{\\nu} = \\frac{1}{2\\pi c}\\left(\\frac{k_\\mathrm{f}}{\\mu}\\right)^{1/2} = ${sig(value)}\\,\\mathrm{${cm1}}`,
      ),
    },
    verify: { kind: "value", value },
  };
};

/** Zero-point vibrational energy of a diatomic molecule, kJ mol⁻¹: ½ħω × N_A. */
const zeroPointEnergy: Generator = (rng) => {
  const d = rng.pick(DIATOMICS);
  const k = Number((d.k * draw(rng, 0.9, 1.1, 0.01)).toPrecision(3));
  const omega = (m: number): number => Math.sqrt(k / m);
  const mu = reduced(d.mA, d.mB) * AMU;
  const E = (m: number, h: number): number => (0.5 * h * omega(m) * 6.022e23) / 1000;
  const value = E(mu, HBAR);
  const kJmol = "kJ\\,mol^{-1}";
  return {
    prompt: {
      key: "zeroPointEnergy",
      tex: lines(`\\mathrm{${d.tex}}:\\ k_\\mathrm{f} = ${k}\\,\\mathrm{N\\,m^{-1}}`, `m_\\mathrm{A} = ${d.mA}\\,m_\\mathrm{u},\\quad m_\\mathrm{B} = ${d.mB}\\,m_\\mathrm{u}`, asked("E_0", kJmol)),
      id: d.tex,
    },
    correct: valueIn(value, kJmol),
    wrong: [
      mistakeIn(value * 2, kJmol, "wrongFactor"),
      mistakeIn(E(mu, PLANCK), kJmol, "hbarForH"),
      mistakeIn(E((d.mA + d.mB) * AMU, HBAR), kJmol, "reducedMass"),
      mistakeIn(value * 1000, kJmol, "energyUnits"),
    ],
    explanation: {
      key: "zeroPointEnergy",
      tex: lines(
        `\\omega = \\left(\\frac{k_\\mathrm{f}}{\\mu}\\right)^{1/2} = ${sig(omega(mu))}\\,\\mathrm{s^{-1}}`,
        `E_0 = \\tfrac{1}{2}\\hbar\\omega N_\\mathrm{A} = ${sig(value)}\\,\\mathrm{${kJmol}}`,
      ),
    },
    verify: { kind: "value", value },
  };
};

/** Lowest rotational transition of a diatomic molecule, l = 0 → 1: ν = ħ/2πI, in GHz. */
const rotationalFrequency: Generator = (rng) => {
  const d = rng.pick(DIATOMICS);
  const I = (m: number): number => m * (d.R * 1e-12) ** 2;
  const mu = reduced(d.mA, d.mB) * AMU;
  const nu = HBAR / (2 * Math.PI * I(mu)) / 1e9;
  return {
    prompt: {
      key: "rotationalFrequency",
      tex: lines(`\\mathrm{${d.tex}}:\\ R = ${d.R}\\,\\mathrm{pm}`, `m_\\mathrm{A} = ${d.mA}\\,m_\\mathrm{u},\\quad m_\\mathrm{B} = ${d.mB}\\,m_\\mathrm{u}`, asked("\\nu_{0 \\to 1}", "GHz")),
      id: d.tex,
    },
    correct: valueIn(nu, "GHz"),
    wrong: [
      mistakeIn(HBAR / (2 * Math.PI * I((d.mA + d.mB) * AMU)) / 1e9, "GHz", "reducedMass"),
      mistakeIn(nu / 2, "GHz", "wrongFactor"),
      mistakeIn(nu * 4 * Math.PI * Math.PI, "GHz", "hbarForH"),
    ],
    explanation: {
      key: "rotationalFrequency",
      tex: lines(
        `I = \\mu R^2 = ${sig(I(mu))}\\,\\mathrm{kg\\,m^2}`,
        `\\Delta E = E_1 - E_0 = \\frac{2\\hbar^2}{2I}`,
        `\\nu = \\frac{\\hbar}{2\\pi I} = ${sig(nu)}\\,\\mathrm{GHz}`,
      ),
    },
    verify: { kind: "value", value: nu },
  };
};

export const quantum = {
  chemistry: {
    photonCount,
    wienPeak,
    photoelectronSpeed,
    deBroglie,
    uncertaintySpeed,
    boxTransition,
    vibrationWavenumber,
    zeroPointEnergy,
    rotationalFrequency,
  },
};
