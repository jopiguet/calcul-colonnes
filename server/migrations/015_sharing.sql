-- Players shared between accounts, and the activities each player sees
-- (docs/authentication.md#sharing-a-player).

-- Activities hidden from the player's home page: a JSON list of ids ("columns",
-- "quiz", "chemistry", "vocab-<book>", "discover-dice"…). New activities show.
ALTER TABLE users ADD COLUMN hidden TEXT NOT NULL DEFAULT '[]';

-- Other accounts that see a player (it still belongs to users.account_id).
CREATE TABLE player_shares (
  user_id    BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  account_id BIGINT NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (user_id, account_id)
);
CREATE INDEX player_shares_account_id ON player_shares (account_id);

-- Share codes: single use, a week. Only the code's SHA-256 is stored.
CREATE TABLE player_invites (
  id         TEXT   PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  used_at    BIGINT
);
