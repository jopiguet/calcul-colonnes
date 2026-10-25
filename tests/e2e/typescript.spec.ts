import { expect, test, type Page } from "@playwright/test";
import { generateQuiz, topicsFor, type Level, type Question } from "../../shared/quiz/index.ts";
import { chooseTopics, goHome, newPlayer, openActivity, profileOf, rebuild, takeQuiz } from "./helpers";
import { TS_MISTAKES } from "../../src/quiz-i18n-ts.ts";

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

test("TypeScript: its card under Computing, four levels, each with its own topics", async ({ page }) => {
  await newPlayer(page, "Anders");
  await goHome(page);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Informatique" }) });
  await expect(group.locator("[data-activity='ts']")).toContainText("🔷 TypeScript");
  await openActivity(page, "ts");
  await expect(page.locator(".activity-bar-title")).toHaveText("🔷 TypeScript");
  await expect(page.locator("h1")).toHaveText("QCM : TypeScript");
  const levels = page.locator(".levels-four .segment");
  await expect(levels).toHaveText(["Débutant", "Intermédiaire", "Avancé", "Expert"]);
  await expect(page.locator(".topics .topic")).toHaveCount(topicsFor("tsBeginner").length);
  await expect(page.locator(".topics .topic", { hasText: "Types mappés et conditionnels" })).toHaveCount(0);
  await page.click("text=Avancé");
  await expect(page.locator(".topics .topic")).toHaveCount(topicsFor("tsAdvanced").length);
  await expect(page.locator(".topic-group-name")).toHaveText(["Le langage et ses types", "Exécution et outillage"]);
  await page.click("text=Expert");
  await expect(page.locator(".topics .topic")).toHaveCount(topicsFor("tsExpert").length);
  await expect(page.locator(".topics .topic", { hasText: "Bases" })).toHaveCount(0);
});

test("what a program logs: the program as code on a phone, graded on the server, a slip named", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  const name = await newPlayer(page, "Init");
  await openActivity(page, "ts");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.click("text=Expert");
  await chooseTopics(page, ["Interfaces et classes"]);
  await page.locator(".count button").first().click(); // 5 questions
  // The longest generated program: a base constructor calling an override.
  const { seed, first } = seedWhere("tsExpert", 5, ["tsObjects"], (q) => q.skill === "tsObjects.initOrder");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  if (first.verify.kind !== "ts") throw new Error("not a generated program");
  await expect(page.locator(".quiz-prompt")).toHaveText("Qu'affiche ce programme ?");
  const code = page.locator(".quiz pre.quiz-code");
  await expect(code).toHaveText(first.verify.program);
  const widths = await code.evaluate((n) => [n.scrollWidth, n.clientWidth]);
  expect(widths[0], `program ${widths[0]} px in ${widths[1]} px`).toBeLessThanOrEqual(widths[1]! + 1);
  await expect(page.locator(".choice code")).toHaveText(first.options.map((o) => o.tex));

  const slip = first.options.findIndex((o, i) => i !== first.correct && o.mistake !== undefined);
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? slip : 0));
  expect(body.level).toBe("tsExpert");
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");
  const review = page.locator(".review-item").first();
  await expect(review).toHaveClass(/bad/);
  await expect(review).toContainText(TS_MISTAKES.fr[first.options[slip]!.mistake as keyof (typeof TS_MISTAKES)["fr"]]);
  const profile = await profileOf(page.request, name);
  expect(profile.mistakes.some((m) => m.mistake === first.options[slip]!.mistake)).toBe(true);
});

test("the event loop at Intermédiaire: the order of logs, checked like any test", async ({ page }) => {
  await newPlayer(page, "Loop");
  await openActivity(page, "ts");
  await page.click("text=Intermédiaire");
  await chooseTopics(page, ["Le JavaScript à l'exécution"]);
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere("tsIntermediate", 5, ["tsRuntime"], (q) => q.skill === "tsRuntime.eventLoop");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz pre.quiz-code")).toContainText("setTimeout");
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? first.correct : 0));
  expect(body.level).toBe("tsIntermediate");
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator(".review-item").first()).not.toHaveClass(/bad/);
});
