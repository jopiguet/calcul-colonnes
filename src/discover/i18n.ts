import { currentLang, type Lang } from "../i18n";

/** Texts of the Discover activities. Numbers are filled in with {name}. */
const fr = {
  group: "Découvrir",
  diceTitle: "🎲 Le labo des probabilités",
  diceText: "Deux dés : prévoir, lancer, comprendre.",
  experiment: "Expérience n° {seed}",

  // 1. Predict
  stepPredict: "1. Prévoir",
  predictIntro: "On lance deux dés et on additionne les points. Avant de lancer : qu'est-ce qui va se passer ?",
  predictMost: "Quelle somme sortira le plus souvent ?",
  allSame: "Toutes autant",
  predictSevens: "Sur 100 lancers, combien de fois la somme 7 ?",
  sevensValue: "{count} fois sur 100",
  predictDone: "Lancer les dés",
  predictNeeded: "Choisis d'abord une somme.",

  // 2. Experiment
  stepExperiment: "2. Lancer",
  rollTimes: "Lancer × {count}",
  rollOnce: "Lancer une fois",
  rollsCount: "{rolls} lancers",
  rollsOne: "1 lancer",
  diceLabel: "Dé 1 : {a}, dé 2 : {b}, somme {sum}",
  sumIs: "= {sum}",
  sevensSoFar: "La somme 7 : {count} fois, soit {pct} des lancers",
  noRollYet: "Pas encore de lancer.",
  histogramTitle: "Combien de fois chaque somme",
  histogramAria: "Lancers par somme : {list}",
  sumTip: "Somme {sum} : {count} fois",
  sumTipTheory: "Somme {sum} : {count} fois ; la théorie en attend {expected}",
  seriesTitle: "Séries de 10 lancers",
  seriesHint: "Combien de 7 dans chaque série de 10 (bouton × 10). Elles ne se ressemblent pas : c'est le hasard.",
  seriesEmpty: "Lance par 10 pour voir les séries.",
  seriesItem: "{count} sur 10",
  pathTitle: "La part de 7, lancer après lancer",
  pathAria: "Part de 7 après {rolls} lancers : {pct}",
  pathAxis: "nombre de lancers",
  pathTheory: "1 sur 6",
  revealReady: "Comparer avec la théorie",
  revealHint: "Lance au moins 100 fois avant de comparer.",

  // 3. Compare
  stepCompare: "3. Comparer",
  gridTitle: "Les 36 façons de tomber",
  gridIntro: "Chaque case est une façon de tomber : le dé 1 en colonne, le dé 2 en ligne. Les 36 cases ont toutes la même chance.",
  gridSeven: "6 cases sur 36 donnent 7 : 1 + 6, 2 + 5, 3 + 4, 4 + 3, 5 + 2, 6 + 1.",
  gridEdges: "Une seule case donne 2 (1 + 1), une seule donne 12 (6 + 6).",
  die1: "Dé 1",
  die2: "Dé 2",
  theoryTitle: "La théorie",
  theoryLine: "La somme 7 sort en moyenne 1 fois sur 6, soit environ {pct}.",
  tableSum: "Somme",
  tableWays: "Cases",
  tableTheory: "Théorie",
  tableMeasured: "Mesuré",
  youTitle: "Tes prévisions",
  youMostRight: "Tu avais prévu le 7 : c'est bien la somme la plus fréquente.",
  youMostSame: "Tu avais prévu que toutes les sommes sortent autant. Mais il y a 11 sommes et 36 façons de tomber : le 7 a 6 façons, le 2 une seule.",
  youMostOther: "Tu avais prévu le {sum}. Il a {ways} façons de tomber sur 36 ; le 7 en a 6.",
  youSevens: "Tu avais prévu {guess} fois 7 sur 100. La théorie dit environ 17 ; ton expérience a donné {measured} sur 100.",

  // 4. Explain
  stepExplain: "4. Comprendre",
  explainVary: "Le hasard fait varier les petites séries : sur 10 lancers, on peut avoir zéro 7 ou quatre 7. C'est normal.",
  explainLarge: "Plus on lance, plus la part de 7 se rapproche de 1 sur 6. C'est la loi des grands nombres.",
  explainMemory: "Mais les dés n'ont pas de mémoire : ils ne « rattrapent » rien. Chaque lancer a les mêmes chances que le précédent.",

  // 5. Check
  stepCheck: "5. Vérifier",
  checkQuestion: "Les trois derniers lancers ont donné 7. Au prochain lancer, le 7 est…",
  checkLess: "moins probable : il est déjà beaucoup sorti",
  checkSame: "toujours 1 chance sur 6",
  checkMore: "plus probable : c'est une bonne série",
  checkRight: "✓ Juste. Les dés ne se souviennent pas des lancers d'avant : toujours 6 cases sur 36.",
  checkWrong: "✗ Pas tout à fait. Les dés ne se souviennent pas des lancers d'avant : le 7 a toujours 6 cases sur 36, soit 1 chance sur 6.",

  again: "Nouvelle expérience",
  replay: "Refaire l'expérience n°",
  replayGo: "Rejouer",
  replayHint: "Même numéro, mêmes lancers : pour comparer avec quelqu'un.",
  keepRolling: "Continue à lancer : la courbe s'approche de la ligne 1 sur 6.",
};

