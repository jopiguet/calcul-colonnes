CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  name_key   TEXT    NOT NULL UNIQUE,          -- lower-cased name, for duplicate detection
  created_at BIGINT  NOT NULL                  -- epoch milliseconds
);

CREATE TABLE attempts (
  id       INTEGER  PRIMARY KEY AUTOINCREMENT,
  user_id  INTEGER  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  at       BIGINT   NOT NULL,                  -- epoch milliseconds
  maximum  INTEGER  NOT NULL,
  operator TEXT     NOT NULL CHECK (operator IN ('+', '-')),
  top      INTEGER  NOT NULL,
  bottom   INTEGER  NOT NULL,
  given    INTEGER  NOT NULL,
  correct  SMALLINT NOT NULL CHECK (correct IN (0, 1))
);

CREATE INDEX attempts_user_id_at ON attempts (user_id, at);
