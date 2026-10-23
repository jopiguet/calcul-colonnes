import { expect, test, type Page } from "@playwright/test";
import { generateQuiz, LINUX_TOPICS, localized, type Question } from "../../shared/quiz/index.ts";
import { chooseTopics, newPlayer, openActivity, rebuild, takeMixedQuiz, takeQuiz } from "./helpers";
import { LX_MISTAKES, type LinuxMistake } from "../../src/quiz-i18n-linux.ts";

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
function seedWhere(count: number, topics: string[], pick: (q: Question) => boolean): { seed: number; first: Question } {
  for (let seed = 1; ; seed++) {
    const quiz = generateQuiz({ seed, level: "linux", topics: topics as never, count });
    if (pick(quiz[0]!)) return { seed, first: quiz[0]! };
  }
}

test.beforeEach(async ({ page }) => {
  await newPlayer(page, "Tux");
  await openActivity(page, "linux");
  await expect(page.locator("h1")).toHaveText("QCM Linux");
});

test("Linux: its topics in three groups, no level; commands shown as code; graded the same everywhere", async ({ page }) => {
  await expect(page.locator(".quiz-setup legend", { hasText: "Niveau" })).toHaveCount(0);
  await expect(page.locator(".topic-group-name")).toHaveText(["La ligne de commande", "Scripts, git et vim", "Outils à installer"]);
  await expect(page.locator(".topics .topic")).toHaveCount(LINUX_TOPICS.length);

  // A written question about a tool to install: its commands in code, the package as its source.
  await page.locator(".count button").first().click(); // 5 questions
  const { seed, first } = seedWhere(5, [...LINUX_TOPICS], (q) => q.prompt.source?.startsWith("📦") === true);
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz-prompt")).toContainText(localized(first.prompt.text!, "fr").replace(/`/g, "").slice(0, 20));
  await expect(page.locator(".quiz-source")).toHaveText(first.prompt.source!);
  await expect(page.locator(".choices.written")).toHaveCount(1);

  const { body, server } = await takeQuiz(page, (i) => i % 4);
  expect(body.level).toBe("linux");
  expect(body.bank).toBeUndefined();
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");
  // The explanation says how to install the tool.
  await expect(page.locator(".review-item").first()).toContainText("Pas installé d'origine");
  await expect(page.locator(".review-item").first().locator("code", { hasText: "sudo apt install" })).toHaveCount(1);
});

test("a permission mode can be typed: 640 is read as the octal mode", async ({ page }) => {
  await chooseTopics(page, ["Fichiers et permissions"]);
  await page.click("text=Au clavier");
  await page.locator(".count button").first().click(); // 5 questions
  const { seed, first } = seedWhere(5, ["linuxFiles"], (q) => q.prompt.key === "chmodToOctal");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz-prompt code")).toHaveText(["ls -l", "chmod"]);
  const right = first.options[first.correct]!.tex;
  const { body, server } = await takeMixedQuiz(page, (i) => (i === 0 ? right : "0"), () => 0);
  expect(body.mode).toBe("typed");
  expect(body.answers[0]).toBe(right);
  const rebuilt = rebuild(body);
  expect(server.correct).toBe(rebuilt.correct);
  expect(rebuilt.questions[0]!.prompt.key).toBe("chmodToOctal");
  expect(server.correct).toBeGreaterThanOrEqual(1);
});

test("what a command prints: the command and the outputs as code, a slip named in the corrections", async ({ page }) => {
  await chooseTopics(page, ["Scripts bash", "Git", "Vim"]);
  await page.locator(".count button").first().click(); // 5 questions
  const topics = ["linuxScripting", "linuxGit", "linuxVim"];
  const { seed, first } = seedWhere(5, topics, (q) => q.skill === "linuxScripting.paramExpansion");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  if (first.verify.kind !== "shell") throw new Error("not a generated command");
  await expect(page.locator(".quiz-prompt")).toContainText("Qu'affiche cette commande ?");
  await expect(page.locator(".quiz-prompt code")).toHaveText(first.verify.command);
  await expect(page.locator(".choice code")).toHaveText(first.options.map((o) => o.tex));

  // A wrong output first, the right ones after.
  const slip = first.correct === 0 ? 1 : 0;
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? slip : 0));
  expect(body.topics).toEqual(topics);
  expect(server.correct).toBe(rebuild(body).correct);
  const review = page.locator(".review-item").first();
  await expect(review).toHaveClass(/bad/);
  await expect(review).toContainText(LX_MISTAKES.fr[first.options[slip]!.mistake as LinuxMistake]);
});
