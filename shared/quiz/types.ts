import type { Rng } from "./rng";
import type { Fn } from "./tex";
import type { GcpModel } from "./gcp-model";
import type { CfModel } from "./cf-model";
import type { EconModel } from "./econ-model";
import type { CalcModel } from "./calc-model";

export type Fn2 = (x: number, y: number) => number;

/**
 * "school" and "university" are the levels of the mathematics tests;
 * "chemistry" and "chemistryAdvanced" those of physical chemistry, a test of
 * its own (its topics are the Focuses of Atkins' Physical Chemistry): core
 * calculations and concepts, or advanced reasoning and derivations.
 */
export type Level = "school" | "university" | "chemistry" | "chemistryAdvanced" | "linux" | "chembio" | "sql" | "rustBeginner" | "rustIntermediate" | "rustAdvanced" | "rustExpert" | "tsBeginner" | "tsIntermediate" | "tsAdvanced" | "tsExpert" | "reactBeginner" | "reactIntermediate" | "reactAdvanced" | "reactExpert" | "gcpBeginner" | "gcpIntermediate" | "gcpAdvanced" | "gcpExpert" | "cfBeginner" | "cfIntermediate" | "cfAdvanced" | "cfExpert" | "econ" | "econAdvanced" | "calc" | "calcAdvanced";
export type MathTopic = "derivatives" | "integrals" | "trigonometry" | "limits" | "explog" | "probability" | "sequences" | "complex" | "odes" | "linear" | "functions" | "geometry" | "series" | "multivariable" | "graphs";
/**
 * Physical chemistry, by Focus: 1 gases, 2 First Law, 3 Second and Third Laws,
 * 4 physical transformations, 5 mixtures, 6 chemical equilibrium, 7 quantum
 * theory, 8 atomic structure and spectra.
 */
export type ChemistryTopic = "gases" | "firstLaw" | "secondLaw" | "phases" | "mixtures" | "equilibrium" | "quantum" | "atoms" | "kinetics" | "dynamics" | "spectroscopy" | "resonance" | "statistical";
/** The Linux command line: core commands by area, then tools that need installing. */
export type LinuxTopic = "linuxFiles" | "linuxText" | "linuxShell" | "linuxProcesses" | "linuxSystem" | "linuxNetwork" | "linuxTools" | "linuxScripting" | "linuxGit" | "linuxVim";
/** Chemistry and biology basics: balancing equations, first. */
export type ChemBioTopic = "balancing";
/** SQL: the language, then the engines (PostgreSQL, SQLite, MySQL) and good practice. */
export type SqlTopic = "sqlSelect" | "sqlAggregate" | "sqlJoins" | "sqlModify" | "sqlPostgres" | "sqlSqlite" | "sqlMysql" | "sqlPractice";
/** Rust: the language, then systems work (concurrency, Cargo, unsafe); each at up to four levels. */
export type RustTopic = "rustBasics" | "rustOwnership" | "rustTypes" | "rustErrors" | "rustCollections" | "rustConcurrency" | "rustCargo" | "rustUnsafe";
/** TypeScript: the language and its types, then the JavaScript runtime and the tooling; each at up to four levels. */
export type TsTopic = "tsBasics" | "tsFunctions" | "tsObjects" | "tsNarrowing" | "tsGenerics" | "tsTypeLevel" | "tsRuntime" | "tsTooling";
/** React: components, state, effects and rendering, then the stack around it (data, types, tooling, tests); each at up to four levels. */
export type ReactTopic = "reactComponents" | "reactState" | "reactEffects" | "reactRendering" | "reactData" | "reactTyping" | "reactTooling" | "reactTesting";
/** Google Cloud: identity and access (the hierarchy, IAM, service accounts, security), then the infrastructure; each at up to four levels. */
export type GcpTopic = "gcpHierarchy" | "gcpIam" | "gcpServiceAccounts" | "gcpSecurity" | "gcpNetworking" | "gcpCompute" | "gcpStorage" | "gcpOperations";
/**
 * Public and labour economics: welfare economics, market failure, political
 * economy; incidence, optimal taxation, tax design; social insurance,
 * redistribution, the labour market. Concepts come from the question bank
 * (books the user owns), diagrams and calculations from generators.
 */
export type EconTopic = "econWelfare" | "econMarketFailure" | "econPublicChoice" | "econIncidence" | "econOptimalTax" | "econTaxDesign" | "econSocialInsurance" | "econRedistribution" | "econLabour";
/**
 * Calculus, in the order of Stewart's chapters: limits, derivatives, their
 * applications, integrals, inverse functions and l'Hospital, techniques of
 * integration, differential equations, parametric and polar curves, series,
 * vectors, several variables, vector calculus, and stochastic calculus.
 * Concepts come from the question bank (books the user owns), graphs and
 * computations from generators. Apart from the mathematics test, which drills
 * technique.
 */
export type CalcTopic = "calcLimits" | "calcDerivatives" | "calcApplications" | "calcIntegrals" | "calcTranscendental" | "calcTechniques" | "calcOde" | "calcParametric" | "calcSeries" | "calcVectors" | "calcMultivariable" | "calcVectorCalculus" | "calcStochastic";
/** Cloudflare: the network and security, the developer platform, Zero Trust and AI; each at up to four levels. */
export type CfTopic = "cfDns" | "cfTls" | "cfCache" | "cfSecurity" | "cfWorkers" | "cfStorage" | "cfZeroTrust" | "cfAi";
export type Topic = MathTopic | ChemistryTopic | LinuxTopic | ChemBioTopic | SqlTopic | RustTopic | TsTopic | ReactTopic | GcpTopic | EconTopic | CalcTopic | CfTopic;

