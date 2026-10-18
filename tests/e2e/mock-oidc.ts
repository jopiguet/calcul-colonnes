/**
 * A minimal OpenID Connect provider for the tests, standing in for Google,
 * Microsoft or GitHub. It is strict where a real provider is: client id and
 * secret, redirect URI, single-use codes, and PKCE (S256) are all checked, so a
 * mistake in the app's OAuth code makes the tests fail.
 *
 * The consent page lets the test choose who signs in (subject, email, name).
 */
import { createHash, randomBytes } from "node:crypto";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const PORT = Number(process.env.MOCK_OIDC_PORT) || 8798;
const ISSUER = `http://localhost:${PORT}`;
const CLIENT_ID = "test-client";
const CLIENT_SECRET = "test-secret";

interface Grant {
  clientId: string;
  redirectUri: string;
  challenge: string;
  user: Record<string, unknown>;
  used: boolean;
}
const codes = new Map<string, Grant>();
const tokens = new Map<string, Record<string, unknown>>();

const escape = (s: string): string => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

const app = new Hono();

app.get("/.well-known/openid-configuration", (c) =>
  c.json({
    issuer: ISSUER,
    authorization_endpoint: `${ISSUER}/authorize`,
    token_endpoint: `${ISSUER}/token`,
    userinfo_endpoint: `${ISSUER}/userinfo`,
    code_challenge_methods_supported: ["S256"],
  }),
);

app.get("/authorize", (c) => {
  const q = c.req.query();
  if (q.client_id !== CLIENT_ID) return c.text("unknown client", 400);
  if (q.response_type !== "code" || q.code_challenge_method !== "S256" || !q.code_challenge || !q.state) {
    return c.text("authorization code with PKCE S256 and state required", 400);
  }
  const hidden = ["redirect_uri", "state", "code_challenge", "client_id"]
    .map((k) => `<input type="hidden" name="${k}" value="${escape(q[k] ?? "")}">`)
    .join("");
  return c.html(`<!doctype html><meta charset="utf-8"><title>Mock ID</title>
    <h1>Mock ID — sign in</h1>
    <form method="post" action="/authorize">${hidden}
      <label>Subject <input name="sub" value="user-1"></label>
      <label>Email <input name="email" value="user@example.test"></label>
      <label>Name <input name="name" value="Test User"></label>
      <label><input type="checkbox" name="verified" checked> email verified</label>
      <button name="decision" value="allow">Allow</button>
      <button name="decision" value="deny">Deny</button>
    </form>`);
});

app.post("/authorize", async (c) => {
  const f = await c.req.parseBody();
  const redirect = new URL(String(f.redirect_uri));
  redirect.searchParams.set("state", String(f.state));
  if (f.decision !== "allow") {
    redirect.searchParams.set("error", "access_denied");
    return c.redirect(redirect.toString(), 302);
  }
  const code = randomBytes(16).toString("hex");
  const email = String(f.email ?? "").trim();
  codes.set(code, {
    clientId: String(f.client_id),
    redirectUri: String(f.redirect_uri),
    challenge: String(f.code_challenge),
    user: {
      sub: String(f.sub),
      name: String(f.name ?? ""),
      ...(email ? { email, email_verified: f.verified === "on" } : {}),
    },
    used: false,
  });
  redirect.searchParams.set("code", code);
  return c.redirect(redirect.toString(), 302);
});

app.post("/token", async (c) => {
  const f = await c.req.parseBody();
  const grant = codes.get(String(f.code));
  const fail = (error: string) => c.json({ error }, 400);
  if (f.grant_type !== "authorization_code") return fail("unsupported_grant_type");
  if (f.client_id !== CLIENT_ID || f.client_secret !== CLIENT_SECRET) return fail("invalid_client");
  if (!grant || grant.used) return fail("invalid_grant");
  grant.used = true;
  if (grant.redirectUri !== f.redirect_uri) return fail("invalid_grant");
  const challenge = createHash("sha256").update(String(f.code_verifier ?? "")).digest("base64url");
  if (challenge !== grant.challenge) return fail("invalid_grant"); // PKCE
  const token = randomBytes(16).toString("hex");
  tokens.set(token, grant.user);
  return c.json({ access_token: token, token_type: "Bearer", expires_in: 300 });
});

app.get("/userinfo", (c) => {
  const user = tokens.get((c.req.header("authorization") ?? "").replace(/^Bearer /, ""));
  return user ? c.json(user) : c.json({ error: "invalid_token" }, 401);
});

serve({ fetch: app.fetch, port: PORT }, () => console.log(`mock OpenID provider on ${ISSUER}`));
