import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { VocabProgress } from "../../shared/types.ts";
import { newPlayer, openActivity, signUp, userByName } from "./helpers";

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

/** The Spanish test book on the server, with its lessons. */
async function spanishBook(page: Page): Promise<{ id: number; lessons: { id: number; sections: { id: number }[] }[] }> {
  const books = (await (await page.request.get("/api/vocab/books")).json()) as { id: number; slug: string; lessons: { id: number; sections: { id: number }[] }[] }[];
  return books.find((b) => b.slug === "collins-spanish")!;
}

async function openVocab(page: Page): Promise<void> {
  await openActivity(page, "vocab-collins-spanish");
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
  const lessons = (await spanishBook(page)).lessons;
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
  await openVocab(page);
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
  const book = (await spanishBook(page)).id;
  expect((await page.request.get(`/api/vocab/session?userId=${user.id}&kind=all&id=${book}&purpose=due&size=5`)).status()).toBe(200);
  expect((await page.request.get(`/api/vocab/session?userId=${user.id}&kind=section&size=5`)).status()).toBe(400);
  expect((await page.request.get(`/api/vocab/session?userId=${user.id}&kind=all&id=${book}&purpose=due&size=500`)).status()).toBe(400);

  const context = await browser.newContext();
  const other = await context.newPage();
  await signUp(other);
  expect((await other.request.get(`/api/vocab/progress?userId=${user.id}`)).status()).toBe(404);
  expect((await other.request.get(`/api/vocab/session?userId=${user.id}&kind=all&id=${book}&purpose=due&size=5`)).status()).toBe(404);
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
  const lessons = (await spanishBook(page)).lessons;
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
    await openVocab(page);
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

test("the English book: definitions chosen, words written, a root of the same meaning accepted, the example shown", async ({ page }) => {
  const name = await newPlayer(page, "Eng");
  const user = await userByName(page.request, name);
  await openActivity(page, "vocab-test-english");
  await expect(page.locator(".vocab-home h1")).toHaveText("Vocabulaire anglais");
  await expect(page.locator(".vocab-lesson")).toHaveCount(3);

  // Written answers asked for, yet a definition is always multiple choice.
  await page.click("text=Écrit");
  const parts = page.locator(".vocab-lesson").nth(2);
  await parts.locator("summary").click();
  await parts.locator(".vocab-section-actions button").first().click();
  await page.locator(".vocab-card").waitFor();
  await expect(page.locator(".vocab-ask")).toHaveText("Que veut dire ?");
  await expect(page.locator(".vocab-input")).toHaveCount(0);
  const options = await page.locator(".choice-text").allInnerTexts();
  expect(options.filter((o) => o === "large").length).toBeLessThanOrEqual(1);
  const prompt = await page.locator(".vocab-prompt").innerText();
  const roots: Record<string, [string, string]> = {
    macro: ["large", "macroscopic"], magn: ["large", "magnify"], bene: ["good", "benefit"], chron: ["time", "chronology"], mono: ["one", "monologue"],
  };
  const [meaning, example] = roots[prompt]!;
  await page.keyboard.press(String(options.indexOf(meaning) + 1));
  await expect(page.locator(".vocab-verdict")).toHaveText("✓ Juste");
  await expect(page.locator(".vocab-note")).toHaveText(`Exemple : ${example}`);

  // The word itself can be written; "macro" is accepted for "large → magn".
  const books = (await (await page.request.get("/api/vocab/books")).json()) as { id: number; slug: string; lessons: { id: number }[] }[];
  const english = books.find((b) => b.slug === "test-english")!;
  // New in a learning session, or started above (then in a review): either way its id.
  const lessonId = english.lessons[2]!.id;
  const cards: { entryId: number; prompt: string }[] = [];
  for (const purpose of ["learn", "review"]) {
    const r = await page.request.get(`/api/vocab/session?userId=${user.id}&kind=lesson&id=${lessonId}&purpose=${purpose}&size=10&mode=written`);
    cards.push(...((await r.json()) as { entryId: number; prompt: string }[]));
  }
  const magn = cards.find((c) => c.prompt === "magn")!;
  expect(magn, "magn").toBeTruthy();
  const post = (given: string) =>
    page.request.post("/api/vocab/answers", { data: { userId: user.id, entryId: magn.entryId, direction: "recall", mode: "written", given } })
      .then((r) => r.json()) as Promise<{ verdict: string; correct: boolean; expected: string; note: string }>;
  expect(await post("magn")).toMatchObject({ verdict: "right", expected: "magn", note: "magnify" });
  expect(await post("macro")).toMatchObject({ correct: true });
  expect(await post("bene")).toMatchObject({ correct: false });
  expect(await post("magm")).toMatchObject({ verdict: "wrong" }); // 4 letters: too short for a typo

  // The home page counts the words due per book.
  await page.locator(".home-link").click();
  await expect(page.locator("[data-activity='vocab-test-english'] .activity-status")).not.toHaveText("20 mots");
});

test("an alphabetical book: new words at random across the book by default, or in the book's order", async ({ page }) => {
  await newPlayer(page, "Rnd");
  await openActivity(page, "vocab-test-english");
  await expect(page.locator(".vocab-order .segment.on")).toHaveText("Au hasard");

  const firstLesson = ["brisk", "candid", "dwindle", "eager", "feeble", "gleam", "hasty", "idle"];
  const prompts = async (): Promise<string[]> => {
    await page.locator(".vocab-card").waitFor();
    const seen: string[] = [];
    // Until the summary: mistakes are asked again at the end.
    while (!(await page.locator(".vocab-done").isVisible())) {
      seen.push(await page.locator(".vocab-prompt").innerText());
      await page.locator(".choice").first().click();
      await page.locator(".vocab-verdict").waitFor();
      await expect(page.locator(".vocab-card .actions button.primary")).toBeFocused();
      await page.keyboard.press("Enter");
      await page.locator(".vocab-done, .vocab-card:not(:has(.vocab-verdict))").first().waitFor();
    }
    return seen.slice(0, 8); // the repeats of mistakes come after
  };

  // At random: 8 of the 20 words, from the whole book (all 8 from the first lesson: 1 chance in 125,970).
  await page.click("text=Apprendre au hasard dans tout le livre");
  await expect(page.locator(".quiz-topic")).toHaveText("Tout le vocabulaire");
  const random = await prompts();
  expect(random).toHaveLength(8);
  expect(random.some((p) => !firstLesson.includes(p))).toBe(true);

  // In the book's order: the next words of the first lesson not seen yet.
  await page.click("text=Retour aux leçons");
  await page.click(".vocab-order >> text=Dans l'ordre du livre");
  await expect(page.locator(".vocab-order .segment.on")).toHaveText("Dans l'ordre du livre");
  await page.click("text=Apprendre dans tout le livre");
  await page.locator(".vocab-card").waitFor();
  const unseenFirst = firstLesson.filter((w) => !random.includes(w));
  const prompt = await page.locator(".vocab-prompt").innerText();
  // The session mixes its cards, but every new one is among the book's first unseen words.
  expect([...unseenFirst, ...["jovial", "keen", "lofty", "meek", "nimble", "odd", "placid"]]).toContain(prompt);
});
