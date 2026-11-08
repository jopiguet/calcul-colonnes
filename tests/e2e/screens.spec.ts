import { expect, test } from "@playwright/test";
import { newPlayer, openActivity } from "./helpers";

test.describe("a computer", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("a book's reviews and settings stand beside its lessons; a question uses more of the width", async ({ page }) => {
    await newPlayer(page, "Grace");
    await openActivity(page, "vocab-test-english");
    const side = (await page.locator(".vocab-home-side").boundingBox())!;
    const lessons = (await page.locator(".vocab-lessons").boundingBox())!;
    expect(lessons.x).toBeGreaterThan(side.x + side.width);
    expect(Math.abs(lessons.y - side.y)).toBeLessThan(40);
    await openActivity(page, "rust");
    await page.click("text=Commencer le test");
    expect((await page.locator("#app").boundingBox())!.width).toBeGreaterThan(680);
  });
});

test.describe("a tablet held upright", () => {
  test.use({ viewport: { width: 820, height: 1180 }, hasTouch: true });

  test("one column, wider than a phone's", async ({ page }) => {
    await newPlayer(page, "Ada");
    await openActivity(page, "vocab-test-english");
    const side = (await page.locator(".vocab-due").boundingBox())!;
    const lessons = (await page.locator(".vocab-lessons").boundingBox())!;
    expect(lessons.y).toBeGreaterThan(side.y + side.height);
    expect((await page.locator("#app").boundingBox())!.width).toBeGreaterThan(600);
  });
});

test.describe("a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("the book's page as before: the reviews, the settings, then the lessons, nothing wider than the screen", async ({ page }) => {
    await newPlayer(page, "Mary");
    await openActivity(page, "vocab-test-english");
    const how = (await page.locator(".vocab-order").boundingBox())!;
    const lessons = (await page.locator(".vocab-lessons").boundingBox())!;
    expect(lessons.y).toBeGreaterThan(how.y + how.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
