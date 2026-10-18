import type { Database, Row } from "../db/index.ts";

/** Accounts, sign-in methods, sessions and OAuth flows in the database. */

export interface Account {
  id: number;
  email: string | null;
  name: string;
  createdAt: number;
}

export type CredentialType = "password" | "oauth" | "passkey" | "email_link";

export interface Credential {
  id: number;
  accountId: number;
  playerId: number | null;
  type: CredentialType;
  provider: string;
  subject: string;
  secret: string | null;
  label: string | null;
  createdAt: number;
  lastUsedAt: number | null;
}

export interface SessionRow {
  id: string;
  accountId: number;
  playerId: number | null;
  expiresAt: number;
  lastSeenAt: number;
}

export interface Flow {
  state: string;
  provider: string;
  verifier: string;
  intent: "login" | "link" | "link-player";
  accountId: number | null;
  playerId: number | null;
  createdAt: number;
}

const num = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));

const toAccount = (r: Row): Account => ({
  id: Number(r.id),
  email: (r.email as string | null) ?? null,
  name: String(r.name),
  createdAt: Number(r.created_at),
});

const toCredential = (r: Row): Credential => ({
  id: Number(r.id),
  accountId: Number(r.account_id),
  playerId: num(r.player_id),
  type: r.type as CredentialType,
  provider: String(r.provider),
  subject: String(r.subject),
  secret: (r.secret as string | null) ?? null,
  label: (r.label as string | null) ?? null,
  createdAt: Number(r.created_at),
  lastUsedAt: num(r.last_used_at),
});

export class AuthStore {
  constructor(private readonly db: Database) {}

  // ---------------------------------------------------------------- accounts

  async accountCount(): Promise<number> {
    return Number((await this.db.query("SELECT COUNT(*) AS n FROM accounts"))[0]?.n ?? 0);
  }

  async getAccount(id: number): Promise<Account | null> {
    const rows = await this.db.query("SELECT * FROM accounts WHERE id = $1", [id]);
    return rows[0] ? toAccount(rows[0]) : null;
  }

  async accountByEmail(email: string): Promise<Account | null> {
    const rows = await this.db.query("SELECT * FROM accounts WHERE email = $1", [email]);
    return rows[0] ? toAccount(rows[0]) : null;
  }

  /**
   * Creates an account. The first account ever created takes over the players
   * that existed before accounts (earlier versions had none).
   */
  async createAccount(email: string | null, name: string): Promise<{ account: Account; claimed: number }> {
    const first = (await this.accountCount()) === 0;
    const rows = await this.db.query(
      "INSERT INTO accounts (email, name, created_at) VALUES ($1, $2, $3) RETURNING *",
      [email, name, Date.now()],
    );
    const account = toAccount(rows[0]!);
    let claimed = 0;
    if (first) {
      claimed = Number(
        (await this.db.query("SELECT COUNT(*) AS n FROM users WHERE account_id IS NULL"))[0]?.n ?? 0,
      );
      // Names become unique per account: name_key = "<account id>:<lower-cased name>".
      await this.db.query("UPDATE users SET account_id = $1, name_key = $2 || name_key WHERE account_id IS NULL", [
        account.id,
        `${account.id}:`,
      ]);
    }
    return { account, claimed };
  }

  async setAccountEmail(id: number, email: string): Promise<void> {
    await this.db.query("UPDATE accounts SET email = $1 WHERE id = $2", [email, id]);
  }

  // ------------------------------------------------------------- credentials

  async findCredential(type: CredentialType, provider: string, subject: string): Promise<Credential | null> {
    const rows = await this.db.query(
      "SELECT * FROM credentials WHERE type = $1 AND provider = $2 AND subject = $3",
      [type, provider, subject],
    );
    return rows[0] ? toCredential(rows[0]) : null;
  }

