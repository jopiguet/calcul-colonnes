-- sqlite: foreign keys off
-- The question bank (docs/question-bank.md): written multiple-choice questions,
-- imported with `npm run quiz:import` from a file kept out of the project;
-- shared by every account of the server, like the vocabulary.

-- The bank's book and revision: key/value ("book", "title", "source", "revision").
CREATE TABLE quiz_bank_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Units of the book (Atkins' Topics "1A"…), each in a test topic ("gases").
CREATE TABLE quiz_bank_units (
  id       TEXT    PRIMARY KEY,
  topic    TEXT    NOT NULL,
  position INTEGER NOT NULL,
  title    TEXT    NOT NULL              -- JSON {"en": "…"}
);

-- Questions. A question removed from the file is kept, with the revision that
-- removed it, so tests made before are rebuilt exactly.
CREATE TABLE quiz_bank (
  id            TEXT    PRIMARY KEY,
  unit          TEXT    NOT NULL,
  section       TEXT    NOT NULL,
  position      INTEGER NOT NULL,
  prompt        TEXT    NOT NULL,        -- JSON {"en": "…"}
  correct       TEXT    NOT NULL,        -- JSON {"en": "…"}
  wrong         TEXT    NOT NULL,        -- JSON [{"en": "…"} ×3]
  explanation   TEXT    NOT NULL,        -- JSON {"en": "…"}
  from_revision INTEGER NOT NULL,
  until_revision INTEGER
);

-- The bank revision a test drew from (null: no written question), and the
-- physical chemistry tests' own level. SQLite cannot change a CHECK
-- constraint: the table is rebuilt, keeping its rows and ids.
CREATE TABLE quiz_results_new (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  at             BIGINT  NOT NULL,             -- epoch milliseconds
  level          TEXT    NOT NULL CHECK (level IN ('school', 'university', 'chemistry')),
  topics         TEXT    NOT NULL,             -- comma-separated
  seed           BIGINT  NOT NULL,
  question_count INTEGER NOT NULL,
  correct        INTEGER NOT NULL,
  answers        TEXT    NOT NULL,             -- JSON array of option indexes, -1 = blank
  focus          TEXT    NOT NULL DEFAULT '',
  version        INTEGER NOT NULL DEFAULT 1,
  mode           TEXT    NOT NULL DEFAULT 'choices',
  bank           INTEGER
);
INSERT INTO quiz_results_new (id, user_id, at, level, topics, seed, question_count, correct, answers, focus, version, mode)
  SELECT id, user_id, at, level, topics, seed, question_count, correct, answers, focus, version, mode FROM quiz_results;
DROP TABLE quiz_results;
ALTER TABLE quiz_results_new RENAME TO quiz_results;
CREATE INDEX quiz_results_user_id_at ON quiz_results (user_id, at);

-- Questions a player flagged as wrong or unclear, for the author to check.
CREATE TABLE quiz_flags (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  at      BIGINT  NOT NULL,
  skill   TEXT    NOT NULL,              -- kind of question ("gases.concepts1A", "gases.rmsSpeed")
  question TEXT   NOT NULL,              -- a bank question's id, or a generated question's formula
  note    TEXT    NOT NULL DEFAULT '',
  resolved SMALLINT NOT NULL DEFAULT 0 CHECK (resolved IN (0, 1))
);
CREATE INDEX quiz_flags_open ON quiz_flags (resolved, at);
