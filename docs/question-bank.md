# Question bank

The physical chemistry, public economics and calculus tests mix two sources:

- **Calculations,** generated like the maths questions: one generator per kind, in `shared/quiz/gases.ts`, `firstlaw.ts`, `secondlaw.ts`, `phases.ts`, `mixtures.ts` and `equilibrium.ts`. See [Question generators](question-generators.md#physical-chemistry).
  For economics, `shared/quiz/econ-output.ts`: see [Question generators › Economics](question-generators.md#economics). For calculus, `shared/quiz/calc-output.ts`: see [Question generators › Calculus](question-generators.md#calculus).
- **Concept questions,** written from textbooks: the *question bank*. It holds several books (6.26.0): Atkins for chemistry, eight books for economics, six for calculus (6.28.0). They are not in the project. They come from a file the author keeps in `data/`, imported into the database like a vocabulary book. Only the owner's account (the first one) sees them, unless the owner shares them from the Account page; other accounts get an empty bank, and their chemistry tests are calculations only (see [Authentication › Family release](authentication.md#family-release)).

The bank has two levels. **Core** questions join the calculations in the
*Fondamental* test (level `chemistry`). **Advanced** questions, reasoning and
derivations a step beyond the course, make the *Avancé* test (level
`chemistryAdvanced`) on their own: it has no calculations. Economics works
the same way with `econ` and `econAdvanced`, except that its advanced test
keeps generated questions too; so does calculus, with `calc` and
`calcAdvanced`. A test draws only units of its own subject
(`bankTopicsOf`): a chemistry test never gets an economics unit, an
economics test never a calculus one.

The book's text and the bank file are never committed or shipped: `data/` is
excluded from the repository and from every archive. Tests use an invented
banks, `tests/e2e/fixtures/bank.json` (chemistry),
`tests/e2e/fixtures/econ-bank.json` (two invented economics books) and
`tests/e2e/fixtures/calc-bank.json` (two invented calculus books).

| File | Content |
|---|---|
| `shared/quiz/bank.ts` | `Bank`, `BankUnit`, `BankQuestion`; a bank question as a test question (`bankDraft`); its skill id (`bankSkill`) |
| `shared/quiz/bank-file.ts` | The file format, `parseBankFile` (validation), `toBank` |
| `shared/quiz/index.ts` | `registerBank`, `bankRevision`; bank kinds join the generators of the `chemistry` level |
| `server/quiz-bank.ts` | `BankStore`: import, load, refresh, flags; routes `/api/quiz/bank` and `/api/quiz/flags` |
| `server/quiz-import.ts`, `server/quiz-flags.ts` | The two commands below |

## Commands

```sh
npm run quiz:import -- data/atkins-12-concepts.json            # into the database of .env
npm run quiz:import -- data/econ-concepts.json                  # the economics books, next to Atkins
npm run quiz:import -- data/calc-concepts.json                  # the calculus books, next to both
npm run quiz:import -- data/atkins-12-concepts.json --replace  # a unit moved to another topic or book
npm run quiz:flags                                              # questions players flagged
npm run quiz:flags -- --resolve 12                              # mark flag 12 as dealt with
```

Both run against the database of `.env`: SQLite, or Neon when `DATABASE_URL`
is set. On Cloud Run, `QUIZ_BANK_FILE` can name one or more files,
comma-separated, that the maintenance job imports when the database has no
bank yet. Later imports are always run by hand.

An import concerns the books of its file only: questions of other books are
left alone, so the Atkins, economics and calculus files are imported
separately, in any order. A unit or a question id already belonging to
another book is refused.

## The file

Format 1, one book:

```json
{
  "format": 1,
  "book": { "id": "atkins-12", "title": "Atkins' Physical Chemistry, 12th edition", "source": "Atkins" },
  "units": [
    { "id": "1A", "topic": "gases", "title": { "en": "The perfect gas" } }
  ],
  "questions": [
    {
      "id": "1A-01", "unit": "1A", "section": "1A.2", "level": "core",
      "prompt":  { "en": "What does Boyle's law state?", "fr": "Que dit la loi de Boyle ?", "es": "¿Qué dice la ley de Boyle?" },
      "correct": { "en": "At constant $T$, $pV$ is constant" },
      "wrong":  [ { "en": "…" }, { "en": "…" }, { "en": "…" } ],
      "explanation": { "en": "…" }
    }
  ]
}
```

Format 2, several books (the economics file): `books` is a list, and each
unit says its `book`.

```json
{
  "format": 2,
  "books": [
    { "id": "gruber", "title": "Gruber, Public Finance and Public Policy (3rd ed.)", "source": "Gruber" },
    { "id": "barr", "title": "Barr, Economics of the Welfare State (5th ed.)", "source": "Barr" }
  ],
  "units": [
    { "id": "GR07", "book": "gruber", "topic": "econMarketFailure", "title": { "en": "Public goods" } }
  ],
  "questions": [ { "id": "GR07-01", "unit": "GR07", "section": "7.1", "…": "…" } ]
}
```

- **Texts by language.** Every text is an object `{"en": …, "fr": …, "es": …}`. English is required; French and Spanish may be missing, and then English is shown, marked `lang="en"`. Nothing in the code holds a question's text.
- **Decimal commas.** French and Spanish texts write `3,4` in prose and `3{,}4` inside a formula (the braces keep KaTeX from adding a space).
- **`level`:** `core` (the default) or `advanced`.
- **Formulas** go between `$…$` and are rendered by KaTeX; an odd number of `$` is refused.
- **Exactly three wrong answers,** all different from each other and from the right one.
- **Units** are the book's topics ("1A"). Each belongs to one test topic: `gases`, `firstLaw`, `secondLaw`, `phases`, `mixtures`, `equilibrium`, `quantum`, `atoms`, `spectroscopy`, `resonance`, `statistical`, `kinetics` or `dynamics` (Focuses 1 to 8, 11 to 13, 17 and 18); for economics `econWelfare`, `econMarketFailure`, `econPublicChoice`, `econIncidence`, `econOptimalTax`, `econTaxDesign`, `econSocialInsurance`, `econRedistribution` or `econLabour`; for calculus the thirteen `calc…` topics, `calcLimits` to `calcStochastic` (see [Question generators › Calculus](question-generators.md#calculus)). Unit ids are unique across books: the calculus file uses `SW` (Stewart), `FO`, `BK`, `BC`, `MC` and `BD` (Baldi). A unit at a level is one kind of question, `topic.conceptsUNIT` or `topic.advancedUNIT` (`gases.concepts1A`, `gases.advanced1A`): its progress and review work like a generator's.
- **`source`** is shown as a badge on each written question ("Atkins 1A.2", "Gruber 7.1", "Stewart 14.6").

## Revisions

A saved test is a seed (see [Architecture › A test is a seed](architecture.md#a-test-is-a-seed)),
so the questions it drew must stay available. Each import that changes
anything raises the bank's **revision**; a test stores the revision it drew
from (`quiz_results.bank`) and is rebuilt from the questions available at
that revision.

| Change in the file | Effect |
|---|---|
| New question | Available from the next revision. Old tests do not see it. |
| Corrected text (a typo, a better wrong answer, a translation added) | Updated in place. Old tests show the new text; the right answer must stay the same answer. |
| Question removed | Kept in the database, with the revision that removed it. New tests no longer draw it. |
| Removed id coming back | Refused: give it a new id. |
| Question moved to another unit or level | Refused: give it a new id. |
| Unit moved to another topic, another book | Refused unless `--replace`. |
| Nothing | Nothing, not even the revision. |

The import is one transaction: refused, it changes nothing.

The browser loads the bank once (`GET /api/quiz/bank`) and generates tests
itself, as for the maths. The server reloads the bank before grading when its
revision has changed, so a test begun before an import is still graded with
the revision it was made with.

## Flags

Every question in a test's corrections has a *Flag this question* button,
with an optional note. Flags are stored in `quiz_flags` with the kind of
question and, for a bank question, its id; for a generated one, its formula.
`npm run quiz:flags` lists the open ones with the question and its right
answer. Correct the file, import it, then resolve the flag.

## Checking a bank file

```sh
npm run check:quiz -- --bank data/atkins-12-concepts.json --bank data/econ-concepts.json --bank data/calc-concepts.json   # 400 seeds per level with these banks
```

The usual verification (see [Question generators](question-generators.md#verification)),
with the given bank instead of the invented one: every written question drawn
is rendered in KaTeX in English, French and Spanish.

## Writing questions

The Atkins bank is written Topic by Topic from the book's text, extracted
column by column into `data/atkins-text/`. In `data/atkins-bank/`, all kept
out of the project:

| File | Content |
|---|---|
| `1A.json` … | Core questions of a Topic, in English |
| `fr/1A.json`, `es/1A.json` | Their translations, by id |
| `advanced/1A.json` | Advanced questions, written in the three languages |

`python3 data/atkins-assemble.py` builds `data/atkins-12-concepts.json` from
them. It refuses a question without its translations, or whose formulas
differ between languages (decimal commas and words in `\text{…}` aside).

- **One idea per question,** taken from a section of the Topic; `section` says which.
- **Wrong answers are real mistakes:** a confused condition, an inverted sign, a law for the wrong case. Not jokes.
- **No giveaway by length:** the right answer is not much longer or more precise than the others.
- **The explanation says why,** in one or two sentences, with the formula.
- **Calculations belong in generators,** not in the bank: a generator gives new numbers every time.
- **Advanced questions** need more than recall: a situation the book does not spell out (a free expansion of a van der Waals gas, supercooled water freezing), a step of a derivation, the condition a result rests on, a consequence one Maxwell relation further.
- **Translations** follow the usual terms of each language: *premier principe*, *fonction d'état*, *gaz parfait*; *primer principio*, *función de estado*, *gas perfecto*.

| Release | Units | Questions |
|---|---|---|
| 6.5.0 | 1A–3E (Focus 1 gases, 2 First Law, 3 Second and Third Laws) | 155, English |
| 6.6.0 | The same, in French and Spanish too; advanced level | 155 core, 61 advanced |
| 6.9.0 | 4A–6D (Focus 4 physical transformations, 5 mixtures, 6 chemical equilibrium) | 291 core, 112 advanced |
| 6.13.0 | 7A–8C (Focus 7 quantum theory, 8 atomic structure and spectra): 34 units | 383 core, 151 advanced |
| 6.15.0 | 17A–18E (Focus 17 chemical kinetics, 18 reaction dynamics): 46 units | 501 core, 199 advanced |
| 6.16.0 | 11A–12D (Focus 11 molecular spectroscopy, 12 magnetic resonance): 57 units | 594 core, 236 advanced |
| 6.17.0 | 13A–13F (Focus 13 statistical thermodynamics): 63 units | 647 core, 257 advanced |

## The economics bank

Written in 6.26.0 from eight books, one unit per chapter used, ids by book:
`GR` Gruber, *Public Finance and Public Policy*; `ST` Stiglitz and
Rosengard, *Economics of the Public Sector*; `BA` Barr, *Economics of the
Welfare State*; `TD` Mirrlees et al., *Tax by Design*; `HM` Hindriks and
Myles, *Intermediate Public Economics*; `KA` Kaplow, *The Theory of Taxation
and Public Economics*; `ES` Ehrenberg and Smith, *Modern Labor Economics*;
`TR` Tresch, *Public Finance: A Normative Theory*. The books' text is
extracted into `data/econ-text/`; the questions are written in
`data/econ-bank/`, one Python file per topic with the three languages side by
side, and `python3 data/econ-bank/assemble.py` builds
`data/econ-concepts.json`. It refuses duplicate ids or options, a Spanish
question without `¿`, and reports how often the right answer is the longest:
the `balance*.py` files lengthen wrong answers until that is close to chance.

| Release | Units | Questions |
|---|---|---|
| 6.26.0 | 58 units from 8 books, 9 topics | 165 core, 62 advanced |

## The calculus bank

Written in 6.28.0 from six books, Stewart's chapters as the outline and the
others filling in, one unit per chapter used, ids by book: `SW` Stewart,
*Calculus* (8th ed.); `FO` Foerster, *Calculus: Concepts and Applications*;
`BK` Brokate, Manchanda and Siddiqi, *Calculus for Scientists and
Engineers*; `BC` Stewart and Day, *Biocalculus*; `MC` Gründers, *Math Made
Clear*; `BD` Baldi, *Stochastic Calculus*. The books' text is extracted into
`data/calc-text/`; the questions are written in `data/calc-bank/` (one file
per group of topics, plus `extra*.py` and `balance.py`), and
`python3 data/calc-bank/assemble.py` builds `data/calc-concepts.json` with
the same checks as the economics bank.

| Release | Units | Questions |
|---|---|---|
| 6.28.0 | 45 units from 6 books, 13 topics | 180 core, 48 advanced |
