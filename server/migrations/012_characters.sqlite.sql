-- sqlite: foreign keys off
-- The Characters book (kana and kanji, docs/characters.md): a third kind of
-- book, a third direction (a kanji's readings), the meaning in other interface
-- languages, and the book's credit (the dictionaries' licence).
--
-- SQLite cannot change a CHECK constraint: both tables are rebuilt, keeping
-- their rows and ids.
CREATE TABLE vocab_books_new (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT    NOT NULL UNIQUE,
  position     INTEGER NOT NULL,
  title        TEXT    NOT NULL,
  kind         TEXT    NOT NULL CHECK (kind IN ('translation', 'definition', 'characters')),
  term_lang    TEXT    NOT NULL,
  meaning_lang TEXT    NOT NULL,
  ordering     TEXT    NOT NULL DEFAULT 'book',
  credit       TEXT    NOT NULL DEFAULT ''
);
INSERT INTO vocab_books_new (id, slug, position, title, kind, term_lang, meaning_lang, ordering)
  SELECT id, slug, position, title, kind, term_lang, meaning_lang, ordering FROM vocab_books;
DROP TABLE vocab_books;
ALTER TABLE vocab_books_new RENAME TO vocab_books;

CREATE TABLE vocab_progress_new (
  user_id   INTEGER  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  entry_id  INTEGER  NOT NULL REFERENCES vocab_entries (id) ON DELETE CASCADE,
  direction TEXT     NOT NULL CHECK (direction IN ('recognise', 'recall', 'read')),
  box       SMALLINT NOT NULL,
  due_at    BIGINT   NOT NULL,
  last_at   BIGINT   NOT NULL,
  right_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, entry_id, direction)
);
INSERT INTO vocab_progress_new SELECT user_id, entry_id, direction, box, due_at, last_at, right_count, wrong_count FROM vocab_progress;
DROP TABLE vocab_progress;
ALTER TABLE vocab_progress_new RENAME TO vocab_progress;
CREATE INDEX vocab_progress_due ON vocab_progress (user_id, due_at);

-- A kanji's on'yomi and kun'yomi ("ニチ / ジツ / ひ"); JSON {"fr": "…", "es": "…"}.
ALTER TABLE vocab_entries ADD COLUMN readings TEXT NOT NULL DEFAULT '';
ALTER TABLE vocab_entries ADD COLUMN translations TEXT NOT NULL DEFAULT '';
