# Changelog

## 6.13.0

- **Physical chemistry, Focuses 7–8:** two new topics in a new group, *Quantique et structure*.
  - **7 · Théorie quantique:** nine kinds of calculation: photons emitted by a lamp, Wien's peak, the speed of a photoelectron from six metals, the de Broglie wavelength of an accelerated electron, the uncertainty in a speed, a transition of a particle in a box, the vibration wavenumber and zero-point energy of six diatomics, a rotational line.
  - **8 · Structure atomique et spectres:** five: a line of H, He⁺ or Li²⁺, an ionization energy, the radial nodes of an orbital, the most probable or mean radius of a 1s electron, a spin–orbit splitting.
  - Five new mistake types: nm, pm or cm taken for m; h for ħ; the total mass for the reduced mass; radial, angular and total nodes confused; mean and most probable values confused.
  - **Question bank:** Topics 7A–8C, core and advanced, in French, Spanish and English: 383 core and 151 advanced questions over 34 units. Re-import it with `npm run quiz:import -- data/atkins-12-concepts.json`.
- **Fix:** below 0 °C, the °C-for-K option of a root-mean-square speed had no square root and showed as −∞. Tests are now at version 3, which leaves that option out; older tests are rebuilt exactly as they were. `check:quiz` fails on any option that is not a number.
- **Tests:** 102 browser tests.

## 6.12.1

