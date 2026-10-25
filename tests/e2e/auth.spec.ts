import { expect, test, type Page } from "@playwright/test";
import type { SignInMethod, User } from "../../shared/types.ts";
import { PASSWORD, afterSignIn, newPlayer, signIn, signUp, uniqueEmail, uniqueName } from "./helpers";

const COOKIE = "cc_session";

/** Goes through the mock provider's consent page as the given identity. */
async function viaMock(page: Page, who: { sub: string; email?: string; name?: string }, decision = "allow"): Promise<void> {
  await page.locator("a.provider", { hasText: "Mock ID" }).first().click();
  await page.waitForURL(/localhost:8798\/authorize/);
  await page.fill("input[name=sub]", who.sub);
  await page.fill("input[name=email]", who.email ?? "");
  await page.fill("input[name=name]", who.name ?? "Mock User");
  await page.click(`button[value=${decision}]`);
  await page.waitForURL(/localhost:8799\//);
  if (decision === "allow") await afterSignIn(page);
}

/** A fresh load of the sign-in screen (a hash change alone would not reload the app). */
async function openSignIn(page: Page): Promise<void> {
  await page.goto("about:blank");
  await page.goto("/#sign-in");
  await page.locator(".auth").waitFor();
}

const uniqueSub = (): string => `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

test("an account is created, signed out and signed in again; the cookie is HttpOnly", async ({ page }) => {
  const email = await signUp(page);

  const cookie = (await page.context().cookies()).find((c) => c.name === COOKIE);
  expect(cookie).toBeTruthy();
  expect(cookie!.httpOnly).toBe(true);
  expect(cookie!.sameSite).toBe("Lax");
  expect(cookie!.path).toBe("/");
  expect(cookie!.value).toMatch(/^[\w-]{40,}$/);
  // The page's script cannot read the session.
  expect(await page.evaluate(() => document.cookie)).not.toContain(COOKIE);

  // Sign out from the account page.
  await page.click(".icon-chip");
  await page.locator(".account").waitFor();
  await page.click(".account .actions button:last-child");
  await page.locator(".auth").waitFor();
  expect((await page.context().cookies()).some((c) => c.name === COOKIE)).toBe(false);

  // Wrong password, then the right one; the email ignores case.
  await page.fill("input[name=identifier]", email);
  await page.fill("input[name=password]", "not the password");
  await page.click(".auth-form button[type=submit]");
  await expect(page.locator(".auth .auth-message.error")).toBeVisible();
  await signIn(page, email.toUpperCase());
  await expect(page.locator(".new-player input")).toBeVisible();
});

test("the API needs a session and refuses cross-site requests", async ({ page, playwright }) => {
  const anonymous = await playwright.request.newContext({ baseURL: "http://localhost:8799" });
  expect((await anonymous.get("/api/users")).status()).toBe(401);
  expect((await anonymous.get("/api/stats")).status()).toBe(401);
  expect((await anonymous.get("/api/health")).status()).toBe(200);
  await anonymous.dispose();

  await signUp(page);
  const request = page.request;
  expect((await request.get("/api/users")).status()).toBe(200);
  const forged = await request.post("/api/users", {
    data: { name: "Mallory" },
    headers: { origin: "http://evil.example" },
  });
  expect(forged.status()).toBe(403);
  const forgedFetch = await request.post("/api/users", {
    data: { name: "Mallory" },
    headers: { "sec-fetch-site": "cross-site" },
  });
  expect(forgedFetch.status()).toBe(403);
  expect(((await (await request.get("/api/users")).json()) as User[]).length).toBe(0);
});

test("accounts do not see each other's players", async ({ page, browser }) => {
  const name = await newPlayer(page, "Iso");
  const mine = (await (await page.request.get("/api/users")).json()) as User[];
  expect(mine.map((u) => u.name)).toEqual([name]);

  const context = await browser.newContext();
  const other = await context.newPage();
  await signUp(other);
  // The same name is free in another account.
  await other.fill(".new-player input", name);
  await other.keyboard.press("Enter");
  await other.locator(".home").waitFor();
  const theirs = (await (await other.request.get("/api/users")).json()) as User[];
  expect(theirs).toHaveLength(1);
  expect(theirs[0]!.id).not.toBe(mine[0]!.id);

  expect((await other.request.get(`/api/users/${mine[0]!.id}/profile`)).status()).toBe(404);
  const stats = (await (await other.request.get("/api/stats")).json()) as { user: User }[];
  expect(stats.map((s) => s.user.id)).toEqual([theirs[0]!.id]);
  await context.close();
});

test("repeated wrong passwords are slowed down", async ({ page }) => {
  const email = await signUp(page);
  await page.context().clearCookies();
  const statuses: number[] = [];
  for (let i = 0; i < 11; i++) {
    const r = await page.request.post("/api/auth/login", { data: { identifier: email, password: "wrong password" } });
    statuses.push(r.status());
  }
  expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true);
  expect(statuses[10]).toBe(429);
  // Even the right password waits now.
  const right = await page.request.post("/api/auth/login", { data: { identifier: email, password: PASSWORD } });
  expect(right.status()).toBe(429);
  expect(await right.json()).toEqual({ error: "too_many_attempts" });
});

test("signing up and in with a provider, and no silent takeover of an email", async ({ page, browser }) => {
  const sub = uniqueSub();
  const email = uniqueEmail("oauth");
  await openSignIn(page);
  await viaMock(page, { sub, email, name: "Provider Parent" });
  await expect(page.locator(".banner.ok")).toBeVisible();
  await expect(page.locator(".new-player input")).toBeVisible();
  await expect(page).toHaveURL("http://localhost:8799/"); // ?auth=… removed
  const first = (await (await page.request.get("/api/auth/session")).json()) as { account: { id: number; email: string } };
  expect(first.account.email).toBe(email);

  // Signing in again with the same provider account: the same app account.
  await page.context().clearCookies();
  await openSignIn(page);
  await viaMock(page, { sub, email });
  const again = (await (await page.request.get("/api/auth/session")).json()) as { account: { id: number } };
  expect(again.account.id).toBe(first.account.id);

  // Someone else at the provider claiming an email that already has an account.
  const context = await browser.newContext();
  const other = await context.newPage();
  await openSignIn(other);
  await viaMock(other, { sub: uniqueSub(), email });
  await expect(other.locator(".auth .auth-message.error")).toBeVisible();
  expect((await (await other.request.get("/api/auth/session")).json()).authenticated).toBe(false);

  // Cancelling at the provider.
  await openSignIn(other);
  await viaMock(other, { sub: uniqueSub() }, "deny");
  await expect(other.locator(".auth .auth-message.error")).toBeVisible();
  await context.close();
});

test("a provider is linked to an account; the last way to sign in cannot be removed", async ({ page }) => {
  const email = await signUp(page);
  await page.click(".icon-chip");
  await page.locator(".account").waitFor();
  const before = (await (await page.request.get("/api/auth/methods")).json()) as SignInMethod[];
  expect(before).toHaveLength(1);
  // A single way to sign in: its Remove button is off, and the API refuses too.
  await expect(page.locator(".account > .methods .method button")).toBeDisabled();
  const refused = await page.request.delete(`/api/auth/methods/${before[0]!.id}`);
  expect(refused.status()).toBe(409);

  const sub = uniqueSub();
  await viaMock(page, { sub, email: "elsewhere@example.test" });
  await expect(page.locator(".banner.ok")).toBeVisible();
  const after = (await (await page.request.get("/api/auth/methods")).json()) as SignInMethod[];
  expect(after.map((m) => m.type).sort()).toEqual(["oauth", "password"]);

  // Now the password can go, and the provider alone signs in.
  expect((await page.request.delete(`/api/auth/methods/${before[0]!.id}`)).status()).toBe(204);
  await page.context().clearCookies();
  const login = await page.request.post("/api/auth/login", { data: { identifier: email, password: PASSWORD } });
  expect(login.status()).toBe(401);
  await openSignIn(page);
  await viaMock(page, { sub });
  await expect(page.locator(".new-player input")).toBeVisible();
});

test("a player gets their own sign-in and sees only themselves", async ({ page, browser }) => {
  const name = await newPlayer(page, "Kid");
  const sibling = uniqueName("Sis");
  expect((await page.request.post("/api/users", { data: { name: sibling } })).status()).toBe(201);

  await page.click(".icon-chip");
  await page.locator(".account").waitFor();
  const username = `kid.${Date.now()}`;
  const form = page.locator(".player-login", { hasText: name }).locator("form");
  await form.locator("input[name=username]").fill(username);
  await form.locator("input[name=password]").fill(PASSWORD);
  await form.locator("button[type=submit]").click();
  await expect(page.locator(".player-login", { hasText: name }).locator(".method")).toContainText(username);

  const context = await browser.newContext();
  const kid = await context.newPage();
  await signIn(kid, username);
  await kid.locator(".home").waitFor(); // a player's own sign-in opens on their home page
  await expect(kid.locator(".chip-label")).toContainText(name);
  await expect(kid.locator("button.icon-chip", { hasText: "⚙️" })).toHaveCount(0);

  const users = (await (await kid.request.get("/api/users")).json()) as User[];
  expect(users.map((u) => u.name)).toEqual([name]);
  expect((await kid.request.post("/api/users", { data: { name: "Extra" } })).status()).toBe(403);
  expect((await kid.request.get("/api/auth/methods")).status()).toBe(403);
  const siblingId = ((await (await page.request.get("/api/users")).json()) as User[]).find((u) => u.name === sibling)!.id;
  expect((await kid.request.get(`/api/users/${siblingId}/profile`)).status()).toBe(404);
  expect((await kid.request.post("/api/attempts", {
    data: { userId: siblingId, maximum: 100, operator: "+", top: 1, bottom: 1, given: 2 },
  })).status()).toBe(404);

  // The player signs out with the door button.
  await kid.locator("button.icon-chip", { hasText: "🚪" }).click();
  await kid.locator(".auth").waitFor();
  await context.close();
});

test("a provider can be linked to a player", async ({ page, browser }) => {
  const name = await newPlayer(page, "Prov");
  await page.click(".icon-chip");
  await page.locator(".account").waitFor();
  const sub = uniqueSub();
  await page.locator(".player-login", { hasText: name }).locator("a.provider").click();
  await page.waitForURL(/localhost:8798\/authorize/);
  await page.fill("input[name=sub]", sub);
  await page.click("button[value=allow]");
  await page.waitForURL(/localhost:8799\//);
  await expect(page.locator(".banner.ok")).toBeVisible();

  const context = await browser.newContext();
  const kid = await context.newPage();
  await openSignIn(kid);
  await viaMock(kid, { sub });
  await kid.locator(".home").waitFor(); // a player's own sign-in opens on their home page
  await expect(kid.locator(".chip-label")).toContainText(name);
  await context.close();
});

test("signing out other devices ends their sessions", async ({ page, browser }) => {
  const email = await signUp(page);
  const context = await browser.newContext();
  const other = await context.newPage();
  await signIn(other, email);
  await other.locator(".new-player input").waitFor();

  await page.click(".icon-chip");
  await page.locator(".account").waitFor();
  await page.click(".account .actions button:first-child");
  await expect(page.locator(".account .auth-message.ok")).toBeVisible();

  expect((await other.request.get("/api/users")).status()).toBe(401);
  await other.reload();
  await other.locator(".auth").waitFor();
  // This device is still signed in.
  expect((await page.request.get("/api/users")).status()).toBe(200);
  await context.close();
});
