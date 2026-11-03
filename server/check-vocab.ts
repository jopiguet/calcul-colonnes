/**
 * Checks the vocabulary grading and scheduling: `npm run check:vocab`.
 *
 * With a vocabulary file (`npm run check:vocab -- data/vocab.json`), it also
 * checks every entry: its own text is accepted in both directions, and no
 * entry is unaskable.
 */
import { readFileSync } from "node:fs";
import { acceptedForms, answerLangOf, grade, writable, type AnswerLang, type Verdict } from "../shared/vocab/grade.ts";
import { askMode, entryStatus, nextState, DAY, MINUTE, TOP_BOX } from "../shared/vocab/schedule.ts";
import { parseVocabFile, type VocabFile } from "../shared/vocab/format.ts";
import { computeStats } from "../shared/vocab/stats.ts";
import { buildSession, canWrite, distractors, localise, progressKey, type ProgressMap, type SessionEntry } from "../shared/vocab/session.ts";
import { kanaToRomaji } from "../shared/vocab/kana.ts";
import { kanaLessons, kanaSound, kunReading, meaningOf, pickExamples, readingsOf } from "./characters-build.ts";

let failures = 0;
function expect(label: string, actual: unknown, wanted: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    failures++;
    console.error(`✘ ${label}: got ${JSON.stringify(actual)}, wanted ${JSON.stringify(wanted)}`);
  }
}

const cases: [string, string, AnswerLang, Verdict][] = [
  // German answers
  ["der Tag", "der Tag", "de", "right"],
  ["der tag", "der Tag", "de", "right"],
  ["Tag", "der Tag", "de", "article"],
  ["die Tag", "der Tag", "de", "article"],
  ["die Strasse", "die Straße", "de", "right"],
  ["die Muetter", "die Mütter", "de", "right"],
  ["die Mutter", "die Mütter", "de", "accent"],
  ["Strasse", "die Straße", "de", "article"],
  ["das Wochenede", "das Wochenende", "de", "typo"],
  ["täglich", "täglich", "de", "right"],
  ["taeglich", "täglich", "de", "right"],
  ["eine Partnerin", "einen Partner / eine Partnerin", "de", "right"],
  // German printed with its plural or its forms (Lernwortschatz): the word alone is enough
  ["die Ehre", "die Ehre, -n", "de", "right"],
  ["Ehre", "die Ehre, -n", "de", "article"],
  ["der Wunsch", "der Wunsch, ¨e", "de", "right"],
  ["der Gedanke", "der Gedanke, -ns, -n", "de", "right"],
  ["die Täterin", "der Täter, - / die Täterin", "de", "right"],
  ["finden", "finden, findet, fand, hat gefunden", "de", "right"],
  ["finden, findet, fand, hat gefunden", "finden, findet, fand, hat gefunden", "de", "right"],
  ["gelingen", "gelingen, gelingt, gelang, ist gelungen + D", "de", "right"],
  ["diskutieren über", "diskutieren über + A", "de", "right"],
  ["ansehen", "(sich) an|sehen (sieht … an, sah … an, hat angesehen)", "de", "right"],
  ["sich ansehen", "(sich) an|sehen (sieht … an, sah … an, hat angesehen)", "de", "right"],
  ["einen Beruf", "einen Beruf, das Wort, ein Buch ergreifen", "de", "wrong"],
  // French answers: the article is optional, elided or not
  ["patience", "la patience", "fr", "right"],
  ["la patience", "la patience", "fr", "right"],
  ["honneur", "l'honneur", "fr", "right"],
  ["l’honneur", "l'honneur", "fr", "right"],
  ["patiente", "patient / patiente", "fr", "right"],
  ["tranquilite", "le calme / la tranquillité / le repos", "fr", "typo"],
  ["eclat", "l'éclat", "fr", "accent"],
  ["courage", "la patience", "fr", "wrong"],
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
  // A short first answer stands on its own when the longer one is another phrase (das Werden).
  ["becoming", "becoming / process of coming-to-be", "en", "right"],
  // A variant of several words on the short side: "el jugador / la jugadora de baloncesto".
  ["el jugador de baloncesto", "el jugador / la jugadora de baloncesto", "es", "right"],
  ["la jugadora de baloncesto", "el jugador / la jugadora de baloncesto", "es", "right"],
  ["el jugador", "el jugador / la jugadora de baloncesto", "es", "wrong"],
  ["la jugadora de baloncesto", "la jugadora de baloncesto / el jugador", "es", "right"],
  ["el jugador de baloncesto", "la jugadora de baloncesto / el jugador", "es", "right"],
  ["el profesor de inglés", "el profesor / la profesora de inglés", "es", "right"],
  ["to go", "to go up / to go", "en", "right"],
  ["der Büroangestellte", "der / die Büroangestellte", "de", "right"],
  ["die Büroangestellte", "der / die Büroangestellte", "de", "right"],
  ["buenas noches", "buenas tardes / noches", "es", "right"],
  ["este es mi", "este / esta es mi", "es", "right"],
  // English contractions, either way round.
  ["I am tired", "I'm tired", "en", "right"],
  ["I'm tired", "I am tired", "en", "right"],
  ["I’m tired", "I am tired", "en", "right"],
  ["do not worry", "don't worry", "en", "right"],
  ["won't", "will not", "en", "right"],
  ["cannot", "can't", "en", "right"],
  ["can not", "can't", "en", "right"],
  ["it is late", "it's late", "en", "right"],
  ["they're here", "they are here", "en", "right"],
  ["we've gone", "we have gone", "en", "right"],
  ["she'll come", "she will come", "en", "right"],
  ["I'd like", "I would like", "en", "right"],
  ["let us go", "let's go", "en", "right"],
  ["John is car", "John's car", "en", "wrong"],
  ["I am", "I'm not", "en", "wrong"],
  ["process of coming-to-be", "becoming / process of coming-to-be", "en", "right"],
  ["este es mi", "este / esta es mi", "es", "right"],
  ["este", "este / esta es mi", "es", "wrong"],
  // A semicolon between two meanings: either one.
  ["lord", "lord; ruler", "en", "right"],
  ["ruler", "lord; ruler", "en", "right"],
  ["walk", "to go; to walk", "en", "right"],
  ["lord ruler", "lord; ruler", "en", "right"],
  ["king", "lord; ruler", "en", "wrong"],
  // Portuguese: articles as in Spanish, accents as accents.
  ["a cidade", "a cidade", "pt", "right"],
  ["o cidade", "a cidade", "pt", "article"],
  ["coracao", "o coração", "pt", "article"],
  ["o coracao", "o coração", "pt", "accent"],
  // Swahili: plain text.
  ["kitabu", "kitabu", "sw", "right"],
  ["kitbu", "kitabu", "sw", "typo"],
];
for (const [given, expected, lang, verdict] of cases) {
  expect(`grade(${JSON.stringify(given)}, ${JSON.stringify(expected)})`, grade(given, expected, lang), verdict);
}

