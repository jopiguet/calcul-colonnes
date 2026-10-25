import { expect, test, type Page } from "@playwright/test";
import { goHome, newPlayer, openActivity, userByName } from "./helpers";

/** The two invented German books: "Test words" (German–English) and "School words" (German–French). */
/** The word list of the book's first lesson (the lesson unfolded first, if it is not). */
async function openWords(page: Page): Promise<void> {
  const lesson = page.locator(".vocab-lesson").first();
  if (!(await lesson.evaluate((d) => (d as HTMLDetailsElement).open))) await lesson.locator("summary").click();
  await page.click(".vocab-words-link");
  await page.locator(".vocab-words-page").waitFor();
}

async function germanBooks(page: Page): Promise<{ id: number; slug: string; lessons: { id: number; sections: { id: number }[] }[] }[]> {
  const books = (await (await page.request.get("/api/vocab/books")).json()) as { id: number; slug: string; term: string; lessons: { id: number; sections: { id: number }[] }[] }[];
  return books.filter((b) => b.term === "de");
}

test("a language with two books: one card, sessions across the books ticked, each book on its own", async ({ page }) => {
  const name = await newPlayer(page, "Shelf");
  const user = await userByName(page.request, name);
  await goHome(page);
  // One card for German, none for each book.
  await expect(page.locator("[data-activity='vocab-shelf-de']")).toContainText("Vocabulaire allemand");
  await expect(page.locator("[data-activity='vocab-shelf-de'] .activity-text")).toHaveText("Test words · School words");
  await expect(page.locator("[data-activity='vocab-test-german'], [data-activity='vocab-test-german-school']")).toHaveCount(0);

  await openActivity(page, "vocab-shelf-de");
  await expect(page.locator(".vocab-shelf h1")).toHaveText("Vocabulaire allemand");
  await expect(page.locator(".vocab-shelf .vocab-source")).toHaveText("2 livres · 15 mots");
  await expect(page.locator(".vocab-shelf-book")).toHaveCount(2);

  // A session across both books: each card says which book its word is from.
  await page.click(".vocab-how >> text=Choix multiples");
  await page.click("text=Apprendre dans les livres cochés");
  await page.locator(".vocab-card").waitFor();
  await expect(page.locator(".quiz-count")).toHaveText(/\/ ?8$/);
  await expect(page.locator(".vocab-source-tag")).toHaveText(/^(Test words|School words)$/);
  const books = await germanBooks(page);
  const english = books.find((x) => x.slug === "test-german")!;
  const school = books.find((x) => x.slug === "test-german-school")!;
  const both = (await (await page.request.get(`/api/vocab/session?userId=${user.id}&kind=books&books=${english.id},${school.id}&purpose=learn&size=50&mode=choice`)).json()) as { source: string; answerLang: string; options: string[] }[];
  expect(new Set(both.map((c) => c.source))).toEqual(new Set(["Test words", "School words"]));
  // Wrong options from the word's own book: French meanings with French ones.
  const french = both.filter((c) => c.source === "School words" && c.answerLang === "fr");
  expect(french.length).toBeGreaterThan(0);
  for (const card of french) for (const option of card.options) expect(option).toMatch(/[a-zé' ]/);
  await page.click("text=Arrêter");

  // One book unticked: the sessions take the other only, and the choice is remembered.
  await openActivity(page, "vocab-shelf-de");
  await page.locator("[data-book='test-german'] input[type=checkbox]").uncheck();
  await expect(page.locator("[data-book='test-german'] input[type=checkbox]")).not.toBeChecked();
  await page.click("text=Apprendre dans les livres cochés");
  await page.locator(".vocab-card").waitFor();
  await expect(page.locator(".quiz-topic")).toHaveText("School words");
  await expect(page.locator(".vocab-source-tag")).toHaveCount(0);
  await page.click("text=Arrêter");

  // A book opened from the shelf, and back.
  await openActivity(page, "vocab-shelf-de");
  await page.click("[data-book='test-german-school'] >> text=Ouvrir");
  await expect(page.locator(".vocab-home .vocab-source")).toContainText("School words");
  await page.click("text=📚 Vocabulaire allemand : les 2 livres");
  await expect(page.locator(".vocab-shelf")).toBeVisible();

  // Apart: each book its own card on the home page, the shelf still one tap away.
  await page.click(".vocab-shelf-home >> text=Séparés");
  await goHome(page);
  await expect(page.locator("[data-activity='vocab-shelf-de']")).toHaveCount(0);
  await expect(page.locator("[data-activity='vocab-test-german']")).toBeVisible();
  await openActivity(page, "vocab-test-german-school");
  await page.click("text=📚 Vocabulaire allemand : les 2 livres");
  await page.click(".vocab-shelf-home >> text=Regroupés");
  await goHome(page);
  await expect(page.locator("[data-activity='vocab-shelf-de']")).toBeVisible();
});

test("homework: a whole section skipped and put back, a word skipped from its card", async ({ page }) => {
  const name = await newPlayer(page, "Home");
  const user = await userByName(page.request, name);
  await openActivity(page, "vocab-shelf-de");
  await page.click("[data-book='test-german-school'] >> text=Ouvrir");
  await openWords(page);

  // Section 1.2 is not in the homework: all its words out at once.
  const second = page.locator(".vocab-words-section").nth(1);
  await second.locator(".vocab-skip-section").click();
  await expect(second.locator(".vocab-word.is-skipped")).toHaveCount(5);
  await expect(second.locator(".vocab-skip-section")).toHaveText("Tout remettre");
  const school = (await germanBooks(page)).find((x) => x.slug === "test-german-school")!;
  const progress = (await (await page.request.get(`/api/vocab/progress?userId=${user.id}`)).json()) as { sections: Record<number, { skipped: number }> };
  expect(progress.sections[school.lessons[0]!.sections[1]!.id]?.skipped).toBe(5);
  // A learning session on the book: only the words of 1.1.
  await page.click("text=← Vocabulaire allemand");
  await page.click(".vocab-how >> text=Choix multiples");
  await page.click("text=Apprendre dans tout le livre");
  await page.locator(".vocab-card").waitFor();
  await expect(page.locator(".quiz-count")).toHaveText(/\/ ?5$/);

  // One word skipped from its card, after answering: out of this session and the next ones.
  await page.locator(".choices .choice").first().click();
  await page.click(".vocab-skip-card");
  await expect(page.locator(".vocab-skipped-note")).toContainText("ne reviendra plus");
  const skips = (await (await page.request.get(`/api/vocab/progress?userId=${user.id}`)).json()) as { sections: Record<number, { skipped: number }> };
  expect(skips.sections[school.lessons[0]!.sections[0]!.id]?.skipped).toBe(1);
  await page.click("text=Arrêter");
  await page.click(".vocab-done .actions button >> nth=-1");

  // Put back: the section's words again, with no box lost.
  await openWords(page);
  await page.locator(".vocab-words-section").nth(1).locator(".vocab-skip-section").click();
  await expect(page.locator(".vocab-words-section").nth(1).locator(".vocab-word.is-skipped")).toHaveCount(0);
});

test("German printed with its forms, French answered with or without the article", async ({ page }) => {
  const name = await newPlayer(page, "Forms");
  const user = await userByName(page.request, name);
  const school = (await germanBooks(page)).find((b) => b.slug === "test-german-school")!;
  const lesson = (await (await page.request.get(`/api/vocab/lessons/${school.lessons[0]!.id}/words?userId=${user.id}`)).json()) as { sections: { words: { id: number; term: string }[] }[] };
  const words = lesson.sections.flatMap((section) => section.words);
  const entry = (term: string): number => words.find((w) => w.term.startsWith(term))!.id;
  // Section 1.1 (5 words, all new in one session), asked in writing where it can be.
  const cards = (await (await page.request.get(`/api/vocab/session?userId=${user.id}&kind=section&id=${school.lessons[0]!.sections[0]!.id}&purpose=learn&size=20&mode=written`)).json()) as { entryId: number; mode: string }[];
  const answer = (entryId: number, direction: "recognise" | "recall", given: string) =>
    page.request.post("/api/vocab/answers", { data: { userId: user.id, entryId, direction, mode: "written", given } }).then((r) => r.json()) as Promise<{ verdict: string }>;
  // The verb with its forms is asked in writing: the infinitive is enough.
  expect(cards.find((c) => c.entryId === entry("finden"))?.mode).toBe("written");
  expect(await answer(entry("finden"), "recall", "finden")).toMatchObject({ verdict: "right" });
  expect(await answer(entry("die Ehre, -n"), "recall", "die Ehre")).toMatchObject({ verdict: "right" });
  expect(await answer(entry("die Ehre, -n"), "recall", "Ehre")).toMatchObject({ verdict: "article" });
  expect(await answer(entry("(sich) an|sehen"), "recall", "ansehen")).toMatchObject({ verdict: "right" });
  // The meaning, in French: the article is optional.
  expect(await answer(entry("die Geduld"), "recognise", "patience")).toMatchObject({ verdict: "right" });
  expect(await answer(entry("die Ehre, -n"), "recognise", "honneur")).toMatchObject({ verdict: "right" });
});
