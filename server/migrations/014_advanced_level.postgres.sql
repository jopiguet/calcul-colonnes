-- Advanced physical chemistry (docs/question-bank.md): bank questions get a
-- level, "core" or "advanced", and tests the level "chemistryAdvanced".
ALTER TABLE quiz_bank ADD COLUMN level TEXT NOT NULL DEFAULT 'core' CHECK (level IN ('core', 'advanced'));
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_level_check;
ALTER TABLE quiz_results ADD CONSTRAINT quiz_results_level_check CHECK (level IN ('school', 'university', 'chemistry', 'chemistryAdvanced'));
