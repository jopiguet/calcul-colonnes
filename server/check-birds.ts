/**
 * Checks of the bird books (docs/birds.md): the species lists, the choice of a recording, the fetch against a
 * fake xeno-canto (invented recordings, no network), the book it writes, and a call that waits for its song.
 *
 *   npm run check:birds
 */
import { createServer } from "node:http";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import { chooseRecording, fetchSet, hasType, licenceLabel, loadSet, seconds, trimmable, type BirdSet, type XcRecording } from "./birds-fetch.ts";
import { parseVocabFile } from "../shared/vocab/format.ts";
import { readSounds } from "./vocab-import.ts";
import { buildSession, type SessionEntry } from "../shared/vocab/session.ts";
import { acceptedForms } from "../shared/vocab/grade.ts";

let checks = 0;
let failures = 0;
function expect(name: string, got: unknown, wanted: unknown): void {
  checks++;
  if (JSON.stringify(got) !== JSON.stringify(wanted)) {
    failures++;
    console.error(`✘ ${name}: got ${JSON.stringify(got)}, wanted ${JSON.stringify(wanted)}`);
  }
}

// ---- the lists
for (const file of readdirSync(new URL("../content/birds/", import.meta.url)).filter((f) => f.endsWith(".json"))) {
  const set = loadSet(file.replace(/\.json$/, ""));
  const names = new Set<string>();
  for (const s of set.species) {
    expect(`${set.set}: ${s.scientific} is a binomial`, /^[A-Z][a-z]+ [a-z]+$/.test(s.scientific), true);
    expect(`${set.set}: ${s.scientific} once`, names.has(s.scientific), false);
    names.add(s.scientific);
    for (const lang of ["en", "fr", "es"] as const) {
      const name = s[lang];
      expect(`${set.set}: ${s.scientific} ${lang} name, brackets closed`, Boolean(name) && (name.match(/\(/g) ?? []).length === (name.match(/\)/g) ?? []).length, true);
      // "(European) Robin": "Robin" is right too.
      if (name.includes("(")) expect(`${set.set}: ${name} also right without its optional part`, acceptedForms(name).length > 1, true);
    }
  }
  expect(`${set.set}: about forty birds`, set.species.length >= 40 && set.species.length <= 45, true);
  expect(`${set.set}: a book id`, /^birds-[a-z]+$/.test(set.book), true);
}

// ---- licences, lengths, types
expect("licence: BY-NC-SA", licenceLabel("//creativecommons.org/licenses/by-nc-sa/4.0/"), "CC BY-NC-SA 4.0");
expect("licence: CC0", licenceLabel("https://creativecommons.org/publicdomain/zero/1.0/"), "CC0 1.0");
expect("licence: not Creative Commons", licenceLabel("all rights reserved"), "");
expect("trimmable: SA yes, ND no", [trimmable("//creativecommons.org/licenses/by-sa/4.0/"), trimmable("//creativecommons.org/licenses/by-nc-nd/2.5/"), trimmable("//creativecommons.org/licenses/by-nd/4.0/")], [true, false, false]);
expect("seconds", [seconds("0:34"), seconds("1:02:05"), Number.isNaN(seconds("?"))], [34, 3725, true]);
expect("types", [hasType("call, song", "song"), hasType("alarm call", "call"), hasType("flight call", "song"), hasType("subsong", "song")], [true, true, false, false]);

// ---- choosing (invented recordings)
const robin = { scientific: "Erithacus rubecula", en: "(European) Robin", fr: "Rougegorge (familier)", es: "Petirrojo (europeo)" };
const rec = (over: Partial<XcRecording>): XcRecording => ({
  id: "1", gen: "Erithacus", sp: "rubecula", rec: "A. Recordist", cnt: "France", type: "song", q: "A", length: "0:30",
  lic: "//creativecommons.org/licenses/by-nc-sa/4.0/", file: "https://example.invalid/1", ...over,
});
const pool = [
  rec({ id: "10", q: "B", cnt: "Spain" }),
  rec({ id: "11", q: "A", cnt: "Germany", also: ["Parus major"] }),
  rec({ id: "12", q: "A", cnt: "Germany" }),
  rec({ id: "13", q: "A", cnt: "France", lic: "//creativecommons.org/licenses/by-nc-nd/4.0/" }),
  rec({ id: "14", q: "A", cnt: "Switzerland", length: "0:03" }),
  rec({ id: "15", q: "A", cnt: "Switzerland", type: "call" }),
  rec({ id: "16", q: "C", cnt: "Switzerland" }),
  rec({ id: "17", q: "A", sp: "other", cnt: "Switzerland" }),
];
expect("choice: A, clean background, ND and short and C and other species left out", chooseRecording(pool, robin, "song", ["Switzerland", "Germany"])?.id, "12");
expect("choice: the call", chooseRecording(pool, robin, "call", ["Switzerland"])?.id, "15");
expect("choice: none", chooseRecording([rec({ q: "D" })], robin, "song", []), null);

