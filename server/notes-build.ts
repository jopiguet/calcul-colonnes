/**
 * Makes the two note books (docs/notes.md) in content/notes/: every sound synthesized here (a piano-like
 * tone, no recording, no licence), every staff drawn here (the clefs' outlines from Noto Music, SIL OFL).
 *
 *   npm run notes:build
 *
 * Writes ear.json (Notes à l'oreille: hear, then name) and staff.json (Notes sur la portée: see, name, then
 * hear), the sounds in sounds/ (MP3, with ffmpeg) and the staves in staff/ (PNG, with rsvg-convert). The
 * server imports both books at start, shared with every account, whenever they change.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const NOTES_DIR = resolve(fileURLToPath(new URL("..", import.meta.url)), "content", "notes");

/** The seven letters, their place in the octave (semitones above C) and their names. */
export const NATURALS = [
  { letter: "C", semitone: 0, fr: "do", es: "do" },
  { letter: "D", semitone: 2, fr: "ré", es: "re" },
  { letter: "E", semitone: 4, fr: "mi", es: "mi" },
  { letter: "F", semitone: 5, fr: "fa", es: "fa" },
  { letter: "G", semitone: 7, fr: "sol", es: "sol" },
  { letter: "A", semitone: 9, fr: "la", es: "la" },
  { letter: "B", semitone: 11, fr: "si", es: "si" },
] as const;

/** A note's frequency in equal temperament, A4 = 440 Hz; octave as in scientific pitch (C4 is middle C). */
export const frequency = (semitone: number, octave: number): number => 440 * 2 ** ((semitone - 9 + (octave - 4) * 12) / 12);

/** The black keys between two letters, named both ways: "C sharp / D flat". */
export const SHARPS = [0, 1, 3, 4, 5].map((i) => {
  const low = NATURALS[i]!;
  const high = NATURALS[i + 1]!;
  return {
    semitone: low.semitone + 1,
    term: `${low.letter}♯/${high.letter}♭`,
    en: `${low.letter} sharp / ${high.letter} flat`,
    fr: `${low.fr} dièse / ${high.fr} bémol`,
    es: `${low.es} sostenido / ${high.es} bemol`,
    file: `${low.letter.toLowerCase()}s`,
  };
});

// ------------------------------------------------------------------------------------------- sound

const RATE = 44100;

/**
 * A piano-like tone: eight partials, slightly stretched (a real string's stiffness), each dying away faster than
 * the one below; a 5 ms attack and a short fade at the end.
 */
export function tone(freq: number, seconds: number): Float32Array {
  const n = Math.round(seconds * RATE);
  const out = new Float32Array(n);
  for (let k = 1; k <= 8; k++) {
    const f = freq * k * Math.sqrt(1 + 0.0004 * k * k);
    if (f > RATE / 2.2) break;
    const amp = 1 / k ** 1.3;
    const decay = 1.1 + 0.7 * k;
    for (let i = 0; i < n; i++) {
      const t = i / RATE;
      out[i] = out[i]! + amp * Math.exp(-decay * t) * Math.sin(2 * Math.PI * f * t);
    }
  }
  const attack = Math.round(0.005 * RATE);
  const release = Math.round(0.15 * RATE);
  for (let i = 0; i < n; i++) {
    const a = Math.min(1, i / attack) * Math.min(1, (n - i) / release);
    out[i] = out[i]! * a;
  }
  return out;
}