export const LEVELS: Level[] = ["school", "university", "chemistry", "chemistryAdvanced", "linux", "chembio", "sql", "rustBeginner", "rustIntermediate", "rustAdvanced", "rustExpert", "tsBeginner", "tsIntermediate", "tsAdvanced", "tsExpert", "reactBeginner", "reactIntermediate", "reactAdvanced", "reactExpert", "gcpBeginner", "gcpIntermediate", "gcpAdvanced", "gcpExpert", "econ", "econAdvanced", "calc", "calcAdvanced", "cfBeginner", "cfIntermediate", "cfAdvanced", "cfExpert"];
/** Topics of the chemistry-and-biology test. */
export const CHEMBIO_TOPICS: ChemBioTopic[] = ["balancing"];
/** Topics of the Linux test. */
export const LINUX_TOPICS: LinuxTopic[] = ["linuxFiles", "linuxText", "linuxShell", "linuxProcesses", "linuxSystem", "linuxNetwork", "linuxTools", "linuxScripting", "linuxGit", "linuxVim"];
/** Topics of the SQL test. */
export const SQL_TOPICS: SqlTopic[] = ["sqlSelect", "sqlAggregate", "sqlJoins", "sqlModify", "sqlPostgres", "sqlSqlite", "sqlMysql", "sqlPractice"];
/** Topics of the Rust test; each level has some of them (topicsFor). */
export const RUST_TOPICS: RustTopic[] = ["rustBasics", "rustOwnership", "rustTypes", "rustErrors", "rustCollections", "rustConcurrency", "rustCargo", "rustUnsafe"];
/** The levels offered in the Rust test's settings, easiest first. */
export const RUST_LEVELS: Level[] = ["rustBeginner", "rustIntermediate", "rustAdvanced", "rustExpert"];
export const isRust = (level: Level): boolean => RUST_LEVELS.includes(level);
/** Topics of the TypeScript test; each level has some of them (topicsFor). */
export const TS_TOPICS: TsTopic[] = ["tsBasics", "tsFunctions", "tsObjects", "tsNarrowing", "tsGenerics", "tsTypeLevel", "tsRuntime", "tsTooling"];
/** The levels offered in the TypeScript test's settings, easiest first. */
export const TS_LEVELS: Level[] = ["tsBeginner", "tsIntermediate", "tsAdvanced", "tsExpert"];
export const isTypeScript = (level: Level): boolean => TS_LEVELS.includes(level);
/** Topics of the React test; each level has some of them (topicsFor). */
export const REACT_TOPICS: ReactTopic[] = ["reactComponents", "reactState", "reactEffects", "reactRendering", "reactData", "reactTyping", "reactTooling", "reactTesting"];
/** The levels offered in the React test's settings, easiest first. */
export const REACT_LEVELS: Level[] = ["reactBeginner", "reactIntermediate", "reactAdvanced", "reactExpert"];
export const isReact = (level: Level): boolean => REACT_LEVELS.includes(level);
/** Topics of the Google Cloud test; each level has some of them (topicsFor). */
export const GCP_TOPICS: GcpTopic[] = ["gcpHierarchy", "gcpIam", "gcpServiceAccounts", "gcpSecurity", "gcpNetworking", "gcpCompute", "gcpStorage", "gcpOperations"];
/** The levels offered in the Google Cloud test's settings, easiest first. */
export const GCP_LEVELS: Level[] = ["gcpBeginner", "gcpIntermediate", "gcpAdvanced", "gcpExpert"];
export const isGcp = (level: Level): boolean => GCP_LEVELS.includes(level);
/** Topics of the Cloudflare test; each level has some of them (topicsFor). */
export const CF_TOPICS: CfTopic[] = ["cfDns", "cfTls", "cfCache", "cfSecurity", "cfWorkers", "cfStorage", "cfZeroTrust", "cfAi"];
/** The levels offered in the Cloudflare test's settings, easiest first. */
export const CF_LEVELS: Level[] = ["cfBeginner", "cfIntermediate", "cfAdvanced", "cfExpert"];
export const isCf = (level: Level): boolean => CF_LEVELS.includes(level);
/** Topics of the economics test. */
export const ECON_TOPICS: EconTopic[] = ["econWelfare", "econMarketFailure", "econPublicChoice", "econIncidence", "econOptimalTax", "econTaxDesign", "econSocialInsurance", "econRedistribution", "econLabour"];
/** The levels offered in the economics test's settings: core, and advanced reasoning. */
export const ECON_LEVELS: Level[] = ["econ", "econAdvanced"];
export const isEcon = (level: Level): boolean => ECON_LEVELS.includes(level);
/** Topics of the calculus test. */
export const CALC_TOPICS: CalcTopic[] = ["calcLimits", "calcDerivatives", "calcApplications", "calcIntegrals", "calcTranscendental", "calcTechniques", "calcOde", "calcParametric", "calcSeries", "calcVectors", "calcMultivariable", "calcVectorCalculus", "calcStochastic"];
/** The levels offered in the calculus test's settings: core, and advanced. */
export const CALC_LEVELS: Level[] = ["calc", "calcAdvanced"];
export const isCalc = (level: Level): boolean => CALC_LEVELS.includes(level);
/** The subjects of the tests, each with its own levels and topics. */
export type Subject = "maths" | "chemistry" | "linux" | "chembio" | "sql" | "rust" | "ts" | "react" | "gcp" | "econ" | "calc" | "cf";
export const subjectOf = (level: Level): Subject =>
  level === "linux" ? "linux" : level === "sql" ? "sql" : isRust(level) ? "rust" : isTypeScript(level) ? "ts" : isReact(level) ? "react" : isGcp(level) ? "gcp" : isCf(level) ? "cf" : isEcon(level) ? "econ" : isCalc(level) ? "calc" : level === "chembio" ? "chembio" : level === "chemistry" || level === "chemistryAdvanced" ? "chemistry" : "maths";
