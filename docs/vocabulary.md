# Vocabulary

The *Langues* part of the home page holds one activity per vocabulary book
imported on the server. Each book's chapters are its lessons, its sections the
sections. Words are asked as multiple choice and as written answers, and come
back on a spaced repetition schedule (Leitner boxes).

Two kinds of book are supported:

| Kind | Example | A card shows | and asks |
|---|---|---|---|
| translation | *Spanish 3000 words and phrases* | *la llave* | its meaning: *key* |
| | | *key* | the Spanish: *la llave* |
| translation | *German 3000 words and phrases* | *die Straße* | its meaning: *street* |
| | | *street* | the German: *die Straße* or *die Strasse* |
| translation | *Arabic 3000 words and phrases* | الأُسبوع *al usbou’* | its meaning: *week* |
| | | *week* | the Arabic: الأُسبوع, الأسبوع or *al usbou’* |
| translation | *Japanese vocabulary for English speakers* | 猫 *neko* | its meaning: *cat* |
| | | *cat* | the Japanese: 猫, ねこ or *neko* |
| definition | *Vocabulary 4000* (English) | *abase* | its definition: *degrade* |
| | | *degrade* | the word: *abase* |
| characters | *Kana and jōyō kanji* | 日 | its meaning, and its reading: *nichi*, ひ |
| | | *day / sun* | the kanji: 日 |

The Characters book is built from the EDRDG dictionaries rather than
extracted from a book, and works with the Japanese word books: see
[Kanji and kana](characters.md).

