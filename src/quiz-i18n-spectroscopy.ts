/**
 * Texts of the physical chemistry calculations of Focuses 11–12 (molecular
 * spectroscopy, magnetic resonance), in French, Spanish and English: merged
 * into the tables of quiz-i18n.ts.
 */
type Lang = "fr" | "es" | "en";

export type SpectroscopyPrompt =
  | "beerLambert" | "rotationalLine" | "bondLength" | "ramanShift" | "mostPopulatedJ" | "anharmonicFundamental"
  | "anharmonicOvertone" | "dissociationEnergy" | "normalModes" | "dopplerWidth" | "lifetimeWidth" | "larmorFrequency"
  | "shiftInHertz" | "multipletNMR" | "multipletEPR" | "populationExcess" | "gValue" | "spinDensity" | "coalescence"
  | "t2Linewidth" | "inversionRecovery";

export type SpectroscopyExplanation = Exclude<SpectroscopyPrompt, "multipletNMR" | "multipletEPR"> | "multiplet";

export type SpectroscopyMistake = "selectionRuleConfused" | "linearityConfused" | "ppmConfused" | "equivalenceIgnored" | "nuclearSpinIgnored" | "fieldUnits";

export const SP_GROUP: Record<Lang, string> = { fr: "Spectroscopie", es: "Espectroscopía", en: "Spectroscopy" };



const SKILLS: Record<string, [string, string, string]> = {
  "spectroscopy.beerLambert": ["Loi de Beer–Lambert", "Ley de Beer–Lambert", "Beer–Lambert law"],
  "spectroscopy.rotationalLine": ["Raies de rotation", "Líneas de rotación", "Rotational lines"],
  "spectroscopy.bondLength": ["Longueur de liaison", "Longitud de enlace", "Bond length"],
  "spectroscopy.ramanShift": ["Raman de rotation", "Raman de rotación", "Rotational Raman"],
  "spectroscopy.mostPopulatedJ": ["Niveau le plus peuplé", "Nivel más poblado", "Most populated level"],
  "spectroscopy.anharmonicLine": ["Anharmonicité", "Anarmonicidad", "Anharmonicity"],
  "spectroscopy.dissociationEnergy": ["Énergie de dissociation", "Energía de disociación", "Dissociation energy"],
  "spectroscopy.normalModes": ["Modes normaux", "Modos normales", "Normal modes"],
  "spectroscopy.dopplerWidth": ["Largeur Doppler", "Anchura Doppler", "Doppler width"],
  "spectroscopy.lifetimeWidth": ["Largeur naturelle", "Anchura natural", "Natural linewidth"],
  "resonance.larmorFrequency": ["Fréquence de Larmor", "Frecuencia de Larmor", "Larmor frequency"],
  "resonance.shiftInHertz": ["Déplacements en hertz", "Desplazamientos en hercios", "Shifts in hertz"],
  "resonance.multiplet": ["Multiplets", "Multipletes", "Multiplets"],
  "resonance.populationExcess": ["Excès de population", "Exceso de población", "Population excess"],
  "resonance.gValue": ["Valeur de g", "Valor de g", "The g-value"],
  "resonance.spinDensity": ["Densité de spin", "Densidad de espín", "Spin density"],
  "resonance.coalescence": ["Coalescence", "Coalescencia", "Coalescence"],
  "resonance.t2Linewidth": ["Largeur et T₂", "Anchura y T₂", "Linewidth and T₂"],
  "resonance.inversionRecovery": ["Inversion-récupération", "Inversión-recuperación", "Inversion recovery"],
};
const skills = (i: 0 | 1 | 2): Record<string, string> => Object.fromEntries(Object.entries(SKILLS).map(([k, v]) => [k, v[i]]));
export const SP_SKILLS: Record<Lang, Record<string, string>> = { fr: skills(0), es: skills(1), en: skills(2) };

export const SP_MISTAKES: Record<Lang, Record<SpectroscopyMistake, string>> = {
  fr: {
    selectionRuleConfused: "Règle de sélection confondue (ΔJ = ±1 et ±2)",
    linearityConfused: "3N − 5 et 3N − 6 confondus : molécule linéaire ou non",
    ppmConfused: "ppm confondu avec un pourcentage ou un facteur 10⁶",
    equivalenceIgnored: "Noyaux équivalents traités comme distincts",
    nuclearSpinIgnored: "Spin nucléaire pris égal à ½",
    fieldUnits: "Milliteslas pris pour des teslas, ou l'inverse",
  },
  es: {
    selectionRuleConfused: "Regla de selección confundida (ΔJ = ±1 y ±2)",
    linearityConfused: "3N − 5 y 3N − 6 confundidos: molécula lineal o no",
    ppmConfused: "ppm confundido con un porcentaje o un factor 10⁶",
    equivalenceIgnored: "Núcleos equivalentes tratados como distintos",
    nuclearSpinIgnored: "Espín nuclear tomado igual a ½",
    fieldUnits: "Militeslas tomados por teslas, o al revés",
  },
  en: {
    selectionRuleConfused: "Selection rule confused (ΔJ = ±1 and ±2)",
    linearityConfused: "3N − 5 and 3N − 6 confused: linear or not",
    ppmConfused: "ppm confused with per cent or a factor of 10⁶",
    equivalenceIgnored: "Equivalent nuclei treated as distinct",
    nuclearSpinIgnored: "Nuclear spin taken as ½",
    fieldUnits: "Milliteslas used as teslas, or the reverse",
  },
};
