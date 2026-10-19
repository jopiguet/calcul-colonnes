-- How a book is ordered. "book": its order means something (Collins: by
-- theme), new words come in that order by default. "alphabetical": a word list
-- (Vocabulary 4000), new words come at random by default and wrong options are
-- taken from the whole book rather than from the neighbouring words.
ALTER TABLE vocab_books ADD COLUMN ordering TEXT NOT NULL DEFAULT 'book';
UPDATE vocab_books SET ordering = 'alphabetical' WHERE slug = 'english-4000';
