-- The question bank holds several books (docs/question-bank.md): each unit
-- belongs to one, and imports of one book leave the others alone.
CREATE TABLE quiz_bank_books (
  id       TEXT    PRIMARY KEY,
  title    TEXT    NOT NULL,
  source   TEXT    NOT NULL,
  position INTEGER NOT NULL
);
-- The book of a bank imported before: from the old key/value metadata.
INSERT INTO quiz_bank_books (id, title, source, position)
  SELECT b.value, COALESCE(t.value, b.value), COALESCE(s.value, ''), 0
    FROM quiz_bank_meta b
    LEFT JOIN quiz_bank_meta t ON t.key = 'title'
    LEFT JOIN quiz_bank_meta s ON s.key = 'source'
   WHERE b.key = 'book';
ALTER TABLE quiz_bank_units ADD COLUMN book TEXT NOT NULL DEFAULT '';
UPDATE quiz_bank_units SET book = COALESCE((SELECT value FROM quiz_bank_meta WHERE key = 'book'), '');
DELETE FROM quiz_bank_meta WHERE key IN ('book', 'title', 'source');
