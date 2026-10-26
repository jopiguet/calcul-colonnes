# Workbook exercises

*✏️ Exercices des livres* (6.29.0): the exercises of the workbooks you own
(the Cambridge *in Use* series), filled in on the book's own pages, and
corrected against the book's key at the end of each unit.

An exercise is shown as the book prints it: the page, cropped to the
exercise, with a field on every dotted line. Items without a line (circle the
right word, match, rewrite) get a field under the page. Answers are kept as
they are typed; the correction comes when the player asks for it, for the
whole unit: each item right or wrong, the key's answer next to it, and the
score. The key cannot foresee every good answer, so the player may mark an
answer as right himself (*J'avais juste*); free answers (*Over to you*,
*Example answers*) are shown with the key's example and marked by the player.

The books' pages and keys are not in the project. They are extracted from
your PDF by a script, into `data/` (never committed, never shipped), and
imported into the database. Like the question bank, a book is the owner's
account only until the owner shares it (*Compte › Famille et amis › Ce que voient
les autres comptes*).

| File | Content |
|---|---|
| `tools/exercises-extract.py` | PDF → exercise book: units, exercises, gaps, key |
| `shared/exercises/format.ts` | The book file's format, `parseExerciseBook` |
| `shared/exercises/grade.ts` | Marking an answer against the key (`markItem`, `markExercise`) |
| `shared/exercises/api.ts` | What the routes send |
| `server/exercises.ts` | `ExerciseStore`: import, units, drafts, correction, overrides, images; the routes |
| `server/exercises-import.ts` | `npm run exercises:import` |
| `server/check-exercises.ts` | `npm run check:exercises` |
| `src/workbook.ts`, `src/workbook-i18n.ts` | The book's page and the unit's page |
| `tests/e2e/workbook.spec.ts`, `tests/e2e/fixtures/exercise-book/` | Browser tests, on an invented workbook (`make-exercise-book.py`) |

## Making a book

On the computer that has the PDFs (Python 3.10 or later):

```sh
python3 -m pip install pymupdf opencv-python-headless pillow pytesseract
# for the scanned books only (the two Idioms in Use): Tesseract
brew install tesseract            # macOS; Debian/Ubuntu: sudo apt install tesseract-ocr

python3 tools/exercises-extract.py grammar-in-use-5 "Raymond_Murphy_-_English_Grammar_in_Use_5th_Edition_2.pdf" --report
npm run exercises:import -- data/exercises/grammar-in-use-5
```

All eight at once, the PDFs in `~/Books` (the two scans take about ten
minutes each the first time):

```sh
x() { python3 tools/exercises-extract.py "$1" ~/Books/"$2" && npm run -s exercises:import -- "data/exercises/$1"; }
x grammar-in-use-5                     Raymond_Murphy_-_English_Grammar_in_Use_5th_Edition_2.pdf
x vocabulary-in-use-elementary         Vocabulary_in_Use_Elementary_3rd_edition.pdf
x vocabulary-in-use-pre-intermediate   English_Vocabulary_in_Use_Pre_Intermediate.pdf
x vocabulary-in-use-upper-intermediate English_Vocabulary_in_Use_Upper_Intermediate.pdf
x vocabulary-in-use-advanced           English_Vocabulary_in_Use_Advanced.pdf
x academic-vocabulary-in-use           Academic_Vocabulary_in_Use_Edition_With_Answers_by_Michael_McCarthy.pdf
x idioms-in-use-intermediate           English_Idioms_in_Use_Intermediate.pdf
x idioms-in-use-advanced               English_Idioms_in_USE_Advanced.pdf
```

With `DATABASE_URL` in `.env`, the import goes to Neon; each book is then
shared or not from the account page.

The first argument is the book's profile; the script knows these:

| Profile | Book | PDF | Exercises (6.29.0) |
|---|---|---|---|
| `grammar-in-use-5` | Murphy, *English Grammar in Use*, 5th edition | text | 566 in 145 units |
| `vocabulary-in-use-elementary` | *Vocabulary in Use Elementary*, 3rd edition | text over page images | 287 in 60 units |
| `vocabulary-in-use-pre-intermediate` | *English Vocabulary in Use Pre-intermediate and Intermediate* | text over page images | 457 in 99 units |
| `vocabulary-in-use-upper-intermediate` | *English Vocabulary in Use Upper-intermediate* | text over page images | 438 in 101 units |
| `vocabulary-in-use-advanced` | *English Vocabulary in Use Advanced*, 3rd edition | text | 413 in 101 units |
| `academic-vocabulary-in-use` | McCarthy and O'Dell, *Academic Vocabulary in Use* | text | 214 in 51 units |
| `idioms-in-use-intermediate` | *English Idioms in Use Intermediate* | scan (OCR) | 224 in 56 units |
| `idioms-in-use-advanced` | *English Idioms in Use Advanced* | scan (OCR) | 240 in 60 units |
| `grammar-in-use-intermediate` | Murphy, *Grammar in Use Intermediate* (an older edition) | scan (OCR) | not usable: see below |

A profile holds the pages of the exercises and of the key, for these PDFs;
another printing of a book may need them changed (`exercise_pages`,
`key_pages`, 0-based, at the top of the script).

Scanned books are read by Tesseract, about two seconds a page on two cores; the result is
cached in `data/exercises/<book>/ocr/`, so a second run takes a minute. To
run the OCR alone, in parts: `--ocr-only --pages 0-99`.

