/**
 * Makes the bird books (docs/birds.md): for each bird of a list in content/birds/, a song and a call from
 * xeno-canto, each under its own Creative Commons licence, trimmed to 20 seconds, and a sound book to import.
 *
 *   npm run birds:fetch -- europe | mediterranean | alps | all [--out data/birds] [--no-trim] [--dry]
 *
 * The xeno-canto API key (free, from your xeno-canto account page) is typed in at the prompt: never an argument,
 * never written to a file. Recordings stay in data/birds/<set>/ (not in the project, not in the zip); then
 *
 *   npm run vocab:import -- data/birds/europe/birds.json
 *
 * or VOCAB_FILE=data/birds/europe/birds.json,... for the server to import them at start.
 *
 * Choice of a recording: the bird's scientific name; type song (then call); quality A, then B; no other species
 * heard in the background, if possible; 5 s to 3 min; a licence that allows trimming (no ND); recorded in the
 * set's countries first. A recording already downloaded is not fetched again.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

export interface BirdSpecies {
  scientific: string;
  en: string;
  fr: string;
  es: string;
}

export interface BirdSet {
  set: string;
  book: string;
  title: string;
  countries: string[];
  species: BirdSpecies[];
}

/** A recording as xeno-canto's API describes it (the fields used here). */
export interface XcRecording {
  id: string;
  gen: string;
  sp: string;
  en?: string;
  rec: string;
  cnt: string;
  type: string;
  q: string;
  length: string;
  lic: string;
  file: string;
  also?: string[];
}

export type SoundKind = "song" | "call";

export interface Pick {
  species: BirdSpecies;
  kind: SoundKind;
  recording: XcRecording;
}

export const API = "https://xeno-canto.org/api/3/recordings";
/** Seconds kept of a recording. */
export const CLIP_SECONDS = 20;

/** "0:34" or "1:02:05" in seconds; NaN when unreadable. */
export function seconds(length: string): number {
  const parts = length.split(":").map(Number);
  if (parts.length < 2 || parts.some((p) => !Number.isFinite(p))) return Number.NaN;
  return parts.reduce((sum, p) => sum * 60 + p, 0);
}

/** "//creativecommons.org/licenses/by-nc-sa/4.0/" → "CC BY-NC-SA 4.0"; "" when not a Creative Commons licence. */
export function licenceLabel(lic: string): string {
  const m = /creativecommons\.org\/(licenses|publicdomain)\/([a-z-]+)\/([\d.]+)/i.exec(lic);
  if (!m) return "";
  if (m[1]!.toLowerCase() === "publicdomain") return m[2]!.toLowerCase() === "zero" ? `CC0 ${m[3]}` : `Public domain ${m[3]}`;
  return `CC ${m[2]!.toUpperCase()} ${m[3]}`;
}

