import { expect, test } from "@playwright/test";
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

test("the reading in Latin letters: each player's own choice per course, kept on the server for every device", async ({ page, browser }) => {
  const name = await newPlayer(page, "Read");
  const user = await userByName(page.request, name);
  await page.click(".icon-chip");
  const display = page.locator(".settings-display");
  // One line per course: a course's words and letters together, any other book with readings on its own.
  const elamite = display.locator(".settings-reading-row[data-course='course-linear-elamite']");
  await expect(elamite).toHaveCount(1);
  await expect(display.locator(".settings-reading-row[data-course='test-characters']")).toHaveCount(1);
  await expect(display.locator(".settings-reading-row[data-course='collins-spanish']")).toHaveCount(0);
  await expect(elamite.locator("select")).toHaveValue("always");
  await elamite.locator("select").selectOption("never");
  await expect.poll(async () => (await userByName(page.request, name)).prefs).toEqual({ readings: { "course-linear-elamite": "never" } });

  // Another device of the account: the same choice, on both of the course's books.
  const context = await browser.newContext({ storageState: await page.context().storageState() });
  const other = await context.newPage();
  await other.goto("/");
  await other.locator(".home, .players").first().waitFor();
  if (await other.locator(".players").isVisible()) await other.locator("button.player", { hasText: name }).click();
  await openActivity(other, "vocab-course-linear-elamite-letters");
  await expect(other.locator(".vocab-romaji .segment.on")).toHaveText("Jamais");
  await openActivity(other, "vocab-test-characters");
  await expect(other.locator(".vocab-romaji .segment.on")).toHaveText("Toujours");
  await other.click(".vocab-romaji >> text=Après la réponse");
  await expect.poll(async () => (await userByName(page.request, name)).prefs).toEqual({ readings: { "course-linear-elamite": "never", "test-characters": "after" } });
  await context.close();

  // Only what the choice may hold; 8.9.0's per-book choices fold into their course.
  expect((await page.request.put(`/api/users/${user.id}/prefs`, { data: { prefs: [] } })).status()).toBe(400);
  expect(
    (await page.request.put(`/api/users/${user.id}/prefs`, { data: { prefs: { reading: "loud", readings: { "Bad Id": "never", ok: "after" }, readingBooks: { "course-greek-letters": "never" }, x: 1 } } })).status(),
  ).toBe(204);
  expect((await userByName(page.request, name)).prefs).toEqual({ readings: { ok: "after", "course-greek": "never" } });
});

test("home: the characters books in a group of their own", async ({ page }) => {
  await newPlayer(page, "Chars");
  await goHome(page);
  const characters = page.locator(".activity-group[data-group='characters']");
  await expect(characters.locator(".activity-group-title")).toHaveText("Caractères");
  await expect(characters.locator("[data-activity='vocab-test-characters']")).toBeVisible();
  await expect(page.locator(".activity-group[data-group='languages'] [data-activity='vocab-test-characters']")).toHaveCount(0);
});
