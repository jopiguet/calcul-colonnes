# API

JSON over HTTP, under `/api`. Bodies are JSON (`Content-Type: application/json`);
timestamps are epoch milliseconds. Shared types are in `shared/types.ts`.

Every route except `/api/health` and `/api/auth/*` needs a session cookie;
see [Authentication](authentication.md). Requests that change data must come
from the app's own origin.

| Method | Path | |
|---|---|---|
| `GET` | [`/api/health`](#get-apihealth) | Server and database check |
| `GET` | [`/api/users`](#get-apiusers) | List players |
| `POST` | [`/api/users`](#post-apiusers) | Add a player |
| `DELETE` | [`/api/users/:id`](#delete-apiusersid) | Delete a player and all their results |
| `GET` | [`/api/users/:id/profile`](#get-apiusersidprofile) | Progress of one player |
| `GET` | [`/api/users/:id/tests`](#get-apiusersidtests) | A player's last tests in one subject, to see their corrections again |
| `POST` | [`/api/attempts`](#post-apiattempts) | Record a column-arithmetic answer |
| `POST` | [`/api/quizzes`](#post-apiquizzes) | Record a finished test |
| `GET` | [`/api/stats`](#get-apistats) | Totals of every player |
| `GET` | [`/api/vocab/books`](#get-apivocabbooks) | Vocabulary books, with their lessons and sections |
| `GET` | [`/api/vocab/progress`](#get-apivocabprogress) | One player's vocabulary progress |
| `GET` | [`/api/vocab/lessons/:id/words`](#get-apivocablessonsidwords) | A lesson's words, for a player |
| `PUT` | [`/api/vocab/skips`](#put-apivocabskips) | Skip a word, or put it back |
| `GET` | [`/api/vocab/session`](#get-apivocabsession) | Cards for a practice session |
| `POST` | [`/api/vocab/answers`](#post-apivocabanswers) | Record an answer; the server grades it |
| `POST` | [`/api/feedback`](#family-release) | Send feedback to the owner |
| `GET` | [`/api/export`](#family-release) | Everything stored about the account (account sessions only) |
| `GET` `POST` `DELETE` `PUT` | [`/api/admin/…`](#family-release) | The owner's page: invitations, content visibility, feedback |

The [authentication routes](#authentication) are under `/api/auth`.

## Scope

What a session sees:

| Session | Players visible | Restrictions |
|---|---|---|
| Account | All players of the account | — |
| Player (their own sign-in) | That player only | `POST /api/users`, `DELETE /api/users/:id` and the account routes of `/api/auth` answer `403 account_only` |

A player outside the scope answers `404 unknown user`, like one that does not
exist. A vocabulary book the account may not see (private, and not the
owner's account) answers `404` like one that does not exist, and the question
bank is empty for it (see [Family release](#family-release)).

## Family release

See [Authentication › Family release](authentication.md#family-release).

| Method | Path | Body | |
|---|---|---|---|
| `GET` | `/api/auth/invites/:code` | | `{ "usable": true }`: an invitation can still be used |
| `POST` | `/api/auth/register` | `invite` added | With `REGISTRATION=invite`, required once the owner exists: `403 invite_invalid` otherwise |
| `GET` | `/api/auth/oauth/:provider/start?intent=login&invite=…` | | The invitation for a provider's sign-up |
| `DELETE` | `/api/auth/account` | `{ "confirm": "delete-account" }` | Deletes the account and everything it owns. `409 owner_with_members` for the owner while other accounts exist |
| `GET` | `/api/export` | | The account, its sign-in methods (no secret), its players with all their results, shares and feedback, as a file |
| `POST` | `/api/feedback` | `{ "text": "…", "page": "home" }` | At most 2,000 characters; 20 per account in 15 minutes |
| `GET` | `/api/admin` | | Owner only (`403 owner_only` otherwise): registration mode, invitations, books with their visibility, the bank's, the last 100 feedback messages |
| `POST` | `/api/admin/invites` | `{ "note": "Tante Rosa" }` | `{ code, link, invite }`: the link is shown once |
| `DELETE` | `/api/admin/invites/:id` | | |
| `PUT` | `/api/admin/books/:id` | `{ "visibility": "shared" }` | `private` or `shared` |
| `PUT` | `/api/admin/bank` | `{ "visibility": "shared" }` | The written questions |

## Errors

Errors are `{"error": "<reason>"}` with:

| Status | When |
|---|---|
| `400` | Invalid input: `invalid name`, `invalid id`, `invalid attempt`, `invalid quiz`, `invalid since` |
| `401` | `not_signed_in`: no valid session |
| `403` | `account_only`: a player's own session on an account route. `cross_site`: change requested from another site |
| `404` | `unknown user` |
| `409` | `name already used` |
| `500` | `database error` (details in the server log) |

## `GET /api/health`

```json
{ "ok": true, "database": "sqlite" }
```

`database` is `sqlite` or `postgres`.

## `GET /api/users`

Players sorted by name: the account's own, and those other accounts share with it.

```json
[
  { "id": 1, "name": "Léa", "createdAt": 1792337327408, "hidden": ["columns"] },
  { "id": 7, "name": "Tom", "createdAt": 1792337400000, "hidden": [], "sharedBy": "Anne" }
]
```

| Field | |
|---|---|
| `hidden` | Activities taken off the player's home page: `columns`, `quiz`, `chemistry`, `vocab-<book slug>`, `discover-dice`, `discover-coins`, `discover-puzzles` |
| `sharedBy` | Only for a player another account owns and shares with this one: that account's name |

## `POST /api/users`

```json
{ "name": "Léa" }
```

- **Name rules:** spaces are trimmed and runs of spaces collapsed; 1 to 20 characters.
- **Duplicates:** a name equal to an existing one, ignoring case, gives `409`.

`201`:

```json
{ "id": 1, "name": "Léa", "createdAt": 1792337327408 }
```

## `DELETE /api/users/:id`

`204`. For the account's own player: deletes the player with their arithmetic
answers, tests, test answers and vocabulary. For a shared player: removes it
from this account's list only; the player and their results stay with the
owner. `404` for a player this session does not see.

## Activities and sharing

All need an account session (`403 account_only` in a player's own session).
The routes on `/api/users/:id/…` are for the player's own account: for a
shared player, or another account's, they answer `404`.

### `PUT /api/users/:id/hidden`

```json
{ "hidden": ["columns", "discover-dice"] }
```

Replaces the list. Ids are `[a-z0-9-]`, at most 200. Unknown ids are kept
(a book imported later). `204`; `400` for an invalid list.

### `POST /api/users/:id/invites`

A share code: single use, valid 7 days. Only its SHA-256 is stored, so it is
shown once.

`201`:

```json
{ "code": "K7QF2-9XMRA", "expiresAt": 1793000000000 }
```

### `GET /api/users/:id/shares`

The accounts that see the player.

```json
[{ "accountId": 4, "name": "Anne", "email": "anne@example.org", "since": 1792500000000 }]
```

### `DELETE /api/users/:id/shares/:account`

Ends a share at once. `204`; `404` if there was none.

### `POST /api/shares`

Another account uses a code.

```json
{ "code": "k7qf2 9xmra" }
```

Case, spaces and dashes are ignored. `201` with the player (with
`sharedBy`). Errors:

| Status | `error` | |
|---|---|---|
| `404` | `invalid_code` | Unknown, used or expired |
| `409` | `own_player` | The player already belongs to this account |
| `409` | `already_shared` | Already shared with this account |
| `429` | `too_many_attempts` | 20 wrong codes in 15 minutes for this account |

## `GET /api/users/:id/profile`

| Query | |
|---|---|
| `since` | Start of "today" in the player's time zone, epoch ms. Used for the `today*` counts. Default 0. |

`200`:

```json
{
  "user": { "id": 1, "name": "Léa", "createdAt": 1792337327408 },
  "skills": [
    {
      "skill": "limits.growth",
      "topic": "limits",
      "total": 3,
      "correct": 1,
      "recent": [false, true, false],
      "lastAt": 1792337328999,
      "status": "review"
    }
  ],
  "mistakes": [
    {
      "mistake": "growthReversed",
      "count": 2,
      "lastAt": 1792337328999,
      "skills": ["limits.growth"]
    }
  ],
  "operators": [
    { "operator": "+", "total": 12, "correct": 11, "todayTotal": 4, "todayCorrect": 4 }
  ],
  "quizToday": { "answers": 10, "right": 7 }
}
```

- **`skills`:** one entry per kind of question the player has met.
  - `recent` holds the latest answers, newest first, at most five.
  - `status` is `review`, `learning` or `mastered`, following the rules in `shared/quiz/progress.ts`.
- **`mistakes`:** every mistake type the player has made in tests, most frequent first. `skills` lists the kinds of question where it occurred, most recent first.
- **`operators`:** in the order `+ − × ÷`, only those practised. Operators use the display symbols `+ − × ÷`.
- **`quizToday`:** test answers since `since`, every subject together.

## `GET /api/users/:id/tests`

| Query | |
|---|---|
| `subject` | `maths`, `chemistry`, `linux`, `chembio`, `sql`, `rust`, `ts`, `react`, `gcp`, `econ` or `calc`: the levels of that subject |

`200`: the player's last 50 tests in that subject, newest first, as stored:

```json
[
  {
    "id": 12,
    "at": 1792337328999,
    "level": "university",
    "topics": ["integrals", "limits"],
    "seed": 3735928559,
    "count": 10,
    "correct": 7,
    "answers": [2, 0, -1, "1,57", 3, 1, 0, 2, 2, 1],
    "focus": ["limits.growth"],
    "version": 4,
    "mode": "typed",
    "bank": null
  }
]
```

Everything to rebuild the test exactly (`generateQuiz` with the seed, level,
topics, count, `focus`, `version` and, for physical chemistry, economics and calculus, the bank
revision `bank`), and the answers as given: an option index, `-1` for a
blank, or the text typed. The browser rebuilds it to show the corrections.
Allowed for the player's own account and the accounts it is shared with
(`404 unknown user` otherwise); `400` for a bad id or subject.

## `POST /api/attempts`

```json
{
  "userId": 1,
  "maximum": 100,
  "operator": "÷",
  "top": 47,
  "bottom": 5,
  "given": 9,
  "givenRemainder": 2
}
```

| Field | |
|---|---|
| `operator` | `+`, `−` (U+2212), `×` or `÷` |
| `top`, `bottom` | Operands; for `÷`, dividend and non-zero divisor |
| `given` | Answer; for `÷`, the quotient |
| `givenRemainder` | Remainder, required for `÷`, ignored otherwise |
| `maximum` | Setting at the time, stored for reference |

Integers must be in 0…1,000,000 (`given` up to 10¹²). The server decides
whether the answer is right. A division needs both quotient and remainder
right.

`201`: `{ "correct": true }`

## `POST /api/quizzes`

```json
{
  "userId": 1,
  "seed": 2718281828,
  "level": "school",
  "topics": ["derivatives", "limits"],
  "count": 5,
  "focus": [],
  "version": 4,
  "answers": [3, 1, 0, 2, 0]
}
```

| Field | |
|---|---|
| `seed` | 0 … 2³² − 1 |
| `level` | `school`, `university`, `chemistry`, `chemistryAdvanced`, `linux`, `chembio`, `sql`, `rustBeginner`, `rustIntermediate`, `rustAdvanced`, `rustExpert`, `tsBeginner`, `tsIntermediate`, `tsAdvanced`, `tsExpert`, `reactBeginner`, `reactIntermediate`, `reactAdvanced`, `reactExpert`, `gcpBeginner`, `gcpIntermediate`, `gcpAdvanced` or `gcpExpert`, `econ`, `econAdvanced`, `calc`, `calcAdvanced` |
| `topics` | Non-empty, without duplicates: maths topics for `school` and `university` (`derivatives`, `integrals`…), `gases`, `firstLaw`, `secondLaw`, `phases`, `mixtures`, `equilibrium` for `chemistry` and `chemistryAdvanced`; `linuxFiles`, `linuxText`, `linuxShell`, `linuxProcesses`, `linuxSystem`, `linuxNetwork`, `linuxTools` for `linux`; `balancing` for `chembio`; `sqlSelect`, `sqlAggregate`, `sqlJoins`, `sqlModify`, `sqlPostgres`, `sqlSqlite`, `sqlMysql`, `sqlPractice` for `sql`; for the Rust levels, those of `rustBasics`, `rustOwnership`, `rustTypes`, `rustErrors`, `rustCollections`, `rustConcurrency`, `rustCargo`, `rustUnsafe` that the level has; for the TypeScript levels, those of `tsBasics`, `tsFunctions`, `tsObjects`, `tsNarrowing`, `tsGenerics`, `tsTypeLevel`, `tsRuntime`, `tsTooling` that the level has; for the React levels, those of `reactComponents`, `reactState`, `reactEffects`, `reactRendering`, `reactData`, `reactTyping`, `reactTooling`, `reactTesting` that the level has; for the Google Cloud levels, those of `gcpHierarchy`, `gcpIam`, `gcpServiceAccounts`, `gcpSecurity`, `gcpNetworking`, `gcpCompute`, `gcpStorage`, `gcpOperations` that the level has; `econWelfare`, `econMarketFailure`, `econPublicChoice`, `econIncidence`, `econOptimalTax`, `econTaxDesign`, `econSocialInsurance`, `econRedistribution`, `econLabour` for `econ` and `econAdvanced`; `calcLimits`, `calcDerivatives`, `calcApplications`, `calcIntegrals`, `calcTranscendental`, `calcTechniques`, `calcOde`, `calcParametric`, `calcSeries`, `calcVectors`, `calcMultivariable`, `calcVectorCalculus`, `calcStochastic` for `calc` and `calcAdvanced` |
| `count` | 1 … 30 (the app offers 5, 10, 15, 20) |
| `focus` | Kinds of question brought back for review; known ids, without duplicates. Optional, default `[]`. |
| `version` | Generator version; must equal the server's `QUIZ_VERSION`. Optional, default the server's. |
| `answers` | `count` integers, each an option index 0–3, or `-1` for a blank; in a typed test, texts |
| `mode` | `choices` or `typed`. Optional, default `choices`. |
| `bank` | Physical chemistry, economics and calculus only: the [question bank](question-bank.md) revision the test drew from, at most the server's. Optional; omitted, the test has no written question. |

The server regenerates the test from `seed`, `level`, `topics`, `count`,
`focus`, `version` and `bank`, grades it, and stores the test and one row per
question.

`201`:

```json
{ "correct": 4, "total": 5 }
```

The client displays its own grading immediately; the two always agree when
both run the same version.

## Question bank

### `GET /api/quiz/bank`

The whole [question bank](question-bank.md), removed questions included, so
the browser can rebuild older tests. `{ "revision": 0, … }` when none was
imported.

```json
{
  "revision": 2,
  "books": [
    { "id": "atkins-12", "title": "Atkins' Physical Chemistry, 12th edition", "source": "Atkins" },
    { "id": "gruber", "title": "Gruber, Public Finance and Public Policy", "source": "Gruber" }
  ],
  "units": [{ "id": "1A", "book": "atkins-12", "topic": "gases", "title": { "en": "The perfect gas" } }],
  "questions": [
    {
      "id": "1A-01", "unit": "1A", "topic": "gases", "level": "core", "section": "1A.2",
      "prompt": { "en": "…" }, "correct": { "en": "…" },
      "wrong": [{ "en": "…" }, { "en": "…" }, { "en": "…" }],
      "explanation": { "en": "…" },
      "from": 1
    }
  ]
}
```

`until` is present on a removed question: the first revision without it.

### `POST /api/quiz/flags`

A question flagged from the corrections.

```json
{ "userId": 1, "skill": "gases.concepts1A", "question": "1A-01", "note": "two right answers" }
```

| Field | |
|---|---|
| `skill` | A known kind of question |
| `question` | A bank question's id, or a generated question's formula; at most 2,000 characters |
| `note` | Optional, at most 500 characters |

`204`; `400` for an invalid flag; `404` for a player outside the account.

## `GET /api/stats`

| Query | |
|---|---|
| `since` | Start of "today", epoch ms. Default 0. |

Every player, sorted by right arithmetic answers, then by name:

```json
[
  {
    "user": { "id": 1, "name": "Léa", "createdAt": 1792337327408 },
    "total": 1,
    "correct": 1,
    "todayTotal": 1,
    "todayCorrect": 1,
    "quizTests": 1,
    "quizCorrect": 4,
    "quizQuestions": 5
  }
]
```

`total`, `correct` and `today*` count column-arithmetic answers; `quiz*`
count tests, right answers and questions.

## Vocabulary

See [Vocabulary](vocabulary.md) for the method and the grading.

### `GET /api/vocab/books`

```json
[
  {
    "id": 1,
    "slug": "collins-spanish",
    "title": "3000 words and phrases",
    "kind": "translation",
    "term": "es",
    "meaning": "en",
    "order": "book",
    "entries": 3214,
    "lessons": [
      {
        "id": 1,
        "title": "Lo esencial",
        "subtitle": "The essentials",
        "sections": [{ "id": 1, "title": "Lo esencial", "subtitle": "The basics", "entries": 25 }]
      }
    ]
  }
]
```

Books without entries are left out; an empty list when none has been
imported. `kind` is `translation` or `definition`; `term` and `meaning` are the
language studied and the language of the meanings.

### `GET /api/vocab/progress`

| Query | |
|---|---|
| `userId` | The player |
| `since` | Start of "today", epoch ms, for `today` |

```json
{
  "sections": { "1": { "new": 4, "learning": 8, "known": 0, "mastered": 0, "due": 3, "skipped": 1 } },
  "books": { "1": { "due": 3, "started": 8 } },
  "due": 3,
  "today": { "answers": 9, "right": 8 }
}
```

`due` counts cards (an entry has two: recognise and recall), in every book;
`books` gives it per book, with the number of entries started. Every section
is listed; an entry counts as `new` until one of its cards has been answered.
A skipped entry counts only as `skipped`, and its cards are never due.

### `GET /api/vocab/lessons/:id/words`

`?userId=1&lang=fr`: a lesson's words for a player, section by section, the
meaning in `lang` when the book has it. `404` for an unknown lesson.

```json
{
  "lesson": { "id": 1, "title": "En el colegio", "subtitle": "At school" },
  "sections": [
    {
      "id": 1, "title": "El aula", "subtitle": "The classroom",
      "words": [
        { "id": 17, "term": "el lápiz", "reading": "", "meaning": "pencil", "note": "", "status": "new", "skipped": false }
      ]
    }
  ]
}
```

`status` is `new`, `learning`, `known` or `mastered`; `reading` is the
rōmaji or transliteration, or a kanji's readings.

### `PUT /api/vocab/skips`

```json
{ "userId": 1, "entryId": 17, "skipped": true }
```

```json
{ "userId": 1, "entryIds": [17, 18, 19], "skipped": true }
```

`204`. Skips the word for the player (`skipped: true`) or puts it back
(`false`); its boxes are kept either way. `entryIds` (1 … 500 ids) does
several at once, a section's: all or none. `400` for a malformed body, `404`
for an unknown player or entry. See
[Vocabulary › Skipping words](vocabulary.md#skipping-words).

### `GET /api/vocab/stats`

`?userId=1&book=3&tz=120`: a player's statistics on one book. `tz` is the
browser's offset from UTC in minutes (`-new Date().getTimezoneOffset()`), so
days end at the player's midnight.

```json
{
  "words": { "total": 5087, "new": 4948, "learning": 105, "known": 34, "mastered": 0 },
  "boxes": { "recognise": [0, 25, 24, 21, 24, 30, 15], "recall": [0, 34, 26, 20, 28, 6, 0] },
  "all": { "answers": 707, "right": 587 },
  "days": [{ "day": "2026-10-20", "answers": 22, "right": 18, "newWords": 6 }],
  "streak": { "current": 9, "best": 9 },
  "forecast": [54, 16, 11, 18, 12, 18, 16, 15, 16, 14, 13, 13, 9, 4],
  "byMode": { "choice": { "answers": 427, "right": 352 }, "written": { "answers": 280, "right": 236 } },
  "byDirection": { "recognise": { "answers": 426, "right": 349 }, "recall": { "answers": 281, "right": 239 } },
  "verdicts": { "right": 192, "accent": 44, "typo": 0, "article": 0, "wrong": 44 },
  "lessons": [{ "id": 12, "title": "Basic concepts. Part 1", "total": 140, "new": 2, "learning": 104, "known": 34, "mastered": 0 }],
  "hardest": [{ "entryId": 901, "term": "こんにちは！", "meaning": "Hello! (form.)", "reading": "konnichiwa!", "wrong": 5, "answers": 16, "box": 1 }]
}
```

- `days`: always the last 30, oldest first, today last.
- `forecast`: cards due today (overdue included), then on each of the next 13 days.
- `boxes`: index = box, 1–6.
- `hardest`: at most 12.

Errors: `invalid query` (400), `unknown user`, `unknown book` (404).

### `GET /api/vocab/session`

| Query | |
|---|---|
| `userId` | The player |
| `kind` | `section`, `lesson`, `all` (a whole book) or `books` (several books of a shelf) |
| `id` | Section, lesson or book id |
| `books` | For `kind=books`: the books' ids, comma-separated (1 … 12), each visible to the account |
| `purpose` | `learn` (default): cards due, recall cards just available, new entries. `review`: cards already started, due or not, weakest first. `due`: cards due only. |
| `size` | 1 … 60 cards |
| `mode` | `mixed` (default), `choice` or `written` |
| `order` | New entries: `book` (default, the book's order) or `random` |
| `lang` | Optional, `fr`, `es` or `en`: meanings in that language when the book has them (`translations`) |

```json
[
  {
    "entryId": 7,
    "direction": "recognise",
    "mode": "choice",
    "box": 0,
    "prompt": "la regla",
    "promptLang": "es",
    "answerLang": "en",
    "group": "Things",
    "options": ["schoolbag", "ruler", "rubber", "book"]
  }
]
```

`options` is present for `choice` cards only. With `kind=books` and more than
one book, each card has `source`, the title of its word's book, and its wrong
options come from that book (see [Vocabulary › Shelves](vocabulary.md#shelves)). `feminine: true` marks a
feminine noun taking *el*, on recognise cards. The recognise card of a
definition book (word shown, definition asked) is always `choice`. In a book
with readings (Japanese), `promptReading` is the rōmaji of the word shown on a
recognise card, and `optionReadings` the rōmaji of each option of a recall
`choice` card, in the order of `options`.

In a Characters book, `direction` may also be `read` (a kanji shown, a reading
asked); `script` is `kana` or `kanji`; `met: true` marks a character met in a
word the player has started in another Japanese book. Recall cards there are
always `choice`. With `lang`, `answerLang` (recognise) or `promptLang`
(recall) is the language of the meaning given.

### `POST /api/vocab/answers`

```json
{ "userId": 1, "entryId": 7, "direction": "recall", "mode": "written", "given": "la regla" }
```

`201`:

```json
{ "verdict": "right", "correct": true, "expected": "la regla", "feminine": false, "reading": "", "note": "", "box": 2, "dueAt": 1792423727408 }
```

`verdict` is `right`, `accent`, `typo`, `article` or `wrong`; `correct` is
what moves the card between boxes. A `choice` answer must equal the option as
printed. A `written` answer that is wrong for this entry but right for another
entry of the book with the same prompt counts as right. `note` is the entry's
example, if any; `reading` the term's rōmaji, if any. A Japanese `written`
answer may be kanji, kana or rōmaji.

`lang` (optional, `fr`, `es`, `en`) grades a meaning in that language when
the entry has one. A `read` answer (Characters book, kanji only) is right when
it is any one of the readings, in katakana, hiragana or rōmaji. Then also:

- `meaning` and `readings` (a kanji): its meaning in the language asked, and all its readings;
- `inWords` (a character): up to three words the player has started that use it, `{term, reading, meaning}`;
- `characters` (a word of a Japanese book): its kanji in the Characters book, `{term, reading, meaning, started}`, `reading` being the kanji's readings.

Errors: `invalid answer` (400), `unknown user`, `unknown entry` (404).

## Workbook exercises

`/api/exercises/…`: a workbook's units, a unit's exercises with the
player's answers, drafts, the correction of a unit and the player's own
marks. Every route and its body are in
[Workbook exercises › Routes](exercises.md#routes).

## Authentication

Under `/api/auth`. Errors are `{"error": "<code>"}`; the codes are listed at
the end of this section. Redirects from provider sign-in carry them as
`?auth_error=<code>`.

| Method | Path | Session | |
|---|---|---|---|
| `GET` | `/api/auth/session` | any | Who is signed in |
| `GET` | `/api/auth/options` | none | Providers configured, registration open |
| `POST` | `/api/auth/register` | none | Create an account with a password |
| `POST` | `/api/auth/login` | none | Sign in with email or username and password |
| `POST` | `/api/auth/logout` | any | End this session |
| `POST` | `/api/auth/logout-all` | account | End every other session of the account |
| `POST` | `/api/auth/onboarded` | any | The guided tour was finished or skipped |
| `POST` | `/api/auth/password` | account | Change or add the account password |
| `GET` | `/api/auth/methods` | account | Ways to sign in, of the account and its players |
| `DELETE` | `/api/auth/methods/:id` | account | Remove one |
| `POST` | `/api/auth/players/:id/password` | account | Give a player a username and password |
| `GET` | `/api/auth/oauth/:provider/start` | depends on intent | Start a provider sign-in (browser navigation) |
| `GET` | `/api/auth/oauth/:provider/callback` | — | Return from the provider (browser navigation) |

### `GET /api/auth/session`

```json
{
  "authenticated": true,
  "account": { "id": 1, "name": "Joachim", "email": "joachim@example.ch" },
  "player": null,
  "onboarded": true
}
```

`player` is `{ "id": 3, "name": "Léa" }` for a player's own session. Signed
out: `{ "authenticated": false }`.

`onboarded` is `false` until the [guided tour](user-guide.md#guided-tour) is
finished or skipped: by the account on its own session, by the player on a
player's own session. The app then opens the tour after signing in.

### `GET /api/auth/options`

```json
{ "providers": [{ "id": "google", "name": "Google" }], "registration": true, "publicUrl": "https://calcul.example.ch" }
```

`registration` is always `true` while no account exists.

### `POST /api/auth/register`

```json
{ "name": "Joachim", "email": "joachim@example.ch", "password": "a long enough phrase" }
```

`201` with the session state, and the session cookie. The very first account
receives the players created before version 4. Errors: `invalid_name`,
`invalid_email`, `password_too_short`, `password_too_long`, `email_in_use`
(409), `registration_closed` (403), `too_many_attempts` (429).

### `POST /api/auth/login`

```json
{ "identifier": "joachim@example.ch", "password": "a long enough phrase" }
```

`identifier` is an account email (any case) or a player's username. `200`
`{"ok": true}` with the session cookie; then `GET /api/auth/session`. Errors: `invalid_credentials` (401),
`too_many_attempts` (429).

### `POST /api/auth/logout`, `POST /api/auth/logout-all`

`204`. `logout` clears the cookie. `logout-all` keeps the current session.

### `POST /api/auth/onboarded`

No body. `204`; marks the guided tour as seen for the account, or for the
player on a player's own session (`accounts.onboarded_at` or
`users.onboarded_at`). The first time is kept: opening the tour again from the
footer changes nothing. `401` signed out.

### `POST /api/auth/password`

```json
{ "current": "old phrase", "password": "new phrase", "email": "only@if.missing" }
```

- **`current`:** required when the account already has a password (`401 wrong_password` otherwise).
- **`email`:** needed when adding a first password to an account created through a provider without an email.

Other sessions of the account are ended. `204`.

### `GET /api/auth/methods`

```json
[
  { "id": 1, "type": "password", "provider": "", "label": "joachim@example.ch", "playerId": null, "createdAt": 1792337327408, "lastUsedAt": 1792337400000 },
  { "id": 4, "type": "oauth", "provider": "google", "label": "joachim@gmail.com", "playerId": null, "createdAt": 1792337500000, "lastUsedAt": null },
  { "id": 5, "type": "password", "provider": "", "label": "lea.m", "playerId": 3, "createdAt": 1792337600000, "lastUsedAt": null }
]
```

### `DELETE /api/auth/methods/:id`

`204`. Removing a player's method also ends that player's sessions. Errors:
`unknown_method` (404), `last_method` (409) for the account's only method.

### `POST /api/auth/players/:id/password`

```json
{ "username": "lea.m", "password": "a long enough phrase" }
```

Replaces the player's previous username and password, if any, and ends their
sessions. `201` with the new method, as in `GET /api/auth/methods`. Errors: `invalid_username`, `username_taken` (409),
`unknown_player` (404), and the password errors.

### Provider sign-in

The browser navigates to:

```
/api/auth/oauth/<provider>/start?intent=login
/api/auth/oauth/<provider>/start?intent=link                (account session)
/api/auth/oauth/<provider>/start?intent=link-player&player=3 (account session)
```

The flow ends with a redirect to `/?auth=signed_in`, `signed_up` or `linked`,
or `/?auth_error=<code>`: `cancelled`, `invalid_state`, `provider_failed`,
`provider_unavailable`, `unknown_provider`, `email_in_use`, `already_linked`,
`registration_closed`, `not_signed_in`, `unknown_player`. See
[Authentication › Providers](authentication.md#providers-1).
