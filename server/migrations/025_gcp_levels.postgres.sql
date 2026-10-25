-- Google Cloud (docs/question-generators.md#google-cloud): four levels.
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_level_check;
ALTER TABLE quiz_results ADD CONSTRAINT quiz_results_level_check CHECK (level IN ('school', 'university', 'chemistry', 'chemistryAdvanced', 'linux', 'chembio', 'sql', 'rustBeginner', 'rustIntermediate', 'rustAdvanced', 'rustExpert', 'tsBeginner', 'tsIntermediate', 'tsAdvanced', 'tsExpert', 'reactBeginner', 'reactIntermediate', 'reactAdvanced', 'reactExpert', 'gcpBeginner', 'gcpIntermediate', 'gcpAdvanced', 'gcpExpert'));
