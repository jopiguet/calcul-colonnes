import type { Rng } from "./rng";
import type { Fn } from "./tex";

export type Fn2 = (x: number, y: number) => number;

/**
 * "school" and "university" are the levels of the mathematics tests;
 * "chemistry" and "chemistryAdvanced" those of physical chemistry, a test of
 * its own (its topics are the Focuses of Atkins' Physical Chemistry): core
 * calculations and concepts, or advanced reasoning and derivations.
 */
export type Level = "school" | "university" | "chemistry" | "chemistryAdvanced" | "linux" | "chembio";
export type MathTopic = "derivatives" | "integrals" | "trigonometry" | "limits" | "explog" | "probability" | "sequences" | "complex" | "odes" | "linear" | "functions" | "geometry" | "series" | "multivariable" | "graphs";
/**
 * Physical chemistry, by Focus: 1 gases, 2 First Law, 3 Second and Third Laws,
 * 4 physical transformations, 5 mixtures, 6 chemical equilibrium, 7 quantum
 * theory, 8 atomic structure and spectra.
 */
export type ChemistryTopic = "gases" | "firstLaw" | "secondLaw" | "phases" | "mixtures" | "equilibrium" | "quantum" | "atoms";
/** The Linux command line: core commands by area, then tools that need installing. */
export type LinuxTopic = "linuxFiles" | "linuxText" | "linuxShell" | "linuxProcesses" | "linuxSystem" | "linuxNetwork" | "linuxTools" | "linuxScripting" | "linuxGit" | "linuxVim";
/** Chemistry and biology basics: balancing equations, first. */
export type ChemBioTopic = "balancing";
export type Topic = MathTopic | ChemistryTopic | LinuxTopic | ChemBioTopic;

export const LEVELS: Level[] = ["school", "university", "chemistry", "chemistryAdvanced", "linux", "chembio"];
/** Topics of the chemistry-and-biology test. */
export const CHEMBIO_TOPICS: ChemBioTopic[] = ["balancing"];
/** Topics of the Linux test. */
export const LINUX_TOPICS: LinuxTopic[] = ["linuxFiles", "linuxText", "linuxShell", "linuxProcesses", "linuxSystem", "linuxNetwork", "linuxTools", "linuxScripting", "linuxGit", "linuxVim"];
/** The three subjects of the tests, each with its own levels and topics. */
export type Subject = "maths" | "chemistry" | "linux" | "chembio";
export const subjectOf = (level: Level): Subject =>
  level === "linux" ? "linux" : level === "chembio" ? "chembio" : level === "chemistry" || level === "chemistryAdvanced" ? "chemistry" : "maths";
/** Topics of the physical chemistry test. */
export const CHEMISTRY_TOPICS: ChemistryTopic[] = ["gases", "firstLaw", "secondLaw", "phases", "mixtures", "equilibrium", "quantum", "atoms"];
/** The levels offered in the mathematics test's settings. */
export const MATH_LEVELS: Level[] = ["school", "university"];
/** The levels offered in the physical chemistry test's settings. */
export const CHEMISTRY_LEVELS: Level[] = ["chemistry", "chemistryAdvanced"];
export const isChemistry = (level: Level): boolean => level === "chemistry" || level === "chemistryAdvanced";
/** Every topic; new ones are appended (the order is the selector's within a group). */
export const TOPICS: Topic[] = ["derivatives", "integrals", "trigonometry", "limits", "explog", "probability", "sequences", "complex", "odes", "linear", "functions", "geometry", "series", "multivariable", "graphs", "gases", "firstLaw", "secondLaw", "linuxFiles", "linuxText", "linuxShell", "linuxProcesses", "linuxSystem", "linuxNetwork", "linuxTools", "phases", "mixtures", "equilibrium", "balancing", "quantum", "atoms", "linuxScripting", "linuxGit", "linuxVim"];

