import { expect, test } from "@playwright/test";
import { typeable } from "../../shared/quiz/index.ts";
import { chooseTopics, newPlayer, rebuild, statsOf, takeMixedQuiz, takeQuiz, openActivity } from "./helpers";

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
  // A formula or, for a graph question, a drawing in each option.
  await expect(page.locator(".choices .katex, .choices svg.graph")).toHaveCount(4);
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
  await expect(page.locator(".topic-group-name")).toContainText(["Analyse", "Algèbre", "Géométrie", "Probabilités"]);
  for (const level of ["Lycée", "Université"]) {
    await page.click(`text=${level}`);
    await chooseTopics(page, ["Probabilités"]);
    await page.click("text=Commencer le test");
    await page.locator(".choices").waitFor();
    await expect(page.locator(".quiz-topic").first()).toContainText("Probabilités");
    await expect(page.locator(".sheet.quiz .katex").first()).toBeVisible();
    const { body, server } = await takeQuiz(page, (i) => i % 4);
    expect(body.topics).toEqual(["probability"]);
    expect(server.correct).toBe(rebuild(body).correct);
    await page.locator(".actions button", { hasText: "Changer les réglages" }).click();
  }
});

test("each new topic alone, at each of its levels, is graded the same everywhere", async ({ page }) => {
  test.setTimeout(360_000);
  const topics: [string, string[]][] = [
    ["Suites", ["Lycée", "Université"]],
    ["Nombres complexes", ["Lycée", "Université"]],
    ["Équations différentielles", ["Lycée", "Université"]],
    ["Matrices et systèmes", ["Lycée", "Université"]],
    ["Étude de fonctions", ["Lycée", "Université"]],
    ["Vecteurs et géométrie dans l'espace", ["Lycée", "Université"]],
    ["Séries", ["Université"]],
    ["Fonctions de plusieurs variables", ["Université"]],
    ["Lecture graphique", ["Lycée", "Université"]],
  ];
  for (const [topic, levels] of topics) {
    for (const level of levels) {
      await page.click(`.quiz-setup .segment >> text=${level}`);
      await chooseTopics(page, [topic]);
      await page.click("text=Commencer le test");
      await page.locator(".choices").waitFor();
      // A kind answered wrong in the first test of a topic comes back marked "À revoir".
      await expect(page.locator(".quiz-topic").first()).toContainText(topic);
      const { body, server } = await takeQuiz(page, (i) => (i * 7) % 4);
      expect(server.correct).toBe(rebuild(body).correct);
      await page.locator(".actions button", { hasText: "Changer les réglages" }).click();
    }
  }
  // University-only topics are not offered at lycée.
  await page.click(".quiz-setup .segment >> text=Lycée");
  await expect(page.locator(".topics .topic", { hasText: "Séries" })).toHaveCount(0);
  await expect(page.locator(".topics .topic", { hasText: "Fonctions de plusieurs variables" })).toHaveCount(0);
});

test("graph questions are drawn: the given curve, and four curves or planes to choose from", async ({ page }) => {
  await chooseTopics(page, ["Lecture graphique"]);
  await page.click("text=Commencer le test");
  await page.locator(".choices").waitFor();
  let drawnOptions = 0;
  for (let i = 0; i < 10; i++) {
    await expect(page.locator(".quiz-count")).toHaveText(`Question ${i + 1} / 10`);
    const graphs = await page.locator(".choices svg.graph").count();
    expect([0, 4]).toContain(graphs);
    if (graphs === 4) {
      drawnOptions += 1;
      // A drawn option is named by its letter, not by its formula (which would give it away).
      await expect(page.locator(".choices svg.graph").first()).toHaveAttribute("aria-label", "Réponse A");
      await expect(page.locator(".choices svg.graph path.g-curve, .choices svg.graph polygon.g-plane").first()).toBeVisible();
    }
    if (i < 9) await page.locator(".quiz .actions button.primary").click();
  }
  expect(drawnOptions).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test("typed answers: the number typed is graded by the server, a wrong option typed is named as its mistake", async ({ page }) => {
  await page.click("text=Université");
  await chooseTopics(page, ["Probabilités", "Matrices et systèmes"]);
  await page.click("text=Au clavier");
  await expect(page.locator(".mode-hint")).toBeVisible();
  await page.click("text=Commencer le test");

  // First pass: whatever is typed, the browser, the server and a rebuild agree.
  const first = await takeMixedQuiz(page, () => "0", () => 0);
  expect(first.body.mode).toBe("typed");
  const { questions } = rebuild(first.body);
  expect(first.typedAt).toEqual(questions.flatMap((q, i) => (typeable(q) ? [i] : [])));
  expect(first.typedAt.length).toBeGreaterThan(0);
  for (const i of first.typedAt) expect(first.body.answers[i]).toBe("0");
  expect(first.server.correct).toBe(rebuild(first.body).correct);

  // Same test again: the right value at one typed question in two (a rounding with a comma),
  // a wrong option's value at the others; the right option elsewhere.
  await page.click("text=Refaire le même test");
  const wrongAt = first.typedAt.filter((_, k) => k % 2 === 1);
  const valueOf = (i: number, right: boolean): string => {
    const q = questions[i]!;
    const option = right ? q.options[q.correct]! : q.options.find((_, j) => j !== q.correct)!;
    return option.num!.toFixed(4).replace(".", ",");
  };
  const second = await takeMixedQuiz(page, (i) => valueOf(i, !wrongAt.includes(i)), (i) => questions[i]!.correct);
  expect(second.body.seed).toBe(first.body.seed);
  expect(second.server.correct).toBe(questions.length - wrongAt.length);
  await expect(page.locator(".big-score")).toHaveText(`${second.server.correct} / ${questions.length}`);
  // Each wrong value typed is recognised as the option it stands for, and its mistake named.
  await expect(page.locator(".review-line.mistake")).toHaveCount(wrongAt.length);
  await expect(page.locator(".badge.is-typed")).toHaveCount(first.typedAt.length);

  // The server takes text only in a typed test, and only short text.
  const post = (data: object) => page.request.post("/api/quizzes", { data });
  expect((await post({ ...first.body, mode: "choices" })).status()).toBe(400);
  expect((await post({ ...first.body, mode: "spoken" })).status()).toBe(400);
  const long = first.body.answers.map((a) => (typeof a === "string" ? "1".repeat(41) : a));
  expect((await post({ ...first.body, answers: long })).status()).toBe(400);
});

test("typed answers: the field reads what is typed, and the symbol keys insert where the cursor is", async ({ page }) => {
  await page.click("text=Université");
  await chooseTopics(page, ["Probabilités"]);
  await page.click("text=Au clavier");
  await page.click("text=Commencer le test");
  // Move to the first typed question.
  for (let i = 0; i < 10 && (await page.locator(".typed-input").count()) === 0; i++) {
    await page.locator(".quiz .actions button.primary").click();
  }
  const input = page.locator(".typed-input");
  await expect(input).toBeFocused();
  await input.fill("2");
  await page.locator(".typed-key", { hasText: "π" }).click();
  await input.press("End");
  await input.type("/3");
  await expect(input).toHaveValue("2π/3");
  await expect(page.locator(".typed .typed-reading")).toHaveText("≈ 2,0944");
  await input.fill("2/");
  await expect(page.locator(".typed .typed-reading")).toHaveText("Écriture non reconnue");
  // The digits typed are not taken as option shortcuts.
  await input.fill("3");
  await expect(input).toHaveValue("3");
  await expect(page.locator(".choice.on")).toHaveCount(0);
});
