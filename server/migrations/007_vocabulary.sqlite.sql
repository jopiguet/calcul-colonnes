-- Vocabulary: lessons (chapters of the book), sections, entries, imported
-- with `npm run vocab:import`; shared by every account of the server.
CREATE TABLE vocab_lessons (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  position INTEGER NOT NULL UNIQUE,
  title_en TEXT    NOT NULL,
  title_es TEXT    NOT NULL
);

CREATE TABLE vocab_sections (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL REFERENCES vocab_lessons (id) ON DELETE CASCADE,
  position  INTEGER NOT NULL,
  title_en  TEXT    NOT NULL,
  title_es  TEXT    NOT NULL,
  UNIQUE (lesson_id, position)
);

CREATE TABLE vocab_entries (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER  NOT NULL REFERENCES vocab_sections (id) ON DELETE CASCADE,
  position   INTEGER  NOT NULL,
  en         TEXT     NOT NULL,
  es         TEXT     NOT NULL,
  grp        TEXT     NOT NULL DEFAULT '',     -- heading inside the section
  feminine   SMALLINT NOT NULL DEFAULT 0 CHECK (feminine IN (0, 1))  -- "el agua f"
);
CREATE INDEX vocab_entries_section ON vocab_entries (section_id, position);

-- Leitner box of each player, per entry and direction (see shared/vocab/schedule.ts).
CREATE TABLE vocab_progress (
  user_id   INTEGER  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  entry_id  INTEGER  NOT NULL REFERENCES vocab_entries (id) ON DELETE CASCADE,
  direction TEXT     NOT NULL CHECK (direction IN ('recognise', 'recall')),
  box       SMALLINT NOT NULL,
  due_at    BIGINT   NOT NULL,
  last_at   BIGINT   NOT NULL,
  right_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, entry_id, direction)
);
CREATE INDEX vocab_progress_due ON vocab_progress (user_id, due_at);

-- Every answer, for statistics.
CREATE TABLE vocab_answers (
  id        INTEGER  PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  entry_id  INTEGER  NOT NULL REFERENCES vocab_entries (id) ON DELETE CASCADE,
  direction TEXT     NOT NULL,
  mode      TEXT     NOT NULL CHECK (mode IN ('choice', 'written')),
  at        BIGINT   NOT NULL,
  given     TEXT     NOT NULL,
  verdict   TEXT     NOT NULL,
  correct   SMALLINT NOT NULL CHECK (correct IN (0, 1))
);
CREATE INDEX vocab_answers_user_at ON vocab_answers (user_id, at);
