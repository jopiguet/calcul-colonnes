/**
 * The four levels of every test (QUIZ_VERSION 5, LEVELS_VERSION): Débutant,
 * Intermédiaire, Avancé, Expert. The tests that had one or two levels keep
 * their ids as Intermédiaire and Avancé (`school`, `university`, `chemistry`,
 * `chemistryAdvanced`, `linux`, `chembio`, `sql`, `econ`, `econAdvanced`,
 * `calc`, `calcAdvanced`), so saved results stay where they were.
 *
 * This file says what each level holds from version 5. `index.ts` merges it
 * with the tables of the topic files, which stay as they were: a kind a level
 * gains is available from version 5, a kind it loses until version 5, so a
 * test saved before is rebuilt from its seed unchanged.
 *
 * - Mathematics and physical chemistry: the generated kinds, shared out by
 *   difficulty (one kind may sit at two neighbouring levels).
 * - Linux and SQL: every written question has a level (`L` below, one letter
 *   per question in list order), plus Expert questions where a topic was thin.
 * - Economics, calculus, chemical equations, Capital: the generated kinds,
 *   plus written questions for the new levels (`levels/*.ts`).
 */
import type { Generator, Level, Topic } from "./types";
import { writtenAt, written, LINUX_QUESTIONS, linuxFiles, linuxText, linuxProcesses, linuxScripting } from "./linux";
import { SQL_QUESTIONS, sqlSelect, sqlAggregate, sqlJoins } from "./sql";
import type { LinuxQuestion } from "./linux/types";
import { derivatives } from "./derivatives";
import { explog } from "./explog";
import { integrals } from "./integrals";
import { limits } from "./limits";
import { trigonometry } from "./trigonometry";
import { probability } from "./probability";
import { sequences } from "./sequences";
import { complex } from "./complex";
import { odes } from "./odes";
import { linear } from "./linear";
import { functions } from "./functions";
import { geometry } from "./geometry";
import { graphs } from "./graphs";
import { multivariable } from "./multivariable";
import { series } from "./series";
import { gases } from "./gases";
import { firstLaw } from "./firstlaw";
import { secondLaw } from "./secondlaw";
import { phases } from "./phases";
import { mixtures } from "./mixtures";
import { equilibrium } from "./equilibrium";
import { quantum } from "./quantum";
import { atoms } from "./atoms";
import { kinetics, dynamics } from "./kinetics";
import { spectroscopy, resonance } from "./spectroscopy";
import { statistical } from "./statistical";
import { balancing } from "./balancing";
import * as econ from "./econ";
import * as calc from "./calc";
import * as marx from "./marx";
import { LEVEL_LISTS } from "./levels";

type Table = Partial<Record<Level, Record<string, Generator>>>;
type Four = [Level, Level, Level, Level];

const MATHS: Four = ["mathBeginner", "school", "university", "mathExpert"];
const CHEMISTRY: Four = ["chemBeginner", "chemistry", "chemistryAdvanced", "chemExpert"];
const LINUX: Four = ["linuxBeginner", "linux", "linuxAdvanced", "linuxExpert"];
const SQL: Four = ["sqlBeginner", "sql", "sqlAdvanced", "sqlExpert"];
const CHEMBIO: Four = ["chembioBeginner", "chembio", "chembioAdvanced", "chembioExpert"];
const ECON: Four = ["econBeginner", "econ", "econAdvanced", "econExpert"];
const CALC: Four = ["calcBeginner", "calc", "calcAdvanced", "calcExpert"];
const MARX: Four = ["marxBeginner", "marxIntermediate", "marxAdvanced", "marxExpert"];
const LETTERS = ["B", "I", "A", "E"] as const;

/** A generator of a topic's table, whatever level it was at. */
function find(table: Table, name: string): Generator {
  for (const kinds of Object.values(table)) if (kinds?.[name]) return kinds[name]!;
  throw new Error(`no kind ${name}`);
}

