# Luma

A web app for practising arithmetic the way it is written on paper, for
multiple-choice tests in secondary-school and first-year university
mathematics, and for Spanish vocabulary with spaced repetition. French, Spanish
and English interface; one server, one small database; sign-in by password or
Google, Microsoft, GitHub and other OpenID providers; installable on a phone's
home screen.

The project and its folder keep their first name, `calcul-colonnes`.

<p>
  <img src="docs/images/landing.png" width="820" alt="Landing page: an addition being written in columns on squared paper">
</p>

<p>
  <img src="docs/images/columns-addition.png" width="200" alt="Addition in columns with a carry">
  <img src="docs/images/columns-division.png" width="200" alt="Euclidean division in the paper layout">
  <img src="docs/images/quiz-question.png" width="200" alt="A multiple-choice question">
  <img src="docs/images/progress.png" width="200" alt="Progress page of a player">
</p>

## What it does

**Column arithmetic** — for children learning the written methods.

- Addition, subtraction, multiplication and Euclidean division, laid out as on paper.
- Answers are typed from the units leftwards; an optional carry row sits above the columns.
- Multiplication by a two-digit number gets one line per partial product, then the total.
- Division uses the bracket layout, with working lines under the dividend, the quotient under the divisor, and the remainder.
- Adjustable ranges: largest number 20 to 1000; multiplier and divisor 2 to 12.
- A one-click A4 PDF worksheet of 20 operations, ready to print.

**Multiple-choice tests (QCM)** — derivatives, integrals, trigonometry, limits,
exponentials and logarithms, at *lycée / bachillerato* or university level.

- Questions are generated, not drawn from a fixed bank: 39 kinds of question, each with its own parameters.
- The wrong options are typical mistakes, such as an exponent not lowered, the inner derivative forgotten or a sign error.
- Every test ends with a corrected review and a short explanation per question.
- Each test is defined by a seed; the server regenerates it to grade it, so the browser is never trusted with the result.
- An automated check verifies tens of thousands of generated questions numerically, independently of the generators.

**Spanish vocabulary** — from a phrase book you own, imported once.

- Its chapters are the lessons and its sections the sections; the Collins *3000 words and phrases* layout is read automatically from the PDF.
- Spaced repetition with Leitner boxes: each word, in each direction, comes back after 10 minutes, then 1, 3, 7, 16 and 35 days, and starts again after a mistake.
- Learn a section or a chapter; review a section, a chapter or the whole vocabulary, weakest words first.
- Multiple choice while a word is new, written answers once it is known. Accents and one-letter slips are forgiven with the spelling shown; a wrong article is not.
- The book's own notation is understood: `el amigo / la amiga`, `Buenas tardes / noches`, `embarcar(se)`.

**Players and progress**

- Scores are kept per player in SQLite, or in PostgreSQL (Neon) with one setting.
- Every test answer is filed under its kind of question. A kind answered wrong comes back in later tests until it has been answered right twice in a row.
- Every wrong option stands for a typical mistake (36 types, such as *inner derivative forgotten* or *solution missed*). The mistake is shown in the corrections and counted per player.
- A progress page shows each player's status per kind of question, their most frequent mistakes, and their results per arithmetic operation.

## Quick start

Requirements: Node.js 20.12 or later (developed on Node 22).

```sh
npm install
cp .env.example .env
npm run dev
```

Open <http://localhost:5173> and create your account. The API runs on port
8787. The SQLite database is created in `./data/` on first start. To try a
sign-in provider in development, set `PUBLIC_URL=http://localhost:5173` so the
provider returns through Vite.

For production, one process serves both the built app and the API:

```sh
npm run build
npm start          # http://localhost:8787
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | API (with reload) and Vite dev server together |
| `npm run build` | Type-checks the browser and server code, then builds the app into `dist/` |
| `npm start` | Runs the server: API, plus the built app if `dist/` exists |
| `npm run check:quiz` | Generates thousands of tests and verifies every question (see [question generators](docs/question-generators.md#verification)) |
| `npm run test:e2e` | Browser tests of the whole app, on a separate server and database (see [Development › Tests](docs/development.md#tests)) |
| `npm run vocab:import -- data/vocab.json` | Imports a vocabulary file, keeping progress on unchanged entries (see [Vocabulary](docs/vocabulary.md)) |
| `npm run check:vocab` | Checks the vocabulary grading; with a file, every entry |
| `npm run db:copy-to-postgres` | One-off copy of the SQLite data into the PostgreSQL database named by `DATABASE_URL` |

## Configuration

Settings are read from `.env` (see `.env.example`):

| Variable | Default | Meaning |
|---|---|---|
| `DATABASE_URL` | *(empty)* | PostgreSQL connection string. When set, the server uses PostgreSQL instead of SQLite. |
| `SQLITE_PATH` | `./data/calcul-colonnes.sqlite` | SQLite file, used when `DATABASE_URL` is empty |
| `PORT` | `8787` | Port of the server |
| `PUBLIC_URL` | `http://localhost:$PORT` | Address of the app as typed in the browser; `https://` makes cookies `Secure` |
| `REGISTRATION` | `open` | `closed` allows only the first account |
| `SESSION_DAYS`, `COOKIE_SECURE`, `TRUST_PROXY` | | See [Deployment › HTTPS and sign-in](docs/deployment.md#https-and-sign-in) |
| `GOOGLE_*`, `MICROSOFT_*`, `GITHUB_*`, `OIDC_*` | *(empty)* | Sign-in providers, see [Authentication](docs/authentication.md#providers-1) |

## Documentation

| Document | For |
|---|---|
| [User guide](docs/user-guide.md) | Parents and teachers: every screen, setting and keyboard shortcut |
| [Architecture](docs/architecture.md) | How the browser, server and shared code fit together; design decisions |
| [Question generators](docs/question-generators.md) | The 39 kinds of question, how a generator works, adding one, verification, versioning |
| [Vocabulary](docs/vocabulary.md) | Importing a book, the file format, the learning method, how answers are graded |
| [Authentication](docs/authentication.md) | Accounts and players, cookies, providers setup, passkeys and email links to come |
| [Database](docs/database.md) | Schema, migrations, SQLite and PostgreSQL |
| [API](docs/api.md) | Every endpoint with request and response examples |
| [Deployment](docs/deployment.md) | Production setup, Neon, backups, security |
| [Development](docs/development.md) | Code layout, conventions, adding a language, checks before a release |
| [Changelog](CHANGELOG.md) | What changed, version by version |

## Project layout

```
src/            browser app (TypeScript, no framework)
shared/         code used by both browser and server
  quiz/         question generators, test assembly, progress rules
server/         API (Hono), database access, migrations, scripts
tests/e2e/      browser tests (Playwright)
docs/           documentation
```

A file-by-file description is in [Development](docs/development.md#code-layout).

## Sign-in

Accounts belong to adults and own the players; a child can also get a sign-in
of their own and then sees only their own work. Sign-in by email and
password, and by Google, Microsoft, GitHub or any OpenID Connect provider once
configured. Sessions are server-side, in an `HttpOnly` cookie. Serve it over
HTTPS when it leaves `localhost`. See [Authentication](docs/authentication.md).
