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
| `hidden` | text | JSON list of activities taken off the player's home page; `[]` shows everything, and new activities show |
| `onboarded_at` | bigint, nullable | when the player first finished or skipped the [guided tour](user-guide.md#guided-tour) on their own login; `NULL` until then |

### `player_shares`, `player_invites`

A player belongs to one account (`users.account_id`) and may be shared with
others. See [Authentication › Sharing a player](authentication.md#sharing-a-player).

| Table | Columns |
|---|---|
| `player_shares` | `user_id`, `account_id` (primary key together), `created_at`; deleted with the player or the account |
| `player_invites` | `id` (SHA-256 of the code), `user_id`, `created_at`, `expires_at`, `used_at` |

### `accounts`

| Column | Type | |
|---|---|---|
| `id` | integer | primary key |
| `email` | text, unique, nullable | lower-cased; `NULL` for an account created through a provider that gave no verified email |
| `name` | text | |
| `role` | text | `owner` (the first account: invitations, content, feedback) or `member` |
| `created_at` | bigint | |
| `onboarded_at` | bigint, nullable | when the account first finished or skipped the [guided tour](user-guide.md#guided-tour); `NULL` until then, so it opens after sign-in |

### `account_invites`, `app_settings`, `feedback`

The family release ([Authentication › Family release](authentication.md#family-release)).

| Table | Content |
|---|---|
| `account_invites` | `id` (SHA-256 of the code), `created_by`, `note`, `created_at`, `expires_at` (two weeks), `used_at`, `used_by` |
| `app_settings` | key/value set by the owner: `bank_visibility` (`private` or `shared`) |
| `feedback` | `id`, `account_id`, `player_id` (null when the account sent it), `at`, `page`, `version`, `text` |

`auth_flows.invite` carries an invitation through a provider's sign-up.

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
| `level` | text | `school`, `university`, `chemistry`, `chemistryAdvanced`, `linux`, `chembio`, `sql`, `rustBeginner`, `rustIntermediate`, `rustAdvanced`, `rustExpert`, `tsBeginner`, `tsIntermediate`, `tsAdvanced` or `tsExpert` |
| `topics` | text | comma-separated, e.g. `derivatives,limits` |
| `seed` | bigint | 32-bit unsigned |
| `question_count` | integer | |
| `focus` | text | comma-separated kinds brought back for review; empty if none |
| `version` | integer | generator version the test was made with |
| `answers` | text | JSON array: for each question the chosen option index (`-1` = blank), or in a typed test the text typed |
| `mode` | text | `choices`, or `typed` when numbers were typed where possible |
| `correct` | integer | number of right answers, computed by the server |
| `bank` | integer, null | revision of the [question bank](question-bank.md) a physical chemistry test drew from; null for maths tests |

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
| `given` | integer | option chosen, `-1` = blank; for a typed answer the option it matches, `-2` when it matches none |
| `correct` | smallint | |
| `review` | smallint | 1 if the question was brought back for review |
| `mistake` | text, null | mistake type of the wrong option chosen or typed (`MISTAKES` in `shared/quiz/types.ts`); null when right, blank or matching no option |
| `typed` | text, null | the text typed, as typed; null when an option was picked |

Indexes: `(user_id, skill, at)`, `(quiz_id)`.

### Vocabulary

The imported books, seen by the owner's account (and by every account once
shared), and each player's progress. See [Vocabulary](vocabulary.md).

| Table | Rows | Key columns |
|---|---|---|
| `vocab_books` | one per book | `slug` (the file's book id), `position`, `title`, `kind` (`translation`, `definition` or `characters`), `term_lang`, `meaning_lang`, `ordering` (`book` or `alphabetical`), `credit` (attribution shown with the book), `visibility` (`private`: the owner's account only; `shared`: every account) |
| `vocab_lessons` | one per lesson (chapter) | `book_id`, `position` (unique per book), `title`, `subtitle` |
| `vocab_sections` | one per section | `lesson_id`, `position`, `title`, `subtitle` |
| `vocab_entries` | one per entry | `section_id`, `position`, `term`, `meaning`, `grp` (heading inside the section), `feminine`, `note` (example), `reading` (Japanese rōmaji), `readings` (a kanji's on and kun readings), `translations` (JSON: the meaning in French, Spanish) |
| `vocab_progress` | one per player, entry and direction | primary key `(user_id, entry_id, direction)`, direction `recognise`, `recall` or `read` (a kanji's reading); `box` 1–6, `due_at`, `last_at`, `right_count`, `wrong_count` |
| `vocab_answers` | one per answer | `user_id`, `entry_id`, `direction`, `mode`, `at`, `given`, `verdict`, `correct` |
| `vocab_skips` | one per word a player skipped | primary key `(user_id, entry_id)`, `at` |

`direction` is `recognise` (Spanish shown) or `recall` (meaning shown).
Deleting a player deletes their progress and answers; an import that removes
an entry deletes its progress.

### Question bank

Written questions from a textbook, seen by the owner's account (and by every
account once shared, `app_settings.bank_visibility`). See
[Question bank](question-bank.md).

| Table | Content |
|---|---|
| `quiz_bank_meta` | key/value: `book`, `title`, `source`, `revision` |
| `quiz_bank_units` | `id` ("1A"), `topic`, `position`, `title` (JSON by language) |
| `quiz_bank` | `id`, `unit`, `level` (`core` or `advanced`), `section`, `position`; `prompt`, `correct`, `wrong`, `explanation` as JSON by language; `from_revision`, `until_revision` (null while in the file) |
| `quiz_flags` | `id`, `user_id`, `at`, `skill`, `question` (bank id or formula), `note`, `resolved` |

### `schema_migrations`

The versions of the migrations already applied.

## Migrations

Migrations live in `server/migrations/` and run automatically at server
start (on Cloud Run: once per release, in the job `luma-maintenance`, after a
rehearsal on a Neon branch of production), in order, each in its own
transaction together with its row in `schema_migrations`. A migration must
work with the code of the previous release too, which still serves while it
runs: add tables and columns, rename or drop later.

| File | Content |
|---|---|
| `001_init` | `users`, `attempts` (addition and subtraction) |
| `002_multiply_divide` | `*` and `/` operators, `given_remainder` |
| `003_quiz_results` | `quiz_results` |
| `004_quiz_answers` | `quiz_answers`; `focus` and `version` on `quiz_results` |
| `005_mistakes` | `mistake` on `quiz_answers` (common SQL, one file) |
| `006_accounts` | `accounts`, `credentials`, `sessions`, `auth_flows`; `account_id` on `users` |
| `007_vocabulary` | `vocab_lessons`, `vocab_sections`, `vocab_entries`, `vocab_progress`, `vocab_answers` |
| `008_vocab_books` | `vocab_books`; lessons belong to a book; `es`/`en` become `term`/`meaning`, titles become `title`/`subtitle`; `note` on entries. A Spanish book already imported becomes the book `collins-spanish`, keeping its ids and progress. |
| `009_vocab_ordering` | `ordering` on `vocab_books`; the book `english-4000` becomes `alphabetical` (common SQL, one file) |
| `010_vocab_reading` | `reading` on `vocab_entries`; the Spanish book's title loses the publisher's name (common SQL, one file) |
| `011_typed_answers` | `mode` on `quiz_results`, `typed` on `quiz_answers` (common SQL, one file) |
| `012_characters` | Book kind `characters` and `credit` on `vocab_books`; direction `read` on `vocab_progress`; `readings` and `translations` on `vocab_entries`. SQLite rebuilds `vocab_books` and `vocab_progress`, keeping their rows. |
| `013_question_bank` | `quiz_bank_meta`, `quiz_bank_units`, `quiz_bank`, `quiz_flags`; `bank` on `quiz_results`, whose `level` accepts `chemistry`. SQLite rebuilds `quiz_results`, keeping its rows. |
| `014_advanced_level` | `level` on `quiz_bank`; `quiz_results.level` accepts `chemistryAdvanced`. SQLite rebuilds `quiz_results` again. |
| `015_sharing` | `hidden` on `users`; `player_shares`, `player_invites` (common SQL, one file) |
| `016_linux_level` | `quiz_results.level` accepts `linux`. SQLite rebuilds `quiz_results`, keeping its rows. |
| `017_vocab_skips` | `vocab_skips`: the words each player skipped (common SQL, one file) |
| `018_chembio_level` | `quiz_results.level` accepts `chembio`, the balancing test. SQLite rebuilds `quiz_results`, keeping its rows. |
| `019_family` | The family release: `accounts.role`, `vocab_books.visibility`, `app_settings`, `account_invites`, `auth_flows.invite`, `feedback` |
| `020_sql_level` | `quiz_results.level` accepts `sql`, the SQL test. SQLite rebuilds `quiz_results`, keeping its rows. |
| `021_rust_levels` | `quiz_results.level` accepts the four Rust levels. SQLite rebuilds `quiz_results`, keeping its rows. |
| `022_typescript_levels` | `quiz_results.level` accepts the four TypeScript levels. SQLite rebuilds `quiz_results`, keeping its rows. |
| `023_onboarding` | `accounts.onboarded_at`, `users.onboarded_at`; set to `0` for the accounts and players already there, who do not get the tour on their next visit. |

**File names.**

- `NNN_name.sql` runs on both engines.
- `NNN_name.sqlite.sql` and `NNN_name.postgres.sql` are used when the DDL differs: identity columns, or SQLite's inability to alter a `CHECK` or `UNIQUE` constraint, which forced `002`, `008`, `012`, `013` and `014` to rebuild a table.
- A SQLite step that rebuilds a table referenced by others starts with the line `-- sqlite: foreign keys off`. The runner then switches foreign keys off around its transaction (SQLite ignores the switch inside one), so dropping the old table does not cascade to the rows that reference it, and runs `PRAGMA foreign_key_check` before switching them on again.

**Adding a migration.**

1. Create `012_name.sql`, or the pair of `012_name.sqlite.sql` and `012_name.postgres.sql`.
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

1. **Create the database.** In the Neon console, create an empty database and copy its connection string. Replace `sslmode=require` with `sslmode=verify-full`: the `pg` driver already treats `require` as `verify-full` (it checks the certificate and the host name), but warns at startup that `require` will mean less in its next major version.
2. **Point the server at it.** Put the string in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@ep-….neon.tech/calcul?sslmode=verify-full
   ```
3. **Copy the existing SQLite data** (optional):
   ```sh
   npm run db:copy-to-postgres
   ```
   This applies the migrations on both sides and copies `accounts`, `users`, `credentials`, `attempts`, `quiz_results`, `quiz_answers` and the `vocab_*` tables in one transaction, keeping the ids. It then moves the identity sequences past the copied ids. It refuses to run if the target already has accounts or players.
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
