/**
 * Checks the marking of workbook exercises (docs/exercises.md#marking):
 *
 *   npm run check:exercises                          # invented cases
 *   npm run check:exercises -- data/exercises/<book>  # and every item of a book: its own key typed back is right
 *
 * The cases are invented; no book's text is in the project.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { markExercise, markItem, readKey, spellings, type ItemResult } from "../shared/exercises/grade.ts";
import { parseExerciseBook } from "../shared/exercises/format.ts";

let failures = 0;
let count = 0;
function expect(answer: string, given: string[], want: ItemResult): void {
  count++;
  const got = markItem(answer, given);
  if (got !== want) {
    failures++;
    console.error(`✗ key "${answer}", typed ${JSON.stringify(given)}: ${got}, expected ${want}`);
  }
}

// Plain answers: case, apostrophes, final punctuation.
expect("has been sleeping", ["has been sleeping"], "right");
expect("has been sleeping", ["Has been sleeping."], "right");
expect("She’s been sleeping", ["she's been sleeping"], "right");
expect("has been sleeping", ["has slept"], "wrong");
expect("has been sleeping", [""], "blank");
expect("", ["anything"], "open");
// Alternatives.
expect("I’ve been waiting / I have been waiting", ["I have been waiting"], "right");
expect("I’ve been waiting / I have been waiting", ["I’ve been waiting"], "right");
expect("I’ve been waiting / I have been waiting", ["I waited"], "wrong");
expect("No, it’s weeks since I (last) swam. or No, it’s been weeks since …", ["No, it's weeks since I swam"], "right");
expect("No, it’s weeks since I (last) swam. or No, it’s been weeks since …", ["No, it's been weeks since I swam"], "right");
expect("’s been reading a book or … reading a novel", ["'s been reading a novel"], "right");
// Word choices and optional words.
expect("He has been sick/unwell since Monday.", ["He has been unwell since Monday"], "right");
expect("He has been sick/unwell since Monday.", ["He has been sick since Monday"], "right");
expect("saving (money)", ["saving"], "right");
expect("saving (money)", ["saving money"], "right");
expect("saving (money)", ["saving time"], "wrong");
// A long bracket is a comment.
expect("f (it means a person who is under age)", ["f"], "right");
expect("i (it means to annoy someone)", ["f"], "wrong");
// Several gaps.
expect("fell … broke", ["fell", "broke"], "right");
expect("fell … broke", ["broke", "fell"], "wrong");
expect("fell … broke", ["fell broke", ""], "right");
expect("Soup; salad (in either order)", ["salad", "soup"], "right");
expect("Soup; salad (in either order)", ["salad", "bread"], "wrong");
expect("door, window", ["door", "window"], "right");
// A dash: nothing in the gap.
expect("– (the is also correct)", [""], "right");
expect("–", ["-"], "right");
expect("–", ["the"], "wrong");
// The first letter printed: the rest is enough.
expect("weighing", ["eighing"], "right");
expect("weighing", ["eigh"], "wrong");
// Letters.
expect("b", ["b"], "right");
expect("b", ["B"], "right");
expect("b", ["c"], "wrong");
expect("a and c are true", ["c, a"], "right");
expect("a and c are true", ["a"], "wrong");
expect("b is true", ["b"], "right");
// Ellipsis at the end: the rest as printed.
expect("I usually go …", ["I usually go to work by bus"], "right");
// The key's display keeps its text.
if (readKey("I’ve been / I have been").alternatives.length !== 2) {
  failures++;
  console.error("✗ two alternatives");
}

// An exercise: open items, overrides.
const marked = markExercise(
  { id: "1.1", open: false, items: [{ n: "2", answer: "went", gaps: [[0, 0, 0]] }, { n: "3", answer: "saw", gaps: [] }, { n: "4", answer: "", gaps: [] }] },
  { "2": ["went"], "3": ["seen"], "4": ["whatever"] },
  { "3": true },
);
count++;
if (marked.score !== 2 || marked.total !== 2 || marked.items[2]!.result !== "open") {
  failures++;
  console.error("✗ exercise marking", JSON.stringify(marked));
}
const free = markExercise({ id: "1.2", open: true, items: [{ n: "1", answer: "Possible: a cat", gaps: [] }] }, { "1": ["a dog"] }, {});
count++;
if (free.items[0]!.result !== "open" || free.total !== 0) {
  failures++;
  console.error("✗ open exercise", JSON.stringify(free));
}

// A real book, if given: each item's own key, typed back, must be right.
const dir = process.argv[2];
if (dir) {
  const path = join(dir, "book.json");
  if (!existsSync(path)) {
    console.error(`no ${path}`);
    process.exit(2);
  }
  const book = parseExerciseBook(JSON.parse(readFileSync(path, "utf8")));
  let items = 0;
  let bad = 0;
  for (const e of book.exercises) {
    if (e.open) continue;
    for (const it of e.items) {
      if (!it.answer) continue;
      items++;
      const first = spellings(readKey(it.answer).alternatives[0] ?? "")[0] ?? "";
      const parts = it.gaps.length > 1 ? first.split(/\s*(?:…|\.\.\.|;|,)\s*/).filter(Boolean) : [first];
      const typed = it.gaps.length > 1 && parts.length === it.gaps.length ? parts : [first, ...Array(Math.max(0, it.gaps.length - 1)).fill("")];
      if (markItem(it.answer, typed) !== "right") {
        bad++;
        if (bad <= 25) console.error(`  ${e.id} item ${it.n} (${it.gaps.length} gaps): ${it.answer.slice(0, 90)}`);
      }
    }
  }
  console.log(`${book.book.id}: ${items} items, ${bad} whose key typed back is not right`);
  if (bad > items * 0.01) failures++;
}

console.log(`${count} marking cases, ${failures} failures`);
process.exit(failures === 0 ? 0 : 1);
