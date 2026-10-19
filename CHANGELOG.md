# Changelog

## 5.0.0

- **Home page:** after choosing a player, the activities grouped by subject, *Mathématiques* (column arithmetic, QCM) and *Langues* (one per vocabulary book), each with what is waiting: kinds of question to review, words due. Every activity has *← Accueil*; the row of tabs is gone. Each visit starts on the home page.
- **Several vocabulary books.** A book is a *translation* (Spanish → English) or a *definition* book (an English word and its English definition).
- **English vocabulary** from *Vocabulary 4000*: `tools/vocab-extract-4000.py` reads the 3,929 words (26 letters, sections of about 25 words) and the 221 prefixes, roots and suffixes with their examples. The quizzes and the *Idiom & Usage* part are not read.
- **Definition books:** a definition is always chosen from four, the word can be written. An example is shown after the answer when the book gives one.
- **Same meaning, same answer:** a written answer right for another entry with the same prompt counts as right (*macro* or *magn* for "large"), and such entries are never each other's wrong option.
- **File format 2:** one book per file, `term` and `meaning`, optional `subtitle` and `note`. Format 1 files (4.2) are still read. `VOCAB_FILE` takes several files.
- Database migration `008`: `vocab_books`; lessons belong to a book; `term`, `meaning`, `title`, `subtitle`, `note`. The Spanish book already imported becomes `collins-spanish`, with its progress. The migration runner can now rebuild a referenced SQLite table safely.
- **API (breaking):** `GET /api/vocab/books` replaces `/api/vocab/lessons`; sessions on a whole book are `kind=all&id=<book>`; `kind=due` is gone. Progress has per-book totals; cards carry their languages; answers carry the note.
- Browser tests: 39, with an invented English book.

## 4.3.0

- **Review at every level:** *Réviser* on a section, *Réviser la leçon* on a chapter, *Réviser tout le vocabulaire* on everything. A review takes only the words already started, due or not: those due first, then the weakest, then those unseen for the longest time.
- **Answering ahead of time does not move a word up:** right before its review date, it keeps its box and date; wrong, it goes back to box 1. This also applies to the repeat of a mistake at the end of a session.
- **Cards per session:** 15, 30 or 50.
- *Toute la leçon* is now *Apprendre la leçon*.
- API: `purpose` (`learn`, `review`, `due`) and `kind=all` on `GET /api/vocab/session`; up to 60 cards. `kind=due` still works.
- `npm run check:vocab` checks the three kinds of session and the rule for early answers.
- Browser tests: 38.

## 4.2.1

- **Named Luma:** the browser tab reads *Luma – Mon cahier*, *Luma – Mi cuaderno* or *Luma – My exercise book*, and the landing and sign-in pages show *Luma*. The PDF worksheet keeps its title *Calcul en colonnes*.
- **Installable on a phone:** web app manifest, icons (squared paper, red margin, pen-blue L; standard, maskable and Apple sizes), theme colour for light and dark, full screen without the browser's bar. Chromium reports no installability errors.
- Secondary buttons (player, scores, account) were transparent over the squared paper; they now have a paper background.
- The vocabulary tab's icon is 💬, readable on the selected blue tab.
- The landing page presents the Spanish vocabulary too.
- Content keeps clear of the notch and the home bar when installed.

## 4.2.0

- **Spanish vocabulary tab** (*💬 Vocabulaire*), from a phrase book you own: its chapters are the lessons, its sections the sections.
- **Spaced repetition** with Leitner boxes, per word and per direction (Spanish → meaning, meaning → Spanish): 10 minutes, then 1, 3, 7, 16 and 35 days; back to the start after a mistake, which is also asked again at the end of the session.
- **Multiple choice and written answers:** multiple choice while a word is new, written once it is known, or either one always. Wrong options come from the same section. Phrases of more than four words stay multiple choice.
- **Grading of written answers** (shared by browser and server): accents and one-letter slips forgiven with the spelling shown; a missing or wrong article counted wrong; the book's alternatives (`/`), optional brackets and `...` understood. Buttons for *á é í ó ú ü ñ ¿ ¡*.
- **`tools/vocab-extract.py`** reads a Collins *3000 words and phrases* PDF into a JSON file; **`npm run vocab:import`** imports it, keeping progress on entries that did not change; or `VOCAB_FILE` imports it once at startup. No book content is part of the project.
- `npm run check:vocab`: 44 grading cases and the scheduling rules; with a file, every entry.
- Database migration `007`: `vocab_lessons`, `vocab_sections`, `vocab_entries`, `vocab_progress`, `vocab_answers`. `db:copy-to-postgres` copies them.
- API: `/api/vocab/lessons`, `/progress`, `/session`, `/answers`.
- The database layer gains transactions on one connection.
- Browser tests: 37, with an invented vocabulary.

## 4.1.0

- **Landing page** for first visits: what the app does, with a column addition written as the app teaches it (units first, then the carry), and real samples of a division, a quiz formula and a kind of question to review. French, Spanish and English. A browser that has been signed in before opens directly on the sign-in form.
- **New look:** squared exercise-book paper in the light theme, a blackboard in the dark theme; pen blue for actions and what the child writes, red for mistakes.
- **Atkinson Hyperlegible** fonts, bundled: unambiguous digits and letters for text, boards and quizzes.
- Sign-in and sign-up have their own addresses (`#sign-in`, `#sign-up`), and a link back to the presentation.
- Browser tests: 33.

## 4.0.2