// ---- the fetch, against a fake xeno-canto
const KEY = "secret-key-123";
const wav = (() => {
  // 0.1 s of silence, 8 kHz mono: an invented, tiny recording.
  const samples = 800;
  const b = Buffer.alloc(44 + samples);
  b.write("RIFF", 0); b.writeUInt32LE(36 + samples, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(8000, 24); b.writeUInt32LE(8000, 28); b.writeUInt16LE(1, 32); b.writeUInt16LE(8, 34);
  b.write("data", 36); b.writeUInt32LE(samples, 40); b.fill(128, 44);
  return b;
})();
const queries: string[] = [];
const keys: string[] = [];
const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname === "/api") {
    const query = url.searchParams.get("query") ?? "";
    queries.push(query);
    keys.push(url.searchParams.get("key") ?? "");
    // The first query form is refused for the warbler: the second is tried.
    if (query.startsWith("gen:Curruca")) {
      res.writeHead(400).end("{}");
      return;
    }
    const base = "https://example.invalid";
    const recordings = query.includes("Erithacus")
      ? [rec({ id: "21", file: `${base}/f/21` }), rec({ id: "22", type: "call", file: `${base}/f/22` })]
      : query.includes("Curruca")
        ? [rec({ id: "31", gen: "Curruca", sp: "balearica", type: "call", file: `${base}/f/31` })]
        : [];
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ numPages: 1, page: 1, recordings }));
    return;
  }
  if (url.pathname.startsWith("/f/")) {
    res.writeHead(200, { "Content-Type": "audio/wav" }).end(wav);
    return;
  }
  res.writeHead(404).end();
});
await new Promise<void>((done) => server.listen(0, "127.0.0.1", () => done()));
const port = (server.address() as AddressInfo).port;
const out = mkdtempSync(join(tmpdir(), "luma-birds-"));
// The fake files are https-less; the choice requires https, so the check maps them.
const set: BirdSet = {
  set: "test", book: "birds-test", title: "Test birds", countries: ["France"],
  species: [robin, { scientific: "Curruca balearica", en: "Balearic Warbler", fr: "Fauvette des Baléares", es: "Curruca balear" }, { scientific: "Nullus avis", en: "No Bird", fr: "Aucun oiseau", es: "Ningún ave" }],
};
const logs: string[] = [];
const realFetch = globalThis.fetch;
globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => realFetch(String(input).replace(/^https:\/\/example\.invalid/, `http://127.0.0.1:${port}`), init)) as typeof fetch;
try {
  // Recordings point at https://example.invalid/f/<id>, served by the fake.
  const picks = await fetchSet(set, { out, key: KEY, base: `http://127.0.0.1:${port}/api`, trimClips: false, dry: false, log: (s) => logs.push(s) });
  expect("fetch: robin song and call, warbler call only, nothing for the third", picks.map((p) => `${p.species.scientific}:${p.kind}:${p.recording.id}`), [
    "Erithacus rubecula:song:21", "Erithacus rubecula:call:22", "Curruca balearica:call:31",
  ]);
  expect("fetch: the second query form after a refusal", queries.filter((q) => q.includes("Curruca")), ["gen:Curruca sp:balearica", 'sp:"Curruca balearica"']);
  expect("fetch: the key sent, never logged", [keys.every((k) => k === KEY), logs.some((l) => l.includes(KEY))], [true, false]);
  const file = parseVocabFile(JSON.parse(readFileSync(join(out, "test", "birds.json"), "utf8")));
  expect("book: a sound book, songs then calls", [file.book.kind, file.lessons.map((l) => l.title)], ["sounds", ["Songs", "Calls"]]);
  const entries = file.lessons.flatMap((l) => l.sections.flatMap((s) => s.entries));
  expect("book: the warbler's call is its first sound", entries.map((e) => `${e.term}|${e.group}`), ["Erithacus rubecula|song", "Curruca balearica (call)|call", "Erithacus rubecula (call)|call"]);
  expect("book: the credit", entries[0]!.note, "XC21 · A. Recordist · CC BY-NC-SA 4.0 · xeno-canto.org/21");
  const sounds = readSounds(file, join(out, "test", "birds.json"));
  expect("book: the recordings read, one per file", [sounds.length, sounds[0]!.mime, /^[0-9a-f]{64}$/.test(entries[0]!.audio ?? "")], [1, "audio/wav", true]);
  expect("credits file", readFileSync(join(out, "test", "CREDITS.md"), "utf8").includes("[XC22](https://xeno-canto.org/22) | A. Recordist | France | CC BY-NC-SA 4.0"), true);
} finally {
  globalThis.fetch = realFetch;
  server.close();
  rmSync(out, { recursive: true, force: true });
}

