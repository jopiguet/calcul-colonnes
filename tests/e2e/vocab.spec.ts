import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { VocabProgress } from "../../shared/types.ts";
import { newPlayer, signUp, userByName } from "./helpers";

interface Entry { en: string; es: string }
const fixture = JSON.parse(readFileSync("tests/e2e/fixtures/vocab.json", "utf8")) as {
  lessons: { sections: { entries: Entry[] }[] }[];
};
const entries: Entry[] = fixture.lessons.flatMap((l) => l.sections.flatMap((s) => s.entries));
/** The right answer to a card, from the fixture: Spanish shown → English, and back. */
function answerTo(prompt: string): string {
  const found = entries.find((e) => e.es === prompt) ?? entries.find((e) => e.en === prompt);
  if (!found) throw new Error(`not in the fixture: ${prompt}`);
  return found.es === prompt ? found.en : found.es;
}

/** After an answer, Continue takes the focus: Enter goes on to the next card. */
async function next(page: Page): Promise<void> {
  await expect(page.locator(".vocab-card .actions button.primary")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".vocab-verdict")).toHaveCount(0);
}

async function openVocab(page: Page): Promise<void> {
  await page.click("text=💬 Vocabulaire");
  await page.locator(".vocab-home").waitFor();
}

async function startFirstSection(page: Page): Promise<void> {
  const lesson = page.locator(".vocab-lesson").first();
  if (!(await lesson.evaluate((d) => (d as HTMLDetailsElement).open))) await lesson.locator("summary").click();
  await lesson.locator(".vocab-section button").first().click();
  await page.locator(".vocab-card").waitFor();
}

test("lessons and sections come from the vocabulary file", async ({ page }) => {
  await newPlayer(page, "Voc");
  await openVocab(page);
  await expect(page.locator(".vocab-lesson")).toHaveCount(2);
  await expect(page.locator(".vocab-lesson-title-es").first()).toHaveText("En el colegio");
  await page.locator(".vocab-lesson summary").first().click();
  await expect(page.locator(".vocab-lesson").first().locator(".vocab-section")).toHaveCount(2);
  await expect(page.locator(".vocab-section-title-es").first()).toHaveText("El aula");
  await expect(page.locator(".vocab-due-count")).toHaveText("Rien à réviser pour le moment.");
});

test("multiple choice: new words, a wrong answer asked again at the end, boxes on the server", async ({ page }) => {
  const name = await newPlayer(page, "Mcq");
  await openVocab(page);
  await startFirstSection(page);

  const total = Number((await page.locator(".quiz-count").innerText()).split("/")[1]);
  expect(total).toBe(8); // at most 8 new words in a session
  let missed: string | null = null;
  for (let i = 0; i < 20; i++) {
    if (await page.locator(".vocab-done").count()) break;
    const prompt = await page.locator(".vocab-prompt").innerText();
    const options = await page.locator(".choice-text").allInnerTexts();
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
    const right = answerTo(prompt);
    expect(options).toContain(right);
    const wrongOnPurpose = i === 0;
    const pick = wrongOnPurpose ? options.findIndex((o) => o !== right) : options.indexOf(right);
    await page.keyboard.press(String(pick + 1));
    await expect(page.locator(".vocab-verdict")).toHaveText(wrongOnPurpose ? `✗ La réponse : ${right}` : "✓ Juste");
    if (wrongOnPurpose) missed = prompt;
    await next(page);
  }
  await expect(page.locator(".vocab-done .big-score")).toHaveText("8 justes sur 9"); // the missed word, right the 2nd time
  await expect(page.locator(".vocab-missed li")).toHaveCount(1);
  await expect(page.locator(".vocab-missed-prompt")).toHaveText(missed!);

  const user = await userByName(page.request, name);
  const progress = (await (await page.request.get(`/api/vocab/progress?userId=${user.id}`)).json()) as VocabProgress;
  const section = Object.values(progress.sections).find((s) => s.learning > 0)!;
  expect(section.learning).toBe(8);
  expect(progress.today).toEqual({ answers: 9, right: 8 });
});

