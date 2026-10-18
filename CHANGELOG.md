# Changelog

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
