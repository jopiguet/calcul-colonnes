import { createHash } from "node:crypto";
import { getConnInfo } from "@hono/node-server/conninfo";
import { Hono, type Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { AuthOptions, AuthState, SignInMethod } from "../../shared/types.ts";
import type { AuthConfig } from "./config.ts";
import { requireAccount, type AppEnv } from "./middleware.ts";
import { hashPassword, passwordProblem, verifyAgainstNothing, verifyPassword } from "./passwords.ts";
import { exchangeCode, type Provider } from "./providers.ts";
import { RateLimit } from "./rate-limit.ts";
import { cookieOptions, endSession, flowCookieName, randomToken, startSession } from "./sessions.ts";
import { AuthStore, FLOW_LIFETIME, type Credential } from "./store.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME = /^[a-z0-9._-]{3,30}$/;
const NAME_LENGTH = 40;
const WINDOW = 15 * 60 * 1000;

const isId = (v: number): boolean => Number.isInteger(v) && v > 0;

function cleanName(raw: unknown): string | null {
  const name = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
  return name && name.length <= NAME_LENGTH ? name : null;
}

function cleanEmail(raw: unknown): string | null {
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  return email.length <= 254 && EMAIL.test(email) ? email : null;
}

function toMethod(c: Credential): SignInMethod {
  return {
    id: c.id,
    type: c.type,
    provider: c.provider,
    label: c.type === "password" ? c.subject : c.label,
    playerId: c.playerId,
    createdAt: c.createdAt,
    lastUsedAt: c.lastUsedAt,
  };
}

export function authRoutes(store: AuthStore, config: AuthConfig, providers: Map<string, Provider>): Hono<AppEnv> {
  const auth = new Hono<AppEnv>();

  // Attempts per client address (sign-in and sign-up), failures per identifier.
  const perAddress = new RateLimit(config.attemptsPerAddress, WINDOW);
  const failures = new RateLimit(10, WINDOW);

  const clientAddress = (c: Context): string => {
    if (config.trustProxy) {
      // Cloudflare (tunnel or proxy) gives the visitor's address on its own.
      const cloudflare = c.req.header("cf-connecting-ip")?.trim();
      if (cloudflare) return cloudflare;
      // Proxies append to X-Forwarded-For: the last entry is the one our proxy
      // added; earlier entries come from the client and can be forged.
      const forwarded = c.req.header("x-forwarded-for")?.split(",").at(-1)?.trim();
      if (forwarded) return forwarded;
    }
    return getConnInfo(c).remote.address ?? "unknown";
  };

  const body = async (c: Context): Promise<Record<string, unknown>> =>
    ((await c.req.json().catch(() => null)) as Record<string, unknown> | null) ?? {};

  const registrationOpen = async (): Promise<boolean> =>
    config.registration === "open" || (await store.accountCount()) === 0;

  // ------------------------------------------------------------- state

  auth.get("/session", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ authenticated: false } satisfies AuthState);
    const account = await store.getAccount(session.accountId);
    if (!account) return c.json({ authenticated: false } satisfies AuthState);
    const player =
      session.playerId === null ? null : { id: session.playerId, name: (await store.playerName(session.playerId)) ?? "" };
    return c.json({
      authenticated: true,
      account: { id: account.id, name: account.name, email: account.email },
      player,
    } satisfies AuthState);
  });

  auth.get("/options", async (c) =>
    c.json({
      providers: [...providers.values()].map((p) => ({ id: p.id, name: p.name })),
      registration: await registrationOpen(),
      publicUrl: config.publicUrl.origin,
    } satisfies AuthOptions),
  );

  // ----------------------------------------------------- email + password

  auth.post("/register", async (c) => {
    const address = clientAddress(c);
    if (!perAddress.allowed(address)) return c.json({ error: "too_many_attempts" }, 429);
    perAddress.hit(address);
    if (!(await registrationOpen())) return c.json({ error: "registration_closed" }, 403);

    const input = await body(c);
    const name = cleanName(input.name);
    const email = cleanEmail(input.email);
    if (!name) return c.json({ error: "invalid_name" }, 400);
    if (!email) return c.json({ error: "invalid_email" }, 400);
    const problem = passwordProblem(input.password);
    if (problem) return c.json({ error: `password_${problem}` }, 400);
    if ((await store.accountByEmail(email)) || (await store.findCredential("password", "", email))) {
      return c.json({ error: "email_in_use" }, 409);
    }

    const { account, claimed } = await store.createAccount(email, name);
    await store.addCredential({
      accountId: account.id,
      playerId: null,
      type: "password",
      provider: "",
      subject: email,
      secret: await hashPassword(input.password as string),
      label: email,
    });
    if (claimed > 0) console.log(`account ${account.id} took over ${claimed} existing player(s)`);
    await startSession(c, store, config, account.id, null);
    return c.json({ authenticated: true, account: { id: account.id, name, email }, player: null } satisfies AuthState, 201);
  });

  auth.post("/login", async (c) => {
    const address = clientAddress(c);
    const input = await body(c);
    const identifier = typeof input.identifier === "string" ? input.identifier.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";
    if (!perAddress.allowed(address) || !failures.allowed(identifier)) {
      return c.json({ error: "too_many_attempts" }, 429);
    }
    perAddress.hit(address);

    const credential = identifier ? await store.findCredential("password", "", identifier) : null;
    const ok = credential?.secret
      ? await verifyPassword(password, credential.secret)
      : await verifyAgainstNothing(password); // same time whether the account exists or not
    if (!ok || !credential) {
      failures.hit(identifier);
      return c.json({ error: "invalid_credentials" }, 401);
    }
    failures.reset(identifier);
    await store.touchCredential(credential.id);
    await startSession(c, store, config, credential.accountId, credential.playerId);
    return c.json({ ok: true });
  });

  auth.post("/logout", async (c) => {
    await endSession(c, store, config, c.get("session"));
    return c.body(null, 204);
  });

  /** Signs out every other device, players' own sessions included. */
  auth.post("/logout-all", requireAccount, async (c) => {
    const session = c.get("session")!;
    await store.deleteSessionsOf(session.accountId, session.id);
    return c.body(null, 204);
  });

  /** Changes the account password, or adds one to an account that only had providers. */
  auth.post("/password", requireAccount, async (c) => {
    const session = c.get("session")!;
    const input = await body(c);
    const problem = passwordProblem(input.password);
    if (problem) return c.json({ error: `password_${problem}` }, 400);
    const account = (await store.getAccount(session.accountId))!;
    const existing = (await store.credentialsOf(account.id)).find((m) => m.type === "password" && m.playerId === null);

    if (existing) {
      const current = typeof input.current === "string" ? input.current : "";
      if (!(await verifyPassword(current, existing.secret ?? ""))) return c.json({ error: "wrong_password" }, 401);
      await store.updateSecret(existing.id, await hashPassword(input.password as string));
    } else {
      const email = account.email ?? cleanEmail(input.email);
      if (!email) return c.json({ error: "invalid_email" }, 400);
      const taken = await store.findCredential("password", "", email);
      const owner = await store.accountByEmail(email);
      if (taken || (owner && owner.id !== account.id)) return c.json({ error: "email_in_use" }, 409);
      if (!account.email) await store.setAccountEmail(account.id, email);
      await store.addCredential({
        accountId: account.id,
        playerId: null,
        type: "password",
        provider: "",
        subject: email,
        secret: await hashPassword(input.password as string),
        label: email,
      });
    }
    await store.deleteSessionsOf(account.id, session.id); // other devices must sign in again
    return c.body(null, 204);
  });

  // ------------------------------------------------------ sign-in methods

  auth.get("/methods", requireAccount, async (c) => {
    const methods = await store.credentialsOf(c.get("session")!.accountId);
    return c.json(methods.map(toMethod));
  });

  auth.delete("/methods/:id", requireAccount, async (c) => {
    const session = c.get("session")!;
    const id = Number(c.req.param("id"));
    const credential = isId(id) ? await store.getCredential(id) : null;
    if (!credential || credential.accountId !== session.accountId) return c.json({ error: "unknown_method" }, 404);
    if (credential.playerId === null) {
      const own = (await store.credentialsOf(session.accountId)).filter((m) => m.playerId === null);
      if (own.length <= 1) return c.json({ error: "last_method" }, 409);
    } else {
      await store.deleteSessionsOfPlayer(credential.playerId); // that login no longer works
    }
    await store.deleteCredential(id);
    return c.body(null, 204);
  });

  /** Gives a player their own username and password (replacing a previous one). */
  auth.post("/players/:id/password", requireAccount, async (c) => {
    const session = c.get("session")!;
    const playerId = Number(c.req.param("id"));
    if (!isId(playerId) || (await store.playerAccount(playerId)) !== session.accountId) {
      return c.json({ error: "unknown_player" }, 404);
    }
    const input = await body(c);
    const username = typeof input.username === "string" ? input.username.trim().toLowerCase() : "";
    if (!USERNAME.test(username)) return c.json({ error: "invalid_username" }, 400);
    const problem = passwordProblem(input.password);
    if (problem) return c.json({ error: `password_${problem}` }, 400);
    const taken = await store.findCredential("password", "", username);
    if (taken && taken.playerId !== playerId) return c.json({ error: "username_taken" }, 409);

    for (const m of await store.credentialsOf(session.accountId)) {
      if (m.type === "password" && m.playerId === playerId) await store.deleteCredential(m.id);
    }
    await store.deleteSessionsOfPlayer(playerId);
    const credential = await store.addCredential({
      accountId: session.accountId,
      playerId,
      type: "password",
      provider: "",
      subject: username,
      secret: await hashPassword(input.password as string),
      label: username,
    });
    return c.json(toMethod(credential), 201);
  });

  // ---------------------------------------------------------------- OAuth

  const redirectUri = (provider: Provider): string =>
    new URL(`/api/auth/oauth/${provider.id}/callback`, config.publicUrl).toString();
  const back = (c: Context, query: string) => c.redirect(`/?${query}`, 302);

  /**
   * Starts an authorization code flow with PKCE. intent:
   *   login       — sign in, or create an account
   *   link        — add this provider to the signed-in account
   *   link-player — give one of the account's players this provider as their own login
   */
  auth.get("/oauth/:provider/start", async (c) => {
    const provider = providers.get(c.req.param("provider"));
    if (!provider) return c.json({ error: "unknown_provider" }, 404);
    const intent = c.req.query("intent") ?? "login";
    if (intent !== "login" && intent !== "link" && intent !== "link-player") return c.json({ error: "invalid_intent" }, 400);

    const session = c.get("session");
    let playerId: number | null = null;
    if (intent !== "login") {
      if (!session || session.playerId !== null) return back(c, "auth_error=not_signed_in");
      if (intent === "link-player") {
        playerId = Number(c.req.query("player"));
        if (!isId(playerId) || (await store.playerAccount(playerId)) !== session.accountId) {
          return back(c, "auth_error=unknown_player");
        }
      }
    }

    const state = randomToken();
    const verifier = randomToken();
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    await store.saveFlow({
      state,
      provider: provider.id,
      verifier,
      intent,
      accountId: intent === "login" ? null : session!.accountId,
      playerId,
      createdAt: Date.now(),
    });
    // Binds the flow to this browser: the callback must come back with the same state.
    setCookie(c, flowCookieName(config), state, cookieOptions(config, FLOW_LIFETIME / 1000));

    let endpoints;
    try {
      endpoints = await provider.endpoints();
    } catch (error) {
      console.error(`oauth ${provider.id}:`, (error as Error).message);
      return back(c, "auth_error=provider_unavailable");
    }
    const url = new URL(endpoints.authorization);
    for (const [key, value] of Object.entries({
      response_type: "code",
      client_id: provider.clientId,
      redirect_uri: redirectUri(provider),
      scope: provider.scopes,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
      ...provider.params,
    })) {
      url.searchParams.set(key, value);
    }
    return c.redirect(url.toString(), 302);
  });

  auth.get("/oauth/:provider/callback", async (c) => {
    const provider = providers.get(c.req.param("provider"));
    if (!provider) return back(c, "auth_error=unknown_provider");
    const state = c.req.query("state") ?? "";
    const cookieState = getCookie(c, flowCookieName(config));
    deleteCookie(c, flowCookieName(config), { path: "/", secure: config.secureCookies });
    const flow = state ? await store.takeFlow(state) : null;
    if (!flow || flow.provider !== provider.id || !cookieState || cookieState !== state) {
      return back(c, "auth_error=invalid_state");
    }
    if (c.req.query("error")) return back(c, "auth_error=cancelled");
    const code = c.req.query("code");
    if (!code) return back(c, "auth_error=invalid_state");

    let profile;
    try {
      const endpoints = await provider.endpoints();
      const token = await exchangeCode(provider, endpoints, code, redirectUri(provider), flow.verifier);
      profile = await provider.profile(token, endpoints);
    } catch (error) {
      console.error(`oauth ${provider.id}:`, (error as Error).message);
      return back(c, "auth_error=provider_failed");
    }

    const existing = await store.findCredential("oauth", provider.id, profile.subject);
    const label = profile.email ?? profile.name;

    if (flow.intent === "login") {
      if (existing) {
        await store.touchCredential(existing.id);
        await startSession(c, store, config, existing.accountId, existing.playerId);
        return back(c, "auth=signed_in");
      }
      // First sign-in with this provider account: a new account. An existing
      // account with the same email is never taken over silently: its owner
      // signs in and links the provider from the account page.
      if (!(await registrationOpen())) return back(c, "auth_error=registration_closed");
      const email = profile.emailVerified ? profile.email : null;
      if (profile.email && (await store.accountByEmail(profile.email))) return back(c, "auth_error=email_in_use");
      const name = (profile.name ?? profile.email ?? provider.name).slice(0, NAME_LENGTH);
      const { account, claimed } = await store.createAccount(email, name);
      if (claimed > 0) console.log(`account ${account.id} took over ${claimed} existing player(s)`);
      await store.addCredential({
        accountId: account.id,
        playerId: null,
        type: "oauth",
        provider: provider.id,
        subject: profile.subject,
        secret: null,
        label,
      });
      await startSession(c, store, config, account.id, null);
      return back(c, "auth=signed_up");
    }

    // Linking: the browser must still be signed in to the account that started it.
    const session = c.get("session");
    if (!session || session.playerId !== null || session.accountId !== flow.accountId) {
      return back(c, "auth_error=not_signed_in");
    }
    if (existing) {
      const same = existing.accountId === session.accountId && existing.playerId === flow.playerId;
      return back(c, same ? "auth=linked" : "auth_error=already_linked");
    }
    if (flow.playerId !== null && (await store.playerAccount(flow.playerId)) !== session.accountId) {
      return back(c, "auth_error=unknown_player");
    }
    await store.addCredential({
      accountId: session.accountId,
      playerId: flow.playerId,
      type: "oauth",
      provider: provider.id,
      subject: profile.subject,
      secret: null,
      label,
    });
    return back(c, "auth=linked");
  });

  return auth;
}
