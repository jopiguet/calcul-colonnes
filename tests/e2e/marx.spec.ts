import { expect, test, type Page } from "@playwright/test";
import { generateQuiz, topicsFor, type Level, type Question } from "../../shared/quiz/index.ts";
import { MARX_MISTAKES } from "../../src/quiz-i18n-marx.ts";
import { chooseTopics, goHome, newPlayer, openActivity, profileOf, rebuild, takeQuiz } from "./helpers";

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

test("Capital: its card under Economics, three levels, three groups, its course", async ({ page }) => {
  await newPlayer(page, "Kapital");
  await goHome(page);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Économie" }) });
  await expect(group.locator("[data-activity='marx']")).toContainText("⚒️ Le Capital");
  await openActivity(page, "marx");
  await expect(page.locator(".activity-bar-title")).toHaveText("⚒️ Le Capital");
  await expect(page.locator("h1")).toHaveText("QCM : Le Capital de Marx");
  await expect(page.locator(".quiz-setup .segmented").first().locator(".segment")).toHaveText(["Débutant", "Intermédiaire", "Avancé"]);
  await expect(page.locator(".topic-group-name")).toHaveText(["Livre I : valeur et plus-value", "Livre I : production et accumulation", "Livres II et III"]);
  await expect(page.locator(".topics .topic")).toHaveCount(12);
  for (const level of ["marxBeginner", "marxIntermediate", "marxAdvanced"] as const) expect(topicsFor(level).every((t) => t.startsWith("marx"))).toBe(true);
  // The course: fifteen sections, formulas typeset, nothing left as raw Markdown or TeX.
  await page.click("text=📖 Lire le cours");
  await expect(page.locator(".course-title")).toHaveText("Le Capital de Marx — un cours en douze parties");
  await expect(page.locator(".course-toc a")).toHaveCount(15);
  await expect(page.locator(".course-body .katex").first()).toBeVisible();
  expect(await page.locator(".course-body").evaluate((n) => /\*\*|\]\(http|\$\$/.test(n.textContent ?? ""))).toBe(false);
  await page.selectOption(".language", "es");
  await expect(page.locator(".course-title")).toHaveText("El capital de Marx — un curso en doce partes");
  await page.click("text=← Volver al test");
  await expect(page.locator("h1")).toHaveText("Test: El capital de Marx");
});

test("the rate of profit on a phone: graded on the server, the slip named, the course part linked", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  const name = await newPlayer(page, "Profit");
  await openActivity(page, "marx");
  await chooseTopics(page, ["Profit et prix de production"]);
  await page.locator(".count button").first().click();
  const isProfitRate = (q: Question) => q.verify.kind === "marx" && q.verify.model.type === "profitRate";
  const { seed, first } = seedWhere("marxBeginner", 5, ["marxProfit"], isProfitRate);
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz-prompt")).toContainText("taux de profit");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const slip = first.options.findIndex((o, i) => i !== first.correct && o.mistake !== undefined);
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? slip : first.correct));
  expect(body.level).toBe("marxBeginner");
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");
  const review = page.locator(".review-item").first();
  await expect(review).toHaveClass(/bad/);
  await expect(review).toContainText(MARX_MISTAKES.fr[first.options[slip]!.mistake as keyof (typeof MARX_MISTAKES)["fr"]]);
  const profile = await profileOf(page.request, name);
  expect(profile.mistakes.some((m) => m.mistake === first.options[slip]!.mistake)).toBe(true);

  const link = review.locator(".course-link");
  await expect(link).toHaveText("📖 Dans le cours : Partie 11 — Profit, prix de production et baisse du taux de profit");
  await link.click();
  await expect(page.locator("#course-s11")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/marx-phone.png" });
});
