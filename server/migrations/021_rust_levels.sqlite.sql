-- sqlite: foreign keys off
-- Rust (docs/question-generators.md#rust): four levels.
-- SQLite cannot alter a CHECK: quiz_results is rebuilt, keeping its rows.
CREATE TABLE quiz_results_new (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  at             BIGINT  NOT NULL,             -- epoch milliseconds
  level          TEXT    NOT NULL CHECK (level IN ('school', 'university', 'chemistry', 'chemistryAdvanced', 'linux', 'chembio', 'sql', 'rustBeginner', 'rustIntermediate', 'rustAdvanced', 'rustExpert')),
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
