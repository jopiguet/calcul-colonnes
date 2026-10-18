-- The mistake a wrong answer stands for (see MISTAKES in shared/quiz/types.ts);
-- null for right answers and blanks. Filled for earlier tests at startup.
ALTER TABLE quiz_answers ADD COLUMN mistake TEXT;