test("written answers: accents tolerated, article required, Spanish letters", async ({ page }) => {
  await newPlayer(page, "Wri");
  await openVocab(page);
  await page.click("text=Écrit");
  await startFirstSection(page);

  // First card: Spanish shown, English answer.
  const prompt = await page.locator(".vocab-prompt").innerText();
  await expect(page.locator(".vocab-write .field-label")).toHaveText("Réponse en anglais");
  await page.fill(".vocab-input", `the ${answerTo(prompt)}`);
  await page.keyboard.press("Enter");
  await expect(page.locator(".vocab-verdict")).toHaveText("✓ Juste");

  // The server grades Spanish too: accents, articles.
  const user = (await (await page.request.get("/api/users")).json()) as { id: number }[];
  const userId = user[0]!.id;
  const lessons = (await (await page.request.get("/api/vocab/lessons")).json()) as { id: number }[];
  const food = lessons[1]!.id;
  const cardOf = async (lesson: number, prompt: string): Promise<number> => {
    const cards = (await (await page.request.get(`/api/vocab/session?userId=${userId}&kind=lesson&id=${lesson}&size=40&mode=choice`)).json()) as { entryId: number; prompt: string }[];
    const card = cards.find((c) => c.prompt === prompt);
    expect(card, prompt).toBeTruthy();
    return card!.entryId;
  };
  // A lesson the screens above have not touched: its first words are all new.
  const banana = await cardOf(food, "el plátano");
  const post = (entryId: number, direction: string, mode: string, given: string) =>
    page.request.post("/api/vocab/answers", { data: { userId, entryId, direction, mode, given } })
      .then((r) => r.json()) as Promise<{ verdict: string; correct: boolean; feminine: boolean; expected: string }>;
  expect(await post(banana, "recall", "written", "plátano")).toMatchObject({ verdict: "article", correct: false, expected: "el plátano" });
  expect(await post(banana, "recall", "written", "El Plátano.")).toMatchObject({ verdict: "right", correct: true });
  expect(await post(banana, "recall", "written", "el platano")).toMatchObject({ verdict: "accent", correct: true });
  expect(await post(banana, "recall", "choice", "el platano")).toMatchObject({ verdict: "wrong" }); // a choice is exact

  // Water recognised once; banana's Spanish card was started above.
  await page.click("text=Arrêter");
  if (await page.locator(".vocab-done").count()) await page.click("text=Retour aux leçons");
  const water = await cardOf(food, "el agua");
  expect(await post(water, "recognise", "choice", "water")).toMatchObject({ verdict: "right" });
  // Right again ten seconds later: ahead of its review, so it stays in box 1.
  expect(await post(water, "recognise", "choice", "water")).toMatchObject({ verdict: "right", correct: true });

  // Reviewing the food lesson, written: those two cards come back.
  await page.reload();
  await page.locator(".vocab-home").waitFor();
  const foodLesson = page.locator(".vocab-lesson").nth(1);
  if (!(await foodLesson.evaluate((d) => (d as HTMLDetailsElement).open))) await foodLesson.locator("summary").click();
  await foodLesson.locator("text=Réviser la leçon").click();
  await page.locator(".vocab-card").waitFor();
  await expect(page.locator(".quiz-count")).toHaveText("1 / 2");
  for (let i = 0; i < 2; i++) {
    const prompt = await page.locator(".vocab-prompt").innerText();
    if (prompt === "el agua") {
      // A feminine noun with "el" is marked on the Spanish side.
      await expect(page.locator(".vocab-notes .vocab-fem")).toBeVisible();
      await page.fill(".vocab-input", "water");
    } else {
      expect(prompt).toBe("banana");
      await expect(page.locator(".vocab-ask")).toContainText("espagnol");
      await page.fill(".vocab-input", "el pl");
      await page.click(".vocab-letter:text('á')");
      await expect(page.locator(".vocab-input")).toHaveValue("el plá");
      await page.keyboard.type("tano");
    }
    await page.keyboard.press("Enter");
    await expect(page.locator(".vocab-verdict")).toHaveText("✓ Juste");
    await next(page);
  }
  await expect(page.locator(".vocab-done .big-score")).toHaveText("2 justes sur 2");
});

