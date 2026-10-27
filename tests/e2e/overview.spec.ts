import { expect, test, type Page } from "@playwright/test";
import type { VocabBookInfo, VocabCard, VocabLessonWords, VocabProgress } from "../../shared/types.ts";
import { goHome, newPlayer, openActivity, takeQuiz, userByName } from "./helpers";

async function noSidewaysScroll(page: Page, width: number): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
}

test("the home page uses a wide screen: small groups side by side; one column on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await newPlayer(page, "Wid");
  await goHome(page);
  const top = async (title: string): Promise<number> =>
    (await page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: new RegExp(`^${title}$`) }) }).boundingBox())!.y;
  // Mathematics (two cards) and Sciences (one) on the same row; Computing (Linux, SQL) on the next.
  expect(Math.abs((await top("Mathématiques")) - (await top("Sciences")))).toBeLessThan(2);
  expect(await top("Informatique")).toBeGreaterThan(await top("Sciences"));
  expect(await page.locator("#app").evaluate((a) => a.getBoundingClientRect().width)).toBeGreaterThan(1000);
  await noSidewaysScroll(page, 1400);

  await page.setViewportSize({ width: 360, height: 740 });
  expect(await top("Sciences")).toBeGreaterThan(await top("Mathématiques"));
  await noSidewaysScroll(page, 360);
  // Other pages keep the narrow column.
  await openActivity(page, "columns");
  await page.setViewportSize({ width: 1400, height: 900 });
  expect(await page.locator("#app").evaluate((a) => a.getBoundingClientRect().width)).toBeLessThan(600);
});

test("progress: an overview of every activity, each activity's own page inside it", async ({ page }) => {
  const name = await newPlayer(page, "Ovr");
  const user = await userByName(page.request, name);
  expect((await page.request.post("/api/attempts", { data: { userId: user.id, maximum: 20, operator: "+", top: 3, bottom: 4, given: 7 } })).status()).toBe(201);
  expect((await page.request.post("/api/attempts", { data: { userId: user.id, maximum: 20, operator: "+", top: 3, bottom: 5, given: 7 } })).status()).toBe(201);

  // A quiz, then its own progress page from inside it.
  await openActivity(page, "quiz");
  await page.click("text=Commencer le test");
  await takeQuiz(page, (i) => i % 4);
  await page.click("text=📈 Mes progrès");
  await expect(page.locator(".progress-page.is-maths h2").first()).toHaveText("📐 QCM");
  await expect(page.locator(".progress-page .skill").first()).toBeVisible();
  await expect(page.locator(".progress-page")).not.toContainText("Calcul en colonnes");
  await page.locator(".progress-page > button.primary").click();
  await page.locator(".quiz-setup, .quiz-result, .quiz").first().waitFor();

  // Column arithmetic: its own page from inside it.
  await openActivity(page, "columns");
  await page.click(".columns-progress");
  await expect(page.locator(".progress-page.is-columns table.scores tr")).toHaveCount(2);
  await expect(page.locator(".progress-page.is-columns")).toContainText("1/2");
  await page.locator(".progress-page > button.primary").click();
  await page.locator(".board").waitFor();

  // The overview, from the top bar: today, then a card per activity.
  await goHome(page);
  await page.click(".home-progress");
  const overview = page.locator(".progress-page.is-all");
  await expect(overview).toContainText("1 calculs justes sur 2");
  await expect(overview.locator(".progress-card[data-activity='columns']")).toContainText("1 justes sur 2 · 50 %");
  await expect(overview.locator(".progress-card[data-activity='quiz'] .progress-skill-bar")).toHaveCount(1);
  await expect(overview.locator(".progress-card[data-activity='chemistry']")).toContainText("Pas encore commencé.");
  const books = (await (await page.request.get("/api/vocab/books")).json()) as VocabBookInfo[];
  await expect(overview.locator(".progress-card[data-activity^='vocab-']")).toHaveCount(books.length);
  // An activity's details, then back to the overview.
  await overview.locator(".progress-card[data-activity='quiz'] button").click();
  await expect(page.locator(".progress-page.is-maths")).toBeVisible();
  await page.locator(".progress-page > button.primary", { hasText: "← Tout le progrès" }).click();
  await expect(page.locator(".progress-page.is-all")).toBeVisible();
  await page.locator(".progress-page > button.primary").click();
  await page.locator(".home").waitFor();
});

