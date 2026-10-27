import { expect, test, type Page } from "@playwright/test";
import { generateQuiz, topicsFor, type Level, type Question } from "../../shared/quiz/index.ts";
import { chooseTopics, goHome, newPlayer, openActivity, profileOf, rebuild, takeQuiz } from "./helpers";
import { CF_MISTAKES } from "../../src/quiz-i18n-cf.ts";

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

test("Cloudflare: its card under Computing, four levels, three groups", async ({ page }) => {
  await newPlayer(page, "Flare");
  await goHome(page);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Informatique" }) });
  await expect(group.locator("[data-activity='cf']")).toContainText("🔶 Cloudflare");
  await openActivity(page, "cf");
  await expect(page.locator(".activity-bar-title")).toHaveText("🔶 Cloudflare");
  await expect(page.locator("h1")).toHaveText("QCM : Cloudflare");
  await expect(page.locator(".levels-four .segment")).toHaveText(["Débutant", "Intermédiaire", "Avancé", "Expert"]);
  await expect(page.locator(".topic-group-name")).toHaveText(["Réseau et sécurité", "Plateforme développeur", "Zero Trust et IA"]);
  await expect(page.locator(".topics .topic")).toHaveCount(topicsFor("cfBeginner").length);
  await page.click("text=Expert");
  await expect(page.locator(".topics .topic")).toHaveCount(topicsFor("cfExpert").length);
});

test("a rules-language expression on a phone, graded on the server, a slip named", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  const name = await newPlayer(page, "Rules");
  await openActivity(page, "cf");
  await page.click("text=Intermédiaire");
  await chooseTopics(page, ["WAF, règles, bots"]);
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere("cfIntermediate", 5, ["cfSecurity"], (q) => q.skill === "cfSecurity.ruleMatch");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  if (first.verify.kind !== "cf") throw new Error("not a generated question");
  await expect(page.locator(".quiz-prompt")).toContainText("shop.example.com");
  const code = page.locator(".quiz pre.quiz-code");
  await expect(code).toHaveText(first.prompt.code!);
  const widths = await code.evaluate((n) => [n.scrollWidth, n.clientWidth]);
  expect(widths[0], `expression ${widths[0]} px in ${widths[1]} px`).toBeLessThanOrEqual(widths[1]! + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const slip = first.options.findIndex((o, i) => i !== first.correct && o.mistake !== undefined);
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? slip : 0));
  expect(body.level).toBe("cfIntermediate");
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");
  const review = page.locator(".review-item").first();
  await expect(review).toHaveClass(/bad/);
  await expect(review).toContainText(CF_MISTAKES.fr[first.options[slip]!.mistake as keyof (typeof CF_MISTAKES)["fr"]]);
  const profile = await profileOf(page.request, name);
  expect(profile.mistakes.some((m) => m.mistake === first.options[slip]!.mistake)).toBe(true);
});

test("Access policies at Expert: the deciding policy, on a phone, checked like any test", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  await newPlayer(page, "Gate");
  await openActivity(page, "cf");
  await page.click("text=Expert");
  await chooseTopics(page, ["Access, Tunnel, Gateway"]);
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere("cfExpert", 5, ["cfZeroTrust"], (q) => q.skill === "cfZeroTrust.accessPolicy");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz pre.quiz-code")).toContainText("1. alpha:");
  const code = page.locator(".quiz pre.quiz-code");
  const widths = await code.evaluate((n) => [n.scrollWidth, n.clientWidth]);
  expect(widths[0]).toBeLessThanOrEqual(widths[1]! + 1);
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? first.correct : 0));
  expect(body.level).toBe("cfExpert");
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator(".review-item").first()).not.toHaveClass(/bad/);
});

test("written questions in English: a beginner test on DNS, graded like any other", async ({ page }) => {
  await newPlayer(page, "FlareEn");
  await openActivity(page, "cf");
  await page.selectOption(".language", "en");
  await expect(page.locator("h1")).toHaveText("Test: Cloudflare");
  await chooseTopics(page, ["DNS, proxy and anycast"]);
  await page.locator(".count button").first().click();
  await page.click("text=Start the quiz");
  await expect(page.locator(".quiz-prompt")).toBeVisible();
  const { body, server } = await takeQuiz(page, () => 0);
  expect(body.level).toBe("cfBeginner");
  expect(server.correct).toBe(rebuild(body).correct);
  await page.selectOption(".language", "fr");
});
