-- sqlite: foreign keys off
-- Several vocabulary books. Entries get neutral names: the term studied and its
-- meaning (a translation, or a definition), plus a note (an example).

CREATE TABLE vocab_books (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT    NOT NULL UNIQUE,              -- "collins-spanish", "english-4000"
  position     INTEGER NOT NULL,
  title        TEXT    NOT NULL,
  kind         TEXT    NOT NULL CHECK (kind IN ('translation', 'definition')),
  term_lang    TEXT    NOT NULL,                     -- language studied: "es", "en"
  meaning_lang TEXT    NOT NULL                      -- language of the meanings
);

-- The Spanish book imported with 4.2, if any.
INSERT INTO vocab_books (slug, position, title, kind, term_lang, meaning_lang)
  SELECT 'collins-spanish', 0, 'Collins Spanish', 'translation', 'es', 'en'
  WHERE EXISTS (SELECT 1 FROM vocab_lessons);

-- Lessons: positions are now per book. SQLite cannot change a UNIQUE
-- constraint, so the table is rebuilt, keeping its ids.
CREATE TABLE vocab_lessons_new (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id  INTEGER NOT NULL REFERENCES vocab_books (id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  title    TEXT    NOT NULL,
  subtitle TEXT    NOT NULL DEFAULT '',
  UNIQUE (book_id, position)
);
INSERT INTO vocab_lessons_new (id, book_id, position, title, subtitle)
  SELECT id, (SELECT id FROM vocab_books WHERE slug = 'collins-spanish'), position, title_es, title_en
  FROM vocab_lessons;
DROP TABLE vocab_lessons;
ALTER TABLE vocab_lessons_new RENAME TO vocab_lessons;
CREATE INDEX vocab_lessons_book ON vocab_lessons (book_id, position);

ALTER TABLE vocab_sections RENAME COLUMN title_es TO title;
ALTER TABLE vocab_sections RENAME COLUMN title_en TO subtitle;

ALTER TABLE vocab_entries RENAME COLUMN es TO term;
ALTER TABLE vocab_entries RENAME COLUMN en TO meaning;
ALTER TABLE vocab_entries ADD COLUMN note TEXT NOT NULL DEFAULT '';