/** Sounds one after another, with silences between: [a tone, a pause in seconds, a tone…]. */
export function sequence(parts: (Float32Array | number)[]): Float32Array {
  const pieces = parts.map((p) => (typeof p === "number" ? new Float32Array(Math.round(p * RATE)) : p));
  const out = new Float32Array(pieces.reduce((sum, p) => sum + p.length, 0));
  let at = 0;
  for (const p of pieces) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** 16-bit mono WAV, its loudest point at 80 % of full scale. */
export function wav(samples: Float32Array): Buffer {
  const peak = samples.reduce((m, s) => Math.max(m, Math.abs(s)), 0) || 1;
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + samples.length * 2, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(RATE, 24);
  b.writeUInt32LE(RATE * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) b.writeInt16LE(Math.round((samples[i]! / peak) * 0.8 * 32767), 44 + i * 2);
  return b;
}

function mp3(samples: Float32Array, path: string, scratch: string): void {
  const input = join(scratch, "tone.wav");
  writeFileSync(input, wav(samples));
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", input, "-ac", "1", "-b:a", "96k", "-map_metadata", "-1", "-id3v2_version", "0", "-write_xing", "0", path]);
  if (r.status !== 0) throw new Error(`ffmpeg: ${String(r.stderr)}`);
}

// ------------------------------------------------------------------------------------------- staff

interface Clef {
  d: string;
  bounds: [number, number, number, number];
}

/** A note's step on the staff: C4 is 28 (7 letters × 4 octaves), D4 29… */
export const step = (letterIndex: number, octave: number): number => octave * 7 + letterIndex;

/** The bottom line of each staff: E4 for the treble clef, G2 for the bass clef. */
export const BOTTOM = { treble: step(2, 4), bass: step(4, 2) } as const;

/**
 * One note on a staff, as SVG: five lines, the clef, a whole note, and the ledger lines it needs. The staff
 * space is 14 px; the picture is 300 × 170 px (drawn at twice that size by rsvg-convert).
 */
export function staffSvg(clefName: "treble" | "bass", clef: Clef, noteStep: number): string {
  const space = 14;
  const width = 300;
  const height = 170;
  const bottomY = 112;
  const left = 16;
  const right = width - 16;
  const lineY = (i: number) => bottomY - i * space;
  const yOf = (s: number) => bottomY - ((s - BOTTOM[clefName]) * space) / 2;
  const lines = [0, 1, 2, 3, 4].map((i) => `<line x1="${left}" x2="${right}" y1="${lineY(i)}" y2="${lineY(i)}"/>`);
  const noteX = 196;
  const ledgers: string[] = [];
  for (let s = BOTTOM[clefName] - 2; s >= noteStep; s -= 2) ledgers.push(`<line x1="${noteX - 17}" x2="${noteX + 17}" y1="${yOf(s)}" y2="${yOf(s)}"/>`);
  for (let s = BOTTOM[clefName] + 10; s <= noteStep; s += 2) ledgers.push(`<line x1="${noteX - 17}" x2="${noteX + 17}" y1="${yOf(s)}" y2="${yOf(s)}"/>`);
  // The clef's outline: font units (250 to a staff space, y up, origin on the bottom line) to pixels.
  const scale = space / 250;
  const clefSvg = `<path transform="translate(${left + 8} ${bottomY}) scale(${scale} ${-scale})" d="${clef.d}"/>`;
  // A whole note: an open oval, slightly tilted.
  const y = yOf(noteStep);
  const note = `<g transform="translate(${noteX} ${y}) rotate(-20)"><ellipse rx="10.5" ry="7.2" fill="#111"/><ellipse rx="5.4" ry="3.6" transform="rotate(-35)" fill="#fff"/></g>`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="#fff"/>`,
    `<g stroke="#111" stroke-width="1.4">${lines.join("")}${ledgers.join("")}</g>`,
    `<g fill="#111">${clefSvg}</g>`,
    note,
    "</svg>",
  ].join("");
}

function png(svg: string, path: string, scratch: string): void {
  const input = join(scratch, "staff.svg");
  writeFileSync(input, svg);
  const r = spawnSync("rsvg-convert", ["-z", "2", "-o", path, input]);
  if (r.status !== 0) throw new Error(`rsvg-convert: ${String(r.stderr)}`);
}

// ------------------------------------------------------------------------------------------- books

const names = (n: { en: string; fr: string; es: string }) => ({ meaning: n.en, translations: { fr: n.fr, es: n.es } });
const natural = (i: number) => ({ en: NATURALS[i]!.letter, fr: NATURALS[i]!.fr, es: NATURALS[i]!.es });

export function build(dir = NOTES_DIR): { ear: number; staff: number } {
  const scratch = mkdtempSync(join(tmpdir(), "luma-notes-"));
  mkdirSync(join(dir, "sounds"), { recursive: true });
  mkdirSync(join(dir, "staff"), { recursive: true });
  const reference = () => tone(frequency(0, 4), 0.9);
  try {
    // ---- by ear: do first, then the note; the black keys; then the note alone.
    const withRef = [...NATURALS.map((_, i) => ({ i, octave: 4 })), { i: 0, octave: 5 }].map(({ i, octave }) => {
      const n = NATURALS[i]!;
      const file = `sounds/ref-${n.letter.toLowerCase()}${octave}.mp3`;
      mp3(sequence([reference(), 0.35, tone(frequency(n.semitone, octave), 1.6)]), join(dir, file), scratch);
      return { term: `${n.letter}${octave}`, ...names(natural(i)), group: "reference", audio: file };
    });
    const sharps = SHARPS.map((s) => {
      const file = `sounds/ref-${s.file}4.mp3`;
      mp3(sequence([reference(), 0.35, tone(frequency(s.semitone, 4), 1.6)]), join(dir, file), scratch);
      return { term: `${s.term}4`, ...names(s), group: "reference", audio: file };
    });
    const alone = NATURALS.map((n, i) => {
      const file = `sounds/${n.letter.toLowerCase()}4.mp3`;
      mp3(tone(frequency(n.semitone, 4), 1.8), join(dir, file), scratch);
      return { term: `${n.letter}4`, ...names(natural(i)), group: "alone", note: `${frequency(n.semitone, 4).toFixed(1)} Hz`, audio: file };
    });
    const ear = {
      format: 2,
      book: { id: "notes-ear", title: "Notes by ear", kind: "sounds", term: "en", meaning: "en", credit: "Sounds synthesized for Luma (equal temperament, A4 = 440 Hz)" },
      lessons: [
        { title: "With C as a reference", subtitle: "Avec do pour repère · Con do como referencia", sections: [{ title: "C D E F G A B C", entries: withRef }] },
        { title: "Sharps and flats", subtitle: "Dièses et bémols · Sostenidos y bemoles", sections: [{ title: "♯ ♭", entries: sharps }] },
        { title: "Without a reference", subtitle: "Sans repère · Sin referencia", sections: [{ title: "C D E F G A B", entries: alone }] },
      ],
    };
    writeFileSync(join(dir, "ear.json"), `${JSON.stringify(ear, null, 1)}\n`);

    // ---- on the staff: treble C4 to A5, bass E2 to C4; the note heard once answered.
    const clefs = JSON.parse(readFileSync(join(dir, "clefs.json"), "utf8")) as Record<"treble" | "bass", Clef>;
    const staffEntries = (clefName: "treble" | "bass", from: [number, number], to: [number, number]) => {
      const out: Record<string, unknown>[] = [];
      for (let s = step(...from); s <= step(...to); s++) {
        const i = s % 7;
        const octave = Math.floor(s / 7);
        const n = NATURALS[i]!;
        const base = `${clefName}-${n.letter.toLowerCase()}${octave}`;
        png(staffSvg(clefName, clefs[clefName], s), join(dir, "staff", `${base}.png`), scratch);
        mp3(tone(frequency(n.semitone, octave), 1.6), join(dir, "sounds", `${base}.mp3`), scratch);
        out.push({ term: `${n.letter}${octave}`, ...names(natural(i)), group: clefName, image: `staff/${base}.png`, audio: `sounds/${base}.mp3` });
      }
      return out;
    };
    const treble = staffEntries("treble", [0, 4], [5, 5]);
    const bass = staffEntries("bass", [2, 2], [0, 4]);
    const staff = {
      format: 2,
      book: { id: "notes-staff", title: "Notes on the staff", kind: "sounds", term: "en", meaning: "en", credit: "Staves drawn and sounds synthesized for Luma; clefs from Noto Music (SIL OFL)" },
      lessons: [
        { title: "Treble clef", subtitle: "Clé de sol · Clave de sol", sections: [{ title: "C4–A5", entries: treble }] },
        { title: "Bass clef", subtitle: "Clé de fa · Clave de fa", sections: [{ title: "E2–C4", entries: bass }] },
      ],
    };
    writeFileSync(join(dir, "staff.json"), `${JSON.stringify(staff, null, 1)}\n`);
    return { ear: withRef.length + sharps.length + alone.length, staff: treble.length + bass.length };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const made = build();
  console.log(`notes: ${made.ear} sounds by ear, ${made.staff} notes on the staff → ${NOTES_DIR}`);
}
