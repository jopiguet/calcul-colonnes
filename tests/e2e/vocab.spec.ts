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
  await page.click("text=🗣️ Vocabulaire");
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

  // Water recognised twice (box 2): recall becomes available.
  await page.click("text=Arrêter");
  if (await page.locator(".vocab-done").count()) await page.click("text=Retour aux leçons");
  const water = await cardOf(food, "el agua");
  await post(water, "recognise", "choice", "water");
  await post(water, "recognise", "choice", "water");

  // Recognition at box 2: recall is offered in the next food session.
  await page.locator(".vocab-lesson summary").nth(1).click();
  await page.locator(".vocab-lesson").nth(1).locator(".vocab-section button").first().click();
  await page.locator(".vocab-card").waitFor();
  for (let i = 0; i < 10; i++) {
    if ((await page.locator(".vocab-prompt").innerText()) === "water" && (await page.locator(".vocab-ask").innerText()).includes("espagnol")) break;
    await page.fill(".vocab-input", "x");
    await page.keyboard.press("Enter");
    await page.locator(".vocab-verdict").waitFor();
    await next(page);
  }
  await expect(page.locator(".vocab-prompt")).toHaveText("water");
  await expect(page.locator(".vocab-fem")).toHaveCount(0); // the gender is not given away in recall
  await page.fill(".vocab-input", "el ag");
  await page.click(".vocab-letter:text('ü')");
  await expect(page.locator(".vocab-input")).toHaveValue("el agü");
  await page.keyboard.press("Backspace");
  await page.keyboard.type("ua");
  await page.keyboard.press("Enter");
  await expect(page.locator(".vocab-verdict")).toHaveText("✓ Juste");
  await expect(page.locator(".vocab-feedback .vocab-fem")).toHaveText(" (f)");
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