test("a lesson's words: see them, skip one, it no longer comes up, put it back", async ({ page }) => {
  const name = await newPlayer(page, "Wrd");
  const user = await userByName(page.request, name);
  const books = (await (await page.request.get("/api/vocab/books")).json()) as VocabBookInfo[];
  const book = books.find((b) => b.slug === "collins-spanish")!;
  const lesson = book.lessons[0]!;
  const section = lesson.sections[0]!;

  await openActivity(page, "vocab-collins-spanish");
  await page.locator(".vocab-lesson summary").first().click();
  await page.locator(".vocab-words-link").first().click();
  await expect(page.locator(".vocab-words-page h1")).toHaveText("Les mots de la leçon");
  await expect(page.locator(".vocab-word")).toHaveCount(lesson.sections.reduce((n, s) => n + s.entries, 0));
  await expect(page.locator(".vocab-word").first().locator(".vocab-word-status")).toHaveText("nouveau");

  // Skip the first word, by keyboard: the button keeps the focus.
  const first = page.locator(".vocab-word").first();
  const entryId = Number(await first.getAttribute("data-entry"));
  await first.locator(".vocab-skip").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".vocab-word").first()).toHaveClass(/is-skipped/);
  await expect(page.locator(".vocab-word").first().locator(".vocab-skip")).toHaveText("Remettre");
  await expect(page.locator(".vocab-word").first().locator(".vocab-skip")).toBeFocused();
  const words = (await (await page.request.get(`/api/vocab/lessons/${lesson.id}/words?userId=${user.id}&lang=fr`)).json()) as VocabLessonWords;
  expect(words.sections[0]!.words.find((w) => w.id === entryId)!.skipped).toBe(true);

  // It no longer comes up, and the book counts it apart.
  const cards = (await (
    await page.request.get(`/api/vocab/session?userId=${user.id}&kind=section&id=${section.id}&purpose=learn&size=60&mode=choice`)
  ).json()) as VocabCard[];
  expect(cards.length).toBeGreaterThan(0);
  expect(cards.some((c) => c.entryId === entryId)).toBe(false);
  const progress = (await (await page.request.get(`/api/vocab/progress?userId=${user.id}&since=0`)).json()) as VocabProgress;
  expect(progress.sections[section.id]!.skipped).toBe(1);
  expect(progress.sections[section.id]!.new).toBe(section.entries - 1);

  await page.locator(".vocab-words-page > button.primary").click();
  await page.locator(".vocab-lesson summary").first().waitFor();
  // The lesson stays open, as it was left.
  await expect(page.locator(".vocab-lesson").first()).toHaveAttribute("open", "");
  await expect(page.locator(".vocab-section").first()).toContainText("1 passés");

  // Put it back.
  await page.locator(".vocab-words-link").first().click();
  await page.locator(".vocab-word").first().locator(".vocab-skip").click();
  await expect(page.locator(".vocab-word").first()).not.toHaveClass(/is-skipped/);
  const back = (await (await page.request.get(`/api/vocab/progress?userId=${user.id}&since=0`)).json()) as VocabProgress;
  expect(back.sections[section.id]!.skipped).toBe(0);

  // Only one's own players, and only known entries.
  expect((await page.request.put("/api/vocab/skips", { data: { userId: user.id, entryId: 999999, skipped: true } })).status()).toBe(404);
  expect((await page.request.put("/api/vocab/skips", { data: { userId: user.id, entryId, skipped: "yes" } })).status()).toBe(400);
  await noSidewaysScroll(page, 430);
});