/** A licence that allows a trimmed copy: Creative Commons, without "no derivatives". */
export const trimmable = (lic: string): boolean => licenceLabel(lic) !== "" && !/(^|[-/])nd([-/]|$)/i.test(lic.replace(/.*licenses\//i, ""));

/** Does the recording's type say song (or call)? Types are free text: "song", "call, song", "alarm call". */
export function hasType(type: string, kind: SoundKind): boolean {
  return type.toLowerCase().split(/[,;]/).some((t) => t.trim() === kind || (kind === "call" && /(^|\s)call$/.test(t.trim())));
}

/**
 * The best recording of a kind for a bird: the right species and type, a licence that allows trimming, a usable
 * length; then quality A before B (nothing lower), none in the background, the set's countries in their order,
 * and a length near 30 s.
 */
export function chooseRecording(recordings: XcRecording[], species: BirdSpecies, kind: SoundKind, countries: string[]): XcRecording | null {
  const [gen, sp] = species.scientific.toLowerCase().split(" ");
  const fits = recordings.filter((r) => {
    const len = seconds(r.length);
    return r.gen.toLowerCase() === gen && r.sp.toLowerCase() === sp && hasType(r.type, kind) && trimmable(r.lic) && /^[AB]$/.test(r.q) && len >= 5 && len <= 180 && /^https:\/\//.test(r.file);
  });
  const country = (r: XcRecording): number => {
    const i = countries.findIndex((c) => c.toLowerCase() === r.cnt.toLowerCase());
    return i < 0 ? countries.length : i;
  };
  fits.sort(
    (a, b) =>
      a.q.localeCompare(b.q) ||
      Number((a.also ?? []).filter(Boolean).length > 0) - Number((b.also ?? []).filter(Boolean).length > 0) ||
      country(a) - country(b) ||
      Math.abs(seconds(a.length) - 30) - Math.abs(seconds(b.length) - 30) ||
      Number(a.id) - Number(b.id),
  );
  return fits[0] ?? null;
}

/** The queries tried for a bird, in order: genus and species tags, then the name as one tag. */
export const queriesFor = (scientific: string): string[] => {
  const [gen, sp] = scientific.split(" ");
  return [`gen:${gen} sp:${sp}`, `sp:"${scientific}"`];
};

/** The credit shown after the answer: "XC123456 · Jane Doe · CC BY-NC-SA 4.0 · xeno-canto.org/123456". */
export const creditOf = (r: XcRecording): string => `XC${r.id} · ${r.rec} · ${licenceLabel(r.lic)} · xeno-canto.org/${r.id}`;

/** The sound book for the picks made: songs first (calls come once a song is known), ten birds per section. */
export function buildBook(set: BirdSet, picks: Pick[], fileOf: (p: Pick) => string): Record<string, unknown> {
  const entry = (p: Pick): Record<string, unknown> => ({
    term: p.kind === "call" ? `${p.species.scientific} (call)` : p.species.scientific,
    meaning: p.species.en,
    translations: { fr: p.species.fr, es: p.species.es },
    group: p.kind,
    note: creditOf(p.recording),
    audio: fileOf(p),
  });
  const firsts = set.species.map((s) => picks.find((p) => p.species === s && p.kind === "song") ?? picks.find((p) => p.species === s && p.kind === "call")).filter((p): p is Pick => p !== undefined);
  const calls = picks.filter((p) => p.kind === "call" && !firsts.includes(p));
  // Sections by tens, titled by their range: the same in every language.
  const chunks = (list: Pick[]) =>
    Array.from({ length: Math.ceil(list.length / 10) }, (_, i) => ({ title: `${i * 10 + 1}–${Math.min(list.length, i * 10 + 10)}`, entries: list.slice(i * 10, i * 10 + 10).map(entry) }));
  const lessons = [{ title: "Songs", subtitle: "Chants · Cantos", sections: chunks(firsts) }];
  if (calls.length) lessons.push({ title: "Calls", subtitle: "Cris · Reclamos", sections: chunks(calls) });
  return {
    format: 2,
    book: {
      id: set.book,
      title: set.title,
      kind: "sounds",
      term: "la",
      meaning: "en",
      credit: "Recordings from xeno-canto.org, each under its own Creative Commons licence, credited after each answer; names: IOC, CINFO, SEO/BirdLife",
    },
    lessons,
  };
}

/** The credits file beside the book: every recording, its recordist and licence, as the licences ask. */
export function creditsMarkdown(set: BirdSet, picks: Pick[]): string {
  const lines = picks.map((p) => `| ${p.species.en} | ${p.kind} | [XC${p.recording.id}](https://xeno-canto.org/${p.recording.id}) | ${p.recording.rec} | ${p.recording.cnt} | ${licenceLabel(p.recording.lic)} |`);
  return [
    `# ${set.title}: recordings`,
    "",
    "From xeno-canto.org, each under its own Creative Commons licence; trimmed to the first 20 seconds, in mono.",
    "",
    "| Bird | Sound | Recording | Recordist | Country | Licence |",
    "|---|---|---|---|---|---|",
    ...lines,
    "",
  ].join("\n");
}

// ------------------------------------------------------------------------------------------- the command

/** Asks for the key without echoing it. */
async function askKey(): Promise<string> {
  if (!process.stdin.isTTY) throw new Error("the xeno-canto API key is typed in: run this in a terminal");
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput;
  let asking = true;
  (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => {
    if (!asking) write.call(rl, s);
  };
  process.stdout.write("xeno-canto API key (from your account page; not shown, not saved): ");
  const key = await new Promise<string>((done) => rl.question("", done));
  asking = false;
  rl.close();
  process.stdout.write("\n");
  return key.trim();
}

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

/** The recordings xeno-canto has for a bird (all pages); the key never appears in an error. */
async function search(base: string, key: string, scientific: string): Promise<XcRecording[]> {
  for (const query of queriesFor(scientific)) {
    const all: XcRecording[] = [];
    for (let page = 1; page <= 5; page++) {
      const url = `${base}?query=${encodeURIComponent(query)}&page=${page}&key=${encodeURIComponent(key)}`;
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (response.status === 401 || response.status === 403) throw new Error("xeno-canto refused the key (check it on your account page)");
      if (!response.ok) {
        // A query form this API version does not take: try the next one.
        if (response.status === 400 && page === 1) break;
        throw new Error(`xeno-canto answered ${response.status} for ${scientific}`);
      }
      const body = (await response.json()) as { numPages?: number | string; recordings?: XcRecording[] };
      all.push(...(body.recordings ?? []));
      if (page >= Number(body.numPages ?? 1)) break;
      await wait(250);
    }
    if (all.length) return all;
  }
  return [];
}

function hasFfmpeg(): boolean {
  return spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
}

/** The first 20 seconds, mono, 64 kb/s MP3, with a one-second fade at the end. */
function trim(input: string, output: string): void {
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-i", input, "-t", String(CLIP_SECONDS), "-af", `afade=t=out:st=${CLIP_SECONDS - 1}:d=1`, "-ac", "1", "-ar", "32000", "-b:a", "64k", output],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  if (r.status !== 0) throw new Error(`ffmpeg could not trim ${basename(input)}: ${String(r.stderr).trim().slice(0, 300)}`);
}

export async function fetchSet(set: BirdSet, options: { out: string; key: string; base?: string; trimClips: boolean; dry: boolean; log?: (s: string) => void }): Promise<Pick[]> {
  const log = options.log ?? ((s: string) => console.log(s));
  const dir = join(options.out, set.set);
  const sounds = join(dir, "sounds");
  if (!options.dry) mkdirSync(sounds, { recursive: true });
  const picks: Pick[] = [];
  for (const species of set.species) {
    const recordings = await search(options.base ?? API, options.key, species.scientific);
    for (const kind of ["song", "call"] as const) {
      const recording = chooseRecording(recordings, species, kind, set.countries);
      if (!recording) {
        if (kind === "song") log(`  ${species.scientific}: no song to use${recordings.length ? "" : " (nothing found)"}`);
        continue;
      }
      picks.push({ species, kind, recording });
      log(`${options.dry ? "would take" : "taking"} ${species.en} (${kind}): XC${recording.id}, ${recording.cnt}, ${recording.q}, ${licenceLabel(recording.lic)}`);
      if (options.dry) continue;
      const target = join(sounds, `xc${recording.id}.mp3`);
      if (existsSync(target)) continue;
      const response = await fetch(recording.file);
      if (!response.ok) throw new Error(`download of XC${recording.id} failed: ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (options.trimClips) {
        const raw = join(sounds, `xc${recording.id}.download`);
        writeFileSync(raw, bytes);
        trim(raw, target);
        rmSync(raw);
      } else {
        writeFileSync(`${target}.part`, bytes);
        renameSync(`${target}.part`, target);
      }
      if (statSync(target).size > 4 * 1024 * 1024) {
        rmSync(target);
        picks.pop();
        log(`  XC${recording.id}: over 4 MB untrimmed, left out (install ffmpeg to keep it)`);
      }
      await wait(250);
    }
  }
  if (!options.dry) {
    const file = (p: Pick) => `sounds/xc${p.recording.id}.mp3`;
    writeFileSync(join(dir, "birds.json"), `${JSON.stringify(buildBook(set, picks, file), null, 1)}\n`);
    writeFileSync(join(dir, "CREDITS.md"), creditsMarkdown(set, picks));
  }
  return picks;
}

export function loadSet(name: string, root = resolve(fileURLToPath(new URL("..", import.meta.url)), "content", "birds")): BirdSet {
  const path = join(root, `${name}.json`);
  if (!existsSync(path)) throw new Error(`no bird list ${name} (europe, mediterranean, alps)`);
  return JSON.parse(readFileSync(path, "utf8")) as BirdSet;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const flag = (f: string) => args.includes(f);
  const outAt = args.indexOf("--out");
  const out = resolve(outAt >= 0 ? args[outAt + 1] ?? "data/birds" : "data/birds");
  const names = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--out");
  const sets = names.includes("all") ? ["europe", "mediterranean", "alps"] : names;
  if (!sets.length) {
    console.error("usage: npm run birds:fetch -- europe | mediterranean | alps | all [--out data/birds] [--no-trim] [--dry]");
    process.exit(2);
  }
  let trimClips = !flag("--no-trim");
  if (trimClips && !flag("--dry") && !hasFfmpeg()) {
    console.warn("ffmpeg not found: recordings kept whole (those over 4 MB left out). Install ffmpeg to trim them to 20 s.");
    trimClips = false;
  }
  const key = await askKey();
  if (!key) throw new Error("no key typed");
  for (const name of sets) {
    const set = loadSet(name);
    console.log(`${set.title}: ${set.species.length} birds`);
    const picks = await fetchSet(set, { out, key, trimClips, dry: flag("--dry") });
    const songs = picks.filter((p) => p.kind === "song").length;
    console.log(`${set.title}: ${songs} songs, ${picks.length - songs} calls${flag("--dry") ? "" : ` → ${join(out, set.set, "birds.json")}`}`);
  }
  if (!flag("--dry")) console.log(`Then: npm run vocab:import -- ${join(out, "<set>", "birds.json")}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