- [Content and copyright](#content-and-copyright)
- [Importing a book](#importing-a-book)
- [The file format](#the-file-format)
- [The learning method](#the-learning-method)
- [How answers are graded](#how-answers-are-graded)
- [Code](#code)

## Content and copyright

The app contains **no vocabulary of its own**. The words come from books you
own, and stay in your database:

- **Extraction:** the scripts in `tools/` read your copy of a PDF or EPUB and write a JSON file to `data/`, which is ignored by version control.
- **Storage:** the import puts the entries in your database (SQLite or Neon). They are never part of the project, a build or a release.
- **Access:** keep the app behind its sign-in, and set `REGISTRATION=closed` if the server is reachable from the internet. Only your accounts then see the content.

The tests use six invented books (`tests/e2e/fixtures/`): 27 Spanish
entries, 5 German ones, 5 Arabic ones, 20 English ones, 13 Japanese ones and 17 characters.

## Importing a book

```sh
pip install pdfplumber

# Collins Spanish 3000 words and phrases
python3 tools/vocab-extract.py "Collins Spanish 3000.pdf" > data/vocab-spanish.json

# Collins German 3000 words and phrases: same script, language read from the cover
python3 tools/vocab-extract.py "Collins German 3000.pdf" > data/vocab-german.json

# Collins Arabic 3000 words and phrases: same layout, Arabic rebuilt from its glyphs
python3 tools/vocab-extract.py "Collins Arabic 3000.pdf" > data/vocab-arabic.json

# Vocabulary 4000 (Jeff Kolby)
python3 tools/vocab-extract-4000.py "Vocabulary 4000.pdf" > data/vocab-english.json

# Japanese vocabulary for English speakers, 5000 words (EPUB; no pip install needed)
python3 tools/vocab-extract-japanese.py "Japanese vocabulary.epub" > data/vocab-japanese.json

npm run check:vocab -- data/vocab-english.json   # optional: every entry can be asked and graded
npm run vocab:import -- data/vocab-spanish.json  # into the database of .env
npm run vocab:import -- data/vocab-german.json
npm run vocab:import -- data/vocab-arabic.json
npm run vocab:import -- data/vocab-english.json
npm run vocab:import -- data/vocab-japanese.json
```

Each file holds one book, identified by its id (`collins-spanish`,
`collins-german`, `collins-arabic`, `english-4000`, `japanese-5000`). Importing a file updates that book only. The
Spanish book keeps the id of its first version, so progress carries over; it
is shown by its title, *3000 words and phrases*.

**Instead of the command,** list the files in `.env`:
`VOCAB_FILE=data/vocab-spanish.json,data/vocab-english.json,data/vocab-japanese.json`. At startup the
server imports each book that is not on it yet, so once.

**The Collins extractor reads the language from the cover** ("german | 3000
words and phrases") and gives the book its id from it: `collins-spanish`,
`collins-german`, `collins-arabic`. A language given as second argument (`es`,
`de`, `ar`) must match the cover.

**An import never overwrites another book by mistake.** It is refused, with
nothing changed, when the file's book id is already on the server:

- **in another language:** for example, a German file labelled `collins-spanish`;
- **or with most of its entries missing:** more than a fifth of the book's entries would disappear while players have progress on some of them.

`npm run vocab:import -- file.json --replace` imports it anyway.

**Importing again** (after a new extraction, or a corrected file) keeps every
player's progress on the entries that did not change. An entry is the same
when it is in the same lesson and section, with the same term and meaning.
Entries no longer in the file are removed, with their progress. The import
runs in one transaction, and takes a second or two for a whole book, on Neon
too.

### *Spanish 3000 words and phrases* (Collins)

`tools/vocab-extract.py` reads the layout of the Collins series:

| In the book | In the app |
|---|---|
| Chapter (picture page, "TRANSPORT \| LOS MEDIOS DE TRANSPORTE") | Lesson; the picture's labels become its first section |
| Banner ("CAR \| EL COCHE") | Section, titled in Spanish with the English below |
| Small heading ("VOCABULARY", "INTERIOR") | Group, shown as a hint and used to choose similar wrong options |
| English in the regular font, Spanish in bold below | Entry |

10 lessons, 111 sections, 3,214 entries. It uses fonts and positions only, so
other languages of the same series work too.

### *German 3000 words and phrases* (Collins)

The same script, with the language as second argument (`de`): 10 lessons, 112
sections, 3,206 entries. Two things differ from the Spanish book:

- **Capitals.** Headings are set in small capitals, which lose German's capitalised nouns. A title word takes a capital unless it is a small word of grammar (*und*, *mit*, *dem*, *im*, *für*…): "Probleme mit dem Auto", "Tage, Monate und Jahreszeiten".
- **ß in headings.** The small capitals have no ß, so the book sets it in a smaller size, which the font filter would skip ("fu ball"). A heading line holding such a letter is read again character by character: "Fußball", "Gliederfüßer".

### *Arabic 3000 words and phrases* (Collins)

The same script with `ar`: 10 lessons, 109 sections, 3,014 entries, each with
its transliteration as the reading. The page layout is the series', but the
Arabic needs rebuilding:

- **Order.** The PDF stores Arabic in visual order, left to right on the page, as single glyphs. Each line of a column is read again from its characters, right to left. Numbers and Latin inside it stay left to right.
- **Vowel marks** are separate glyphs placed by position. A mark goes with the letter starting at or just before it on the page, where the glyph ends when read right to left. Two entries out of 3,014 still show a doubled mark.
- **Brackets** come out in either glyph. In reading order they are made to open, then close.
- **Headings:** the Arabic half sits on the heading's line, or on the next one when a long English title ends with "|".
- **Transliteration:** the small Latin lines under each entry. A line ending in "-" goes on without a space.

### *Vocabulary 4000*

`tools/vocab-extract-4000.py`:

| In the book | In the app |
|---|---|
| *The Words*: a letter (A, B…) | Lesson, cut into sections of about 25 words named after their first and last word ("abase – abode") |
| A word in bold and its definition | Entry; a definition that wraps is joined |
| The quizzes between the words | Skipped |
| *Word Analysis*: prefixes, roots, suffixes | One lesson, three sections, each its own group (prefixes are compared with prefixes). The example ("corporeal" for *corp*) is shown after each answer. "ad—also ac, af" accepts any of them. |
| *Idiom & Usage* (grammar, sentence-correction drills) | Not read: explanations and drills, not words to learn |

27 lessons, 174 sections, 4,150 entries (3,929 words, 221 word parts). The
book is marked `alphabetical`: the letters are only a way to find a word, not
an order to learn in.

### *Japanese vocabulary for English speakers — 5000 words*

`tools/vocab-extract-japanese.py` reads the EPUB (T&P Books), with the
standard library only:

| In the book | In the app |
|---|---|
| Chapter ("FOOD. NUTRICION") | Lesson ("Food. Nutricion") |
| Numbered heading ("35. Food") | Section ("Food") |
| English, Japanese, rōmaji | Entry: the Japanese is the term, the English its meaning, the rōmaji its reading |
| "digit, figure", "to reserve, to book" | "digit / figure": either is accepted. Commas in brackets ("to order (meal, etc.)") stay. |
| "(vt)", "(adj)", "(fam.)" | Kept: they tell apart *Hello! (fam.)* and *Hello! (form.)*, and are optional in an answer |
| Blank lines between small groups of words | Not kept: sections (3 to 80 words) are enough for the wrong options |

22 lessons, 155 sections, 5,087 entries. Some English words appear in several
themes (*to pay* in shopping and in banking); each is its own entry.

**The rōmaji** is shown in italics under the Japanese, on the card and under
each option of a multiple-choice answer: the book is for learners who do not
read kana yet. The *Rōmaji* setting of the book's page can hold it back until
the answer (*Après la réponse*), to practise reading kana. When the Japanese is to be written, any of these is right:

| Typed | For 学校 (*gakkō*) |
|---|---|
| Kanji or kana, as printed | 学校 |
| Kana for its sound | がっこう, ガッコウ |
| Rōmaji, long vowels marked or not | *gakkō*, *gakko*, *gakkou* |

The app has no Japanese font of its own: Japanese text is marked `lang="ja"`
and uses the system's Japanese fonts (Hiragino on Apple devices, Yu Gothic on
Windows, Noto Sans CJK on Android and Linux), so kanji take their Japanese
forms.

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
| `book.kind` | `translation` (meaning in another language), `definition` (meaning explained in the same language) or `characters` (kana and kanji, see [Kanji and kana](characters.md)) |
| `book.term`, `book.meaning` | Language codes: the language studied, and the language of the meanings |
| `book.credit` | Optional: where the content comes from, shown under the book's title (a licence's attribution) |
| `book.order` | Optional. `book` (default): the order means something (Collins: by theme). `alphabetical`: a word list; new words then come at random by default, and wrong options are not taken from the alphabetical neighbours. |
| `title`, `subtitle` | Of a lesson or a section. The subtitle is optional: the title in the other language, for example. |
| `term`, `meaning` | As printed: alternatives with `/`, optional parts in brackets, `...` for an open end |
| `group` | Optional heading inside the section |
| `note` | Optional example or remark, shown after the answer |
| `feminine` | Optional: a feminine noun taking *el* (`el agua`), shown as *f* |
| `reading` | Optional: how the term reads when its script does not say it, in Latin letters (Japanese rōmaji: `"gachō"` for ガチョウ). Shown with the term, and accepted as an answer. |
| `readings` | Optional, Characters book: a kanji's readings, on'yomi in katakana then kun'yomi in hiragana, okurigana in brackets: `"ニチ / ジツ / ひ / か"`. Asked as a third direction; any one is a right answer. |
| `translations` | Optional: the meaning in other interface languages, `{"fr": "jour / soleil", "es": "día / sol"}`. Used when the interface is in that language. |

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
| Learn | *Apprendre*, *Continuer* (section); *Apprendre la leçon*; *Apprendre au hasard dans tout le livre* | 1. cards due, oldest first; 2. recall cards that just became available; 3. new entries, at most 8, at random or in the book's order (*Nouveaux mots*) |
| Review | *Réviser* (section); *Réviser la leçon*; *Réviser tout le vocabulaire* | Only cards already started, due or not: those due first, then the weakest (lowest box), then those unseen for the longest time. No new entries. |
| Due | *Réviser maintenant* | Only the cards due, across the whole book |

**New words at random or in order.** The *Nouveaux mots* setting, per book:
*Au hasard* draws the new words at random among those not started; *Dans
l'ordre du livre* takes them in order. The default is random for an
alphabetical book (*Vocabulary 4000*: learning all the *a* words first makes
no sense) and the book's order otherwise (Collins: by theme). With *Apprendre
au hasard dans tout le livre*, a session draws its new words from the whole
4,000-word list.

The cards chosen are then shuffled together. *Due* is the daily routine, and
the home page shows how many words are due in each book; *Review* is for going
over a chapter before a test, or over everything learnt so far.

**Statistics.** *📊 Statistiques* on a book's page: words by status and per
lesson, answers over the last 30 days, the reviews coming in the next 14 days,
cards per box, the share right by kind of question, written answers by
verdict, and the hardest words. Computed by `shared/vocab/stats.ts` from the
player's boxes and answers; days end at the browser's midnight (`tz` in the
request). See the [user guide](user-guide.md#vocabulary).

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
same lesson, preferring answers of similar length. In an alphabetical book,
neighbouring words look alike (*abase*, *abash*, *abate*) without being related,
so the wrong options come from the whole book instead, except within a group
(prefixes with prefixes). They never read like the
right answer or like each other. An entry with the same prompt is never
offered as a wrong option: *large* is the meaning of both *macro* and *magn*,
so neither is a wrong option for the other.

## How answers are graded

The grading is in `shared/vocab/grade.ts`. The server's verdict is what is
recorded. Case, punctuation (`¿ ? ¡ ! . ,`, and `。 、 ！ ？` in Japanese) and
spacing are ignored.

| Verdict | When | Counts as |
|---|---|---|
| right | Exact | right |
| accent | Right letters, missing or wrong accent or tilde (*el lapiz*, *el nino*, *eclat*) | right, with the spelling shown |
| typo | One letter off, in a word of at least 5 letters | right, with the spelling shown |
| article | Spanish or German: right word, missing or wrong article (*lápiz*, *la lápiz*; *Straße*, *der Straße*) | **wrong**: the gender is part of the word |
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

**Arabic answers** are written in Arabic script or in the book's
transliteration, which is the entry's reading.

| Typed | Verdict |
|---|---|
| The word as printed, or without any vowel marks (الأُسبوع, الأسبوع) | right |
| The transliteration; case, spaces, hyphens, apostrophes and long-vowel spellings ignored (*al usbou’*, *al-usbu*, *daqiqa* for *daqeeqa*) | right |
| Another alef, alif maqsura for ya, ta marbuta for ha (الاسبوع, دقيقه) | accent: right, spelling shown |
| The article ال (*al*) left out or added (أسبوع, *usbou*) | typo: right, spelling shown |
| One letter off, in a word of at least 5 letters | typo |
| Anything else | wrong |

Arabic is shown right to left, in the system's Arabic font and a larger size,
with the transliteration under the word. As in Japanese, the transliteration
can wait until the answer (*Transcription › Après la réponse*).

**German answers.** Capitals are not checked: nouns take one, but a phone
keyboard may not. *ß* may be written *ss*, as in Switzerland, and *ä*, *ö*, *ü*
as *ae*, *oe*, *ue*: both are right. A plain vowel for an umlaut (*die Kuche*)
counts as an accent slip: right, with the spelling shown. The articles are
*der*, *die*, *das* and their cases, and *ein*, *eine* and theirs. Buttons
under the field add *ä ö ü ß Ä Ö Ü*.

**Japanese answers** (`shared/vocab/grade.ts`, `shared/vocab/kana.ts`):

| Typed | Verdict |
|---|---|
| The term as printed, full-width or half-width (`ＣＤ`, `CD`) | right |
| Without a bracketed reading: *CD* for `CD（シーディー）` | right |
| Kana, read as rōmaji: ねこ for 猫 (*neko*) | right |
| Rōmaji: case, spaces, hyphens, long-vowel marks and spellings ignored (*tōkyō*, *tokyo*, *toukyou*; *shimbun*, *shinbun*) | right |
| Rōmaji one letter off, in a word of at least 5 letters (*konichiwa*) | typo |
| Anything else | wrong |

Kana is compared by its sound, so は is *ha*: こんにちは typed in kana is right
as printed, while *konnichiha* is a typo for *konnichiwa*.

A multiple-choice answer is compared with the option as printed.

`npm run check:vocab` runs 93 grading cases (21 of them Japanese, 16 Arabic, 12 German), the
scheduling rules, the three kinds of session, the rules of definition books
and the rōmaji on Japanese cards. With a file, it also
checks that every entry is accepted when typed as printed, in both
directions.

## Code

| File | Role |
|---|---|
| `tools/vocab-extract.py` | Collins PDF → JSON |
| `tools/vocab-extract-4000.py` | *Vocabulary 4000* PDF → JSON |
| `tools/vocab-extract-japanese.py` | Japanese EPUB → JSON |
| `shared/vocab/format.ts` | File formats 1 and 2, and their validation |
| `shared/vocab/grade.ts` | Grading of written answers |
| `shared/vocab/kana.ts` | Kana → rōmaji, for Japanese answers typed in kana |
| `shared/vocab/stats.ts` | A player's statistics on a book, from their boxes and answers |
| `shared/vocab/schedule.ts` | Boxes, intervals, how a card is asked |
| `shared/vocab/session.ts` | Choice of cards and wrong options; sides of a card by book kind |
| `server/vocab.ts` | Storage, import, sessions, answers; the `/api/vocab` routes |
| `server/vocab-import.ts` | `npm run vocab:import` |
| `server/check-vocab.ts` | `npm run check:vocab` |
| `src/vocab.ts`, `src/vocab-i18n.ts` | A book's page: lessons, cards, summary; texts in three languages |
| `src/vocab-stats.ts` | A book's statistics page |
| `src/home.ts` | The home page, with the books and what is due in each |
| `tests/e2e/vocab.spec.ts` | Browser tests, on the invented books |

To change the intervals, the number of new words per session or when written
answers start, edit the constants in `shared/vocab/schedule.ts`. They apply
from the next answer, and existing boxes stay as they are.
