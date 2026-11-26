/**
 * Texts of the physical chemistry calculations of Focuses 4–6 (physical
 * transformations, mixtures, chemical equilibrium), in French, Spanish and
 * English: merged into the tables of quiz-i18n.ts.
 */
type Lang = "fr" | "es" | "en";

export type EquilibriaPrompt =
  | "phaseRule" | "clapeyronSlope" | "vapourPressure" | "vaporizationEnthalpy" | "boilingTemperature" | "condensedPotential"
  | "gibbsMixing" | "entropyMixing" | "raoultPressure" | "vapourComposition" | "henrySolubility" | "freezingDepression"
  | "boilingElevation" | "osmoticMolarMass" | "leverRule" | "activityCoefficient" | "ionicStrength" | "debyeHuckel"
  | "constantFromGibbs" | "gibbsFromK" | "reactionGibbs" | "vantHoff" | "vantHoffEnthalpy" | "dissociationDegree"
  | "cellGibbs" | "cellEquilibrium" | "nernst" | "cellPotential" | "combinedPotential";

export type EquilibriaExplanation =
  | "phaseRule" | "clapeyron" | "clausiusClapeyron" | "vaporizationEnthalpy" | "boilingTemperature" | "condensedPotential"
  | "gibbsMixing" | "entropyMixing" | "raoult" | "vapourComposition" | "henry" | "colligative" | "osmosis" | "leverRule"
  | "activity" | "ionicStrength" | "debyeHuckel" | "constantFromGibbs" | "gibbsFromK" | "reactionGibbs" | "vantHoff"
  | "vantHoffEnthalpy" | "dissociationDegree" | "cellGibbs" | "cellEquilibrium" | "nernst" | "cellPotential" | "combinedPotential";

export type EquilibriaMistake =
  | "particlesForgotten" | "componentsSwapped" | "phaseCompositionConfused" | "totalForPartial" | "chargeNotSquared"
  | "lnForLog" | "potentialTimesElectrons" | "potentialsNotWeighted";



