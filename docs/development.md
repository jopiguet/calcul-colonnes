# Development

- [Setup](#setup)
- [Code layout](#code-layout)
- [Conventions](#conventions)
- [Common changes](#common-changes)
- [Tests](#tests)
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
| `store.ts` | API calls; `auth` calls; `SignedOutError` when the session has ended |
| `auth.ts` | Sign-in screen (and invitation links) and Account page |
| `family.ts` | The Account page's last sections: the account's data (download, deletion), and the owner's family and friends (invitations, content visibility, feedback) |
| `privacy.ts` | The privacy page (`#privacy`), in the three languages |
| `news.ts` | Version, release news (shown once after an update) and *Envoyer un avis*, at the bottom of the home page |
| `landing.ts` | Landing page for first visits, with its texts in the three languages |
| `home.ts` | A player's home page: activities by subject, what is waiting in each; the *← Accueil* bar of activities |
| `vocab.ts`, `vocab-i18n.ts` | A vocabulary book's page: lessons, cards, summary, settings (rōmaji included), and their texts |
| `vocab-stats.ts` | A book's statistics page: figures, charts in plain HTML, hardest words |
| `discover/` | The Discover activities (dice, coins, logic grids), the physics, astronomy and biology labs, what the labs share, their texts; see [Discover](discover.md#code) |
| `update.ts` | New build or stale data in a window left open: reload when quiet, or a *Mettre à jour* bar |
| `auth-i18n.ts` | Their texts and the sign-in error messages |
| `settings.ts` | Browser settings in `localStorage`, with validation of saved values |
| `i18n.ts` | Interface texts (arithmetic part), current language, column names |
| `quiz-i18n.ts` | Texts of tests and progress, names of the kinds of question, prompts and explanations |
| `quiz-i18n-chemistry.ts` | The same for physical chemistry, merged into `quiz-i18n.ts` (as are `quiz-i18n-equilibria.ts`, `quiz-i18n-quantum.ts`, `quiz-i18n-kinetics.ts`, `quiz-i18n-spectroscopy.ts`, `quiz-i18n-statistical.ts`, `quiz-i18n-linux.ts`, `quiz-i18n-chembio.ts`, `quiz-i18n-sql.ts`, `quiz-i18n-rust.ts` and `quiz-i18n-ts.ts`) |
| `dom.ts` | `el()` and `button()` helpers |
| `style.css` | All styles; colours are CSS variables with a dark variant |

### `tools/` — book extractors (Python; pdfplumber for the PDFs)

| File | Role |
|---|---|
| `vocab-extract.py` | Collins *3000 words and phrases* PDF → vocabulary file |
| `vocab-extract-4000.py` | *Vocabulary 4000* PDF → vocabulary file |
| `vocab-extract-japanese.py` | *Japanese vocabulary for English speakers* EPUB → vocabulary file (standard library only) |
| `vocab-extract-lernwortschatz.py` | *Lernwortschatz* word lists (Markdown tables, a folder or a zip) → vocabulary file (standard library only) |
| `vocab-extract-nietzsche.py` | Nietzsche vocabulary CSV → vocabulary file (standard library only) |

### `public/` — copied as is into the build

| File | Role |
|---|---|
| `manifest.webmanifest` | Name, colours and icons when the app is installed on a phone |
| `icons/icon.svg`, `icons/maskable.svg` | The icon's sources; the PNGs are rendered from them at 32, 180, 192 and 512 px |

### `shared/` — browser and server

| File | Role |
|---|---|
| `types.ts` | Types exchanged over the API |
| `quiz/` | Question generators and test assembly; see [Question generators](question-generators.md) |
| `vocab/` | Vocabulary: file format, grading, Leitner boxes, sessions, statistics; see [Vocabulary](vocabulary.md#code) |
| `discover/` | Discover engines and models: two dice, a coin, logic grids, the physics simulations, the astronomy and biology models; see [Discover](discover.md#code) |

### `server/`

| File | Role |
|---|---|
| `index.ts` | Startup: `.env`, database, migrations, backfill, HTTP server, static files |
| `app.ts` | Middleware order, data routes and input validation |
| `admin.ts` | The owner's routes (`/api/admin`): invitations, content visibility, feedback |
| `version.ts` | The app's version, recorded with feedback |
| `check-family.ts` | `npm run check:family` |
| `auth/` | Sign-in: settings, passwords, sessions, providers, routes. See [Authentication](authentication.md#code). |
| `repository.ts` | Every SQL query; grading of attempts and tests; progress |
| `db/index.ts` | `Database` interface; choice of engine from the environment |
| `db/sqlite.ts`, `db/postgres.ts` | The two implementations |
| `db/migrate.ts` | Migration runner |
| `migrations/` | Schema, see [Database](database.md#migrations) |
| `check-quiz.ts` | Verification of the generators (`npm run check:quiz`) |
| `check-gcp.ts` | The Google Cloud answers computed again for `check:quiz` (IAM, firewalls, subnets, Cloud Run, availability) |
| `check-econ.ts` | The economics answers computed again for `check:quiz` (incidence, areas, Pigou, Samuelson, Gini, monopsony, insurance…) |
| `check-calc.ts` | The calculus answers computed again for `check:quiz` (limits, slopes, Newton, Riemann and Simpson sums, Euler, Taylor, Green, Brownian moments…) |
| `quiz-bank.ts` | Question bank storage, import, flags; `/api/quiz/bank`, `/api/quiz/flags`. See [Question bank](question-bank.md). |
| `quiz-import.ts`, `quiz-flags.ts` | `npm run quiz:import`, `npm run quiz:flags` |
| `vocab.ts` | Vocabulary storage, import, sessions, answers; `/api/vocab` |
| `vocab-import.ts`, `check-vocab.ts` | `npm run vocab:import`, `npm run check:vocab` |
| `characters-build.ts` | `npm run characters:build`: the kanji and kana book from the EDRDG dictionaries |
| `check-discover.ts` | `npm run check:discover` |
| `check-physics.ts` | `npm run check:physics` |
| `check-astronomy.ts`, `check-biology.ts` | `npm run check:astronomy`, `npm run check:biology` |
| `check-tour.ts` | `npm run check:tour` |
| `copy-to-postgres.ts` | One-off copy SQLite → PostgreSQL |

### TypeScript projects

| Config | Covers | Notes |
|---|---|---|
| `tsconfig.json` | `src/`, `shared/` | DOM types; bundled by Vite |
| `tsconfig.server.json` | `server/`, `shared/`, `vite.config.ts` | Node types only; `.ts` extensions in imports |
| `tsconfig.tests.json` | `tests/`, `shared/`, `playwright.config.ts` | Server settings plus DOM types, for code run in the page |

All are strict, with `noUncheckedIndexedAccess`. `npm run build` checks all
three before building.

## Conventions

- **Determinism in `shared/quiz/`:** no `Math.random`, `Date` or other source of variation; only the `rng` passed in. See [versioning](question-generators.md#versioning) before changing anything that affects what a seed produces.
- **The server decides correctness;** the browser only displays.
- **Every user-visible string goes through a dictionary,** in both languages. Generated questions contain LaTeX and keys only.
- **Every data query takes a `Scope`** (account, and player for a player's own session). A new route reads it with `scope(c)`, never from the request body.
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
| Colours, fonts, square size | CSS variables at the top of `src/style.css`: light theme (squared paper) and dark theme (blackboard) |

## Adding a language

English was added this way; follow the `en` entries as a model.

1. **Interface texts:** in `src/i18n.ts`, add a dictionary typed `Record<Key, string>` and register it in `dictionaries`; add its column names in `columns` and an entry in `LANGUAGES`.
2. **Test texts:** in `src/quiz-i18n.ts`, add the dictionary (registered in `dictionaries`) and entries in `LEVEL_NAMES`, `TOPIC_NAMES`, `PROMPTS`, `EXPLANATIONS`, `SKILL_NAMES` and `MISTAKE_NAMES`. The `Record<Lang, …>` types make the compiler list anything missing.
3. **Tests:** add the language to `LANGUAGES` in `tests/e2e/languages.spec.ts`.
4. **Notation:** if the language writes functions differently, add KaTeX macros in `macros()` in `src/quiz.ts`, as Spanish does for *sen*.
5. **PDF worksheet:** it uses the standard WinAnsi fonts, which cover Western European languages. Other scripts would need an embedded font.

## Tests

Automated checks:

| Command | What it covers | Time |
|---|---|---|
| `npm run check:quiz` | The question generators: correctness, distinct options, mistake labels, rendering, determinism. See [verification](question-generators.md#verification). | about a minute |
| `npm run check:vocab` | Vocabulary grading and scheduling; with a file, every entry. See [Vocabulary](vocabulary.md#how-answers-are-graded). | a second |
| `npm run check:family` | Invitations (`REGISTRATION=invite`), the owner's role, private books and bank, export, account deletion, `robots.txt`, through the real routes on a fresh SQLite file. See [Authentication › Family release](authentication.md#family-release). | a second |
| `npm run check:discover` | The Discover engines: exact formulas against brute force, the generator on millions of trials, 1,200 logic grids. See [Discover](discover.md#checks-and-tests). | under 10 seconds |
| `npm run check:physics` | The physics playground: every simulation against its exact solution and the conservation laws. See [Discover](discover.md#physics-checks). | about 15 seconds |
| `npm run check:astronomy` | The astronomy models against an integration, Newton's gravity and centuries of eclipses. See [Discover](discover.md#astronomy-checks). | a few seconds |
| `npm run check:biology` | The chemistry and biology models: bonds, crosses, diffusion, predators and prey. See [Discover](discover.md#biology-checks). | a second or two |
| `npm run check:tour` | The guided tour: the session flag for an account and a player's own login, migration 023 on existing rows, the same pages in every language, every chip a real label of the app. See [User guide › Guided tour](user-guide.md#guided-tour). | a second |
| `npm run test:e2e` | The whole app in a browser: 101 tests | about two minutes |
| `npm run test:e2e:postgres` | The same on PostgreSQL (`E2E_DATABASE_URL`, emptied first); CI runs both | about three minutes |

### Browser tests

```sh
npx playwright install chromium   # once, and after a Playwright update
npm run test:e2e
PLAYWRIGHT_CHROMIUM=/path/to/chrome npm run test:e2e   # or a Chromium already installed
npx playwright test progress      # one file
npx playwright show-trace test-results/<test>/trace.zip   # after a failure
```

Playwright builds the app and starts its own server on port 8799, with a
fresh SQLite file in `test-results/` (`tests/e2e/server.ts`), and a mock
OpenID provider on port 8798 (`tests/e2e/mock-oidc.ts`). The variables set in
`playwright.config.ts` take precedence over `.env`, so a development
database, SQLite or Neon, is never touched, and real providers configured in
`.env` are switched off. With `E2E_DATABASE_URL`, the server runs on that
PostgreSQL database instead, after dropping and recreating its `public`
schema: never point it at a database you want to keep. Tests run one after the other against that shared
server; each signs up its own account.

| File | Covers |
|---|---|
| `auth.spec.ts` | Sign-up, sign-in, sign-out; cookie attributes; 401 without a session; cross-site refusal; isolation between accounts; rate limit; provider sign-up and sign-in, email takeover refused, cancel; linking a provider and the last method; players' own sign-in by username and by provider; signing out other devices |
| `landing.spec.ts` | Landing page to sign-up and sign-in and back; translations; returning browsers open on sign-in |
| `vocab.spec.ts` | Lessons from the file; a multiple-choice session with a wrong answer asked again and boxes on the server; written answers with accents, articles and the Spanish letters; reviews; the English definition book (definitions chosen, words written, same-meaning roots, examples); scope |
| `shelves.spec.ts` | A language with two books: one card, sessions across the books ticked (cards naming their book, wrong options from it), a book left out, opened and back, the books apart on the home page; a section skipped and put back, a word skipped from its card; German forms and French articles in written answers |
| `players.spec.ts` | Creating, remembering, switching and deleting players; duplicate names; cascade delete |
| `arithmetic.spec.ts` | Units-first typing and server grading, carries, refused answers, two-digit multiplication lines, division with remainder, remembered settings, the PDF worksheet |
| `quiz.spec.ts` | A test graded identically by the browser, the server and an independent rebuild from its seed; keyboard; language change mid-test; blanks; replay; giving up |
| `progress.spec.ts` | Mistakes coming back in the next test; progress page against the API; mistake recorded for each wrong answer and shown |
| `languages.spec.ts` | Every screen in French, Spanish and English with no missing text, vocabulary included; language of the landing page on a first visit |

`helpers.ts` holds the shared steps. `rebuild()` regenerates a submitted test
with `shared/quiz` directly, so the tests check the server's grading against
an independent computation rather than against itself.

Each test should create its own account and player (`newPlayer` signs up a
fresh account first) and assert on them only, so tests stay independent of
their order. Use `page.request` for API calls: it carries the page's session
cookie, the `request` fixture does not.

## Before a release

```sh
npm run build          # type checks the three projects, builds dist/
npm run check:quiz     # if shared/quiz/ changed
npm run check:vocab
npm run check:discover
npm run check:physics
npm run check:astronomy
npm run check:biology
npm run check:tour
npm run test:e2e
```

Then start the new version once on a **copy** of the production database.
Check that the migrations and the backfills run cleanly and that the scores
are unchanged. Bump `version` in `package.json` and add an entry to
`CHANGELOG.md`.