- **`HOST`** setting: listen on `127.0.0.1` only, behind a tunnel or a local reverse proxy.
- **Client address behind a proxy:** `CF-Connecting-IP` when present, otherwise the **last** `X-Forwarded-For` entry. The first entry, used before, could be set by the client to get around the sign-in rate limit.
- Documentation: [Cloudflare Tunnel](docs/deployment.md#cloudflare-tunnel).

## 4.0.1

- **Fixed:** sign-in and sign-up were refused (`403 cross_site`) through the development server on port 5173. The Vite proxy rewrote the `Host` header; it now keeps it.
- A sign-in refused for coming from another address now says so, with the expected address, instead of a generic error.
- When the browser drops the session cookie after a successful sign-in (an `https` `PUBLIC_URL` opened over `http`), the app says so instead of showing the sign-in screen again.
- `GET /api/auth/options` includes `publicUrl`.

## 4.0.0

**Sign-in is now required.** After upgrading, create your account first: the
first account receives every existing player and their results.

- **Accounts and players:** an account (parent, teacher) owns players and sees all their results. A player can also get a sign-in of their own, by username and password or by a provider, and then sees only their own work.
- **Email and password**, hashed with scrypt.
- **Google, Microsoft, GitHub and any OpenID Connect provider**, each on when configured. Authorization code with PKCE and `state`. A provider is never linked to an existing account just because the email matches.
- **Account page:** ways to sign in with link and remove, password change, players' own sign-in, sign out other devices.
- **Cookie sessions:** random tokens stored as SHA-256, `HttpOnly`, `SameSite=Lax`, `Secure` and `__Host-` with HTTPS, 30 days after last use.
- **Protection:** cross-site requests that change data are refused; sign-in attempts are rate limited per address and per identifier.
- **Prepared:** passkeys and email links fit the new `credentials` table without a migration; see [Authentication](docs/authentication.md#adding-passkeys-and-email-links).
- Player names are unique per account.
- Database migration `006`: `accounts`, `credentials`, `sessions`, `auth_flows`; `account_id` on `users`.
- API: `/api/auth/*`; every data route needs a session (`401`) and is limited to the session's players.
- `npm run db:copy-to-postgres` also copies accounts and sign-in methods.
- New settings: `PUBLIC_URL`, `COOKIE_SECURE`, `SESSION_DAYS`, `REGISTRATION`, `TRUST_PROXY`, `AUTH_ATTEMPTS_PER_ADDRESS`, and the provider settings.
- Browser tests: 30, with a mock OpenID provider.
- Fixed a test that failed when a quiz drew a sine, which Spanish renders as *sen*.

## 3.2.0

- **Mistakes tracked:** every wrong option is labelled with the typical mistake it stands for (36 types). The mistake is named in the corrections, recorded with the answer, and the progress page lists each player's most frequent mistakes.
- **Mistakes for earlier tests** are filled in at startup by regenerating them from their seed.
- **English interface,** alongside French and Spanish; a first visit uses the browser's language when the app has it.
- **Browser test suite** in the project: `npm run test:e2e` (Playwright, 21 tests, isolated server and database).
- `npm run check:quiz` also checks that every wrong option carries a mistake label.
- Database migration `005`: `mistake` on `quiz_answers`.
- API: `mistakes` in `GET /api/users/:id/profile`.

## 3.1.0

- **Mistakes tracked per player.** Every test answer is filed under its kind of question (39 kinds); each kind is *to review*, *in progress* or *mastered*.
- **Review in tests.** *🔁 Revoir mes erreurs*, on by default, brings the kinds to review back into new tests until they are answered right twice in a row.
- **Progress page per player:** kinds of question with their latest answers, and column arithmetic per operation. Opened from the tests or by clicking a name on the Scores screen.
- **Existing tests imported:** tests saved before this version are regenerated from their seed at startup to fill the history.
- **Generator version 2:** fixes duplicate-option removal treating ±∞ as equal to every number, which had silently excluded every question with an infinite answer. Each test now stores its generator version; version 1 tests are rebuilt as they were.
- **Kind availability by version:** new kinds of question can be added without changing older tests.
- Database migration `004`: `quiz_answers` table, `focus` and `version` columns.
- API: `GET /api/users/:id/profile`; `focus` and `version` in `POST /api/quizzes`.

## 3.0.0

- **Multiple-choice tests:** derivatives, integrals, trigonometry, limits, exponentials and logarithms, at *lycée* or university level.
  - Generated questions, with wrong options built from typical mistakes.
  - Corrections and explanations at the end of each test.
  - Formulas rendered with KaTeX.
- Tests are defined by a seed and graded by the server.
- `npm run check:quiz` verifies the generated questions numerically.
- Database migration `003`: `quiz_results`.

## 2.1.0

- **Spanish interface,** with a language dropdown.
- **Multiplication** and **Euclidean division** (quotient and remainder).
- Operations chosen with checkboxes; separate limit for multipliers and divisors.
- Multiplication by a two-digit number: one line per partial product, then the total.
- Division in the paper layout: working lines under the dividend, quotient under the divisor, remainder at the bottom.
- Database migration `002`.

## 2.0.0

- **Server and database:** players and scores stored in SQLite, or in PostgreSQL (Neon) via `DATABASE_URL`.
- `npm run db:copy-to-postgres`.

## 1.x

- Addition and subtraction in columns, written from the units leftwards, with a carry row.
- Ranges by 10 up to 100, then by 100 up to 1000.
- A4 PDF worksheet of 20 operations.
- Players and scores kept in the browser.
