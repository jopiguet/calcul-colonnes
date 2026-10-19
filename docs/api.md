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
| `POST` | [`/api/attempts`](#post-apiattempts) | Record a column-arithmetic answer |
| `POST` | [`/api/quizzes`](#post-apiquizzes) | Record a finished test |
| `GET` | [`/api/stats`](#get-apistats) | Totals of every player |
| `GET` | [`/api/vocab/books`](#get-apivocabbooks) | Vocabulary books, with their lessons and sections |
| `GET` | [`/api/vocab/progress`](#get-apivocabprogress) | One player's vocabulary progress |
| `GET` | [`/api/vocab/session`](#get-apivocabsession) | Cards for a practice session |
| `POST` | [`/api/vocab/answers`](#post-apivocabanswers) | Record an answer; the server grades it |

The [authentication routes](#authentication) are under `/api/auth`.

## Scope

What a session sees:

| Session | Players visible | Restrictions |
|---|---|---|
| Account | All players of the account | — |
| Player (their own sign-in) | That player only | `POST /api/users`, `DELETE /api/users/:id` and the account routes of `/api/auth` answer `403 account_only` |

A player outside the scope answers `404 unknown user`, like one that does not
exist.

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

Players sorted by name.

```json
[{ "id": 1, "name": "Léa", "createdAt": 1792337327408 }]
```

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

`204`, also when the player does not exist. Deletes their arithmetic answers,
tests and test answers.

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
  ]
}
```

- **`skills`:** one entry per kind of question the player has met.
  - `recent` holds the latest answers, newest first, at most five.
  - `status` is `review`, `learning` or `mastered`, following the rules in `shared/quiz/progress.ts`.
- **`mistakes`:** every mistake type the player has made in tests, most frequent first. `skills` lists the kinds of question where it occurred, most recent first.
- **`operators`:** in the order `+ − × ÷`, only those practised. Operators use the display symbols `+ − × ÷`.

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
  "version": 2,
  "answers": [3, 1, 0, 2, 0]
}
```

| Field | |
|---|---|
| `seed` | 0 … 2³² − 1 |
| `level` | `school` or `university` |
| `topics` | Non-empty, without duplicates, among `derivatives`, `integrals`, `trigonometry`, `limits`, `explog` |
| `count` | 1 … 30 (the app offers 5, 10, 15, 20) |
| `focus` | Kinds of question brought back for review; known ids, without duplicates. Optional, default `[]`. |
| `version` | Generator version; must equal the server's `QUIZ_VERSION`. Optional, default the server's. |
| `answers` | `count` integers, each an option index 0–3, or `-1` for a blank |

The server regenerates the test from `seed`, `level`, `topics`, `count`,
`focus` and `version`, grades it, and stores the test and one row per
question.

`201`:

```json
{ "correct": 4, "total": 5 }
```

The client displays its own grading immediately; the two always agree when
both run the same version.

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
    "title": "Collins Spanish",
    "kind": "translation",
    "term": "es",
    "meaning": "en",
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
  "sections": { "1": { "new": 4, "learning": 8, "known": 0, "mastered": 0, "due": 3 } },
  "books": { "1": { "due": 3, "started": 8 } },
  "due": 3,
  "today": { "answers": 9, "right": 8 }
}
```

`due` counts cards (an entry has two: recognise and recall), in every book;
`books` gives it per book, with the number of entries started. Every section
is listed; an entry counts as `new` until one of its cards has been answered.

### `GET /api/vocab/session`

| Query | |
|---|---|
| `userId` | The player |
| `kind` | `section`, `lesson` or `all` (a whole book) |
| `id` | Section, lesson or book id |
| `purpose` | `learn` (default): cards due, recall cards just available, new entries. `review`: cards already started, due or not, weakest first. `due`: cards due only. |
| `size` | 1 … 60 cards |
| `mode` | `mixed` (default), `choice` or `written` |

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

`options` is present for `choice` cards only. `feminine: true` marks a
feminine noun taking *el*, on recognise cards. The recognise card of a
definition book (word shown, definition asked) is always `choice`.

### `POST /api/vocab/answers`

```json
{ "userId": 1, "entryId": 7, "direction": "recall", "mode": "written", "given": "la regla" }
```

`201`:

```json
{ "verdict": "right", "correct": true, "expected": "la regla", "feminine": false, "note": "", "box": 2, "dueAt": 1792423727408 }
```

`verdict` is `right`, `accent`, `typo`, `article` or `wrong`; `correct` is
what moves the card between boxes. A `choice` answer must equal the option as
printed. A `written` answer that is wrong for this entry but right for another
entry of the book with the same prompt counts as right. `note` is the entry's
example, if any. Errors: `invalid answer` (400), `unknown user`, `unknown entry` (404).

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
  "player": null
}
```

`player` is `{ "id": 3, "name": "Léa" }` for a player's own session. Signed
out: `{ "authenticated": false }`.

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
