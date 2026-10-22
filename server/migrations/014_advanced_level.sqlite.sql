-- sqlite: foreign keys off
-- Advanced physical chemistry (docs/question-bank.md): bank questions get a
-- level, "core" or "advanced", and tests the level "chemistryAdvanced"
-- (SQLite cannot alter a CHECK: quiz_results is rebuilt, keeping its rows).
ALTER TABLE quiz_bank ADD COLUMN level TEXT NOT NULL DEFAULT 'core' CHECK (level IN ('core', 'advanced'));

CREATE TABLE quiz_results_new (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  at             BIGINT  NOT NULL,             -- epoch milliseconds
  level          TEXT    NOT NULL CHECK (level IN ('school', 'university', 'chemistry', 'chemistryAdvanced')),
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
INSERT INTO quiz_results_new (id, user_id, at, level, topics, seed, question_count, correct, answers, focus, version, mode, bank)
  SELECT id, user_id, at, level, topics, seed, question_count, correct, answers, focus, version, mode, bank FROM quiz_results;
DROP TABLE quiz_results;
ALTER TABLE quiz_results_new RENAME TO quiz_results;
CREATE INDEX quiz_results_user_id_at ON quiz_results (user_id, at);
