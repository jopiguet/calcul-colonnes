/**
 * Checks the vocabulary grading and scheduling: `npm run check:vocab`.
 *
 * With a vocabulary file (`npm run check:vocab -- data/vocab.json`), it also
 * checks every entry: its own text is accepted in both directions, and no
 * entry is unaskable.
 */
import { readFileSync } from "node:fs";
import { acceptedForms, grade, writable, type AnswerLang, type Verdict } from "../shared/vocab/grade.ts";
import { askMode, entryStatus, nextState, DAY, MINUTE, TOP_BOX } from "../shared/vocab/schedule.ts";
import { parseVocabFile } from "../shared/vocab/format.ts";

let failures = 0;
function expect(label: string, actual: unknown, wanted: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    failures++;
    console.error(`✘ ${label}: got ${JSON.stringify(actual)}, wanted ${JSON.stringify(wanted)}`);
  }
}

const cases: [string, string, AnswerLang, Verdict][] = [
  // Spanish answers
  ["la llave", "la llave", "es", "right"],
  ["La Llave.", "la llave", "es", "right"],
  ["  la   llave ", "la llave", "es", "right"],
  ["llave", "la llave", "es", "article"],
  ["el llave", "la llave", "es", "article"],
  ["la lave", "la llave", "es", "typo"],
  ["el mal", "el mar", "es", "wrong"], // 3 letters: too short for a typo
  ["embarcarse", "embarcar(se)", "es", "right"],
  ["embarcar", "embarcar(se)", "es", "right"],
  ["el helicoptero", "el helicóptero", "es", "accent"],
  ["el helicóptro", "el helicóptero", "es", "typo"],
  ["el nino", "el niño / la niña", "es", "accent"],
  ["la niña", "el niño / la niña", "es", "right"],
  ["el niño / la niña", "el niño / la niña", "es", "right"],
  ["buenas noches", "Buenas tardes / noches.", "es", "right"],
  ["Buenas tardes", "Buenas tardes / noches.", "es", "right"],
  ["noches", "Buenas tardes / noches.", "es", "wrong"],
  ["esta es mi", "Este / Esta es mi...", "es", "right"],
  ["este es mi", "Este / Esta es mi...", "es", "right"],
  ["Cómo está", "¿Cómo está (él / ella)?", "es", "right"],
  ["cómo está él", "¿Cómo está (él / ella)?", "es", "right"],
  ["Estoy viudo", "Estoy divorciado / viudo.", "es", "right"],
  ["el agua", "el agua", "es", "right"],
  ["agua", "el agua", "es", "article"],
  ["", "el agua", "es", "wrong"],
  ["la casa", "el coche", "es", "wrong"],
  // English answers
  ["key", "key", "en", "right"],
  ["the key", "key", "en", "right"],
  ["walk", "to walk", "en", "right"],
  ["hi", "Hello/Hi!", "en", "right"],
  ["hello", "Hello/Hi!", "en", "right"],
  ["Are you married?", "Are you married/ single? (to a man)", "en", "right"],
  ["are you single", "Are you married/ single? (to a man)", "en", "right"],
  ["umbrela", "umbrella", "en", "typo"],
  ["cat", "dog", "en", "wrong"],
  ["fiance", "fiancé/fiancée", "en", "accent"],
  ["to take her pulse", "to take his/her pulse", "en", "right"],
  ["take his pulse", "to take his/her pulse", "en", "right"],
  ["soft contact lenses", "hard/soft contact lenses", "en", "right"],
  ["step-brother", "step-/half-brother", "en", "right"],
  ["half-brother", "step-/half-brother", "en", "right"],
  ["el dentista/la dentista", "el dentista / la dentista", "es", "right"],
  ["las lentillas blandas", "las lentillas rígidas / blandas", "es", "right"],
  ["Santa Claus", "Father Christmas/ Santa Claus", "en", "right"],
];
for (const [given, expected, lang, verdict] of cases) {
  expect(`grade(${JSON.stringify(given)}, ${JSON.stringify(expected)})`, grade(given, expected, lang), verdict);
}

expect("writable short", writable("el coche"), true);
expect("writable long", writable("¿Puedo preguntarle qué edad tiene?"), false);

// Leitner boxes
const now = 1_000_000;
expect("new right → box 1, 10 min", nextState(null, true, now), { box: 1, dueAt: now + 10 * MINUTE });
expect("box 1 right → box 2, 1 day", nextState({ box: 1, dueAt: now }, true, now), { box: 2, dueAt: now + DAY });
expect("box 4 wrong → box 1", nextState({ box: 4, dueAt: now }, false, now).box, 1);
expect("top stays top", nextState({ box: TOP_BOX, dueAt: now }, true, now).box, TOP_BOX);
expect("mixed, new → choice", askMode(1, "mixed", true), "choice");
expect("mixed, box 3 → written", askMode(3, "mixed", true), "written");
expect("long answers stay choice", askMode(5, "written", false), "choice");
expect("status new", entryStatus(0, 0), "new");
expect("status learning", entryStatus(3, 0), "learning");
expect("status known", entryStatus(5, 4), "known");
expect("status mastered", entryStatus(TOP_BOX, TOP_BOX), "mastered");

// Every entry of a vocabulary file
const file = process.argv[2];
if (file) {
  const vocab = parseVocabFile(JSON.parse(readFileSync(file, "utf8")));
  let entries = 0;
  let written = 0;
  for (const lesson of vocab.lessons) {
    for (const section of lesson.sections) {
      for (const entry of section.entries) {
        entries++;
        if (acceptedForms(entry.es).length === 0 || acceptedForms(entry.en).length === 0) {
          failures++;
          console.error(`✘ nothing to accept: ${section.title.en}: ${entry.en} / ${entry.es}`);
        }
        if (grade(entry.es, entry.es, "es") !== "right") {
          failures++;
          console.error(`✘ own Spanish refused: ${entry.es}`);
        }
        if (grade(entry.en, entry.en, "en") !== "right") {
          failures++;
          console.error(`✘ own English refused: ${entry.en}`);
        }
        if (writable(entry.es)) written++;
      }
    }
  }
  console.log(`${entries} entries checked; ${written} can be asked as written answers`);
}

if (failures > 0) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.log(`vocabulary checks passed (${cases.length} grading cases)`);
