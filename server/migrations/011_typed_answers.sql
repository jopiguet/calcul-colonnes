-- Tests answered by typing numbers: how the test was answered, and for each
-- answer the text typed (null when an option was picked). A typed answer is
-- filed under the option it matches (given), or -2 when it matches none.
ALTER TABLE quiz_results ADD COLUMN mode TEXT NOT NULL DEFAULT 'choices';
ALTER TABLE quiz_answers ADD COLUMN typed TEXT;
