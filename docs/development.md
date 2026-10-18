# Development

- [Setup](#setup)
- [Code layout](#code-layout)
- [Conventions](#conventions)
- [Common changes](#common-changes)
- [Adding a language](#adding-a-language)
- [Before a release](#before-a-release)

## Setup

```sh
npm install
cp .env.example .env
npm run dev
```

`npm run dev` starts two processes, labelled in the output:

- **`api`:** `tsx watch server/index.ts` on port 8787, restarted on every server change.
- **`web`:** Vite on <http://localhost:5173>, with hot reload, proxying `/api` to the API.

The development database is `./data/calcul-colonnes.sqlite`; delete the
folder to start from scratch. To develop against PostgreSQL, set
`DATABASE_URL`.

## Code layout

### `src/` — browser

| File | Role |
|---|---|
| `main.ts` | Entry point: state, rendering of every screen (players, scores, column arithmetic, mode tabs), validation of arithmetic answers |
| `boards.ts` | The two exercise boards: `columnBoard` (+ − ×, carries, partial products) and `divisionBoard` (bracket layout, working lines). Each exposes `read`, `lock` and `focus`. |
| `exercise.ts` | Drawing arithmetic exercises; column counts; reading a row of digit boxes |
| `worksheet.ts` | The A4 PDF worksheet, written by hand (no library) |
| `quiz.ts` | Multiple-choice screens: settings, question, results; review focus |
| `progress.ts` | Progress page of a player |
| `store.ts` | API calls |
| `settings.ts` | Browser settings in `localStorage`, with validation of saved values |
| `i18n.ts` | Interface texts (arithmetic part), current language, column names |
| `quiz-i18n.ts` | Texts of tests and progress, names of the kinds of question, prompts and explanations |
| `dom.ts` | `el()` and `button()` helpers |
| `style.css` | All styles; colours are CSS variables with a dark variant |

### `shared/` — browser and server

| File | Role |
|---|---|
| `types.ts` | Types exchanged over the API |
| `quiz/` | Question generators and test assembly; see [Question generators](question-generators.md) |

### `server/`

| File | Role |
|---|---|
| `index.ts` | Startup: `.env`, database, migrations, backfill, HTTP server, static files |
| `app.ts` | Routes and input validation |
| `repository.ts` | Every SQL query; grading of attempts and tests; progress |
| `db/index.ts` | `Database` interface; choice of engine from the environment |
| `db/sqlite.ts`, `db/postgres.ts` | The two implementations |
| `db/migrate.ts` | Migration runner |
| `migrations/` | Schema, see [Database](database.md#migrations) |
| `check-quiz.ts` | Verification of the generators (`npm run check:quiz`) |
| `copy-to-postgres.ts` | One-off copy SQLite → PostgreSQL |

### TypeScript projects

| Config | Covers | Notes |
|---|---|---|
| `tsconfig.json` | `src/`, `shared/` | DOM types; bundled by Vite |
| `tsconfig.server.json` | `server/`, `shared/`, `vite.config.ts` | Node types; `.ts` extensions in imports |

Both are strict, with `noUncheckedIndexedAccess`. `npm run build` checks both
before building.

## Conventions

- **Determinism in `shared/quiz/`:** no `Math.random`, `Date` or other source of variation; only the `rng` passed in. See [versioning](question-generators.md#versioning) before changing anything that affects what a seed produces.
- **The server decides correctness;** the browser only displays.
- **Every user-visible string goes through a dictionary,** in both languages. Generated questions contain LaTeX and keys only.
- **SQL in the common dialect**, written once in `repository.ts`; read numbers through `Number()` (PostgreSQL returns some as strings).
- **Schema changes only through a new migration file.**
- **Storage in the browser** is wrapped in `try/catch`: private browsing must not break the app.
- **Comments say why,** not what.

## Common changes

| To change | Where |
|---|---|
| Ranges of the column arithmetic | `LEVELS`, `SMALL_LEVELS` in `src/settings.ts` |
| How arithmetic exercises are drawn | `src/exercise.ts` |
| Number of questions offered in tests | `QUIZ_COUNTS` in `shared/quiz/index.ts` (the server accepts 1–30, `MAX_QUESTIONS`) |
| Share of review questions | `REVIEW_SHARE`, `REVIEW_PER_SKILL` in `shared/quiz/index.ts`. Changes what seeds produce with a focus: [bump the version](question-generators.md#versioning). |
| When a kind is "to review" or "mastered" | `skillStatus` in `shared/quiz/progress.ts`. Applies immediately to all history, without a version bump. |
| A new kind of question | [Question generators › Adding a kind](question-generators.md#adding-a-kind-of-question) |
| Colours | CSS variables at the top of `src/style.css` |

## Adding a language

1. **Interface texts:** in `src/i18n.ts`, add a dictionary typed `Record<Key, string>` and register it in `dictionaries`; add its column names in `columns` and an entry in `LANGUAGES`.
2. **Test texts:** in `src/quiz-i18n.ts`, add the dictionary (registered in `dictionaries`) and entries in `LEVEL_NAMES`, `TOPIC_NAMES`, `PROMPTS`, `EXPLANATIONS` and `SKILL_NAMES`. The `Record<Lang, …>` types make the compiler list anything missing.
3. **Notation:** if the language writes functions differently, add KaTeX macros in `macros()` in `src/quiz.ts`, as Spanish does for *sen*.
4. **PDF worksheet:** it uses the standard WinAnsi fonts, which cover Western European languages. Other scripts would need an embedded font.

## Before a release

```sh
npm run build                 # type checks both projects, builds dist/
npm run check:quiz            # if shared/quiz/ changed
```

Then, by hand, in the browser:

1. **Column arithmetic:** one exercise per operation, including a two-digit multiplier and a division with a remainder.
2. **Tests:** finish a test, reload the progress page, and start a test with review.
3. **Language:** switch language on each screen.
4. **Upgrade path:** start the new version once on a copy of the production database. Check that the migrations and the backfill run cleanly and that the scores are unchanged.

Bump `version` in `package.json` and add an entry to `CHANGELOG.md`.

There is no automated browser test suite in the repository yet; the checks
above were run with Playwright during development.
