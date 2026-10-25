import { expect, test, type Page } from "@playwright/test";
import { generateQuiz, localized, registerBank, topicsFor, type Level, type Question } from "../../shared/quiz/index.ts";
import { chooseTopics, goHome, newPlayer, openActivity, profileOf, rebuild, takeQuiz } from "./helpers";
import { serverBank } from "./bank";
import { ECON_MISTAKES } from "../../src/quiz-i18n-econ.ts";

/** The invented banks the server imported at startup: economics at revision 2. */
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

test("public economics: its own card and group, two levels, three groups of topics", async ({ page }) => {
  await newPlayer(page, "Econ");
  await goHome(page);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Économie" }) });
  await expect(group.locator("[data-activity='econ']")).toContainText("🏛️ Économie publique");
  await openActivity(page, "econ");
  await expect(page.locator(".activity-bar-title")).toHaveText("🏛️ Économie publique");
  await expect(page.locator("h1")).toHaveText("QCM : économie publique");
  await expect(page.locator(".quiz-setup .segmented").first().locator(".segment")).toHaveText(["Fondamentaux", "Avancé"]);
  await expect(page.locator(".mode-hint").first()).toContainText("graphiques classiques");
  await expect(page.locator(".topic-group-name")).toHaveText(["Théorie du bien-être et choix publics", "Fiscalité", "État-providence et travail"]);
  await expect(page.locator(".topics .topic")).toHaveCount(topicsFor("econ").length);
  // The bank holds economics units here: no hint that concept questions are missing.
  await expect(page.locator(".hint", { hasText: "banque de questions" })).toHaveCount(0);
  // No chemistry unit ever reaches an economics test, nor the reverse.
  expect(topicsFor("econ").every((t) => t.startsWith("econ"))).toBe(true);
  expect(topicsFor("chemistry").some((t) => t.startsWith("econ"))).toBe(false);
});

test("tax incidence on a phone: the chart drawn, the answer graded on the server, the slip named", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  const name = await newPlayer(page, "Tax");
  await openActivity(page, "econ");
  await chooseTopics(page, ["Incidence et perte sèche"]);
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere("econ", 5, ["econIncidence"], (q) => q.skill === "econIncidence.taxIncidence");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  if (first.verify.kind !== "econ") throw new Error("not a generated question");
  await expect(page.locator(".quiz-prompt")).toContainText("par unité");
  const chart = page.locator(".quiz-graph svg");
  await expect(chart).toHaveCount(1);
  await expect(chart.locator(".c-curve")).toHaveCount(2);
  await expect(chart.locator(".c-guide")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const slip = first.options.findIndex((o, i) => i !== first.correct && o.mistake !== undefined);
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? slip : 0));
  expect(body.level).toBe("econ");
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");
  const review = page.locator(".review-item").first();
  await expect(review).toHaveClass(/bad/);
  await expect(review).toContainText(ECON_MISTAKES.fr[first.options[slip]!.mistake as keyof (typeof ECON_MISTAKES)["fr"]]);
  const profile = await profileOf(page.request, name);
  expect(profile.mistakes.some((m) => m.mistake === first.options[slip]!.mistake)).toBe(true);
});

test("the most equal Lorenz curve: four curves as the options, named by letter", async ({ page }) => {
  await newPlayer(page, "Lorenz");
  await openActivity(page, "econ");
  await chooseTopics(page, ["Inégalités, pauvreté, prestations"]);
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere("econ", 5, ["econRedistribution"], (q) => q.skill === "econRedistribution.giniLorenz" && q.options.every((o) => o.graph));
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz-prompt")).toContainText("courbe de Lorenz");
  await expect(page.locator(".choice svg")).toHaveCount(4);
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? first.correct : 0));
  expect(server.correct).toBe(rebuild(body).correct);
  // In the corrections each curve has its Gini under it, with a decimal comma.
  await expect(page.locator(".review-item").first()).toContainText("G = 0,");
});

test("a concept question from a book: its source shown, graded like the rest", async ({ page }) => {
  await newPlayer(page, "Book");
  await openActivity(page, "econ");
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere("econ", 5, topicsFor("econ"), (q) => q.verify.kind === "choice");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz-prompt")).toContainText(localized(first.prompt.text!, "fr").slice(0, 30));
  await expect(page.locator("#app")).toContainText(first.prompt.source!);
  const { body, server } = await takeQuiz(page, () => 0);
  expect(body.bank).toBe(bank.revision);
  expect(server.correct).toBe(rebuild(body).correct);
});
