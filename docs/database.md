# Database

The server stores accounts, players and results in **SQLite** by default, or in
**PostgreSQL** (Neon or any other) when `DATABASE_URL` is set. The schema and
the queries are the same on both.

- [Schema](#schema)
- [Migrations](#migrations)
- [SQLite and PostgreSQL](#sqlite-and-postgresql)
- [Moving to Neon](#moving-to-neon)
- [Backups](#backups)
- [Useful queries](#useful-queries)

## Schema

```mermaid
erDiagram
  accounts ||--o{ users : "owns"
  accounts ||--o{ credentials : "ways to sign in"
  users |o--o{ credentials : "player's own"
  accounts ||--o{ sessions : ""
  users ||--o{ attempts : "column arithmetic"
  users ||--o{ quiz_results : "tests"
  users ||--o{ quiz_answers : ""
  quiz_results ||--|{ quiz_answers : "one per question"
```

All timestamps are **epoch milliseconds** (`BIGINT`), and booleans are `0`/`1`
(`SMALLINT`), so both engines have exactly the same columns and values.
Deleting a user deletes all their rows (`ON DELETE CASCADE`), and deleting
an account deletes its players, methods and sessions. SQLite enforces
this because the server enables `PRAGMA foreign_keys`.

### `users`

| Column | Type | |
|---|---|---|
| `id` | integer | primary key |
| `name` | text | as typed, trimmed, 20 characters at most |
| `name_key` | text, unique | `<account id>:<lower-cased name>`; prevents "Léa" and "léa" in one account, allows them in two |
| `created_at` | bigint | |
| `account_id` | integer, nullable | owning account; `NULL` only for players created before version 4, until the first account claims them |

### `accounts`

| Column | Type | |
|---|---|---|
| `id` | integer | primary key |
| `email` | text, unique, nullable | lower-cased; `NULL` for an account created through a provider that gave no verified email |
| `name` | text | |
| `created_at` | bigint | |

### `credentials`

One row per way to sign in. See [Authentication](authentication.md#model).

| Column | Type | |
|---|---|---|
| `id` | integer | primary key |
| `account_id` | integer | owning account |
| `player_id` | integer, nullable | set for a player's own sign-in |
| `type` | text | `password`, `oauth`; `passkey` and `email_link` reserved |
| `provider` | text | `google`, `github`…; `''` for a password |
| `subject` | text | email or username for a password; the provider's user id for `oauth` |
| `secret` | text, nullable | password hash (`scrypt$…`) |
| `label` | text, nullable | what the Account page shows |
| `created_at`, `last_used_at` | bigint | |

`(type, provider, subject)` is unique: one email, username or provider
identity signs in to one place only.

### `sessions`

| Column | Type | |
|---|---|---|
| `id` | text | primary key: SHA-256 of the cookie's token, hex. The token itself is never stored. |
| `account_id` | integer | |
| `player_id` | integer, nullable | set for a player's own session |
| `created_at`, `last_seen_at`, `expires_at` | bigint | |
| `user_agent` | text, nullable | first 200 characters |

### `auth_flows`

Provider sign-ins in progress: `state` (primary key), `provider`, the PKCE
`verifier`, `intent` (`login`, `link`, `link-player`), `account_id`,
`player_id`, `created_at`. Each row is deleted when used, and after 10 minutes.

### `attempts`

One row per checked column-arithmetic answer.

| Column | Type | |
|---|---|---|
| `id` | integer | primary key |
| `user_id` | integer | → `users.id` |
| `at` | bigint | |
| `maximum` | integer | "up to" setting at the time |
| `operator` | text | `+`, `-`, `*` or `/` (ASCII) |
| `top`, `bottom` | integer | operands; for a division, dividend and divisor |
| `given` | integer | answer typed; for a division, the quotient |
| `given_remainder` | integer, null | remainder typed (divisions only) |
| `correct` | smallint | decided by the server |

Index: `(user_id, at)`.

### `quiz_results`

One row per finished multiple-choice test. The questions are not stored:
they are regenerated from the test's definition. See
[Architecture › A test is a seed](architecture.md#a-test-is-a-seed).

| Column | Type | |
|---|---|---|
| `id` | integer | primary key |
| `user_id` | integer | → `users.id` |
| `at` | bigint | |
| `level` | text | `school` or `university` |
| `topics` | text | comma-separated, e.g. `derivatives,limits` |
| `seed` | bigint | 32-bit unsigned |
| `question_count` | integer | |
| `focus` | text | comma-separated kinds brought back for review; empty if none |
| `version` | integer | generator version the test was made with |
| `answers` | text | JSON array of chosen option indexes, `-1` = blank |
| `correct` | integer | number of right answers, computed by the server |

Index: `(user_id, at)`.

### `quiz_answers`

One row per question of each test. This is what the progress page and the
review of mistakes are built from.

| Column | Type | |
|---|---|---|
| `id` | integer | primary key |
| `quiz_id` | integer | → `quiz_results.id` |
| `user_id` | integer | → `users.id` |
| `at` | bigint | time of the test |
| `position` | integer | question number in the test, from 0 |
| `skill` | text | kind of question, e.g. `derivatives.product` |
| `topic` | text | |
| `given` | integer | option chosen, `-1` = blank |
| `correct` | smallint | |
| `review` | smallint | 1 if the question was brought back for review |
| `mistake` | text, null | mistake type of the wrong option chosen (`MISTAKES` in `shared/quiz/types.ts`); null when right or blank |

Indexes: `(user_id, skill, at)`, `(quiz_id)`.

### `schema_migrations`

The versions of the migrations already applied.

## Migrations

Migrations live in `server/migrations/` and run automatically at server
start, in order, each in its own transaction together with its row in
`schema_migrations`.

| File | Content |
|---|---|
| `001_init` | `users`, `attempts` (addition and subtraction) |
| `002_multiply_divide` | `*` and `/` operators, `given_remainder` |
| `003_quiz_results` | `quiz_results` |
| `004_quiz_answers` | `quiz_answers`; `focus` and `version` on `quiz_results` |
| `005_mistakes` | `mistake` on `quiz_answers` (common SQL, one file) |
| `006_accounts` | `accounts`, `credentials`, `sessions`, `auth_flows`; `account_id` on `users` |

**File names.**

- `NNN_name.sql` runs on both engines.
- `NNN_name.sqlite.sql` and `NNN_name.postgres.sql` are used when the DDL differs: identity columns, or SQLite's inability to alter a `CHECK` constraint, which forced `002` to rebuild the table.

**Adding a migration.**

1. Create `007_name.sql`, or the pair of `007_name.sqlite.sql` and `007_name.postgres.sql`.
2. Restart the server.
3. Never edit a migration that has already been applied somewhere: add a new one.

**Rebuilt at startup.** Two steps regenerate earlier tests from their seed,
each with its own generator version:

- **Answers:** `quiz_answers` rows for tests saved before migration 004.
- **Mistakes:** `mistake` for wrong answers saved before migration 005.

Both run at each start and do nothing once everything is filled.

## SQLite and PostgreSQL

| | SQLite | PostgreSQL |
|---|---|---|
| Chosen when | `DATABASE_URL` is empty | `DATABASE_URL` starts with `postgresql://` or `postgres://` |
| Location | `SQLITE_PATH`, default `./data/calcul-colonnes.sqlite` | the connection string |
| Driver | `better-sqlite3`, WAL journal | `pg`, pool of 5 connections |
| Identity columns | `INTEGER PRIMARY KEY AUTOINCREMENT` | `BIGINT GENERATED BY DEFAULT AS IDENTITY` |

Queries are written once (`server/repository.ts`) with `$1, $2…`
placeholders. `server/db/sqlite.ts` turns them into named parameters, so a
value can be used twice. PostgreSQL returns `BIGINT` and aggregates as
strings, so every value read goes through `Number()`.

The server logs which database it uses at startup, without credentials:

```
database: SQLite (/srv/calcul-colonnes/data/calcul-colonnes.sqlite)
database: PostgreSQL (ep-example-123456.eu-central-1.aws.neon.tech/calcul)
```

## Moving to Neon

1. **Create the database.** In the Neon console, create an empty database and copy its connection string, which includes `sslmode=require`.
2. **Point the server at it.** Put the string in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@ep-….neon.tech/calcul?sslmode=require
   ```
3. **Copy the existing SQLite data** (optional):
   ```sh
   npm run db:copy-to-postgres
   ```
   This applies the migrations on both sides and copies `accounts`, `users`, `credentials`, `attempts`, `quiz_results` and `quiz_answers` in one transaction, keeping the ids. It then moves the identity sequences past the copied ids. It refuses to run if the target already has accounts or players.
   Sessions are not copied: everyone signs in again once.
4. **Start the server:** `npm start`. The log should show `database: PostgreSQL (…)`.

To go back to SQLite, empty `DATABASE_URL`. Data written to PostgreSQL in the
meantime is not copied back.

Neon suspends idle databases. The first request after a pause can take a
moment; a dropped idle connection is logged by the pool (`postgres pool: …`)
and does not stop the server.

## Backups

**SQLite.** The database is a single file plus its WAL files (`-wal`,
`-shm`) while the server runs. Do not copy the file alone while the server is
running. Either:

- use SQLite's online backup, with the `sqlite3` command-line tool:
  ```sh
  sqlite3 data/calcul-colonnes.sqlite ".backup backups/calcul-$(date +%F).sqlite"
  ```
- or, without the CLI, with the driver already installed:
  ```sh
  node -e "require('better-sqlite3')('data/calcul-colonnes.sqlite').backup('backups/calcul.sqlite').then(() => console.log('ok'))"
  ```
- or stop the server and copy the `data/` folder.

**PostgreSQL.** Neon keeps a history for point-in-time restore according to
your plan; for a copy of your own, use `pg_dump "$DATABASE_URL" > backup.sql`.

## Useful queries

Success rate per player and operation:

```sql
SELECT u.name, a.operator, COUNT(*) AS answers, ROUND(100.0 * SUM(a.correct) / COUNT(*)) AS pct
  FROM attempts a JOIN users u ON u.id = a.user_id
 GROUP BY u.name, a.operator
 ORDER BY u.name, a.operator;
```

Kinds of question most often missed, all players:

```sql
SELECT skill, COUNT(*) AS answers, SUM(1 - correct) AS wrong
  FROM quiz_answers
 GROUP BY skill
 ORDER BY 1.0 * SUM(1 - correct) / COUNT(*) DESC;
```

Most frequent mistakes, all players:

```sql
SELECT mistake, COUNT(*) AS times, COUNT(DISTINCT user_id) AS players
  FROM quiz_answers
 WHERE mistake IS NOT NULL
 GROUP BY mistake
 ORDER BY times DESC;
```

Dates are epoch milliseconds: `datetime(at / 1000, 'unixepoch')` in SQLite,
`to_timestamp(at / 1000.0)` in PostgreSQL.
