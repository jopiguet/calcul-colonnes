/**
 * The names of the experiments and of their groups, as the home page shows them,
 * in French, Spanish and English. Apart from their texts (the *-i18n files), which
 * come with the experiments: the home page loads only these.
 */
import { currentLang } from "../i18n";

const fr = {
  discover: {
    coinsText: "Des séries, et une pièce sans mémoire.",
    coinsTitle: "🪙 Pile ou face",
    diceText: "Deux dés : prévoir, lancer, comprendre.",
    diceTitle: "🎲 Le labo des probabilités",
    group: "Découvrir",
    puzzlesText: "Des nombres à placer, et des indices qui expliquent.",
    puzzlesTitle: "🧩 Grilles logiques",
  },
  physics: {
    circuitsText: "Des ampoules en série et en parallèle.",
    circuitsTitle: "💡 Les circuits",
    group: "Physique",
    lensesText: "Former une image nette sur un écran.",
    lensesTitle: "🔍 Les lentilles",
    pendulumText: "Ce qui change le rythme d'un balancier, et ce qui ne le change pas.",
    pendulumTitle: "⏱️ Le pendule",
    throwText: "Prévoir où elle tombe, puis la lancer.",
    throwTitle: "🏀 Lancer une balle",
  },
  astro: {
    eclipsesText: "Pourquoi il n'y a pas une éclipse chaque mois.",
    eclipsesTitle: "🌑 Les éclipses",
    group: "Astronomie",
    moonText: "Pourquoi la Lune change de forme au fil du mois.",
    moonTitle: "🌓 Les phases de la Lune",
    planetsText: "Les lois de Kepler, et pourquoi Mars recule parfois.",
    planetsTitle: "🪐 Les orbites des planètes",
    seasonsText: "Pourquoi il fait chaud en été : la distance ou l'inclinaison ?",
    seasonsTitle: "🌍 Les saisons",
  },
  bio: {
    cellsText: "Surface, volume, et le temps que met l'oxygène à entrer.",
    cellsTitle: "🦠 Pourquoi les cellules sont petites",
    ecologyText: "Proies et prédateurs : des cycles qui ne s'arrêtent pas.",
    ecologyTitle: "🐇 Lièvres et lynx",
    geneticsText: "Le tableau de croisement, puis de vrais descendants tirés au hasard.",
    geneticsTitle: "🫛 Les pois de Mendel",
    group: "Chimie et biologie",
    moleculesText: "Des liaisons selon les valences, des formes selon les paires d'électrons.",
    moleculesTitle: "🧬 Construire des molécules",
  },
  math: {
    chaosText: "Des sauts au hasard qui dessinent un triangle de Sierpinski.",
    chaosTitle: "🎲 Le jeu du chaos",
    group: "Curiosités mathématiques",
    kochText: "Un périmètre infini autour d'une aire finie.",
    kochTitle: "❄️ Le flocon de Koch",
    logisticText: "Une population, une ligne de calcul : cycles, doublements, chaos.",
    logisticTitle: "🐇 De l'ordre au chaos",
    lorenzText: "L'effet papillon : un écart minuscule, une autre météo.",
    lorenzTitle: "🦋 L'attracteur de Lorenz",
    mandelbrotText: "Une seule règle, z² + c, et un bord sans fin.",
    mandelbrotTitle: "🌀 L'ensemble de Mandelbrot",
  },
};

type Names = { [A in keyof typeof fr]: Record<keyof (typeof fr)[A], string> };

