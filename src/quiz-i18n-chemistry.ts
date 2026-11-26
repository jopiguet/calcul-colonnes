/**
 * Texts of the physical chemistry tests, in French, Spanish and English:
 * merged into the tables of quiz-i18n.ts. The written questions of the bank
 * carry their own texts (shared/quiz/bank.ts).
 */
import type { ChemistryTopic, MistakeKey } from "../shared/quiz";
import type { Lang } from "./i18n";

export type ChemPrompt =
  | "concept" | "gasPressure" | "gasAmount" | "partialPressure" | "rmsSpeed" | "speedRatio" | "meanFreePath" | "compressionFactor"
  | "vdwPressure" | "criticalTemperature" | "expansionWork" | "reversibleWork" | "internalEnergyChange" | "enthalpyFromEnergy"
  | "hessLaw" | "reactionEnthalpy" | "kirchhoff" | "adiabaticTemperature" | "adiabaticPressure" | "entropyExpansion"
  | "entropyHeating" | "transitionEntropy" | "trouton" | "carnot" | "reactionEntropy" | "gibbsEnergy" | "crossoverTemperature"
  | "gibbsPressure" | "debyeEntropy";

export type ChemExplanation =
  | "concept" | "perfectGas" | "dalton" | "rmsSpeed" | "speedRatio" | "meanFreePath" | "compressionFactor" | "vanDerWaals"
  | "criticalConstants" | "expansionWork" | "reversibleWork" | "internalEnergy" | "enthalpyEnergy" | "hessLaw"
  | "formationEnthalpies" | "kirchhoff" | "adiabaticTemperature" | "adiabaticPressure" | "entropyExpansion" | "entropyHeating"
  | "transitionEntropy" | "trouton" | "carnot" | "reactionEntropy" | "gibbsEnergy" | "crossoverTemperature" | "gibbsPressure"
  | "debyeEntropy";

type ChemMistake =
  | "celsiusForKelvin" | "volumeUnits" | "energyUnits" | "massUnits" | "pressureUnits" | "gasConstantUnits" | "formulaInverted"
  | "moleFractionError" | "speedConfused" | "perfectForReal" | "attractionSign" | "cpCvConfused" | "stoichiometryForgotten"
  | "productsReactantsSwapped" | "elementsZero" | "isothermalForAdiabatic" | "exponentConfused" | "logBase" | "linearForLog"
  | "ratioInverted";

export const CHEM_TEXTS = {
  fr: {
    modeChemistry: "⚗️ Chimie physique",
    chemSetupTitle: "QCM de chimie physique",
    noBank: "Pas encore de questions de notions sur ce serveur : les tests ne contiennent que des calculs. Voir docs/question-bank.md.",
    flagQuestion: "⚑ Signaler cette question",
    flagNote: "Qu'est-ce qui ne va pas ? (facultatif)",
    flagSend: "Envoyer",
    flagThanks: "Merci, la question est signalée.",
    flagFailed: "Non envoyé : réessayer plus tard.",
    conceptsOf: "Notions {unit} – {title}",
    advancedOf: "Avancé {unit} – {title}",
    chemCore: "Fondamental",
    chemAdvanced: "Avancé",
    chemCoreHint: "Calculs et notions du cours.",
    chemAdvancedHint: "Raisonnements et démonstrations, un pas au-delà du cours. Pas de calculs.",
    noAdvanced: "Pas encore de questions avancées sur ce serveur. Voir docs/question-bank.md.",
  },
  es: {
    modeChemistry: "⚗️ Química física",
    chemSetupTitle: "Test de química física",
    noBank: "Aún no hay preguntas de conceptos en este servidor: los tests solo tienen cálculos. Ver docs/question-bank.md.",
    flagQuestion: "⚑ Señalar esta pregunta",
    flagNote: "¿Qué falla? (opcional)",
    flagSend: "Enviar",
    flagThanks: "Gracias, la pregunta está señalada.",
    flagFailed: "No enviado: inténtalo más tarde.",
    conceptsOf: "Conceptos {unit} – {title}",
    advancedOf: "Avanzado {unit} – {title}",
    chemCore: "Fundamental",
    chemAdvanced: "Avanzado",
    chemCoreHint: "Cálculos y conceptos del curso.",
    chemAdvancedHint: "Razonamientos y demostraciones, un paso más allá del curso. Sin cálculos.",
    noAdvanced: "Aún no hay preguntas avanzadas en este servidor. Ver docs/question-bank.md.",
  },
  en: {
    modeChemistry: "⚗️ Physical chemistry",
    chemSetupTitle: "Physical chemistry test",
    noBank: "No concept questions on this server yet: tests hold calculations only. See docs/question-bank.md.",
    flagQuestion: "⚑ Report this question",
    flagNote: "What is wrong? (optional)",
    flagSend: "Send",
    flagThanks: "Thank you, the question is reported.",
    flagFailed: "Not sent: try again later.",
    conceptsOf: "Concepts {unit} – {title}",
    advancedOf: "Advanced {unit} – {title}",
    chemCore: "Core",
    chemAdvanced: "Advanced",
    chemCoreHint: "Calculations and concepts of the course.",
    chemAdvancedHint: "Reasoning and derivations, a step beyond the course. No calculations.",
    noAdvanced: "No advanced questions on this server yet. See docs/question-bank.md.",
  },
} satisfies Record<Lang, Record<string, string>>;

