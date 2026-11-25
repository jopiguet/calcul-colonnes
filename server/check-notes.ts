/**
 * Checks of the note books (docs/notes.md): the books in content/notes read and import as they are (every staff
 * and sound there), the names in the three languages, the pitches, the staff's ledger lines, and the spellings
 * of sharps and flats an answer may use.
 *
 *   npm run check:notes
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseVocabFile } from "../shared/vocab/format.ts";
import { readImages, readSounds } from "./vocab-import.ts";
import { BOTTOM, NATURALS, NOTES_DIR as BUILD_DIR, SHARPS, frequency, staffSvg, step } from "./notes-build.ts";
import { NOTE_BOOKS, NOTES_DIR } from "./notes.ts";
import { musicSpellings } from "./vocab.ts";
import { grade } from "../shared/vocab/grade.ts";

let checks = 0;
let failures = 0;
function expect(name: string, got: unknown, wanted: unknown): void {
  checks++;
  if (JSON.stringify(got) !== JSON.stringify(wanted)) {
    failures++;
    console.error(`✘ ${name}: got ${JSON.stringify(got)}, wanted ${JSON.stringify(wanted)}`);
  }
}

// ---- the books as committed
const counts: Record<string, number> = {};
for (const name of NOTE_BOOKS) {
  const path = join(NOTES_DIR, name);
  const file = parseVocabFile(JSON.parse(readFileSync(path, "utf8")));
  expect(`${name}: a shared sound book`, [file.book.kind, file.book.id.startsWith("notes-")], ["sounds", true]);
  const entries = file.lessons.flatMap((l) => l.sections.flatMap((s) => s.entries));
  counts[file.book.id] = entries.length;
  // A pitch once per group (C4 is on both staves, and heard after do and alone).
  const terms = new Set(entries.map((e) => `${e.term}|${e.group}`));
  expect(`${name}: each pitch once per group`, terms.size, entries.length);
  for (const e of entries) {
    expect(`${name}: ${e.term} named in French and Spanish`, Boolean(e.translations?.fr && e.translations?.es), true);
  }
  // Every staff and sound is there, of a known type and size.
  const images = readImages(file, path);
  const sounds = readSounds(file, path);
  expect(`${name}: sounds read`, sounds.every((s) => s.mime === "audio/mpeg"), true);
  if (name === "staff.json") expect("staff.json: one picture per note", images.length, entries.length);
}
expect("books: 20 sounds by ear, 26 notes on the staff", counts, { "notes-ear": 20, "notes-staff": 26 });

// ---- the server reads the books the build writes, and does not carry the build (it ran at start once bundled)
expect("server: the books where the build writes them", NOTES_DIR, BUILD_DIR);
expect("server: notes.ts does not import the build", /from "\.\/notes-build/.test(readFileSync(new URL("./notes.ts", import.meta.url), "utf8")), false);
expect("build:server copies content/notes beside the bundle", /cp -r content\/notes dist-server\/content\/notes/.test(readFileSync(new URL("../package.json", import.meta.url), "utf8")), true);

// ---- names and pitches
expect("names", NATURALS.map((n) => `${n.letter}=${n.fr}=${n.es}`), ["C=do=do", "D=ré=re", "E=mi=mi", "F=fa=fa", "G=sol=sol", "A=la=la", "B=si=si"]);
expect("sharps", SHARPS.map((s) => s.en), ["C sharp / D flat", "D sharp / E flat", "F sharp / G flat", "G sharp / A flat", "A sharp / B flat"]);
expect("sharps in French and Spanish", [SHARPS[0]!.fr, SHARPS[4]!.es], ["do dièse / ré bémol", "la sostenido / si bemol"]);
expect("pitches: A4 440, C4 middle C, A3 an octave down", [frequency(9, 4), Number(frequency(0, 4).toFixed(2)), frequency(9, 3)], [440, 261.63, 220]);

// ---- the staff: the bottom lines, and the ledger lines a note needs
const fake = { d: "M0 0", bounds: [0, 0, 1, 1] as [number, number, number, number] };
const ledgers = (clef: "treble" | "bass", s: number) => (staffSvg(clef, fake, s).match(/<line /g) ?? []).length - 5;
expect("staff: bottom lines E4 and G2", [BOTTOM.treble, BOTTOM.bass], [step(2, 4), step(4, 2)]);
expect("staff: treble C4 one ledger line, D4 none, A5 one, G5 none", [ledgers("treble", step(0, 4)), ledgers("treble", step(1, 4)), ledgers("treble", step(5, 5)), ledgers("treble", step(4, 5))], [1, 0, 1, 0]);
expect("staff: bass E2 one ledger line, C4 one, B3 none", [ledgers("bass", step(2, 2)), ledgers("bass", step(0, 4)), ledgers("bass", step(6, 3))], [1, 1, 0]);

// ---- sharps and flats as typed
expect("spellings: C# and Db", [musicSpellings("C#"), musicSpellings("Db")], [["C#", "C sharp", "C dièse", "C sostenido"], ["Db", "D flat", "D bémol", "D bemol"]]);
expect("spellings: do# and ré♭; a plain name untouched; 'sib' is not B", [musicSpellings("do#")[2], musicSpellings("ré♭")[2], musicSpellings("sol"), musicSpellings("sib")], ["do dièse", "ré bémol", ["sol"], ["sib"]]);
const right = (given: string, expected: string, lang: "en" | "fr" | "es") => musicSpellings(given).some((g) => ["right", "accent"].includes(grade(g, expected, lang)));
expect("grading: C# and Db for C sharp / D flat, do# for do dièse, re for ré; C# is not C", [right("C#", "C sharp / D flat", "en"), right("Db", "C sharp / D flat", "en"), right("do#", "do dièse / ré bémol", "fr"), right("re", "ré", "fr"), right("C#", "C", "en")], [true, true, true, true, false]);

console.log(`notes checks: ${checks - failures}/${checks}`);
if (failures) process.exit(1);
