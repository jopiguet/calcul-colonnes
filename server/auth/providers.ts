/**
 * OAuth 2.0 / OpenID Connect providers. A provider is enabled by setting its
 * client id and secret in the environment; see docs/authentication.md.
 *
 * Identity is read from the provider's userinfo endpoint with the access token
 * obtained in the server-to-server code exchange (authorization code + PKCE,
 * confidential client). The ID token is not used.
 */

export interface Profile {
  /** Stable user id at the provider. */
  subject: string;
  email: string | null;
  /** Whether the provider vouches for the email. */
  emailVerified: boolean;
  name: string | null;
}

export interface Endpoints {
  authorization: string;
  token: string;
  userinfo: string;
}

export interface Provider {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  scopes: string;
  /** Extra parameters for the authorization request. */
  params: Record<string, string>;
  endpoints(): Promise<Endpoints>;
  profile(accessToken: string, endpoints: Endpoints): Promise<Profile>;
}

const TIMEOUT = 10_000;
const USER_AGENT = "calcul-colonnes";

async function getJson(url: string, accessToken: string, accept = "application/json"): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: accept, "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!response.ok) throw new Error(`${new URL(url).host} answered ${response.status}`);
  return (await response.json()) as Record<string, unknown>;
}

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);

/** Standard OpenID Connect userinfo claims. */
async function oidcProfile(accessToken: string, endpoints: Endpoints, trustEmail: boolean): Promise<Profile> {
  const info = await getJson(endpoints.userinfo, accessToken);
  const subject = str(info.sub);
  if (!subject) throw new Error("userinfo without sub");
  const email = str(info.email)?.toLowerCase() ?? null;
  return {
    subject,
    email,
    emailVerified: trustEmail && email !== null && (info.email_verified === true || info.email_verified === "true"),
    name: str(info.name) ?? str(info.preferred_username) ?? str(info.given_name),
  };
}

const fixed = (e: Endpoints) => async (): Promise<Endpoints> => e;

/** Endpoints from the issuer's discovery document, fetched once. */
function discovered(issuer: string): () => Promise<Endpoints> {
  let cached: Promise<Endpoints> | null = null;
  return () => {
    cached ??= (async () => {
      const url = `${issuer.replace(/\/$/, "")}/.well-known/openid-configuration`;
      const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
      if (!response.ok) throw new Error(`discovery failed: ${url} answered ${response.status}`);
      const doc = (await response.json()) as Record<string, unknown>;
      const authorization = str(doc.authorization_endpoint);
      const token = str(doc.token_endpoint);
      const userinfo = str(doc.userinfo_endpoint);
      if (!authorization || !token || !userinfo) throw new Error(`incomplete discovery document at ${url}`);
      return { authorization, token, userinfo };
    })().catch((error: unknown) => {
      cached = null; // try again next time
      throw error;
    });
    return cached;
  };
}

type Env = NodeJS.ProcessEnv;
const credentials = (env: Env, prefix: string) => {
  const clientId = env[`${prefix}_CLIENT_ID`]?.trim();
  const clientSecret = env[`${prefix}_CLIENT_SECRET`]?.trim();
  return clientId && clientSecret ? { clientId, clientSecret } : null;
};

function google(env: Env): Provider | null {
  const c = credentials(env, "GOOGLE");
  if (!c) return null;
  return {
    id: "google",
    name: "Google",
    ...c,
    scopes: "openid email profile",
    params: { prompt: "select_account" },
    endpoints: fixed({
      authorization: "https://accounts.google.com/o/oauth2/v2/auth",
      token: "https://oauth2.googleapis.com/token",
      userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
    }),
    profile: (token, e) => oidcProfile(token, e, true),
  };
}

function microsoft(env: Env): Provider | null {
  const c = credentials(env, "MICROSOFT");
  if (!c) return null;
  const tenant = env.MICROSOFT_TENANT?.trim() || "common";
  return {
    id: "microsoft",
    name: "Microsoft",
    ...c,
    scopes: "openid email profile",
    params: { prompt: "select_account" },
    endpoints: fixed({
      authorization: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
      token: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      userinfo: "https://graph.microsoft.com/oidc/userinfo",
    }),
    // Microsoft does not say whether the email is verified: it is not trusted.
    profile: (token, e) => oidcProfile(token, e, false),
  };
}

function github(env: Env): Provider | null {
  const c = credentials(env, "GITHUB");
  if (!c) return null;
  return {
    id: "github",
    name: "GitHub",
    ...c,
    scopes: "read:user user:email",
    params: {},
    endpoints: fixed({
      authorization: "https://github.com/login/oauth/authorize",
      token: "https://github.com/login/oauth/access_token",
      userinfo: "https://api.github.com/user",
    }),
    async profile(token, e) {
      const user = await getJson(e.userinfo, token, "application/vnd.github+json");
      if (user.id === undefined) throw new Error("GitHub user without id");
      let email: string | null = null;
      let emailVerified = false;
      try {
        const emails = (await getJson("https://api.github.com/user/emails", token, "application/vnd.github+json")) as unknown;
        const list = Array.isArray(emails) ? (emails as { email: string; primary: boolean; verified: boolean }[]) : [];
        const primary = list.find((m) => m.primary) ?? list.find((m) => m.verified);
        if (primary) [email, emailVerified] = [primary.email.toLowerCase(), primary.verified];
      } catch {
        // email scope refused: the account has no email
      }
      return { subject: String(user.id), email, emailVerified, name: str(user.name) ?? str(user.login) };
    },
  };
}

/** Any other OpenID Connect provider (Keycloak, Authentik, Auth0, GitLab…), by discovery. */
function genericOidc(env: Env): Provider | null {
  const c = credentials(env, "OIDC");
  const issuer = env.OIDC_ISSUER?.trim();
  if (!c || !issuer) return null;
  return {
    id: env.OIDC_ID?.trim() || "oidc",
    name: env.OIDC_NAME?.trim() || "OpenID",
    ...c,
    scopes: env.OIDC_SCOPES?.trim() || "openid email profile",
    params: {},
    endpoints: discovered(issuer),
    profile: (token, e) => oidcProfile(token, e, env.OIDC_TRUST_EMAIL?.trim() !== "false"),
  };
}

export function providersFromEnv(env: Env): Map<string, Provider> {
  const list = [google(env), microsoft(env), github(env), genericOidc(env)].filter((p): p is Provider => p !== null);
  return new Map(list.map((p) => [p.id, p]));
}

/** Code exchange at the token endpoint (client_secret_post, PKCE verifier). */
export async function exchangeCode(
  provider: Provider,
  endpoints: Endpoints,
  code: string,
  redirectUri: string,
  verifier: string,
): Promise<string> {
  const response = await fetch(endpoints.token, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded", "User-Agent": USER_AGENT },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code_verifier: verifier,
    }),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  // GitHub answers 200 with an "error" field.
  const token = str(body.access_token);
  if (!response.ok || !token) throw new Error(`token exchange failed: ${String(body.error ?? response.status)}`);
  return token;
}
