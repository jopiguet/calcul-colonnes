/**
 * Texts of the physical chemistry calculations of Focuses 17–18 (chemical
 * kinetics, reaction dynamics), in French, Spanish and English: merged into
 * the tables of quiz-i18n.ts.
 */
type Lang = "fr" | "es" | "en";

export type KineticsKey =
  | "firstOrderConcentration" | "firstOrderHalfLife" | "secondOrderConcentration" | "secondOrderHalfLife"
  | "arrheniusRatio" | "activationEnergy" | "relaxation" | "michaelisMenten" | "polymerization" | "quantumYield"
  | "fretEfficiency" | "sternVolmer" | "collisionFactor" | "diffusionLimit" | "activationEnthalpy" | "eyringRate"
  | "saltEffect" | "isotopeEffect" | "marcusBarrier";

export type KineticsMistake = "orderConfused" | "halfLifeForTau" | "timeUnits" | "distancePower";

export const KN_GROUP: Record<Lang, string> = { fr: "Cinétique", es: "Cinética", en: "Kinetics" };



const SKILLS: Record<KineticsKey, [string, string, string]> = {
  firstOrderConcentration: ["Loi intégrée du premier ordre", "Ley integrada de primer orden", "First-order integrated law"],
  firstOrderHalfLife: ["Demi-vie du premier ordre", "Vida media de primer orden", "First-order half-life"],
  secondOrderConcentration: ["Loi intégrée du second ordre", "Ley integrada de segundo orden", "Second-order integrated law"],
  secondOrderHalfLife: ["Demi-vie du second ordre", "Vida media de segundo orden", "Second-order half-life"],
  arrheniusRatio: ["Arrhenius : effet de la température", "Arrhenius: efecto de la temperatura", "Arrhenius: effect of temperature"],
  activationEnergy: ["Énergie d'activation", "Energía de activación", "Activation energy"],
  relaxation: ["Relaxation après un saut de température", "Relajación tras un salto de temperatura", "Relaxation after a temperature jump"],
  michaelisMenten: ["Michaelis–Menten", "Michaelis–Menten", "Michaelis–Menten"],
  polymerization: ["Degré de polymérisation", "Grado de polimerización", "Degree of polymerization"],
  quantumYield: ["Rendement quantique", "Rendimiento cuántico", "Quantum yield"],
  fretEfficiency: ["Transfert d'énergie (FRET)", "Transferencia de energía (FRET)", "Energy transfer (FRET)"],
  sternVolmer: ["Stern–Volmer", "Stern–Volmer", "Stern–Volmer"],
  collisionFactor: ["Théorie des collisions", "Teoría de colisiones", "Collision theory"],
  diffusionLimit: ["Limite de diffusion", "Límite de difusión", "Diffusion limit"],
  activationEnthalpy: ["Enthalpie d'activation", "Entalpía de activación", "Enthalpy of activation"],
  eyringRate: ["Équation d'Eyring", "Ecuación de Eyring", "Eyring equation"],
  saltEffect: ["Effet de sel cinétique", "Efecto salino cinético", "Kinetic salt effect"],
  isotopeEffect: ["Effet isotopique cinétique", "Efecto isotópico cinético", "Kinetic isotope effect"],
  marcusBarrier: ["Théorie de Marcus", "Teoría de Marcus", "Marcus theory"],
};
const DYNAMICS = new Set<KineticsKey>(["collisionFactor", "diffusionLimit", "activationEnthalpy", "eyringRate", "saltEffect", "isotopeEffect", "marcusBarrier"]);
const skills = (i: 0 | 1 | 2): Record<string, string> =>
  Object.fromEntries(Object.entries(SKILLS).map(([k, names]) => [`${DYNAMICS.has(k as KineticsKey) ? "dynamics" : "kinetics"}.${k}`, names[i]]));
export const KN_SKILLS: Record<Lang, Record<string, string>> = { fr: skills(0), es: skills(1), en: skills(2) };

export const KN_MISTAKES: Record<Lang, Record<KineticsMistake, string>> = {
  fr: {
    orderConfused: "La loi d'un autre ordre de réaction",
    halfLifeForTau: "Demi-vie et constante de temps confondues : un facteur ln 2",
    timeUnits: "Secondes, minutes ou heures non converties",
    distancePower: "Mauvaise puissance de la distance",
  },
  es: {
    orderConfused: "La ley de otro orden de reacción",
    halfLifeForTau: "Vida media y constante de tiempo confundidas: un factor ln 2",
    timeUnits: "Segundos, minutos u horas sin convertir",
    distancePower: "Potencia equivocada de la distancia",
  },
  en: {
    orderConfused: "The law of another reaction order",
    halfLifeForTau: "Half-life and time constant confused: a factor of ln 2",
    timeUnits: "Seconds, minutes or hours not converted",
    distancePower: "Wrong power of the distance",
  },
};

