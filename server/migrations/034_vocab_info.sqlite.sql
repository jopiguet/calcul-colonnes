-- Vocabulary file format 3 (docs/vocabulary.md#format-3): what an entry is,
-- its readings by language and what it does in writing, as JSON
-- ({"type", "readings": [{"value", "language", "note"}], "functions"}), or empty.
ALTER TABLE vocab_entries ADD COLUMN info TEXT NOT NULL DEFAULT '';
