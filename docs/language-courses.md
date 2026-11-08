# Language courses

A language course is a sequence of lessons, each with explanations, paradigm
tables, examples, graded exercises, a summary and the lesson's words. The
player fills the exercises in on the page; the server marks them and keeps
the answers. Every lesson exists in French, Spanish and English, with the same
structure and the same exercises.

| Course | Version | Lessons | Exercises | Words |
|---|---|---|---|---|
| 🏛️ Latin (`latin`) | 7.0.0 | 31 | 126 | 410 |
| 𓋹 Hieroglyphic Egyptian (`egyptian`) | 7.1.0 | 21 | 84 | 168 |
| 𒀭 Sumerian (`sumerian`) | 7.2.0 | 12 | 48 | 86 |
| 𒀝 Akkadian (`akkadian`) | 7.2.0 | 14 | 56 | 101 |
| 🏺 Ancient Greek (`greek`) | 7.3.0 | 24 | 96 | 173 |
| 🌹 Persian (`persian`) | 7.4.0 | 18 | 72 | 150 |
| 🌙 Arabic (`arabic`) | 7.5.0 | 22 | 88 | 182 |
| 📜 Hebrew (`hebrew`) | 7.6.0 | 19 | 76 | 165 |
| 🌴 Malayalam (`malayalam`) | 7.7.0 | 19 | 76 | 188, and 96 letter cards |

The content is original, written for the app, and ships with it; quoted texts
(Caesar, Catullus, Virgil; Sinuhe, the Shipwrecked Sailor, the offering
formula; Gudea, Ur-Namma, the Laws of Hammurabi, Gilgamesh; Homer, Sophocles,
Heraclitus, Plato, the Gospel of John; Ferdowsi, Saadi, Rumi, Hafez, Khayyam;
the Quran; Genesis, Deuteronomy, Numbers, the Psalms, Ecclesiastes; Ezhuthachan,
Kumaran Asan, the Malayalam proverbs) are in the public domain. Quranic passages are quoted in their Arabic text, in the common
Ḥafṣ reading, with translations of the meaning; biblical passages in the
vocalised Masoretic text, without cantillation marks, with the divine name
read *Adonai* as in Jewish practice.

## Files

```text
content/courses/
  index.json                      ["latin", "egyptian", "sumerian", "akkadian", "greek", "persian", "arabic", "hebrew", "malayalam"]: the courses, in order
  latin/
    course.json                   id, language, icon, folds, titles, the lesson list
    01-letters-and-sounds/
      en.md  fr.md  es.md         the lesson, one file per interface language
      vocab.json                  the lesson's words (vocabulary format 3)
    02-present-first-second/
    …
  malayalam/
    letters.json                  optional: the course's letter cards, a book of kind "characters"
    sounds.json                   made by npm run sounds:build: the words that can be listened to
    sounds/<hash>.mp3             their sounds (docs/sounds.md)
```

Malayalam, Egyptian, Sumerian and Akkadian can be listened to: a ▶ after the words of the lesson text and on the letter cards, made at build time by eSpeak NG. See [Sounds](sounds.md).

`course.json`:

```json
{
  "id": "latin",
  "language": "la",
  "icon": "🏛️",
  "folds": ["macrons", "ij", "uv"],
  "title": { "fr": "Latin", "es": "Latín", "en": "Latin" },
  "description": { "fr": "…", "es": "…", "en": "…" },
  "vocabLesson": "Lectio {n}",
  "lessons": ["01-letters-and-sounds", "02-present-first-second", "…"]
}
```

`vocabLesson` names the lessons of the vocabulary book. `keys` (optional) lists letters a keyboard lacks; at most 40, each up to four characters; they are offered as buttons under every exercise with fields and write at the cursor of the field last used (Egyptian: `["ꜣ", "ꜥ", "ḥ", "ḫ", "ẖ", "š", "ḳ", "ṯ", "ḏ"]`; Sumerian: `["š", "ĝ", "ḫ", "₂", "₃", "₄", "₅"]`; Akkadian: `["š", "ṣ", "ṭ", "ḫ", "ā", "ē", "ī", "ū", "â", "ê", "î", "û"]`; Greek: the 24 letters and ς; Persian: the 32 letters and آ; Arabic: the 28 letters, ء ة ى أ إ; Hebrew: the 22 letters and the five final forms; Malayalam: the letters of ISO 15919 transliteration, ā ī ū ē ō ŭ ṭ ḍ ṇ ḷ ḻ ṟ ñ ṅ ś ṣ ṁ r̥). Fields follow the direction of the script typed (`dir="auto"`). `lessons` lists the lesson folders in order; a folder not listed is not
loaded. `build:server` copies `content/courses` into `dist-server/`.

