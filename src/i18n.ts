/** Interface texts, in French, Spanish and English. Add a language by adding one dictionary. */

const fr = {
  appTitle: "Calcul en colonnes",
  pageTitle: "Luma – Mon cahier",
  language: "Langue",
  whoPlays: "Qui joue ?",
  newName: "Nouveau prénom",
  add: "Ajouter",
  nameRequired: "Écris un prénom",
  nameTaken: "Ce prénom existe déjà",
  nameFailed: "Impossible d'enregistrer ce joueur",
  back: "Retour",
  scores: "Scores",
  player: "Joueur",
  changePlayer: "Joueur : {name}. Changer de joueur",
  today: "Aujourd'hui",
  total: "Total",
  successRate: "Réussite",
  deletePlayer: "Supprimer {name}",
  confirmDelete: "Supprimer {name} et tous ses scores ?",
  deleteFailed: "Suppression impossible : serveur injoignable.",
  upTo: "Jusqu'à",
  maximumGroup: "Maximum du grand nombre",
  decreaseMaximum: "Diminuer le maximum",
  increaseMaximum: "Augmenter le maximum",
  smallUpTo: "× ÷ par un nombre jusqu'à",
  smallGroup: "Maximum du multiplicateur et du diviseur",
  decreaseSmall: "Diminuer le maximum du multiplicateur et du diviseur",
  increaseSmall: "Augmenter le maximum du multiplicateur et du diviseur",
  operations: "Opérations",
  addition: "Addition",
  subtraction: "Soustraction",
  multiplication: "Multiplication",
  division: "Division",
  score: "Score : {score}/{questions}",
  check: "Valider",
  next: "Suivant",
  finish: "Terminer",
  correct: "✅ Bravo",
  wrong: "❌ Dommage, la réponse était {answer}",
  wrongDivision: "❌ Dommage, la réponse était {quotient}, reste {remainder}",
  needDigits: "😵‍💫 Écris ta réponse avec des chiffres",
  missingDigit: "😵‍💫 Il manque un chiffre dans ta réponse",
  needRemainder: "😵‍💫 Écris aussi le reste (0 s'il n'y en a pas)",
  unsaved: "⚠️ Réponse non enregistrée (serveur injoignable)",
  finalScore: "👋 Ton score est de {score}/{questions}",
  restart: "Recommencer",
  worksheet: "🖨️ Fiche PDF de {count} calculs",
  offlineTitle: "Serveur injoignable",
  offlineText: "Les joueurs et les scores sont sur le serveur. Vérifie qu'il est démarré.",
  retry: "Réessayer",
  updateReady: "Une nouvelle version de Luma est prête.",
  updateNow: "Mettre à jour",
  carryOf: "retenue des {column}",
  quotient: "Quotient",
  remainder: "Reste",
  digitOf: "{what}, chiffre {n}",
  partialRow: "Produit partiel {n}, {column}",
  workingLine: "Ligne de calcul {n}, case {m}",
  pdfName: "Prénom :",
  pdfDate: "Date :",
};

export type Key = keyof typeof fr;

const es: Record<Key, string> = {
  appTitle: "Cálculo en columnas",
  pageTitle: "Luma – Mi cuaderno",
  language: "Idioma",
  whoPlays: "¿Quién juega?",
  newName: "Nuevo nombre",
  add: "Añadir",
  nameRequired: "Escribe un nombre",
  nameTaken: "Ese nombre ya existe",
  nameFailed: "No se pudo guardar el jugador",
  back: "Volver",
  scores: "Puntuaciones",
  player: "Jugador",
  changePlayer: "Jugador: {name}. Cambiar de jugador",
  today: "Hoy",
  total: "Total",
  successRate: "Aciertos",
  deletePlayer: "Eliminar a {name}",
  confirmDelete: "¿Eliminar a {name} y todas sus puntuaciones?",
  deleteFailed: "No se pudo eliminar: no hay conexión con el servidor.",
  upTo: "Hasta",
  maximumGroup: "Máximo del número grande",
  decreaseMaximum: "Reducir el máximo",
  increaseMaximum: "Aumentar el máximo",
  smallUpTo: "× ÷ por un número hasta",
  smallGroup: "Máximo del multiplicador y del divisor",
  decreaseSmall: "Reducir el máximo del multiplicador y del divisor",
  increaseSmall: "Aumentar el máximo del multiplicador y del divisor",
  operations: "Operaciones",
  addition: "Suma",
  subtraction: "Resta",
  multiplication: "Multiplicación",
  division: "División",
  score: "Puntos: {score}/{questions}",
  check: "Comprobar",
  next: "Siguiente",
  finish: "Terminar",
  correct: "✅ ¡Muy bien!",
  wrong: "❌ Lástima, la respuesta era {answer}",
  wrongDivision: "❌ Lástima, la respuesta era {quotient}, resto {remainder}",
  needDigits: "😵‍💫 Escribe tu respuesta con cifras",
  missingDigit: "😵‍💫 Falta una cifra en tu respuesta",
  needRemainder: "😵‍💫 Escribe también el resto (0 si no hay)",
  unsaved: "⚠️ Respuesta no guardada (sin conexión con el servidor)",
  finalScore: "👋 Tu puntuación es {score}/{questions}",
  restart: "Volver a empezar",
  worksheet: "🖨️ Ficha PDF de {count} operaciones",
  offlineTitle: "Servidor no disponible",
  offlineText: "Los jugadores y las puntuaciones están en el servidor. Comprueba que está en marcha.",
  retry: "Reintentar",
  updateReady: "Hay una nueva versión de Luma.",
  updateNow: "Actualizar",
  carryOf: "llevada de las {column}",
  quotient: "Cociente",
  remainder: "Resto",
  digitOf: "{what}, cifra {n}",
  partialRow: "Producto parcial {n}, {column}",
  workingLine: "Línea de cálculo {n}, casilla {m}",
  pdfName: "Nombre:",
  pdfDate: "Fecha:",
};

