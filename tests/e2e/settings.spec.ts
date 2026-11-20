import { expect, test } from "@playwright/test";
import type { User } from "../../shared/types.ts";
import { goHome, newPlayer, openActivity, userByName } from "./helpers";

test("settings: sections in the address, the browser's Back button leaves them, a reload stays", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 900 }); // wide: the sections as tabs
  await newPlayer(page, "Set");
  await goHome(page);
  await page.click(".icon-chip");
  await expect(page.locator(".settings h1")).toHaveText("⚙️ Paramètres");
  await expect(page).toHaveURL(/#settings\/players$/);
  await expect(page.locator(".settings-tab")).toHaveText(["👤 Joueurs", "🔑 Compte", "📦 Données"]);

  // Another section: the address follows, without a history entry of its own.
  await page.click(".settings-tab[data-section=account]");
  await expect(page.locator(".settings")).toHaveAttribute("data-section", "account");
  await expect(page).toHaveURL(/#settings\/account$/);
  await page.reload();
  await expect(page.locator(".settings")).toHaveAttribute("data-section", "account");

  // Back: home again, and the address without #settings.
  await page.locator(".settings-back").click();
  await page.locator(".home").waitFor();
  await page.click(".icon-chip");
  await expect(page.locator(".settings")).toHaveAttribute("data-section", "account");
  await page.click(".settings-tab[data-section=data]");
  await page.goBack();
  await page.locator(".home").waitFor();
  await expect(page.locator(".settings")).toHaveCount(0);
  expect(new URL(page.url()).hash).toBe("");
  // Forward: the settings again.
  await page.goForward();
  await expect(page.locator(".settings")).toHaveAttribute("data-section", "data");
});

test("settings on a phone: the sections in a drop-down list, nothing wider than the screen", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  await newPlayer(page, "Phone");
  await page.click(".icon-chip");
  await expect(page.locator(".settings-tabs")).toBeHidden();
  await page.locator(".settings-select").selectOption("account");
  await expect(page.locator(".settings")).toHaveAttribute("data-section", "account");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator(".settings-select").selectOption("players");
  await page.locator(".settings-activities .settings-group > summary").first().click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("settings: one player at a time, chosen in a list; a whole group shown or hidden at once", async ({ page }) => {
  const first = await newPlayer(page, "One");
  const second = `Two ${Date.now()}`;
  expect((await page.request.post("/api/users", { data: { name: second } })).status()).toBe(201);
  await page.click(".icon-chip");
  const id = (await userByName(page.request, second)).id;
  await expect(page.locator(".player-login h3")).toHaveText(first);
  await page.locator(".settings-player").selectOption(String(id));
  await expect(page.locator(".player-login h3")).toHaveText(second);

  const maths = page.locator(".settings-group", { has: page.locator("input[value='columns']") });
  await maths.locator("summary").click();
  await maths.getByRole("button", { name: "Rien" }).click();
  await expect(maths.locator(".settings-group-count")).toHaveText("0 sur 3");
  await expect.poll(async () => (await userByName(page.request, second)).hidden?.sort()).toEqual(["calc", "columns", "quiz"]);
  await maths.getByRole("button", { name: "Tout" }).click();
  await expect.poll(async () => (await userByName(page.request, second)).hidden).toEqual([]);
  // The first player is untouched.
  expect((await userByName(page.request, first)).hidden).toEqual([]);
});

test("the reading in Latin letters: each player's own choice, kept on the server for every device", async ({ page, browser }) => {
  const name = await newPlayer(page, "Read");
  const user = await userByName(page.request, name);
  await page.click(".icon-chip");
  const display = page.locator(".settings-display");
  await expect(display.locator(".segment.on")).toHaveText("Avec la question");
  await display.getByRole("button", { name: "Jamais" }).click();
  await expect.poll(async () => (await userByName(page.request, name)).prefs).toEqual({ reading: "never" });

  // Another device of the account: the same choice, on the book's page too.
  const context = await browser.newContext({ storageState: await page.context().storageState() });
  const other = await context.newPage();
  await other.goto("/");
  await other.locator(".home, .players").first().waitFor();
  if (await other.locator(".players").isVisible()) await other.locator("button.player", { hasText: name }).click();
  await openActivity(other, "vocab-test-characters");
  await expect(other.locator(".vocab-romaji .segment.on")).toHaveText("Jamais");
  // A book's own choice, kept by its slug.
  await other.locator(".vocab-romaji-every input").uncheck();
  await other.click(".vocab-romaji >> text=Après la réponse");
  await expect.poll(async () => (await userByName(page.request, name)).prefs).toEqual({ reading: "never", readingBooks: { "test-characters": "after" } });
  await context.close();

  // Only what the choice may hold; another account's player is refused.
  expect((await page.request.put(`/api/users/${user.id}/prefs`, { data: { prefs: [] } })).status()).toBe(400);
  expect((await page.request.put(`/api/users/${user.id}/prefs`, { data: { prefs: { reading: "loud", readingBooks: { "Bad Id": "never", ok: "after" }, x: 1 } } })).status()).toBe(204);
  expect((await userByName(page.request, name)).prefs).toEqual({ readingBooks: { ok: "after" } });
  const users = (await (await page.request.get("/api/users")).json()) as User[];
  expect(users.find((u) => u.id === user.id)?.prefs).toEqual({ readingBooks: { ok: "after" } });
});

test("home: the characters books in a group of their own", async ({ page }) => {
  await newPlayer(page, "Chars");
  await goHome(page);
  const characters = page.locator(".activity-group[data-group='characters']");
  await expect(characters.locator(".activity-group-title")).toHaveText("Caractères");
  await expect(characters.locator("[data-activity='vocab-test-characters']")).toBeVisible();
  await expect(page.locator(".activity-group[data-group='languages'] [data-activity='vocab-test-characters']")).toHaveCount(0);
});
