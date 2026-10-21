-- The Characters book (kana and kanji, docs/characters.md): a third kind of
-- book, a third direction (a kanji's readings), the meaning in other interface
-- languages, and the book's credit (the dictionaries' licence).
ALTER TABLE vocab_books DROP CONSTRAINT IF EXISTS vocab_books_kind_check;
ALTER TABLE vocab_books ADD CONSTRAINT vocab_books_kind_check CHECK (kind IN ('translation', 'definition', 'characters'));
ALTER TABLE vocab_books ADD COLUMN credit TEXT NOT NULL DEFAULT '';

ALTER TABLE vocab_progress DROP CONSTRAINT IF EXISTS vocab_progress_direction_check;
ALTER TABLE vocab_progress ADD CONSTRAINT vocab_progress_direction_check CHECK (direction IN ('recognise', 'recall', 'read'));

-- A kanji's on'yomi and kun'yomi ("ニチ / ジツ / ひ"); JSON {"fr": "…", "es": "…"}.
ALTER TABLE vocab_entries ADD COLUMN readings TEXT NOT NULL DEFAULT '';
ALTER TABLE vocab_entries ADD COLUMN translations TEXT NOT NULL DEFAULT '';