const es: Names = {
  discover: {
    coinsText: "Rachas, y una moneda sin memoria.",
    coinsTitle: "🪙 Cara o cruz",
    diceText: "Dos dados: prever, lanzar, entender.",
    diceTitle: "🎲 El laboratorio de probabilidades",
    group: "Descubrir",
    puzzlesText: "Números que colocar, y pistas que explican.",
    puzzlesTitle: "🧩 Cuadrículas lógicas",
  },
  physics: {
    circuitsText: "Bombillas en serie y en paralelo.",
    circuitsTitle: "💡 Los circuitos",
    group: "Física",
    lensesText: "Formar una imagen nítida en una pantalla.",
    lensesTitle: "🔍 Las lentes",
    pendulumText: "Lo que cambia el ritmo de un péndulo, y lo que no.",
    pendulumTitle: "⏱️ El péndulo",
    throwText: "Prever dónde cae y luego lanzarla.",
    throwTitle: "🏀 Lanzar una pelota",
  },
  astro: {
    eclipsesText: "Por qué no hay un eclipse cada mes.",
    eclipsesTitle: "🌑 Los eclipses",
    group: "Astronomía",
    moonText: "Por qué la Luna cambia de forma a lo largo del mes.",
    moonTitle: "🌓 Las fases de la Luna",
    planetsText: "Las leyes de Kepler, y por qué Marte a veces retrocede.",
    planetsTitle: "🪐 Las órbitas de los planetas",
    seasonsText: "Por qué hace calor en verano: ¿la distancia o la inclinación?",
    seasonsTitle: "🌍 Las estaciones",
  },
  bio: {
    cellsText: "Superficie, volumen y el tiempo que tarda el oxígeno en entrar.",
    cellsTitle: "🦠 Por qué las células son pequeñas",
    ecologyText: "Presas y depredadores: ciclos que no se detienen.",
    ecologyTitle: "🐇 Liebres y linces",
    geneticsText: "El cuadro de cruce, y luego descendientes reales sacados al azar.",
    geneticsTitle: "🫛 Los guisantes de Mendel",
    group: "Química y biología",
    moleculesText: "Enlaces según las valencias, formas según los pares de electrones.",
    moleculesTitle: "🧬 Construir moléculas",
  },
  math: {
    chaosText: "Saltos al azar que dibujan un triángulo de Sierpinski.",
    chaosTitle: "🎲 El juego del caos",
    group: "Curiosidades matemáticas",
    kochText: "Un perímetro infinito alrededor de un área finita.",
    kochTitle: "❄️ El copo de Koch",
    logisticText: "Una población, una línea de cálculo: ciclos, duplicaciones, caos.",
    logisticTitle: "🐇 Del orden al caos",
    lorenzText: "El efecto mariposa: una diferencia minúscula, otro tiempo.",
    lorenzTitle: "🦋 El atractor de Lorenz",
    mandelbrotText: "Una sola regla, z² + c, y un borde sin fin.",
    mandelbrotTitle: "🌀 El conjunto de Mandelbrot",
  },
};

const en: Names = {
  discover: {
    coinsText: "Streaks, and a coin with no memory.",
    coinsTitle: "🪙 Heads or tails",
    diceText: "Two dice: predict, roll, understand.",
    diceTitle: "🎲 The probability lab",
    group: "Discover",
    puzzlesText: "Numbers to place, and hints that explain.",
    puzzlesTitle: "🧩 Logic grids",
  },
  physics: {
    circuitsText: "Bulbs in series and in parallel.",
    circuitsTitle: "💡 Circuits",
    group: "Physics",
    lensesText: "Make a sharp image on a screen.",
    lensesTitle: "🔍 Lenses",
    pendulumText: "What changes a swing's rhythm, and what does not.",
    pendulumTitle: "⏱️ The pendulum",
    throwText: "Predict where it lands, then throw it.",
    throwTitle: "🏀 Throw a ball",
  },
  astro: {
    eclipsesText: "Why there isn't an eclipse every month.",
    eclipsesTitle: "🌑 Eclipses",
    group: "Astronomy",
    moonText: "Why the Moon changes shape over the month.",
    moonTitle: "🌓 The Moon's phases",
    planetsText: "Kepler's laws, and why Mars sometimes goes backwards.",
    planetsTitle: "🪐 The planets' orbits",
    seasonsText: "Why summer is warm: the distance or the tilt?",
    seasonsTitle: "🌍 The seasons",
  },
  bio: {
    cellsText: "Surface, volume, and how long oxygen takes to get in.",
    cellsTitle: "🦠 Why cells are small",
    ecologyText: "Prey and predators: cycles that never stop.",
    ecologyTitle: "🐇 Hares and lynxes",
    geneticsText: "The Punnett square, then real offspring drawn by chance.",
    geneticsTitle: "🫛 Mendel's peas",
    group: "Chemistry and biology",
    moleculesText: "Bonds from valences, shapes from electron pairs.",
    moleculesTitle: "🧬 Build molecules",
  },
  math: {
    chaosText: "Random jumps that draw a Sierpinski triangle.",
    chaosTitle: "🎲 The chaos game",
    group: "Mathematical curiosities",
    kochText: "An infinite perimeter around a finite area.",
    kochTitle: "❄️ The Koch snowflake",
    logisticText: "One population, one line of arithmetic: cycles, doublings, chaos.",
    logisticTitle: "🐇 From order to chaos",
    lorenzText: "The butterfly effect: a tiny difference, different weather.",
    lorenzTitle: "🦋 The Lorenz attractor",
    mandelbrotText: "A single rule, z² + c, and an endless edge.",
    mandelbrotTitle: "🌀 The Mandelbrot set",
  },
};

export const LAB_NAMES: Record<"fr" | "es" | "en", Names> = { fr, es, en };

export type LabArea = keyof Names;
/** The name of an experiment ("coinsTitle"), its line ("coinsText") or its group ("group"). */
export const labName = <A extends LabArea>(area: A, key: keyof Names[A]): string => LAB_NAMES[currentLang()][area][key] as string;