/** Four levels from kind names, "" for a level without them. */
function four(levels: Four, table: Table, names: [string, string, string, string]): Table {
  const out: Table = {};
  names.forEach((list, i) => {
    const kinds = list.split(/\s+/).filter(Boolean);
    if (kinds.length) out[levels[i]!] = Object.fromEntries(kinds.map((n) => [n, find(table, n)]));
  });
  return out;
}

/** Adds kinds to some of the four levels. */
function plus(base: Table, levels: Four, extra: Partial<Record<0 | 1 | 2 | 3, Record<string, Generator>>>): Table {
  const out: Table = { ...base };
  for (const [i, kinds] of Object.entries(extra) as [string, Record<string, Generator>][]) {
    const level = levels[Number(i)]!;
    out[level] = { ...(out[level] ?? {}), ...kinds };
  }
  return out;
}

/** The written lists of a topic shared out by their letters, with generated kinds by level. */
function shared(
  levels: Four,
  lists: Record<string, readonly LinuxQuestion[]>,
  letters: Record<string, string>,
  generated: Table,
  names: [string, string, string, string],
): Table {
  const out = four(levels, generated, names);
  for (const [name, list] of Object.entries(lists)) {
    const code = letters[name];
    if (code === undefined) throw new Error(`no levels for ${name}`);
    LETTERS.forEach((letter, i) => {
      const g = writtenAt(list, code, letter);
      if (g) out[levels[i]!] = { ...(out[levels[i]!] ?? {}), [name]: g };
    });
  }
  return out;
}

/** New written lists of a level (levels/*.ts), as kinds. */
const lists = (named: Record<string, readonly LinuxQuestion[]> | undefined): Record<string, Generator> =>
  Object.fromEntries(Object.entries(named ?? {}).map(([name, list]) => [name, written(list)]));

/** The new lists of a topic at the levels that have some. */
const newLists = (topic: Topic, levels: Four): Partial<Record<0 | 1 | 2 | 3, Record<string, Generator>>> => {
  const out: Partial<Record<0 | 1 | 2 | 3, Record<string, Generator>>> = {};
  const mine = LEVEL_LISTS[topic] ?? {};
  for (const [step, named] of Object.entries(mine) as [string, Record<string, readonly LinuxQuestion[]>][]) out[Number(step) as 0 | 1 | 2 | 3] = lists(named);
  void levels;
  return out;
};

// ------------------------------------------------------------- mathematics

const maths = {
  derivatives: four(MATHS, derivatives, ["polynomial trig exponential", "logarithm product exponential trig", "logComposite arctan quotient product", "powerLog logComposite arctan quotient"]),
  integrals: four(MATHS, integrals, ["powerPrimitive definitePolynomial trigPrimitive", "expPrimitive inversePrimitive trigPrimitive definitePolynomial", "partsExp partsCos substitution logPrimitive", "substitution definiteParts partsCos logPrimitive"]),
  trigonometry: four(MATHS, trigonometry, ["exactValue schoolIdentity", "trigEquation schoolIdentity exactValue", "trigEquation period inverseTrig", "universityIdentity inverseTrig period"]),
  limits: four(MATHS, limits, ["rationalAtInfinity factor", "sinOverX growth factor", "growth expLimit rateAtZero", "taylor rateAtZero expLimit"]),
  explog: four(MATHS, explog, ["logRules expOfLogs", "solveExp solveLn logRules", "otherBase quadraticInExp expDerivative", "quadraticInExp otherBase expDerivative"]),
  probability: four(MATHS, probability, ["union combinations expectation", "binomial binomialMean totalProbability bayes", "binomialVariance poisson bayes combinations", "exponential standardize poisson"]),
  sequences: four(MATHS, sequences, ["arithmeticTerm geometricTerm", "arithmeticSum geometricSum geometricLimit", "fixedPoint geometricLimit explicitTerm", "explicitTerm fixedPoint"]),
  complex: four(MATHS, complex, ["product modulus", "quotient argument exponentialForm", "quadratic exponentialForm deMoivre", "deMoivre nthRoot"]),
  odes: four(MATHS, odes, ["homogeneous", "affine homogeneous", "separable distinctRoots affine", "doubleRoot complexRoots separable"]),
  linear: four(MATHS, linear, ["determinant2 product", "determinant3 inverse system", "scaledDeterminant inverse system rank", "eigenvalues rank"]),
  functions: four(MATHS, functions, ["vertex quadraticRoots", "tangent localMaximum inflection", "inflection localMaximum obliqueAsymptote", "obliqueAsymptote inflection"]),
  geometry: four(MATHS, geometry, ["dotProduct vectorNorm", "vectorAngle planeEquation", "pointPlaneDistance crossProduct planeEquation", "linePlane crossProduct"]),
  series: four(MATHS, series, ["", "", "geometricSeries telescoping", "exponentialSeries radius telescoping"]),
  multivariable: four(MATHS, multivariable, ["", "", "partialDerivative gradient", "criticalPoint doubleIntegral"]),
  graphs: four(MATHS, graphs, ["formulaToCurve curveToFormula", "derivativeCurve transformCurve tangentSlope solutionCount", "primitiveCurve formulaToCurveAdvanced planeFromEquation", "transformCurveAdvanced primitiveCurve formulaToCurveAdvanced"]),
};

