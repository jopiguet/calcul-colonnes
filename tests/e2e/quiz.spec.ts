import { expect, test } from "@playwright/test";
import { chooseTopics, newPlayer, rebuild, statsOf, takeQuiz, openActivity } from "./helpers";

test.beforeEach(async ({ page }) => {
  await newPlayer(page, "Quiz");
  await openActivity(page, "quiz");
  await expect(page.locator("text=QCM de mathématiques")).toBeVisible();
});

test("a test is graded the same by the browser, the server and an independent rebuild", async ({ page }) => {
  const request = page.request;
  await page.click("text=Université");
  await chooseTopics(page, ["Intégrales", "Limites"]);
  await page.click("text=Commencer le test");
  const { body, server } = await takeQuiz(page, (i) => (i * 3) % 4);

  expect(body.level).toBe("university");
  expect([...body.topics].sort()).toEqual(["integrals", "limits"]);
  expect(server.correct).toBe(rebuild(body).correct);
  await expect(page.locator(".big-score")).toHaveText(`${server.correct} / ${body.count}`);
  await expect(page.locator(".review-item.good")).toHaveCount(server.correct);
  await expect(page.locator("#quiz-status")).toHaveText("✓ Résultat enregistré");

  const name = (await page.locator(".chip").first().innerText()).replace("👤", "").trim();
  const stats = await statsOf(request, name);
  expect([stats.quizTests, stats.quizCorrect, stats.quizQuestions]).toEqual([1, server.correct, body.count]);
});

test("every question shows four rendered options and the keyboard works", async ({ page }) => {
  await page.click("text=Commencer le test");
  await page.locator(".choices").waitFor();
  await expect(page.locator(".choice")).toHaveCount(4);
  await expect(page.locator(".choices .katex")).toHaveCount(4);
  await page.keyboard.press("3");
  await expect(page.locator(".choice.on .letter")).toHaveText("C");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".quiz-count")).toHaveText("Question 2 / 10");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".choice.on .letter")).toHaveText("C");
});

test("a test survives a change of language", async ({ page }) => {
  await page.click("text=Commencer le test");
  await page.locator(".choice").nth(1).click();
  await page.keyboard.press("ArrowRight");
  // The LaTeX source, not the rendered text: Spanish renders \sin as "sen".
  const formula = await page.locator(".math.display annotation").first().textContent();
  expect(formula).toMatch(/\S/);
  await page.selectOption(".language", "es");
  await expect(page.locator(".quiz-count")).toHaveText("Pregunta 2 / 10");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".choice.on .letter")).toHaveText("B");
  await page.keyboard.press("ArrowRight");
  expect(await page.locator(".math.display annotation").first().textContent()).toBe(formula);
  await page.selectOption(".language", "fr");
});

test("blank answers count as wrong, and the same test can be replayed", async ({ page }) => {
  await page.click("[aria-label='Moins de questions']");
  await page.click("text=Commencer le test");
  const { body, server } = await takeQuiz(page, () => -1);
  expect(body.answers).toEqual([-1, -1, -1, -1, -1]);
  expect(server.correct).toBe(0);
  await expect(page.locator(".review-line.given", { hasText: "Pas de réponse" })).toHaveCount(5);

  const first = await page.locator(".review-item .math.display").first().innerText();
  await page.click("text=Refaire le même test");
  await page.locator(".choices").waitFor();
  expect(await page.locator(".math.display").first().innerText()).toBe(first);
});

test("giving up does not save the test", async ({ page }) => {
  const request = page.request;
  await page.click("text=Commencer le test");
  await page.locator(".choices").waitFor();
  page.once("dialog", (dialog) => void dialog.accept());
  await page.click("text=Abandonner");
  await expect(page.locator("text=QCM de mathématiques")).toBeVisible();
  const name = (await page.locator(".chip").first().innerText()).replace("👤", "").trim();
  expect((await statsOf(request, name)).quizTests).toBe(0);
});

test("topics come by group; a probability test, at both levels, is graded the same everywhere", async ({ page }) => {
  await expect(page.locator(".topic-group-name")).toContainText(["Analyse", "Probabilités"]);
  for (const level of ["Lycée", "Université"]) {
    await page.click(`text=${level}`);
    await chooseTopics(page, ["Probabilités"]);
    await page.click("text=Commencer le test");
    await page.locator(".choices").waitFor();
    await expect(page.locator(".quiz-topic").first()).toHaveText("Probabilités");
    await expect(page.locator(".sheet.quiz .katex").first()).toBeVisible();
    const { body, server } = await takeQuiz(page, (i) => i % 4);
    expect(body.topics).toEqual(["probability"]);
    expect(server.correct).toBe(rebuild(body).correct);
    await page.locator(".actions button", { hasText: "Changer les réglages" }).click();
  }
});
