-- Words a player has chosen to skip: they no longer come up in lessons and
-- reviews, and they can be put back (docs/vocabulary.md#skipping-words).
CREATE TABLE vocab_skips (
  user_id  BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  entry_id BIGINT NOT NULL REFERENCES vocab_entries (id) ON DELETE CASCADE,
  at       BIGINT NOT NULL,
  PRIMARY KEY (user_id, entry_id)
);
