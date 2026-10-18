-- Multiple-choice tests: one row per finished test. The questions are not
-- stored: they are regenerated from (seed, level, topics, question_count).
CREATE TABLE quiz_results (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  at             BIGINT  NOT NULL,             -- epoch milliseconds
  level          TEXT    NOT NULL CHECK (level IN ('school', 'university')),
  topics         TEXT    NOT NULL,             -- comma-separated
  seed           BIGINT  NOT NULL,
  question_count INTEGER NOT NULL,
  correct        INTEGER NOT NULL,
  answers        TEXT    NOT NULL              -- JSON array of option indexes, -1 = blank
);

CREATE INDEX quiz_results_user_id_at ON quiz_results (user_id, at);