// Japanese answers: the term in Japanese script, its rōmaji, or kana for its sound.
const japanese: [string, string, string, Verdict][] = [
  ["ガチョウ", "ガチョウ", "gachō", "right"],
  ["gachō", "ガチョウ", "gachō", "right"],
  ["gacho", "ガチョウ", "gachō", "right"],
  ["gachou", "ガチョウ", "gachō", "right"],
  ["Gachoo", "ガチョウ", "gachō", "right"],
  ["neko", "猫", "neko", "right"],
  ["ねこ", "猫", "neko", "right"],
  ["ネコ", "猫", "neko", "right"],
  ["がっこう", "学校", "gakkō", "right"],
  ["きょう", "今日", "kyō", "right"],
  ["コーヒー", "コーヒー", "kōhī", "right"],
  ["しんぶん", "新聞", "shimbun", "right"],
  ["CD", "CD（シーディー）", "shīdī", "right"],
  ["ＣＤ", "CD（シーディー）", "shīdī", "right"],
  ["こんにちは！", "こんにちは！", "konnichiwa", "right"],
  ["konnichiwa", "こんにちは！", "konnichiwa", "right"],
  ["konichiwa", "こんにちは！", "konnichiwa", "typo"],
  ["inu", "猫", "neko", "wrong"],
  ["いぬ", "猫", "neko", "wrong"],
  ["", "猫", "neko", "wrong"],
  ["neko", "猫", "", "wrong"],
];
for (const [given, expected, reading, verdict] of japanese) {
  expect(`grade(${JSON.stringify(given)}, ${JSON.stringify(expected)}, ja)`, grade(given, expected, "ja", reading), verdict);
}

// Arabic: script with or without vowel marks, or the book's transliteration.
const arabic: [string, string, string, Verdict][] = [
  ["الأسبوع", "الأُسبوع", "al usbou’", "right"],
  ["الأُسبوع", "الأُسبوع", "al usbou’", "right"],
  ["الاسبوع", "الأُسبوع", "al usbou’", "accent"],
  ["أسبوع", "الأُسبوع", "al usbou’", "typo"],
  ["al usbou’", "الأُسبوع", "al usbou’", "right"],
  ["al-usbu", "الأُسبوع", "al usbou’", "right"],
  ["Alusbou", "الأُسبوع", "al usbou’", "right"],
  ["usbou", "الأُسبوع", "al usbou’", "typo"],
  ["daqiqa", "دقيقة", "daqeeqa", "right"],
  ["دقيقه", "دقيقة", "daqeeqa", "accent"],
  ["المُهندسة", "المُهَندس/المهندسة", "al muhandes/ almuhandesa", "right"],
  ["al muhandesa", "المُهَندس/المهندسة", "al muhandes/ almuhandesa", "right"],
  ["متى؟", "متى...؟", "mata...?", "right"],
  ["الشهر", "الأُسبوع", "al usbou’", "wrong"],
  ["shahr", "الأُسبوع", "al usbou’", "wrong"],
  ["", "الأُسبوع", "al usbou’", "wrong"],
];
for (const [given, expected, reading, verdict] of arabic) {
  expect(`grade(${JSON.stringify(given)}, ${JSON.stringify(expected)}, ar)`, grade(given, expected, "ar", reading), verdict);
}

// Chinese, cuneiform, hieroglyphs: the script, or the reading by its letters.
const scripts: [string, string, string, AnswerLang, Verdict][] = [
  ["人", "人", "rén", "zh", "right"],
  ["ren", "人", "rén", "zh", "right"],
  ["ren2", "人", "rén", "zh", "right"],
  ["ni hao", "你好", "nǐ hǎo", "zh", "right"],
  ["大", "人", "rén", "zh", "wrong"],
  ["da", "人", "rén", "zh", "wrong"],
  ["𒊕", "𒊕", "sag", "sux", "right"],
  ["sag", "𒊕", "sag", "sux", "right"],
  ["SAĜ", "𒊕", "saĝ", "sux", "right"],
  ["du", "𒊕", "sag", "sux", "wrong"],
  ["ꜥnḫ", "𓋹", "ꜥnḫ", "egy", "right"],
  ["'nh", "𓋹", "ꜥnḫ", "egy", "right"],
  ["anh", "𓋹", "ꜥnḫ", "egy", "right"],
  ["nfr", "𓋹", "ꜥnḫ", "egy", "wrong"],
  ["ra", "𓇳", "rꜥ", "egy", "right"],
  ["𓋹", "𓋹", "ꜥnḫ", "egy", "right"],
  ["sag", "𒊕", "", "sux", "wrong"],
];
for (const [given, expected, reading, lang, verdict] of scripts) {
  expect(`grade(${JSON.stringify(given)}, ${JSON.stringify(expected)}, ${lang})`, grade(given, expected, lang, reading), verdict);
}

