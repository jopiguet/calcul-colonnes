-- Workbook exercises (docs/exercises.md): a book's exercises as cropped
-- images with their gaps, the key item by item, and each player's answers.
CREATE TABLE exercise_books (
  id          TEXT    PRIMARY KEY,
  title       TEXT    NOT NULL,
  source      TEXT    NOT NULL,
  level       TEXT    NOT NULL DEFAULT '',
  kind        TEXT    NOT NULL DEFAULT '',
  position    INTEGER NOT NULL,
  revision    INTEGER NOT NULL DEFAULT 1,
  visibility  TEXT    NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared')),
  imported_at BIGINT  NOT NULL
);

CREATE TABLE exercise_units (
  book_id TEXT    NOT NULL REFERENCES exercise_books (id) ON DELETE CASCADE,
  n       INTEGER NOT NULL,
  title   TEXT    NOT NULL DEFAULT '',
  PRIMARY KEY (book_id, n)
);

CREATE TABLE exercises (
  book_id     TEXT    NOT NULL REFERENCES exercise_books (id) ON DELETE CASCADE,
  id          TEXT    NOT NULL,
  unit        INTEGER NOT NULL,
  position    INTEGER NOT NULL,
  page        INTEGER NOT NULL,
  instruction TEXT    NOT NULL DEFAULT '',
  image       TEXT    NOT NULL,
  image_type  TEXT    NOT NULL,
  width       INTEGER NOT NULL,
  height      INTEGER NOT NULL,
  is_open     SMALLINT NOT NULL DEFAULT 0,
  note        TEXT    NOT NULL DEFAULT '',
  key_text    TEXT    NOT NULL DEFAULT '',
  items       TEXT    NOT NULL,
  PRIMARY KEY (book_id, id)
);
CREATE INDEX exercises_unit ON exercises (book_id, unit, position);

-- One row per player and exercise: the answers typed (a draft until checked)
-- and, once checked, the result of each item.
CREATE TABLE exercise_answers (
  user_id     INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  book_id     TEXT    NOT NULL,
  exercise_id TEXT    NOT NULL,
  answers     TEXT    NOT NULL,
  results     TEXT,
  score       INTEGER NOT NULL DEFAULT 0,
  total       INTEGER NOT NULL DEFAULT 0,
  checked_at  BIGINT,
  updated_at  BIGINT  NOT NULL,
  PRIMARY KEY (user_id, book_id, exercise_id),
  FOREIGN KEY (book_id, exercise_id) REFERENCES exercises (book_id, id) ON DELETE CASCADE
);
