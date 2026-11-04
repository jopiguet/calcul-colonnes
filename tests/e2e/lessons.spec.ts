import { expect, test, type Page } from "@playwright/test";
import { newPlayer, openActivity } from "./helpers";

/** The first Latin lesson, opened from the course page. */
async function firstLesson(page: Page): Promise<void> {
  await openActivity(page, "lessons-latin");
  await expect(page.locator(".lessons-home h1")).toContainText("Latin");
  await page.locator(".lessons-continue").click();
  await expect(page.locator(".lesson-title")).toContainText("1.");
}

const card = (page: Page, id: string) => page.locator(`.lesson-exercise[data-exercise='${id}']`);

test("a Latin lesson: strict, free and choice answers are marked and kept", async ({ page }) => {
  await newPlayer(page, "Lucia");
  await firstLesson(page);
  await expect(page.locator(".lesson-summary")).toBeVisible();
  await expect(page.locator(".lesson-vocab-table")).toBeVisible();

  // Strict answers: one wrong out of six; the expected answer is shown.
  const syllables = card(page, "syllables");
  for (const [i, v] of ["2", "3", "3", "2", "3", "4"].entries()) await syllables.locator(".lesson-input").nth(i).fill(v);
  await syllables.locator(".lesson-check").click();
  await expect(syllables.locator(".lesson-exercise-score")).toHaveText("5/6");
  await expect(syllables.locator(".lb-wrong")).toHaveCount(1);
  await expect(syllables.locator(".lesson-expected")).toContainText("5");

  // Choices: all right.
  const quantity = card(page, "quantity");
  for (const [i, n] of [1, 2, 0, 1, 2].entries()) await quantity.locator(".lesson-item").nth(i).locator(".lesson-option").nth(n).click();
  await quantity.locator(".lesson-check").click();
  await expect(quantity.locator(".lesson-exercise-score")).toHaveText("5/5");

  // A free answer that does not match a model: to check, then marked right by the player.
  const greetings = card(page, "greetings");
  await greetings.locator(".lesson-input").nth(0).fill("Bonjour !");
  await greetings.locator(".lesson-input").nth(1).fill("Adieu, mon ami");
  await greetings.locator(".lesson-check").click();
  await expect(greetings.locator(".lb-right")).toHaveCount(1);
  await expect(greetings.locator(".lb-check")).toHaveCount(1);
  await greetings.locator(".lesson-mark").first().click();
  await expect(greetings.locator(".lb-right")).toHaveCount(2);

  // Everything is kept: after a reload, on the course page and in the lesson.
  await page.reload();
  await openActivity(page, "lessons-latin");
  await expect(page.locator(".lessons-item").first().locator(".lessons-item-status")).toContainText("1/");
  await page.locator(".lessons-item").first().click();
  await expect(card(page, "syllables").locator(".lesson-exercise-score")).toHaveText("5/6");
  await expect(card(page, "greetings").locator(".lb-right")).toHaveCount(2);
});

test("the course vocabulary is a shared book", async ({ page }) => {
  await newPlayer(page, "Marcus");
  const books = (await (await page.request.get("/api/vocab/books")).json()) as { slug: string; visibility: string; lessons: unknown[] }[];
  const latin = books.find((b) => b.slug === "course-latin");
  expect(latin?.visibility).toBe("shared");
  expect(latin?.lessons.length).toBeGreaterThanOrEqual(31);
  await openActivity(page, "lessons-latin");
  await page.locator(".lessons-practise").click();
  await expect(page.locator(".vocab-lesson").first()).toBeVisible();
});

test("a lesson fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await newPlayer(page, "Tullia");
  await openActivity(page, "lessons-latin");
  await page.locator(".lessons-item").nth(29).click();
  await expect(page.locator(".lesson-title")).toContainText("30.");
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(wide).toBeLessThanOrEqual(1);
});
