-- Accounts (parents, teachers) own the players. Sign-in methods are rows of
-- `credentials`, so a new kind of sign-in is a new `type`, not a new table.

CREATE TABLE accounts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    UNIQUE,                   -- lower-cased; null for a provider that gave none
  name       TEXT    NOT NULL,
  created_at BIGINT  NOT NULL
);

-- A way to sign in. `player_id` set: signing in with it opens a session limited
-- to that player (a child's own login), owned by the account.
CREATE TABLE credentials (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id   INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  player_id    INTEGER REFERENCES users (id) ON DELETE CASCADE,
  type         TEXT    NOT NULL CHECK (type IN ('password', 'oauth', 'passkey', 'email_link')),
  provider     TEXT    NOT NULL DEFAULT '',   -- 'google', 'github'…; '' for password
  subject      TEXT    NOT NULL,              -- email or username (password), provider's user id (oauth)
  secret       TEXT,                          -- password hash; passkey public key later
  label        TEXT,                          -- shown to the user: email or name at the provider
  created_at   BIGINT  NOT NULL,
  last_used_at BIGINT,
  UNIQUE (type, provider, subject)
);
CREATE INDEX credentials_account_id ON credentials (account_id);

-- Server-side sessions. The cookie holds a random token; only its SHA-256 is stored.
CREATE TABLE sessions (
  id           TEXT    PRIMARY KEY,           -- SHA-256 of the cookie token, hex
  account_id   INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  player_id    INTEGER REFERENCES users (id) ON DELETE CASCADE,
  created_at   BIGINT  NOT NULL,
  last_seen_at BIGINT  NOT NULL,
  expires_at   BIGINT  NOT NULL,
  user_agent   TEXT
);
CREATE INDEX sessions_account_id ON sessions (account_id);

-- OAuth flows in progress (state → PKCE verifier and intent), single use, 10 minutes.
CREATE TABLE auth_flows (
  state      TEXT   PRIMARY KEY,
  provider   TEXT   NOT NULL,
  verifier   TEXT   NOT NULL,
  intent     TEXT   NOT NULL CHECK (intent IN ('login', 'link', 'link-player')),
  account_id INTEGER,
  player_id  INTEGER,
  created_at BIGINT NOT NULL
);

-- Players belong to an account; existing players are claimed by the first account.
-- name_key becomes "<account id>:<lower-cased name>", so names are unique per account.
ALTER TABLE users ADD COLUMN account_id INTEGER REFERENCES accounts (id) ON DELETE CASCADE;
CREATE INDEX users_account_id ON users (account_id);