/** Topics of the physical chemistry test. */
export const CHEMISTRY_TOPICS: ChemistryTopic[] = ["gases", "firstLaw", "secondLaw", "phases", "mixtures", "equilibrium", "quantum", "atoms", "kinetics", "dynamics", "spectroscopy", "resonance", "statistical"];
/** The levels offered in the mathematics test's settings. */
export const MATH_LEVELS: Level[] = ["school", "university"];
/** The levels offered in the physical chemistry test's settings. */
export const CHEMISTRY_LEVELS: Level[] = ["chemistry", "chemistryAdvanced"];
export const isChemistry = (level: Level): boolean => level === "chemistry" || level === "chemistryAdvanced";
/** Tests that draw from the question bank, and so record the bank revision they drew from. */
export const usesBank = (level: Level): boolean => isChemistry(level) || isEcon(level) || isCalc(level);
/** Every topic; new ones are appended (the order is the selector's within a group). */
export const TOPICS: Topic[] = ["derivatives", "integrals", "trigonometry", "limits", "explog", "probability", "sequences", "complex", "odes", "linear", "functions", "geometry", "series", "multivariable", "graphs", "gases", "firstLaw", "secondLaw", "linuxFiles", "linuxText", "linuxShell", "linuxProcesses", "linuxSystem", "linuxNetwork", "linuxTools", "phases", "mixtures", "equilibrium", "balancing", "quantum", "atoms", "linuxScripting", "linuxGit", "linuxVim", "kinetics", "dynamics", "spectroscopy", "resonance", "statistical", "sqlSelect", "sqlAggregate", "sqlJoins", "sqlModify", "sqlPostgres", "sqlSqlite", "sqlMysql", "sqlPractice", "rustBasics", "rustOwnership", "rustTypes", "rustErrors", "rustCollections", "rustConcurrency", "rustCargo", "rustUnsafe", "tsBasics", "tsFunctions", "tsObjects", "tsNarrowing", "tsGenerics", "tsTypeLevel", "tsRuntime", "tsTooling", "reactComponents", "reactState", "reactEffects", "reactRendering", "reactData", "reactTyping", "reactTooling", "reactTesting", "gcpHierarchy", "gcpIam", "gcpServiceAccounts", "gcpSecurity", "gcpNetworking", "gcpCompute", "gcpStorage", "gcpOperations", "econWelfare", "econMarketFailure", "econPublicChoice", "econIncidence", "econOptimalTax", "econTaxDesign", "econSocialInsurance", "econRedistribution", "econLabour", "calcLimits", "calcDerivatives", "calcApplications", "calcIntegrals", "calcTranscendental", "calcTechniques", "calcOde", "calcParametric", "calcSeries", "calcVectors", "calcMultivariable", "calcVectorCalculus", "calcStochastic", "cfDns", "cfTls", "cfCache", "cfSecurity", "cfWorkers", "cfStorage", "cfZeroTrust", "cfAi"];

