/** Authentication settings, read from the environment (see .env.example). */
export interface AuthConfig {
  /** Public address of the app, used for OAuth redirect URIs and the origin check. */
  publicUrl: URL;
  /** Secure cookies (HTTPS only, `__Host-` prefix). On when PUBLIC_URL is https. */
  secureCookies: boolean;
  /** Session lifetime, renewed while the session is used. */
  sessionDays: number;
  /**
   * "open": anyone can create an account. "invite": only with an invitation
   * from the owner (the first account). "closed": only the very first account.
   */
  registration: "open" | "invite" | "closed";
  /** Behind a reverse proxy: take the client IP from X-Forwarded-For (rate limiting). */
  trustProxy: boolean;
  /** Sign-in and sign-up attempts allowed per client address in 15 minutes. */
  attemptsPerAddress: number;
  /** Shown on the privacy page: where the app runs, and whom to ask. */
  privacyHosting: string;
  privacyContact: string;
}

export function authConfigFromEnv(env: NodeJS.ProcessEnv, port: number): AuthConfig {
  const publicUrl = new URL(env.PUBLIC_URL?.trim() || `http://localhost:${port}`);
  const secureEnv = env.COOKIE_SECURE?.trim();
  return {
    publicUrl,
    secureCookies: secureEnv ? secureEnv === "true" : publicUrl.protocol === "https:",
    sessionDays: Math.max(1, Number(env.SESSION_DAYS) || 30),
    registration: env.REGISTRATION?.trim() === "closed" ? "closed" : env.REGISTRATION?.trim() === "invite" ? "invite" : "open",
    trustProxy: env.TRUST_PROXY?.trim() === "true",
    attemptsPerAddress: Math.max(1, Number(env.AUTH_ATTEMPTS_PER_ADDRESS) || 100),
    privacyHosting: env.PRIVACY_HOSTING?.trim().slice(0, 200) ?? "",
    privacyContact: env.PRIVACY_CONTACT?.trim().slice(0, 200) ?? "",
  };
}
