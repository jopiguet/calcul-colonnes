/** Texts of the progress pages (the overview and each activity's), in French, Spanish and English. */
import { currentLang, type Lang } from "./i18n";

const fr = {
  chipLabel: "Mon progrès dans toutes les activités",
  today: "Aujourd'hui",
  todayColumns: "{right} calculs justes sur {total}",
  todayVocab: "{right} mots justes sur {answers}",
  todayQuiz: "{right} bonnes réponses sur {answers} aux tests",
  todayNothing: "Rien encore aujourd'hui.",
  activities: "Par activité",
  notStarted: "Pas encore commencé.",
  details: "Détails",
  columnsLine: "{right} justes sur {total} · {rate}",
  skillsLine: "{count} notions rencontrées",
  wordsLine: "{started} mots commencés sur {total}",
  charsLine: "{started} caractères commencés sur {total}",
  wordsDue: "{count} à revoir aujourd'hui",
  skipped: "{count} passés",
  bookStats: "Statistiques du livre",
  backOverview: "← Tout le progrès",
  nothingShown: "Aucune activité affichée pour ce joueur.",
};

type Key = keyof typeof fr;

const es: Record<Key, string> = {
  chipLabel: "Mi progreso en todas las actividades",
  today: "Hoy",
  todayColumns: "{right} cálculos correctos de {total}",
  todayVocab: "{right} palabras correctas de {answers}",
  todayQuiz: "{right} respuestas correctas de {answers} en los tests",
  todayNothing: "Nada todavía hoy.",
  activities: "Por actividad",
  notStarted: "Aún no empezado.",
  details: "Detalles",
  columnsLine: "{right} correctos de {total} · {rate}",
  skillsLine: "{count} conceptos vistos",
  wordsLine: "{started} palabras empezadas de {total}",
  charsLine: "{started} caracteres empezados de {total}",
  wordsDue: "{count} por repasar hoy",
  skipped: "{count} saltadas",
  bookStats: "Estadísticas del libro",
  backOverview: "← Todo el progreso",
  nothingShown: "Ninguna actividad visible para este jugador.",
};

const en: Record<Key, string> = {
  chipLabel: "My progress in every activity",
  today: "Today",
  todayColumns: "{right} sums right out of {total}",
  todayVocab: "{right} words right out of {answers}",
  todayQuiz: "{right} right answers out of {answers} in tests",
  todayNothing: "Nothing yet today.",
  activities: "By activity",
  notStarted: "Not started yet.",
  details: "Details",
  columnsLine: "{right} right out of {total} · {rate}",
  skillsLine: "{count} topics met",
  wordsLine: "{started} words started out of {total}",
  charsLine: "{started} characters started out of {total}",
  wordsDue: "{count} to review today",
  skipped: "{count} skipped",
  bookStats: "Book statistics",
  backOverview: "← All my progress",
  nothingShown: "No activity is shown for this player.",
};

const dictionaries: Record<Lang, Record<Key, string>> = { fr, es, en };

export function prt(key: Key, values: Record<string, string | number> = {}): string {
  return dictionaries[currentLang()][key].replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? ""));
}
