# Vocabulary

The *💬 Vocabulaire* tab teaches Spanish vocabulary from a phrase book:
its chapters are the lessons and its sections the sections. Words are asked
as multiple choice and as written answers, and come back on a spaced
repetition schedule (Leitner boxes).

- [Content and copyright](#content-and-copyright)
- [Importing a book](#importing-a-book)
- [The file format](#the-file-format)
- [The learning method](#the-learning-method)
- [How answers are graded](#how-answers-are-graded)
- [Code](#code)

## Content and copyright

The app contains **no vocabulary of its own**. The words come from a book you
own, and stay in your database:

- **Extraction:** `tools/vocab-extract.py` reads your copy of the PDF and writes a JSON file to `data/`, which is ignored by version control.
- **Storage:** the import puts the entries in your database (SQLite or Neon). They are never part of the project, a build or a release.
- **Access:** keep the app behind its sign-in, and set `REGISTRATION=closed` if the server is reachable from the internet. Only your accounts then see the content.

The tests use an invented vocabulary of 27 entries
(`tests/e2e/fixtures/vocab.json`).

## Importing a book

The extractor reads the layout of the Collins *3000 words and phrases* series:

| In the book | In the app |
|---|---|
| Chapter (picture page, "TRANSPORT \| LOS MEDIOS DE TRANSPORTE") | Lesson; the picture's labels become its first section |
| Banner ("CAR \| EL COCHE") | Section |
| Small heading ("VOCABULARY", "INTERIOR") | Group, shown as a hint and used to choose similar wrong options |
| English in the regular font, Spanish in bold below | Entry |

For the Spanish edition this gives 10 lessons, 111 sections and 3,214
entries.

```sh
pip install pdfplumber
python3 tools/vocab-extract.py "Collins Spanish 3000.pdf" > data/vocab.json
npm run check:vocab -- data/vocab.json   # optional: every entry can be asked and graded
npm run vocab:import -- data/vocab.json  # into the database of .env
```

The extractor prints how many lessons, sections and entries it found, and how
many blocks it could not pair (notes, captions). It uses fonts and positions
only, so other languages of the same series should work, but the app's
grading and screens are written for Spanish.

**Importing again** (after a new extraction, or a corrected file) keeps every
player's progress on the entries that did not change. An entry is the same
when it is in the same lesson and section, with the same English and Spanish
text. Entries no longer in the file are removed, with their progress. The
import runs in one transaction.

**Instead of the command,** set `VOCAB_FILE=data/vocab.json` in `.env`. The
server imports it at startup when the vocabulary is empty, so once.

## The file format

```json
{
  "format": 1,
  "languages": ["en", "es"],
  "lessons": [
    {
      "title": { "en": "At school", "es": "En el colegio" },
      "sections": [
        {
          "title": { "en": "The classroom", "es": "El aula" },
          "entries": [
            { "en": "pencil", "es": "el lápiz", "group": "Things" },
            { "en": "teacher", "es": "el profesor / la profesora" },
            { "en": "water", "es": "el agua", "feminine": true }
          ]
        }
      ]
    }
  ]
}
```

| Field | |
|---|---|
| `en`, `es` | As printed: alternatives with `/`, optional parts in brackets, `...` for an open end |
| `group` | Optional heading inside the section |
| `feminine` | Optional: a feminine noun taking *el* (`el agua`), shown as *f* |

A file you write by hand works the same way, for a class list of words, say.
`shared/vocab/format.ts` validates it and reports the place of the first
problem.

## The learning method

**Two directions per entry.** Each one has its own box:

| Card | Shown | Asked |
|---|---|---|
| Recognise | *la llave* | its meaning: *key* |
| Recall | *key* | the Spanish: *la llave* |

Recall starts once recognition has reached box 2: producing a word comes
after recognising it.

**Leitner boxes.** A right answer moves the card up one box, and the wait
before its next review grows:

| Box | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Next review | 10 min | 1 day | 3 days | 7 days | 16 days | 35 days |

A wrong answer sends the card back to box 1. It is also asked again at the end
of the same session, once. A word is *known* when both its cards are in box 4
or above, and *mastered* when both are in box 6.

**Answering ahead of time.** A card answered right before its review is due
stays in its box, with its date unchanged. This covers reviewing early and the
repeat of a mistake in the same session: being right a few minutes after
seeing the answer says little about memory, and practising a lot on one
evening must not push words to 35 days. A wrong answer ahead of time still
sends the card back to box 1, since that is real information.

**Sessions.** 15, 30 or 50 cards (*Cartes par séance*). Three kinds, each on a
section, a whole lesson or the whole vocabulary:

| Session | Button | Cards |
|---|---|---|
| Learn | *Apprendre*, *Continuer* (section); *Apprendre la leçon* | 1. cards due, oldest first; 2. recall cards that just became available; 3. new entries in the book's order, at most 8 |
| Review | *Réviser* (section); *Réviser la leçon*; *Réviser tout le vocabulaire* | Only cards already started, due or not: those due first, then the weakest (lowest box), then those unseen for the longest time. No new entries. |
| Due | *Réviser maintenant* | Only the cards due, across every lesson |

The cards chosen are then shuffled together. *Due* is the daily routine;
*Review* is for going over a chapter before a test, or over everything learnt
so far.

**Multiple choice or written.** The *Questions* setting:

| Setting | Asks |
|---|---|
| *Mélangé* (default) | Multiple choice in boxes 1–2, written from box 3: recognition first, then production |
| *Choix multiples* | Always multiple choice |
| *Écrit* | Always written |

Answers longer than four words (whole phrases) are always multiple choice:
typing them exactly would test typing more than vocabulary. That is 112 of
the 3,214 entries of the Spanish edition.

**Wrong options** for multiple choice come from the same group, then the same
section, then the same lesson, preferring answers of similar length. They
never read like the right answer, or like each other.

## How answers are graded

The grading is in `shared/vocab/grade.ts`. The server's verdict is what is
recorded. Case, punctuation (`¿ ? ¡ ! . ,`) and spacing are ignored.

| Verdict | When | Counts as |
|---|---|---|
| right | Exact | right |
| accent | Right letters, missing or wrong accent or tilde (*el lapiz*, *el nino*) | right, with the spelling shown |
| typo | One letter off, in a word of at least 5 letters | right, with the spelling shown |
| article | Right word, missing or wrong article (*lápiz*, *la lápiz*) | **wrong**: the gender is part of the word |
| wrong | Anything else | wrong |

**What the book's notation accepts:**

| Printed | Accepted |
|---|---|
| `el amigo / la amiga` | either, or both as printed |
| `Buenas tardes / noches.` | *buenas tardes*, *buenas noches* |
| `Este / Esta es mi...` | *este es mi*, *esta es mi* |
| `to take his/her pulse` | *to take his pulse*, *to take her pulse* |
| `step-/half-brother` | *step-brother*, *half-brother* |
| `¿Cómo está (él / ella)?` | with or without the bracketed part |
| `embarcar(se)` | *embarcar*, *embarcarse* |

In English answers, *the*, *a*, *an* and *to* are optional: *key*, *the key*;
*walk*, *to walk*.

A multiple-choice answer is compared with the option as printed.

`npm run check:vocab` runs 44 grading cases and the scheduling rules. With a
file, it also checks that every entry is accepted when typed as printed, in
both directions.

## Code

| File | Role |
|---|---|
| `tools/vocab-extract.py` | PDF → JSON |
| `shared/vocab/format.ts` | File format and its validation |
| `shared/vocab/grade.ts` | Grading of written answers |
| `shared/vocab/schedule.ts` | Boxes, intervals, how a card is asked |
| `shared/vocab/session.ts` | Choice of cards and wrong options |
| `server/vocab.ts` | Storage, import, sessions, answers; the `/api/vocab` routes |
| `server/vocab-import.ts` | `npm run vocab:import` |
| `server/check-vocab.ts` | `npm run check:vocab` |
| `src/vocab.ts`, `src/vocab-i18n.ts` | The tab: lessons, cards, summary; texts in three languages |
| `tests/e2e/vocab.spec.ts` | Browser tests, on the invented fixture |

To change the intervals, the number of new words per session or when written
answers start, edit the constants in `shared/vocab/schedule.ts`. They apply
from the next answer, and existing boxes stay as they are.
