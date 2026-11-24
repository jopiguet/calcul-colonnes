-- sqlite: foreign keys off
-- Sound books (docs/birds.md): a fourth kind of book; the recordings, stored once by their SHA-256 (base64,
-- like the pictures), and on each entry the recording's hash ('' for none).
-- SQLite cannot alter a CHECK: vocab_books is rebuilt, keeping its rows.
CREATE TABLE vocab_books_new (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT    NOT NULL UNIQUE,
  position     INTEGER NOT NULL,
  title        TEXT    NOT NULL,
  kind         TEXT    NOT NULL CHECK (kind IN ('translation', 'definition', 'characters', 'sounds')),
  term_lang    TEXT    NOT NULL,
  meaning_lang TEXT    NOT NULL,
  ordering     TEXT    NOT NULL DEFAULT 'book',
  credit       TEXT    NOT NULL DEFAULT '',
  visibility   TEXT    NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared'))
);
INSERT INTO vocab_books_new (id, slug, position, title, kind, term_lang, meaning_lang, ordering, credit, visibility)
  SELECT id, slug, position, title, kind, term_lang, meaning_lang, ordering, credit, visibility FROM vocab_books;
DROP TABLE vocab_books;
ALTER TABLE vocab_books_new RENAME TO vocab_books;
CREATE TABLE vocab_sounds (
  hash  TEXT PRIMARY KEY,
  mime  TEXT NOT NULL,
  data  TEXT NOT NULL
);
ALTER TABLE vocab_entries ADD COLUMN audio TEXT NOT NULL DEFAULT '';
CREATE INDEX vocab_entries_audio ON vocab_entries (audio);