const en: Record<Key, string> = {
  appTitle: "Column arithmetic",
  pageTitle: "Luma – My exercise book",
  language: "Language",
  whoPlays: "Who's playing?",
  newName: "New first name",
  add: "Add",
  nameRequired: "Type a first name",
  nameTaken: "That name already exists",
  nameFailed: "Could not save this player",
  back: "Back",
  scores: "Scores",
  player: "Player",
  changePlayer: "Player: {name}. Change player",
  today: "Today",
  total: "Total",
  successRate: "Success",
  deletePlayer: "Delete {name}",
  confirmDelete: "Delete {name} and all their scores?",
  deleteFailed: "Could not delete: the server cannot be reached.",
  upTo: "Up to",
  maximumGroup: "Largest number",
  decreaseMaximum: "Lower the maximum",
  increaseMaximum: "Raise the maximum",
  smallUpTo: "× ÷ by a number up to",
  smallGroup: "Largest multiplier and divisor",
  decreaseSmall: "Lower the largest multiplier and divisor",
  increaseSmall: "Raise the largest multiplier and divisor",
  operations: "Operations",
  addition: "Addition",
  subtraction: "Subtraction",
  multiplication: "Multiplication",
  division: "Division",
  score: "Score: {score}/{questions}",
  check: "Check",
  next: "Next",
  finish: "Finish",
  correct: "✅ Well done",
  wrong: "❌ Not quite, the answer was {answer}",
  wrongDivision: "❌ Not quite, the answer was {quotient}, remainder {remainder}",
  needDigits: "😵‍💫 Write your answer in digits",
  missingDigit: "😵‍💫 A digit is missing in your answer",
  needRemainder: "😵‍💫 Write the remainder too (0 if there is none)",
  unsaved: "⚠️ Answer not saved (server unreachable)",
  finalScore: "👋 Your score is {score}/{questions}",
  restart: "Start again",
  worksheet: "🖨️ PDF sheet of {count} sums",
  offlineTitle: "Server unreachable",
  offlineText: "Players and scores are kept on the server. Check that it is running.",
  retry: "Try again",
  updateReady: "A new version of Luma is ready.",
  updateNow: "Update",
  carryOf: "carry of the {column}",
  quotient: "Quotient",
  remainder: "Remainder",
  digitOf: "{what}, digit {n}",
  partialRow: "Partial product {n}, {column}",
  workingLine: "Working line {n}, box {m}",
  pdfName: "Name:",
  pdfDate: "Date:",
};

/** Column names from the units upwards. */
const columns = {
  fr: ["unités", "dizaines", "centaines", "milliers", "dizaines de milliers", "centaines de milliers"],
  es: ["unidades", "decenas", "centenas", "unidades de millar", "decenas de millar", "centenas de millar"],
  en: ["units", "tens", "hundreds", "thousands", "ten thousands", "hundred thousands"],
};

const dictionaries = { fr, es, en };

export type Lang = keyof typeof dictionaries;

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
];

export const isLang = (value: unknown): value is Lang =>
  typeof value === "string" && value in dictionaries;

let current: Lang = "fr";

export const currentLang = (): Lang => current;

export function setLang(lang: Lang): void {
  current = lang;
  document.documentElement.lang = lang;
  document.title = t("pageTitle");
}

export function t(key: Key, values: Record<string, string | number> = {}): string {
  return dictionaries[current][key].replace(/\{(\w+)\}/g, (_, name: string) =>
    String(values[name] ?? ""),
  );
}

/** Name of a column counted from the right: 0 = units, 1 = tens… */
export function columnName(fromRight: number): string {
  return columns[current][fromRight] ?? `10^${fromRight}`;
}
