# Changelog

## 5.9.1

- **Logic grids, level buttons:** "6 × 6 + − × ÷" no longer spills out of its button on a phone. The size and the operations are on two lines, the four buttons stay the same width, and they sit in two columns below 600 px instead of 520 px. A test checks this at 360 and 600 px, with text at 100 % and 130 %.
- **Tests:** the probability test accepts the "🔁 À revoir" badge before the topic's name. This was already fixed in 5.9.0.

## 5.9.0

- **QCM: five new topics,** 100 kinds of question in all, 23 new mistake types.
  - **Matrices and systems (Algèbre):**
    - 2×2 and 3×3 determinants, det(kA), products, 2×2 inverses, 2×2 systems;
    - at university, eigenvalues and rank.

    The classic mistakes: BA for AB, rows times rows, det(kA) = k·det A, the diagonal taken for the eigenvalues.
  - **Function study (Analyse):** tangent lines, extrema, roots of a trinomial, inflection points, local maxima; at university, oblique asymptotes. The classic mistakes: y = f′(a)x + f(a), the abscissa given for the value, f′ used where f″ is needed.
  - **Vectors and geometry in space (new group Géométrie):**
    - dot product, length, angle between two vectors;
    - the plane through a point with a given normal;
    - the distance from a point to a plane;
    - at university, the cross product and where a line meets a plane.

    The classic mistakes: the distance not divided by ‖n‖, π − θ for θ, point and normal swapped, v × u.
  - **Series (university):** geometric series from n = 0 or 1, telescoping sums, the exponential series, radii of convergence.
  - **Functions of several variables (university):** partial derivatives, gradients, critical points, double integrals.
- **University-only topics** are not offered at lycée.
- **Phone layout:** long givens are stacked on several rows, so a 380-pixel screen shows them whole.
- **New kinds of answer, each checked without the generators' formulas:**
  - matrices and vectors, by Gaussian elimination and direct products;
  - planes: the normal must be parallel and the point on the plane;
  - series: partial sums extrapolated, 2·S(2N) − S(N);
  - radii: |aₙ|^(1/n) at n = 10⁷;
  - two variables: central differences and nested Simpson's rule.
- `check:quiz`: 16,000 questions, 96 mistake types, 0 failures.
- Docs: the question-generator page covers every topic, all `verify` kinds, and the topics column of the mistakes table is generated from real output.

## 5.8.0

- **QCM: three new topics,** 19 kinds of question (69 in all), 18 new mistake types.
  - **Sequences:**
    - arithmetic and geometric terms and sums, starting at u₀ or u₁ so that the off-by-one mistake is always possible;
    - the limit of u·qⁿ;
    - the limit of uₙ₊₁ = auₙ + b, and at university its explicit term.
  - **Complex numbers (Algèbre):**
    - product, quotient, modulus, argument, exponential form;
    - second-degree equations with Δ < 0;
    - at university, De Moivre and n-th roots.

    The classic mistakes: i² = +1, a quotient divided part by part, the argument in the wrong quadrant.
  - **Differential equations:**
    - y′ = ay and y′ = ay + b;
    - at university, y′ = axy and y″ + py′ + qy = 0 with distinct, double or complex roots.

    Always with initial conditions, so the answer is one function. Wrong options include the x of the double root forgotten, and the constant set to y(0) without the particular solution.
- **New kinds of answer:**
  - complex numbers and sets of them, compared as complex numbers;
  - the check: each listed number is a root of the polynomial and all roots are listed, or zⁿ by repeated multiplication;
  - differential equations, checked by substituting the option into the equation (numerical derivatives) and checking the initial values.

  Not one of these uses the generators' formulas.
- `check:quiz`: 16,000 questions, 73 mistake types, 0 failures.

## 5.7.0

- **QCM: probability**, at both levels (11 kinds of question, 50 in all).
  - **Lycée:** the binomial law P(X = k) and its mean; total probability and Bayes' formula from a tree; combinations; the expectation of a table; the union of independent events.
  - **University:** the binomial variance, Bayes, the Poisson law, the exponential law P(X > t), standardising a normal value, combinations.
  - **Exact answers:** fractions where they can be.
  - **19 new mistake types,** among them P(A | B) taken for P(B | A), the base rate ignored, the binomial coefficient forgotten, and σ confused with σ².
