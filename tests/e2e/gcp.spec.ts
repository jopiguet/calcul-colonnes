import { expect, test, type Page } from "@playwright/test";
import { generateQuiz, topicsFor, type Level, type Question } from "../../shared/quiz/index.ts";
import { chooseTopics, goHome, newPlayer, openActivity, profileOf, rebuild, takeQuiz } from "./helpers";
import { GCP_MISTAKES } from "../../src/quiz-i18n-gcp.ts";

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

test("Google Cloud: its card under Computing, four levels, identity and access first", async ({ page }) => {
  await newPlayer(page, "Gale");
  await goHome(page);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Informatique" }) });
  await expect(group.locator("[data-activity='gcp']")).toContainText("☁️ Google Cloud");
  await openActivity(page, "gcp");
  await expect(page.locator(".activity-bar-title")).toHaveText("☁️ Google Cloud");
  await expect(page.locator("h1")).toHaveText("QCM : Google Cloud");
  await expect(page.locator(".levels-four .segment")).toHaveText(["Débutant", "Intermédiaire", "Avancé", "Expert"]);
  await expect(page.locator(".topic-group-name")).toHaveText(["Identité et accès", "Infrastructure"]);
  await expect(page.locator(".topics .topic")).toHaveCount(topicsFor("gcpBeginner").length);
  await page.click("text=Expert");
  await expect(page.locator(".topics .topic")).toHaveCount(topicsFor("gcpExpert").length);
});

test("IAM through the hierarchy: the policies on a phone, graded on the server, a slip named", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  const name = await newPlayer(page, "Iam");
  await openActivity(page, "gcp");
  await page.click("text=Intermédiaire");
  await chooseTopics(page, ["IAM : rôles, conditions, refus"]);
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere("gcpIntermediate", 5, ["gcpIam"], (q) => q.skill === "gcpIam.iamInheritance");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  if (first.verify.kind !== "gcp") throw new Error("not a generated question");
  await expect(page.locator(".quiz-prompt")).toContainText("Alice");
  const code = page.locator(".quiz pre.quiz-code");
  await expect(code).toHaveText(first.prompt.code!);
  const widths = await code.evaluate((n) => [n.scrollWidth, n.clientWidth]);
  expect(widths[0], `policies ${widths[0]} px in ${widths[1]} px`).toBeLessThanOrEqual(widths[1]! + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const slip = first.options.findIndex((o, i) => i !== first.correct && o.mistake !== undefined);
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? slip : 0));
  expect(body.level).toBe("gcpIntermediate");
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");
  const review = page.locator(".review-item").first();
  await expect(review).toHaveClass(/bad/);
  await expect(review).toContainText(GCP_MISTAKES.fr[first.options[slip]!.mistake as keyof (typeof GCP_MISTAKES)["fr"]]);
  const profile = await profileOf(page.request, name);
  expect(profile.mistakes.some((m) => m.mistake === first.options[slip]!.mistake)).toBe(true);
});

test("firewall policies at Expert: the packet's fate, checked like any test", async ({ page }) => {
  await newPlayer(page, "Wall");
  await openActivity(page, "gcp");
  await page.click("text=Expert");
  await chooseTopics(page, ["Réseau VPC et pare-feu"]);
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere("gcpExpert", 5, ["gcpNetworking"], (q) => q.skill === "gcpNetworking.firewallPolicies");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz pre.quiz-code")).toContainText("# org policy");
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? first.correct : 0));
  expect(body.level).toBe("gcpExpert");
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator(".review-item").first()).not.toHaveClass(/bad/);
});
