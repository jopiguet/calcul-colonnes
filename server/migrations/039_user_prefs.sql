-- A player's display choices, kept with the player so they follow it on every device
-- (docs/vocabulary.md#the-reading-in-latin-letters): whether readings (romaji, transliterations) show, for
-- every book and per book. A JSON object; what is not set keeps the default.
ALTER TABLE users ADD COLUMN prefs TEXT NOT NULL DEFAULT '{}';
