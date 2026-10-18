import { expect, test, type Page } from "@playwright/test";
import { newPlayer, takeQuiz } from "./helpers";

const LANGUAGES = [
  { code: "fr", quizTab: "📐 QCM", start: "Commencer le test", progress: "📈 Mes progrès", title: "Calcul en colonnes" },
  { code: "es", quizTab: "📐 Test", start: "Empezar el test", progress: "📈 Mi progreso", title: "Cálculo en columnas" },
  { code: "en", quizTab: "📐 Quiz", start: "Start the quiz", progress: "📈 My progress", title: "Column arithmetic" },
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

    await page.click(`text=${lang.quizTab}`);
    await expectClean(page);
    await page.click(`text=${lang.start}`);
    await expectClean(page);
    await takeQuiz(page, (i) => i % 4);
    await expectClean(page);
    await page.click(`text=${lang.progress}`);
    await page.locator(".progress-page").waitFor();
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