export const CHEM_LEVEL: Record<Lang, string> = { fr: "Chimie physique", es: "Química física", en: "Physical chemistry" };
export const CHEM_ADVANCED: Record<Lang, string> = { fr: "Chimie physique avancée", es: "Química física avanzada", en: "Advanced physical chemistry" };
export const CHEM_GROUP: Record<Lang, string> = { fr: "Thermodynamique", es: "Termodinámica", en: "Thermodynamics" };

export const CHEM_TOPICS: Record<Lang, Record<ChemistryTopic, string>> = {
  fr: { gases: "1 · Les gaz", firstLaw: "2 · Premier principe", secondLaw: "3 · Deuxième et troisième principes", phases: "4 · Transformations physiques", mixtures: "5 · Les mélanges", equilibrium: "6 · L'équilibre chimique", quantum: "7 · Théorie quantique", atoms: "8 · Structure atomique et spectres", kinetics: "17 · Cinétique chimique", dynamics: "18 · Dynamique réactionnelle", spectroscopy: "11 · Spectroscopie moléculaire", resonance: "12 · Résonance magnétique", statistical: "13 · Thermodynamique statistique" },
  es: { gases: "1 · Los gases", firstLaw: "2 · Primer principio", secondLaw: "3 · Segundo y tercer principios", phases: "4 · Transformaciones físicas", mixtures: "5 · Las mezclas", equilibrium: "6 · El equilibrio químico", quantum: "7 · Teoría cuántica", atoms: "8 · Estructura atómica y espectros", kinetics: "17 · Cinética química", dynamics: "18 · Dinámica de reacción", spectroscopy: "11 · Espectroscopía molecular", resonance: "12 · Resonancia magnética", statistical: "13 · Termodinámica estadística" },
  en: { gases: "1 · Gases", firstLaw: "2 · The First Law", secondLaw: "3 · The Second and Third Laws", phases: "4 · Physical transformations", mixtures: "5 · Simple mixtures", equilibrium: "6 · Chemical equilibrium", quantum: "7 · Quantum theory", atoms: "8 · Atomic structure and spectra", kinetics: "17 · Chemical kinetics", dynamics: "18 · Reaction dynamics", spectroscopy: "11 · Molecular spectroscopy", resonance: "12 · Magnetic resonance", statistical: "13 · Statistical thermodynamics" },
};