export const EQ_SKILLS: Record<Lang, Record<string, string>> = {
  fr: {
    "phases.phaseRule": "Règle des phases",
    "phases.clapeyronSlope": "Équation de Clapeyron",
    "phases.vapourPressure": "Pression de vapeur (Clausius–Clapeyron)",
    "phases.vaporizationEnthalpy": "ΔvapH à partir de deux pressions",
    "phases.boilingTemperature": "Ébullition sous une autre pression",
    "phases.condensedPotential": "Potentiel chimique d'une phase condensée",
    "mixtures.gibbsMixing": "Enthalpie libre de mélange",
    "mixtures.entropyMixing": "Entropie de mélange",
    "mixtures.raoultPressure": "Loi de Raoult",
    "mixtures.vapourComposition": "Composition de la vapeur",
    "mixtures.henrySolubility": "Loi de Henry",
    "mixtures.freezingDepression": "Cryoscopie",
    "mixtures.boilingElevation": "Ébulliométrie",
    "mixtures.osmoticMolarMass": "Masse molaire par osmométrie",
    "mixtures.leverRule": "Règle des moments",
    "mixtures.activityCoefficient": "Coefficient d'activité",
    "mixtures.ionicStrength": "Force ionique",
    "mixtures.debyeHuckel": "Loi limite de Debye–Hückel",
    "equilibrium.constantFromGibbs": "K à partir de ΔrG°",
    "equilibrium.gibbsFromK": "ΔrG° à partir de K",
    "equilibrium.reactionGibbs": "ΔrG et quotient réactionnel",
    "equilibrium.vantHoff": "Équation de van 't Hoff",
    "equilibrium.vantHoffEnthalpy": "ΔrH° à partir de deux K",
    "equilibrium.dissociationDegree": "Degré de dissociation et pression",
    "equilibrium.cellGibbs": "ΔrG° d'une pile",
    "equilibrium.cellEquilibrium": "K d'une réaction de pile",
    "equilibrium.nernst": "Équation de Nernst",
    "equilibrium.cellPotential": "Potentiel standard d'une pile",
    "equilibrium.combinedPotential": "Combiner des potentiels standard",
  },
  es: {
    "phases.phaseRule": "Regla de las fases",
    "phases.clapeyronSlope": "Ecuación de Clapeyron",
    "phases.vapourPressure": "Presión de vapor (Clausius–Clapeyron)",
    "phases.vaporizationEnthalpy": "ΔvapH a partir de dos presiones",
    "phases.boilingTemperature": "Ebullición a otra presión",
    "phases.condensedPotential": "Potencial químico de una fase condensada",
    "mixtures.gibbsMixing": "Energía de Gibbs de mezcla",
    "mixtures.entropyMixing": "Entropía de mezcla",
    "mixtures.raoultPressure": "Ley de Raoult",
    "mixtures.vapourComposition": "Composición del vapor",
    "mixtures.henrySolubility": "Ley de Henry",
    "mixtures.freezingDepression": "Crioscopia",
    "mixtures.boilingElevation": "Ebulloscopia",
    "mixtures.osmoticMolarMass": "Masa molar por osmometría",
    "mixtures.leverRule": "Regla de la palanca",
    "mixtures.activityCoefficient": "Coeficiente de actividad",
    "mixtures.ionicStrength": "Fuerza iónica",
    "mixtures.debyeHuckel": "Ley límite de Debye–Hückel",
    "equilibrium.constantFromGibbs": "K a partir de ΔrG°",
    "equilibrium.gibbsFromK": "ΔrG° a partir de K",
    "equilibrium.reactionGibbs": "ΔrG y cociente de reacción",
    "equilibrium.vantHoff": "Ecuación de van 't Hoff",
    "equilibrium.vantHoffEnthalpy": "ΔrH° a partir de dos K",
    "equilibrium.dissociationDegree": "Grado de disociación y presión",
    "equilibrium.cellGibbs": "ΔrG° de una pila",
    "equilibrium.cellEquilibrium": "K de una reacción de pila",
    "equilibrium.nernst": "Ecuación de Nernst",
    "equilibrium.cellPotential": "Potencial estándar de una pila",
    "equilibrium.combinedPotential": "Combinar potenciales estándar",
  },
  en: {
    "phases.phaseRule": "Phase rule",
    "phases.clapeyronSlope": "Clapeyron equation",
    "phases.vapourPressure": "Vapour pressure (Clausius–Clapeyron)",
    "phases.vaporizationEnthalpy": "ΔvapH from two vapour pressures",
    "phases.boilingTemperature": "Boiling at another pressure",
    "phases.condensedPotential": "Chemical potential of a condensed phase",
    "mixtures.gibbsMixing": "Gibbs energy of mixing",
    "mixtures.entropyMixing": "Entropy of mixing",
    "mixtures.raoultPressure": "Raoult's law",
    "mixtures.vapourComposition": "Composition of the vapour",
    "mixtures.henrySolubility": "Henry's law",
    "mixtures.freezingDepression": "Freezing-point depression",
    "mixtures.boilingElevation": "Boiling-point elevation",
    "mixtures.osmoticMolarMass": "Molar mass from osmometry",
    "mixtures.leverRule": "Lever rule",
    "mixtures.activityCoefficient": "Activity coefficient",
    "mixtures.ionicStrength": "Ionic strength",
    "mixtures.debyeHuckel": "Debye–Hückel limiting law",
    "equilibrium.constantFromGibbs": "K from ΔrG°",
    "equilibrium.gibbsFromK": "ΔrG° from K",
    "equilibrium.reactionGibbs": "ΔrG and the reaction quotient",
    "equilibrium.vantHoff": "van 't Hoff equation",
    "equilibrium.vantHoffEnthalpy": "ΔrH° from two values of K",
    "equilibrium.dissociationDegree": "Degree of dissociation and pressure",
    "equilibrium.cellGibbs": "ΔrG° of a cell",
    "equilibrium.cellEquilibrium": "K of a cell reaction",
    "equilibrium.nernst": "Nernst equation",
    "equilibrium.cellPotential": "Standard cell potential",
    "equilibrium.combinedPotential": "Combining standard potentials",
  },
};

export const EQ_MISTAKES: Record<Lang, Record<EquilibriaMistake, string>> = {
  fr: {
    particlesForgotten: "Ions d'un sel comptés comme une seule particule",
    componentsSwapped: "Fraction molaire d'un constituant associée à la grandeur de l'autre",
    phaseCompositionConfused: "Composition d'une phase prise pour celle de l'autre",
    totalForPartial: "Pression totale au lieu de la pression partielle",
    chargeNotSquared: "Charge non élevée au carré",
    lnForLog: "e^x au lieu de 10^x (ln au lieu de log₁₀)",
    potentialTimesElectrons: "Potentiels multipliés par le nombre d'électrons",
    potentialsNotWeighted: "Potentiels combinés sans les pondérer par les électrons",
  },
  es: {
    particlesForgotten: "Iones de una sal contados como una sola partícula",
    componentsSwapped: "Fracción molar de un componente con la magnitud del otro",
    phaseCompositionConfused: "Composición de una fase tomada por la de la otra",
    totalForPartial: "Presión total en lugar de la presión parcial",
    chargeNotSquared: "Carga no elevada al cuadrado",
    lnForLog: "e^x en lugar de 10^x (ln en lugar de log₁₀)",
    potentialTimesElectrons: "Potenciales multiplicados por el número de electrones",
    potentialsNotWeighted: "Potenciales combinados sin ponderarlos por los electrones",
  },
  en: {
    particlesForgotten: "A salt's ions counted as one particle",
    componentsSwapped: "One component's mole fraction paired with the other's property",
    phaseCompositionConfused: "One phase's composition taken for the other's",
    totalForPartial: "Total pressure used for the partial pressure",
    chargeNotSquared: "Charge not squared",
    lnForLog: "e^x for 10^x (ln for log₁₀)",
    potentialTimesElectrons: "Potentials multiplied by numbers of electrons",
    potentialsNotWeighted: "Potentials combined without weighting by electrons",
  },
};
