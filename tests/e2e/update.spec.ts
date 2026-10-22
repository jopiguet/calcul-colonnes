import { expect, test } from "@playwright/test";
import { goHome, newPlayer, openActivity } from "./helpers";

/** The server's version.json, answered with another build: a new version is out. */
async function newBuildOut(page: import("@playwright/test").Page): Promise<void> {
  await page.route("**/version.json", (route) => route.fulfill({ json: { version: "9.9.9", build: "9.9.9+test" } }));
}

test("the page and version.json are always checked; the built files are kept", async ({ request }) => {
  for (const path of ["/", "/version.json", "/manifest.webmanifest"]) {
    expect((await request.head(path)).headers()["cache-control"], path).toBe("no-cache");
  }
  const html = await (await request.get("/")).text();
  const script = /src="(\/assets\/[^"]+\.js)"/.exec(html)![1]!;
  expect((await request.head(script)).headers()["cache-control"]).toContain("immutable");
  expect((await request.get("/api/auth/options")).headers()["cache-control"]).toBe("no-store");
  const version = (await (await request.get("/version.json")).json()) as { build: string };
  expect(version.build).toMatch(/^\d+\.\d+\.\d+\+/);
});

test("a new version reloads a quiet window by itself", async ({ page }) => {
  await newPlayer(page, "Upd");
  await goHome(page);
  await page.evaluate(() => ((window as unknown as { marker: boolean }).marker = true));
  await newBuildOut(page);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await page.waitForFunction(() => !(window as unknown as { marker?: boolean }).marker, null, { timeout: 10_000 });
  await page.locator(".home").waitFor();
});

test("during a vocabulary session, a new version waits for a button", async ({ page }) => {
  await newPlayer(page, "Upw");
  await openActivity(page, "vocab-test-english");
  const lesson = page.locator(".vocab-lesson").first();
  if (!(await lesson.evaluate((d) => (d as HTMLDetailsElement).open))) await lesson.locator("summary").click();
  await lesson.locator(".vocab-section button").first().click();
  await page.locator(".vocab-card").waitFor();
  await newBuildOut(page);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  const banner = page.locator(".update-banner");
  await expect(banner).toContainText("Une nouvelle version de Luma est prête.");
  await expect(page.locator(".vocab-card")).toBeVisible(); // the session is still there
  await Promise.all([page.waitForEvent("load"), banner.locator("button").click()]);
});

test("during a dice experiment, a new version waits for a button", async ({ page }) => {
  await newPlayer(page, "Upd2");
  await openActivity(page, "discover-dice");
  await page.locator(".discover-sums .segment").nth(5).click();
  await page.locator(".discover-step > button.primary").click();
  await page.click("[data-focus=roll-100]");
  await newBuildOut(page);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.locator(".update-banner")).toBeVisible();
  await expect(page.locator(".discover-status")).toContainText("100");
});

test("during an unfinished grid, a new version waits for a button", async ({ page }) => {
  await newPlayer(page, "Upd3");
  await openActivity(page, "discover-puzzles");
  const free = page.locator(".puzzle-cell:not(.is-given)").first();
  await free.click();
  await page.keyboard.press("1");
  await newBuildOut(page);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.locator(".update-banner")).toBeVisible();
  await expect(free.locator(".cell-value")).toHaveText("1");
});

test("inside an activity, even with nothing under way, a new version waits for the way home", async ({ page }) => {
  await newPlayer(page, "Upd4");
  // A lab still at its prediction step: nothing to lose, but the player is in it.
  await openActivity(page, "discover-pendulum");
  await page.evaluate(() => ((window as unknown as { marker: boolean }).marker = true));
  await newBuildOut(page);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.locator(".update-banner")).toBeVisible();
  // Coming back to the window does not redraw it either.
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  expect(await page.evaluate(() => (window as unknown as { marker?: boolean }).marker)).toBe(true);
  await expect(page.locator(".discover-lab")).toBeVisible();
  // Back home: the update is applied then.
  await Promise.all([page.waitForEvent("load"), page.locator(".activity-bar button").first().click()]);
  await page.locator(".home").waitFor();
});

test("going home, the screen being left keeps its width until the home page is ready", async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await newPlayer(page, "Wid2");
  await openActivity(page, "discover-pendulum");
  const width = (): Promise<number> => page.locator("#app").evaluate((a) => a.getBoundingClientRect().width);
  expect(await width()).toBeLessThan(600);
  // The home page waits for its data: meanwhile the lab must not be stretched.
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/api/**", async (route) => {
    await held;
    await route.continue();
  });
  await page.locator(".activity-bar button").first().click();
  await page.waitForTimeout(300);
  await expect(page.locator(".discover-lab")).toBeVisible();
  expect(await width()).toBeLessThan(600);
  release();
  await page.locator(".home").waitFor();
  expect(await width()).toBeGreaterThan(1000);
});