## A lesson

Every lesson follows one template, which `check:lessons` enforces in all
three languages:

1. the title, `# N. Title`;
2. a paragraph saying what the lesson is for;
3. explanations, with at least one table;
4. at least four exercises, between the explanations;
5. a summary box, last;
6. the vocabulary, drawn from `vocab.json` under the summary (not written in
   the Markdown).

The Markdown is the courses' small dialect (headings, paragraphs, lists,
tables, `*italics*`, `**bold**`, italics holding bold); a line ending in `\`
is a line break, for verse. Hieroglyphs (U+13000–1345F) and cuneiform
(U+12000–1254F) in the text are drawn larger, in their Noto font, wherever
they appear: text, tables, options. A run of Hebrew, Persian or Arabic words is set
apart in a right-to-left `bdi` (Noto Sans Hebrew for Hebrew, with niqqud;
Vazirmatn for Persian and Arabic; in the Arabic course, the Naskh of
Amiri, with full vowel marks and verse signs), so that it keeps its order inside
a left-to-right line; commas and stops stay in the run, a colon or semicolon
ends it; a run may end on "…", the gap of an exercise. A run of
Malayalam is set in Noto Sans Malayalam, a little larger than the text
(`span.script-malayalam`, `lang="ml"`). The lesson
page carries the language taught in `data-script`. A blank never sits inside emphasis: an
exercise line with a blank has no italics. Two blocks are added:

```markdown
::: exercise decline-exercitus
Decline *exercitus*, *exercitūs* (m.), "army".

| Case | Singular | Plural |
|---|---|---|
| Nominative | exercitus | [[exercitūs]] |
| Genitive | [[exercitūs]] | [[exercituum]] |
:::

