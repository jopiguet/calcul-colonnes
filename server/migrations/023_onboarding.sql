-- The guided tour (docs/user-guide.md#guided-tour): shown once to a new account
-- after its first sign-in, and to a player the first time they sign in on their own.
ALTER TABLE accounts ADD COLUMN onboarded_at BIGINT;
ALTER TABLE users ADD COLUMN onboarded_at BIGINT;
-- Accounts and players from before the tour already know the app.
UPDATE accounts SET onboarded_at = 0;
UPDATE users SET onboarded_at = 0;
