import { expect, test, type Page } from "@playwright/test";
import type { VocabAnswerResult, VocabCard } from "../../shared/types.ts";
import { newPlayer, openActivity, userByName } from "./helpers";

/** The invented test book (fixtures/characters.json), interface in French. */
const SOUNDS: Record<string, string> = { あ: "a", い: "i", う: "u", え: "e", お: "o", か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko" };
const FRENCH: Record<string, string> = { 一: "un", 二: "deux", 三: "trois", 日: "jour / soleil", 水: "eau", 学: "étudier / apprendre", 校: "école" };

interface Book { id: number; slug: string; credit: string; lessons: { id: number; sections: { id: number }[] }[] }

async function bookOf(page: Page, slug: string): Promise<Book> {
  const books = (await (await page.request.get("/api/vocab/books")).json()) as Book[];
  return books.find((b) => b.slug === slug)!;
}

async function cardsOf(page: Page, query: string): Promise<VocabCard[]> {
  const response = await page.request.get(`/api/vocab/session?${query}`);
  expect(response.status()).toBe(200);
  return (await response.json()) as VocabCard[];
}

function answer(page: Page, data: Record<string, unknown>): Promise<{ status: number; body: VocabAnswerResult }> {
  return page.request.post("/api/vocab/answers", { data }).then(async (r) => ({ status: r.status(), body: (await r.json()) as VocabAnswerResult }));
}

test("the Characters book: kana by their sound, a kanji's meaning in French, its readings in kana or rōmaji", async ({ page }) => {
  const name = await newPlayer(page, "Kana");
  const user = await userByName(page.request, name);
  await openActivity(page, "vocab-test-characters");
  await expect(page.locator(".vocab-home h1")).toHaveText("Kanji et kana");
  await expect(page.locator(".vocab-source")).toContainText("17 caractères");
  await expect(page.locator(".vocab-credit")).toHaveText("Written for the tests.");
  // Rōmaji is part of the answer here: not a setting.
  await expect(page.locator(".vocab-romaji")).toHaveCount(0);

  // A kana: shown large, its sound chosen.
  const lesson = page.locator(".vocab-lesson").first();
  await lesson.locator("summary").click();
  await lesson.locator(".vocab-section button").first().click();
  await expect(page.locator(".vocab-ask")).toHaveText("Quel son ?");
  await expect(page.locator(".vocab-prompt")).toHaveClass(/vocab-glyph/);
  const kana = await page.locator(".vocab-prompt").innerText();
  const options = await page.locator(".choice-text").allInnerTexts();
  await page.keyboard.press(String(options.indexOf(SOUNDS[kana]!) + 1));
  await expect(page.locator(".vocab-verdict")).toHaveText("✓ Juste");

  // A kanji: the meaning in the interface's language, English otherwise.
  const book = await bookOf(page, "test-characters");
  const grade1 = book.lessons[1]!.id;
  const cards = await cardsOf(page, `userId=${user.id}&kind=lesson&id=${grade1}&purpose=learn&size=20&mode=choice&lang=fr`);
  const one = cards.find((c) => c.prompt === "一")!;
  expect(one).toMatchObject({ direction: "recognise", script: "kanji", answerLang: "fr" });
  expect(one.options).toContain("un");
  const english = await cardsOf(page, `userId=${user.id}&kind=lesson&id=${grade1}&purpose=learn&size=20&mode=choice`);
  expect(english.find((c) => c.prompt === "一")!.options).toContain("one");

  const right = await answer(page, { userId: user.id, entryId: one.entryId, direction: "recognise", mode: "written", given: "un", lang: "fr" });
  expect(right.body).toMatchObject({ verdict: "right", expected: "un", meaning: "un", readings: "イチ / ひと(つ)", note: "一つ (ひとつ) one" });

  // Reading: any one of the readings, in katakana, hiragana or rōmaji, okurigana or not.
  const read = (entryId: number, given: string) => answer(page, { userId: user.id, entryId, direction: "read", mode: "written", given, lang: "fr" });
  const sun = cards.find((c) => c.prompt === "日")!.entryId;
  for (const given of ["ニチ", "にち", "nichi", "jitsu", "hi", "ka"]) expect((await read(sun, given)).body.verdict, given).toBe("right");
  for (const given of ["ひとつ", "hito", "ichi"]) expect((await read(one.entryId, given)).body.verdict, given).toBe("right");
  expect((await read(sun, "mizu")).body.correct).toBe(false);
  // A kana has no reading to ask.
  const kanaCard = (await cardsOf(page, `userId=${user.id}&kind=lesson&id=${book.lessons[0]!.id}&purpose=learn&size=20&mode=choice`))[0]!;
  expect((await read(kanaCard.entryId, "a")).status).toBe(404);

  // In a review, the reading card: the kanji large, a reading typed, on and kun shown apart.
  await page.click("text=Arrêter");
  await page.click("text=Retour aux leçons");
  await page.click(".vocab-how >> text=Écrit");
  const grade = page.locator(".vocab-lesson").nth(1);
  await grade.locator("summary").click();
  await grade.locator(".vocab-whole >> text=Réviser la leçon").click();
  await page.locator(".vocab-card").waitFor();
  for (let i = 0; i < 3; i++) {
    const ask = await page.locator(".vocab-ask").innerText();
    const prompt = await page.locator(".vocab-prompt").innerText();
    if (ask === "Comment se lit-il ?" && prompt === "日") {
      await expect(page.locator(".vocab-prompt")).toHaveClass(/vocab-glyph/);
      await expect(page.locator(".vocab-write .field-label")).toHaveText("Une lecture : kana ou rōmaji");
      await page.fill(".vocab-input", "hi");
      await page.keyboard.press("Enter");
      await expect(page.locator(".vocab-verdict")).toHaveText("✓ Juste");
      await expect(page.locator(".vocab-kanji-meaning")).toHaveText("jour / soleil");
      await expect(page.locator(".vocab-kanji-readings")).toHaveText(["Onニチ · ジツ", "Kunひ · か"]);
      return;
    }
    await page.fill(".vocab-input", ask === "Comment se lit-il ?" ? "ichi" : (FRENCH[prompt] ?? ""));
    await page.keyboard.press("Enter");
    await expect(page.locator(".vocab-verdict")).toBeVisible();
    await page.keyboard.press("Enter");
  }
  throw new Error("no reading card in the review");
});

test("characters met in the player's words come first, and each book shows the other", async ({ page }) => {
  const name = await newPlayer(page, "Met");
  const user = await userByName(page.request, name);
  const words = await bookOf(page, "test-japanese");
  const school = (await cardsOf(page, `userId=${user.id}&kind=lesson&id=${words.lessons[1]!.id}&purpose=learn&size=20&mode=choice`)).find(
    (c) => c.prompt === "学校",
  )!;
  // The word's kanji, as the Characters book has them: not started yet.
  const word = await answer(page, { userId: user.id, entryId: school.entryId, direction: "recognise", mode: "choice", given: "school", lang: "fr" });
  expect(word.body.characters).toEqual([
    { term: "学", reading: "ガク / まな(ぶ)", meaning: "étudier / apprendre", started: false },
    { term: "校", reading: "コウ", meaning: "école", started: false },
  ]);

  // 学 and 校 come last in the book, but first among the new characters.
  const characters = await bookOf(page, "test-characters");
  const learn = await cardsOf(page, `userId=${user.id}&kind=all&id=${characters.id}&purpose=learn&size=30&mode=choice&order=book&lang=fr`);
  expect(learn.filter((c) => c.met).map((c) => c.prompt).sort()).toEqual(["校", "学"].sort());

  await openActivity(page, "vocab-test-characters");
  await expect(page.locator(".vocab-met-count")).toHaveText("2 caractères de vos mots attendent : ils viennent en premier parmi les nouveaux.");
  await page.click("text=Apprendre dans tout le livre");
  await page.locator(".vocab-card").waitFor();
  for (let i = 0; i < 8; i++) {
    const prompt = await page.locator(".vocab-prompt").innerText();
    const met = prompt === "校";
    if (met) await expect(page.locator(".vocab-met")).toHaveText("vu dans vos mots");
    await page.locator(".choice").first().click();
    await expect(page.locator(".vocab-verdict")).toBeVisible();
    if (met) {
      // The player's own word with it, with its rōmaji and meaning.
      await expect(page.locator(".vocab-related.is-words")).toContainText("学校");
      await expect(page.locator(".vocab-related.is-words")).toContainText("gakkō");
      return;
    }
    await page.keyboard.press("Enter");
  }
  throw new Error("校 was not among the new characters");
});
