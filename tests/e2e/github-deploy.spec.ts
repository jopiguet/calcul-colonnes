import { expect, test } from "@playwright/test";
import { topicsFor } from "../../shared/quiz/index.ts";
import { chooseTopics, goHome, newPlayer, openActivity, rebuild, takeQuiz } from "./helpers";

const subjects = [
  { id: "github", card: "🐙 GitHub", h1: "QCM : GitHub", groups: ["Travailler ensemble", "Automatisation et sécurité"], beginner: "githubBeginner", expert: "githubExpert" },
  { id: "deploy", card: "🚀 Déploiement", h1: "QCM : systèmes de déploiement", groups: ["Les fondements", "Les outils"], beginner: "deployBeginner", expert: "deployExpert" },
  { id: "node", card: "📦 Node.js et npm", h1: "QCM : Node.js et npm", groups: ["La plateforme Node.js", "npm et l'écosystème"], beginner: "nodeBeginner", expert: "nodeExpert" },
] as const;

for (const s of subjects) {
  test(`${s.id}: its card under Computing, four levels, two groups`, async ({ page }) => {
    await newPlayer(page, `Card ${s.id}`);
    await goHome(page);
    const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Informatique" }) });
    await expect(group.locator(`[data-activity='${s.id}']`)).toContainText(s.card);
    await openActivity(page, s.id);
    await expect(page.locator(".activity-bar-title")).toHaveText(s.card);
    await expect(page.locator("h1")).toHaveText(s.h1);
    await expect(page.locator(".levels-four .segment")).toHaveText(["Débutant", "Intermédiaire", "Avancé", "Expert"]);
    await expect(page.locator(".topic-group-name")).toHaveText([...s.groups]);
    await expect(page.locator(".topics .topic")).toHaveCount(topicsFor(s.beginner).length);
    await page.click("text=Expert");
    await expect(page.locator(".topics .topic")).toHaveCount(topicsFor(s.expert).length);
  });
}

test("a GitHub Actions test on a phone, graded on the server", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  await newPlayer(page, "Octo");
  await openActivity(page, "github");
  await page.click("text=Avancé");
  await chooseTopics(page, ["GitHub Actions"]);
  await page.locator(".count button").first().click();
  await page.click("text=Commencer le test");
  const { body, server } = await takeQuiz(page, () => 0);
  expect(body.level).toBe("githubAdvanced");
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("a Terraform test in Spanish, graded on the server", async ({ page }) => {
  await newPlayer(page, "Tofu");
  await page.selectOption(".language", "es");
  await openActivity(page, "deploy");
  await expect(page.locator("h1")).toHaveText("Test: sistemas de despliegue");
  await page.click("text=Experto");
  await chooseTopics(page, ["Terraform y OpenTofu"]);
  await page.locator(".count button").first().click();
  await page.click("text=Empezar el test");
  const { body, server } = await takeQuiz(page, () => 1);
  expect(body.level).toBe("deployExpert");
  expect(server.correct).toBe(rebuild(body).correct);
});

test("a Node.js supply-chain test in English, graded on the server", async ({ page }) => {
  await newPlayer(page, "Ryan");
  await page.selectOption(".language", "en");
  await openActivity(page, "node");
  await expect(page.locator("h1")).toHaveText("Test: Node.js and npm");
  await page.click("text=Advanced");
  await chooseTopics(page, ["Security and the supply chain"]);
  await page.locator(".count button").first().click();
  await page.click("text=Start the quiz");
  const { body, server } = await takeQuiz(page, () => 2);
  expect(body.level).toBe("nodeAdvanced");
  expect(body.topics).toEqual(["ndSecurity"]);
  expect(server.correct).toBe(rebuild(body).correct);
});