export type TopicGroup = "analysis" | "algebra" | "geometry" | "probability" | "thermodynamics" | "linuxCommands" | "linuxDev" | "linuxInstall" | "reactions" | "structure";
/** How the topics are grouped in the test's settings. */
export const TOPIC_GROUPS: { group: TopicGroup; topics: Topic[] }[] = [
  { group: "analysis", topics: ["graphs", "functions", "sequences", "derivatives", "integrals", "limits", "explog", "trigonometry", "odes", "series", "multivariable"] },
  { group: "algebra", topics: ["complex", "linear"] },
  { group: "geometry", topics: ["geometry"] },
  { group: "probability", topics: ["probability"] },
  { group: "thermodynamics", topics: ["gases", "firstLaw", "secondLaw", "phases", "mixtures", "equilibrium"] },
  { group: "structure", topics: ["quantum", "atoms"] },
  { group: "linuxCommands", topics: ["linuxFiles", "linuxText", "linuxShell", "linuxProcesses", "linuxSystem", "linuxNetwork"] },
  { group: "linuxDev", topics: ["linuxScripting", "linuxGit", "linuxVim"] },
  { group: "linuxInstall", topics: ["linuxTools"] },
  { group: "reactions", topics: ["balancing"] },
];

/**
 * A text in several languages: English always, others when written. The app
 * shows the interface's language, English otherwise. Inline formulas between
 * $…$ are TeX.
 */
export type Localized = { en: string } & Partial<Record<"fr" | "es", string>>;

/** Question sentences; translated by the app. */
export type PromptKey =
  | "derivative"
  | "primitive"
  | "integral"
  | "exactValue"
  | "solveInterval"
  | "solve"
  | "identity"
  | "limit"
  | "simplify"
  | "period"
  | "probability"
  | "expectation"
  | "variance"
  | "chooseUnordered"
  | "independent"
  | "standardize"
  | "arithmeticTerm"
  | "geometricTerm"
  | "arithmeticSum"
  | "geometricSum"
  | "explicitTerm"
  | "algebraicForm"
  | "modulus"
  | "argument"
  | "exponentialForm"
  | "complexRoots"
  | "isRoot"
  | "odeSolution"
  | "determinant"
  | "scaledDeterminant"
  | "matrixProduct"
  | "matrixInverse"
  | "linearSystem"
  | "eigenvalues"
  | "rank"
  | "tangentLine"
  | "extremumAbscissa"
  | "inflection"
  | "localMaximum"
  | "obliqueAsymptote"
  | "dotProduct"
  | "vectorNorm"
  | "vectorAngle"
  | "planeEquation"
  | "pointPlaneDistance"
  | "crossProduct"
  | "linePlane"
  | "seriesSum"
  | "radius"
  | "partialDerivative"
  | "gradient"
  | "criticalPoint"
  | "doubleIntegral"
  | "derivativeCurve"
  | "primitiveCurve"
  | "formulaToCurve"
  | "curveToFormula"
  | "transformCurve"
  | "tangentSlope"
  | "solutionCount"
  | "planeFromEquation"
  // physical chemistry: a written question (its text is in the prompt), then calculations
  | "concept"
  | "gasPressure"
  | "gasAmount"
  | "partialPressure"
  | "rmsSpeed"
  | "speedRatio"
  | "meanFreePath"
  | "compressionFactor"
  | "vdwPressure"
  | "criticalTemperature"
  | "expansionWork"
  | "reversibleWork"
  | "internalEnergyChange"
  | "enthalpyFromEnergy"
  | "hessLaw"
  | "reactionEnthalpy"
  | "kirchhoff"
  | "adiabaticTemperature"
  | "adiabaticPressure"
  | "entropyExpansion"
  | "entropyHeating"
  | "transitionEntropy"
  | "trouton"
  | "carnot"
  | "reactionEntropy"
  | "gibbsEnergy"
  | "crossoverTemperature"
  | "gibbsPressure"
  | "debyeEntropy"
  | "phaseRule"
  | "clapeyronSlope"
  | "vapourPressure"
  | "vaporizationEnthalpy"
  | "boilingTemperature"
  | "condensedPotential"
  | "gibbsMixing"
  | "entropyMixing"
  | "raoultPressure"
  | "vapourComposition"
  | "henrySolubility"
  | "freezingDepression"
  | "boilingElevation"
  | "osmoticMolarMass"
  | "leverRule"
  | "activityCoefficient"
  | "ionicStrength"
  | "debyeHuckel"
  | "constantFromGibbs"
  | "gibbsFromK"
  | "reactionGibbs"
  | "vantHoff"
  | "vantHoffEnthalpy"
  | "dissociationDegree"
  | "cellGibbs"
  | "cellEquilibrium"
  | "nernst"
  | "cellPotential"
  | "combinedPotential"
  // Linux: written questions use "concept"; generated ones
  | "chmodToOctal"
  | "chmodToSymbolic"
  | "umask"
  | "cron"
  // chemistry basics
  | "balanceEquation"
  | "balanceCoefficient"
  // quantum theory and atomic structure
  | "photonCount"
  | "wienPeak"
  | "photoelectronSpeed"
  | "deBroglie"
  | "uncertaintyProton"
  | "uncertaintyElectron"
  | "boxTransition"
  | "vibrationWavenumber"
  | "zeroPointEnergy"
  | "rotationalFrequency"
  | "hydrogenLine"
  | "ionizationEnergy"
  | "orbitalNodes"
  | "meanRadius"
  | "mostProbableRadius"
  | "spinOrbitSplitting";

