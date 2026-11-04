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

The content is original, written for the app, and ships with it; quoted texts
(Caesar, Catullus, Virgil; Sinuhe, the Shipwrecked Sailor, the offering
formula; Gudea, Ur-Namma, the Laws of Hammurabi, Gilgamesh; Homer, Sophocles,
Heraclitus, Plato, the Gospel of John; Ferdowsi, Saadi, Rumi, Hafez, Khayyam) are
in the public domain.

## Files

```text
content/courses/
  index.json                      ["latin", "egyptian", "sumerian", "akkadian", "greek", "persian"]: the courses, in order
  latin/
    course.json                   id, language, icon, folds, titles, the lesson list
    01-letters-and-sounds/
      en.md  fr.md  es.md         the lesson, one file per interface language
      vocab.json                  the lesson's words (vocabulary format 3)
    02-present-first-second/
    …
```

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

`vocabLesson` names the lessons of the vocabulary book. `keys` (optional) lists letters a keyboard lacks; at most 40, each up to four characters; they are offered as buttons under every exercise with fields and write at the cursor of the field last used (Egyptian: `["ꜣ", "ꜥ", "ḥ", "ḫ", "ẖ", "š", "ḳ", "ṯ", "ḏ"]`; Sumerian: `["š", "ĝ", "ḫ", "₂", "₃", "₄", "₅"]`; Akkadian: `["š", "ṣ", "ṭ", "ḫ", "ā", "ē", "ī", "ū", "â", "ê", "î", "û"]`; Greek: the 24 letters and ς; Persian: the 32 letters and آ). Fields follow the direction of the script typed (`dir="auto"`). `lessons` lists the lesson folders in order; a folder not listed is not
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
they appear: text, tables, options. A run of Persian or Arabic words is set
apart in a right-to-left `bdi` in Vazirmatn, so that it keeps its order inside
a left-to-right line. A blank never sits inside emphasis: an
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
| `egyptian` | strict blanks compared by their consonants: *ꜣ ꜥ* (*3*, *'*) and the vowels *a e o* dropped, *j i y* one letter, *w u* one, *ḥ ḫ ẖ kh x* = *h*, *š sh* = *s*, *ṯ tj* = *t*, *ḏ dj* = *d*, *ḳ q* = *k*, dots and hyphens dropped; free answers keep their vowels | Egyptian typed as it is read: *ankh*, *nefer*, *sedjem.n.ef* |

Course folds: Latin `macrons ij uv`, Egyptian `egyptian`, Sumerian
`translit subscripts` (*diĝir* typed *digir*, *e₂* typed *e2*), Akkadian
`translit macrons` (*šalmāku* typed *shalmaku*), Greek `greek` (*logos*, λογος and λόγος are one answer), Persian `persian` (کتاب, *ketâb* and *ketab* are one answer).

The `egyptian` fold makes *h* and *ḥ* one answer, the `greek` fold ε and η,
the `persian` fold the letters of one sound (س ص ث) and the plural ـها:
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
*ketâb*).

At start, the server builds one vocabulary book per course from these files,
`course-<id>`, one lesson per course lesson, imports it when it changed (a
hash in `app_settings`, key `course-vocab:<id>`), and shares it with every
account. *📚 Practise the course vocabulary* opens it.

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
- at least five words per lesson, no word taught twice in a course.

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