export type TopicGroup = "analysis" | "algebra" | "geometry" | "probability" | "thermodynamics" | "linuxCommands" | "linuxDev" | "linuxInstall" | "reactions" | "structure" | "rates" | "spectra" | "statistics" | "sqlLanguage" | "sqlEngines" | "rustLanguage" | "rustSystems" | "tsLanguage" | "tsPlatform" | "reactCore" | "reactStack" | "gcpIdentity" | "gcpInfrastructure" | "cfNetwork" | "cfDeveloper" | "cfOneAi" | "econTheory" | "econTaxation" | "econWelfareState" | "calcOneVariable" | "calcFurther" | "calcSeveral";
/** How the topics are grouped in the test's settings. */
export const TOPIC_GROUPS: { group: TopicGroup; topics: Topic[] }[] = [
  { group: "analysis", topics: ["graphs", "functions", "sequences", "derivatives", "integrals", "limits", "explog", "trigonometry", "odes", "series", "multivariable"] },
  { group: "algebra", topics: ["complex", "linear"] },
  { group: "geometry", topics: ["geometry"] },
  { group: "probability", topics: ["probability"] },
  { group: "thermodynamics", topics: ["gases", "firstLaw", "secondLaw", "phases", "mixtures", "equilibrium"] },
  { group: "structure", topics: ["quantum", "atoms"] },
  { group: "spectra", topics: ["spectroscopy", "resonance"] },
  { group: "statistics", topics: ["statistical"] },
  { group: "rates", topics: ["kinetics", "dynamics"] },
  { group: "linuxCommands", topics: ["linuxFiles", "linuxText", "linuxShell", "linuxProcesses", "linuxSystem", "linuxNetwork"] },
  { group: "linuxDev", topics: ["linuxScripting", "linuxGit", "linuxVim"] },
  { group: "linuxInstall", topics: ["linuxTools"] },
  { group: "reactions", topics: ["balancing"] },
  { group: "sqlLanguage", topics: ["sqlSelect", "sqlAggregate", "sqlJoins", "sqlModify"] },
  { group: "sqlEngines", topics: ["sqlPostgres", "sqlSqlite", "sqlMysql", "sqlPractice"] },
  { group: "rustLanguage", topics: ["rustBasics", "rustOwnership", "rustTypes", "rustErrors", "rustCollections"] },
  { group: "rustSystems", topics: ["rustConcurrency", "rustCargo", "rustUnsafe"] },
  { group: "tsLanguage", topics: ["tsBasics", "tsFunctions", "tsObjects", "tsNarrowing", "tsGenerics", "tsTypeLevel"] },
  { group: "tsPlatform", topics: ["tsRuntime", "tsTooling"] },
  { group: "reactCore", topics: ["reactComponents", "reactState", "reactEffects", "reactRendering"] },
  { group: "reactStack", topics: ["reactData", "reactTyping", "reactTooling", "reactTesting"] },
  { group: "gcpIdentity", topics: ["gcpHierarchy", "gcpIam", "gcpServiceAccounts", "gcpSecurity"] },
  { group: "gcpInfrastructure", topics: ["gcpNetworking", "gcpCompute", "gcpStorage", "gcpOperations"] },
  { group: "cfNetwork", topics: ["cfDns", "cfTls", "cfCache", "cfSecurity"] },
  { group: "cfDeveloper", topics: ["cfWorkers", "cfStorage"] },
  { group: "cfOneAi", topics: ["cfZeroTrust", "cfAi"] },
  { group: "econTheory", topics: ["econWelfare", "econMarketFailure", "econPublicChoice"] },
  { group: "econTaxation", topics: ["econIncidence", "econOptimalTax", "econTaxDesign"] },
  { group: "econWelfareState", topics: ["econSocialInsurance", "econRedistribution", "econLabour"] },
  { group: "calcOneVariable", topics: ["calcLimits", "calcDerivatives", "calcApplications", "calcIntegrals", "calcTranscendental", "calcTechniques"] },
  { group: "calcFurther", topics: ["calcOde", "calcParametric", "calcSeries"] },
  { group: "calcSeveral", topics: ["calcVectors", "calcMultivariable", "calcVectorCalculus", "calcStochastic"] },
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
  | "spinOrbitSplitting"
  | "firstOrderConcentration"
  | "firstOrderHalfLife"
  | "secondOrderConcentration"
  | "secondOrderHalfLife"
  | "arrheniusRatio"
  | "activationEnergy"
  | "relaxation"
  | "michaelisMenten"
  | "polymerization"
  | "quantumYield"
  | "fretEfficiency"
  | "sternVolmer"
  | "collisionFactor"
  | "diffusionLimit"
  | "activationEnthalpy"
  | "eyringRate"
  | "saltEffect"
  | "isotopeEffect"
  | "marcusBarrier"
  | "beerLambert"
  | "rotationalLine"
  | "bondLength"
  | "ramanShift"
  | "mostPopulatedJ"
  | "anharmonicFundamental"
  | "anharmonicOvertone"
  | "dissociationEnergy"
  | "normalModes"
  | "dopplerWidth"
  | "lifetimeWidth"
  | "larmorFrequency"
  | "shiftInHertz"
  | "multipletNMR"
  | "multipletEPR"
  | "populationExcess"
  | "gValue"
  | "spinDensity"
  | "coalescence"
  | "t2Linewidth"
  | "inversionRecovery"
  | "boltzmannRatio"
  | "populationTemperature"
  | "thermalWavelength"
  | "translationalPartition"
  | "rotationalPartition"
  | "symmetryNumber"
  | "vibrationalPartition"
  | "electronicPartition"
  | "meanVibrationalEnergy"
  | "twoLevelEnergy"
  | "vibrationalHeatCapacity"
  | "sackurTetrode"
  | "residualEntropy";

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
  | "spinOrbitSplitting"
  | "firstOrderConcentration"
  | "firstOrderHalfLife"
  | "secondOrderConcentration"
  | "secondOrderHalfLife"
  | "arrheniusRatio"
  | "activationEnergy"
  | "relaxation"
  | "michaelisMenten"
  | "polymerization"
  | "quantumYield"
  | "fretEfficiency"
  | "sternVolmer"
  | "collisionFactor"
  | "diffusionLimit"
  | "activationEnthalpy"
  | "eyringRate"
  | "saltEffect"
  | "isotopeEffect"
  | "marcusBarrier"
  | "beerLambert"
  | "rotationalLine"
  | "bondLength"
  | "ramanShift"
  | "mostPopulatedJ"
  | "anharmonicFundamental"
  | "anharmonicOvertone"
  | "dissociationEnergy"
  | "normalModes"
  | "dopplerWidth"
  | "lifetimeWidth"
  | "larmorFrequency"
  | "shiftInHertz"
  | "populationExcess"
  | "gValue"
  | "spinDensity"
  | "coalescence"
  | "t2Linewidth"
  | "inversionRecovery"
  | "multiplet"
  | "boltzmannRatio"
  | "populationTemperature"
  | "thermalWavelength"
  | "translationalPartition"
  | "rotationalPartition"
  | "symmetryNumber"
  | "vibrationalPartition"
  | "electronicPartition"
  | "meanVibrationalEnergy"
  | "twoLevelEnergy"
  | "vibrationalHeatCapacity"
  | "sackurTetrode"
  | "residualEntropy";

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
  "orderConfused", // the integrated law or half-life of another reaction order
  "halfLifeForTau", // t½ and τ = 1/k confused: a factor of ln 2
  "timeUnits", // seconds, minutes or hours not converted
  "distancePower", // the wrong power of a distance (R⁶ in FRET)
  "selectionRuleConfused", // ΔJ = ±1 (microwave) and ±2 (Raman) confused
  "linearityConfused", // 3N − 5 for a nonlinear molecule, or 3N − 6 for a linear one
  "ppmConfused", // parts per million taken as per cent, or the 10⁶ applied twice
  "equivalenceIgnored", // equivalent nuclei split one after the other: (2I + 1)ᴺ lines
  "nuclearSpinIgnored", // N + 1 lines for nuclei of spin 1
  "fieldUnits", // millitesla used as tesla, or the reverse
  "degeneracyIgnored", // populations of levels taken as populations of states: g left out
  "symmetryIgnored", // the symmetry number σ left out
  "rotationsMiscounted", // reflections counted with the rotations, or rotations missed
  "zeroPointConfused", // the zero-point energy counted where it is the zero, or the reverse
  "classicalLimit", // the high-temperature (equipartition) limit used where levels are quantized
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
  // SQL
  "sqlBoundary", // > read as >=, or the row on the boundary left on the wrong side
  "sqlNullCompared", // NULL compared with =, <> or NOT IN as if it were a value
  "sqlPrecedence", // OR taken before AND
  "sqlLimitOffset", // LIMIT and OFFSET swapped, or OFFSET ignored
  "sqlSortDirection", // ASC and DESC confused
  "sqlCountNulls", // COUNT(*) and COUNT(column) confused: NULLs counted or not
  "sqlDistinct", // DISTINCT applied or forgotten
  "sqlAvgNulls", // AVG or SUM taken to count NULL as 0, or to become NULL
  "sqlAggregateConfused", // SUM, AVG and COUNT confused
  "sqlHavingIgnored", // HAVING (or WHERE) not applied to the groups
  "sqlNullGroup", // the NULL group kept or lost wrongly
  "sqlJoinKind", // an inner join read as an outer one, or the reverse
  "sqlCrossProduct", // every row paired with every row: the join condition ignored
  // Rust
  "rustIntegerDivision", // integer division rounded down (or kept as a fraction) instead of toward zero
  "rustRemainderSign", // % taken as the Euclidean remainder: its sign is the dividend's
  "rustCastSaturates", // an integer `as` cast taken to clamp, when it keeps the low bits
  "rustCastWraps", // a float `as` cast taken to wrap or round, when it truncates and saturates
  "rustWrapping", // wrapping_, saturating_ and checked_ arithmetic confused
  "rustShadowScope", // a shadow in a block taken to outlive it, or an assignment taken to end with it
  "rustShadowIgnored", // a shadowing let skipped
  "rustBytesChars", // len() (bytes) and chars().count() confused, or a byte size guessed
  "rustRangeEnd", // a..b taken to include b, or an off-by-one at an end
  "rustIteratorOrder", // adapters applied in another order
  "rustFilterInverted", // filter taken to drop what matches
  "rustMatchOrder", // the most specific arm taken instead of the first that matches
  "rustUnwrapOr", // unwrap_or's default used, or skipped, at the wrong time
  "rustDedupConsecutive", // dedup taken to remove every duplicate
  "rustSortStable", // sort_by_key taken to reorder equal keys
  "rustDropOrder", // values dropped in declaration order, or fields in reverse
  "rustLetUnderscore", // let _ = taken to keep the value until the end of the scope
  "rustShadowDrop", // a shadowed value taken to be dropped at once
  // TypeScript (and the JavaScript it runs as)
  "tsSortStrings", // sort() without a comparator taken to sort numbers as numbers
  "tsMutatingMethod", // what a method changes and returns confused: sort, push, splice, slice
  "tsSliceEnd", // slice's end taken as included, or splice's count as an end
  "tsNullishOr", // ?? and || confused: 0 and "" are not nullish
  "tsOptionalChain", // ?. taken to throw, or to give null
  "tsTypeof", // typeof null, arrays, NaN, functions and classes
  "tsMicrotaskOrder", // a timer taken to run before promise callbacks
  "tsAsyncSync", // callbacks or an async function's start taken to run in another order than they do
  "tsAwaitOrder", // await taken to block the caller
  "tsVarCapture", // var in a loop taken to give each closure its own variable, or let the reverse
  "tsFloat", // binary floating point and toFixed
  "tsParseNumber", // Number() and parseInt() confused
  "tsRounding", // Math.round on halves, floor and trunc on negatives
  "tsShallowCopy", // a spread or Object.assign taken to copy deeply, or structuredClone to share
  "tsReferenceEquality", // a copy taken to be the same object, or === to compare contents
  "tsFieldInitOrder", // class fields taken to be set before the base constructor runs
  // React
  "reactUpdaterQueue", // setN(n + k) twice taken to add twice, or updaters to read the render's value
  "reactStateSnapshot", // a render's state taken to change in place: at once, never, or one step off
  "reactZeroRender", // {0 && …} taken to render nothing
  "reactFalsyRender", // false, null or a condition's boolean taken to render as text
  "reactJsxWhitespace", // JSX line breaks taken to vanish, or to stay as they are
  "reactDefaultProp", // a default prop taken to replace null or "", or not to replace undefined
  "reactEffectTiming", // an effect taken to run during render, or not on the first render
  "reactEffectParentFirst", // a parent's effects taken to run before its children's
  "reactRenderOrder", // children taken to render before their parent
  "reactNoBatching", // each setter taken to render on its own
  "reactKeyState", // a new key taken to keep a component's state
  "reactInitialState", // useState's argument taken to update the state on later renders
  "reactRefRenders", // changing ref.current taken to render
  "reactCleanupOrder", // a cleanup taken to run after the next effect, or with the new values
  "reactEffectDeps", // the dependency list misread: [] taken to rerun, or a missing list to run once
  "reactMemoProps", // memo taken to skip with a new object or function, or to re-render with equal props
  "reactStrictOnce", // StrictMode's double render and effect re-run in development forgotten
  "reactLayoutOrder", // useLayoutEffect taken to run after useEffect, or interleaved with it
  // Google Cloud
  "gcpReservedAddresses", // a subnet's four reserved addresses miscounted
  "gcpPrefixSize", // a prefix length read one bit off
  "gcpCidrOverlap", // a range overlapping a subnet of the VPC taken as free
  "gcpSubnetTooSmall", // a subnet smaller than /29 taken as allowed
  "gcpCidrProhibited", // a prohibited range (loopback, link-local) taken as allowed
  "gcpFirewallOrder", // firewall rules taken in listed order, or the highest number first
  "gcpFirewallTie", // allow taken to win over deny at the same priority
  "gcpFirewallTargets", // a rule's target tags ignored
  "gcpFirewallImplied", // ingress taken to be allowed when no rule matches
  "gcpFirewallHierarchy", // firewall policies and VPC rules evaluated in the wrong order
  "gcpGotoNext", // goto_next taken as allow
  "gcpIamInheritance", // allow policies taken not to inherit, or a lower grant to replace a higher one
  "gcpIamGroups", // a role granted to a group taken not to reach its members
  "gcpDenyOrder", // a deny ignored, or beaten by an allow
  "gcpDenyExceptions", // a deny rule's exception principals ignored
  "gcpRoundDown", // instances counted by rounding down
  "gcpConcurrencyIgnored", // one request per instance, or concurrency added instead of multiplied
  "gcpMinInstancesAdded", // minimum instances added on top of those needed
  "gcpAvailabilityLayout", // series and redundant components confused
  "gcpAvailabilityMin", // the whole taken to be as available as one part
  "cfRulePrecedence", // "or" taken to bind before "and", or "not" over the whole
  "cfRuleCase", // eq, contains or in taken to ignore case
  "cfWildcardCase", // wildcard taken to be case-sensitive
  "cfWildcardAnchor", // wildcard taken to match part of the value
  "cfContains", // contains taken to match only at the start
  "cfRuleMisread", // the expression read without its operators' rules
  "cfPhaseListed", // rules taken in the order they are listed, not the phases'
  "cfManagedFirst", // managed rules taken to run before custom rules
  "cfBulkFirst", // Bulk Redirects taken to run first, like Single Redirects
  "cfAccessFirst", // the Access check taken to run before the WAF
  "cfCacheStops", // a Cache Rule taken to stop the request
  "cfRedirectLast", // redirects taken to run after the security phases
  "cfRedirectLoop", // Flexible's redirect loop missed, or seen where there is none
  "cfFlexibleSafe", // Flexible taken to encrypt the connection to the origin
  "cfFullNotStrict", // Full taken to check the certificate, or Full (strict) not to
  "cfOriginCaUntrusted", // an Origin CA certificate taken to fail Full (strict)
  "cfHtmlCached", // HTML or JSON taken to be cached by default
  "cfCacheBypass", // a cookie or private, no-store taken not to stop caching
  "cfBrowserTtl", // the browser TTL taken to be the origin's even when shorter than 4 hours
  "cfDefaultEdgeTtl", // the default edge TTL taken to be 4 hours
  "cfSmaxage", // s-maxage ignored at the edge
  "cfEdgeBrowser", // the edge TTL taken to be the browser's, or the reverse
  "cfNoHeaders", // a response without cache headers taken not to be cached
  "cfIngressSpecific", // the most specific ingress rule taken to win, not the first
  "cfIngressLast", // the last matching ingress rule taken to win
  "cfIngressPath", // an ingress rule's path ignored
  "cfIngressWildcard", // *.example.com taken to cover example.com
  "cfRequireOr", // Require taken as OR
  "cfExcludeIgnored", // Exclude ignored
  "cfAccessOrder", // Bypass not evaluated first, or the wrong policy decides
  "cfAccessDefault", // a user who matches no policy taken to be allowed
  "cfIncludeAnd", // Include taken as AND
  "cfIncludedIgnored", // Workers Paid's included usage not subtracted
  "cfBaseForgotten", // the USD 5 subscription forgotten
  "cfWallTime", // wall time billed instead of CPU time
  "cfCpuIgnored", // CPU time left out of the bill
  "cfNeuronsMonthly", // the free Neurons taken per month, not per day
  "cfFreeIgnored", // the free Neurons not subtracted
  "cfNeuronUnit", // the price per 1,000 Neurons misread
  // public economics
  "econStatutoryIncidence", // the tax taken to fall on whoever pays it to the state
  "econIncidenceInverted", // the more elastic side taken to bear more
  "econEqualSplit", // the tax taken to be shared half and half
  "econDwlRectangle", // the deadweight loss taken as the rectangle t × ΔQ
  "econDwlRevenue", // the revenue taken as the deadweight loss
  "econAreaRevenue", // the revenue rectangle taken for another area
  "econAreaSurplus", // a side's loss of surplus taken for another area
  "econAreaDwl", // the deadweight triangle taken for another area
  "econAreaPart", // only part of the asked area counted
  "econPigouAtMarket", // the external cost taxed at the market quantity, not the efficient one
  "econPigouPrice", // the tax taken to be the efficient price
  "econExternalityIgnored", // the market quantity taken as efficient
  "econMarginalCurves", // the wrong marginal curves set equal
  "econHorizontalSum", // a public good's demands added horizontally
  "econFreeRider", // the quantity one person would buy alone taken as efficient
  "econLindahlShare", // the cost split taken to change the efficient quantity
  "econGiniHalf", // the Gini taken as the area A, not A over A + B
  "econGiniArea", // the Gini taken from the area under the Lorenz curve
  "econGiniTopShare", // the Gini taken as the top quintile's share
  "econLorenzReading", // a Lorenz curve further from the diagonal taken as more equal
  "econEmtrPartial", // the effective marginal rate taken as the tax or the taper alone
  "econEmtrMultiply", // the tax and the taper combined by multiplying
  "econBreakEven", // where a benefit ends computed without the taper or the wage
  "econRamseyInverted", // the elastic good taxed more
  "econRamseyUniform", // uniform rates taken as optimal
  "econRamseyPartial", // the Ramsey ratio applied with one elasticity only
  "econSaezNoPareto", // the top rate computed without the Pareto parameter
  "econSaezInverted", // the top-rate formula turned around
  "econMonopsonyWage", // the monopsonist taken to pay the marginal revenue product
  "econMonopsonyCompetitive", // the monopsonist taken to hire as a competitive market
  "econMinWageCompetitive", // employment under a minimum wage read on labour demand
  "econMinWageNoEffect", // a minimum wage taken to leave monopsony employment unchanged
  "econMarginalAverage", // the marginal rate taken as the average rate
  "econBracketMisapplied", // a band's rate applied to income outside the band
  "econAverageBase", // the average rate computed on taxable income above the allowance
  "econMedianMean", // the mean voter taken to decide
  "econMedianExtreme", // an extreme or off-centre voter taken to decide
  "econSwfConfused", // one social welfare function taken for another
  "econParetoDominated", // a Pareto-dominated allocation chosen
  "econRiskNeutral", // the willingness to pay taken as the expected loss
  "econRiskWhole", // the willingness to pay taken as the whole loss
  "econRiskPremiumOnly", // the risk premium alone taken as the willingness to pay
  // calculus
  "calcOneSided", // the limit from the other side taken
  "calcValueIsLimit", // a one-sided value, or f(a), taken for the two-sided limit
  "calcLimitIsValue", // f(a) taken for the limit
  "calcLimitExists", // a limit taken to exist across a jump (or not to exist when it does)
  "calcDeltaTimes", // δ taken as ε times the slope
  "calcDeltaSlope", // δ taken equal to ε, the slope ignored
  "calcDeltaHalf", // δ off by a factor two
  "calcSecantTangent", // the tangent's slope at one end taken for the secant's
  "calcSecantRun", // the rise taken without dividing by the run
  "calcSecantInverted", // run over rise
  "calcTangentIntercept", // f(a) taken as the intercept
  "calcTangentSign", // the line's constant with the wrong sign, or the slope's
  "calcTangentSlopeValue", // f(a) taken as the slope
  "calcMaxMin", // a maximum and a minimum confused, or another zero of f′ taken
  "calcInflection", // where f′ turns (an inflection point of f) taken as an extremum
  "calcNewtonSign", // x + f/f′ instead of x − f/f′
  "calcNewtonInverted", // f′/f instead of f/f′
  "calcNewtonSteps", // one iteration too many or too few
  "calcNewtonExact", // the root itself given for the iterate
  "calcRiemannMethod", // left, right and midpoint sums confused
  "calcRiemannExact", // the exact integral given for an approximation
  "calcRiemannWidth", // the heights added without multiplying by Δx
  "calcNetTotal", // net (signed) and total area confused
  "calcAreaBelow", // the part below the axis left out, or counted wrong
  "calcFtcConfused", // g(c) and g′(c) = f(c) confused
  "calcFtcDerivative", // g′ taken as the slope of f
  "calcFtcConstant", // g′ taken as zero
  "calcFtcBounds", // the area up to the wrong bound
  "calcHalfLifeMean", // 1/k (the mean lifetime) taken for the half-life
  "calcHalfLifeLinear", // the decay taken as linear
  "calcHalfLifeInverted", // k·ln 2 instead of ln 2/k
  "calcLhopitalInverted", // the ratio of derivatives turned upside down
  "calcLimitZeroOverZero", // 0/0 taken as 0 or 1
  "calcLhopitalQuotient", // the derivatives multiplied
  "calcNumericRule", // trapezoid, midpoint and Simpson confused
  "calcNumericWeights", // the rule's weights or its h/2, h/3 factor wrong
  "calcImproperP", // the convergence condition p > 1 turned around
  "calcImproperPower", // the antiderivative's power off by one
  "calcImproperTail", // a divergent integral taken as zero
  "calcEulerSteps", // one step short
  "calcEulerExact", // the exact solution given for Euler's approximation
  "calcEulerSlope", // the slope taken at the wrong point
  "calcFieldReading", // a slope field read wrong
  "calcStabilityUnstable", // the unstable equilibrium taken as stable
  "calcHarvestIgnored", // the carrying capacity given, harvesting ignored
  "calcMaxGrowth", // K/2, where growth is fastest, taken as the equilibrium
  "calcPolarSinCos", // r = cos(kθ) and r = sin(kθ) confused
  "calcPetals", // the number of petals of a rose miscounted (k against 2k)
  "calcParamInverted", // dx/dy instead of dy/dx
  "calcParamDt", // dy/dt or dx/dt taken as the slope
  "calcParamRatio", // y/x taken as the slope
  "calcGeometricSign", // a/(1 + r) instead of a/(1 − r)
  "calcGeometricFirst", // the first term left out, or a/r
  "calcGeometricDiverges", // a convergent series taken as divergent
  "calcTaylorDegree", // a term too few
  "calcTaylorSign", // the signs of a series confused
  "calcTaylorFactorial", // f⁽ᵏ⁾(0) without dividing by k!
  "calcTaylorConstant", // the constant term wrong
  "calcAngleSupplement", // 180° − θ: a sign lost in the dot product
  "calcAngleComplement", // 90° − θ
  "calcAngleReflex", // 360° − θ
  "calcCrossHalf", // the parallelogram and the triangle confused
  "calcCrossDot", // the dot product taken for the area
  "calcCrossNorms", // |u||v| taken for the area, the angle forgotten
  "calcDirectionalUnit", // the direction not made a unit vector
  "calcDirectionalGradient", // |∇f| taken for the derivative in any direction
  "calcDirectionalPartial", // one partial derivative taken
  "calcSecondTestCross", // the mixed derivative f_xy forgotten in D
  "calcSecondTestSign", // the sign of D or of f_xx read wrong
  "calcGreenCurl", // ∂Q/∂x − ∂P/∂y computed with a wrong sign, or halved
  "calcGreenPerimeter", // the perimeter used instead of the area
  "calcGreenRadius", // πR instead of πR²
  "calcBrownianProduct", // E[W_s W_t] taken as s·t
  "calcBrownianMax", // max(s, t) instead of min(s, t)
  "calcBrownianIndependent", // W_s and W_t taken as independent, or E[W²] as 0
  "calcBrownianIncrement", // Var(W_t − W_s) taken as t + s or t
  "calcBrownianSd", // variance and standard deviation confused
  "calcItoJensen", // E[e^X] taken as e^E[X]
  "calcItoHalf", // the ½ of Itô's correction forgotten
  "calcItoNoDrift", // the ordinary chain rule: no dt term
  "calcItoPower", // the dt term's power of W off by one
  "calcGbmMedianMean", // the mean and the median of a lognormal confused
  "calcGbmDrift", // +σ²/2 instead of −σ²/2
  "calcGbmLinear", // growth taken as linear
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
    }
  | Chart;

