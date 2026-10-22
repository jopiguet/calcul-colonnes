import { expect, test, type Page } from "@playwright/test";
import { generateQuiz, type Question } from "../../shared/quiz/index.ts";
import { goHome, newPlayer, openActivity, profileOf, rebuild, takeMixedQuiz, takeQuiz } from "./helpers";

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

function seedWhere(count: number, pick: (q: Question) => boolean): { seed: number; quiz: Question[] } {
  for (let seed = 1; ; seed++) {
    const quiz = generateQuiz({ seed, level: "chembio", topics: ["balancing"], count });
    if (pick(quiz[0]!)) return { seed, quiz };
  }
}

test("balancing equations: its own card and test, equations shown, graded on the server, mistakes recorded", async ({ page }) => {
  const name = await newPlayer(page, "Eqn");
  await goHome(page);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Chimie et biologie" }) });
  await expect(group.locator("[data-activity='chembio']")).toContainText("⚗️ Équations chimiques");
  await openActivity(page, "chembio");
  await expect(page.locator(".activity-bar-title")).toHaveText("⚗️ Équations chimiques");
  await expect(page.locator("h1")).toHaveText("QCM : équilibrer les équations");
  await expect(page.locator(".quiz-setup legend", { hasText: "Niveau" })).toHaveCount(0);
  await expect(page.locator(".topic-group-name")).toHaveText(["Réactions chimiques"]);

  // A whole-equation question first; answer it with its subscript mistake.
  await page.locator(".count button").first().click(); // 5 questions
  const { seed, quiz } = seedWhere(5, (q) => q.verify.kind === "equation" && q.options.some((o) => o.mistake === "subscriptChanged"));
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz-prompt")).toHaveText("Quelle équation est équilibrée, avec les plus petits coefficients entiers ?");
  await expect(page.locator(".quiz .math.display .katex")).toHaveCount(1);
  await expect(page.locator(".choice .katex")).toHaveCount(4);
  const wrong = quiz[0]!.options.findIndex((o) => o.mistake === "subscriptChanged");
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? wrong : quiz[i]!.correct));
  expect(body.level).toBe("chembio");
  expect(body.topics).toEqual(["balancing"]);
  expect(server.correct).toBe(rebuild(body).correct);
  expect(server.correct).toBe(4);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");
  // The correction counts the atoms, element by element.
  await expect(page.locator(".review-item").first()).toContainText("changer un indice, c'est changer de substance");

  const profile = await profileOf(page.request, name);
  expect(profile.mistakes.some((m) => m.mistake === "subscriptChanged")).toBe(true);
  expect(profile.skills.some((s) => s.skill === quiz[0]!.skill && s.status !== "mastered")).toBe(true);
});

test("a coefficient can be typed", async ({ page }) => {
  await newPlayer(page, "Coe");
  await openActivity(page, "chembio");
  await page.click("text=Au clavier");
  await page.locator(".count button").first().click();
  const { seed, quiz } = seedWhere(5, (q) => q.verify.kind === "coefficient");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz-prompt")).toContainText("quel coefficient va à la place du « ? »");
  const right = quiz[0]!.options[quiz[0]!.correct]!.tex;
  const { body, server, typedAt } = await takeMixedQuiz(page, (i) => (i === 0 ? right : "0"), () => 0);
  expect(typedAt[0]).toBe(0);
  expect(body.mode).toBe("typed");
  expect(server.correct).toBe(rebuild(body).correct);
  expect(server.correct).toBeGreaterThanOrEqual(1);
});
