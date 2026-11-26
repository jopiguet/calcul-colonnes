/**
 * Texts of the physical chemistry calculations of Focuses 7–8 (quantum theory,
 * atomic structure and spectra), in French, Spanish and English: merged into
 * the tables of quiz-i18n.ts.
 */
type Lang = "fr" | "es" | "en";

export type QuantumPrompt =
  | "photonCount" | "wienPeak" | "photoelectronSpeed" | "deBroglie" | "uncertaintyProton" | "uncertaintyElectron"
  | "boxTransition" | "vibrationWavenumber" | "zeroPointEnergy" | "rotationalFrequency" | "hydrogenLine"
  | "ionizationEnergy" | "orbitalNodes" | "meanRadius" | "mostProbableRadius" | "spinOrbitSplitting";

export type QuantumExplanation =
  | "photonCount" | "wienPeak" | "photoelectronSpeed" | "deBroglie" | "uncertaintySpeed" | "boxTransition"
  | "vibrationWavenumber" | "zeroPointEnergy" | "rotationalFrequency" | "hydrogenLine" | "ionizationEnergy"
  | "orbitalNodes" | "meanRadius" | "mostProbableRadius" | "spinOrbitSplitting";

export type QuantumMistake = "lengthUnits" | "hbarForH" | "reducedMass" | "nodesConfused" | "averagesConfused";

export const QT_GROUP: Record<Lang, string> = { fr: "Quantique et structure", es: "Cuántica y estructura", en: "Quantum and structure" };



export const QT_SKILLS: Record<Lang, Record<string, string>> = {
  fr: {
    "quantum.photonCount": "Nombre de photons",
    "quantum.wienPeak": "Loi de Wien",
    "quantum.photoelectronSpeed": "Effet photoélectrique",
    "quantum.deBroglie": "Longueur d'onde de de Broglie",
    "quantum.uncertaintySpeed": "Principe d'incertitude",
    "quantum.boxTransition": "Particule dans une boîte",
    "quantum.vibrationWavenumber": "Nombre d'onde de vibration",
    "quantum.zeroPointEnergy": "Énergie de point zéro",
    "quantum.rotationalFrequency": "Transition de rotation",
    "atoms.hydrogenLine": "Raies des atomes hydrogénoïdes",
    "atoms.ionizationEnergy": "Énergie d'ionisation hydrogénoïde",
    "atoms.orbitalNodes": "Nœuds radiaux",
    "atoms.orbitalRadius": "Rayon d'une orbitale 1s",
    "atoms.spinOrbitSplitting": "Couplage spin–orbite",
  },
  es: {
    "quantum.photonCount": "Número de fotones",
    "quantum.wienPeak": "Ley de Wien",
    "quantum.photoelectronSpeed": "Efecto fotoeléctrico",
    "quantum.deBroglie": "Longitud de onda de de Broglie",
    "quantum.uncertaintySpeed": "Principio de incertidumbre",
    "quantum.boxTransition": "Partícula en una caja",
    "quantum.vibrationWavenumber": "Número de onda de vibración",
    "quantum.zeroPointEnergy": "Energía de punto cero",
    "quantum.rotationalFrequency": "Transición de rotación",
    "atoms.hydrogenLine": "Líneas de los átomos hidrogenoides",
    "atoms.ionizationEnergy": "Energía de ionización hidrogenoide",
    "atoms.orbitalNodes": "Nodos radiales",
    "atoms.orbitalRadius": "Radio de un orbital 1s",
    "atoms.spinOrbitSplitting": "Acoplamiento espín–órbita",
  },
  en: {
    "quantum.photonCount": "Number of photons",
    "quantum.wienPeak": "Wien's law",
    "quantum.photoelectronSpeed": "Photoelectric effect",
    "quantum.deBroglie": "de Broglie wavelength",
    "quantum.uncertaintySpeed": "Uncertainty principle",
    "quantum.boxTransition": "Particle in a box",
    "quantum.vibrationWavenumber": "Vibrational wavenumber",
    "quantum.zeroPointEnergy": "Zero-point energy",
    "quantum.rotationalFrequency": "Rotational transition",
    "atoms.hydrogenLine": "Lines of hydrogenic atoms",
    "atoms.ionizationEnergy": "Hydrogenic ionization energy",
    "atoms.orbitalNodes": "Radial nodes",
    "atoms.orbitalRadius": "Radius of a 1s orbital",
    "atoms.spinOrbitSplitting": "Spin–orbit coupling",
  },
};

export const QT_MISTAKES: Record<Lang, Record<QuantumMistake, string>> = {
  fr: {
    lengthUnits: "Nanomètres, picomètres ou centimètres pris pour des mètres",
    hbarForH: "h au lieu de ħ, ou l'inverse : un facteur 2π",
    reducedMass: "Masse totale (ou d'un seul atome) au lieu de la masse réduite",
    nodesConfused: "Nœuds radiaux, angulaires et totaux confondus",
    averagesConfused: "Valeur moyenne et valeur la plus probable confondues",
  },
  es: {
    lengthUnits: "Nanómetros, picómetros o centímetros tomados por metros",
    hbarForH: "h en lugar de ħ, o al revés: un factor 2π",
    reducedMass: "Masa total (o de un solo átomo) en lugar de la masa reducida",
    nodesConfused: "Nodos radiales, angulares y totales confundidos",
    averagesConfused: "Valor medio y valor más probable confundidos",
  },
  en: {
    lengthUnits: "Nanometres, picometres or centimetres used as metres",
    hbarForH: "h for ħ, or the reverse: a factor of 2π",
    reducedMass: "Total mass (or one atom's) used for the reduced mass",
    nodesConfused: "Radial, angular and total nodes confused",
    averagesConfused: "Mean and most probable values confused",
  },
};