/**
 * An economic diagram: two labelled axes from the origin, named curves (a
 * function or a polyline), shaded areas with a letter, points, and dashed
 * drops from a point to the axes. Labels are symbols (Q, P, S, D, MSC) that
 * read the same in every language.
 */
export interface Chart {
  type: "chart";
  x: [number, number];
  y: [number, number];
  /** Axis names, shown at their ends. */
  xLabel: string;
  yLabel: string;
  /** Values written along the axes. */
  xTicks?: number[];
  yTicks?: number[];
  /** "main" and "alt" solid in two colours, "guide" dashed. A label is written at the curve's right end. */
  curves: { fn?: Fn; points?: [number, number][]; label?: string; style?: "main" | "alt" | "guide" }[];
  /** Shaded polygons: "loss" hatched, "revenue", "gain" and "plain" tinted; their label at the centre. */
  areas?: { points: [number, number][]; style: "loss" | "revenue" | "gain" | "plain"; label?: string }[];
  /** A point; `open`: a hollow dot (a hole in a graph, the value not taken). */
  points?: { x: number; y: number; label?: string; open?: boolean }[];
  /** Dashed lines from a point down to the x axis and across to the y axis. */
  drops?: { x: number; y: number }[];
  /** "frame" (default): axes along the bottom and left of the window. "origin": through (0, 0), for graphs on both sides of zero. */
  axes?: "frame" | "origin";
  /** The same scale on both axes (angles, circles, polar curves). */
  square?: boolean;
  /** Faint grid lines every `grid` units. */
  grid?: number;
  /**
   * A field drawn on a grid of `count` × `count` points: short segments in the
   * direction of `fn(x, y)` (a slope field gives [1, slope]), with arrowheads
   * when `arrows` (a vector field).
   */
  field?: { fn: (x: number, y: number) => [number, number]; arrows?: boolean; count?: number };
  /** Vectors, drawn as arrows from `from` to `to`, labelled at their tip. */
  vectors?: { from: [number, number]; to: [number, number]; label?: string; style?: "main" | "alt" }[];
}

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
  /** The option (its formula) is what the TypeScript `program` logs, lines joined by spaces; it must type-check in strict mode. */
  | { kind: "ts"; program: string }
  /**
   * The option (its formula) is what the page's text (spaces collapsed) or the console's lines (joined by
   * spaces) are once the React `program`'s `App` is rendered (in `<StrictMode>` when `strict`), in
   * development, and its first button clicked `clicks` times; it must type-check in strict mode.
   */
  | { kind: "react"; program: string; clicks: number; show: "page" | "log"; strict?: boolean }
  /** The option (its formula) is the answer to a Google Cloud model: an IAM evaluation, a firewall decision, a subnet, Cloud Run's scaling, an availability. */
  | { kind: "gcp"; model: GcpModel }
  | { kind: "cf"; model: CfModel }
  /** The option (its formula) is the answer to a small economic model: incidence, areas, Pigou, Samuelson, Gini, Ramsey, Saez, monopsony… */
  | { kind: "econ"; model: EconModel }
  /** The option (its formula) is the answer to a small calculus model: a limit on a graph, a Riemann sum, Euler's method, a directional derivative… */
  | { kind: "calc"; model: CalcModel }
  /** The option (its formula) is what the Rust `program` prints, trimmed. */
  | { kind: "rust"; program: string }
  /** The option (its formula, as `formatRows` writes it) is what `query` returns after `setup`, on SQLite. */
  | { kind: "sql"; setup: string; query: string }
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
    /** A program, shown as a block of code under the sentence. */
    code?: string;
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
