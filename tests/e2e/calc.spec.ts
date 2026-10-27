import { expect, test, type Page } from "@playwright/test";
import { generateQuiz, localized, registerBank, topicsFor, type Level, type Question } from "../../shared/quiz/index.ts";
import { chooseTopics, goHome, newPlayer, openActivity, profileOf, rebuild, takeQuiz } from "./helpers";
import { serverBank } from "./bank";
import { CALC_MISTAKES } from "../../src/quiz-i18n-calc.ts";

/** The invented banks the server imported at startup: calculus at revision 3. */
const bank = serverBank();
registerBank(bank);

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
    const quiz = generateQuiz({ seed, level, topics: topics as never, count, bank: bank.revision });
    if (pick(quiz[0]!)) return { seed, first: quiz[0]! };
  }
}

test("calculus: its own card among the maths, two levels, three groups of topics", async ({ page }) => {
  await newPlayer(page, "Calc");
  await goHome(page);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: /^Mathématiques$/ }) });
  await expect(group.locator("[data-activity='calc']")).toContainText("∫ Analyse");
  // The arithmetic quiz is still there, next to it.
  await expect(group.locator("[data-activity='quiz']")).toHaveCount(1);
  await openActivity(page, "calc");
  await expect(page.locator(".activity-bar-title")).toHaveText("∫ Analyse");
  await expect(page.locator("h1")).toHaveText("QCM : analyse");
  await expect(page.locator(".quiz-setup .segmented").first().locator(".segment")).toHaveText(["Fondamentaux", "Avancé"]);
  await expect(page.locator(".mode-hint").first()).toContainText("champs de pentes");
  await expect(page.locator(".topic-group-name")).toHaveText(["Une variable", "Équations différentielles, courbes, séries", "Plusieurs variables et calcul stochastique"]);
  await expect(page.locator(".topics .topic")).toHaveCount(topicsFor("calc").length);
  await expect(page.locator(".hint", { hasText: "banque de questions" })).toHaveCount(0);
  expect(topicsFor("calc").every((t) => t.startsWith("calc"))).toBe(true);
  expect(topicsFor("econ").some((t) => t.startsWith("calc"))).toBe(false);
});

test("a Riemann sum on a phone: the rectangles drawn, the answer graded on the server, the slip named", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  const name = await newPlayer(page, "Riemann");
  await openActivity(page, "calc");
  await chooseTopics(page, ["Intégrales et applications"]);
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere("calc", 5, ["calcIntegrals"], (q) => q.skill === "calcIntegrals.riemannSum");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  if (first.verify.kind !== "calc") throw new Error("not a generated question");
  await expect(page.locator(".quiz-prompt")).toContainText("somme de Riemann");
  const chart = page.locator(".quiz-graph svg");
  await expect(chart).toHaveCount(1);
  await expect(chart.locator(".c-area")).toHaveCount(first.verify.model.type === "riemann" ? first.verify.model.n : 0);
  await expect(chart.locator(".c-curve")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const slip = first.options.findIndex((o, i) => i !== first.correct && o.mistake !== undefined);
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? slip : 0));
  expect(body.level).toBe("calc");
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");
  const review = page.locator(".review-item").first();
  await expect(review).toHaveClass(/bad/);
  await expect(review).toContainText(CALC_MISTAKES.fr[first.options[slip]!.mistake as keyof (typeof CALC_MISTAKES)["fr"]]);
  const profile = await profileOf(page.request, name);
  expect(profile.mistakes.some((m) => m.mistake === first.options[slip]!.mistake)).toBe(true);
});

test("a Taylor polynomial: four graphs as the options, the function dashed in each", async ({ page }) => {
  await newPlayer(page, "Taylor");
  await openActivity(page, "calc");
  await chooseTopics(page, ["Suites et séries"]);
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere("calc", 5, ["calcSeries"], (q) => q.skill === "calcSeries.taylorGraph");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz-prompt")).toContainText("polynôme de Taylor");
  await expect(page.locator(".choice svg")).toHaveCount(4);
  await expect(page.locator(".choice svg .c-guide")).toHaveCount(4);
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? first.correct : 0));
  expect(server.correct).toBe(rebuild(body).correct);
});

test("a slope field: the field drawn, the equation graded on the server", async ({ page }) => {
  await newPlayer(page, "Field");
  await openActivity(page, "calc");
  await chooseTopics(page, ["Équations différentielles"]);
  await page.locator(".count button").first().click();
  const field = seedWhere("calc", 5, ["calcOde"], (q) => q.skill === "calcOde.slopeField");
  await fixSeed(page, field.seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz-graph svg .c-field")).toHaveCount(1);
  const first = await takeQuiz(page, () => field.first.correct);
  expect(first.server.correct).toBe(rebuild(first.body).correct);
});

test("a concept question from a book: its source shown, graded like the rest", async ({ page }) => {
  await newPlayer(page, "Book");
  await openActivity(page, "calc");
  await chooseTopics(page, ["Intégrales et applications", "Calcul stochastique"]);
  await page.locator(".count button").first().click();
  const topics = ["calcIntegrals", "calcStochastic"];
  const concept = seedWhere("calc", 5, topics, (q) => q.verify.kind === "choice");
  await fixSeed(page, concept.seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz-prompt")).toContainText(localized(concept.first.prompt.text!, "fr").slice(0, 30));
  await expect(page.locator("#app")).toContainText(concept.first.prompt.source!);
  const { body, server } = await takeQuiz(page, () => 0);
  expect(body.bank).toBe(bank.revision);
  expect(server.correct).toBe(rebuild(body).correct);
});
