-- Sound books (docs/birds.md): a fourth kind of book; the recordings, stored once by their SHA-256 (base64,
-- like the pictures), and on each entry the recording's hash ('' for none).
ALTER TABLE vocab_books DROP CONSTRAINT IF EXISTS vocab_books_kind_check;
ALTER TABLE vocab_books ADD CONSTRAINT vocab_books_kind_check CHECK (kind IN ('translation', 'definition', 'characters', 'sounds'));
CREATE TABLE vocab_sounds (
  hash  TEXT PRIMARY KEY,
  mime  TEXT NOT NULL,
  data  TEXT NOT NULL
);
ALTER TABLE vocab_entries ADD COLUMN audio TEXT NOT NULL DEFAULT '';
CREATE INDEX vocab_entries_audio ON vocab_entries (audio);
