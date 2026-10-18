-- Multiplication and Euclidean division: two more operators, and the remainder given.
ALTER TABLE attempts DROP CONSTRAINT attempts_operator_check;
ALTER TABLE attempts ADD CONSTRAINT attempts_operator_check CHECK (operator IN ('+', '-', '*', '/'));
ALTER TABLE attempts ADD COLUMN given_remainder INTEGER;  -- divisions only
