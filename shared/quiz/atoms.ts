/**
 * Physical chemistry, Focus 8: atomic structure and spectra (Atkins Topics
 * 8A–8C). Hydrogenic lines and ionization energies, the nodes and radii of
 * orbitals, spin–orbit splitting.
 */
import { lines } from "./tex";
import { asked, draw, mistakeIn, valueIn, sig } from "./units";
import type { Generator, MistakeKey, Option } from "./types";

/** Rydberg constants (cm⁻¹) of hydrogenic atoms, with the reduced-mass correction. */
const ATOMS: { tex: string; Z: number; R: number }[] = [
  { tex: "H", Z: 1, R: 109677.6 },
  { tex: "He^{+}", Z: 2, R: 109722.3 },
  { tex: "Li^{2+}", Z: 3, R: 109728.7 },
];
/** 109677.6 as 109\,677.6 */
const thousands = (x: number): string => `${Math.floor(x / 1000)}\\,${(x % 1000).toFixed(1).padStart(5, "0")}`;
/** hcR∞ in eV, and the Bohr radius in pm. */
const RYDBERG_EV = 13.6057;
const R_INF = 109737.3;
const BOHR = 52.92;

/** Wavelength of a hydrogenic transition n₂ → n₁, nm. */
const hydrogenLine: Generator = (rng) => {
  const atom = rng.pick(ATOMS);
  const n1 = rng.int(1, 3);
  const n2 = n1 + rng.int(1, 4);
  const nu = atom.Z * atom.Z * atom.R * (1 / n1 ** 2 - 1 / n2 ** 2);
  const lambda = 1e7 / nu;
  const wrong: Option[] = [
    mistakeIn(1e7 / (atom.Z * atom.Z * atom.R / n1 ** 2), "nm", "termDropped"),
    mistakeIn(lambda / 100, "nm", "lengthUnits"),
    mistakeIn(1e7 / (atom.Z * atom.Z * atom.R * (1 / n1 - 1 / n2)), "nm", "wrongFactor"),
  ];
  if (atom.Z > 1) wrong.push(mistakeIn(lambda * atom.Z, "nm", "chargeNotSquared"));
  return {
    prompt: {
      key: "hydrogenLine",
      tex: lines(`\\mathrm{${atom.tex}}:\\ n = ${n2} \\to ${n1}`, `\\tilde{R} = ${thousands(atom.R)}\\,\\mathrm{cm^{-1}}`, asked("\\lambda", "nm")),
    },
    correct: valueIn(lambda, "nm", 4),
    wrong,
    explanation: {
      key: "hydrogenLine",
      tex: lines(
        `\\tilde{\\nu} = Z^2\\tilde{R}\\left(\\frac{1}{${n1}^2} - \\frac{1}{${n2}^2}\\right) = ${sig(nu, 5)}\\,\\mathrm{cm^{-1}}`,
        `\\lambda = \\frac{1}{\\tilde{\\nu}} = ${sig(lambda, 4)}\\,\\mathrm{nm}`,
      ),
    },
    verify: { kind: "value", value: lambda },
  };
};

/** Ionization energy of a hydrogenic atom from level n, eV. */
const ionizationEnergy: Generator = (rng) => {
  const atom = rng.pick(ATOMS);
  const n = rng.int(1, 4);
  const scale = (RYDBERG_EV * atom.R) / R_INF;
  const I = (scale * atom.Z * atom.Z) / (n * n);
  const wrong: Option[] = [
    mistakeIn((scale * atom.Z * atom.Z) / n, "eV", "wrongFactor"),
    mistakeIn(-I, "eV", "signError"),
  ];
  if (atom.Z > 1) wrong.push(mistakeIn((scale * atom.Z) / (n * n), "eV", "chargeNotSquared"));
  if (n > 1) wrong.push(mistakeIn(scale * atom.Z * atom.Z, "eV", "termDropped"));
  if (n > 1) wrong.push(mistakeIn(scale * atom.Z * atom.Z * (1 - 1 / (n * n)), "eV", "formulaInverted"));
  return {
    prompt: { key: "ionizationEnergy", tex: lines(`\\mathrm{${atom.tex}},\\ n = ${n}`, asked("I", "eV")) },
    correct: valueIn(I, "eV", 4),
    wrong,
    explanation: {
      key: "ionizationEnergy",
      tex: `I = \\frac{hcZ^2\\tilde{R}}{n^2} = \\frac{${sig(scale, 5)} \\times ${atom.Z * atom.Z}}{${n * n}}\\,\\mathrm{eV} = ${sig(I, 4)}\\,\\mathrm{eV}`,
    },
    verify: { kind: "value", value: I },
  };
};

const LETTERS = ["s", "p", "d", "f"];
const whole = (n: number, mistake?: MistakeKey): Option => ({ tex: String(n), num: n, ...(mistake ? { mistake } : {}) });

