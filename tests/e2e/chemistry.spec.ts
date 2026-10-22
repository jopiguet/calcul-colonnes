import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { generateQuiz, localized, registerBank, topicsFor, type Level, type Question } from "../../shared/quiz/index.ts";
import { parseBankFile, toBank } from "../../shared/quiz/bank-file.ts";
import { newPlayer, openActivity, profileOf, rebuild, takeQuiz } from "./helpers";

/** The invented bank the server imported at startup (playwright.config.ts): revision 1. */
const fixture = parseBankFile(JSON.parse(readFileSync("tests/e2e/fixtures/bank.json", "utf8")));
registerBank(toBank(fixture, 1));

/** A seed whose test of `count` questions starts with a written question. */
function seedStartingWritten(count: number, level: Level = "chemistry"): { seed: number; first: Question } {
  for (let seed = 1; ; seed++) {
    const quiz = generateQuiz({ seed, level, topics: topicsFor(level), count, bank: 1 });
    if (quiz[0]!.verify.kind === "choice") return { seed, first: quiz[0]! };
  }
}

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

test.beforeEach(async ({ page }) => {
  await newPlayer(page, "Chem");
  await openActivity(page, "chemistry");
  await expect(page.locator("h1")).toHaveText("QCM de chimie physique");
});

test("physical chemistry: its own topics and levels; calculations and written questions graded the same everywhere", async ({ page }) => {
  // Its own levels, core first; the three Focuses of thermodynamics.
  await expect(page.locator(".quiz-setup .segmented").first().locator(".segment")).toHaveText(["Fondamental", "Avancé"]);
  await expect(page.locator(".segment.on", { hasText: "Fondamental" })).toHaveCount(1);
  await expect(page.locator(".topic-group-name")).toHaveText(["Thermodynamique"]);
  await expect(page.locator(".topics .topic")).toHaveText(["1 · Les gaz", "2 · Premier principe", "3 · Deuxième et troisième principes"]);

  const count = 10;
  await page.locator(".count button").first().click(); // 10 → 5
  await page.locator(".count button").last().click(); // back to 10
  const { seed, first } = seedStartingWritten(count);
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");

  // A written question: its text, its four answers in words, where it comes from.
  await expect(page.locator(".quiz-prompt")).toContainText(localized(first.prompt.text!, "fr").split("$")[0]!.trim());
  await expect(page.locator(".quiz-source")).toHaveText(first.prompt.source!);
  await expect(page.locator(".choices.written .choice-text")).toHaveCount(4);

  const { body, server } = await takeQuiz(page, (i) => i % 4);
  expect(body.level).toBe("chemistry");
  expect(body.bank).toBe(1);
  expect(body.seed).toBe(seed);
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");
  await expect(page.locator(".review-item.good")).toHaveCount(server.correct);
});

test("a question is reported from the corrections, with a note", async ({ page }) => {
  const { seed } = seedStartingWritten(5);
  await page.locator(".count button").first().click(); // 5 questions
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await takeQuiz(page, () => 0);

  const first = page.locator(".review-item").first();
  await first.locator(".flag-open").click();
  await first.locator(".flag-note").fill("The second answer is also right");
  const sent = page.waitForResponse("**/api/quiz/flags");
  await first.locator(".flag-form button").click();
  expect((await sent).status()).toBe(204);
  await expect(first.locator(".flag-status")).toHaveText("Merci, la question est signalée.");
});

test("a written question answered wrong comes back for review, named after its unit", async ({ page }) => {
  const { seed, first } = seedStartingWritten(5);
  await page.locator(".count button").first().click();
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  // The first question answered wrong, on purpose: an option other than the right one.
  const wrong = (first.correct + 1) % 4;
  await takeQuiz(page, (i) => (i === 0 ? wrong : 0));

  const name = (await page.locator(".chip").first().innerText()).replace("👤", "").trim();
  const profile = await profileOf(page.request, name);
  const skill = profile.skills.find((s) => s.skill === first.skill)!;
  expect(skill.status).toBe("review");
  await page.click("text=📈 Mes progrès");
  const unit = fixture.units.find((u) => first.skill.endsWith(`concepts${u.id}`))!;
  await expect(page.locator("#app")).toContainText(`Notions ${unit.id} – ${localized(unit.title, "fr")}`);
});

test("the advanced level: written questions only, in the app's language, its own kinds of question", async ({ page }) => {
  await page.click("text=Avancé");
  await expect(page.locator(".segment.on", { hasText: "Avancé" })).toHaveCount(1);
  await expect(page.locator(".mode-hint").first()).toContainText("Raisonnements et démonstrations");
  const { seed, first } = seedStartingWritten(5, "chemistryAdvanced");
  await page.locator(".count button").first().click(); // 5 questions
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");

  // Translated into French: the prompt in French, not marked as English.
  await expect(page.locator(".quiz-prompt")).toContainText(first.prompt.text!.fr!.split("$")[0]!.trim());
  await expect(page.locator(".quiz-prompt[lang=en]")).toHaveCount(0);
  const wrong = (first.correct + 1) % 4;
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? wrong : 0));
  expect(body.level).toBe("chemistryAdvanced");
  expect(body.bank).toBe(1);
  expect(server.correct).toBe(rebuild(body).correct);
  expect(rebuild(body).questions.every((q) => q.verify.kind === "choice")).toBe(true);

  // Its own kinds of question, named "Avancé".
  expect(first.skill).toMatch(/\.advanced\w+$/);
  await page.click("text=📈 Mes progrès");
  const unit = fixture.units.find((u) => first.skill.endsWith(`advanced${u.id}`))!;
  await expect(page.locator("#app")).toContainText(`Avancé ${unit.id} – ${localized(unit.title, "fr")}`);
});