test("vocabulary progress belongs to the account's players only", async ({ page, browser }) => {
  const name = await newPlayer(page, "Own");
  const user = await userByName(page.request, name);
  expect((await page.request.get(`/api/vocab/session?userId=${user.id}&kind=due&size=5`)).status()).toBe(200);
  expect((await page.request.get(`/api/vocab/session?userId=${user.id}&kind=section&size=5`)).status()).toBe(400);
  expect((await page.request.get(`/api/vocab/session?userId=${user.id}&kind=due&size=500`)).status()).toBe(400);

  const context = await browser.newContext();
  const other = await context.newPage();
  await signUp(other);
  expect((await other.request.get(`/api/vocab/progress?userId=${user.id}`)).status()).toBe(404);
  expect((await other.request.get(`/api/vocab/session?userId=${user.id}&kind=due&size=5`)).status()).toBe(404);
  const answer = await other.request.post("/api/vocab/answers", {
    data: { userId: user.id, entryId: 1, direction: "recognise", mode: "choice", given: "pencil" },
  });
  expect(answer.status()).toBe(404);
  await context.close();
});

test("reviewing a lesson or everything brings back only words already learnt, without moving them up", async ({ page }) => {
  const name = await newPlayer(page, "Rev");
  const user = await userByName(page.request, name);
  await openVocab(page);
  await expect(page.locator("text=Réviser tout le vocabulaire")).toHaveCount(0); // nothing learnt yet

  // Three words learnt through the API: recognised once, right.
  const lessons = (await (await page.request.get("/api/vocab/lessons")).json()) as { id: number; sections: { id: number }[] }[];
  const section = lessons[0]!.sections[0]!.id;
  const cards = (await (await page.request.get(`/api/vocab/session?userId=${user.id}&kind=section&id=${section}&purpose=learn&size=3&mode=choice`)).json()) as { entryId: number; prompt: string }[];
  expect(cards).toHaveLength(3);
  for (const card of cards) {
    const r = await page.request.post("/api/vocab/answers", {
      data: { userId: user.id, entryId: card.entryId, direction: "recognise", mode: "choice", given: answerTo(card.prompt) },
    });
    expect(((await r.json()) as { box: number }).box).toBe(1);
  }
  const learnt = cards.map((c) => c.prompt);

  for (const button of ["Réviser la leçon", "Réviser tout le vocabulaire"]) {
    await page.reload();
    await page.locator(".vocab-home").waitFor();
    if (button === "Réviser la leçon") {
      const lesson = page.locator(".vocab-lesson").first();
      if (!(await lesson.evaluate((d) => (d as HTMLDetailsElement).open))) await lesson.locator("summary").click();
    }
    await page.click(`text=${button}`);
    await page.locator(".vocab-card").waitFor();
    await expect(page.locator(".quiz-count")).toHaveText("1 / 3");
    for (let i = 0; i < 3; i++) {
      const prompt = await page.locator(".vocab-prompt").innerText();
      expect(learnt).toContain(prompt);
      const options = await page.locator(".choice-text").allInnerTexts();
      const response = page.waitForResponse("**/api/vocab/answers");
      await page.keyboard.press(String(options.indexOf(answerTo(prompt)) + 1));
      // Right, but ahead of its review: the word stays in box 1.
      expect(((await (await response).json()) as { box: number; correct: boolean })).toMatchObject({ box: 1, correct: true });
      await next(page);
    }
    await expect(page.locator(".vocab-done .big-score")).toHaveText("3 justes sur 3");
    await page.click("text=Retour aux leçons");
  }
});
