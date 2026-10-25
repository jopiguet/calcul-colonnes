import { expect, test, type Page } from "@playwright/test";
import { generateQuiz, topicsFor, type Level, type Question } from "../../shared/quiz/index.ts";
import { chooseTopics, goHome, newPlayer, openActivity, profileOf, rebuild, takeMixedQuiz, takeQuiz } from "./helpers";
import { RS_MISTAKES } from "../../src/quiz-i18n-rust.ts";

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

/** A seed whose test starts with a question that `pick` accepts. */
function seedWhere(level: Level, count: number, topics: string[], pick: (q: Question) => boolean): { seed: number; first: Question } {
  for (let seed = 1; ; seed++) {
    const quiz = generateQuiz({ seed, level, topics: topics as never, count });
    if (pick(quiz[0]!)) return { seed, first: quiz[0]! };
  }
}

test("Rust: its card under Computing, four levels, each with its own topics", async ({ page }) => {
  await newPlayer(page, "Ferris");
  await goHome(page);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Informatique" }) });
  await expect(group.locator("[data-activity='rust']")).toContainText("🦀 Rust");
  await openActivity(page, "rust");
  await expect(page.locator(".activity-bar-title")).toHaveText("🦀 Rust");
  await expect(page.locator("h1")).toHaveText("QCM : Rust");
  const levels = page.locator(".levels-four .segment");
  await expect(levels).toHaveText(["Débutant", "Intermédiaire", "Avancé", "Expert"]);
  await expect(levels.first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".topics .topic")).toHaveCount(topicsFor("rustBeginner").length);
  await expect(page.locator(".topics .topic", { hasText: "Threads et async" })).toHaveCount(0);

  // Expert: async and unsafe, no more basics; the choice is kept.
  await page.click("text=Expert");
  await expect(levels.nth(3)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".topics .topic")).toHaveCount(topicsFor("rustExpert").length);
  await expect(page.locator(".topics .topic", { hasText: "Threads et async" })).toHaveCount(1);
  await expect(page.locator(".topics .topic", { hasText: "Bases" })).toHaveCount(0);
  await expect(page.locator(".topic-group-name")).toHaveText(["Le langage", "Concurrence, Cargo, unsafe"]);
  await goHome(page);
  await openActivity(page, "rust");
  await expect(page.locator(".levels-four .segment").nth(3)).toHaveAttribute("aria-pressed", "true");
});

test("what a program prints: the program as code on a phone, graded on the server, a slip named", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  const name = await newPlayer(page, "Drop");
  await openActivity(page, "rust");
  // The four levels fit the phone.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.click("text=Expert");
  await chooseTopics(page, ["Possession, emprunts, durées de vie"]);
  await page.locator(".count button").first().click(); // 5 questions
  // The longest generated program: values dropped at the end of main.
  const { seed, first } = seedWhere("rustExpert", 5, ["rustOwnership"], (q) => q.skill === "rustOwnership.dropOrder");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  if (first.verify.kind !== "rust") throw new Error("not a generated program");
  await expect(page.locator(".quiz-prompt")).toHaveText("Qu'affiche ce programme ?");
  const code = page.locator(".quiz pre.quiz-code");
  await expect(code).toHaveText(first.verify.program);
  const widths = await code.evaluate((n) => [n.scrollWidth, n.clientWidth]);
  expect(widths[0], `program ${widths[0]} px in ${widths[1]} px`).toBeLessThanOrEqual(widths[1]! + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator(".choice code")).toHaveText(first.options.map((o) => o.tex));

  const slip = first.options.findIndex((o, i) => i !== first.correct && o.mistake !== undefined);
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? slip : 0));
  expect(body.level).toBe("rustExpert");
  expect(body.topics).toEqual(["rustOwnership"]);
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");
  const review = page.locator(".review-item").first();
  await expect(review).toHaveClass(/bad/);
  await expect(review.locator("pre.quiz-code")).toHaveText(first.verify.program);
  await expect(review).toContainText(RS_MISTAKES.fr[first.options[slip]!.mistake as keyof (typeof RS_MISTAKES)["fr"]]);
  const profile = await profileOf(page.request, name);
  expect(profile.mistakes.some((m) => m.mistake === first.options[slip]!.mistake)).toBe(true);
});

test("a sum printed by an iterator chain can be typed", async ({ page }) => {
  await newPlayer(page, "Iter");
  await openActivity(page, "rust");
  await page.click("text=Intermédiaire");
  await chooseTopics(page, ["Collections, itérateurs, closures"]);
  await page.click("text=Au clavier");
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere("rustIntermediate", 5, ["rustCollections"], (q) => q.skill === "rustCollections.iteratorChain" && q.options.every((o) => o.num !== undefined));
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz pre.quiz-code")).toContainText(".filter(");
  const right = first.options[first.correct]!.tex;
  const { body, server, typedAt } = await takeMixedQuiz(page, (i) => (i === 0 ? right : "0"), () => 0);
  expect(typedAt[0]).toBe(0);
  expect(body.level).toBe("rustIntermediate");
  expect(server.correct).toBe(rebuild(body).correct);
  expect(server.correct).toBeGreaterThanOrEqual(1);
});
