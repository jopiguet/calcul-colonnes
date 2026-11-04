-- Language courses (docs/language-courses.md): one row per player and
-- exercise, the answers as typed (JSON list, one per blank), and once checked
-- the result of each blank, the player's own marks and the score.
CREATE TABLE lesson_answers (
  user_id    BIGINT  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  course     TEXT    NOT NULL,
  lesson     TEXT    NOT NULL,
  exercise   TEXT    NOT NULL,
  answers    TEXT    NOT NULL,
  results    TEXT    NOT NULL DEFAULT '',
  overrides  TEXT    NOT NULL DEFAULT '{}',
  score      INTEGER NOT NULL DEFAULT 0,
  total      INTEGER NOT NULL DEFAULT 0,
  checked_at BIGINT  NOT NULL,
  PRIMARY KEY (user_id, course, lesson, exercise)
);
CREATE INDEX lesson_answers_course ON lesson_answers (user_id, course);
