import { expect, test } from "@playwright/test";
import { newPlayer, profileOf, rebuild, takeQuiz } from "./helpers";

test("mistakes come back in the next test until they are fixed", async ({ page, request }) => {
  const name = await newPlayer(page, "Rev");
  await page.click("text=📐 QCM");
  for (const topic of ["Intégrales", "Trigonométrie", "Limites", "Exponentielles et logarithmes"]) {
    await page.click(`.topic >> text=${topic}`);
  }
  await page.click("[aria-label='Moins de questions']");
  await expect(page.locator(".review-info")).toHaveText(/Rien à revoir/);

  // First test left blank: every kind met is to review.
  await page.click("text=Commencer le test");
  const first = await takeQuiz(page, () => -1);
  const kinds = new Set(rebuild(first.body).questions.map((q) => q.skill));
  let profile = await profileOf(request, name);
  expect(new Set(profile.skills.map((s) => s.skill))).toEqual(kinds);
  expect(profile.skills.every((s) => s.status === "review")).toBe(true);

  // Second test: about 40 % of it brings those kinds back, with a badge.
  await page.click("text=Changer les réglages");
  await expect(page.locator(".review-info")).toHaveText(new RegExp(`^${kinds.size} notion`));
  await page.click("text=Commencer le test");
  const second = await takeQuiz(page, (i) => i % 4);
  const rebuilt = rebuild(second.body);
  expect([...(second.body.focus ?? [])].sort()).toEqual([...kinds].sort());
  const reviews = rebuilt.questions.filter((q) => q.review);
  expect(reviews.length).toBe(2);
  expect(reviews.every((q) => kinds.has(q.skill))).toBe(true);
  await expect(page.locator(".review-item .badge.is-review")).toHaveCount(2);
  expect(second.server.correct).toBe(rebuilt.correct);

  // Progress page matches the server.
  await page.click("text=📈 Mes progrès");
  await page.locator(".progress-page").waitFor();
  profile = await profileOf(request, name);
  await expect(page.locator(".skill")).toHaveCount(profile.skills.length);
  for (const status of ["review", "learning", "mastered"]) {
    await expect(page.locator(`.skill.is-${status}`)).toHaveCount(profile.skills.filter((s) => s.status === status).length);
  }
});

test("the mistake behind each wrong answer is recorded and shown", async ({ page, request }) => {
  const name = await newPlayer(page, "Mis");
  await page.click("text=📐 QCM");
  await page.click("text=Commencer le test");
  const { body } = await takeQuiz(page, (i) => (i + 1) % 4);
  const { questions } = rebuild(body);

  // Expected mistakes: the label of each wrong option chosen.
  const expected = new Map<string, number>();
  questions.forEach((q, i) => {
    const given = body.answers[i]!;
    if (given === q.correct) return;
    const mistake = q.options[given]!.mistake!;
    expected.set(mistake, (expected.get(mistake) ?? 0) + 1);
  });

  const wrong = questions.filter((q, i) => body.answers[i] !== q.correct).length;
  await expect(page.locator(".review-line.mistake")).toHaveCount(wrong);

  const profile = await profileOf(request, name);
  expect(new Map(profile.mistakes.map((m) => [m.mistake, m.count]))).toEqual(expected);

  await page.click("text=📈 Mes progrès");
  await expect(page.locator(".mistake-item")).toHaveCount(Math.min(6, expected.size));
  const top = profile.mistakes[0]!;
  await expect(page.locator(".mistake-item").first().locator(".mistake-count")).toHaveText(`×${top.count}`);
});
