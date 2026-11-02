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

// EPUB workbooks (docs/exercises.md#epub-workbooks): an invented EPUB, read, drawn and measured.
{
  const { crc32, deflateRawSync, deflateSync } = await import("node:zlib");
  const { mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const epub = await import("./exercises-epub.ts");
  const same = (what: string, got: unknown, want: unknown): void => {
    count++;
    if (JSON.stringify(got) !== JSON.stringify(want)) {
      failures++;
      console.error(`✗ epub: ${what}: ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
    }
  };
  // A zip of stored and deflated entries.
  const zip = (files: Record<string, Buffer | string>): Buffer => {
    const locals: Buffer[] = [];
    const central: Buffer[] = [];
    let offset = 0;
    for (const [i, [name, content]] of Object.entries(files).entries()) {
      const raw = Buffer.from(content);
      const method = i === 0 ? 0 : 8;
      const data = method === 0 ? raw : deflateRawSync(raw);
      const n = Buffer.from(name);
      const local = Buffer.alloc(30);
      local.writeUInt32LE(0x04034b50, 0);
      local.writeUInt16LE(method, 8);
      local.writeUInt32LE(crc32(raw), 14);
      local.writeUInt32LE(data.length, 18);
      local.writeUInt32LE(raw.length, 22);
      local.writeUInt16LE(n.length, 26);
      const entry = Buffer.alloc(46);
      entry.writeUInt32LE(0x02014b50, 0);
      entry.writeUInt16LE(method, 10);
      entry.writeUInt32LE(crc32(raw), 16);
      entry.writeUInt32LE(data.length, 20);
      entry.writeUInt32LE(raw.length, 24);
      entry.writeUInt16LE(n.length, 28);
      entry.writeUInt32LE(offset, 42);
      locals.push(local, n, data);
      central.push(entry, n);
      offset += 30 + n.length + data.length;
    }
    const dir = Buffer.concat(central);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(central.length / 2, 8);
    end.writeUInt16LE(central.length / 2, 10);
    end.writeUInt32LE(dir.length, 12);
    end.writeUInt32LE(offset, 16);
    return Buffer.concat([...locals, dir, end]);
  };
  same("unzip", Object.fromEntries([...epub.unzip(zip({ mimetype: "application/epub+zip", "a/b.txt": "héllo ".repeat(50) }))].map(([k, v]) => [k, v.toString().slice(0, 12)])), {
    mimetype: "application/epub+zip".slice(0, 12),
    "a/b.txt": "héllo héllo ",
  });

  // The key: units, items, a continued line, a key that is a text.
  const key = epub.readKey(
    '<h3 class="h3d"><strong>1   Invented verbs</strong></h3>' +
      '<p class="ansta"><strong><a id="ch1ans-1"></a><a class="nounder" href="c.xhtml#ch1ans1">1 &#183; 1</a></strong></p>' +
      '<p class="ans">1. habla</p><p class="ans">2. comemos;</p><p class="ans">vivimos</p>' +
      '<p class="ansta"><strong><a id="ch1ans-3"></a><a class="nounder" href="c.xhtml#ch1ans3">1 &#183; 3</a></strong>&#160;Un texto traducido.</p>',
  );
  same("key units", key.units, [{ n: 1, title: "Invented verbs" }]);
  same("key items", key.exercises.get("1.1"), { id: "1.1", items: [{ n: "1", answer: "habla" }, { n: "2", answer: "comemos; vivimos" }], text: "" });
  same("key text", key.exercises.get("1.3")?.text, "Un texto traducido.");
  // Exercises: their HTML, their page, whether linked to the key; a slip of the book renumbered.
  const chapter =
    '<p><a id="page_7"></a></p><p class="imagel"><a id="ch2ans1"></a><a class="nounder" href="k.xhtml#ch2ans-1"><img src="t.png"/></a></p><p class="trade">Uno.</p><div class="border2"></div>' +
    '<p class="imagel"><a id="ch1ans2"></a><a class="nounder" href="k.xhtml#ch1ans-2"><img src="t.png"/></a></p><p class="trade">Dos.</p><div class="border2"></div>' +
    '<p class="imagel"><a id="ch2ans3"></a><img src="t.png"/></p><p class="trade">Tres.</p><h3>Grammar</h3><p>Not the exercise.</p>';
  const fragments = epub.fragmentsOf(chapter);
  same("fragments", fragments.map((f) => [f.id, f.unit, f.page, f.keyed]), [["2.1", 2, 7, true], ["2.2", 2, 7, false], ["2.3", 2, 7, false]]);
  same("fragment ends at the rule or a heading", fragments.map((f) => epub.textOf(f.html)), ["Uno.", "Dos.", "Tres."]);
  same("lines read column by column", epub.columnsFirst([[0.1, 0.2, 0.3], [0.6, 0.2, 0.3], [0.1, 0.4, 0.3], [0.6, 0.4, 0.3]]), [[0.1, 0.2, 0.3], [0.1, 0.4, 0.3], [0.6, 0.2, 0.3], [0.6, 0.4, 0.3]]);
  same("lines of one column, row by row", epub.columnsFirst([[0.1, 0.2, 0.3], [0.1, 0.4, 0.3]]), [[0.1, 0.2, 0.3], [0.1, 0.4, 0.3]]);

  // A whole invented EPUB, drawn in Chromium (skipped where Playwright's Chromium is not installed).
  const line = (() => {
    // A 300×20 PNG, white with a black line at the bottom: an answer line.
    const rows: number[] = [];
    for (let y = 0; y < 20; y++) {
      rows.push(0);
      for (let x = 0; x < 300; x++) rows.push(y >= 18 ? 0 : 255);
    }
    const chunk = (type: string, data: Buffer): Buffer => {
      const out = Buffer.alloc(12 + data.length);
      out.writeUInt32BE(data.length, 0);
      out.write(type, 4, "latin1");
      data.copy(out, 8);
      out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "latin1"), data])), 8 + data.length);
      return out;
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(300, 0);
    ihdr.writeUInt32BE(20, 4);
    ihdr.set([8, 0, 0, 0, 0], 8);
    return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(Buffer.from(rows))), chunk("IEND", Buffer.alloc(0))]);
  })();
  const head = '<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><link rel="stylesheet" type="text/css" href="../Styles/s.css"/></head><body>';
  const lineImg = '<img class="inline" src="../Images/line.png" width="300" height="20" alt=""/>';
  const exercises =
    '<h2 class="h2a">Invented verbs</h2>' +
    '<p class="imagel"><a id="page_3"></a><a id="ch1ans1"></a><a class="nounder" href="key.xhtml#ch1ans-1"><img src="../Images/title.png" width="751" height="88" alt=""/></a></p>' +
    '<p class="trade"><strong>Práctica.</strong> Escribe el presente.</p>' +
    '<p class="num-list-s">1. Ella _______________ (hablar) mucho.</p>' +
    '<p class="num-list-s">2. Nosotros _______________ (comer) y _______________ (vivir) aquí.</p>' +
    '<p class="num-list-s">3. <em>They write.</em></p><p class="num">' + lineImg + "</p>" +
    '<div class="border2"><hr/></div>' +
    '<p class="imagel"><a id="ch1ans2"></a><a class="nounder" href="key.xhtml#ch1ans-2"><img src="../Images/title.png" width="751" height="88" alt=""/></a></p>' +
    '<p class="trade">Completa.</p>' +
    '<p class="num-list-s2">1. _______ casa es grande y 2. _______ perros son<br/>3. _______ míos.</p>' +
    '<div class="border2"><hr/></div>' +
    '<p class="imagel"><a id="ch1ans3"></a><img src="../Images/title.png" width="751" height="88" alt=""/></p>' +
    '<p class="trade">¿Verdadero o falso?</p>' +
    '<p class="num-list2">______   1. Hoy es lunes.</p><p class="num-list2">______   2. Llueve.</p>' +
    '<div class="border2"><hr/></div>' +
    // The answer line, used again and again (it is told from a picture by that).
    (lineImg + " ").repeat(10);
  const keyHtml =
    '<h3 class="h3d"><strong>1   Invented verbs</strong></h3>' +
    '<p class="ansta"><strong><a id="ch1ans-1"></a><a class="nounder" href="ch1.xhtml#ch1ans1">1 · 1</a></strong></p>' +
    '<p class="ans">1. habla</p><p class="ans">2. comemos; vivimos</p><p class="ans">3. Escriben.</p>' +
    '<p class="ansta"><strong><a id="ch1ans-2"></a><a class="nounder" href="ch1.xhtml#ch1ans2">1 · 2</a></strong></p>' +
    '<p class="ans">1. La</p><p class="ans">2. los</p><p class="ans">3. X</p>';
  const file = zip({
    mimetype: "application/epub+zip",
    "META-INF/container.xml": '<container><rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles></container>',
    "OEBPS/content.opf":
      '<package><manifest><item id="c1" href="Text/ch1.xhtml"/><item id="k" href="Text/key.xhtml"/></manifest><spine><itemref idref="c1"/><itemref idref="k"/></spine></package>',
    "OEBPS/Text/ch1.xhtml": `${head}${exercises}</body></html>`,
    "OEBPS/Text/key.xhtml": `${head}${keyHtml}</body></html>`,
    "OEBPS/Styles/s.css": "body { font-family: serif; } .trade { margin-left: 4em; }",
    "OEBPS/Images/line.png": line,
    "OEBPS/Images/title.png": line,
  });
  const dir = mkdtempSync(join(tmpdir(), "luma-epub-check-"));
  try {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(join(dir, "invented.epub"), file);
    const report = await epub
      .extractEpub(join(dir, "invented.epub"), { id: "invented-epub", title: "Invented", source: "Invented", level: "A1", language: "es", out: join(dir, "out") })
      .catch((error: unknown) => {
        if (/No Chromium-based browser found/.test(String(error))) return null;
        throw error;
      });
    if (!report) console.log("epub workbook: drawing skipped (no Chromium-based browser installed)");
    else {
      const book = parseExerciseBook(JSON.parse(readFileSync(join(dir, "out", "book.json"), "utf8")));
      same("epub: report", [report.units, report.exercises, report.keyed, report.open], [1, 3, 2, 1]);
      same("epub: unit from the key", book.units, [{ n: 1, title: "Invented verbs" }]);
      const [a, b, c] = book.exercises;
      same("epub: instruction and page", [a!.instruction, a!.page], ["Práctica. Escribe el presente.", 3]);
      same("epub: gaps by item (blanks, two in one sentence, the answer line under the item)", a!.items.map((i) => [i.n, i.gaps.length, i.answer]), [["1", 1, "habla"], ["2", 2, "comemos; vivimos"], ["3", 1, "Escriben."]]);
      same("epub: numbers inside a paragraph, after a line break", b!.items.map((i) => [i.n, i.gaps.length]), [["1", 1], ["2", 1], ["3", 1]]);
      same("epub: a blank before its number; no key, answered freely", [c!.open, c!.items.map((i) => [i.n, i.gaps.length, i.answer])], [true, [["1", 1, ""], ["2", 1, ""]]]);
      const g1 = a!.items[0]!.gaps[0]!;
      const g3 = a!.items[2]!.gaps[0]!;
      count++;
      if (!(g1[0] > 0.05 && g1[0] < 0.6 && g3[1] > g1[1] && g3[2] > 0.2 && existsSync(join(dir, "out", "images", "1.1.jpg")))) {
        failures++;
        console.error(`✗ epub: gaps where the blanks are: ${JSON.stringify([g1, g3])}`);
      }
      for (const e of book.exercises) for (const it of e.items) if (it.answer && markItem(it.answer, it.answer.split(/;\s*/)) !== "right") {
        failures++;
        console.error(`✗ epub: key typed back: ${e.id} ${it.n}`);
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log(`${count} marking cases, ${failures} failures`);
process.exit(failures === 0 ? 0 : 1);
