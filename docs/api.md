# API

JSON over HTTP, under `/api`. Bodies are JSON (`Content-Type: application/json`);
timestamps are epoch milliseconds. Shared types are in `shared/types.ts`.

There is **no authentication**: see [Deployment › Security](deployment.md#security).

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

## Errors

Errors are `{"error": "<reason>"}` with:

| Status | When |
|---|---|
| `400` | Invalid input: `invalid name`, `invalid id`, `invalid attempt`, `invalid quiz`, `invalid since` |
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