type Key = keyof typeof fr;

const es: Record<Key, string> = {
  group: "Descubrir",
  diceTitle: "🎲 El laboratorio de probabilidades",
  diceText: "Dos dados: prever, lanzar, entender.",
  experiment: "Experimento n.º {seed}",

  stepPredict: "1. Prever",
  predictIntro: "Lanzamos dos dados y sumamos los puntos. Antes de lanzar: ¿qué va a pasar?",
  predictMost: "¿Qué suma saldrá más a menudo?",
  allSame: "Todas igual",
  predictSevens: "En 100 lanzamientos, ¿cuántas veces la suma 7?",
  sevensValue: "{count} veces de 100",
  predictDone: "Lanzar los dados",
  predictNeeded: "Elige primero una suma.",

  stepExperiment: "2. Lanzar",
  rollTimes: "Lanzar × {count}",
  rollOnce: "Lanzar una vez",
  rollsCount: "{rolls} lanzamientos",
  rollsOne: "1 lanzamiento",
  diceLabel: "Dado 1: {a}, dado 2: {b}, suma {sum}",
  sumIs: "= {sum}",
  sevensSoFar: "La suma 7: {count} veces, es decir {pct} de los lanzamientos",
  noRollYet: "Todavía ningún lanzamiento.",
  histogramTitle: "Cuántas veces cada suma",
  histogramAria: "Lanzamientos por suma: {list}",
  sumTip: "Suma {sum}: {count} veces",
  sumTipTheory: "Suma {sum}: {count} veces; la teoría espera {expected}",
  seriesTitle: "Series de 10 lanzamientos",
  seriesHint: "Cuántos 7 en cada serie de 10 (botón × 10). No se parecen: es el azar.",
  seriesEmpty: "Lanza de 10 en 10 para ver las series.",
  seriesItem: "{count} de 10",
  pathTitle: "La parte de 7, lanzamiento a lanzamiento",
  pathAria: "Parte de 7 tras {rolls} lanzamientos: {pct}",
  pathAxis: "número de lanzamientos",
  pathTheory: "1 de cada 6",
  revealReady: "Comparar con la teoría",
  revealHint: "Lanza al menos 100 veces antes de comparar.",

  stepCompare: "3. Comparar",
  gridTitle: "Las 36 maneras de caer",
  gridIntro: "Cada casilla es una manera de caer: el dado 1 en columna, el dado 2 en fila. Las 36 casillas tienen la misma probabilidad.",
  gridSeven: "6 casillas de 36 dan 7: 1 + 6, 2 + 5, 3 + 4, 4 + 3, 5 + 2, 6 + 1.",
  gridEdges: "Una sola casilla da 2 (1 + 1), una sola da 12 (6 + 6).",
  die1: "Dado 1",
  die2: "Dado 2",
  theoryTitle: "La teoría",
  theoryLine: "La suma 7 sale de media 1 vez de cada 6, es decir alrededor del {pct}.",
  tableSum: "Suma",
  tableWays: "Casillas",
  tableTheory: "Teoría",
  tableMeasured: "Medido",
  youTitle: "Tus previsiones",
  youMostRight: "Habías previsto el 7: es la suma más frecuente.",
  youMostSame: "Habías previsto que todas las sumas salen igual. Pero hay 11 sumas y 36 maneras de caer: el 7 tiene 6 maneras, el 2 solo una.",
  youMostOther: "Habías previsto el {sum}. Tiene {ways} maneras de caer de 36; el 7 tiene 6.",
  youSevens: "Habías previsto {guess} veces 7 de 100. La teoría dice unas 17; tu experimento dio {measured} de 100.",

  stepExplain: "4. Entender",
  explainVary: "El azar hace variar las series cortas: en 10 lanzamientos puede haber cero 7 o cuatro 7. Es normal.",
  explainLarge: "Cuanto más se lanza, más se acerca la parte de 7 a 1 de cada 6. Es la ley de los grandes números.",
  explainMemory: "Pero los dados no tienen memoria: no «compensan» nada. Cada lanzamiento tiene las mismas probabilidades que el anterior.",

  stepCheck: "5. Comprobar",
  checkQuestion: "Los tres últimos lanzamientos dieron 7. En el siguiente, el 7 es…",
  checkLess: "menos probable: ya ha salido mucho",
  checkSame: "siempre 1 probabilidad de 6",
  checkMore: "más probable: es una buena racha",
  checkRight: "✓ Correcto. Los dados no recuerdan los lanzamientos anteriores: siempre 6 casillas de 36.",
  checkWrong: "✗ No del todo. Los dados no recuerdan los lanzamientos anteriores: el 7 sigue teniendo 6 casillas de 36, es decir 1 probabilidad de 6.",

  again: "Nuevo experimento",
  replay: "Repetir el experimento n.º",
  replayGo: "Repetir",
  replayHint: "Mismo número, mismos lanzamientos: para comparar con alguien.",
  keepRolling: "Sigue lanzando: la curva se acerca a la línea 1 de cada 6.",
};

