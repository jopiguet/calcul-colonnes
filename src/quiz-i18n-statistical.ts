/**
 * Texts of the physical chemistry calculations of Focus 13 (statistical
 * thermodynamics), in French, Spanish and English: merged into the tables of
 * quiz-i18n.ts.
 */
type Lang = "fr" | "es" | "en";

export type StatisticalKey =
  | "boltzmannRatio" | "populationTemperature" | "thermalWavelength" | "translationalPartition" | "rotationalPartition"
  | "symmetryNumber" | "vibrationalPartition" | "electronicPartition" | "meanVibrationalEnergy" | "twoLevelEnergy"
  | "vibrationalHeatCapacity" | "sackurTetrode" | "residualEntropy";

export type StatisticalMistake = "degeneracyIgnored" | "symmetryIgnored" | "rotationsMiscounted" | "zeroPointConfused" | "classicalLimit";

export const ST_GROUP: Record<Lang, string> = { fr: "Thermodynamique statistique", es: "Termodinámica estadística", en: "Statistical thermodynamics" };



const SKILLS: Record<StatisticalKey, [string, string, string]> = {
  boltzmannRatio: ["Populations de Boltzmann", "Poblaciones de Boltzmann", "Boltzmann populations"],
  populationTemperature: ["Température d'une population", "Temperatura de una población", "Temperature from populations"],
  thermalWavelength: ["Longueur d'onde thermique", "Longitud de onda térmica", "Thermal wavelength"],
  translationalPartition: ["Partition de translation", "Partición de traslación", "Translational partition function"],
  rotationalPartition: ["Partition de rotation", "Partición rotacional", "Rotational partition function"],
  symmetryNumber: ["Nombre de symétrie", "Número de simetría", "Symmetry number"],
  vibrationalPartition: ["Partition de vibration", "Partición vibracional", "Vibrational partition function"],
  electronicPartition: ["Partition électronique", "Partición electrónica", "Electronic partition function"],
  meanVibrationalEnergy: ["Énergie de vibration moyenne", "Energía vibracional media", "Mean vibrational energy"],
  twoLevelEnergy: ["Système à deux niveaux", "Sistema de dos niveles", "Two-level system"],
  vibrationalHeatCapacity: ["Capacité calorifique de vibration", "Capacidad calorífica vibracional", "Vibrational heat capacity"],
  sackurTetrode: ["Sackur–Tetrode", "Sackur–Tetrode", "Sackur–Tetrode"],
  residualEntropy: ["Entropie résiduelle", "Entropía residual", "Residual entropy"],
};
const skills = (i: 0 | 1 | 2): Record<string, string> => Object.fromEntries(Object.entries(SKILLS).map(([k, v]) => [`statistical.${k}`, v[i]]));
export const ST_SKILLS: Record<Lang, Record<string, string>> = { fr: skills(0), es: skills(1), en: skills(2) };

export const ST_MISTAKES: Record<Lang, Record<StatisticalMistake, string>> = {
  fr: {
    degeneracyIgnored: "Dégénérescence oubliée : niveaux comptés comme des états",
    symmetryIgnored: "Nombre de symétrie σ oublié",
    rotationsMiscounted: "Rotations mal comptées, ou réflexions comptées avec elles",
    zeroPointConfused: "Énergie de point zéro comptée à tort, ou oubliée",
    classicalLimit: "Limite classique (haute température) prise pour des niveaux quantifiés",
  },
  es: {
    degeneracyIgnored: "Degeneración olvidada: niveles contados como estados",
    symmetryIgnored: "Número de simetría σ olvidado",
    rotationsMiscounted: "Rotaciones mal contadas, o reflexiones contadas con ellas",
    zeroPointConfused: "Energía de punto cero contada de más, u olvidada",
    classicalLimit: "Límite clásico (alta temperatura) usado con niveles cuantizados",
  },
  en: {
    degeneracyIgnored: "Degeneracy left out: levels counted as states",
    symmetryIgnored: "Symmetry number σ left out",
    rotationsMiscounted: "Rotations miscounted, or reflections counted with them",
    zeroPointConfused: "Zero-point energy counted where it is the zero, or left out",
    classicalLimit: "Classical (high-temperature) limit used for quantized levels",
  },
};
