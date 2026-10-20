import { expect, test, type Page } from "@playwright/test";
import { goHome, newPlayer, openActivity, takeQuiz } from "./helpers";

const LANGUAGES = [
  { code: "fr", vocabTab: "💬 Vocabulaire", quizTab: "📐 QCM", start: "Commencer le test", progress: "📈 Mes progrès", title: "Luma – Mon cahier" },
  { code: "es", vocabTab: "💬 Vocabulario", quizTab: "📐 Test", start: "Empezar el test", progress: "📈 Mi progreso", title: "Luma – Mi cuaderno" },
  { code: "en", vocabTab: "💬 Vocabulary", quizTab: "📐 Quiz", start: "Start the quiz", progress: "📈 My progress", title: "Luma – My exercise book" },
];

/** No missing translation: no placeholder or "undefined" left in the page. */
async function expectClean(page: Page): Promise<void> {
  const text = await page.locator("#app").innerText();
  expect(text).not.toMatch(/undefined|\{\w+\}/);
}

for (const lang of LANGUAGES) {
  test(`every screen is translated: ${lang.code}`, async ({ page }) => {
    await newPlayer(page, `L${lang.code}`);
    await page.selectOption(".language", lang.code);
    await expect(page.locator("html")).toHaveAttribute("lang", lang.code);
    await expect(page).toHaveTitle(lang.title);
    await expectClean(page);

    await openActivity(page, "quiz");
    await expectClean(page);
    await page.click(`text=${lang.start}`);
    await expectClean(page);
    await takeQuiz(page, (i) => i % 4);
    await expectClean(page);
    await page.click(`text=${lang.progress}`);
    await page.locator(".progress-page").waitFor();
    await expectClean(page);

    await page.locator(".progress-page > button.primary").click(); // back to the player's screen
    await openActivity(page, "vocab-collins-spanish");
    await page.locator(".vocab-lesson summary").first().click();
    await expectClean(page);
    await page.locator(".vocab-section button").first().click();
    await page.locator(".choice").first().click();
    await page.locator(".vocab-verdict").waitFor();
    await expectClean(page);
    await page.locator(".vocab-card .actions button.ghost").click();
    await page.locator(".vocab-done").waitFor();
    await expectClean(page);

    // The home page and the English book.
    await goHome(page);
    await expectClean(page);
    await openActivity(page, "vocab-test-english");
    await expectClean(page);
  });
}

test("the browser language is used on a first visit", async ({ browser }) => {
  const context = await browser.newContext({ locale: "en-US" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator(".hero-title")).toHaveText("Column arithmetic, the way it's written in the exercise book.");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await context.close();
});
