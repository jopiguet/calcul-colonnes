import { expect, test, type Page } from "@playwright/test";
import { generateQuiz, localized, SQL_TOPICS, type Question } from "../../shared/quiz/index.ts";
import { chooseTopics, goHome, newPlayer, openActivity, profileOf, rebuild, takeQuiz } from "./helpers";
import { SQ_MISTAKES } from "../../src/quiz-i18n-sql.ts";

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
    const quiz = generateQuiz({ seed, level: "sql", topics: topics as never, count });
    if (pick(quiz[0]!)) return { seed, first: quiz[0]! };
  }
}

test("SQL: its card under Computing, its topics in two groups, no level", async ({ page }) => {
  await newPlayer(page, "Codd");
  await goHome(page);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Informatique" }) });
  await expect(group.locator("[data-activity='sql']")).toContainText("🗄️ SQL");
  await openActivity(page, "sql");
  await expect(page.locator(".activity-bar-title")).toHaveText("🗄️ SQL");
  await expect(page.locator("h1")).toHaveText("QCM : SQL et bases de données");
  await expect(page.locator(".quiz-setup legend", { hasText: "Niveau" })).toHaveCount(0);
  await expect(page.locator(".topic-group-name")).toHaveText(["Le langage SQL", "PostgreSQL, SQLite, MySQL"]);
  await expect(page.locator(".topics .topic")).toHaveCount(SQL_TOPICS.length);
});

test("what a query returns: the tables fit a phone, the query and results as code, a slip named", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  const name = await newPlayer(page, "Null");
  await openActivity(page, "sql");
  await chooseTopics(page, ["Jointures et sous-requêtes"]);
  await page.locator(".count button").first().click(); // 5 questions
  // A join: both tables, stacked; the widest prompt of the generated kinds.
  const { seed, first } = seedWhere(5, ["sqlJoins"], (q) => q.skill === "sqlJoins.joinRows");
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  if (first.verify.kind !== "sql") throw new Error("not a generated query");
  await expect(page.locator(".quiz-prompt")).toContainText("Que renvoie cette requête ?");
  await expect(page.locator(".quiz-prompt code")).toHaveText(first.verify.query);
  const table = page.locator(".quiz .math.display").first();
  await expect(table).toContainText("owners");
  await expect(table).toContainText("pets");
  // No sideways scrolling, nor the page wider than the screen.
  const widths = await table.evaluate((n) => [n.scrollWidth, n.clientWidth]);
  expect(widths[0], `table ${widths[0]} px in ${widths[1]} px`).toBeLessThanOrEqual(widths[1]! + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  // A wrong result first, the right answers after.
  const slip = first.options.findIndex((o, i) => i !== first.correct && o.mistake !== undefined);
  const { body, server } = await takeQuiz(page, (i) => (i === 0 ? slip : 0));
  expect(body.level).toBe("sql");
  expect(body.topics).toEqual(["sqlJoins"]);
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");
  const review = page.locator(".review-item").first();
  await expect(review).toHaveClass(/bad/);
  await expect(review).toContainText(SQ_MISTAKES.fr[first.options[slip]!.mistake as keyof (typeof SQ_MISTAKES)["fr"]]);

  const profile = await profileOf(page.request, name);
  expect(profile.mistakes.some((m) => m.mistake === first.options[slip]!.mistake)).toBe(true);
});

test("an engine's question says how to install its client", async ({ page }) => {
  await newPlayer(page, "Pg");
  await openActivity(page, "sql");
  await chooseTopics(page, ["PostgreSQL et psql"]);
  await page.locator(".count button").first().click();
  const { seed, first } = seedWhere(5, ["sqlPostgres"], () => true);
  await fixSeed(page, seed);
  await page.click("text=Commencer le test");
  await expect(page.locator(".quiz-prompt")).toContainText(localized(first.prompt.text!, "fr").replace(/`/g, "").slice(0, 20));
  await expect(page.locator(".quiz-source")).toHaveText("📦 postgresql-client");
  const { body, server } = await takeQuiz(page, (i) => i % 4);
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator(".review-item").first().locator("code", { hasText: "sudo apt install postgresql-client" })).toHaveCount(1);
});