// ------------------------------------------------------- physical chemistry

const chemistry = {
  gases: four(CHEMISTRY, gases, ["perfectGasPressure perfectGasAmount partialPressure", "rmsSpeed speedRatio partialPressure perfectGasAmount", "meanFreePath compressionFactor vdwPressure", "vdwPressure criticalTemperature compressionFactor"]),
  firstLaw: four(CHEMISTRY, firstLaw, ["expansionWork internalEnergyChange enthalpyFromEnergy", "reversibleWork hessLaw reactionEnthalpy", "kirchhoff adiabaticTemperature reversibleWork", "adiabaticPressure adiabaticTemperature kirchhoff"]),
  secondLaw: four(CHEMISTRY, secondLaw, ["entropyHeating transitionEntropy trouton", "entropyExpansion carnot reactionEntropy gibbsEnergy", "crossoverTemperature gibbsPressure gibbsEnergy", "debyeEntropy gibbsPressure crossoverTemperature"]),
  phases: four(CHEMISTRY, phases, ["phaseRule boilingTemperature", "clapeyronSlope vapourPressure", "vaporizationEnthalpy vapourPressure clapeyronSlope", "condensedPotential vaporizationEnthalpy"]),
  mixtures: four(CHEMISTRY, mixtures, ["raoultPressure freezingDepression boilingElevation", "gibbsMixing entropyMixing henrySolubility osmoticMolarMass", "vapourComposition leverRule activityCoefficient", "ionicStrength debyeHuckel activityCoefficient"]),
  equilibrium: four(CHEMISTRY, equilibrium, ["constantFromGibbs gibbsFromK", "reactionGibbs dissociationDegree cellGibbs cellPotential", "vantHoff vantHoffEnthalpy nernst", "cellEquilibrium combinedPotential vantHoffEnthalpy"]),
  quantum: four(CHEMISTRY, quantum, ["photonCount wienPeak deBroglie", "photoelectronSpeed uncertaintySpeed boxTransition", "vibrationWavenumber zeroPointEnergy rotationalFrequency", "zeroPointEnergy rotationalFrequency boxTransition"]),
  atoms: four(CHEMISTRY, atoms, ["hydrogenLine orbitalNodes", "ionizationEnergy orbitalNodes", "orbitalRadius ionizationEnergy", "spinOrbitSplitting orbitalRadius"]),
  kinetics: four(CHEMISTRY, kinetics, ["firstOrderConcentration firstOrderHalfLife", "secondOrderConcentration secondOrderHalfLife arrheniusRatio", "activationEnergy relaxation michaelisMenten quantumYield", "polymerization fretEfficiency sternVolmer relaxation"]),
  dynamics: four(CHEMISTRY, dynamics, ["collisionFactor diffusionLimit", "activationEnthalpy eyringRate", "saltEffect isotopeEffect", "marcusBarrier isotopeEffect saltEffect"]),
  spectroscopy: four(CHEMISTRY, spectroscopy, ["beerLambert rotationalLine", "bondLength ramanShift mostPopulatedJ", "anharmonicLine dissociationEnergy normalModes", "dopplerWidth lifetimeWidth dissociationEnergy"]),
  resonance: four(CHEMISTRY, resonance, ["larmorFrequency shiftInHertz", "multiplet populationExcess gValue", "spinDensity coalescence t2Linewidth", "inversionRecovery coalescence spinDensity"]),
  statistical: four(CHEMISTRY, statistical, ["boltzmannRatio populationTemperature", "thermalWavelength translationalPartition rotationalPartition symmetryNumber", "vibrationalPartition electronicPartition meanVibrationalEnergy", "twoLevelEnergy vibrationalHeatCapacity sackurTetrode residualEntropy"]),
};

