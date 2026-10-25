import { expect, test } from "@playwright/test";
import { goHome, signIn, signUp, uniqueName, PASSWORD } from "./helpers";
import { TOUR_TEXTS, tourSteps } from "../../src/tour-texts.ts";

const ACCOUNT_STEPS = tourSteps(false, "fr");
const PLAYER_STEPS = tourSteps(true, "fr");

test("a new account sees the guided tour once, page by page, and finishing it is kept", async ({ page }) => {
  await signUp(page, undefined, PASSWORD, "keep");
  await expect(page).toHaveURL(/#tour$/);
  await expect(page.locator(".tour-title")).toHaveText("Bienvenue sur Luma");
  await expect(page.locator(".tour-count")).toHaveText(`1 / ${ACCOUNT_STEPS.length}`);
  await expect(page.locator(".tour-dot")).toHaveCount(ACCOUNT_STEPS.length);
  await expect(page.locator(".tour-previous")).toBeDisabled();

  // Forward with the button and the keyboard, back with ←.
  await page.click(".tour-next");
  await expect(page.locator(".tour-body")).toHaveAttribute("data-step", "players");
  await expect(page.locator(".tour-chip")).toContainText(["Qui joue ?", "🏆 Scores"]);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".tour-body")).toHaveAttribute("data-step", ACCOUNT_STEPS[2]!.id);
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".tour-body")).toHaveAttribute("data-step", "players");

  // A change of language keeps the page.
  await page.selectOption(".language", "en");
  await expect(page.locator(".tour-title")).toHaveText("One account, several players");
  await page.selectOption(".language", "fr");

  for (let i = 1; i < ACCOUNT_STEPS.length - 1; i++) await page.click(".tour-next");
  await expect(page.locator(".tour-body")).toHaveAttribute("data-step", "go");
  await expect(page.locator(".tour-skip")).toHaveCount(0);
  const done = page.waitForResponse((r) => r.url().endsWith("/api/auth/onboarded") && r.request().method() === "POST");
  await page.click(".tour-next"); // Commencer
  expect((await done).status()).toBe(204);
  await expect(page.locator(".new-player input")).toBeVisible(); // no player yet: "Qui joue ?"
  await expect(page).toHaveURL(/\/$/);

  // Not again on the next visit.
  await page.reload();
  await expect(page.locator(".new-player input")).toBeVisible();
  await expect(page.locator(".tour")).toHaveCount(0);
  const session = (await (await page.request.get("/api/auth/session")).json()) as { onboarded: boolean };
  expect(session.onboarded).toBe(true);
});

test("skipped, then opened again from the footer of the home page, and left with the back button", async ({ page }) => {
  await signUp(page, undefined, PASSWORD, "keep");
  await page.click(".tour-skip");
  await expect(page.locator(".tour")).toHaveCount(0);
  await page.fill(".new-player input", uniqueName("Tour"));
  await page.keyboard.press("Enter");
  await goHome(page);

  const link = page.locator(".app-footer .tour-link");
  await expect(link).toHaveText(TOUR_TEXTS.fr.link);
  await link.click();
  await expect(page.locator(".tour-title")).toHaveText("Bienvenue sur Luma");
  await expect(page.locator(".tour-count")).toHaveText(`1 / ${ACCOUNT_STEPS.length}`);
  await page.click(".tour-next");
  await page.goBack();
  await expect(page.locator(".tour")).toHaveCount(0);
  await expect(page.locator(".app-footer .tour-link")).toBeVisible(); // back on the home page

  // Opened again, it starts on its first page; finishing goes home.
  await page.locator(".app-footer .tour-link").click();
  await expect(page.locator(".tour-count")).toHaveText(`1 / ${ACCOUNT_STEPS.length}`);
  await page.click(".tour-skip");
  await expect(page.locator(".app-footer .tour-link")).toBeVisible();
});

test("a phone: the tour fits, and a top-bar button leaves it", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  await signUp(page, undefined, PASSWORD, "keep");
  for (let i = 0; i < ACCOUNT_STEPS.length; i++) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `page ${i + 1}`).toBe(true);
    if (i < ACCOUNT_STEPS.length - 1) await page.click(".tour-next");
  }
  await page.click(".icon-chip"); // ⚙️: the account page
  await expect(page.locator(".account")).toBeVisible();
  await expect(page.locator(".tour")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".tour")).toHaveCount(0);
});

test("a player's own login: the tour of their own, without the account's pages", async ({ page, browser }) => {
  await signUp(page);
  const name = uniqueName("Kid");
  await page.fill(".new-player input", name);
  await page.keyboard.press("Enter");
  const player = (await (await page.request.get("/api/users")).json()) as { id: number }[];
  const username = `kid${Date.now().toString(36)}`;
  expect((await page.request.post(`/api/auth/players/${player[0]!.id}/password`, { data: { username, password: PASSWORD } })).status()).toBe(201);

  const kid = await (await browser.newContext()).newPage();
  await signIn(kid, username, PASSWORD, true);
  await expect(kid.locator(".tour-count")).toHaveText(`1 / ${PLAYER_STEPS.length}`);
  await kid.click(".tour-next");
  await expect(kid.locator(".tour-body")).toHaveAttribute("data-step", "own-login");
  await expect(kid.locator(".tour-chip")).toHaveText(["🚪"]);
  for (let i = 1; i < PLAYER_STEPS.length; i++) await kid.click(".tour-next");
  await expect(kid.locator(".tour")).toHaveCount(0);
  await expect(kid.locator(".app-footer .tour-link")).toBeVisible(); // the player's home page
  await kid.reload();
  await expect(kid.locator(".tour")).toHaveCount(0);
  await kid.context().close();
});