expect("writable short", writable("el coche"), true);
expect("writable long", writable("¿Puedo preguntarle qué edad tiene?"), false);
expect("writable: a German verb by its infinitive", [writable("finden, findet, fand, hat gefunden", "de"), writable("finden, findet, fand, hat gefunden")], [true, false]);

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
    id: i + 1, sectionId: 1, position: i, term, meaning: `w${i + 1}`, group: "", feminine: false, note: "", reading: "", readings: "", translations: {}, book,
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

// Learning from a whole book: new entries always come, in the book's order, whatever the section ids.
{
  const at = 10 * DAY;
  const book = { kind: "characters" as const, termLang: "ja", meaningLang: "en", alphabetical: false };
  // In the book's order, as the database returns them; the section ids of an updated book are not.
  const list: SessionEntry[] = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1, sectionId: i < 20 ? 50 - Math.floor(i / 5) : 1 + Math.floor(i / 5), position: i % 5, term: `字${i + 1}`, meaning: `m${i + 1}`,
    group: "", feminine: false, note: "", reading: "", readings: "", translations: {}, book,
  }));
  const learn = (progress: ProgressMap, met?: Set<number>) =>
    buildSession({ entries: list, pool: list, progress, now: at, size: 15, preference: "choice", purpose: "learn", newOrder: "book", met, random: () => 0.5 });
  const newIds = (cards: ReturnType<typeof learn>) => cards.filter((c) => c.box === 0 && c.direction === "recognise").map((c) => c.entryId).sort((x, y) => x - y);
  expect("book order: the book's first 8, not the lowest section ids", newIds(learn(new Map())), [1, 2, 3, 4, 5, 6, 7, 8]);
  // Twenty entries due: the session still brings 8 new ones, and 7 reviews.
  const busy: ProgressMap = new Map(Array.from({ length: 20 }, (_, i) => [progressKey(i + 21, "recognise"), { box: 2, dueAt: at - 1, lastAt: at - DAY }] as const));
  const cards = learn(busy);
  expect("learn with 20 due: 8 new", newIds(cards), [1, 2, 3, 4, 5, 6, 7, 8]);
  expect("learn with 20 due: 15 cards", cards.length, 15);
  // Characters met in the words: half the new ones at most; the book goes on with the rest.
  expect("met: 4 of them, then the book", newIds(learn(new Map(), new Set([31, 32, 33, 34, 35, 36]))), [1, 2, 3, 4, 31, 32, 33, 34]);
}

