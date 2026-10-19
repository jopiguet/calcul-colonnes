# Vocabulary

The *Langues* part of the home page holds one activity per vocabulary book
imported on the server. Each book's chapters are its lessons, its sections the
sections. Words are asked as multiple choice and as written answers, and come
back on a spaced repetition schedule (Leitner boxes).

Two kinds of book are supported:

| Kind | Example | A card shows | and asks |
|---|---|---|---|
| translation | Collins *Spanish 3000 words and phrases* | *la llave* | its meaning: *key* |
| | | *key* | the Spanish: *la llave* |
| definition | *Vocabulary 4000* (English) | *abase* | its definition: *degrade* |
| | | *degrade* | the word: *abase* |

- [Content and copyright](#content-and-copyright)
- [Importing a book](#importing-a-book)
- [The file format](#the-file-format)
- [The learning method](#the-learning-method)
- [How answers are graded](#how-answers-are-graded)
- [Code](#code)

## Content and copyright

The app contains **no vocabulary of its own**. The words come from books you
own, and stay in your database:

- **Extraction:** the scripts in `tools/` read your copy of a PDF and write a JSON file to `data/`, which is ignored by version control.
- **Storage:** the import puts the entries in your database (SQLite or Neon). They are never part of the project, a build or a release.
- **Access:** keep the app behind its sign-in, and set `REGISTRATION=closed` if the server is reachable from the internet. Only your accounts then see the content.

The tests use two invented books (`tests/e2e/fixtures/`): 27 Spanish entries
and 20 English ones.

## Importing a book

```sh
pip install pdfplumber

# Collins Spanish 3000 words and phrases
python3 tools/vocab-extract.py "Collins Spanish 3000.pdf" > data/vocab-spanish.json

# Vocabulary 4000 (Jeff Kolby)
python3 tools/vocab-extract-4000.py "Vocabulary 4000.pdf" > data/vocab-english.json

npm run check:vocab -- data/vocab-english.json   # optional: every entry can be asked and graded
npm run vocab:import -- data/vocab-spanish.json  # into the database of .env
npm run vocab:import -- data/vocab-english.json
```

Each file holds one book, identified by its id (`collins-spanish`,
`english-4000`). Importing a file updates that book only.

**Instead of the command,** list the files in `.env`:
`VOCAB_FILE=data/vocab-spanish.json,data/vocab-english.json`. At startup the
server imports each book that is not on it yet, so once.

**Importing again** (after a new extraction, or a corrected file) keeps every
player's progress on the entries that did not change. An entry is the same
when it is in the same lesson and section, with the same term and meaning.
Entries no longer in the file are removed, with their progress. The import
runs in one transaction, and takes a second or two for a whole book, on Neon
too.

### Collins *Spanish 3000 words and phrases*

`tools/vocab-extract.py` reads the layout of the Collins series:

| In the book | In the app |
|---|---|
| Chapter (picture page, "TRANSPORT \| LOS MEDIOS DE TRANSPORTE") | Lesson; the picture's labels become its first section |
| Banner ("CAR \| EL COCHE") | Section, titled in Spanish with the English below |
| Small heading ("VOCABULARY", "INTERIOR") | Group, shown as a hint and used to choose similar wrong options |
| English in the regular font, Spanish in bold below | Entry |

10 lessons, 111 sections, 3,214 entries. It uses fonts and positions only, so
other languages of the same series should work too.

### *Vocabulary 4000*

`tools/vocab-extract-4000.py`:

| In the book | In the app |
|---|---|
| *The Words*: a letter (A, B…) | Lesson, cut into sections of about 25 words named after their first and last word ("abase – abode") |
| A word in bold and its definition | Entry; a definition that wraps is joined |
| The quizzes between the words | Skipped |
| *Word Analysis*: prefixes, roots, suffixes | One lesson, three sections. The example ("corporeal" for *corp*) is shown after each answer. "ad—also ac, af" accepts any of them. |
| *Idiom & Usage* (grammar, sentence-correction drills) | Not read: explanations and drills, not words to learn |

27 lessons, 174 sections, 4,150 entries (3,929 words, 221 word parts).

## The file format

Format 2, one book per file:

```json
{
  "format": 2,
  "book": {
    "id": "english-4000",
    "title": "Vocabulary 4000",
    "kind": "definition",
    "term": "en",
    "meaning": "en"
  },
  "lessons": [
    {
      "title": "A",
      "sections": [
        {
          "title": "abase – abode",
          "entries": [
            { "term": "abase", "meaning": "degrade" },
            { "term": "ab", "meaning": "from", "note": "aberration" }
          ]
        }
      ]
    }
  ]
}
```

| Field | |
|---|---|
| `book.id` | Lower-case letters, digits and `-`. Importing a file with the same id updates that book. |
| `book.title` | Shown under the book's name ("Vocabulary 4000") |
| `book.kind` | `translation` (meaning in another language) or `definition` (meaning explained in the same language) |
| `book.term`, `book.meaning` | Language codes: the language studied, and the language of the meanings |
| `title`, `subtitle` | Of a lesson or a section. The subtitle is optional: the title in the other language, for example. |
| `term`, `meaning` | As printed: alternatives with `/`, optional parts in brackets, `...` for an open end |
| `group` | Optional heading inside the section |
| `note` | Optional example or remark, shown after the answer |
| `feminine` | Optional: a feminine noun taking *el* (`el agua`), shown as *f* |

Files in format 1, written by version 4.2 for the Collins book (titles and
entries as `{ "en", "es" }`), are still read, as the book `collins-spanish`.

A file you write by hand works the same way: a class list of words, a list of
German verbs. `shared/vocab/format.ts` validates it and reports the place of
the first problem.

## The learning method

**Two directions per entry.** Each one has its own box:

| Card | Shown | Asked |
|---|---|---|
| Recognise | the term: *la llave*, *abase* | its meaning: *key*, *degrade* |
| Recall | the meaning | the term |

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
section, a whole lesson or the whole book:

| Session | Button | Cards |
|---|---|---|
| Learn | *Apprendre*, *Continuer* (section); *Apprendre la leçon* | 1. cards due, oldest first; 2. recall cards that just became available; 3. new entries in the book's order, at most 8 |
| Review | *Réviser* (section); *Réviser la leçon*; *Réviser tout le vocabulaire* | Only cards already started, due or not: those due first, then the weakest (lowest box), then those unseen for the longest time. No new entries. |
| Due | *Réviser maintenant* | Only the cards due, across the whole book |

The cards chosen are then shuffled together. *Due* is the daily routine, and
the home page shows how many words are due in each book; *Review* is for going
over a chapter before a test, or over everything learnt so far.

**Multiple choice or written.** The *Questions* setting:

| Setting | Asks |
|---|---|
| *Mélangé* (default) | Multiple choice in boxes 1–2, written from box 3: recognition first, then production |
| *Choix multiples* | Always multiple choice |
| *Écrit* | Written whenever possible |

Some answers are always multiple choice, whatever the setting:

- **A definition** (the recognise card of a definition book): it cannot be typed exactly. The word itself is written.
- **An answer of more than four words** (a whole phrase): typing it exactly would test typing more than vocabulary. That is 112 of the 3,214 Spanish entries.

**Wrong options** come from the same group, then the same section, then the
same lesson, preferring answers of similar length. They never read like the
right answer or like each other. An entry with the same prompt is never
offered as a wrong option: *large* is the meaning of both *macro* and *magn*,
so neither is a wrong option for the other.

## How answers are graded

The grading is in `shared/vocab/grade.ts`. The server's verdict is what is
recorded. Case, punctuation (`¿ ? ¡ ! . ,`) and spacing are ignored.

| Verdict | When | Counts as |
|---|---|---|
| right | Exact | right |
| accent | Right letters, missing or wrong accent or tilde (*el lapiz*, *el nino*, *eclat*) | right, with the spelling shown |
| typo | One letter off, in a word of at least 5 letters | right, with the spelling shown |
| article | Spanish: right word, missing or wrong article (*lápiz*, *la lápiz*) | **wrong**: the gender is part of the word |
| wrong | Anything else | wrong |

**Another entry with the same prompt is right too.** If the answer is wrong
for this entry but right for another entry of the book with exactly the same
prompt, it counts as right: *macro* for "large" when the card is *magn*, or one
of two Spanish words with the same English meaning.

**What the books' notation accepts:**

| Printed | Accepted |
|---|---|
| `el amigo / la amiga` | either, or both as printed |
| `Buenas tardes / noches.` | *buenas tardes*, *buenas noches* |
| `Este / Esta es mi...` | *este es mi*, *esta es mi* |
| `to take his/her pulse` | *to take his pulse*, *to take her pulse* |
| `step-/half-brother` | *step-brother*, *half-brother* |
| `ad / ac / af` | any of them |
| `¿Cómo está (él / ella)?` | with or without the bracketed part |
| `embarcar(se)` | *embarcar*, *embarcarse* |

In English answers, *the*, *a*, *an* and *to* are optional: *key*, *the key*;
*walk*, *to walk*.

A multiple-choice answer is compared with the option as printed.

`npm run check:vocab` runs 44 grading cases, the scheduling rules, the three
kinds of session and the rules of definition books. With a file, it also
checks that every entry is accepted when typed as printed, in both
directions.

## Code

| File | Role |
|---|---|
| `tools/vocab-extract.py` | Collins PDF → JSON |
| `tools/vocab-extract-4000.py` | *Vocabulary 4000* PDF → JSON |
| `shared/vocab/format.ts` | File formats 1 and 2, and their validation |
| `shared/vocab/grade.ts` | Grading of written answers |
| `shared/vocab/schedule.ts` | Boxes, intervals, how a card is asked |
| `shared/vocab/session.ts` | Choice of cards and wrong options; sides of a card by book kind |
| `server/vocab.ts` | Storage, import, sessions, answers; the `/api/vocab` routes |
| `server/vocab-import.ts` | `npm run vocab:import` |
| `server/check-vocab.ts` | `npm run check:vocab` |
| `src/vocab.ts`, `src/vocab-i18n.ts` | A book's page: lessons, cards, summary; texts in three languages |
| `src/home.ts` | The home page, with the books and what is due in each |
| `tests/e2e/vocab.spec.ts` | Browser tests, on the invented books |

To change the intervals, the number of new words per session or when written
answers start, edit the constants in `shared/vocab/schedule.ts`. They apply
from the next answer, and existing boxes stay as they are.