// ------------------------------------------------------------------- Linux

/** The level of each written Linux question, in list order. */
export const LINUX_LETTERS: Record<string, Record<string, string>> = {
  files: { navigation: "BBIBBIB", links: "IIAAA", find: "IIAIIA", permissions: "IAAAABE", archives: "IABIEB" },
  text: { grep: "IBAIII", sed: "BIIAAAIIEAE", awk: "BIIBEAIAAIA", columns: "IBIIAA", pipelines: "AAEEB" },
  shell: { redirection: "IBBAE", expansion: "BIIAIE", control: "BIABAAE", environment: "IIBBB" },
  processes: { listing: "BIAIEA", signals: "IBEA", jobs: "IBA", services: "IIAAI", scheduling: "AEIA" },
  system: { storage: "BBIII", users: "BIIAB", packages: "BIAAI", info: "BAIII" },
  network: { interfaces: "BIIAI", transfer: "IIAAB", ssh: "BIAIE", dns: "IAE" },
  tools: { search: "IABBI", viewers: "BBBI", json: "IAB", monitoring: "BIBI", workflow: "IBAAIIB", diagnostics: "IAIE" },
  scripting: { tests: "AEIBIA", loops: "IAEAIE", functions: "IIBAA", arguments: "BIIAE", arrays: "IAAEE" },
  git: { commits: "BIIAIB", branches: "BIIIAA", undo: "BIAEI", remotes: "BIABIA" },
  vim: { modes: "BBBIAE", motions: "BIBIAA", editing: "IAIBII", search: "IIBAAE" },
};

const linuxTopic = (file: keyof typeof LINUX_LETTERS, topic: Topic, generated: Table = {}, names: [string, string, string, string] = ["", "", "", ""]): Table =>
  plus(shared(LINUX, LINUX_QUESTIONS[file]!, LINUX_LETTERS[file]!, generated, names), LINUX, newLists(topic, LINUX));

const linux = {
  linuxFiles: linuxTopic("files", "linuxFiles", linuxFiles, ["chmodToOctal", "chmodToSymbolic", "umask chmodToSymbolic", "umask"]),
  linuxText: linuxTopic("text", "linuxText", linuxText, ["", "sedSubstitute", "awkFields sedSubstitute", "awkFields"]),
  linuxShell: linuxTopic("shell", "linuxShell"),
  linuxProcesses: linuxTopic("processes", "linuxProcesses", linuxProcesses, ["", "", "cron", "cron"]),
  linuxSystem: linuxTopic("system", "linuxSystem"),
  linuxNetwork: linuxTopic("network", "linuxNetwork"),
  linuxTools: linuxTopic("tools", "linuxTools"),
  linuxScripting: linuxTopic("scripting", "linuxScripting", linuxScripting, ["", "", "paramExpansion", "paramExpansion"]),
  linuxGit: linuxTopic("git", "linuxGit"),
  linuxVim: linuxTopic("vim", "linuxVim"),
};

// --------------------------------------------------------------------- SQL

