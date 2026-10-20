-- How a term reads when its script does not say it: the rōmaji of a Japanese
-- term ("gachō" for ガチョウ). Shown with the term, and accepted as an answer.
ALTER TABLE vocab_entries ADD COLUMN reading TEXT NOT NULL DEFAULT '';
-- The Spanish book is shown by its title, without the publisher's name.
UPDATE vocab_books SET title = '3000 words and phrases' WHERE slug = 'collins-spanish' AND title = 'Collins Spanish';