/** Explanation sentences; translated by the app. */
export type ExplanationKey =
  | "powerRule"
  | "chainRule"
  | "productRule"
  | "quotientRule"
  | "powerPrimitive"
  | "linearPrimitive"
  | "logPrimitive"
  | "fundamental"
  | "parts"
  | "substitution"
  | "unitCircle"
  | "trigEquation"
  | "trigFormula"
  | "period"
  | "inverseTrig"
  | "dominantTerms"
  | "sinOverX"
  | "growth"
  | "factor"
  | "expLimit"
  | "derivativeAtZero"
  | "taylor"
  | "expLog"
  | "logRules"
  | "substituteExp"
  | "binomial"
  | "binomialMoments"
  | "totalProbability"
  | "bayes"
  | "combinations"
  | "expectation"
  | "union"
  | "poisson"
  | "exponentialLaw"
  | "standardize"
  | "arithmeticTerm"
  | "geometricTerm"
  | "arithmeticSum"
  | "geometricSum"
  | "geometricLimit"
  | "fixedPoint"
  | "explicitTerm"
  | "complexProduct"
  | "complexQuotient"
  | "modulus"
  | "argument"
  | "exponentialForm"
  | "complexQuadratic"
  | "deMoivre"
  | "nthRoots"
  | "odeHomogeneous"
  | "odeAffine"
  | "odeSeparable"
  | "odeDistinct"
  | "odeDouble"
  | "odeComplex"
  | "determinant2"
  | "determinant3"
  | "scaledDeterminant"
  | "matrixProduct"
  | "matrixInverse"
  | "linearSystem"
  | "eigenvalues"
  | "rank"
  | "tangentLine"
  | "vertex"
  | "quadraticRoots"
  | "inflection"
  | "localExtremum"
  | "obliqueAsymptote"
  | "dotProduct"
  | "vectorNorm"
  | "vectorAngle"
  | "planeEquation"
  | "pointPlaneDistance"
  | "crossProduct"
  | "linePlane"
  | "geometricSeries"
  | "telescoping"
  | "exponentialSeries"
  | "radius"
  | "partialDerivative"
  | "gradient"
  | "criticalPoint"
  | "doubleIntegral"
  | "derivativeCurve"
  | "primitiveCurve"
  | "formulaToCurve"
  | "curveToFormula"
  | "transformCurve"
  | "tangentSlope"
  | "solutionCount"
  | "planeFromEquation"
  | "concept"
  | "perfectGas"
  | "dalton"
  | "rmsSpeed"
  | "speedRatio"
  | "meanFreePath"
  | "compressionFactor"
  | "vanDerWaals"
  | "criticalConstants"
  | "expansionWork"
  | "reversibleWork"
  | "internalEnergy"
  | "enthalpyEnergy"
  | "hessLaw"
  | "formationEnthalpies"
  | "kirchhoff"
  | "adiabaticTemperature"
  | "adiabaticPressure"
  | "entropyExpansion"
  | "entropyHeating"
  | "transitionEntropy"
  | "trouton"
  | "carnot"
  | "reactionEntropy"
  | "gibbsEnergy"
  | "crossoverTemperature"
  | "gibbsPressure"
  | "debyeEntropy"
  | "phaseRule"
  | "clapeyron"
  | "clausiusClapeyron"
  | "vaporizationEnthalpy"
  | "boilingTemperature"
  | "condensedPotential"
  | "gibbsMixing"
  | "entropyMixing"
  | "raoult"
  | "vapourComposition"
  | "henry"
  | "colligative"
  | "osmosis"
  | "leverRule"
  | "activity"
  | "ionicStrength"
  | "debyeHuckel"
  | "constantFromGibbs"
  | "gibbsFromK"
  | "reactionGibbs"
  | "vantHoff"
  | "vantHoffEnthalpy"
  | "dissociationDegree"
  | "cellGibbs"
  | "cellEquilibrium"
  | "nernst"
  | "cellPotential"
  | "combinedPotential"
  | "chmod"
  | "umask"
  | "cron"
  | "balanceEquation"
  | "photonCount"
  | "wienPeak"
  | "photoelectronSpeed"
  | "deBroglie"
  | "uncertaintySpeed"
  | "boxTransition"
  | "vibrationWavenumber"
  | "zeroPointEnergy"
  | "rotationalFrequency"
  | "hydrogenLine"
  | "ionizationEnergy"
  | "orbitalNodes"
  | "meanRadius"
  | "mostProbableRadius"
  | "spinOrbitSplitting";

