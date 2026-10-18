import { createHash, randomBytes } from "node:crypto";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { AuthConfig } from "./config.ts";
import type { AuthStore } from "./store.ts";

/**
 * Cookie sessions. The cookie carries a random 256-bit token; the database
 * stores only its SHA-256, so a leaked database does not leak live sessions.
 * Sessions slide: each use (at most hourly) pushes the expiry forward.
 */
export interface Session {
  id: string;
  accountId: number;
  /** Set when a player signed in with their own login: access limited to them. */
  playerId: number | null;
}

const DAY = 24 * 60 * 60 * 1000;
const RENEW_AFTER = 60 * 60 * 1000;

export const sessionCookieName = (config: AuthConfig): string =>
  config.secureCookies ? "__Host-cc_session" : "cc_session";

export const flowCookieName = (config: AuthConfig): string => (config.secureCookies ? "__Host-cc_oauth" : "cc_oauth");

export const randomToken = (): string => randomBytes(32).toString("base64url");
const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

export function cookieOptions(config: AuthConfig, maxAgeSeconds: number) {
  return {
    path: "/",
    httpOnly: true,
    secure: config.secureCookies,
    sameSite: "Lax" as const,
    maxAge: maxAgeSeconds,
  };
}

/** Opens a session and sets the cookie. Any session the browser had before is closed. */
export async function startSession(
  c: Context,
  store: AuthStore,
  config: AuthConfig,
  accountId: number,
  playerId: number | null,
): Promise<Session> {
  const previous = getCookie(c, sessionCookieName(config));
  if (previous) await store.deleteSession(hashToken(previous)); // no session fixation
  const token = randomToken();
  const now = Date.now();
  const id = hashToken(token);
  await store.createSession({
    id,
    accountId,
    playerId,
    lastSeenAt: now,
    expiresAt: now + config.sessionDays * DAY,
    userAgent: c.req.header("user-agent")?.slice(0, 200) ?? null,
  });
  setCookie(c, sessionCookieName(config), token, cookieOptions(config, config.sessionDays * 24 * 60 * 60));
  return { id, accountId, playerId };
}

/** The session of this request, or null. Renews it when it is used. */
export async function readSession(c: Context, store: AuthStore, config: AuthConfig): Promise<Session | null> {
  const token = getCookie(c, sessionCookieName(config));
  if (!token || token.length > 100) return null;
  const row = await store.getSession(hashToken(token));
  const now = Date.now();
  if (!row || row.expiresAt <= now) return null;
  if (now - row.lastSeenAt > RENEW_AFTER) {
    await store.extendSession(row.id, now, now + config.sessionDays * DAY);
    setCookie(c, sessionCookieName(config), token, cookieOptions(config, config.sessionDays * 24 * 60 * 60));
  }
  return { id: row.id, accountId: row.accountId, playerId: row.playerId };
}

export async function endSession(c: Context, store: AuthStore, config: AuthConfig, session: Session | null): Promise<void> {
  if (session) await store.deleteSession(session.id);
  deleteCookie(c, sessionCookieName(config), { path: "/", secure: config.secureCookies });
}