/** Radial nodes of an orbital: n − l − 1. */
const orbitalNodes: Generator = (rng) => {
  const n = rng.int(2, 6);
  const l = rng.int(0, Math.min(3, n - 1));
  const radial = n - l - 1;
  const candidates: Option[] = [whole(n - 1, "nodesConfused"), whole(l, "nodesConfused"), whole(n - l, "termDropped"), whole(n, "nodesConfused")];
  if (radial >= 1) candidates.push(whole(radial - 1, "wrongFactor"));
  candidates.push(whole(radial + 2, "wrongFactor"));
  return {
    prompt: { key: "orbitalNodes", tex: `\\mathrm{${n}${LETTERS[l]}}` },
    correct: whole(radial),
    wrong: candidates.filter((o) => o.num !== radial && o.num! >= 0),
    explanation: {
      key: "orbitalNodes",
      tex: `n = ${n},\\ l = ${l}:\\quad n - l - 1 = ${radial},\\quad l = ${l},\\quad n - 1 = ${n - 1}`,
    },
    verify: { kind: "value", value: radial },
  };
};

/** Most probable or mean radius of a hydrogenic 1s electron, pm. */
const orbitalRadius: Generator = (rng) => {
  const atom = rng.pick([...ATOMS, { tex: "Be^{3+}", Z: 4, R: 109730.6 }]);
  const mean = rng.int(0, 1) === 1;
  const peak = BOHR / atom.Z;
  const value = mean ? 1.5 * peak : peak;
  return {
    prompt: { key: mean ? "meanRadius" : "mostProbableRadius", tex: lines(`\\mathrm{${atom.tex}},\\ 1\\mathrm{s}`, asked(mean ? "\\langle r \\rangle" : "r^*", "pm")) },
    correct: valueIn(value, "pm"),
    wrong: [
      mistakeIn(mean ? peak : 1.5 * peak, "pm", "averagesConfused"),
      mistakeIn(value / atom.Z, "pm", "wrongFactor"),
      mistakeIn(BOHR * atom.Z * (mean ? 1.5 : 1), "pm", "formulaInverted"),
      mistakeIn(mean ? 2 * peak : 0.5 * peak, "pm", "averagesConfused"),
    ],
    explanation: {
      key: mean ? "meanRadius" : "mostProbableRadius",
      tex: mean
        ? `\\langle r \\rangle = \\frac{3a_0}{2Z} = \\frac{3 \\times ${BOHR}}{2 \\times ${atom.Z}}\\,\\mathrm{pm} = ${sig(value)}\\,\\mathrm{pm}`
        : `r^* = \\frac{a_0}{Z} = \\frac{${BOHR}}{${atom.Z}}\\,\\mathrm{pm} = ${sig(value)}\\,\\mathrm{pm}`,
    },
    verify: { kind: "value", value },
  };
};

/** Spin–orbit splitting between j = l + ½ and j = l − ½: A(l + ½), cm⁻¹. */
const spinOrbitSplitting: Generator = (rng) => {
  const l = rng.int(1, 3);
  const A = draw(rng, 0.5, 400, 0.5);
  const split = A * (l + 0.5);
  const cm1 = "cm^{-1}";
  return {
    prompt: { key: "spinOrbitSplitting", tex: lines(`\\tilde{A} = ${sig(A, 4)}\\,\\mathrm{${cm1}},\\quad l = ${l}\\ (\\mathrm{${LETTERS[l]}})`, asked("\\Delta\\tilde{\\nu}", cm1)) },
    correct: valueIn(split, cm1, 4),
    wrong: [
      mistakeIn(A * l, cm1, "termDropped", 4),
      mistakeIn(A * (l + 1), cm1, "wrongFactor", 4),
      mistakeIn(0.5 * A * (l + 0.5), cm1, "wrongFactor", 4),
      ...(l !== 1 ? [mistakeIn(1.5 * A, cm1, "wrongFactor", 4)] : []),
    ],
    explanation: {
      key: "spinOrbitSplitting",
      tex: lines(
        `E_{j}/hc = \\tfrac{1}{2}\\tilde{A}\\{j(j + 1) - l(l + 1) - s(s + 1)\\}`,
        `\\Delta\\tilde{\\nu} = \\tilde{A}\\left(l + \\tfrac{1}{2}\\right) = ${sig(A, 4)} \\times ${l + 0.5} = ${sig(split, 4)}\\,\\mathrm{${cm1}}`,
      ),
    },
    verify: { kind: "value", value: split },
  };
};

export const atoms = {
  chemistry: {
    hydrogenLine,
    ionizationEnergy,
    orbitalNodes,
    orbitalRadius,
    spinOrbitSplitting,
  },
};
