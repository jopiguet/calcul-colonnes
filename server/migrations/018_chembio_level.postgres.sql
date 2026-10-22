-- Chemistry basics, balancing equations (docs/question-generators.md#balancing): their own level.
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_level_check;
ALTER TABLE quiz_results ADD CONSTRAINT quiz_results_level_check CHECK (level IN ('school', 'university', 'chemistry', 'chemistryAdvanced', 'linux', 'chembio'));