  async addCredential(c: Omit<Credential, "id" | "createdAt" | "lastUsedAt">): Promise<Credential> {
    const rows = await this.db.query(
      `INSERT INTO credentials (account_id, player_id, type, provider, subject, secret, label, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [c.accountId, c.playerId, c.type, c.provider, c.subject, c.secret, c.label, Date.now()],
    );
    return toCredential(rows[0]!);
  }

  async credentialsOf(accountId: number): Promise<Credential[]> {
    const rows = await this.db.query("SELECT * FROM credentials WHERE account_id = $1 ORDER BY created_at", [accountId]);
    return rows.map(toCredential);
  }

  async getCredential(id: number): Promise<Credential | null> {
    const rows = await this.db.query("SELECT * FROM credentials WHERE id = $1", [id]);
    return rows[0] ? toCredential(rows[0]) : null;
  }

  async deleteCredential(id: number): Promise<void> {
    await this.db.query("DELETE FROM credentials WHERE id = $1", [id]);
  }

  async updateSecret(id: number, secret: string): Promise<void> {
    await this.db.query("UPDATE credentials SET secret = $1 WHERE id = $2", [secret, id]);
  }

  async touchCredential(id: number): Promise<void> {
    await this.db.query("UPDATE credentials SET last_used_at = $1 WHERE id = $2", [Date.now(), id]);
  }

  // ---------------------------------------------------------------- players

  /** The account a player belongs to, or null. */
  async playerAccount(playerId: number): Promise<number | null> {
    const rows = await this.db.query("SELECT account_id FROM users WHERE id = $1", [playerId]);
    return rows[0] ? num(rows[0].account_id) : null;
  }

  async playerName(playerId: number): Promise<string | null> {
    const rows = await this.db.query("SELECT name FROM users WHERE id = $1", [playerId]);
    return rows[0] ? String(rows[0].name) : null;
  }

  // --------------------------------------------------------------- sessions

  async createSession(s: SessionRow & { userAgent: string | null }): Promise<void> {
    await this.db.query(
      `INSERT INTO sessions (id, account_id, player_id, created_at, last_seen_at, expires_at, user_agent)
       VALUES ($1, $2, $3, $4, $4, $5, $6)`,
      [s.id, s.accountId, s.playerId, s.lastSeenAt, s.expiresAt, s.userAgent],
    );
  }

  async getSession(id: string): Promise<SessionRow | null> {
    const rows = await this.db.query("SELECT * FROM sessions WHERE id = $1", [id]);
    const r = rows[0];
    if (!r) return null;
    return {
      id: String(r.id),
      accountId: Number(r.account_id),
      playerId: num(r.player_id),
      expiresAt: Number(r.expires_at),
      lastSeenAt: Number(r.last_seen_at),
    };
  }

  async extendSession(id: string, lastSeenAt: number, expiresAt: number): Promise<void> {
    await this.db.query("UPDATE sessions SET last_seen_at = $1, expires_at = $2 WHERE id = $3", [
      lastSeenAt,
      expiresAt,
      id,
    ]);
  }

  async deleteSession(id: string): Promise<void> {
    await this.db.query("DELETE FROM sessions WHERE id = $1", [id]);
  }

  /** Every session of the account (players' own sessions included), except one. */
  async deleteSessionsOf(accountId: number, except: string | null): Promise<void> {
    await this.db.query("DELETE FROM sessions WHERE account_id = $1 AND id <> $2", [accountId, except ?? ""]);
  }

  async deleteSessionsOfPlayer(playerId: number): Promise<void> {
    await this.db.query("DELETE FROM sessions WHERE player_id = $1", [playerId]);
  }

  async deleteExpired(now = Date.now()): Promise<void> {
    await this.db.query("DELETE FROM sessions WHERE expires_at <= $1", [now]);
    await this.db.query("DELETE FROM auth_flows WHERE created_at <= $1", [now - FLOW_LIFETIME]);
  }

  // ------------------------------------------------------------------ flows

  async saveFlow(f: Flow): Promise<void> {
    await this.db.query(
      `INSERT INTO auth_flows (state, provider, verifier, intent, account_id, player_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [f.state, f.provider, f.verifier, f.intent, f.accountId, f.playerId, f.createdAt],
    );
  }

  /** Reads and deletes a flow: each state can be used once. */
  async takeFlow(state: string): Promise<Flow | null> {
    const rows = await this.db.query("SELECT * FROM auth_flows WHERE state = $1", [state]);
    await this.db.query("DELETE FROM auth_flows WHERE state = $1", [state]);
    const r = rows[0];
    if (!r || Date.now() - Number(r.created_at) > FLOW_LIFETIME) return null;
    return {
      state: String(r.state),
      provider: String(r.provider),
      verifier: String(r.verifier),
      intent: r.intent as Flow["intent"],
      accountId: num(r.account_id),
      playerId: num(r.player_id),
      createdAt: Number(r.created_at),
    };
  }
}

export const FLOW_LIFETIME = 10 * 60 * 1000;