const en: Record<Key, string> = {
  group: "Discover",
  diceTitle: "🎲 The probability lab",
  diceText: "Two dice: predict, roll, understand.",
  experiment: "Experiment no. {seed}",

  stepPredict: "1. Predict",
  predictIntro: "We roll two dice and add up the dots. Before rolling: what will happen?",
  predictMost: "Which sum will come up most often?",
  allSame: "All the same",
  predictSevens: "Out of 100 rolls, how many times will the sum be 7?",
  sevensValue: "{count} times out of 100",
  predictDone: "Roll the dice",
  predictNeeded: "Choose a sum first.",

  stepExperiment: "2. Roll",
  rollTimes: "Roll × {count}",
  rollOnce: "Roll once",
  rollsCount: "{rolls} rolls",
  rollsOne: "1 roll",
  diceLabel: "Die 1: {a}, die 2: {b}, sum {sum}",
  sumIs: "= {sum}",
  sevensSoFar: "Sum of 7: {count} times, that is {pct} of the rolls",
  noRollYet: "No roll yet.",
  histogramTitle: "How many times each sum",
  histogramAria: "Rolls per sum: {list}",
  sumTip: "Sum {sum}: {count} times",
  sumTipTheory: "Sum {sum}: {count} times; theory expects {expected}",
  seriesTitle: "Series of 10 rolls",
  seriesHint: "How many 7s in each series of 10 (the × 10 button). They differ: that is chance.",
  seriesEmpty: "Roll by tens to see the series.",
  seriesItem: "{count} of 10",
  pathTitle: "The share of 7s, roll after roll",
  pathAria: "Share of 7s after {rolls} rolls: {pct}",
  pathAxis: "number of rolls",
  pathTheory: "1 in 6",
  revealReady: "Compare with the theory",
  revealHint: "Roll at least 100 times before comparing.",

  stepCompare: "3. Compare",
  gridTitle: "The 36 ways to land",
  gridIntro: "Each square is one way the dice can land: die 1 across, die 2 down. All 36 squares are equally likely.",
  gridSeven: "6 squares out of 36 make 7: 1 + 6, 2 + 5, 3 + 4, 4 + 3, 5 + 2, 6 + 1.",
  gridEdges: "Only one square makes 2 (1 + 1), only one makes 12 (6 + 6).",
  die1: "Die 1",
  die2: "Die 2",
  theoryTitle: "The theory",
  theoryLine: "A sum of 7 comes up 1 time in 6 on average, about {pct}.",
  tableSum: "Sum",
  tableWays: "Squares",
  tableTheory: "Theory",
  tableMeasured: "Measured",
  youTitle: "Your predictions",
  youMostRight: "You predicted 7: it is indeed the most frequent sum.",
  youMostSame: "You predicted that all sums come up equally. But there are 11 sums and 36 ways to land: 7 has 6 ways, 2 only one.",
  youMostOther: "You predicted {sum}. It has {ways} ways to land out of 36; 7 has 6.",
  youSevens: "You predicted 7 would come up {guess} times out of 100. Theory says about 17; your experiment gave {measured} out of 100.",

  stepExplain: "4. Understand",
  explainVary: "Chance makes short series vary: in 10 rolls, you can get no 7 at all, or four. That is normal.",
  explainLarge: "The more you roll, the closer the share of 7s gets to 1 in 6. This is the law of large numbers.",
  explainMemory: "But dice have no memory: they do not “catch up”. Each roll has the same chances as the one before.",

  stepCheck: "5. Check",
  checkQuestion: "The last three rolls were 7s. On the next roll, a 7 is…",
  checkLess: "less likely: it has come up a lot already",
  checkSame: "still a 1 in 6 chance",
  checkMore: "more likely: it is on a streak",
  checkRight: "✓ Right. Dice do not remember earlier rolls: still 6 squares out of 36.",
  checkWrong: "✗ Not quite. Dice do not remember earlier rolls: 7 still has 6 squares out of 36, a 1 in 6 chance.",

  again: "New experiment",
  replay: "Replay experiment no.",
  replayGo: "Replay",
  replayHint: "Same number, same rolls: to compare with someone.",
  keepRolling: "Keep rolling: the curve gets closer to the 1 in 6 line.",
};

const dictionaries: Record<Lang, Record<Key, string>> = { fr, es, en };

export type DiscoverKey = Key;

export function dt(key: Key, values: Record<string, string | number> = {}): string {
  return dictionaries[currentLang()][key].replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? ""));
}

/** A share as a percentage in the interface's language: "16,7 %", "16,7 %", "16.7%". */
export function percent(share: number, digits = 1): string {
  const lang = currentLang();
  const locale = { fr: "fr-CH", es: "es-ES", en: "en-GB" }[lang];
  return new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(share);
}

/** A whole number in the interface's language: "1 000", "1000", "1,000". */
export function count(n: number): string {
  const locale = { fr: "fr-CH", es: "es-ES", en: "en-GB" }[currentLang()];
  return new Intl.NumberFormat(locale).format(n);
}
