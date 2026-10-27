import { expect, test, type Page } from "@playwright/test";
import { goHome, newPlayer, openActivity } from "./helpers";

/**
 * Workbook exercises (docs/exercises.md), on the invented book of
 * tests/e2e/fixtures/exercise-book (made by make-exercise-book.py).
 */

const BOOK = "workbook-test-workbook";

async function openUnit(page: Page, unit: number): Promise<void> {
  await openActivity(page, BOOK);
  await page.locator(`.workbook-unit[data-unit='${unit}']`).click();
  await page.locator(".workbook-exercise").first().waitFor();
}

const exercise = (page: Page, id: string) => page.locator(`.workbook-exercise[data-exercise='${id}']`);
const gap = (page: Page, id: string, item: string, slot = 0) => exercise(page, id).locator(`.workbook-gap[data-item='${item}']`).nth(slot);
const field = (page: Page, id: string, item: string) => exercise(page, id).locator(`.workbook-input[data-item='${item}']`);

test("a workbook: its card, its units, the gaps on the page and the fields under it", async ({ page }) => {
  await newPlayer(page, "Book");
  await goHome(page);
  // A group of their own, after the vocabulary; chemistry and biology come last.
  const titles = await page.locator(".activity-group-title").allTextContents();
  expect(titles.indexOf("Exercices des livres")).toBe(titles.indexOf("Langues") + 1);
  expect(titles.at(-1)).toBe("Chimie et biologie");
  const languages = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Langues" }) });
  await expect(languages.locator(`[data-activity='${BOOK}']`)).toHaveCount(0);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Exercices des livres" }) });
  await expect(group.locator(`[data-activity='${BOOK}']`)).toContainText("✏️ Test Workbook");
  await expect(group.locator(`[data-activity='${BOOK}'] .activity-status`)).toHaveText("4 exercices");
  await openActivity(page, BOOK);
  await expect(page.locator("h1")).toHaveText("A workbook written for the tests");
  await expect(page.locator(".workbook-unit")).toHaveCount(2);
  await expect(page.locator(".workbook-unit").first()).toContainText("Past and present");
  await expect(page.locator(".workbook-unit").first()).toContainText("3 exercices");
  await page.locator(".workbook-unit[data-unit='1']").click();
  await expect(page.locator(".workbook-title")).toHaveText("Unité 1 · Past and present");
  // 1.1: one field per dotted line, two for item 3, none for the worked example.
  await expect(exercise(page, "1.1").locator(".workbook-gap")).toHaveCount(4);
  await expect(exercise(page, "1.1").locator(".workbook-gap[data-item='3']")).toHaveCount(2);
  await expect(exercise(page, "1.1").locator(".workbook-gap[data-item='1']")).toHaveCount(0);
  // 1.2 has no gap on its page: a field per item under it.
  await expect(exercise(page, "1.2").locator(".workbook-input")).toHaveCount(3);
  // Each field sits on its dotted line, inside the image.
  const sheet = await exercise(page, "1.1").locator(".workbook-sheet").boundingBox();
  const box = await gap(page, "1.1", "2").boundingBox();
  expect(box!.x).toBeGreaterThan(sheet!.x + sheet!.width * 0.1);
  expect(box!.y + box!.height).toBeLessThan(sheet!.y + sheet!.height);
});

