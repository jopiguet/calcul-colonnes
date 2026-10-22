import { expect, test, type Page } from "@playwright/test";
import type { PlayerShare, User } from "../../shared/types.ts";
import { goHome, newPlayer, signUp, statsOf, uniqueName, userByName } from "./helpers";

async function openAccount(page: Page): Promise<void> {
  await page.click(".icon-chip");
  await page.locator(".account").waitFor();
}

test("the account chooses the activities a player sees; the server keeps the choice", async ({ page }) => {
  const name = await newPlayer(page, "Hid");
  await openAccount(page);
  const block = page.locator(".player-login", { hasText: name });
  const box = (id: string) => block.locator(`.player-activities input[value='${id}']`);
  await expect(box("columns")).toBeChecked();
  await box("columns").uncheck();
  await expect(block.locator(".player-activities-saved")).toHaveText("✓ Enregistré");
  await box("discover-dice").uncheck();
  await expect.poll(async () => (await userByName(page.request, name)).hidden).toEqual(["columns", "discover-dice"]);

  await page.click("text=Retour");
  await goHome(page);
  await expect(page.locator("[data-activity='columns']")).toHaveCount(0);
  await expect(page.locator("[data-activity='discover-dice']")).toHaveCount(0);
  await expect(page.locator("[data-activity='quiz']")).toHaveCount(1);

  // The last opened activity was the hidden one: a reload goes home instead.
  await page.reload();
  await page.locator(".home").waitFor();
  await expect(page.locator("[data-activity='columns']")).toHaveCount(0);

  // Only known ids, as a list.
  const user = await userByName(page.request, name);
  expect((await page.request.put(`/api/users/${user.id}/hidden`, { data: { hidden: ["Bad Id"] } })).status()).toBe(400);
  expect((await page.request.put(`/api/users/${user.id}/hidden`, { data: { hidden: [] } })).status()).toBe(204);
});

test("a player is shared with another account by a single-use code, and the share can end", async ({ page, browser }) => {
  // Account A owns the player.
  const name = await newPlayer(page, "Shr");
  const owned = await userByName(page.request, name);
  const invite = (await (await page.request.post(`/api/users/${owned.id}/invites`)).json()) as { code: string; expiresAt: number };
  expect(invite.code).toMatch(/^[A-Z2-9]{5}-[A-Z2-9]{5}$/);
  expect(invite.expiresAt).toBeGreaterThan(Date.now() + 6 * 86_400_000);
  // Its own code is refused for itself.
  expect((await page.request.post("/api/shares", { data: { code: invite.code } })).status()).toBe(409);

  // Account B types the code on its Account page.
  const context = await browser.newContext();
  const other = await context.newPage();
  await signUp(other);
  const ownName = uniqueName("Own");
  await other.fill(".new-player input", ownName);
  await other.keyboard.press("Enter");
  await other.locator(".home").waitFor();
  await openAccount(other);
  await other.locator(".join-share input[name=code]").fill(invite.code.toLowerCase().replace("-", " "));
  await other.locator(".join-share button[type=submit]").click();
  await other.locator(".auth-message.ok, .banner").first().waitFor();
  await expect(other.locator("#app")).toContainText(name);

  // B sees the player, marked as shared, and the player's results are one set.
  const seen = await userByName(other.request, name);
  expect(seen.id).toBe(owned.id);
  expect(seen.sharedBy).toBe("Parent");
  expect((await other.request.post("/api/attempts", { data: { userId: seen.id, maximum: 20, operator: "+", top: 3, bottom: 4, given: 7 } })).status()).toBe(201);
  expect((await statsOf(page.request, name)).total).toBe(1);

  // B cannot manage it: activities, codes, shares and sign-in are A's.
  expect((await other.request.put(`/api/users/${seen.id}/hidden`, { data: { hidden: ["columns"] } })).status()).toBe(404);
  expect((await other.request.post(`/api/users/${seen.id}/invites`)).status()).toBe(404);
  expect((await other.request.get(`/api/users/${seen.id}/shares`)).status()).toBe(404);
  expect((await other.request.post(`/api/auth/players/${seen.id}/password`, { data: { username: `x.${Date.now()}`, password: "correct horse battery" } })).status()).not.toBe(201);
  // A code works once.
  expect((await other.request.post("/api/shares", { data: { code: invite.code } })).status()).toBe(404);

  // A sees who has access, and on its home page the player has no mark.
  const shares = (await (await page.request.get(`/api/users/${owned.id}/shares`)).json()) as PlayerShare[];
  expect(shares).toHaveLength(1);
  expect((await userByName(page.request, name)).sharedBy).toBeUndefined();

  // B's player list marks it; B leaving keeps the player and its results with A.
  await other.click("text=Retour");
  await other.locator(".chip").first().click();
  await expect(other.locator("button.player", { hasText: name }).locator(".player-shared")).toHaveText("partagé");
  expect((await other.request.delete(`/api/users/${seen.id}`)).status()).toBe(204);
  expect(((await (await other.request.get("/api/users")).json()) as User[]).map((u) => u.name)).toEqual([ownName]);
  expect((await statsOf(page.request, name)).total).toBe(1);

  // Shared again, then A ends it from the Account page.
  const again = (await (await page.request.post(`/api/users/${owned.id}/invites`)).json()) as { code: string };
  expect((await other.request.post("/api/shares", { data: { code: again.code } })).status()).toBe(201);
  await openAccount(page);
  const block = page.locator(".player-login", { hasText: name });
  await expect(block.locator(".shares .method")).toHaveCount(1);
  page.once("dialog", (dialog) => void dialog.accept());
  await block.locator(".shares button").click();
  await expect(block.locator(".shares")).toHaveCount(0);
  expect((await other.request.get(`/api/users/${seen.id}/profile?since=0`)).status()).toBe(404);
  await context.close();
});
