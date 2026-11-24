# Birds: recognising sounds

Since 9.0.0 the home page has a **🎧 Sons** group: books of recordings to recognise, starting with birds. A
card plays a recording; the player says which bird it is. It runs on the vocabulary engine
([Vocabulary](vocabulary.md)): Leitner boxes, sessions, statistics and skipped cards work as for words.

- [The three bird books](#the-three-bird-books)
- [A card](#a-card)
- [Making the books: npm run birds:fetch](#making-the-books-npm-run-birdsfetch)
- [Licences and credits](#licences-and-credits)
- [The sound book format](#the-sound-book-format)
- [Checks](#checks)

## The three bird books

| Book | Id | List | Birds | Recordings from |
|---|---|---|---|---|
| Oiseaux d'Europe | `birds-europe` | `content/birds/europe.json` | 42 garden, park and woodland birds of Western Europe | France, Germany, the United Kingdom, Switzerland… first |
| Oiseaux de Méditerranée et des Baléares | `birds-mediterranean` | `content/birds/mediterranean.json` | 42, from the Balearic warbler to Scopoli's and Balearic shearwaters | Spain first, then France, Italy, Portugal… |
| Oiseaux de Suisse et des Alpes | `birds-alps` | `content/birds/alps.json` | 41, from the wallcreeper to the capercaillie | Switzerland first, then France, Italy, Austria… |

The lists hold names only: the scientific name, the English name (IOC World Bird List), the French (CINFO) and
the Spanish (SEO/BirdLife). A part in parentheses is optional in an answer: *(European) Robin* takes *robin*,
*Rougegorge (familier)* takes *rougegorge*. A bird in two lists (the nightingale, the raven) is in both books, with
its own progress in each.

The recordings are not in the project: they are fetched, each with its licence, onto the machine that runs
`npm run birds:fetch`, into `data/birds/`, and imported into the database like a vocabulary book.

## A card

- **The question is the recording.** It starts by itself when the card comes; **▶ Écouter** (or the key **R**) plays it again from the start, and the player's controls pause or move in it. Leaving the card or the page stops it.
- **The answer:** the bird's name. In the first boxes, four names to choose from (birds of the same book; a song among songs). From box 3, in mixed mode, the name is typed ([Leitner boxes](vocabulary.md#leitner-boxes)): in the interface's language, or in another of the app's languages, or the scientific name. *Erithacus rubecula*, *rougegorge*, *robin* and *petirrojo* are all right for the robin.
- **After the answer:** the scientific name, *chant* or *cri*, and the recording's credit (*Enregistrement : XC123456 · recordist · CC BY-NC-SA 4.0 · xeno-canto.org/123456*).
- **Songs first, calls later.** Each bird starts with its song. Its call joins the new cards once the song has reached box 3, that is once it has been named right in writing. A bird with no usable song (a gull, a shearwater, an owl whose recordings are all "call") starts with its call.
- Only one direction: a bird is recognised, never "produced". There is no reading in Latin letters to show.

## Making the books: npm run birds:fetch

```bash
npm run birds:fetch -- all                       # the three books
npm run birds:fetch -- mediterranean --dry       # what would be taken, nothing downloaded
npm run vocab:import -- data/birds/europe/birds.json
```

- **The key.** xeno-canto's API (version 3) needs a free key, on the account page of xeno-canto.org. The script asks for it and hides it as it is typed; it is never an argument, never written to a file, never printed.
- **The choice of a recording,** for each bird and each sound (song, then call), among what xeno-canto has for its scientific name:
  1. the right species and type, quality A or B, 5 seconds to 3 minutes;
  2. a Creative Commons licence that allows a trimmed copy (no *ND*);
  3. then quality A before B, no other species heard in the background, the book's countries in their order, a length near 30 seconds.
- **Trimming.** With `ffmpeg` installed, each recording is cut to its first 20 seconds, mono, 64 kb/s MP3, with a one-second fade: about 160 KB each. Without it (or with `--no-trim`), recordings are kept whole and those over 4 MB left out.
- **What it writes,** in `data/birds/<book>/`: `birds.json` (the sound book), `sounds/xc<id>.mp3`, and `CREDITS.md` (every recording, its recordist, country and licence). A recording already there is not fetched again: a run stopped midway goes on where it was.
- **Importing.** `npm run vocab:import -- data/birds/<book>/birds.json`, or name the files in `VOCAB_FILE` for the server to import them at start ([Vocabulary › Import](vocabulary.md)). A new book is the owner's only; share it from *⚙️ Paramètres › 📚 Contenus*. Importing again after a new fetch keeps the players' progress.
- **Size.** About 250 recordings for the three books, 40 MB in the database (base64).

The API documentation could not be read when the script was written (xeno-canto turns automated readers away):
the script tries the query `gen:<genus> sp:<species>`, then `sp:"<scientific name>"`, and does the filtering
itself from the fields every version has returned (`gen`, `sp`, `type`, `q`, `length`, `lic`, `cnt`, `also`,
`file`). If xeno-canto changes them, `--dry` shows what it finds before anything is downloaded.

## Licences and credits

Every xeno-canto recording keeps its recordist's Creative Commons licence, most often *BY-NC-SA*: attribution,
non-commercial use, the same licence for copies. Luma is a family app, not sold; trimming is a change the
licences without *ND* allow. The credit after each answer, and `CREDITS.md`, name the recordist, the licence and the
recording's page, as the licences ask. The recordings are never in the project or its zip.

## The sound book format

A vocabulary file of kind `"sounds"`; every entry has an `"audio"` path beside the file (MP3, Ogg, Opus, M4A
or WAV, at most 4 MB), and no other kind of book may have one.

```json
{
  "format": 2,
  "book": { "id": "birds-europe", "title": "Birds of Europe", "kind": "sounds", "term": "la", "meaning": "en",
            "credit": "Recordings from xeno-canto.org, each under its own Creative Commons licence…" },
  "lessons": [
    { "title": "Songs", "subtitle": "Chants · Cantos", "sections": [ { "title": "1–10", "entries": [
      { "term": "Erithacus rubecula", "meaning": "(European) Robin",
        "translations": { "fr": "Rougegorge (familier)", "es": "Petirrojo (europeo)" },
        "group": "song", "note": "XC123456 · Jane Doe · CC BY-NC-SA 4.0 · xeno-canto.org/123456",
        "audio": "sounds/xc123456.mp3" } ] } ] },
    { "title": "Calls", "subtitle": "Cris · Reclamos", "sections": [ { "title": "1–10", "entries": [
      { "term": "Erithacus rubecula (call)", "meaning": "(European) Robin", "group": "call", "audio": "sounds/xc234567.mp3" } ] } ] }
  ]
}
```

- `term`: the scientific name, `(call)` after it for a call (optional in an answer); `meaning` and `translations`: the names.
- `group`: `song` or `call`. A call waits for the song with the same `meaning` in the same book.
- The import stores each recording once, by its SHA-256, in `vocab_sounds` (migration `040_vocab_sounds`), and the hash in the entry's `audio`. A recording no entry uses any more is removed. `GET /api/vocab/sounds/:hash` serves it to an account that sees the book ([API](api.md)).
- `npm run vocab:export -- birds-europe` writes the recordings beside the file, in `sounds/`: the book imports again as it was.

Any other sounds can be made into such a book by hand: a list of recordings, their names, the files beside it.

## Checks

`npm run check:birds` (in CI): the three lists (binomials, each bird once, brackets closed, an optional part
accepted), licences and types, the choice of a recording among invented ones, the whole fetch against a fake
xeno-canto (a refused query form, the key never logged, the book and credits written, the recordings read back),
the format's rules, and a session where a call waits for its song. The e2e tests use an invented sound book
(tones, invented birds) in `tests/e2e/fixtures/vocab-sounds/`.