test("the unit corrected at the end: right, wrong, several gaps, letters, a rewrite, free answers", async ({ page }) => {
  await newPlayer(page, "Check");
  await openUnit(page, 1);
  // Nothing corrected before the end.
  await expect(page.locator(".workbook-key")).toHaveCount(0);
  await gap(page, "1.1", "2").fill("Jumped");
  await gap(page, "1.1", "3", 0).fill("cooked");
  await gap(page, "1.1", "3", 1).fill("cleaned");
  await gap(page, "1.1", "4").fill("was");
  await field(page, "1.2", "1").fill("a");
  await field(page, "1.2", "2").fill("b");
  await field(page, "1.2", "3").fill("I’ve lived here since May");
  await field(page, "1.3", "1").fill("I played chess.");
  await page.locator(".workbook-check").click();
  await expect(page.locator(".workbook-unit-score")).toHaveText("Unité corrigée : 4 sur 6 (67 %)");
  await expect(exercise(page, "1.1").locator(".workbook-exercise-score")).toHaveText("2/3");
  await expect(gap(page, "1.1", "2")).toHaveClass(/wb-right/);
  await expect(gap(page, "1.1", "4")).toHaveClass(/wb-wrong/);
  const wrong = exercise(page, "1.1").locator(".workbook-key-item[data-item='4']");
  await expect(wrong).toContainText("were");
  await expect(wrong).toContainText("Ta réponse : was");
  await expect(exercise(page, "1.2").locator(".workbook-exercise-score")).toHaveText("2/3");
  // Free answers: the example shown, marked by the player.
  await expect(exercise(page, "1.3").locator(".workbook-key-note").first()).toHaveText("Example answers:");
  await expect(exercise(page, "1.3").locator(".workbook-key-item[data-item='1']")).toContainText("I went to the pool.");
  await exercise(page, "1.3").locator(".workbook-key-item[data-item='1'] .workbook-mark-right").click();
  await expect(page.locator(".workbook-unit-score")).toHaveText("Unité corrigée : 5 sur 7 (71 %)");
  // "I was right": the player's say counts.
  await exercise(page, "1.2").locator(".workbook-key-item[data-item='2'] .workbook-i-was-right").click();
  await expect(exercise(page, "1.2").locator(".workbook-exercise-score")).toHaveText("3/3");
  await expect(exercise(page, "1.2").locator(".workbook-key-item[data-item='2']")).toContainText("noté par toi");
  // Corrected again after a change: the right answer now.
  await gap(page, "1.1", "4").fill("were");
  await page.locator(".workbook-check").click();
  await expect(exercise(page, "1.1").locator(".workbook-exercise-score")).toHaveText("3/3");
  // The book's page counts the unit.
  await page.locator(".workbook-nav button").first().click();
  await expect(page.locator(".workbook-unit[data-unit='1'] .workbook-unit-status")).toHaveText("3/3 · 100 %");
  await expect(page.locator(".workbook-progress")).toContainText("3 exercices corrigés sur 4");
});

test("answers are kept as they are typed, and a unit can start again", async ({ page }) => {
  await newPlayer(page, "Draft");
  await openUnit(page, 2);
  await gap(page, "2.1", "2").fill("mice");
  await expect(page.locator(".workbook-save")).toHaveText("Enregistré");
  await page.reload();
  await openUnit(page, 2);
  await expect(gap(page, "2.1", "2")).toHaveValue("mice");
  await page.locator(".workbook-check").click();
  await expect(page.locator(".workbook-unit-score")).toHaveText("Unité corrigée : 1 sur 3 (33 %)");
  page.once("dialog", (d) => void d.accept());
  await page.locator(".workbook-restart").click();
  await expect(page.locator(".workbook-unit-score")).toHaveCount(0);
  await expect(gap(page, "2.1", "2")).toHaveValue("");
});

test("on a phone, the page scrolls inside its frame, not the screen", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  await newPlayer(page, "Phone");
  await openUnit(page, 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await gap(page, "1.1", "2").fill("jumped");
  await expect(gap(page, "1.1", "2")).toHaveValue("jumped");
});

test("the exercises' routes: a player of another account, an unknown book", async ({ page }) => {
  await newPlayer(page, "Routes");
  const other = await page.request.get("/api/exercises/books/test-workbook/units/1?userId=1");
  expect(other.status()).toBe(404);
  const users = (await (await page.request.get("/api/users")).json()) as { id: number }[];
  const unknown = await page.request.get(`/api/exercises/books/no-such-book/units/1?userId=${users[0]!.id}`);
  expect(unknown.status()).toBe(404);
  // The key is not sent before the correction.
  const unit = (await (await page.request.get(`/api/exercises/books/test-workbook/units/1?userId=${users[0]!.id}`)).json()) as Record<string, unknown>;
  expect(JSON.stringify(unit)).not.toContain("jumped");
});
