import type { MiddlewareHandler } from "hono";
import type { AuthConfig } from "./config.ts";
import { readSession, type Session } from "./sessions.ts";
import type { AuthStore } from "./store.ts";

export type AppEnv = { Variables: { session: Session | null } };

/**
 * Cross-site request protection, on top of SameSite=Lax cookies: a request
 * that changes something must come from the app's own origin.
 */
export function originCheck(config: AuthConfig): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(c.req.method)) return next();
    if (c.req.header("sec-fetch-site") === "cross-site") return c.json({ error: "cross_site" }, 403);
    const origin = c.req.header("origin");
    if (origin && origin !== config.publicUrl.origin && origin !== new URL(c.req.url).origin) {
      return c.json({ error: "cross_site" }, 403);
    }
    return next();
  };
}

export function loadSession(store: AuthStore, config: AuthConfig): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    c.set("session", await readSession(c, store, config));
    return next();
  };
}

export const requireSession: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (!c.get("session")) return c.json({ error: "not_signed_in" }, 401);
  return next();
};

/** Account sessions only: a player signed in on their own cannot manage the account. */
export const requireAccount: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = c.get("session");
  if (!session) return c.json({ error: "not_signed_in" }, 401);
  if (session.playerId !== null) return c.json({ error: "account_only" }, 403);
  return next();
};
