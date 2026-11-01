-- Picture dictionaries (docs/vocabulary.md#pictures): the pictures, stored once
-- by their SHA-256 (base64, like the exercise pages), and on each entry the
-- picture's hash and its number on a labelled diagram (0: none).
CREATE TABLE vocab_images (
  hash  TEXT PRIMARY KEY,
  mime  TEXT NOT NULL,
  data  TEXT NOT NULL
);
ALTER TABLE vocab_entries ADD COLUMN image TEXT NOT NULL DEFAULT '';
ALTER TABLE vocab_entries ADD COLUMN part INTEGER NOT NULL DEFAULT 0;
CREATE INDEX vocab_entries_image ON vocab_entries (image);
