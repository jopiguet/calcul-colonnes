import { expect, test, type Page } from "@playwright/test";
import { generateQuiz, type Level, type Question } from "../../shared/quiz/index.ts";
import { chooseTopics, newPlayer, openActivity, takeQuiz } from "./helpers";

/** The next test started in this page gets this seed. */
async function fixSeed(page: Page, seed: number): Promise<void> {
  await page.evaluate((value) => {
    const original = crypto.getRandomValues.bind(crypto);
    crypto.getRandomValues = <T extends ArrayBufferView | null>(array: T): T => {
      if (array instanceof Uint32Array && array.length === 1) {
        array[0] = value;
        return array;
      }
      return original(array as never) as T;
    };
  }, seed);
}

function seedWhere(level: Level, count: number, topics: string[], pick: (q: Question) => boolean): { seed: number; first: Question } {
  for (let seed = 1; ; seed++) {
    const quiz = generateQuiz({ seed, level, topics: topics as never, count });
    if (pick(quiz[0]!)) return { seed, first: quiz[0]! };
  }
}

test("the Cloudflare course: read from the settings, in the player's language, back to the test", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await newPlayer(page, "Reader");
  await openActivity(page, "cf");
  // On a large screen the button sits under the title, across both columns, and leaves no hole beside the settings.
  const open = await page.locator(".course-open").boundingBox();
  const what = await page.locator(".quiz-setup-what").boundingBox();
  const how = await page.locator(".quiz-setup-how").boundingBox();
  expect(what!.y).toBeGreaterThan(open!.y + open!.height);
  expect(Math.abs(what!.y - how!.y)).toBeLessThan(2);
  expect(what!.x).toBeLessThan(how!.x);
  expect(await page.$$eval(".segmented .segment", (bs) => bs.filter((b) => b.scrollWidth > b.clientWidth + 1).length)).toBe(0);
  await page.click("text=📖 Lire le cours");
  await expect(page.locator(".course-title")).toHaveText("Cloudflare — un cours complet");
  const toc = page.locator(".course-toc a");
  await expect(toc).toHaveCount(14);
  await expect(toc.nth(1)).toHaveText("Partie 1 — Fonctionnement de Cloudflare");
  // Tables, code and links come through; nothing is left as raw Markdown.
  await expect(page.locator(".course-table table").first()).toBeVisible();
  await expect(page.locator(".course-code").first()).toBeVisible();
  expect(await page.locator(".course-body").evaluate((n) => /\*\*|\]\(http|```/.test(n.textContent ?? ""))).toBe(false);
  await toc.nth(9).click();
  await expect(page.locator("#course-s9")).toBeInViewport();
  // Another language: the same course, translated.
  await page.selectOption(".language", "es");
  await expect(page.locator(".course-title")).toHaveText("Cloudflare — un curso completo");
  await page.click("text=← Volver al test");
  await expect(page.locator("h1")).toHaveText("Test: Cloudflare");
});

test("a wrong answer opens the part of the course that teaches it, on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  await newPlayer(page, "Learner");
  await openActivity(page, "cf");
  await page.click("text=Intermédiaire");
  await chooseTopics(page, ["Cache et performance"]);
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere("cfIntermediate", 5, ["cfCache"], () => true);
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  const wrong = first.correct === 0 ? 1 : 0;
  await takeQuiz(page, (i) => (i === 0 ? wrong : first.correct));
  const link = page.locator(".review-item").first().locator(".course-link");
  await expect(link).toHaveText("📖 Dans le cours : Partie 4 — Cache et performance");
  await link.click();
  await expect(page.locator("#course-s4")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/course-phone.png" });
  await page.click("text=← Retour au test");
  await expect(page.locator(".quiz-result h1")).toBeVisible();
});
