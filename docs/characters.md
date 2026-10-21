# Kanji and kana

The **Characters** book teaches the Japanese scripts. It follows the order of
the Japanese school:

| Lessons | What | Count |
|---|---|---|
| ひらがな | Hiragana, row by row: あ row, か row… then the voiced rows (が, ぱ…) and the contracted sounds (きゃ, しゅ…) | 104 |
| カタカナ | Katakana in the same order, plus the sounds borrowed from other languages (ティ, ファ, ヴ…) | 119 |
| 小学一年 … 小学六年 | The kanji of primary school, grade by grade (kyōiku kanji: 80, 160, 200, 202, 193, 191) | 1,026 |
| 中学・高校 1 … 6 | The other jōyō kanji, taught in secondary school | 1,110 |

That makes 2,359 characters. Within a grade, the most frequent kanji come first. A section holds ten kanji, or one row of kana.

- [What is asked](#what-is-asked)
- [One learning with the word books](#one-learning-with-the-word-books)
- [Building the book](#building-the-book)
- [Licence](#licence)
- [Code](#code)

## What is asked

| Card | Shows | Asks | How |
|---|---|---|---|
| Kana, recognise | あ, large | its sound: *a* | choice, then written in rōmaji |
| Kana, recall | *ka* | the kana: か | choice among four kana |
| Kanji, recognise | 日, large | its meaning: *day / sun / Japan* | choice, then written |
| Kanji, read | 日, large | one of its readings: ニチ, ジツ, ひ, か | choice, then written in kana or rōmaji |
| Kanji, recall | *day / sun / Japan* | the kanji: 日 | choice among four kanji |

**Directions.**

- Every character starts with *recognise*.
- *Recall* and, for a kanji, *read* open once recognition has reached box 2, as in the word books (see [the learning method](vocabulary.md#the-learning-method)).
- Each direction has its own Leitner box. A kanji is known when its three boxes are, and mastered when all three are at the top.

**Answers.**

- **A character to produce is always chosen,** among characters of the same kind (kana among kana, kanji among kanji), from the same section first. Few keyboards write one kana or one kanji on its own, and telling 未 from 末 is the skill being tested.
- **A reading is one of the kanji's readings,** typed as you like: ニチ, にち, *nichi*. Okurigana are optional: たか(い) accepts たか, たかい, *taka* and *takai*. After the answer the card shows all the readings, on'yomi (katakana) and kun'yomi (hiragana) apart.
- **The meaning is in the interface's language:** French or Spanish when the dictionary has it (all but a few kanji of grades 1–6; about nine in ten of the others), English otherwise.

**After each kanji,** the card shows its meaning, its readings, and up to three example words. The examples are common words whose kanji all come at or before this one in the book, so nothing in them is still unknown. Their glosses are in English: the Japanese–English dictionary is the one used.

## One learning with the word books

The Characters book and the Japanese word books (such as *Japanese vocabulary for English speakers*) feed each other:

- **Characters met in your words come first.** Once you have started a word in a Japanese word book, the kana and kanji it uses are *met*. Among the new characters of a session, met ones are introduced first, in the book's order. The Characters home screen says how many are waiting, and their cards carry the badge *seen in your words*.
- **A character shows your words.** After a character's card: up to three words you have started that use it, with their rōmaji and meaning.
- **A word shows its kanji.** After a word's card in a Japanese word book: its kanji with their meanings. The ones you have not started yet are highlighted.

So a word learnt in the vocabulary pulls its characters forward, and the school order fills in the rest.

## Building the book

The kana are built in. The kanji come from two dictionary files of the Electronic Dictionary Research and Development Group, which you download yourself into `data/` (ignored by version control and by the Docker image):

| File | From | Gives |
|---|---|---|
| `data/kanjidic2.xml.gz` | [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project) | Grades, frequency, readings, meanings in English, French and Spanish |
| `data/JMdict_e.xml` (or `.gz`) | [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html), English edition | The example words |

```sh
npm run characters:build                       # writes data/characters.json
npm run check:vocab -- data/characters.json    # optional: every reading and meaning accepted
npm run vocab:import -- data/characters.json   # into the database of .env (SQLite or Neon)
```

- **Without the dictionaries,** the command builds the kana only.
- **Without JMdict,** the kanji come without example words.
- **For production,** run the import with `DATABASE_URL` set to the production database, from your machine, as for the other books.

The build takes a few seconds. Importing again later, for instance after a dictionary update, keeps every player's progress on the characters whose meaning did not change.

**How the dictionaries are read.**

- **Kanji:** the jōyō kanji are those of grades 1–6 and 8 in KANJIDIC2 (9 and 10 are name kanji, left out).
- **Meanings:** up to three per language. A radical's number ("one radical (no.1)") is dropped.
- **On'yomi:** up to three.
- **Kun'yomi:** up to three.
  - Okurigana go in brackets: たか.い becomes たか(い).
  - One stem counts once: い(きる), い(かす) and い(ける) give い(きる).
  - The dash of a prefix or suffix is dropped. A suffix that only voices a reading (-び beside ひ) is left out.
- **Example words** are JMdict entries marked common (news1, ichi1, spec1, spec2, gai1) and written with kanji, most frequent first. Words usually written in kana and rare spellings are left out.

## Licence

KANJIDIC2 and JMdict are the property of the [Electronic Dictionary Research
and Development Group](https://www.edrdg.org/) and are used under the
[Creative Commons Attribution-ShareAlike 4.0 licence](https://www.edrdg.org/edrdg/licence.html).
The book carries this credit (`book.credit` in the file) and the app shows it
under the book's title. The project itself contains no dictionary data: the
files, the generated book and the imported entries stay in `data/` and in your
database. The tests use a small invented book (`tests/e2e/fixtures/characters.json`).

## Code

| File | Role |
|---|---|
| `server/characters-build.ts` | `npm run characters:build`: kana table, KANJIDIC2 and JMdict readers, school order, readings, example words |
| `shared/vocab/format.ts` | Book kind `characters`; entry `readings` and `translations`; book `credit` |
| `shared/vocab/schedule.ts` | The `read` direction; a kanji's status over its three boxes |
| `shared/vocab/session.ts` | `directionsOf`, `localise` (meaning in the interface's language), reading cards, met characters first, choices of the same kind |
| `server/vocab.ts` | Met characters (`wordsStarted`), a character's words (`wordsWith`), a word's kanji (`charactersOf`) |
| `server/migrations/012_characters.*.sql` | Kind `characters`, direction `read`, columns `credit`, `readings`, `translations` |
| `src/vocab.ts` | Large glyphs, glyph choices, readings on and kun, related words |