// ---- format: a sound book needs its recordings, and only it has any
expect("format: audio required", (() => { try { parseVocabFile({ format: 2, book: { id: "b", title: "B", kind: "sounds", term: "la", meaning: "en" }, lessons: [{ title: "L", sections: [{ title: "S", entries: [{ term: "A b", meaning: "c" }] }] }] }); return "accepted"; } catch (e) { return (e as Error).message.includes('needs "audio"'); } })(), true);
expect("format: audio elsewhere refused", (() => { try { parseVocabFile({ format: 2, book: { id: "b", title: "B", kind: "translation", term: "es", meaning: "en" }, lessons: [{ title: "L", sections: [{ title: "S", entries: [{ term: "a", meaning: "b", audio: "s/a.mp3" }] }] }] }); return "accepted"; } catch (e) { return (e as Error).message.includes('kind "sounds"'); } })(), true);
expect("format: a path inside the folder", (() => { try { parseVocabFile({ format: 2, book: { id: "b", title: "B", kind: "sounds", term: "la", meaning: "en" }, lessons: [{ title: "L", sections: [{ title: "S", entries: [{ term: "a", meaning: "b", audio: "../x.mp3" }] }] }] }); return "accepted"; } catch { return "refused"; } })(), "refused");

// ---- sessions: only "which bird?", and a call once its song is known
const book = { id: 7, kind: "sounds" as const, termLang: "la", meaningLang: "en", alphabetical: false };
const entry = (id: number, term: string, meaning: string, group: string): SessionEntry => ({
  id, sectionId: 1, position: id, term, meaning, group, feminine: false, note: "", reading: "", readings: "", translations: {}, audio: "a".repeat(64), book,
});
const entries = [entry(1, "Erithacus rubecula", "Robin", "song"), entry(2, "Turdus merula", "Blackbird", "song"), entry(3, "Erithacus rubecula (call)", "Robin", "call"), entry(4, "Curruca balearica (call)", "Balearic Warbler", "call")];
const session = (box: number) =>
  buildSession({
    entries, pool: entries, now: 1e12, size: 10, preference: "mixed", purpose: "learn", newOrder: "book", random: () => 0.5,
    progress: new Map(box ? [["1:recognise", { box, dueAt: 2e12 }]] : []),
  });
const first = session(0);
expect("session: songs and a bird with only a call; the robin's call waits", first.map((c) => c.entryId).sort(), [1, 2, 4]);
expect("session: recognised only, the recording the question, its name not shown first", [first.every((c) => c.direction === "recognise"), first.every((c) => c.audio === "a".repeat(64))], [true, true]);
expect("session: the call comes once the song reached box 3", [session(2).some((c) => c.entryId === 3), session(3).some((c) => c.entryId === 3)], [false, true]);

console.log(`birds checks: ${checks - failures}/${checks}`);
if (failures) process.exit(1);