/**
 * The mistake a wrong option stands for. Recorded when a player picks it, so
 * that the progress page can show which mistakes come back. Labels do not
 * change what a seed produces.
 */
export const MISTAKES = [
  // derivatives
  "exponentKept", // n·xⁿ instead of n·xⁿ⁻¹
  "coefficientMissing", // exponent not brought down as a factor
  "constantKept", // derivative of a constant not zero
  "termDropped", // a term forgotten
  "chainRuleForgotten", // derivative of the inside forgotten
  "wrongInnerFactor", // wrong factor from the inside function
  "productRule", // (uv)′ misapplied
  "quotientRule", // (u/v)′ misapplied
  "logDerivative", // derivative of ln misapplied
  "powerRuleOnExponential", // power rule applied to an exponential
  // integrals
  "derivedInstead", // derivative given instead of a primitive
  "wrongPowerDivisor", // divided by n instead of n + 1, or not at all
  "constantNotIntegrated", // constant term left out of the primitive
  "multipliedInsteadOfDivided", // ×a instead of ÷a for f(ax)
  "wrongFactor", // missing or extra constant factor
  "logPrimitiveError", // primitive of 1/x not known
  "byParts", // integration by parts unfinished or misapplied
  "substitutionError", // change of variable misapplied
  "boundsError", // F(b) − F(a) misapplied
  // trigonometry
  "sinCosSwapped",
  "exactValueError", // wrong exact value
  "missingSolution",
  "wrongSymmetry", // π − x, 2π − x, π + x confused
  "outOfRange", // value outside the interval or the principal range
  "trigFormula", // trigonometric formula misremembered
  "periodError",
  // limits
  "dominantTerms", // highest-degree terms misidentified
  "growthReversed", // exp, powers and ln compared the wrong way
  "indeterminateGuess", // indeterminate form taken for a value
  "invertedRatio", // a/b instead of b/a
  "taylorError", // expansion coefficient wrong
  "factorisationError",
  // exponentials and logarithms
  "logRules", // properties of ln misapplied
  "expLogInverse", // exp and ln composed wrongly
  "solvingError", // equation solved in the wrong order
  // probability
  "binomialCoefficient", // C(n, k) forgotten or replaced
  "complementForgotten", // (1 − p) or P(Ā) left out
  "powersSwapped", // p^(n−k)(1 − p)^k
  "meanVarianceConfused", // np for np(1 − p), or the reverse
  "complementTaken", // 1 − P instead of P, or (1 − p) instead of p
  "branchForgotten", // one branch of the tree left out
  "notWeighted", // conditional probabilities added without their weights
  "conditionalReversed", // P(B | A) given for P(A | B)
  "jointForConditional", // P(A ∩ B) or P(B) given for P(A | B)
  "baseRateIgnored", // P(A) left out of Bayes' formula
  "orderCounted", // arrangements counted for combinations
  "withReplacement", // nᵏ: drawing with replacement
  "countingError",
  "unweightedMean", // plain mean of the values, not weighted by their probabilities
  "unionNotSubtracted", // P(A) + P(B) without P(A ∩ B)
  "sdVarianceConfused", // σ and σ² (or √V and V) confused
  "factorialForgotten", // k! left out
  "rateMeanConfused", // λ and 1/λ confused
  "densityForProbability", // the density's value taken for a probability
  // sequences
  "offByOne", // an index or a number of terms off by one
  "arithmeticGeometricConfused", // the formula of the other kind of sequence
  "firstTermKept", // the first term left out, or kept as the answer
  "convergenceMisjudged", // limit of qⁿ decided the wrong way
  "fixedPointForgotten", // uₙ − ℓ not formed: the limit left out
  // complex numbers
  "iSquared", // i² taken as +1
  "componentwise", // multiplied, divided or added part by part
  "conjugateForgotten", // a quotient not multiplied by the conjugate
  "sqrtForgotten", // a² + b² for the modulus, or the discriminant not square-rooted
  "argumentQuadrant", // the argument in the wrong quadrant
  "argumentSign", // the argument of the conjugate
  "discriminantSign", // a negative discriminant treated as positive
  "powerMisapplied", // modulus or argument not raised (or not rooted)
  "rootSpacing", // n-th roots not spaced by 2π/n
  // differential equations
  "initialConditionMisapplied", // the constant set to y(0) without the rest, or constants swapped
  "characteristicRoots", // wrong roots of the characteristic equation
  "doubleRootFactor", // the x of a double root forgotten
  "separationError", // variables not separated: the integral of ax forgotten
  // linear algebra
  "determinantPattern", // the wrong products taken
  "cofactorSign", // cofactor signs (+ − +) forgotten
  "scalarPower", // det(kA) = k·det A instead of kⁿ·det A
  "orderSwapped", // BA for AB, or x and y swapped
  "rowByRow", // rows multiplied by rows
  "adjugateError", // diagonal not swapped, or the wrong entries negated
  "diagonalTaken", // the diagonal taken for the eigenvalues
  "traceDeterminantConfused", // trace and determinant taken for the eigenvalues
  "rankMiscounted",
  // function study
  "tangentPointForgotten", // y = f′(a)x + f(a): the point a left out
  "tangentRolesSwapped", // f(a) as the slope, f′(a) as the value
  "valueAbscissaConfused", // the abscissa given for the value, or the reverse
  "vietaConfused", // the sum and product of the roots taken for the roots
  "derivativeOrder", // f′ used where f″ is needed
  "maxMinConfused", // the minimum given for the maximum
  "asymptoteDivision", // the division not done: the numerator's terms kept
  // vectors and geometry
  "componentsMismatched", // coordinates paired with the wrong partners
  "supplementaryAngle", // π − θ for θ: the sign of the dot product misread
  "normalPointSwapped", // the point used as the normal, the normal as the point
  "normForgotten", // the distance not divided by the normal's length
  "denominatorForgotten", // a quotient's denominator left out
  // series and several variables
  "telescopingTerms", // only one of the partial fractions summed, or the 1/k left out
  "variableConfused", // differentiated with respect to the other variable
  // reading graphs
  "givenCurveChosen", // the curve already given (f for f′, f′ for f)
  "primitiveForDerivative", // a primitive taken for the derivative
  "shiftDirection", // f(x − c) moved left, or f(x + c) right
  "axisConfused", // a transformation applied along the other axis
  "interceptForSlope", // the line's intercept read as its slope
  "coefficientsAsIntercepts", // the equation's coefficients taken for the intercepts
  // physical chemistry
  "celsiusForKelvin", // a temperature in °C used where kelvins are needed
  "volumeUnits", // dm³ and m³ (or cm³) mixed: a factor of 1000
  "energyUnits", // J and kJ mixed: a factor of 1000
  "massUnits", // g and kg mixed: molar mass not in kg mol⁻¹
  "pressureUnits", // kPa (or bar) used as pascals: a factor of 1000 (or 10⁵)
  "gasConstantUnits", // the wrong constant: R in L atm or dm³ bar where SI units are needed, or R for k
  "formulaInverted", // the quantity asked used as given: a relation turned upside down
  "moleFractionError", // a ratio of amounts taken for a mole fraction
  "speedConfused", // mean, most probable and root-mean-square speeds confused
  "perfectForReal", // the perfect gas law used where the gas is not perfect
  "attractionSign", // the van der Waals attraction added instead of subtracted
  "cpCvConfused", // Cp used for Cv, or the reverse
  "stoichiometryForgotten", // the stoichiometric numbers left out
  "productsReactantsSwapped", // reactants minus products
  "elementsZero", // standard entropies of elements taken as zero
  "isothermalForAdiabatic", // the temperature taken as constant in an adiabatic change
  "exponentConfused", // γ, 1/γ and 1/c confused in adiabatic relations
  "logBase", // log₁₀ used where ln is needed
  "linearForLog", // ΔT/T for ln(T₂/T₁)
  "ratioInverted", // a ratio upside down: V₁/V₂ for V₂/V₁
  "particlesForgotten", // a salt counted as one particle: the ions it gives ignored
  "componentsSwapped", // each component's mole fraction paired with the other's property
  "phaseCompositionConfused", // the composition of one phase taken for the other's, or for the overall one
  "totalForPartial", // the total pressure used where a partial pressure is needed
  "chargeNotSquared", // |z| for z² in the ionic strength
  "lnForLog", // e^x where 10^x is needed: ln for log₁₀
  "potentialTimesElectrons", // electrode potentials multiplied by electron numbers to subtract them
  "potentialsNotWeighted", // potentials subtracted directly where Gibbs energies (νE) must be
  "lengthUnits", // nm, pm or cm used as metres: a power of ten
  "hbarForH", // h used for ħ, or the reverse: a factor of 2π
  "reducedMass", // the total mass (or one atom's) used for the reduced mass
  "nodesConfused", // radial, angular and total nodes confused
  "averagesConfused", // the mean and the most probable value confused
  // Linux
  "permissionClassesSwapped",
  "permissionWeights",
  "umaskOred",
  "umaskExecOnFiles",
  "cronFieldsSwapped",
  "cronStepRead",
  "cronDayFields",
  "sedFlagMisread", // no flag, g and a number confused: first, every, n-th match
  "sedReference", // & or \1 in the replacement taken literally, or dropped
  "sedWholeLine", // only the matched part kept, or the whole line replaced
  "regexGreedy", // .* taken to stop at the first possible end
  "fieldOffByOne", // awk fields counted from 0, or the neighbour taken
  "awkNfConfused", // NF (how many) and $NF (the last field) confused
  "awkSeparator", // the field separator ignored or misread
  "awkConcat", // $1 $2 (joined) and $1, $2 (with OFS) confused
  "expansionLongest", // # and ##, or % and %%: shortest and longest match confused
  "expansionSide", // # (front) and % (back) confused
  // balancing equations
  "subscriptChanged", // a formula's subscript changed instead of a coefficient: another substance
  "notLowestTerms", // balanced, but not in the smallest whole numbers
  "elementUnbalanced", // one coefficient off: an element left unbalanced
  "diatomicForgotten", // O₂, H₂, N₂, Cl₂ written as single atoms
  // everywhere
  "signError",
] as const;

