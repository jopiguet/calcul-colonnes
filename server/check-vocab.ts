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
import { buildSession, canWrite, distractors, progressKey, type ProgressMap, type SessionEntry } from "../shared/vocab/session.ts";

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
expect("right ahead of time: unchanged", nextState({ box: 3, dueAt: now + DAY }, true, now), { box: 3, dueAt: now + DAY });
expect("wrong ahead of time: box 1", nextState({ box: 3, dueAt: now + DAY }, false, now).box, 1);
expect("mixed, new → choice", askMode(1, "mixed", true), "choice");
expect("mixed, box 3 → written", askMode(3, "mixed", true), "written");
expect("long answers stay choice", askMode(5, "written", false), "choice");
expect("status new", entryStatus(0, 0), "new");
expect("status learning", entryStatus(3, 0), "learning");
expect("status known", entryStatus(5, 4), "known");
expect("status mastered", entryStatus(TOP_BOX, TOP_BOX), "mastered");

// Sessions: learn, review, due
{
  const at = 10 * DAY;
  const words = ["uno", "dos", "tres", "cuatro", "cinco"];
  const book = { kind: "translation" as const, termLang: "es", meaningLang: "en", alphabetical: false };
  const entries: SessionEntry[] = words.map((term, i) => ({
    id: i + 1, sectionId: 1, position: i, term, meaning: `w${i + 1}`, group: "", feminine: false, note: "", book,
  }));
  const progress: ProgressMap = new Map([
    [progressKey(1, "recognise"), { box: 2, dueAt: at - 1, lastAt: at - DAY }], // due
    [progressKey(2, "recognise"), { box: 1, dueAt: at + 1, lastAt: at - 3 * DAY }], // weak, not due
    [progressKey(3, "recognise"), { box: 4, dueAt: at + DAY, lastAt: at - DAY }], // strong, not due
  ]);
  const ids = (purpose: "learn" | "review" | "due") =>
    buildSession({ entries, pool: entries, progress, now: at, size: 10, preference: "choice", purpose, newOrder: "book", random: () => 0.5 })
      .map((c) => `${c.entryId}${c.direction === "recall" ? "r" : ""}`)
      .sort();
  expect("learn: due, recall ready (1, 3), new", ids("learn"), ["1", "1r", "3r", "4", "5"]);
  expect("review: started cards only", ids("review"), ["1", "2", "3"]);
  expect("due: due only", ids("due"), ["1"]);
  const order = buildSession({ entries, pool: entries, progress, now: at, size: 2, preference: "choice", purpose: "review", newOrder: "book", random: () => 0.5 })
    .map((c) => c.entryId).sort();
  expect("review, 2 cards: the due one, then the weakest", order, [1, 2]);
}

// A definition book: definitions never written; two terms with one meaning are never each other's wrong option.
{
  const book = { kind: "definition" as const, termLang: "en", meaningLang: "en", alphabetical: true };
  const make = (id: number, term: string, meaning: string): SessionEntry => ({
    id, sectionId: 1, position: id, term, meaning, group: "", feminine: false, note: "", book,
  });
  const roots = [make(1, "macro", "large"), make(2, "magn", "large"), make(3, "bene", "good"), make(4, "chron", "time"), make(5, "mono", "one")];
  expect("definition: recognise never written", canWrite(roots[0]!, "recognise"), false);
  expect("definition: recall can be written", canWrite(roots[0]!, "recall"), true);
  for (let i = 0; i < 20; i++) {
    const options = distractors(roots[0]!, "recall", roots, Math.random);
    if (options.includes("magn")) expect("same meaning never a wrong option", options, "without magn");
  }
  expect("recognise options: one 'large' only", distractors(roots[0]!, "recognise", roots, () => 0.3).includes("large"), false);
}

// An alphabetical list: new words at random on request; wrong options from the whole book.
{
  const book = { kind: "definition" as const, termLang: "en", meaningLang: "en", alphabetical: true };
  const list: SessionEntry[] = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1, sectionId: 1 + Math.floor(i / 10), position: i % 10, term: `word${i + 1}`, meaning: `meaning number ${i + 1}`,
    group: "", feminine: false, note: "", book,
  }));
  let seed = 7;
  const random = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const learn = (newOrder: "book" | "random") =>
    buildSession({ entries: list, pool: list, progress: new Map(), now: 0, size: 15, preference: "choice", purpose: "learn", newOrder, random })
      .map((c) => c.entryId).sort((x, y) => x - y);
  expect("book order: the first 8", learn("book"), [1, 2, 3, 4, 5, 6, 7, 8]);
  const drawn = learn("random");
  expect("random order: 8 new words", drawn.length, 8);
  if (drawn.every((id) => id <= 8)) expect("random order: not the first 8", drawn, "spread over the book");
  const fromElsewhere = new Set<string>();
  for (let i = 0; i < 30; i++) for (const o of distractors(list[0]!, "recognise", list, random)) fromElsewhere.add(o);
  const otherSections = [...fromElsewhere].filter((o) => Number(o.split(" ").at(-1)) > 10).length;
  if (otherSections === 0) expect("alphabetical: wrong options from other sections", 0, "some");
}

// Every entry of a vocabulary file
const file = process.argv[2];
if (file) {
  const vocab = parseVocabFile(JSON.parse(readFileSync(file, "utf8")));
  let entries = 0;
  let written = 0;
  const termLang = vocab.book.term === "es" ? "es" : "en";
  const meaningLang = vocab.book.meaning === "es" ? "es" : "en";
  for (const lesson of vocab.lessons) {
    for (const section of lesson.sections) {
      for (const entry of section.entries) {
        entries++;
        if (acceptedForms(entry.term).length === 0 || acceptedForms(entry.meaning).length === 0) {
          failures++;
          console.error(`✘ nothing to accept: ${section.title}: ${entry.term} / ${entry.meaning}`);
        }
        if (grade(entry.term, entry.term, termLang) !== "right") {
          failures++;
          console.error(`✘ own term refused: ${entry.term}`);
        }
        if (grade(entry.meaning, entry.meaning, meaningLang) !== "right") {
          failures++;
          console.error(`✘ own meaning refused: ${entry.meaning}`);
        }
        if (writable(entry.term)) written++;
      }
    }
  }
  console.log(`${vocab.book.id}: ${entries} entries checked; ${written} terms can be asked as written answers`);
}

if (failures > 0) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.log(`vocabulary checks passed (${cases.length} grading cases)`);