::: summary
- Fourth declension: genitive *-ūs* …
:::
```

An exercise has an id (lowercase letters, digits, hyphens), its instructions,
then a list, a table or both. Three kinds of blank:

| Blank | Written | Marked | Across languages |
|---|---|---|---|
| Strict | `[[rērum]]`, alternatives `[[a / b]]` | right or wrong, after folding (below) | the same answers |
| Free | `{{The state is in great danger. / The republic …}}` | right when it matches a model loosely; otherwise *to check*, and the player may mark it right | in the interface language |
| Choice | `((2nd / 4th* / 5th))` | the option marked `*` | the same number of options, the right one at the same place |

Answers never reach the browser before a check: the page gets the
instructions, the options of a choice and a size for each field.

### Folds

A strict answer is compared after folding both sides: lowercase, apostrophes
unified, outer punctuation dropped, inner `, ; : ! ?` read as spaces, then the
course's folds.

| Fold | Effect | For |
|---|---|---|
| `macrons` | *ā* = *a*, *ă* = *a* | Latin typed without macrons |
| `ij` | *j* = *i* | *iam*, *jam* |
| `uv` | *v* = *u* | *uīvus*, *vīvus* |
| `accents` | every accent dropped | Greek and the like |
| `translit` | *ḥ* = *h*, *š* = *sh*, *ꜥ* dropped, `-.=` dropped… | Akkadian transliteration |
| `aleph3` | *3* = *ꜣ* | Egyptian typed on a keyboard |
| `subscripts` | *₂* = *2* | Sumerian sign indices |
| `greek` | strict blanks compared in Greek letters without accents, breathings or iota subscript; transliteration read as Greek (*th* θ, *ph* φ, *ch*/*kh* χ, *ps* ψ, *y*/*u* υ, *h* dropped); η = ε, ω = ο, ς = σ, γγ = νγ; free answers unchanged | Greek typed on any keyboard: *psychē*, *psuche*, ψυχη |
| `persian` | strict blanks compared by their consonants, in Persian script or in transliteration: vowels and ا و ی dropped, as are ه ح ع ء and *h*, *v*, *y*, *'*; letters of one sound merged (ث س ص, ذ ز ض ظ, ت ط, غ ق and *gh*, *q*); *kh* *sh* *ch* *zh* read as خ ش چ ژ; Arabic ي ك read as ی ک; ZWNJ, spaces and hyphens dropped; free answers unchanged | Persian typed on any keyboard: *mikhâham*, *mixaham*, می‌خواهم |
| `arabic` | strict blanks compared by their consonants, in Arabic script (vowel marks and Quranic signs dropped) or in transliteration: vowels, ا و ي ى, hamza, ʿayn and ة dropped; emphatics folded into plain letters (ص س، ض د، ط ت، ظ ز) and ح into ه; *th* *dh* *kh* *sh* *gh* read as ث ذ خ ش غ; the article before a sun letter (*ash-shams*) read as *al-*; doubled letters counted once; free answers unchanged | Arabic typed on any keyboard: *kitab*, *ar-rahman*, *bismillah* |
| `hebrew` | strict blanks compared by their consonants, in Hebrew script (niqqud, cantillation, geresh and gershayim dropped) or in transliteration: vowels and א ה ע י dropped; ו at the start of a word or doubled (וו) is *v* and read as ב, any other ו dropped; letters of one sound folded (כ ח ק and *kh* *ch* *ḥ* *x* *k* *q*, ת ט, ש ס and *s* *sh*, ב and *b* *v*, פ and *p* *f*); *ts* *tz* read as צ; final forms read as plain letters; doubled letters counted once; free answers unchanged | Hebrew typed on any keyboard: *shalom*, *melech*, *eretz*, שָׁלוֹם |
| `malayalam` | strict blanks compared in a plain Latin key: the script transliterated (inherent *a*, vowel signs, virama, chillus, ം as *m*; റ്റ and ന്റ read *tt*, *nt*; a final ് as *ŭ*), ISO 15919 and Manglish brought to it: marks dropped, long and short vowels one (*ee* and *oo* read *i* and *u*), retroflex and dental one, *t* and *d* one, ശ ഷ സ one, ര റ one, aspirates plain, *ch* *c*, *nj* *ny* *ng* *n*, *zh* and ഴ kept apart; doubled letters counted once, a final half-u optional; free answers unchanged | Malayalam typed on any keyboard: *keralam*, *veedu*, *njan*, കേരളം |
| `egyptian` | strict blanks compared by their consonants: *ꜣ ꜥ* (*3*, *'*) and the vowels *a e o* dropped, *j i y* one letter, *w u* one, *ḥ ḫ ẖ kh x* = *h*, *š sh* = *s*, *ṯ tj* = *t*, *ḏ dj* = *d*, *ḳ q* = *k*, dots and hyphens dropped; free answers keep their vowels | Egyptian typed as it is read: *ankh*, *nefer*, *sedjem.n.ef* |

Course folds: Latin `macrons ij uv`, Egyptian `egyptian`, Sumerian
`translit subscripts` (*diĝir* typed *digir*, *e₂* typed *e2*), Akkadian
`translit macrons` (*šalmāku* typed *shalmaku*), Greek `greek` (*logos*, λογος and λόγος are one answer), Persian `persian` (کتاب, *ketâb* and *ketab* are one answer), Arabic `arabic` (كتاب, كِتَاب, *kitāb* and *kitab* are one answer), Hebrew `hebrew` (שלום, שָׁלוֹם and *shalom* are one answer), Malayalam `malayalam` (കേരളം, *kēraḷaṁ* and *keralam* are one answer).

The `egyptian` fold makes *h* and *ḥ* one answer, the `greek` fold ε and η,
the `persian` fold the letters of one sound (س ص ث) and the plural ـها, the
`arabic` fold the emphatics and most broken plurals (كتاب / كتب), the
`hebrew` fold כ and ח, the masculine and feminine numbers (שלוש / שלושה) and the
prefixes א and י of the future (אכתוב / יכתוב), the `malayalam` fold
long and short vowels and the retroflex consonants (കാൽ / കല്ല്, ട / ത):
exercises that test the difference between such letters are choices, not
typed blanks.

## Vocabulary

`vocab.json` holds the lesson's words in [vocabulary format 3](vocabulary.md#format-3)
(`type`, `gender`, `genitive`, `principal_parts`, `forms`; `reading` for a
script: the hieroglyphs or cuneiform in `term`, the transliteration in `reading`, shown
under the signs and accepted as the answer in the vocabulary book); `meaning` is
English and `translations` gives French and Spanish. Notes are not
translated, so they are written in the language taught (*domī, domum, domō*).
Akkadian words are written in transliteration (*šarrum*), with the Sumerogram,
when there is one, in `readings`. Greek words are written in Greek with their
article (ὁ λόγος), their transliteration in `reading` (*ho logos*); Persian
words in the script, with an Iranian transliteration in `reading` (کتاب,
*ketâb*); Malayalam words in the script, with ISO 15919 in `reading`
(കേരളം, *kēraḷaṁ*), and answered in the vocabulary book in the script, in
ISO or in Manglish (an exact form is right, one equal by the Malayalam fold
counts as an accent).

At start, the server builds one vocabulary book per course from these files,
`course-<id>`, one lesson per course lesson, imports it when it changed (a
hash in `app_settings`, key `course-vocab:<id>`), and shares it with every
account. *📚 Practise the course vocabulary* opens it, and so does its card
under *Languages* on the home page (since 7.8.0): every course book is there
with the player's own books, so a language studied only through its course
has its card and its words due. A course book shares a card with the other
books of its language (a shelf, `vocab-shelf-<lang>`), or has its own,
`vocab-course-<id>`, labelled with the course's icon and title.

### Letter cards

A course may ship `letters.json`, a [format-3](vocabulary.md#format-3) book
without `id`, `kind` or languages (the server sets them: `course-<id>-letters`,
kind `characters`, the course's language, English meanings). Each entry is a
letter, a vowel sign on ക, a chillu or a conjunct, its sound in ISO 15919 as
the meaning (*ḻa / zha*: either is accepted), and an example word in the
script and transliteration as its note. It is imported and shared like the
word book (key `course-letters:<id>`), and works as the kana do in the
[Characters book](characters.md): the letter shown and its sound asked, then
the sound shown and the letter chosen among the letters of its section.
*🔤 Letter cards* on the course page opens it. Malayalam has five lessons:
vowels (13), consonants (36), vowel signs and marks (15), chillus (5),
conjuncts (27).

The Malayalam course ends with a **compendium of proverbs** (lesson 19):
thirty-three proverbs by theme, each with its reading, a word-for-word
rendering and its sense, all of them in the lesson's vocabulary (type
`phrase`, the sense as the meaning), so they come back by spaced repetition
as multiple choice.

## Progress

Answers are saved per player and exercise in `lesson_answers` (migration
`035`): the answers, each blank's result, the blanks marked right by the
player, the score. An exercise is *done* when every blank is right. The course
page shows each lesson's done exercises, the home card the course's.

## Routes

Under `/api/courses`, with the player's `userId` (an account sees its own
players and those shared with it) and `lang` (`fr`, `es`, `en`).

| Route | Body or query | Answer |
|---|---|---|
| `GET /api/courses` | `?userId&lang` | `CourseInfo[]`: each course with its lessons, exercises and the player's done |
| `GET /api/courses/:course` | `?userId&lang` | `CourseView`: the course and its lessons with the player's progress |
| `GET /api/courses/:course/:lesson` | `?userId&lang` | `LessonView`: the lesson's parts (exercises without answers), its words, the previous and next lessons, the player's saved exercises |
| `POST /api/courses/check` | `{userId, course, lesson, exercise, given[], lang}` | `ExerciseState`: results, expected answers, score |
| `PUT /api/courses/override` | `{userId, course, lesson, exercise, blank, right, lang}` | `ExerciseState`: `right: true` marks a strict or free blank right, `false` or `null` takes the mark back; only once checked, never a choice |
| `DELETE /api/courses/answers` | `?userId&course&lesson` | 204: the lesson's answers removed |
| `GET /api/courses/:course/sounds` | | `CourseSounds`: a word as written → its file and reading; `{}` without sounds ([Sounds](sounds.md)) |
| `GET /api/courses/:course/sounds/:file` | | the MP3, cached for good |

Errors: `invalid query`, `invalid answers`, `invalid override` (400);
`unknown user`, `unknown course`, `unknown lesson`, `unknown exercise`,
`not checked` (404). The types are in `shared/lessons/api.ts`.

## Checks

`npm run check:lessons` (a few seconds):

- folding, marking and parsing cases;
- every course and lesson parses, in every language;
- the three languages agree: exercise ids, items, tables and their rows, blank
  kinds, strict answers, the right choice, and the shape of each part
  (headings, table lines, blocks);
- the template above, no stray `$`, no italics cut by a blank;
- every answer typed back is right, a wrong one is not, none folds to nothing;
- at least five words per lesson, no word taught twice in a course;
- how Egyptian, Akkadian, Sumerian and Malayalam words are turned into speech (`server/pronounce.ts`).

`npm run check:sounds` checks that every word that can be listened to has its sound and that each `sounds.json` is up to date; after changing a lesson of those four courses, run `npm run sounds:build`.

## Adding a lesson

1. Make the folder, `NN-slug/`, with `en.md`, `fr.md`, `es.md` and
   `vocab.json`. Write one language first, then the others line for line:
   same headings, same table lines, same exercises in the same order.
2. Add the folder to `lessons` in `course.json`.
3. `npm run check:lessons`, until it reports 0 failures.

## Adding a course

1. `content/courses/<id>/course.json` as above, with the language's code and
   folds, and its lessons.
2. Add the id to `content/courses/index.json`.
3. `npm run check:lessons`. The course appears on the home page under
   *Language courses*, its vocabulary book after the next start.