export type MistakeKey = (typeof MISTAKES)[number];

/** An answer: its LaTeX, and what it stands for (function, number or set of numbers). */
/**
 * A picture the app draws: curves in a window (grid every unit), or a plane in
 * space drawn through its three intercepts. Generators give every option of a
 * question the same window, so options can be compared by eye.
 */
export type Graph =
  | {
      type: "curves";
      x: [number, number];
      y: [number, number];
      /** "main" curves are solid, "guide" ones (a tangent, a level y = k) dashed. */
      curves: { fn: Fn; style?: "main" | "guide" }[];
      points?: { x: number; y: number; label?: string }[];
    }
  | {
      type: "plane";
      /** Where the plane cuts the x, y and z axes. */
      intercepts: [number, number, number];
      /** The axes are drawn from −extent to extent: the same for every option. */
      extent: number;
    };

export interface Option {
  /** Its formula: shown in the corrections under a graph, and unique within a question. */
  tex: string;
  /** Shown as a graph instead of a formula. */
  graph?: Graph;
  fn?: Fn;
  num?: number;
  set?: number[];
  /** A complex number [re, im]. */
  z?: [number, number];
  /** A set of complex numbers. */
  zs?: [number, number][];
  /** For a wrong option: the mistake it stands for. */
  mistake?: MistakeKey;
  /** A written answer, shown instead of the formula (the formula is then only its identity). */
  text?: Localized;
  /** Values spread over powers of ten (an equilibrium constant): offered as choices, never typed. */
  choiceOnly?: boolean;
}

