# Notes: reading and hearing music

Since 9.1.0 the **🎧 Sons** group has two books of musical notes, built into the app and shared with every
account: one to name a note heard, one to name a note read on a staff. They run on the vocabulary engine, as
the birds do ([Birds](birds.md), [Vocabulary](vocabulary.md)): Leitner boxes, sessions, statistics.

- [The two books](#the-two-books)
- [Names in three languages](#names-in-three-languages)
- [The sounds and the staves](#the-sounds-and-the-staves)
- [Building them: npm run notes:build](#building-them-npm-run-notesbuild)
- [Checks](#checks)

## The two books

**Notes à l'oreille** (`notes-ear`, 20 cards): the sound is the question.

| Lesson | Cards | What is heard |
|---|---|---|
| Avec do pour repère | C4 D4 E4 F4 G4 A4 B4 C5 | middle C, a short silence, then the note: the note is found from its distance to C |
| Dièses et bémols | C♯/D♭4 D♯/E♭4 F♯/G♭4 G♯/A♭4 A♯/B♭4 | middle C, then a black key |
| Sans repère | C4 to B4 | the note alone: absolute pitch, the hardest |

**Notes sur la portée** (`notes-staff`, 26 cards): the staff is the question, the note is heard once answered.

| Lesson | Cards |
|---|---|
| Clé de sol | C4 (one ledger line below) to A5 (one above) |
| Clé de fa | E2 (one ledger line below) to C4 (one above) |

After the answer: the note in scientific pitch notation (*C4* is middle C, *A4* is 440 Hz), and *clé de sol*,
*clé de fa*, *après do* or *sans repère*. French and Spanish teaching often number the octaves one lower
(middle C is *do3*): the pitch shown is only a reminder, the answer is the name.

## Names in three languages

| English | French | Spanish |
|---|---|---|
| C D E F G A B | do ré mi fa sol la si | do re mi fa sol la si |
| C sharp / D flat | do dièse / ré bémol | do sostenido / re bemol |

- The choices are in the interface's language. A typed answer (from box 3) may be in any of the three: *ré*, *re* and *D* are all right for D; the accent may be left out.
- A black key has two names, and either is right. It may also be typed with a sign: *C#*, *C♯*, *Db*, *D♭*, *do#*, *ré♭*. *C#* is not *C*.

## The sounds and the staves

- **Sounds:** synthesized by the build, not recorded: eight partials of a slightly stretched harmonic series, each dying away faster than the one below, a 5 ms attack, as a piano string would; equal temperament, A4 = 440 Hz. MP3, mono, 96 kb/s, 1.6 to 2.9 s. No recording, no licence.
- **Staves:** drawn by the build as SVG (five lines, the clef, a whole note, its ledger lines) and rendered to PNG at twice their size by `rsvg-convert`. The clefs' outlines are Noto Music's (Copyright The Noto Project Authors, SIL Open Font License 1.1), kept in `content/notes/clefs.json` with the licence in `content/notes/OFL.txt`; Noto Music places them on the bottom staff line, 250 font units to a staff space.
- **Import:** the server imports `content/notes/ear.json` and `staff.json` at start, with their pictures and sounds, whenever they change (their hash in `app_settings`), and shares them with every account (`server/notes.ts`). `build:server` copies `content/notes` beside the bundle (`dist-server/content/notes`), as it does the courses, for the image; the server never imports the build script. They take about 1.5 MB in the database.

## Building them: npm run notes:build

```bash
npm run notes:build
```

Needs `ffmpeg` and `rsvg-convert`. Writes `content/notes/ear.json`, `staff.json`, `sounds/*.mp3` and
`staff/*.png`, committed with the project (everything in them is made here). Changing a sound, a range or a
name means changing `server/notes-build.ts` and building again; the next start imports the books again and
keeps the players' progress.

## Checks

`npm run check:notes` (in CI): the committed books read and import (every picture and sound there, each pitch
once per group, every name in French and Spanish), the names and the black keys in the three languages, the
pitches (A4 = 440 Hz, C4 = 261.63 Hz), the ledger lines on both staves, and the sharps and flats an answer may
type. `notes.spec.ts`: both books in the Sons group for every account, a card of each (the sound or the staff as
the question), and *C#*, *Db*, *do#* and *ré bémol* for a black key.