- **The topics of a test by group** (Analyse, Probabilités, and more to come). Only the topics of the chosen level are shown, and a choice with none at that level falls back on all of them.
- **No version bump:** `generateQuiz` leaves out a topic without questions at the level, which no saved test has. The server refuses a test whose topics have none.
- **Prompts:** givens one per line (`lines()`), so a phone does not cut them off.
- **Docs:** `docs/question-generators.md` explains how to add a topic.
- **Tests:**
  - `chooseTopics()` in the test helpers sets the exact topics;
  - a new test takes a probability test at both levels, graded the same by the browser, the server and an independent rebuild;
  - `check:quiz`: 16,000 questions, 55 mistake types, 0 failures.

## 5.6.0

- **Logic grids** (🧩 *Grilles logiques*), Discover's first puzzles: n × n grids where every row and column holds 1 to n once. Four levels:
  - 1: a 4 × 4 grid with 7 numbers given;
  - 2: 4 × 4 with + cages;
  - 3: 5 × 5 with + and −;
  - 4: 6 × 6 with + − × ÷.
- **One solution, no guessing:**
  - the generator keeps a grid only if a logical solver, using the moves a person uses, finishes it;
  - a separate brute-force count confirms one solution;
  - steps that need several clues combined are capped per level (none on levels 1–2), so nearly every hint has a concrete reason.
- **Hints in two stages,** from the grid as filled: first the square to look at and what to look for, then the reasoning with the number. A wrong number is pointed out first.
- **Play:**
  - a number twice in a row or column, or a wrong full cage, shows at once;
  - *Vérifier* (check) shows numbers that are not the solution's;
  - notes;
  - keyboard: arrows, digits, Backspace, N;
  - one tab stop, labelled squares;
  - the time and hints shown at the end, with no timer while solving.
- **Grid numbers:** the same number and level give the same grid. Each level keeps its grid.
- `npm run check:discover`:
  - cage arithmetic by hand;
  - 300 grids per level for structure, reasoning alone, one solution and determinism;
  - 800 hints from random partial grids.
- Shared lab pieces take their own labels (*Grille n°*, *Grille suivante*). The update watcher waits during a started grid.
- Browser tests: 60, including a 6 × 6 grid solved with hints alone through the interface.

## 5.5.0

- **Heads or tails** (🪙 *Pile ou face*), the second Discover lab, on streaks:
  - **Predict:** the longest streak in 100 flips, and which of two sequences of 6 is likelier.
  - **Flip:** the last 100 flips with long streaks circled, what follows a streak of 3, streaks by length, the share of heads.
  - **Compare:** the longest streak against its exact distribution, the 64 sequences of 6 (1 in 64 each), what followed the streaks against one in two.
  - **Check:** a made-up list against a real one.
- **Exact streak theory** (`shared/discover/coins.ts`): the distribution of the longest run in n flips by a recurrence, and the expected number of runs of each length. `npm run check:discover` compares both with a brute-force count of every sequence (up to 20 flips: 1,048,576 sequences). It also tests the coin generator: a million flips per seed, what follows a streak, and the longest run of 20,000 series of 100 against its exact distribution.
- **The shared shape of a lab**, extracted now that there are two (`src/discover/lab.ts`): redrawing with the keyboard focus kept, prediction choices, batch buttons, the interruptible animation, the counts chart with theory marks, the running-share chart, reveal, explanation, check question and replay. The dice lab is rewritten on it, with the same markup, and its tests pass unchanged.
- `shared/discover/experiment.ts`: experiment numbers, chart points and the chi-square statistic, shared by both engines.
- Each lab keeps its own experiment; the update watcher waits for either.
- Browser tests: 55. The language test goes through both labs in the three languages.

## 5.4.0

- **Discover**, a third group on the home page: experiments rather than exercises. Docs: `docs/discover.md`.
- **The probability lab** (🎲 *Le labo des probabilités*), two dice, in five steps:
  - **Predict:** the most frequent sum, and the number of 7s in 100 rolls.
  - **Roll:** 1 to 1,000 times, with the counts per sum, series of 10, and the share of 7s on a logarithmic axis.
  - **Compare:** from 100 rolls, the 36 ways to land with the six 7s highlighted, \(P(7) = 6/36 = 1/6\), a table of every sum, and the predictions against the results.
  - **Understand:** chance, large numbers, dice without memory.
  - **Check:** one question on the gambler's fallacy.