/** A wrong option labelled with its mistake. */
export const tag = (option: Option, mistake: MistakeKey): Option => ({ ...option, mistake });

/** How the correct answer is defined; used to tell options apart and by the check script. */
export type Verify =
  | { kind: "derivative"; f: Fn } // options are f'
  | { kind: "primitive"; f: Fn } // options are primitives of f (equal up to a constant)
  | { kind: "identity"; f: Fn } // options are functions equal to f
  | { kind: "integral"; f: Fn; a: number; b: number } // options are numbers
  | { kind: "limit"; f: Fn; probe: number } // f(probe) is close to the limit
  | { kind: "value"; value: number }
  | { kind: "root"; f: Fn } // the option x satisfies f(x) = 0
  | { kind: "solutions"; f: Fn; lo: number; hi: number } // all roots of f in [lo, hi[
  | { kind: "complex"; re: number; im: number } // options are this complex number
  | { kind: "complexRoots"; coefficients: number[] } // options are the set of all roots of this polynomial (highest degree first)
  | { kind: "complexRoot"; n: number; re: number; im: number } // the option z satisfies zⁿ = re + i·im
  /**
   * The option is a function y satisfying the equation, written as a residual
   * equation(y, y′, y″, x) = 0, with y(0) = y0 and, for a second-order one, y′(0) = dy0.
   */
  | { kind: "ode"; equation: (y: number, dy: number, d2y: number, x: number) => number; y0: number; dy0?: number }
  // Linear algebra: options are numbers (`num`) or matrices and vectors row by row (`set`).
  | { kind: "determinant"; a: number[][] } // the option is det a
  | { kind: "rank"; a: number[][] } // the option is the rank of a
  | { kind: "matrixProduct"; a: number[][]; b: number[][] } // the option is ab
  | { kind: "matrixInverse"; a: number[][] } // a times the option is the identity
  | { kind: "linearSolution"; a: number[][]; b: number[] } // a times the option is b
  | { kind: "eigenvalues"; a: number[][] } // the option is the set of eigenvalues of a, in increasing order
  | { kind: "tangent"; f: Fn; a: number } // the option is the tangent line to f at a
  | { kind: "asymptote"; f: Fn } // the option is a line ℓ with f − ℓ → 0 at ±∞
  | { kind: "crossProduct"; u: number[]; v: number[] } // the option (`set`) is u × v
  | { kind: "plane"; normal: number[]; point: number[] } // the option (`set`: a, b, c, d) is ax + by + cz + d = 0 through point, normal to normal
  /** The option is the sum of term(n) for n ≥ from; `terms` terms are enough to see the limit (the check extrapolates a 1/N tail). */
  | { kind: "series"; term: (n: number) => number; from: number; terms: number }
  /** The option is the radius of convergence of Σ aₙ x^(power·n), with logCoef(n) = ln |aₙ|. */
  | { kind: "radius"; logCoef: (n: number) => number; power: number }
  // Several variables: f(x, y).
  | { kind: "partial"; f: Fn2; at: [number, number]; variable: "x" | "y" } // the option is ∂f/∂variable at the point
  | { kind: "gradient"; f: Fn2; at: [number, number] } // the option (`set`) is ∇f at the point
  | { kind: "critical"; f: Fn2 } // the option (`set`: x, y) is a point where ∇f = 0
  | { kind: "doubleIntegral"; f: Fn2; x: [number, number]; y: [number, number] } // the option is the integral of f over the rectangle
  | { kind: "slope"; f: Fn; a: number } // the option is f′(a)
  | { kind: "count"; f: Fn; k: number; lo: number; hi: number } // the option is the number of solutions of f(x) = k on [lo, hi]
  /** A written question from the question bank: options are texts, nothing to compute. */
  | { kind: "choice" }
  | { kind: "shell"; command: string } // the option is what bash prints for the command
  /** Unix permissions: options are octal modes ("754") or symbolic ones ("rwxr-xr-x") in their formula; the right one is `mode`. */
  | { kind: "mode"; mode: number }
  /** umask: options are "file/directory" octal modes ("640/750") in their formula. */
  | { kind: "umask"; mask: number }
  /** A chemical equation: the option (its formula) must have these substances, every element balanced, in smallest whole numbers. */
  | { kind: "equation"; reactants: string[]; products: string[] }
  /** The option is the coefficient of one substance in the balanced equation (`coefficients`, reactants then products). */
  | { kind: "coefficient"; reactants: string[]; products: string[]; coefficients: number[]; species: number }

export interface Draft {
  /**
   * The sentence, the formula (may be empty when a graph says it all), a graph,
   * and for a graph an id: what makes two questions the same, as the formula
   * does otherwise.
   */
  prompt: {
    key: PromptKey;
    tex: string;
    graph?: Graph;
    id?: string;
    /** A written question: its text, shown instead of the key's sentence. */
    text?: Localized;
    /** Where the question comes from in its book ("Atkins 1A.2"). */
    source?: string;
  };
  correct: Option;
  /** Candidate wrong answers (common mistakes); three distinct ones are kept. */
  wrong: Option[];
  explanation: { key: ExplanationKey; tex: string; text?: Localized };
  verify: Verify;
}

/** A kind of question. `version` is the test's: written lists grow by version (docs/question-generators.md#versioning). */
export type Generator = (rng: Rng, version?: number) => Draft;

export interface Question {
  topic: Topic;
  /** Kind of question, e.g. "derivatives.product"; answers are tracked per kind. */
  skill: string;
  /** Asked again because the player got this kind wrong recently. */
  review: boolean;
  prompt: Draft["prompt"];
  options: Option[];
  correct: number;
  explanation: Draft["explanation"];
  verify: Verify;
}