export const CHEM_SKILLS: Record<Lang, Record<string, string>> = {
  fr: {
    "gases.perfectGasPressure": "Pression d'un gaz parfait",
    "gases.perfectGasAmount": "Quantité d'un gaz parfait",
    "gases.partialPressure": "Pression partielle (Dalton)",
    "gases.rmsSpeed": "Vitesse quadratique moyenne",
    "gases.speedRatio": "Vitesses moyennes de deux gaz",
    "gases.meanFreePath": "Libre parcours moyen",
    "gases.compressionFactor": "Facteur de compression",
    "gases.vdwPressure": "Pression d'un gaz de van der Waals",
    "gases.criticalTemperature": "Température critique",
    "firstLaw.expansionWork": "Travail de détente irréversible",
    "firstLaw.reversibleWork": "Travail isotherme réversible",
    "firstLaw.internalEnergyChange": "ΔU d'un gaz parfait chauffé",
    "firstLaw.enthalpyFromEnergy": "ΔH à partir de ΔU",
    "firstLaw.hessLaw": "Loi de Hess",
    "firstLaw.reactionEnthalpy": "Enthalpie de réaction (formation)",
    "firstLaw.kirchhoff": "Loi de Kirchhoff",
    "firstLaw.adiabaticTemperature": "Température après une adiabatique",
    "firstLaw.adiabaticPressure": "Pression après une adiabatique",
    "secondLaw.entropyExpansion": "Entropie d'une détente isotherme",
    "secondLaw.entropyHeating": "Entropie d'un chauffage",
    "secondLaw.transitionEntropy": "Entropie de vaporisation",
    "secondLaw.trouton": "Règle de Trouton",
    "secondLaw.carnot": "Rendement de Carnot",
    "secondLaw.reactionEntropy": "Entropie de réaction",
    "secondLaw.gibbsEnergy": "ΔG = ΔH − TΔS",
    "secondLaw.crossoverTemperature": "Température d'inversion de ΔG",
    "secondLaw.gibbsPressure": "Enthalpie libre et pression",
    "secondLaw.debyeEntropy": "Entropie à basse température (Debye)",
  },
  es: {
    "gases.perfectGasPressure": "Presión de un gas perfecto",
    "gases.perfectGasAmount": "Cantidad de un gas perfecto",
    "gases.partialPressure": "Presión parcial (Dalton)",
    "gases.rmsSpeed": "Velocidad cuadrática media",
    "gases.speedRatio": "Velocidades medias de dos gases",
    "gases.meanFreePath": "Recorrido libre medio",
    "gases.compressionFactor": "Factor de compresión",
    "gases.vdwPressure": "Presión de un gas de van der Waals",
    "gases.criticalTemperature": "Temperatura crítica",
    "firstLaw.expansionWork": "Trabajo de expansión irreversible",
    "firstLaw.reversibleWork": "Trabajo isotermo reversible",
    "firstLaw.internalEnergyChange": "ΔU de un gas perfecto calentado",
    "firstLaw.enthalpyFromEnergy": "ΔH a partir de ΔU",
    "firstLaw.hessLaw": "Ley de Hess",
    "firstLaw.reactionEnthalpy": "Entalpía de reacción (formación)",
    "firstLaw.kirchhoff": "Ley de Kirchhoff",
    "firstLaw.adiabaticTemperature": "Temperatura tras una adiabática",
    "firstLaw.adiabaticPressure": "Presión tras una adiabática",
    "secondLaw.entropyExpansion": "Entropía de una expansión isoterma",
    "secondLaw.entropyHeating": "Entropía de un calentamiento",
    "secondLaw.transitionEntropy": "Entropía de vaporización",
    "secondLaw.trouton": "Regla de Trouton",
    "secondLaw.carnot": "Rendimiento de Carnot",
    "secondLaw.reactionEntropy": "Entropía de reacción",
    "secondLaw.gibbsEnergy": "ΔG = ΔH − TΔS",
    "secondLaw.crossoverTemperature": "Temperatura de inversión de ΔG",
    "secondLaw.gibbsPressure": "Energía de Gibbs y presión",
    "secondLaw.debyeEntropy": "Entropía a baja temperatura (Debye)",
  },
  en: {
    "gases.perfectGasPressure": "Pressure of a perfect gas",
    "gases.perfectGasAmount": "Amount of a perfect gas",
    "gases.partialPressure": "Partial pressure (Dalton)",
    "gases.rmsSpeed": "Root-mean-square speed",
    "gases.speedRatio": "Mean speeds of two gases",
    "gases.meanFreePath": "Mean free path",
    "gases.compressionFactor": "Compression factor",
    "gases.vdwPressure": "Pressure of a van der Waals gas",
    "gases.criticalTemperature": "Critical temperature",
    "firstLaw.expansionWork": "Work of an irreversible expansion",
    "firstLaw.reversibleWork": "Reversible isothermal work",
    "firstLaw.internalEnergyChange": "ΔU of a heated perfect gas",
    "firstLaw.enthalpyFromEnergy": "ΔH from ΔU",
    "firstLaw.hessLaw": "Hess's law",
    "firstLaw.reactionEnthalpy": "Reaction enthalpy (formation)",
    "firstLaw.kirchhoff": "Kirchhoff's law",
    "firstLaw.adiabaticTemperature": "Temperature after an adiabatic change",
    "firstLaw.adiabaticPressure": "Pressure after an adiabatic change",
    "secondLaw.entropyExpansion": "Entropy of an isothermal expansion",
    "secondLaw.entropyHeating": "Entropy of heating",
    "secondLaw.transitionEntropy": "Entropy of vaporization",
    "secondLaw.trouton": "Trouton's rule",
    "secondLaw.carnot": "Carnot efficiency",
    "secondLaw.reactionEntropy": "Reaction entropy",
    "secondLaw.gibbsEnergy": "ΔG = ΔH − TΔS",
    "secondLaw.crossoverTemperature": "Temperature where ΔG changes sign",
    "secondLaw.gibbsPressure": "Gibbs energy and pressure",
    "secondLaw.debyeEntropy": "Entropy at low temperature (Debye)",
  },
};