- **Experiment numbers:** an experiment is its seed (the tests' mulberry32 generator). The same number replays the same rolls, in any batches.
- **The dice are checked:** `npm run check:discover` verifies the exact distribution and reproducibility, and runs chi-square tests on a million rolls for each of five seeds.
- **Motion:** one roll tumbles, ten are shown one by one, more are counted at once; everything at once with reduced motion. A click during an animation rolls at once, so no roll is lost.
- The update watcher does not reload during an experiment.
- Browser tests: 52 (`tests/e2e/discover.spec.ts`; the language test now goes through the lab in three languages). `openActivity()` in the test helpers knows Discover activities.

## 5.3.1

- Browser tests: `goHome()` in `tests/e2e/helpers.ts`. The home page is drawn once its data arrives; a click on the previous screen's *← Accueil* link could land just as that screen was replaced, and wait for a link that no longer existed (timeout on a fast or slow machine). The helper now clicks if the link is there and retries until the home page shows. No change to the app.

## 5.3.0

- **Vocabulary statistics:** *📊 Statistiques* on every book's page. Words seen, mastered and known; right answers over 30 days; days in a row and the record; right and wrong answers per day over 30 days, with the new words; reviews due over the next 14 days; cards per Leitner box in each direction; the share right by kind of question and direction; written answers by verdict; words seen per lesson; the 12 hardest words. Days end at the browser's midnight. `GET /api/vocab/stats`, computed in `shared/vocab/stats.ts`.
- **Automatic updates:** each build publishes `/version.json`. A window left open (the installed desktop or phone app, a tab) checks it when it comes to the front and every 15 minutes: it reloads by itself when nothing is under way, and otherwise offers *Mettre à jour*, applied at the next return to the home page. Back after a few minutes, a quiet screen is redrawn from the server; the list of books is asked again every 5 minutes, so a new import appears.
- **Cache headers:** `no-cache` on the page, `version.json` and the manifest; a year, immutable, on the hashed `assets/`; a day on icons; `no-store` on the API. Before, the page had none, and a browser could keep an old build for hours.
- **Rōmaji setting** for Japanese books: *Toujours*, or *Après la réponse* (the Japanese alone during the question). Remembered per book.
- Vocabulary checks: statistics (local days, streaks, forecast, hardest words). Browser tests: 46.

## 5.2.0

- **Japanese vocabulary** from *Japanese vocabulary for English speakers — 5000 words*: `tools/vocab-extract-japanese.py` reads the EPUB (standard library only) into 22 lessons, 155 sections and 5,087 entries. Comma synonyms become alternatives (*digit / figure*).
- **Rōmaji:** shown in italics under a Japanese word, under each Japanese option, and after the answer.
- **Japanese answers** in kanji, kana or rōmaji: 学校, がっこう, ガッコウ, *gakkō*, *gakko*, *gakkou*. Kana is compared by its sound (`shared/vocab/kana.ts`), so a kanji word can be answered without its kanji. Full-width letters and Japanese punctuation are folded.
- Japanese text is marked `lang="ja"` and uses the system's Japanese fonts, so kanji take their Japanese forms.
- **Spanish book:** shown as *3000 words and phrases*, without the publisher's name. Its id stays `collins-spanish`, so progress is kept; migration `010` renames a book already imported.
- File format 2: optional `reading` on an entry. API: `promptReading` and `optionReadings` on cards, `reading` on answers.
- Database migration `010`: `reading` on `vocab_entries`.
- Removed a debug line left in the origin check, which logged every POST request (`ORIGIN-DEBUG`).
- Vocabulary checks: 65 grading cases. Browser tests: 41.

## 5.1.0

- **New words at random:** a *Nouveaux mots* setting per book, *Au hasard* or *Dans l'ordre du livre*. Random is the default for an alphabetical word list (*Vocabulary 4000*), the book's order for a themed book (Collins).
- **Learn across the whole book:** *Apprendre au hasard dans tout le livre* draws a session's new words from all 4,000 words.
- **Wrong options from the whole book** in an alphabetical list, instead of look-alike neighbours (*abase*, *abash*, *abate*); prefixes, roots and suffixes stay compared with their own kind.
- Books have an order: `"order": "alphabetical"` in the file. Migration `009` marks the English book already imported, so no new import is needed; importing again adds the groups of the word parts.
- API: `order=book|random` on `GET /api/vocab/session`; `order` on books.
- Browser tests: 40.

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
