-- Opening the app to friends and family (docs/authentication.md#family-release).

-- The owner runs the server: invitations, content visibility, feedback. The
-- first account is the owner; the others are members.
ALTER TABLE accounts ADD COLUMN role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member'));
UPDATE accounts SET role = 'owner' WHERE id = (SELECT MIN(id) FROM accounts);

-- A book from a book you own stays yours ('private'); one under an open licence
-- (the characters, from JMdict and KANJIDIC) can be seen by every account ('shared').
ALTER TABLE vocab_books ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared'));
UPDATE vocab_books SET visibility = 'shared' WHERE kind = 'characters';

-- Settings of the server, changed by the owner: "bank_visibility" ('private', 'shared').
CREATE TABLE app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Invitations to create an account: single use, two weeks. Only the code's SHA-256 is stored.
CREATE TABLE account_invites (
  id         TEXT    PRIMARY KEY,
  created_by INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  note       TEXT    NOT NULL DEFAULT '',
  created_at BIGINT  NOT NULL,
  expires_at BIGINT  NOT NULL,
  used_at    BIGINT,
  used_by    INTEGER REFERENCES accounts (id) ON DELETE SET NULL
);

-- An OAuth sign-up carries its invitation through the provider's round trip.
ALTER TABLE auth_flows ADD COLUMN invite TEXT;

-- What users write with "Send feedback", read by the owner.
CREATE TABLE feedback (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER REFERENCES accounts (id) ON DELETE SET NULL,
  player_id  INTEGER REFERENCES users (id) ON DELETE SET NULL,
  at         BIGINT  NOT NULL,
  page       TEXT    NOT NULL DEFAULT '',
  version    TEXT    NOT NULL DEFAULT '',
  text       TEXT    NOT NULL
);
CREATE INDEX feedback_at ON feedback (at);
