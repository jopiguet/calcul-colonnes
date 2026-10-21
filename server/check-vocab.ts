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
  const cards = buildSession({ entries: [...more, ...list], pool: list, progress, now: 0, size: 20, preference: "written", purpose: "learn", newOrder: "book", met: new Set([14, 3]), random: Math.random });
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
  const lang = (code: string): AnswerLang => (code === "es" || code === "de" || code === "ja" || code === "ar" ? code : "en");
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