export const CHEM_MISTAKES: Record<Lang, Record<ChemMistake, string>> = {
  fr: {
    celsiusForKelvin: "Température en °C au lieu de kelvins",
    volumeUnits: "dm³ et m³ confondus (facteur 1000)",
    energyUnits: "J et kJ confondus (facteur 1000)",
    massUnits: "Masse molaire en g mol⁻¹ au lieu de kg mol⁻¹",
    pressureUnits: "kPa pris pour des pascals",
    gasConstantUnits: "Mauvaise constante (R dans d'autres unités, ou R pour k)",
    formulaInverted: "Relation retournée",
    moleFractionError: "Rapport des quantités pris pour une fraction molaire",
    speedConfused: "Vitesses moyenne, la plus probable et quadratique confondues",
    perfectForReal: "Loi des gaz parfaits pour un gaz réel",
    attractionSign: "Terme d'attraction ajouté au lieu d'être retranché",
    cpCvConfused: "C_p et C_V confondus",
    stoichiometryForgotten: "Nombres stœchiométriques oubliés",
    productsReactantsSwapped: "Réactifs moins produits",
    elementsZero: "Entropie des corps simples prise nulle",
    isothermalForAdiabatic: "Température supposée constante dans une adiabatique",
    exponentConfused: "Exposant γ, 1/γ ou 1/c confondu",
    logBase: "log₁₀ au lieu de ln",
    linearForLog: "Différence au lieu d'un logarithme",
    ratioInverted: "Rapport à l'envers",
  },
  es: {
    celsiusForKelvin: "Temperatura en °C en lugar de kelvin",
    volumeUnits: "dm³ y m³ confundidos (factor 1000)",
    energyUnits: "J y kJ confundidos (factor 1000)",
    massUnits: "Masa molar en g mol⁻¹ en lugar de kg mol⁻¹",
    pressureUnits: "kPa tomados por pascales",
    gasConstantUnits: "Constante equivocada (R en otras unidades, o R por k)",
    formulaInverted: "Relación invertida",
    moleFractionError: "Cociente de cantidades tomado por fracción molar",
    speedConfused: "Velocidades media, más probable y cuadrática confundidas",
    perfectForReal: "Ley de los gases perfectos para un gas real",
    attractionSign: "Término de atracción sumado en lugar de restado",
    cpCvConfused: "C_p y C_V confundidos",
    stoichiometryForgotten: "Números estequiométricos olvidados",
    productsReactantsSwapped: "Reactivos menos productos",
    elementsZero: "Entropía de los elementos tomada como cero",
    isothermalForAdiabatic: "Temperatura supuesta constante en una adiabática",
    exponentConfused: "Exponente γ, 1/γ o 1/c confundido",
    logBase: "log₁₀ en lugar de ln",
    linearForLog: "Diferencia en lugar de un logaritmo",
    ratioInverted: "Cociente al revés",
  },
  en: {
    celsiusForKelvin: "Temperature in °C instead of kelvins",
    volumeUnits: "dm³ and m³ mixed (factor 1000)",
    energyUnits: "J and kJ mixed (factor 1000)",
    massUnits: "Molar mass in g mol⁻¹ instead of kg mol⁻¹",
    pressureUnits: "kPa taken for pascals",
    gasConstantUnits: "Wrong constant (R in other units, or R for k)",
    formulaInverted: "Relation turned upside down",
    moleFractionError: "Ratio of amounts taken for a mole fraction",
    speedConfused: "Mean, most probable and rms speeds confused",
    perfectForReal: "Perfect gas law for a real gas",
    attractionSign: "Attraction term added instead of subtracted",
    cpCvConfused: "C_p and C_V confused",
    stoichiometryForgotten: "Stoichiometric numbers left out",
    productsReactantsSwapped: "Reactants minus products",
    elementsZero: "Entropy of elements taken as zero",
    isothermalForAdiabatic: "Temperature taken as constant in an adiabatic change",
    exponentConfused: "Exponent γ, 1/γ or 1/c confused",
    logBase: "log₁₀ instead of ln",
    linearForLog: "Difference instead of a logarithm",
    ratioInverted: "Ratio upside down",
  },
};

// Every chemistry mistake has a name (checked by the compiler).
export type ChemMistakesCovered = ChemMistake extends MistakeKey ? true : never;