// A definition book: definitions never written; two terms with one meaning are never each other's wrong option.
{
  const book = { kind: "definition" as const, termLang: "en", meaningLang: "en", alphabetical: true };
  const make = (id: number, term: string, meaning: string): SessionEntry => ({
    id, sectionId: 1, position: id, term, meaning, group: "", feminine: false, note: "", reading: "", readings: "", translations: {}, book,
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
    group: "", feminine: false, note: "", reading: "", readings: "", translations: {}, book,
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

// A Japanese book: the rōmaji goes with the prompt, and with each option of a recall card.
{
  const book = { kind: "translation" as const, termLang: "ja", meaningLang: "en", alphabetical: false };
  const words: [string, string, string][] = [["猫", "cat", "neko"], ["犬", "dog", "inu"], ["鳥", "bird", "tori"], ["魚", "fish", "sakana"]];
  const list: SessionEntry[] = words.map(([term, meaning, reading], i) => ({
    id: i + 1, sectionId: 1, position: i, term, meaning, group: "", feminine: false, note: "", reading, readings: "", translations: {}, book,
  }));
  const progress: ProgressMap = new Map(list.map((e) => [progressKey(e.id, "recognise"), { box: 2, dueAt: 1e12, lastAt: 0 }]));
  const cards = buildSession({ entries: list, pool: list, progress, now: 0, size: 10, preference: "choice", purpose: "learn", newOrder: "book", random: Math.random });
  const recall = cards.find((c) => c.direction === "recall")!;
  const readingOf = new Map(words.map(([term, , reading]) => [term, reading]));
  expect("ja recall: options with their rōmaji", recall.optionReadings, recall.options!.map((o) => readingOf.get(o)));
  expect("ja recall: no reading on the English prompt", recall.promptReading, undefined);
  const first = buildSession({ entries: list, pool: list, progress: new Map(), now: 0, size: 1, preference: "choice", purpose: "learn", newOrder: "book", random: () => 0 })[0]!;
  expect("ja recognise: rōmaji with the prompt", first.promptReading, readingOf.get(first.prompt));
}

// Statistics: local days, streaks, forecast, hardest words.
{
  const offsetMinutes = 120; // Madrid in summer
  const local = (day: number, hour: number): number => day * DAY + hour * 3_600_000 - offsetMinutes * 60_000;
  const today = 20_000;
  const now = local(today, 10);
  const entries = [1, 2, 3].map((id) => ({ id, lessonId: id === 3 ? 2 : 1, term: `t${id}`, meaning: `m${id}`, reading: "" }));
  const answer = (entryId: number, at: number, correct: boolean, mode: "choice" | "written" = "choice", verdict = correct ? "right" : "wrong") =>
    ({ entryId, direction: "recognise" as const, mode, at, verdict, correct });
  const stats = computeStats({
    entries,
    lessons: [{ id: 1, title: "One" }, { id: 2, title: "Two" }],
    progress: new Map([
      [1, { recognise: { box: 2, dueAt: now - DAY, wrong: 0 }, recall: { box: 1, dueAt: local(today + 3, 9), wrong: 0 } }],
      [2, { recognise: { box: 1, dueAt: local(today, 23), wrong: 2 } }],
    ]),
    answers: [
      answer(1, local(today - 3, 20), true),
      answer(2, local(today - 2, 23.5), false), // 23:30 local: still that day, though the next day in UTC+0
      answer(2, local(today - 1, 8), false, "written", "wrong"),
      answer(1, local(today - 1, 9), true, "written", "accent"),
      answer(2, local(today, 0.25), true),
    ],
    now,
    offsetMinutes,
  });
  expect("stats: words", stats.words, { total: 3, new: 1, learning: 2, known: 0, mastered: 0 });
  expect("stats: boxes", [stats.boxes.recognise[1], stats.boxes.recognise[2], stats.boxes.recall[1]], [1, 1, 1]);
  expect("stats: forecast today (overdue included), in 3 days", [stats.forecast[0], stats.forecast[3]], [2, 1]);
  expect("stats: last days", stats.days.slice(-4).map((d) => [d.answers, d.right, d.newWords]), [[1, 1, 1], [1, 0, 1], [2, 1, 0], [1, 1, 0]]);
  expect("stats: today is the last day", stats.days.at(-1)!.day, new Date(today * DAY).toISOString().slice(0, 10));
  expect("stats: streak", stats.streak, { current: 4, best: 4 });
  expect("stats: by mode", stats.byMode, { choice: { answers: 3, right: 2 }, written: { answers: 2, right: 1 } });
  expect("stats: written verdicts", stats.verdicts, { right: 0, accent: 1, typo: 0, article: 0, wrong: 1 });
  expect("stats: hardest", stats.hardest.map((h) => [h.term, h.wrong, h.answers]), [["t2", 2, 3]]);
  expect("stats: lessons", stats.lessons.map((l) => [l.title, l.total, l.new]), [["One", 2, 0], ["Two", 1, 1]]);
  const later = computeStats({ entries, lessons: [], progress: new Map(), answers: [answer(1, local(today - 2, 12), true)], now, offsetMinutes });
  expect("stats: a missed day ends the streak", later.streak, { current: 0, best: 1 });
}

// The Characters book: kana sounds, kanji readings, a third direction.
{
  expect("kana sounds", ["か", "きゃ", "しゅ", "ちょ", "じゃ", "を", "ティ", "ファ", "ヴ"].map(kanaSound), [
    "ka", "kya", "shu", "cho", "ja", "wo / o", "ti", "fa", "vu",
  ]);
  const kana = kanaLessons().flatMap((l) => l.sections.flatMap((s) => s.entries));
  expect("kana: hiragana and katakana, each once", [kana.length, new Set(kana.map((e) => e.term)).size], [223, 223]);
  expect("kun reading: okurigana in brackets, no dash", ["たか.い", "-び", "ひと-", "ひ"].map(kunReading), ["たか(い)", "び", "ひと", "ひ"]);
  expect("readings: on, then kun, a voiced suffix dropped", readingsOf({ on: ["ニチ", "ジツ"], kun: ["ひ", "-び", "-か"] }), "ニチ / ジツ / ひ / か");
  expect("readings: one stem once", readingsOf({ on: ["セイ"], kun: ["い.きる", "い.かす", "う.まれる"] }), "セイ / い(きる) / う(まれる)");
  expect("meanings: three, no radical number", meaningOf(["one", "one radical (no.1)"]), "one");
  const readings = "コウ / たか(い) / たか";
  for (const [given, wanted] of [["こう", "right"], ["コウ", "right"], ["kou", "right"], ["kō", "right"], ["たかい", "right"], ["takai", "right"], ["たか", "right"], ["yasui", "wrong"]] as const) {
    expect(`read ${given}`, grade(given, readings, "ja", kanaToRomaji(readings)), wanted);
  }
  const words = [
    { written: "一人", kana: "ひとり", gloss: "one person", rank: 1 },
    { written: "二人", kana: "ふたり", gloss: "two persons", rank: 2 },
    { written: "人", kana: "ひと", gloss: "person", rank: 3 },
    { written: "大人", kana: "おとな", gloss: "adult", rank: 1 }, // 大 is not in the book
  ];
  const examples = pickExamples(["一", "二", "人"], words);
  expect("examples: a word with its last kanji, unknown kanji left out", [...examples].map(([k, w]) => [k, w.map((x) => x.written)]), [
    ["一", []], ["二", []], ["人", ["一人", "二人", "人"]],
  ]);

  const book = { kind: "characters" as const, termLang: "ja", meaningLang: "en", alphabetical: false };
  const kanji = (id: number, term: string, meaning: string, read: string, fr: string): SessionEntry => ({
    id, sectionId: 2, position: id, term, meaning, group: "", feminine: false, note: "", reading: "", readings: read, translations: { fr }, book,
  });
  const kanaEntry = (id: number, term: string, sound: string): SessionEntry => ({
    id, sectionId: 1, position: id, term, meaning: sound, group: "", feminine: false, note: "", reading: "", readings: "", translations: {}, book,
  });
  const list = [
    kanaEntry(1, "あ", "a"), kanaEntry(2, "い", "i"), kanaEntry(3, "う", "u"), kanaEntry(4, "え", "e"),
    kanji(11, "一", "one", "イチ / ひと", "un"), kanji(12, "二", "two", "ニ / ふた", "deux"),
    kanji(13, "三", "three", "サン / み", "trois"), kanji(14, "日", "day / sun", "ニチ / ひ", "jour / soleil"),
  ];
  expect("characters: a kanji's meaning in French", [localise(list[4]!, "fr").meaning, localise(list[4]!, "fr").book.meaningLang], ["un", "fr"]);
  expect("characters: English as it is", localise(list[4]!, "en").meaning, "one");
  expect("characters: a character to produce is chosen, a reading written", [canWrite(list[4]!, "recall"), canWrite(list[4]!, "read"), canWrite(list[0]!, "recognise")], [false, true, true]);
  const progress: ProgressMap = new Map([[progressKey(11, "recognise"), { box: 2, dueAt: 1e12, lastAt: 0 }]]);
  // More new characters than a session takes: the met ones must be among those taken.
  const more = Array.from({ length: 10 }, (_, i) => kanaEntry(21 + i, "かきくけこさしすせそ"[i]!, `k${i}`));
  const cards = buildSession({ entries: [...list.slice(0, 4), ...more, ...list.slice(4)], pool: list, progress, now: 0, size: 20, preference: "written", purpose: "learn", newOrder: "book", met: new Set([14, 3]), random: Math.random });
  const ready = cards.filter((c) => c.entryId === 11).map((c) => [c.direction, c.mode]).sort();
  expect("characters: recall and reading together, recall by choice", ready, [["read", "written"], ["recall", "choice"]]);
  const fresh = cards.filter((c) => c.box === 0 && c.direction === "recognise").map((c) => c.entryId);
  expect("characters: met first among the new", [fresh.length, fresh.includes(3), fresh.includes(14)], [8, true, true]);
  expect("characters: kanji and kana cards", [cards.find((c) => c.entryId === 14)?.script, cards.find((c) => c.entryId === 1)?.script, cards.find((c) => c.entryId === 14)?.met], ["kanji", "kana", true]);
  const kanjiOptions = distractors(list[6]!, "read", list, Math.random);
  expect("characters: readings offered are kanji readings", kanjiOptions.length === 3 && kanjiOptions.every((o) => /[ァ-ン]/.test(o)), true);
  const kanaOptions = distractors(list[0]!, "recall", list, Math.random);
  expect("characters: kana offered for a kana", kanaOptions.every((o) => /^[ぁ-ん]$/.test(o)), true);
  expect("status: a kanji counts its reading", [entryStatus(6, 6, 2), entryStatus(6, 6, null), entryStatus(0, 0, 0)], ["learning", "mastered", "new"]);
}

// Imports that would overwrite another book are refused (a temporary SQLite database).
{
  const { mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const dir = mkdtempSync(join(tmpdir(), "luma-check-"));
  const { openDatabase } = await import("./db/index.ts");
  const db = await openDatabase({ databaseUrl: "", sqlitePath: join(dir, "check.sqlite") }).catch(() => null);
  if (!db) console.log("import guard: skipped (SQLite not installed)");
  else {
    try {
      const { migrate } = await import("./db/migrate.ts");
      const { ImportRefused, VocabStore } = await import("./vocab.ts");
      await migrate(db);
      const store = new VocabStore(db);
      const book = (id: string, term: string, words: [string, string][]): VocabFile => ({
        book: { id, title: "t", kind: "translation", term, meaning: "en" },
        lessons: [{ title: "L", subtitle: "", sections: [{ title: "S", subtitle: "", entries: words.map(([t, m]) => ({ term: t, meaning: m })) }] }],
      });
      const spanish: [string, string][] = [["el día", "day"], ["la calle", "street"], ["la cocina", "kitchen"], ["la semana", "week"], ["el mes", "month"]];
      await store.import(book("collins-spanish", "es", spanish));
      await db.query("INSERT INTO users (name, name_key, created_at) VALUES ('p', 'p', 0)");
      const user = Number((await db.query("SELECT id FROM users"))[0]!.id);
      const entry = Number((await db.query("SELECT id FROM vocab_entries WHERE term = 'la calle'"))[0]!.id);
      await db.query("INSERT INTO vocab_progress (user_id, entry_id, direction, box, due_at, last_at) VALUES ($1, $2, 'recognise', 3, 0, 0)", [user, entry]);
      const german = book("collins-spanish", "de", [["der Tag", "day"], ["die Straße", "street"]]);
      const refused = async (file: VocabFile): Promise<boolean> =>
        store.import(file).then(() => false, (e: unknown) => e instanceof ImportRefused);
      expect("import: another language under the same id is refused", await refused(german), true);
      expect("import: most entries gone, with progress, is refused", await refused(book("collins-spanish", "es", [["el día", "day"]])), true);
      expect("import: refused means unchanged", (await db.query("SELECT COUNT(*) AS n FROM vocab_progress"))[0]!.n, 1);
      expect("import: one entry corrected is fine", await refused(book("collins-spanish", "es", [...spanish.slice(0, 4), ["el mes", "month (of the year)"]])), false);
      expect("import: a new book is fine", await refused(book("collins-german", "de", [["der Tag", "day"]])), false);
      await store.import(german, { replace: true });
      expect("import: --replace replaces", (await db.query("SELECT term_lang FROM vocab_books WHERE slug = 'collins-spanish'"))[0]!.term_lang, "de");

      // A book updated with a new section in its first lesson: in the book's order, that section comes before the second lesson.
      const kana = (id: string, sections: string[][][]): VocabFile => ({
        book: { id, title: "k", kind: "translation", term: "es", meaning: "en" },
        lessons: sections.map((secs, l) => ({ title: `L${l}`, subtitle: "", sections: secs.map((words, s) => ({ title: `S${l}${s}`, subtitle: "", entries: words.map((w) => ({ term: w, meaning: `${w} m` })) })) })),
      });
      await store.import(kana("ordered", [[["uno", "dos"]], [["tres", "cuatro"]]]));
      await store.import(kana("ordered", [[["uno", "dos"], ["cinco", "seis"]], [["tres", "cuatro"]]]));
      const bookId = Number((await db.query("SELECT id FROM vocab_books WHERE slug = 'ordered'"))[0]!.id);
      const cards = await store.session(user, { kind: "all", id: bookId }, "learn", 4, "choice", 1, "book");
      expect("book order after an update: the new section in its place", cards.map((c) => c.prompt).sort(), ["cinco", "dos", "seis", "uno"]);

      // A list that evolves (a file added, lines corrected): progress and skips stay with the words.
      const evolving = (sections: [string, string][][]): VocabFile => ({
        book: { id: "evolving", title: "e", kind: "translation", term: "de", meaning: "fr" },
        lessons: [{ title: "1", subtitle: "", sections: sections.map((words, i) => ({ title: `1.${i}`, subtitle: "", entries: words.map(([t, m]) => ({ term: t, meaning: m })) })) }],
      });
      await store.import(evolving([[["die Ruhe", "le calme"], ["ruhig", "calme"]], [["der Mut", "le courage"], ["mutig", "courageux"]]]));
      const idOf = async (term: string): Promise<number> => Number((await db.query("SELECT id FROM vocab_entries WHERE term = $1", [term]))[0]?.id ?? 0);
      const courage = await idOf("der Mut");
      const brave = await idOf("mutig");
      const calm = await idOf("ruhig");
      await db.query("INSERT INTO vocab_progress (user_id, entry_id, direction, box, due_at, last_at) VALUES ($1, $2, 'recognise', 4, 0, 0)", [user, courage]);
      await store.setSkipped(user, calm, true, 0);
      // A section inserted before, a meaning corrected, a term corrected in its section.
      const report = await store.import(evolving([
        [["die Ruhe", "le calme / la tranquillité"], ["ruhig", "calme"]],
        [["die Geduld", "la patience"]],
        [["der Mut", "le courage"], ["muthig", "courageux"]],
      ]));
      expect("evolving list: report", [report.added, report.removed, report.changed], [1, 0, 2]);
      expect("evolving list: a word in a moved section keeps its id and progress", [await idOf("der Mut"), Number((await db.query("SELECT box FROM vocab_progress WHERE entry_id = $1", [courage]))[0]?.box)], [courage, 4]);
      expect("evolving list: a corrected term keeps its id", await idOf("muthig"), brave);
      expect("evolving list: a skip stays", Number((await db.query("SELECT COUNT(*) AS n FROM vocab_skips WHERE entry_id = $1", [calm]))[0]?.n), 1);
      expect("evolving list: sections in the file's order", (await db.query("SELECT s.title FROM vocab_sections s JOIN vocab_lessons l ON l.id = s.lesson_id JOIN vocab_books b ON b.id = l.book_id WHERE b.slug = 'evolving' ORDER BY s.position")).map((r) => r.title), ["1.0", "1.1", "1.2"]);
      // A section dropped: its words go, the others stay.
      const shrunk = await store.import(evolving([[["die Ruhe", "le calme / la tranquillité"], ["ruhig", "calme"]], [["der Mut", "le courage"], ["muthig", "courageux"]]]), { replace: true });
      expect("evolving list: a section removed", [shrunk.removed, await idOf("der Mut"), await idOf("die Geduld")], [1, courage, 0]);

      // Picture dictionary: pictures read beside the file, stored once by their hash, shown to who may see the book.
      {
        const { writeFileSync, mkdirSync } = await import("node:fs");
        const { readImages, imageType } = await import("./vocab-import.ts");
        const { deflateSync } = await import("node:zlib");
        const crc = (bytes: Buffer): number => {
          let c = ~0;
          for (const byte of bytes) {
            c ^= byte;
            for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
          }
          return ~c >>> 0;
        };
        const chunk = (type: string, data: Buffer): Buffer => {
          const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
          const out = Buffer.alloc(body.length + 8);
          out.writeUInt32BE(data.length, 0);
          body.copy(out, 4);
          out.writeUInt32BE(crc(body), body.length + 4);
          return out;
        };
        // A 4×4 PNG of one colour: invented pictures.
        const png = (r: number, g: number, b: number): Buffer => {
          const header = Buffer.alloc(13);
          header.writeUInt32BE(4, 0);
          header.writeUInt32BE(4, 4);
          header.set([8, 2, 0, 0, 0], 8);
          const row = Buffer.from([0, ...Array.from({ length: 4 }, () => [r, g, b]).flat()]);
          return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", header), chunk("IDAT", deflateSync(Buffer.concat([row, row, row, row]))), chunk("IEND", Buffer.alloc(0))]);
        };
        const folder = join(dir, "pictures");
        mkdirSync(join(folder, "images"), { recursive: true });
        writeFileSync(join(folder, "images", "scene.png"), png(200, 30, 30));
        writeFileSync(join(folder, "images", "scene-copy.png"), png(200, 30, 30));
        writeFileSync(join(folder, "images", "own.png"), png(30, 30, 200));
        writeFileSync(join(folder, "images", "fake.png"), "not a picture");
        writeFileSync(join(dir, "outside.png"), png(1, 2, 3));
        expect("pictures: types by their bytes", [imageType(png(1, 1, 1)), imageType(Buffer.from("GIF89a")), imageType(Buffer.from("not"))], ["image/png", "image/gif", null]);
        const pictured = (entries: VocabFile["lessons"][0]["sections"][0]["entries"]): VocabFile => ({
          book: { id: "pictures", title: "p", kind: "translation", term: "de", meaning: "en" },
          lessons: [{ title: "L", subtitle: "", sections: [{ title: "S", subtitle: "", entries }] }],
        });
        const scene = [
          { term: "der Rotor", meaning: "rotor", image: "images/scene.png", part: 1 },
          { term: "das Cockpit", meaning: "cockpit", image: "images/scene-copy.png", part: 2 },
          { term: "der Hubschrauber", meaning: "helicopter", image: "images/scene.png" },
          { term: "der Schirm", meaning: "umbrella", image: "images/own.png" },
          { term: "blau", meaning: "blue" },
        ];
        const file = pictured(scene.map((e) => ({ ...e })));
        const images = readImages(file, join(folder, "vocab.json"));
        expect("pictures: the same bytes twice are one picture", images.length, 2);
        const first = await store.import(file, { images });
        expect("pictures: stored", [first.images, Number((await db.query("SELECT COUNT(*) AS n FROM vocab_images"))[0]!.n)], [2, 2]);
        const again = pictured(scene.map((e) => ({ ...e })));
        expect("pictures: a re-import stores none again", (await store.import(again, { images: readImages(again, join(folder, "vocab.json")) })).images, 0);
        const refusedPicture = (image: string): string => {
          try {
            readImages(pictured([{ term: "x", meaning: "y", image }]), join(folder, "vocab.json"));
            return "read";
          } catch (error) {
            return String((error as Error).message).replace(/^picture \S+: /, "");
          }
        };
        expect("pictures: not a picture, missing, outside", [refusedPicture("images/fake.png"), refusedPicture("images/none.png"), refusedPicture("../outside.png")],
          ["not a PNG, JPEG, WebP or GIF", `not found beside ${join(folder, "vocab.json")}`, "outside the file's folder"]);
        const { parseVocabFile } = await import("../shared/vocab/format.ts");
        const parsed = (image: unknown, part?: unknown): string => {
          try {
            parseVocabFile({ format: 2, book: { id: "p", title: "p", kind: "translation", term: "de", meaning: "en" }, lessons: [{ title: "L", sections: [{ title: "S", entries: [{ term: "a", meaning: "b", image, part }] }] }] });
            return "ok";
          } catch {
            return "refused";
          }
        };
        expect("pictures: paths and parts in the file", [parsed("images/a.png"), parsed("../a.png"), parsed("/etc/a.png"), parsed("a.svg"), parsed("a.png", 0), parsed("a.png", 2.5), parsed("a.png", 3)],
          ["ok", "refused", "refused", "refused", "refused", "refused", "ok"]);

        const pictureBook = Number((await db.query("SELECT id FROM vocab_books WHERE slug = 'pictures'"))[0]!.id);
        const hashOf = async (term: string): Promise<string> => String((await db.query("SELECT image FROM vocab_entries WHERE term = $1", [term]))[0]!.image);
        const sceneHash = await hashOf("der Rotor");
        expect("pictures: a copy of a picture is the same picture", await hashOf("das Cockpit"), sceneHash);
        expect("pictures: the owner sees them, another account not in a private book", [Boolean(await store.image(sceneHash, true)), Boolean(await store.image(sceneHash, false))], [true, false]);
        await store.setVisibility(pictureBook, "shared");
        expect("pictures: a shared book's, every account", (await store.image(sceneHash, false))?.mime, "image/png");
        expect("pictures: the book counts them", (await store.books()).find((b) => b.slug === "pictures")?.pictures, 4);
        // Recall cards: the picture alone says the word for a numbered part or a picture of its own, not for a scene.
        for (const row of await db.query(`SELECT e.id FROM vocab_entries e JOIN vocab_sections s ON s.id = e.section_id JOIN vocab_lessons l ON l.id = s.lesson_id WHERE l.book_id = $1`, [pictureBook])) {
          await db.query("INSERT INTO vocab_progress (user_id, entry_id, direction, box, due_at, last_at) VALUES ($1, $2, 'recognise', 3, 9e12, 0)", [user, Number(row.id)]);
        }
        const deck = await store.session(user, { kind: "all", id: pictureBook }, "learn", 20, "choice", 1, "book");
        const recall = Object.fromEntries(deck.filter((c) => c.direction === "recall").map((c) => [c.prompt, [Boolean(c.image), c.part ?? 0, c.pictureAlone === true]]));
        expect("pictures: recall cards", Object.entries(recall).sort(), Object.entries({ blue: [false, 0, false], cockpit: [true, 2, true], helicopter: [true, 0, false], rotor: [true, 1, true], umbrella: [true, 0, true] }));
        // The scene's words removed: its picture goes with them.
        await store.import(pictured([{ term: "der Schirm", meaning: "umbrella", image: await hashOf("der Schirm") }, { term: "blau", meaning: "blue" }]), { replace: true, images: [] });
        expect("pictures: one no entry shows is removed", [Boolean(await store.image(sceneHash, true)), Number((await db.query("SELECT COUNT(*) AS n FROM vocab_images"))[0]!.n)], [false, 1]);
      }

      // Format 3: a sign's type, readings by language and functions; every reading an answer.
      {
        const { parseVocabFile } = await import("../shared/vocab/format.ts");
        const signs = (format: number, entry: Record<string, unknown>): unknown => ({
          format,
          book: { id: "signs", title: "s", kind: "translation", term: "sux", meaning: "en" },
          lessons: [{ title: "L", sections: [{ title: "S", entries: [{ term: "𒀭", meaning: "heaven; sky; god", ...entry }] }] }],
        });
        const sky = {
          reading: "an",
          type: "sign",
          readings: [{ value: "an", language: "sumerian" }, { value: "diĝir", language: "sumerian" }, { value: "ilum", language: "akk", note: "as a word" }],
          functions: ["lexical", "determinative"],
          note: "Also a silent divine determinative.",
        };
        const parsedOf = (format: number, entry: Record<string, unknown>): string => {
          try {
            return JSON.stringify(parseVocabFile(signs(format, entry)).lessons[0]!.sections[0]!.entries[0]);
          } catch (error) {
            return String((error as Error).message).replace(/^.*?: /, "");
          }
        };
        const parsed = parseVocabFile(signs(3, sky)).lessons[0]!.sections[0]!.entries[0]!;
        expect("format 3: the readings complete the one shown", parsed.reading, "an; diĝir; ilum");
        expect("format 3: info", parsed.info, {
          type: "sign",
          readings: [{ value: "an", language: "sumerian" }, { value: "diĝir", language: "sumerian" }, { value: "ilum", language: "akk", note: "as a word" }],
          functions: ["lexical", "determinative"],
        });
        expect("format 3: no reading, the list's", parseVocabFile(signs(3, { readings: ["ki", { value: "ĝeš" }] })).lessons[0]!.sections[0]!.entries[0]!.reading, "ki; ĝeš");
        expect("format 3: a kanji's readings stay a text", parseVocabFile(signs(3, { readings: "ニチ / ジツ" })).lessons[0]!.sections[0]!.entries[0]!.readings, "ニチ / ジツ");
        expect("format 3: refused fields", [
          parsedOf(2, { type: "sign" }),
          parsedOf(2, { readings: [{ value: "an" }] }),
          parsedOf(3, { readings: [{ value: "an; diĝir" }] }),
          parsedOf(3, { readings: [{ language: "sux" }] }),
          parsedOf(3, { functions: "determinative" }),
          parsedOf(3, { type: "<b>sign</b>" }),
        ].map((m) => /format": 3|one reading per value|"value" is required|list of at most|short label/.test(m)), [true, true, true, true, true, true]);
        // Latin: a noun's gender and genitive, a verb's principal parts, other forms; a field nobody knows refused.
        const latinOf = (format: number, entry: Record<string, unknown>): unknown => ({
          format,
          book: { id: "latin", title: "l", kind: "translation", term: "la", meaning: "en" },
          lessons: [{ title: "L", sections: [{ title: "S", entries: [{ term: "rosa", meaning: "rose", ...entry }] }] }],
        });
        const latinEntry = (format: number, entry: Record<string, unknown>): string => {
          try {
            return JSON.stringify(parseVocabFile(latinOf(format, entry)).lessons[0]!.sections[0]!.entries[0]!.info);
          } catch (error) {
            return String((error as Error).message).replace(/^.*?: /, "");
          }
        };
        expect("format 3: a noun", latinEntry(3, { type: "noun", gender: "feminine", genitive: "rosae", forms: [{ label: "plural", value: "rosae" }] }),
          JSON.stringify({ type: "noun", gender: "feminine", genitive: "rosae", forms: [{ label: "plural", value: "rosae" }] }));
        expect("format 3: a verb's principal parts", latinEntry(3, { type: "verb", principal_parts: ["amo", "amare", "amavi", "amatum"] }),
          JSON.stringify({ type: "verb", principalParts: ["amo", "amare", "amavi", "amatum"] }));
        expect("format 3: refused grammar", [
          latinEntry(3, { genders: "feminine" }),
          latinEntry(2, { gender: "feminine" }),
          latinEntry(3, { principal_parts: [] }),
          latinEntry(3, { forms: [{ label: "plural" }] }),
          latinEntry(3, { genitive: "" }),
        ].map((m) => /unknown field "genders"|format": 3|list of 1 to|"value" is required|"genitive" is a text/.test(m)), [true, true, true, true, true]);
        expect("format 1 and 2 still read", [parsedOf(2, { reading: "an" }).includes('"reading":"an"'), (() => { try { parseVocabFile({ format: 4, lessons: [] }); return "read"; } catch (e) { return String((e as Error).message); } })()], [true, 'unsupported file: "format" must be 1, 2 or 3']);

        const file = parseVocabFile(signs(3, sky));
        await store.import(file);
        const signBook = Number((await db.query("SELECT id FROM vocab_books WHERE slug = 'signs'"))[0]!.id);
        const sign = Number((await db.query("SELECT e.id FROM vocab_entries e JOIN vocab_sections s ON s.id = e.section_id JOIN vocab_lessons l ON l.id = s.lesson_id WHERE l.book_id = $1", [signBook]))[0]!.id);
        const answered = await store.answer({ userId: user, entryId: sign, direction: "recall", mode: "written", given: "diĝir" }, 1);
        expect("format 3: any reading is right", answered?.verdict, "right");
        expect("format 3: ilum, the Akkadian reading, too", (await store.answer({ userId: user, entryId: sign, direction: "recall", mode: "written", given: "ilum" }, 2))?.verdict, "right");
        expect("format 3: the answer carries the info", answered?.info, parsed.info);
        expect("format 3: imported again unchanged", (await store.import(parseVocabFile(signs(3, sky)))).changed, 0);
        const before = (await db.query("SELECT info FROM vocab_entries WHERE id = $1", [sign]))[0]!.info;
        await store.import(parseVocabFile(signs(3, { ...sky, functions: ["logogram"] })));
        const after = (await db.query("SELECT id, info FROM vocab_entries WHERE id = $1", [sign]))[0];
        expect("format 3: info corrected in place, the entry kept", [Number(after?.id), JSON.parse(String(after?.info)).functions, before !== after?.info], [sign, ["logogram"], true]);
      }
    } finally {
      await db.close();
      rmSync(dir, { recursive: true, force: true });
    }
  }
}

// Every entry of a vocabulary file
const file = process.argv[2];
if (file) {
  const vocab = parseVocabFile(JSON.parse(readFileSync(file, "utf8")));
  let entries = 0;
  let written = 0;
  const lang = (code: string): AnswerLang => answerLangOf(code);
  const termLang = lang(vocab.book.term);
  const meaningLang = lang(vocab.book.meaning);
  for (const lesson of vocab.lessons) {
    for (const section of lesson.sections) {
      for (const entry of section.entries) {
        entries++;
        if (acceptedForms(entry.term).length === 0 || acceptedForms(entry.meaning).length === 0) {
          failures++;
          console.error(`✘ nothing to accept: ${section.title}: ${entry.term} / ${entry.meaning}`);
        }
        if (grade(entry.term, entry.term, termLang, entry.reading) !== "right") {
          failures++;
          console.error(`✘ own term refused: ${entry.term}`);
        }
        if (entry.reading && grade(entry.reading, entry.term, termLang, entry.reading) !== "right") {
          failures++;
          console.error(`✘ own reading refused: ${entry.term} (${entry.reading})`);
        }
        if (grade(entry.meaning, entry.meaning, meaningLang) !== "right") {
          failures++;
          console.error(`✘ own meaning refused: ${entry.meaning}`);
        }
        if (entry.readings) {
          const own = entry.readings.split(" / ");
          for (const form of [...own, ...own.map((r) => kanaToRomaji(r))]) {
            if (!["right"].includes(grade(form, entry.readings, "ja", kanaToRomaji(entry.readings)))) {
              failures++;
              console.error(`✘ own reading refused: ${entry.term}: ${form}`);
            }
          }
        }
        for (const [code, meaning] of Object.entries(entry.translations ?? {})) {
          if (grade(meaning, meaning, lang(code)) !== "right") {
            failures++;
            console.error(`✘ own ${code} meaning refused: ${entry.term}: ${meaning}`);
          }
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
console.log(`vocabulary checks passed (${cases.length + japanese.length + arabic.length} grading cases)`);
