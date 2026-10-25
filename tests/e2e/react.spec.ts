import { expect, test, type Page } from "@playwright/test";
import { generateQuiz, topicsFor, type Level, type Question } from "../../shared/quiz/index.ts";
import { chooseTopics, goHome, newPlayer, openActivity, profileOf, rebuild, takeQuiz } from "./helpers";
import { REACT_MISTAKES } from "../../src/quiz-i18n-react.ts";

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

test("React: its card under Computing, four levels, each with its own topics", async ({ page }) => {
  await newPlayer(page, "Dan");
  await goHome(page);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Informatique" }) });
  await expect(group.locator("[data-activity='react']")).toContainText("⚛️ React");
  await openActivity(page, "react");
  await expect(page.locator(".activity-bar-title")).toHaveText("⚛️ React");
  await expect(page.locator("h1")).toHaveText("QCM : React");
  await expect(page.locator(".levels-four .segment")).toHaveText(["Débutant", "Intermédiaire", "Avancé", "Expert"]);
  await expect(page.locator(".topics .topic")).toHaveCount(topicsFor("reactBeginner").length);
  await expect(page.locator(".topic-group-name")).toHaveText(["Composants, état et rendu", "La pile : données, types, outils, tests"]);
  await page.click("text=Expert");
  await expect(page.locator(".topics .topic")).toHaveCount(topicsFor("reactExpert").length);
});

test("what a component shows after clicks: the program on a phone, graded on the server, a slip named", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  const name = await newPlayer(page, "Hook");
  await openActivity(page, "react");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.click("text=Débutant");
  await chooseTopics(page, ["État et événements"]);
  await page.locator(".count button").first().click(); // 5 questions
  const { seed, first } = seedWhere("reactBeginner", 5, ["reactState"], (q) => q.skill === "reactState.clickCounter");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  if (first.verify.kind !== "react") throw new Error("not a generated program");
  await expect(page.locator(".quiz-prompt")).toContainText("Qu'affiche la page ?");
  const code = page.locator(".quiz pre.quiz-code");
  await expect(code).toHaveText(first.verify.program);
  const widths = await code.evaluate((n) => [n.scrollWidth, n.clientWidth]);
  expect(widths[0], `program ${widths[0]} px in ${widths[1]} px`).toBeLessThanOrEqual(widths[1]! + 1);

  const slip = first.options.findIndex((o, i) => i !== first.correct && o.mistake !== undefined);
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? slip : 0));
  expect(body.level).toBe("reactBeginner");
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");
  const review = page.locator(".review-item").first();
  await expect(review).toHaveClass(/bad/);
  await expect(review).toContainText(REACT_MISTAKES.fr[first.options[slip]!.mistake as keyof (typeof REACT_MISTAKES)["fr"]]);
  const profile = await profileOf(page.request, name);
  expect(profile.mistakes.some((m) => m.mistake === first.options[slip]!.mistake)).toBe(true);
});

test("StrictMode at Expert: the console's lines, checked like any test", async ({ page }) => {
  await newPlayer(page, "Strict");
  await openActivity(page, "react");
  await page.click("text=Expert");
  await chooseTopics(page, ["Effets et refs"]);
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere("reactExpert", 5, ["reactEffects"], (q) => q.skill === "reactEffects.strictEffects");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz-prompt")).toContainText("StrictMode");
  await expect(page.locator(".quiz pre.quiz-code")).toContainText("useEffect");
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? first.correct : 0));
  expect(body.level).toBe("reactExpert");
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator(".review-item").first()).not.toHaveClass(/bad/);
});