- **Updates never interrupt an activity:** a new version reloads the app by itself only on the home page, the list of players or the sign-in screens. Inside any activity, even one with nothing under way yet (a lab at its prediction, a test's results, a progress page), it only shows the *Mettre à jour* bar, and is applied on the way back to the home page. The redraw with fresh data after a while away is limited to the home page too.
- **No stretched screen on the way home:** the wider layout of the home page and the progress overview now comes with their content. The screen being left keeps its own width while the next one loads.
- **Tests:** 101 browser tests.

## 6.12.0

- **Astronomy** (Phase 3): a new *Astronomie* group, four labs in the Discover pattern, in French, Spanish and English, on geometric models (no physics engine), each aimed at one misconception.
  - **🌓 Les phases de la Lune**, the anchor: the Moon moved through the month, seen from above the North Pole with the Earth's shadow, and seen from the Earth. The phase, the lit share, the rising time. The shadow reaches the Moon only at full moon: an eclipse, not a phase. The check: when a lunar eclipse can happen.
  - **🌍 Les saisons:** date, latitude and the axis's tilt; the orbit, the noon Sun spreading its light, the day's length and the day's sunlight, a year of sunlight. The Earth is closest in January; with an upright axis the seasons go. The check: summer in Spain, winter in Argentina.
  - **🌑 Les éclipses:** the Moon's height above the Earth's orbit at each new and full moon, a year at a time over 18 years, the eclipses circled and listed; without the tilt, one every new moon. The Moon's distance: total or annular, and the width of the strip.
  - **🪐 Les orbites des planètes:** an orbit in twelve slices of equal time, Kepler's three laws, the planets; Mars seen from the Earth going backwards as the Earth overtakes it.
  - `npm run check:astronomy` checks the models against independent computations: the lit fraction by integration over the Moon's surface, the daily sunlight minute by minute, 2,880 simulated years of eclipses (2 to 5 solar a year), Kepler's ellipse against Newton's gravity, Mars' retrograde spells. CI runs it.
- **Chemistry and biology** (Phase 4): a new *Chimie et biologie* group.
  - **⚗️ Équations chimiques**, the anchor, a test of its own (level `chembio`, topic *Équilibrer une équation*): reactions generated from five families (combustion, synthesis, neutralization, displacement, decomposition) and balanced exactly; choose the balanced equation, or type one coefficient. Four new mistake types: a subscript changed instead of a coefficient, coefficients not the smallest, an element left unbalanced, O₂ written O. Graded on the server like every test; `check:quiz` reads each option back from its TeX and counts the atoms with its own parser.
  - **🧬 Construire des molécules:** ten molecules; set each bond single, double or triple until every valence holds, then the shape and angle from the lone pairs (water bent at 104.5°, CO₂ straight).
  - **🫛 Les pois de Mendel:** Punnett squares for one and two genes, seeded offspring bred 1 to 1,000 at a time, chi-square and p-value; the streak question linked to the coins lab.
  - **🦠 Pourquoi les cellules sont petites:** surface over volume (6/s) and oxygen's diffusion time (x²/2D), from 1 µm to 1 mm, cutting a cube.
  - **🐇 Lièvres et lynx:** Lotka–Volterra cycles over time and as a loop, the prey first, the averages at the equilibrium whatever the start; Euler's spiral as a naive simulation.
  - `npm run check:biology`: one valid set of bonds per molecule, squares against direct enumeration, the chi-square p-value against the tables and rejecting chance about 5 % of the time, random walks spreading as 2Dt, the Lotka–Volterra invariant kept by Runge–Kutta and lost by Euler. CI runs it.
- **Account page:** the nine new activities can be shown or hidden per player.
- **Database:** migration `018_chembio_level`.
- **Tests:** 99 browser tests.

## 6.11.0

- **Home page on a large screen:** it now uses the width (up to 72rem). Subjects with one or two activities sit side by side, each group as wide as its cards; on a phone the groups still follow one another.
- **Progress, inside each activity:** *📈 Mes progrès* in the QCM, Chimie physique and Linux now shows that subject only, its kinds of question and its frequent mistakes. Calcul en colonnes has its own *📈 Mes progrès*, per operation.
- **Progress overview:** *📈 Mes progrès* on the home page (and a name on the Scores screen) shows every activity at a glance. *Aujourd'hui* gives today's sums, test answers and vocabulary answers. Each activity gets a card with a bar and its counts, and *Détails* opens the activity's own page, or a book's statistics.
- **A lesson's words:** *📖 Voir les mots* in each lesson lists its words section by section, with the reading, the meaning in the app's language and how far each is learnt.
- **Skipping a word:** *Passer* takes a word out of lessons and reviews; it is crossed out and counted apart (*2 passés*), and *Remettre* brings it back with its boxes.
- **Database:** migration `017_vocab_skips`. `db:copy-to-postgres` copies it.
- **API:** `GET /api/vocab/lessons/:id/words`, `PUT /api/vocab/skips`; `skipped` in a section's progress; `quizToday` in a player's profile.
- **Tests:** 87 browser tests.

## 6.10.0

- **Physics playground** (Phase 2): a new *Physique* group on the home page, four labs in the Discover pattern (predict, try, compare, understand, check), in French, Spanish and English.
  - **🏀 Lancer une balle**, the anchor: pick the angle that goes farthest and plant a flag where a throw at 30° lands, then throw at any angle, speed and height. The ball flies in real time on a field drawn to scale; the comparison shows distance against angle and each throw against \(v^2\sin 2\theta/g\). The check: a dropped marble and a pushed one, with a multi-flash picture.
  - **⏱️ Le pendule:** length, mass and release angle; time 10 swings; time against length, \(2\pi\sqrt{L/g}\) and the exact period at large angles. The check: a child and an adult on the same swing.
  - **🔍 Les lentilles:** move the arrow and the screen until the image is sharp, cover half the lens with a card, then the lens equation and a three-ray diagram. The check: a magnifying glass's virtual image.
  - **💡 Les circuits:** six circuits of identical bulbs, glowing by their power, with ammeters; unscrew any bulb, by mouse or keyboard. The check: current is not used up.
- **Simulations, checked:** the flight (velocity Verlet), the pendulum (Runge–Kutta with the full sin θ), traced rays and nodal analysis. `npm run check:physics` compares them with the exact solutions and the conservation laws: periods to 10⁻⁷ up to 170°, no energy drift over 100 swings (and a drifting integrator caught), Kirchhoff's laws in every circuit. CI runs it.
- **Account page:** the four labs can be shown or hidden per player, like the other activities.
- **Tests:** 84 browser tests.

## 6.9.0

- **Physical chemistry, Focuses 4 to 6:** three new topics, *4 · Transformations physiques*, *5 · Les mélanges* and *6 · L'équilibre chimique*, in the *Thermodynamique* group.
  - 29 new kinds of calculation, 57 in all:
    - Phase rule, Clapeyron slope, Clausius–Clapeyron (vapour pressure, ΔvapH, boiling point under another pressure), the chemical potential of a condensed phase.
    - Gibbs energy and entropy of mixing, Raoult and Henry, the composition of the vapour, freezing and boiling points, molar mass by osmometry, the lever rule, activity coefficients, ionic strength, Debye–Hückel.
    - K from ΔrG° and back, ΔrG from the reaction quotient, van 't Hoff both ways, degree of dissociation under pressure, ΔrG° and K of a cell, the Nernst equation, cell potentials from electrode potentials, combining standard potentials.
  - 8 new mistake types: ions of a salt forgotten, components swapped, one phase's composition for the other's, total pressure for partial, charge not squared, ln for log₁₀, potentials multiplied by electrons, potentials combined without weighting.
  - The bank file now covers Topics 1A–6D: 291 core and 112 advanced concept questions in French, Spanish and English (136 and 51 new). It stays out of the project; import it with `npm run quiz:import -- data/atkins-12-concepts.json`.
- **Typed answers:** equilibrium constants, spread over powers of ten, are offered as choices only (`choiceOnly` on their options). A rounding typed to its last digit is no longer refused by floating-point error on large values.
- **Givens on separate lines,** so the new calculations fit a phone screen.
- **Tests:** the invented bank has a unit for the new topics; 78 browser tests.

## 6.8.0

- **Linux quiz:** activity 🐧 Linux, in a new *Informatique* group on the home page.
  - Seven topics: files and permissions, text processing, the shell, processes and services, the system, the network, and *Outils à installer*.
  - 167 written questions in French, Spanish and English, each with an explanation. They are the app's own content and ship with it.
  - 32 questions are about commands missing from a default install. They show a 📦 badge with the package, and the correction gives the install command for Debian and Ubuntu, Fedora and macOS.
  - Four generated kinds: `chmod` octal to symbolic and back (the octal form can be typed), the modes left by a `umask`, and when a crontab line runs. 7 new mistake types: classes swapped, bit weights, mask added, execute kept on files, cron fields swapped, a step read as a value, day of month for day of week.
- **Code in questions:** text in backticks is shown as code, in every quiz. `check:quiz` checks that each language of a question has the same code runs, and reads `chmod` and `umask` modes on its own.
- **Database:** migration `016_linux_level`: `quiz_results.level` accepts `linux`.
- **Tests:** 77 browser tests.

## 6.7.0

- **Activities per player:** on the Account page, each player has the list of activities shown on their home page: column arithmetic, QCM, physical chemistry, each vocabulary book, each Discover activity. Untick one and it disappears from that player's home page, on every device; an open activity that gets hidden goes back home. New books show until unticked.
- **Players shared between accounts:**
  - The owner creates a share code on the Account page. It is single use and valid 7 days, and only its SHA-256 is stored. The other account types it on its own Account page.
  - The other account then sees the player, marked *partagé*, with the same results, and can do exercises and tests and follow progress.
  - It cannot delete the player, change their activities, sharing or own sign-in. Deleting a shared player only removes it from that account's list.
  - The owner sees who has access and can end any share at once.
  - Wrong codes are limited to 20 per account in 15 minutes.
- **Database:** migration `015_sharing`: `hidden` on `users`; `player_shares`, `player_invites`. `db:copy-to-postgres` also copies `quiz_results.bank`, which it had missed since 6.5.0.
- **API:** `PUT /api/users/:id/hidden`, `POST /api/users/:id/invites`, `GET /api/users/:id/shares`, `DELETE /api/users/:id/shares/:account`, `POST /api/shares`; `hidden` and `sharedBy` on players.
- **Dependencies:**
  - Build and test tools: TypeScript 7 (the native compiler), Vite 8, esbuild 0.28, Playwright 1.64, @types/node 26.
  - Server: @hono/node-server 2.1.5.
  - CI: `actions/checkout`, `setup-node` and `upload-artifact` v7; `google-github-actions/auth` and `setup-gcloud` v3, all running on Node 24.
  - Vite 8 needs esbuild 0.27 or later, so the two are updated together.
- **Tests:** `PLAYWRIGHT_CHROMIUM` runs the browser tests with a Chromium already installed. 75 browser tests.

## 6.6.0

- **Physical chemistry in French and Spanish:** the 155 concept questions and the Topic titles of the Atkins file are translated. The app shows them in its language.
- **Advanced level** (*Avancé*), next to *Fondamental*: 61 reasoning and derivation questions on Topics 1A–3E, in the three languages. No calculations at this level.
  - **Bank questions get a level,** `core` or `advanced`; each Topic has one kind of question per level (`gases.concepts1A`, `gases.advanced1A`), with its own progress and review.
  - **The level is remembered** with the other test settings. Without advanced questions on the server, the page says so and offers no test.
  - **An import refuses a question that changes level,** like one that changes unit: its old tests would change.
- **Database:** migration `014_advanced_level`: `level` on `quiz_bank`; `quiz_results.level` accepts `chemistryAdvanced`.
- **Checks:**
  - `check:quiz` renders written questions in all three languages, and takes `--bank FILE` to check a real bank.
  - An invented advanced fixture; a browser test of the advanced level in French. 73 browser tests.
- **The Atkins file** (not in the project) is now assembled by a script that refuses missing translations and formulas that differ between languages.

## 6.5.0

- **Physical chemistry,** a new activity in a new *Sciences* group: multiple-choice tests on *Atkins' Physical Chemistry*, 12th edition. This release covers Focuses 1–3: gases, the First Law, the Second and Third Laws.
  - **28 kinds of calculation,** generated and graded like the maths: perfect gas, partial pressures, molecular speeds, mean free path, compression factor, van der Waals, critical constants; expansion work, ΔU and ΔH, Hess's and Kirchhoff's laws, adiabatic changes; entropy of expansion, heating and transitions, Trouton, Carnot, reaction entropy, ΔG, the crossover temperature, G and pressure, Debye.
  - **Units and significant figures:** data to three figures, options with their unit. `shared/quiz/units.ts`.
  - **20 new mistake types,** among them °C used for K, dm³ taken as m³, kJ mixed with J, R in the wrong units, C_p for C_V, products and reactants swapped, elements given a zero entropy, isothermal for adiabatic, log₁₀ for ln.
  - **Typed answers** for the calculations, in the unit shown; a question whose options are too close to tell apart, or a value of a million or more, keeps its four options.
- **Question bank:** concept questions written from a book, kept out of the project and imported with `npm run quiz:import`. See [Question bank](docs/question-bank.md).
  - **Texts by language,** English required, French and Spanish optional: no question text in the code.
  - **Revisions:** a test stores the bank revision it drew from, so corrected, added or removed questions never change an old test. An import that would mix books, move a unit or reuse a removed id is refused.
  - **Each Atkins Topic is one kind of question,** with its own progress and review.
  - **The Atkins file** (not in the project): 155 questions for Topics 1A–3E.
- **⚑ Report this question,** in the corrections of every test, with an optional note; `npm run quiz:flags` lists the reports and resolves them.
- **Database:** migration `013_question_bank`. Tables `quiz_bank_meta`, `quiz_bank_units`, `quiz_bank`, `quiz_flags`; `bank` on `quiz_results`, whose `level` accepts `chemistry`.
- **API:** `GET /api/quiz/bank`, `POST /api/quiz/flags`; `bank` on `POST /api/quizzes`.
- **Configuration:** `QUIZ_BANK_FILE`, imported by the maintenance when the database has no bank.
- **Checks:** `check:quiz` covers the chemistry level with an invented bank: right answers recomputed, typed values, KaTeX rendering of the written texts. 72 browser tests.

## 6.4.1

- **Fix: a German book could replace the Spanish one.**
  - **Cause:** `tools/vocab-extract.py` took Spanish as the default language. Run without `de` on the German book, it wrote the German words as the book `collins-spanish`. Importing that file then replaced the Spanish book's words, and the progress on them was deleted with them.
  - **The extractor now reads the language from the cover** ("german | 3000 words and phrases"). The argument is optional and must match the cover; when neither says, nothing is written.
  - **The import refuses to overwrite another book,** and changes nothing, when:
    - the file's book id is on the server in another language;
    - or more than a fifth of the book's entries would disappear while players have progress on them.

    `--replace` imports it anyway.
  - **Checks:** `check:vocab` tests the guard on a temporary SQLite database.
- **Recovering a replaced book:** see [Deployment › Undoing a bad import](docs/deployment.md#undoing-a-bad-import).

## 6.4.0

- **Arabic vocabulary:** *Arabic 3000 words and phrases* (Collins): `python3 tools/vocab-extract.py book.pdf ar`. It gives 10 lessons, 109 sections and 3,014 entries, each with the book's transliteration.
  - **Arabic rebuilt from the PDF's glyphs:** the PDF stores it in visual order.
    - Lines are read right to left.
    - Each vowel mark goes with its letter.
    - Numbers and Latin stay left to right.
    - Brackets are balanced.
  - **Headings:** the Arabic half of a heading is found on its line or, after a long English title, on the next.
- **Arabic grading:**
  - **Script:** vowel marks optional; another alef, alif maqsura or ta marbuta is an accent slip; a missing or extra article ال is a near miss.
  - **Transliteration:** compared by its letters, long-vowel spellings and hyphens ignored.
- **Right to left:** Arabic prompts, options, answers, titles and the summary are laid out right to left, in the system's Arabic font, larger, with room for the vowel marks.
- **Transliteration setting:** the *Rōmaji* choice (with the question, or after the answer) also applies to Arabic, as *Transcription*.
- **Fix:** the reading shown after a recall answer was always marked as Japanese; it now takes the book's language.
- **Checks:** 16 Arabic grading cases; every entry of the extracted book accepts its own text and transliteration; an e2e test with an invented five-word Arabic book.

## 6.3.0

- **German vocabulary:** *German 3000 words and phrases* (Collins), read by the Spanish book's extractor with the language as argument: `python3 tools/vocab-extract.py book.pdf de`. 10 lessons, 112 sections, 3,206 entries.
  - **Titles** get their German capitals back: the headings' small capitals lose them ("Probleme mit dem Auto").
  - **ß in headings,** which the book sets in a smaller size, is no longer dropped ("Fußball").
- **German grading:**
  - the article is part of the answer, as in Spanish: *Straße* or *der Straße* for *die Straße* is wrong;
  - *ss* for *ß* (the Swiss spelling) and *ae*, *oe*, *ue* for umlauts are right;
  - a plain vowel for an umlaut is an accent slip, right with the spelling shown;
  - capitals are not checked.
- **Letter buttons** for German answers: *ä ö ü ß Ä Ö Ü*.
- **Checks:** 12 German grading cases in `check:vocab`; an e2e test with an invented five-word German book.

## 6.2.0

- **Kanji and kana,** a new book in the Japanese school's order. See [Kanji and kana](docs/characters.md).
  - **Order:** hiragana and katakana row by row (with the voiced rows, the contracted sounds and the borrowed sounds), then the 1,026 kanji of grades 1 to 6 and the 1,110 other jōyō kanji. Within a grade, the most frequent kanji come first.
  - **Kana** are asked by their sound and found from it.
  - **Kanji** are learnt three ways, each with its own Leitner box: the meaning, the reading (a new direction), and the kanji from its meaning.
    - Any one reading is right, typed in katakana, hiragana or rōmaji, okurigana optional.
    - A character to produce is always chosen, among four of the same kind.
  - **Meanings in French or Spanish** when the interface is, from KANJIDIC2; English otherwise. Entries of any book may now carry `translations`.
  - **After each kanji:** its readings, on and kun apart, and up to three common words whose kanji are all learnt by then.
- **One learning with the Japanese word books:**
  - characters met in the words a player has started come first among the new ones; the home screen counts them, and their cards say *seen in your words*;
  - a character's card shows the player's words that use it;
  - a word's card shows its kanji, those not yet started highlighted.
- **`npm run characters:build`** writes `data/characters.json` from KANJIDIC2 and JMdict, downloaded into `data/`. Without them it builds the kana only. Nothing from the dictionaries is in the project; the book shows the EDRDG's CC BY-SA attribution (`book.credit`, a new field).
- **Migration 012:** book kind `characters`, direction `read`, columns `credit`, `readings` and `translations`. SQLite rebuilds two tables, keeping their rows.
- **Import:** new entries are inserted at most 100 per statement, so any section size stays within the engines' parameter limits.
- **`npm run db:copy-to-postgres`** now also copies the columns added since 5.x: `ordering`, `credit`, `readings`, `translations`, the test answer `mode` and `typed`.
- **Checks:** `check:vocab` covers kana sounds, readings, example words, the third direction, localised meanings and met characters, and with a Characters file checks that every reading and translation is accepted. Two new e2e tests use an invented 17-character book.

## 6.1.1

- **Vocabulary, keyboard:** a key pressed just as a multiple-choice card appeared could be lost. The card takes the focus on the next frame, and a key pressed before that went to the page, not to the card. The card's keys (1–4, A–D, Enter) are now read at document level while a card is on screen, wherever the focus is. Seen on GitHub's runners, where two vocabulary tests failed this way; reproduced locally under CPU load, then 30 runs out of 30 passed under the same load.

## 6.1.0

- **Runs on Google Cloud Run,** with releases from GitHub Actions. See [Deployment › Cloud Run](docs/deployment.md#cloud-run) and [Releases](docs/deployment.md#releases).
  - **`Dockerfile`:** the built app and a bundled server (`npm run build:server` → `dist-server/`, faster to start than `tsx`), on Node 22, run as an unprivileged user. The image has no native module.
  - **`deploy/setup-gcp.sh`:** the one-time Google Cloud setup, safe to run again.
    - Image repository with a cleanup policy.
    - Two service accounts with only what each needs.
    - Secrets in Secret Manager, typed rather than passed as arguments.
    - GitHub Actions access without any key (Workload Identity Federation, limited to the repository).
    - The service (one instance at most, startup CPU boost) and the maintenance job.
  - **`checks.yml`,** on every push to main: type checks, the three check scripts, the e2e suite on SQLite and on PostgreSQL, and the image build.
  - **`release.yml`,** on a version tag:
    - builds the image once and checks it;
    - rehearses the migrations on a Neon branch of production that expires after two hours;
    - migrates production;
    - deploys a candidate revision without traffic and smoke-tests its own address;
    - only then moves all traffic to it.

    *Hold* and *promote* let a release be tried on a phone first. Any failure leaves the current revision serving.
  - **Dependabot** keeps the pinned actions and npm packages current.
- **Maintenance as a command:** `npm run maintenance` (or `node dist-server/index.js maintenance`) runs the migrations, backfills, vocabulary import and session purge, then exits.
  - **Locally and on a home server:** it still runs at every start, as before.
  - **On Cloud Run:** the release runs it once, and instances start without it.
- **Cloud Run is recognised automatically** (`K_SERVICE`, `CLOUD_RUN_JOB`). There:
  - logs are JSON lines with a severity, for Cloud Logging;
  - the server refuses to start without `DATABASE_URL`;
  - the hourly purge timer is off.

  `STARTUP_MAINTENANCE` and `LOG_FORMAT` override these defaults. API errors are logged with Cloud Run's trace id.
- **Sign-in behind a proxy that ends HTTPS** (Cloud Run, nginx): with `TRUST_PROXY=true`, the origin check also accepts the address from `X-Forwarded-Proto` and `Host`. Without it, a request arriving as `http://` while the page is `https://` was refused as cross-site at any address other than `PUBLIC_URL`, such as a Cloud Run candidate's.
- **`better-sqlite3` is now an optional dependency** and is loaded only when SQLite is used: a platform without a prebuilt binary can still run on PostgreSQL. A missing module gives a clear message.
- **The e2e suite runs on PostgreSQL too:** `npm run test:e2e:postgres` with `E2E_DATABASE_URL`. All 65 tests pass on both engines.
- **Build id from the release:** `BUILD_ID` (the tag) names the build in `/version.json`, so a release can check that the deployed revision is the one it built.
- **Docs:** deployment (Cloud Run, custom domain, releases, rollback, checks after the first release), architecture, database (migrations that work with the previous release), development, README, `.env.example`.

## 6.0.0

- **QCM: graph questions,** a new topic *Lecture graphique* (Analyse), 10 kinds of question at both levels:
  - the graph of f′ from the graph of f, and at university the graph of f from f′ and f(0);
  - which curve has this formula (a parabola; at university an exponential or a hyperbola), and which equation has this drawn line;
  - translations and reflections of a curve, and at university f(2x), 2f(x), |f(x)|;
  - f′(a) read on a drawn tangent; the number of solutions of f(x) = k read on a curve;
  - which plane, drawn through its intercepts, has this equation.

  The app draws the curves as SVG, in light and dark themes. The options are named by their letter only, and their formulas appear in the corrections. Wrong options are still named mistakes, among them f taken for f′, a shift in the wrong direction, a transformation along the other axis, the intercept read as the slope, and the coefficients taken for the intercepts. There are 6 new mistake types.
- **QCM: typed answers.** A new setting, *Réponses: 4 choix / Au clavier*.
  - **Which questions:** those whose answer is a number are answered by typing it (55 kinds can be); the others keep their options.
  - **What is accepted:** exact values (7/45, 2π/3, √2, e^2 − 1, ln 3) or a rounding right to its last digit, never looser than 0.6 % of the answer.
  - **While typing:** the app shows what it reads, and a row of keys adds π, √, /, ^, −, e and brackets.
  - **Grading:** a typed value matching a wrong option records that option's mistake. The server reads the text itself; the browser's reading is only for the screen.
  - **Safeguard:** a question is never offered typed when a wrong option is near enough to the answer to be confused with it.
- **Database:** migration 011 adds `quiz_results.mode` and `quiz_answers.typed`. Earlier tests read as `choices`, unchanged.
- **API:** `POST /api/quizzes` takes `mode` and, in a typed test, text answers of at most 40 characters. A string is refused in a `choices` test.
- `check:quiz`: 16,000 questions, 102 mistake types, 0 failures.
  - **Graphs:** each curve shows enough of itself in its window, option curves differ by half a grid square, and all options share their window.
  - **Typed:** every option's value typed with 4 or 10 decimals, with a point or a comma, is read as that option.
- **Tests:**
  - graph questions drawn;
  - a typed test answered twice on the same seed: wrong option values come back as their mistakes, right values give full marks;
  - the API refuses text outside a typed test.

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
