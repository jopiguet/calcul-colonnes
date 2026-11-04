/**
 * Checks the language courses (docs/language-courses.md#checks):
 *
 *   npm run check:lessons
 *
 * - every lesson reads in French, Spanish and English, and the three agree:
 *   the same exercises, blanks, strict answers and right choices, the same
 *   headings, tables and blocks;
 * - every lesson follows the template: a goal paragraph first, a table at
 *   least, four exercises at least, one summary, last, and its words;
 * - every answer, typed back, is marked right; a wrong one is not;
 * - the marking rules on invented cases (folds, free answers, choices, marks);
 * - each course's vocabulary book is a valid format-3 book.
 */
import { compareLessons, exercisesOf, parseLesson } from "../shared/lessons/format.ts";
import { fold, markBlank, markExercise, type Fold } from "../shared/lessons/grade.ts";
import { courses, vocabBookOf } from "./lessons.ts";

let failures = 0;
let checks = 0;
const fail = (what: string): void => {
  failures++;
  console.error(`✗ ${what}`);
};
const expect = (what: string, got: unknown, want: unknown): void => {
  checks++;
  if (JSON.stringify(got) !== JSON.stringify(want)) fail(`${what}: ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
};

// The marking rules, on invented cases.
const latin: Fold[] = ["macrons", "ij", "uv"];
const translit: Fold[] = ["translit", "aleph3"];
expect("fold: macrons, j, v, case, final dot", fold("Iūlius vēnit.", latin), "iulius uenit");
expect("fold: transliteration", [fold("sḏm.n=f", translit), fold("sDm.n.f", translit)].map((s) => s.replace("dj", "d")), ["sdmnf", "sdmnf"]);
expect("fold: ꜣ typed as 3", fold("ꜣbd", translit), fold("3bd", translit));
expect("fold: subscripts", fold("du₃", ["translit", "subscripts"]), "du3");
const grc = ["greek"] as const;
expect("greek: Greek or transliteration, no accents", ["λόγος", "logos", "Lógos", "λογος"].map((t) => fold(t, [...grc])), ["λογοσ", "λογοσ", "λογοσ", "λογοσ"]);
expect("greek: digraphs and long vowels", [fold("ψυχή", [...grc]), fold("psychē", [...grc]), fold("psuche", [...grc]), fold("ἄνθρωπος", [...grc]), fold("anthrōpos", [...grc])], ["ψυχε", "ψυχε", "ψυχε", "ανθροποσ", "ανθροποσ"]);
expect("greek: breathings, nasal gamma, iota subscript", [fold("ὁ ἵππος", [...grc]), fold("ho hippos", [...grc]), fold("ἄγγελος", [...grc]), fold("angelos", [...grc]), fold("τῷ λόγῳ", [...grc]), fold("tō logō", [...grc]), fold("rhētōr", [...grc]), fold("ῥήτωρ", [...grc])], ["ο ιπποσ", "ο ιπποσ", "ανγελοσ", "ανγελοσ", "το λογο", "το λογο", "ρετορ", "ρετορ"]);
expect("greek: free answers keep their letters", markBlank({ kind: "free", answers: ["The word."] } as Parameters<typeof markBlank>[0], "the world", [...grc]), "check");
const fa = ["persian"] as const;
expect("persian: script or transliteration", ["کتاب", "ketâb", "ketab", "Ketāb"].map((t) => fold(t, [...fa])), ["ktb", "ktb", "ktb", "ktb"]);
expect("persian: digraphs, ZWNJ, ezafe", [fold("می‌خواهم", [...fa]), fold("mikhâham", [...fa]), fold("mixaham", [...fa]), fold("کتابِ من", [...fa]), fold("ketâb-e man", [...fa])], ["mxm", "mxm", "mxm", "ktbmn", "ktbmn"]);
expect("persian: sh, ch, zh, gh/q; letters for one sound", [fold("شب", [...fa]), fold("shab", [...fa]), fold("چای", [...fa]), fold("chây", [...fa]), fold("ژاله", [...fa]), fold("zhâle", [...fa]), fold("قند", [...fa]), fold("ghand", [...fa]), fold("صد", [...fa]), fold("sad", [...fa]), fold("ظهر", [...fa]), fold("zohr", [...fa])], ["šb", "šb", "č", "č", "žl", "žl", "qnd", "qnd", "sd", "sd", "zr", "zr"]);
expect("persian: Arabic letter forms", [fold("كتاب", [...fa]), fold("ي", [...fa]) === fold("ی", [...fa])], ["ktb", true]);
expect("persian: free answers keep their letters", markBlank({ kind: "free", answers: ["The book."] } as Parameters<typeof markBlank>[0], "the boot", [...fa]), "check");
const egy = ["egyptian"] as const;
expect("egyptian: ankh however typed", ["ꜥnḫ", "ankh", "anx", "'nḫ", "Anh"].map((t) => fold(t, [...egy])), ["nh", "nh", "nh", "nh", "nh"]);
expect("egyptian: pronunciation and transliteration", [fold("nefer", [...egy]), fold("nfr", [...egy]), fold("sḏm.n.f", [...egy]), fold("sedjem-en-ef", [...egy])], ["nfr", "nfr", "sdmnf", "sdmnf"]);
expect("egyptian: j, i, y; w, u", [fold("jmn", [...egy]), fold("Imen", [...egy]), fold("Amun", [...egy]), fold("wsjr", [...egy]), fold("usir", [...egy])], ["imn", "imn", "mwn", "wsir", "wsir"]);
expect("egyptian: free answers keep their vowels", markBlank({ kind: "free", answers: ["The king lives."] } as Parameters<typeof markBlank>[0], "the king loves", [...egy]), "check");
const strict = { kind: "strict" as const, answers: ["rosae", "rosās"] };
const free = { kind: "free" as const, answers: ["The girl loves the rose."] };
const choice = { kind: "choice" as const, answers: ["nom.", "gen.", "dat."], right: 1 };
expect("strict blanks", ["rosae", "ROSAE", "rosas", "rosa", ""].map((g) => markBlank(strict, g, latin)), ["right", "right", "right", "wrong", "blank"]);
expect("free blanks", ["the girl loves the rose", "The girl likes the rose", ""].map((g) => markBlank(free, g, latin)), ["right", "check", "blank"]);
expect("choices", ["1", "0", ""].map((g) => markBlank(choice, g, latin)), ["right", "wrong", "blank"]);
expect("a mark makes a checked blank right, not an empty one, not a choice", markExercise([free, strict, choice, free], ["The girl likes roses", "rosa", "0", ""], latin, { 0: true, 1: true, 2: true, 3: true }).results, ["right", "right", "wrong", "blank"]);
expect("lesson parse: blanks and refusals", (() => {
  const l = parseLesson("# T\n\nGoal.\n\n::: exercise a-b\nDo.\n\n- x → [[y / z]] and ((p / q*))\n| A | B |\n|---|---|\n| m | {{n}} |\n:::\n");
  const e = exercisesOf(l)[0]!;
  const bad = ["# T\n::: exercise A\n- [[x]]\n:::", "# T\n::: exercise a1\n- x\n:::", "# T\n::: exercise a1\n- ((x / y))\n:::", "# T\n::: exercise a1\n- [[x]]\n", "no title"].map((s) => {
    try {
      parseLesson(s);
      return "read";
    } catch {
      return "refused";
    }
  });
  return [e.blanks.map((b) => b.kind), e.blanks[0]!.answers, e.blanks[1]!.right, e.table?.rows.length, bad];
})(), [["strict", "choice", "free"], ["y", "z"], 1, 1, ["refused", "refused", "refused", "refused", "refused"]]);

// The courses.
const LANGS = ["fr", "es", "en"] as const;
let lessons = 0;
let exercises = 0;
let blanks = 0;
let words = 0;
for (const course of courses().values()) {
  const id = course.meta.id;
  for (const l of course.lessons) {
    lessons++;
    const where = `${id}/${l.slug}`;
    for (const lang of ["fr", "es"] as const) {
      checks++;
      for (const d of compareLessons(l.byLang.en, l.byLang[lang])) fail(`${where}: en and ${lang} differ: ${d}`);
    }
    for (const lang of LANGS) {
      const lesson = l.byLang[lang];
      const at = `${where}/${lang}.md`;
      checks++;
      if (!new RegExp(`^${l.n}\\. `).test(lesson.title)) fail(`${at}: the title starts with the lesson's number, "${l.n}. …"`);
      const first = lesson.parts[0];
      if (!first || first.kind !== "text" || /^#/.test(first.markdown)) fail(`${at}: a goal paragraph comes first`);
      const ex = exercisesOf(lesson);
      if (ex.length < 4) fail(`${at}: ${ex.length} exercises, at least 4`);
      const summaries = lesson.parts.filter((p) => p.kind === "summary");
      if (summaries.length !== 1 || lesson.parts.at(-1)?.kind !== "summary") fail(`${at}: one summary, last`);
      if (!lesson.parts.some((p) => p.kind === "text" && /^\|.*\|\s*$/m.test(p.markdown))) fail(`${at}: no table`);
      if (/(^|[^\\])\$/.test(lesson.parts.map((p) => (p.kind === "exercise" ? p.exercise.prompt : p.markdown)).join("\n"))) fail(`${at}: a "$" would be read as a formula`);
      for (const e of ex) {
        if (!e.prompt) fail(`${at}, ${e.id}: no instruction`);
        // Italics or bold cut by a blank would show their asterisks.
        const pieces = [...e.items.flatMap((i) => i.segments), ...(e.table ? [...e.table.header, ...e.table.rows.flat()].flat() : [])];
        for (const piece of pieces) {
          if (typeof piece === "string" && (piece.replace(/\*\*/g, "").match(/\*/g) ?? []).length % 2 === 1) fail(`${at}, ${e.id}: emphasis cut by a blank: "${piece}"`);
        }
        // Every answer typed back is right; a wrong one is not.
        const right = e.blanks.map((b) => (b.kind === "choice" ? String(b.right) : b.answers[0]!));
        const marked = markExercise(e.blanks, right, course.meta.folds);
        checks++;
        if (marked.score !== marked.total) fail(`${at}, ${e.id}: its own answers marked ${marked.results.join(", ")}`);
        e.blanks.forEach((b, i) => {
          checks++;
          const wrong = b.kind === "choice" ? String((b.right! + 1) % b.answers.length) : `${b.answers[0]}xq`;
          if (markBlank(b, wrong, course.meta.folds) === "right") fail(`${at}, ${e.id}, blank ${i + 1}: a wrong answer is right`);
          if (b.kind !== "choice" && b.answers.some((a) => !fold(a, course.meta.folds))) fail(`${at}, ${e.id}, blank ${i + 1}: an answer folds to nothing`);
        });
        if (lang === "en") {
          exercises++;
          blanks += e.blanks.length;
        }
      }
    }
    checks++;
    if (l.vocab.length < 5) fail(`${where}: ${l.vocab.length} words, at least 5`);
    words += l.vocab.length;
  }
  const book = vocabBookOf(course);
  checks++;
  if (!book) fail(`${id}: no vocabulary book`);
  else {
    const terms = book.lessons.flatMap((l) => l.sections.flatMap((s) => s.entries.map((e) => `${e.term}|${e.meaning}`)));
    const twice = terms.filter((t, i) => terms.indexOf(t) !== i);
    if (twice.length) fail(`${id}: words taught twice: ${twice.slice(0, 5).join(", ")}`);
  }
  console.log(`${id}: ${course.lessons.length} lessons`);
}

console.log(`${lessons} lessons, ${exercises} exercises, ${blanks} blanks, ${words} words; ${checks} checks, ${failures} failures`);
process.exit(failures === 0 ? 0 : 1);