`--report` lists the exercises of the key not found on the pages, and those
found without a key. A run prints, per book, how many items get a field on
the page; `npm run check:exercises -- data/exercises/<book>` then types each
item's key back and checks that the marking takes it.

*Grammar in Use Intermediate* is a scan whose exercise numbers stand in grey
bars that Tesseract does not read, and its key is in three columns of small
print: only a few exercises come out. Its content is that of the 5th
edition, which extracts completely.

## How a book is extracted

Three kinds of PDF:

- **vector** (Grammar in Use 5, Vocabulary Advanced, Academic Vocabulary):
  text with positions; the dotted lines are dashed vector lines, read
  exactly; the empty boxes of matching exercises become fields too.
- **background** (the three other Vocabulary books): text over an image of
  each page that holds the dotted lines: thin rows of dots are found in that
  image.
- **scan** (the Idioms books): words and positions from Tesseract; dotted
  lines are rows of small dots in the scan.

Then, for every page:

1. **Exercises:** an id (`9.4`) at the left margin starts an exercise; it ends
   where the next one starts, or at the foot of the page. OCR slips (`I2.l`,
   `2.4` on a page of unit 32) are corrected from the key and the page's unit.
2. **Items:** a number starting a line is an item; a dotted line belongs to
   the nearest item number above it, or to its left (pictures side by side,
   two columns), or to a number written just before it in a text (`(3) …`,
   `¹w …`).
3. **The key**, read from its pages column by column: an id starts an
   exercise, a number an item; a line without one continues the item above
   at its indent. Lettered answers (`a covers b is covered`) become items
   `2a`, `2b`. *Possible answers*, *Example answers*, *Your own answers* make
   the exercise free.
4. **The image:** the exercise's part of the page, about 1000 pixels wide, in
   WebP: about 25 kB. The eight books take about 70 MB, 95 MB once in the
   database (as base64 text, which both engines store alike).

The item 1 of many exercises is the book's worked example: its line is
already filled in, the key starts at 2, so it gets no field.

## The file

`data/exercises/<book>/book.json` and its images:

```json
{
  "format": 1,
  "book": { "id": "grammar-in-use-5", "title": "…", "source": "Grammar in Use", "level": "B1–B2", "kind": "grammar", "language": "en" },
  "units": [{ "n": 9, "title": "Present perfect continuous" }],
  "exercises": [{
    "id": "9.4", "unit": 9, "page": 31, "instruction": "Put the verb into …",
    "image": "9.4.webp", "width": 1000, "height": 640,
    "open": false, "note": "", "keyText": "",
    "items": [{ "n": "2", "answer": "I’ve been looking / I have been looking", "gaps": [[0.21, 0.29, 0.31]] }]
  }]
}
```

A gap is `[x, y, w]`: its left end, its line and its width, as fractions of
the image. Importing a book again updates its exercises in place: the
players' answers stay; an exercise no longer in the file goes, with its
answers.

## Marking

`shared/exercises/grade.ts` reads the key as the books print it:

| Key | Accepted |
|---|---|
| `I’ve been looking / I have been looking` | either |
| `ill/unwell` | either word |
| `saving (money)` | with or without the short bracket |
| `f (it means a person who …)` | `f`: a long bracket is a comment |
| `fell … hurt` | the two parts in the item's two fields, in order |
| `Pasta; pizza (in either order)` | the parts in any order |
| `… watching television` | the end as printed, the beginning as typed |
| `I usually have …` | the beginning, then anything |
| `b`, `a and c are true` | the letters, in any order and form (`c, a`) |
| `–` | nothing in the gap |
| `weighing` (its first letter printed) | `weighing` or `eighing` |

Answers are compared without case, punctuation or the kind of apostrophe.
Typing the whole answer of an item with several fields into the first one is
right too. Anything else is wrong: the correction shows the key, and the
player may mark his answer as right (*J'avais juste*); that mark holds until
the answer changes. An exercise's score is its items right out of those
marked; free items count once the player marks them.

`npm run check:exercises` runs invented cases of each rule; with a book's
folder, it also types every item's key back (the first spelling of its first
alternative) and expects it right: under 1 % may fail (keys with a
comment the rules cannot tell from an answer).

## Routes

All under `/api/exercises`, for a player of the session's account
(`userId`), on a book the account sees:

| Route | Does |
|---|---|
| `GET /books?userId=` | The books, with the player's progress |
| `GET /books/:book?userId=` | The book's units, each with its exercises corrected and score |
| `GET /books/:book/units/:n?userId=` | The unit's exercises: image address, items and gaps, the player's answers; the key only for an exercise corrected |
| `GET /image/:book/:exercise?v=` | The image; `v` is the book's revision, so it is kept a year (`immutable`) |
| `PUT /answers` | `{userId, book, exercise, answers}`: a draft, saved as typed (`answers`: `{"4": ["fell", "hurt"]}`) |
| `POST /check` | `{userId, book, unit, answers}`: corrects every exercise of the unit, returns the unit |
| `PUT /override` | `{userId, book, exercise, item, right}`: the player's mark; `null` gives the item back to the key |
| `DELETE /answers?userId=&book=&unit=` | Starts the unit again |

The owner shares a book with `PUT /api/admin/exercise-books/:id`
(`{"visibility": "shared"}`). At startup, `EXERCISE_BOOKS` (folders,
comma-separated) imports the books not yet on the server: the tests use it
for their invented book.