/** The level of each written SQL question, in list order. */
export const SQL_LETTERS: Record<string, Record<string, string>> = {
  select: { filtering: "BIABA", nulls: "BIEAI", sorting: "IBIEA", expressions: "BIIAB" },
  aggregate: { aggregates: "AIBAA", grouping: "IBABE", windows: "AAIAE" },
  join: { joins: "ABIEA", subqueries: "IIBAE", sets: "BIIA" },
  modify: { changes: "BEIIB", schema: "IABEI", transactions: "BBEAA", indexes: "IAAEE" },
  postgres: { psql: "BBIAI", pgFeatures: "IAIAIB", pgAdmin: "IAAEE" },
  sqlite: { sqliteShell: "BBIAB", sqliteTypes: "AIABE", sqliteRuntime: "AIAIB" },
  mysql: { mysqlClient: "BIBAA", mysqlSpecifics: "ABIIAB" },
  practice: { design: "IAIAE", safety: "BIAIB", performance: "AIEIA", operations: "AIBAB" },
};

const sqlTopic = (file: keyof typeof SQL_LETTERS, topic: Topic, generated: Table = {}, names: [string, string, string, string] = ["", "", "", ""]): Table =>
  plus(shared(SQL, SQL_QUESTIONS[file]!, SQL_LETTERS[file]!, generated, names), SQL, newLists(topic, SQL));

const sql = {
  sqlSelect: sqlTopic("select", "sqlSelect", sqlSelect, ["filterRows", "nullRows orderLimit", "orderLimit nullRows", ""]),
  sqlAggregate: sqlTopic("aggregate", "sqlAggregate", sqlAggregate, ["countValues", "averageAge countValues", "groupCount", "groupCount"]),
  sqlJoins: sqlTopic("join", "sqlJoins", sqlJoins, ["", "", "joinRows", "joinRows"]),
  sqlModify: sqlTopic("modify", "sqlModify"),
  sqlPostgres: sqlTopic("postgres", "sqlPostgres"),
  sqlSqlite: sqlTopic("sqlite", "sqlSqlite"),
  sqlMysql: sqlTopic("mysql", "sqlMysql"),
  sqlPractice: sqlTopic("practice", "sqlPractice"),
};

// --------------------------------------------------------- chemical equations

const chembio = {
  balancing: plus(four(CHEMBIO, balancing, ["synthesis decomposition", "combustion neutralization synthesis", "displacement combustion coefficient", "coefficient displacement"]), CHEMBIO, newLists("balancing", CHEMBIO)),
};

// ------------------------------------------------- economics, calculus, Capital

const econTopic = (topic: Topic, names: [string, string, string, string]): Table =>
  plus(four(ECON, (econ as unknown as Record<string, Table>)[topic]!, names), ECON, newLists(topic, ECON));

const economics = {
  econWelfare: econTopic("econWelfare", ["swfChoice", "swfChoice", "swfChoice", "swfChoice"]),
  econMarketFailure: econTopic("econMarketFailure", ["samuelson", "pigou samuelson", "pigou samuelson", "pigou samuelson"]),
  econPublicChoice: econTopic("econPublicChoice", ["medianVoter", "medianVoter", "medianVoter", "medianVoter"]),
  econIncidence: econTopic("econIncidence", ["surplusAreas", "taxIncidence surplusAreas", "taxIncidence", "taxIncidence"]),
  econOptimalTax: econTopic("econOptimalTax", ["", "ramsey", "ramsey saezTopRate", "saezTopRate ramsey"]),
  econTaxDesign: econTopic("econTaxDesign", ["taxSchedule", "taxSchedule", "taxSchedule", "taxSchedule"]),
  econSocialInsurance: econTopic("econSocialInsurance", ["", "insurancePremium", "insurancePremium", "insurancePremium"]),
  econRedistribution: econTopic("econRedistribution", ["giniLorenz", "giniLorenz benefitTrap", "giniLorenz benefitTrap", "benefitTrap"]),
  econLabour: econTopic("econLabour", ["", "monopsony", "monopsony", "monopsony"]),
};

