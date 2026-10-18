-- Multiplication and Euclidean division: two more operators, and the remainder given.
-- SQLite cannot alter a CHECK constraint, so the table is rebuilt.
CREATE TABLE attempts_new (
  id              INTEGER  PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  at              BIGINT   NOT NULL,
  maximum         INTEGER  NOT NULL,
  operator        TEXT     NOT NULL CHECK (operator IN ('+', '-', '*', '/')),
  top             INTEGER  NOT NULL,
  bottom          INTEGER  NOT NULL,
  given           INTEGER  NOT NULL,
  correct         SMALLINT NOT NULL CHECK (correct IN (0, 1)),
  given_remainder INTEGER                      -- divisions only
);

INSERT INTO attempts_new (id, user_id, at, maximum, operator, top, bottom, given, correct)
SELECT id, user_id, at, maximum, operator, top, bottom, given, correct FROM attempts;

DROP TABLE attempts;
ALTER TABLE attempts_new RENAME TO attempts;
CREATE INDEX attempts_user_id_at ON attempts (user_id, at);