const calcTopic = (topic: Topic, names: [string, string, string, string]): Table =>
  plus(four(CALC, (calc as unknown as Record<string, Table>)[topic]!, names), CALC, newLists(topic, CALC));

const calculus = {
  calcLimits: calcTopic("calcLimits", ["limitGraph", "limitGraph", "limitGraph epsilonDelta", "epsilonDelta"]),
  calcDerivatives: calcTopic("calcDerivatives", ["secantSlope", "secantSlope tangentLine", "secantSlope tangentLine", "tangentLine"]),
  calcApplications: calcTopic("calcApplications", ["extremaFromDerivative", "extremaFromDerivative newtonMethod", "extremaFromDerivative newtonMethod", "newtonMethod"]),
  calcIntegrals: calcTopic("calcIntegrals", ["riemannSum netArea", "riemannSum netArea areaFunction", "riemannSum netArea areaFunction", "areaFunction"]),
  calcTranscendental: calcTopic("calcTranscendental", ["halfLife", "halfLife lhopital", "halfLife lhopital", "lhopital"]),
  calcTechniques: calcTopic("calcTechniques", ["numericIntegral", "numericIntegral improperIntegral", "numericIntegral improperIntegral", "improperIntegral"]),
  calcOde: calcTopic("calcOde", ["slopeField eulerMethod", "eulerMethod slopeField logisticHarvest", "eulerMethod slopeField logisticHarvest", "logisticHarvest"]),
  calcParametric: calcTopic("calcParametric", ["polarRose", "polarRose parametricSlope", "polarRose parametricSlope", "parametricSlope"]),
  calcSeries: calcTopic("calcSeries", ["geometricSeries", "geometricSeries taylorGraph", "geometricSeries taylorGraph", "taylorGraph"]),
  calcVectors: calcTopic("calcVectors", ["vectorAngle", "vectorAngle crossArea", "vectorAngle crossArea", "crossArea"]),
  calcMultivariable: calcTopic("calcMultivariable", ["", "directionalDerivative classifyCritical", "directionalDerivative classifyCritical", "classifyCritical directionalDerivative"]),
  calcVectorCalculus: calcTopic("calcVectorCalculus", ["", "greenCirculation", "greenCirculation", "greenCirculation"]),
  calcStochastic: calcTopic("calcStochastic", ["brownianMoments", "brownianMoments", "brownianMoments itoFormula geometricBrownian", "itoFormula geometricBrownian"]),
};

/** Capital: the three levels stay; Expert has the hardest computations and its own lists. */
const marxTopic = (topic: Topic, names: string): Table =>
  plus(four(MARX, (marx as unknown as Record<string, Table>)[topic]!, ["", "", "", names]), MARX, newLists(topic, MARX));

const capital = {
  marxCommodity: marxTopic("marxCommodity", "socialValue"),
  marxMoney: marxTopic("marxMoney", "moneyQuantity"),
  marxSurplus: marxTopic("marxSurplus", "productValue surplusRate"),
  marxWorkingDay: marxTopic("marxWorkingDay", "workingDay"),
  marxRelative: marxTopic("marxRelative", "relativeSurplus"),
  marxWages: marxTopic("marxWages", "hourlyWage"),
  marxAccumulation: marxTopic("marxAccumulation", "accumulationSplit"),
  marxPrimitive: marxTopic("marxPrimitive", ""),
  marxCirculation: marxTopic("marxCirculation", "turnover"),
  marxReproduction: marxTopic("marxReproduction", "reproductionSurplus"),
  marxProfit: marxTopic("marxProfit", "pricesOfProduction fallingRate"),
  marxCredit: marxTopic("marxCredit", "differentialRent capitalised"),
};

/** What each level holds from LEVELS_VERSION, for the topics whose levels changed. */
export const STANDARD: Partial<Record<Topic, Table>> = { ...maths, ...chemistry, ...linux, ...sql, ...chembio, ...economics, ...calculus, ...capital };
