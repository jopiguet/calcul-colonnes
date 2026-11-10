import { expect, test, type Page } from "@playwright/test";
import { goHome, newPlayer, openActivity } from "./helpers";

/** The first Latin lesson, opened from the course page. */
async function firstLesson(page: Page): Promise<void> {
  await openActivity(page, "lessons-latin");
  await expect(page.locator(".lessons-home h1")).toContainText("Latin");
  await page.locator(".lessons-continue").click();
  await expect(page.locator(".lesson-title")).toContainText("1.");
}

const card = (page: Page, id: string) => page.locator(`.lesson-exercise[data-exercise='${id}']`);

test("a Latin lesson: strict, free and choice answers are marked and kept", async ({ page }) => {
  await newPlayer(page, "Lucia");
  await firstLesson(page);
  await expect(page.locator(".lesson-summary")).toBeVisible();
  await expect(page.locator(".lesson-vocab-table")).toBeVisible();

  // Strict answers: one wrong out of six; the expected answer is shown.
  const syllables = card(page, "syllables");
  for (const [i, v] of ["2", "3", "3", "2", "3", "4"].entries()) await syllables.locator(".lesson-input").nth(i).fill(v);
  await syllables.locator(".lesson-check").click();
  await expect(syllables.locator(".lesson-exercise-score")).toHaveText("5/6");
  await expect(syllables.locator(".lb-wrong")).toHaveCount(1);
  await expect(syllables.locator(".lesson-expected")).toContainText("5");

  // Choices: all right.
  const quantity = card(page, "quantity");
  for (const [i, n] of [1, 2, 0, 1, 2].entries()) await quantity.locator(".lesson-item").nth(i).locator(".lesson-option").nth(n).click();
  await quantity.locator(".lesson-check").click();
  await expect(quantity.locator(".lesson-exercise-score")).toHaveText("5/5");

  // A free answer that does not match a model: to check, then marked right by the player.
  const greetings = card(page, "greetings");
  await greetings.locator(".lesson-input").nth(0).fill("Bonjour !");
  await greetings.locator(".lesson-input").nth(1).fill("Adieu, mon ami");
  await greetings.locator(".lesson-check").click();
  await expect(greetings.locator(".lb-right")).toHaveCount(1);
  await expect(greetings.locator(".lb-check")).toHaveCount(1);
  await greetings.locator(".lesson-mark").first().click();
  await expect(greetings.locator(".lb-right")).toHaveCount(2);

  // Everything is kept: after a reload, on the course page and in the lesson.
  await page.reload();
  await openActivity(page, "lessons-latin");
  await expect(page.locator(".lessons-item").first().locator(".lessons-item-status")).toContainText("1/");
  await page.locator(".lessons-item").first().click();
  await expect(card(page, "syllables").locator(".lesson-exercise-score")).toHaveText("5/6");
  await expect(card(page, "greetings").locator(".lb-right")).toHaveCount(2);
});

test("the course vocabulary is a shared book", async ({ page }) => {
  await newPlayer(page, "Marcus");
  const books = (await (await page.request.get("/api/vocab/books")).json()) as { slug: string; visibility: string; lessons: unknown[] }[];
  const latin = books.find((b) => b.slug === "course-latin");
  expect(latin?.visibility).toBe("shared");
  expect(latin?.lessons.length).toBeGreaterThanOrEqual(31);
  await openActivity(page, "lessons-latin");
  await page.locator(".lessons-practise").click();
  await expect(page.locator(".vocab-lesson").first()).toBeVisible();
});

test("a lesson fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await newPlayer(page, "Tullia");
  await openActivity(page, "lessons-latin");
  await page.locator(".lessons-item").nth(29).click();
  await expect(page.locator(".lesson-title")).toContainText("30.");
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(wide).toBeLessThanOrEqual(1);
});

test("Egyptian: hieroglyphs in their font, the special letters, answers typed as they are read", async ({ page }) => {
  await newPlayer(page, "Nefert");
  await openActivity(page, "lessons-egyptian");
  await expect(page.locator(".lessons-item")).toHaveCount(21);
  await page.locator(".lessons-item").first().click();
  await expect(page.locator(".lesson-title")).toContainText("1.");
  // Signs in the text are set apart, in the hieroglyph font.
  const sign = page.locator(".script-signs.hiero").first();
  await expect(sign).toBeVisible();
  expect(await sign.evaluate((n) => getComputedStyle(n).fontFamily)).toContain("Egyptian Hieroglyphs");
  // The key row writes ꜥ where the cursor is; "nefer", "ꜥnkh", "netjer" are read by their consonants.
  const card = page.locator(".lesson-exercise[data-exercise='pronounce']");
  const inputs = card.locator(".lesson-input");
  await inputs.nth(0).fill("nefer");
  await inputs.nth(1).click();
  await card.locator(".lesson-key", { hasText: "ꜥ" }).click();
  await inputs.nth(1).pressSequentially("nkh");
  await expect(inputs.nth(1)).toHaveValue("ꜥnkh");
  for (const [i, v] of [[2, "neb"], [3, "per"], [4, "netjer"], [5, "hotep"]] as const) await inputs.nth(i).fill(v);
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("6/6");
  // The lesson's words: the signs, their reading under them.
  await expect(page.locator(".lesson-vocab-reading").first()).toHaveText("nfr");
});

test("Sumerian: cuneiform in its font, sign indices typed as digits", async ({ page }) => {
  await newPlayer(page, "Enheduana");
  await openActivity(page, "lessons-sumerian");
  await expect(page.locator(".lessons-item")).toHaveCount(12);
  await page.locator(".lessons-item").first().click();
  await expect(page.locator(".lesson-title")).toContainText("1.");
  const sign = page.locator(".script-signs.cuneiform").first();
  await expect(sign).toBeVisible();
  expect(await sign.evaluate((n) => getComputedStyle(n).fontFamily)).toContain("Cuneiform");
  // ĝ typed as g, ₂ as 2: diĝir, e₂, du₃.
  const card = page.locator(".lesson-exercise[data-exercise='values']");
  const inputs = card.locator(".lesson-input");
  for (const [i, v] of ["an", "digir", "e2", "ki", "lugal", "du3"].entries()) await inputs.nth(i).fill(v);
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("6/6");
  await expect(page.locator(".lesson-vocab-reading").first()).toHaveText("an");
});

test("Akkadian: the special letters, š typed as sh, macrons optional", async ({ page }) => {
  await newPlayer(page, "Hammurabi");
  await openActivity(page, "lessons-akkadian");
  await expect(page.locator(".lessons-item")).toHaveCount(14);
  await page.locator(".lessons-item").nth(8).click();
  await expect(page.locator(".lesson-title")).toContainText("9.");
  const card = page.locator(".lesson-exercise[data-exercise='forms']");
  const inputs = card.locator(".lesson-input");
  await inputs.nth(0).fill("damqat");
  await inputs.nth(1).click();
  await card.locator(".lesson-key", { hasText: "š" }).click();
  await inputs.nth(1).pressSequentially("almāku");
  await expect(inputs.nth(1)).toHaveValue("šalmāku");
  for (const [i, v] of [[2, "sharraku"], [3, "shalmu"], [4, "šalmata"]] as const) await inputs.nth(i).fill(v);
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("5/5");
});

test("Ancient Greek: answers in Greek letters or in transliteration, the Greek key row", async ({ page }) => {
  await newPlayer(page, "Sappho");
  await openActivity(page, "lessons-greek");
  await expect(page.locator(".lessons-item")).toHaveCount(24);
  await page.locator(".lessons-item").first().click();
  await expect(page.locator(".lesson-title")).toContainText("1.");
  const card = page.locator(".lesson-exercise[data-exercise='transliterate']");
  const inputs = card.locator(".lesson-input");
  await inputs.nth(0).fill("logos");
  // θεός typed with the key row, without accent.
  await inputs.nth(1).click();
  for (const k of ["θ", "ε", "ο", "ς"]) await card.locator(".lesson-key", { hasText: new RegExp(`^${k}$`) }).click();
  await expect(inputs.nth(1)).toHaveValue("θεος");
  for (const [i, v] of [[2, "psuche"], [3, "angelos"], [4, "khora"], [5, "mythos"]] as const) await inputs.nth(i).fill(v);
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("6/6");
  // A word in Greek letters, accents left out, for a Greek answer.
  const write = page.locator(".lesson-exercise[data-exercise='write']");
  for (const [i, v] of ["φιλοσοφια", "demokratia", "θεατρον", "kosmos"].entries()) await write.locator(".lesson-input").nth(i).fill(v);
  await write.locator(".lesson-check").click();
  await expect(write.locator(".lesson-exercise-score")).toHaveText("4/4");
  await expect(page.locator(".lesson-vocab-reading").first()).toHaveText("ho anthrōpos");
});

test("Persian: right-to-left runs in their font, answers in the script or in transliteration", async ({ page }) => {
  await newPlayer(page, "Parvin");
  await openActivity(page, "lessons-persian");
  await expect(page.locator(".lessons-item")).toHaveCount(18);
  await page.locator(".lessons-item").first().click();
  await expect(page.locator(".lesson-title")).toContainText("1.");
  // Persian words inside the text are isolated right-to-left runs, in Vazirmatn.
  const run = page.locator("bdi.script-arabic").first();
  await expect(run).toHaveAttribute("dir", "rtl");
  expect(await run.evaluate((n) => getComputedStyle(n).fontFamily)).toContain("Vazirmatn");
  await expect(page.locator(".lesson-vocab-reading").first()).toHaveText("ketâb");
  // Lesson 7: transliteration, script, key row.
  await openActivity(page, "lessons-persian");
  await page.locator(".lessons-item").nth(6).click();
  const card = page.locator(".lesson-exercise[data-exercise='conjugate']");
  const inputs = card.locator(".lesson-input");
  await inputs.nth(0).fill("miravam");
  await inputs.nth(1).fill("می‌بینیم");
  await inputs.nth(2).click();
  for (const k of ["م", "ی", "گ", "و", "ی", "ن", "د"]) await card.locator(".lesson-key", { hasText: new RegExp(`^${k}$`) }).click();
  await expect(inputs.nth(2)).toHaveValue("میگویند");
  await inputs.nth(3).fill("nemidanam");
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("4/4");
  // A wrong verb is still wrong.
  await inputs.nth(0).fill("raftam");
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("3/4");
});

test("Arabic: Naskh for the Arabic text, answers in the script or in transliteration", async ({ page }) => {
  await newPlayer(page, "Khalil");
  await openActivity(page, "lessons-arabic");
  await expect(page.locator(".lessons-item")).toHaveCount(22);
  await page.locator(".lessons-item").first().click();
  await expect(page.locator(".lesson-title")).toContainText("1.");
  const run = page.locator("bdi.script-arabic").first();
  await expect(run).toHaveAttribute("dir", "rtl");
  expect(await run.evaluate((n) => getComputedStyle(n).fontFamily)).toContain("Amiri");
  await expect(page.locator(".lesson-vocab-reading").first()).toHaveText("kitāb");
  const card = page.locator(".lesson-exercise[data-exercise='read']");
  const inputs = card.locator(".lesson-input");
  await inputs.nth(0).fill("bab");
  // بيت from the key row.
  await inputs.nth(1).click();
  for (const k of ["ب", "ي", "ت"]) await card.locator(".lesson-key", { hasText: new RegExp(`^${k}$`) }).click();
  await expect(inputs.nth(1)).toHaveValue("بيت");
  for (const [i, v] of [[2, "nūr"], [3, "shams"], [4, "qalam"]] as const) await inputs.nth(i).fill(v);
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("5/5");
  // A wrong word stays wrong: kalb is not qalam.
  await inputs.nth(4).fill("kalb");
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("4/5");
});

test("Hebrew: right-to-left runs, answers in the script or in transliteration", async ({ page }) => {
  await newPlayer(page, "Noa");
  await openActivity(page, "lessons-hebrew");
  await expect(page.locator(".lessons-item")).toHaveCount(19);
  await page.locator(".lessons-item").first().click();
  await expect(page.locator(".lesson-title")).toContainText("1.");
  const run = page.locator("bdi.script-hebrew").first();
  await expect(run).toHaveAttribute("dir", "rtl");
  expect(await run.evaluate((n) => getComputedStyle(n).fontFamily)).toContain("Noto Sans Hebrew");
  await expect(page.locator(".lesson-vocab-reading").first()).toHaveText("shalom");
  const card = page.locator(".lesson-exercise[data-exercise='read']");
  const inputs = card.locator(".lesson-input");
  await inputs.nth(0).fill("shalom");
  // בית from the key row.
  await inputs.nth(1).click();
  for (const k of ["ב", "י", "ת"]) await card.locator(".lesson-key", { hasText: new RegExp(`^${k}$`) }).click();
  await expect(inputs.nth(1)).toHaveValue("בית");
  // ch and tz are accepted for kh and ts.
  for (const [i, v] of [[2, "sefer"], [3, "melech"], [4, "eretz"]] as const) await inputs.nth(i).fill(v);
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("5/5");
  // A wrong word stays wrong: kesef is not sefer.
  await inputs.nth(2).fill("kesef");
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("4/5");
});

test("Malayalam: its font, answers in the script, ISO or Manglish, and the letter cards", async ({ page }) => {
  await newPlayer(page, "Meera");
  // The course's words and letters are on the home page with the other languages, even with no book of the language.
  await goHome(page);
  await expect(page.locator("[data-activity='vocab-course-malayalam']")).toContainText("Vocabulaire malayalam");
  await expect(page.locator("[data-activity='vocab-course-malayalam'] .activity-text")).toHaveText("🌴 Malayalam");
  await expect(page.locator("[data-activity='vocab-course-malayalam-letters']")).toContainText("Alphabet malayalam");
  await expect(page.locator("[data-activity='vocab-course-hebrew']")).toContainText("Vocabulaire hébreu");
  await openActivity(page, "lessons-malayalam");
  // 18 lessons and the compendium of proverbs.
  await expect(page.locator(".lessons-item")).toHaveCount(19);
  await page.locator(".lessons-item").nth(2).click();
  await expect(page.locator(".lesson-title")).toContainText("3.");
  const run = page.locator(".script-malayalam").first();
  await expect(run).toHaveAttribute("lang", "ml");
  expect(await run.evaluate((n) => getComputedStyle(n).fontFamily)).toContain("Noto Sans Malayalam");
  const card = page.locator(".lesson-exercise[data-exercise='read']");
  const inputs = card.locator(".lesson-input");
  // വീട് typed as Manglish, മരം in the script, പൂവ് with ISO marks, കടൽ with d for ṭ.
  for (const [i, v] of [[0, "veedu"], [1, "മരം"], [2, "pūvŭ"], [3, "kadal"]] as const) await inputs.nth(i).fill(v);
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("4/4");
  await inputs.nth(3).fill("kalam");
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("3/4");

  // The letter cards: a book of kind "characters", as the kana.
  await openActivity(page, "lessons-malayalam");
  await page.locator(".lessons-letters").click();
  await expect(page.locator(".vocab-home h1")).toHaveText("Alphabet malayalam");
  const lesson = page.locator(".vocab-lesson").first();
  await lesson.locator("summary").click();
  await lesson.locator(".vocab-section button").first().click();
  await expect(page.locator(".vocab-ask")).toHaveText("Quel son ?");
  await expect(page.locator(".vocab-prompt")).toHaveClass(/vocab-glyph/);
  const sounds: Record<string, string> = { "അ": "a", "ആ": "ā", "ഇ": "i", "ഈ": "ī", "ഉ": "u", "ഊ": "ū", "ഋ": "r̥" };
  const letter = await page.locator(".vocab-prompt").innerText();
  const options = await page.locator(".choice-text").allInnerTexts();
  await page.keyboard.press(String(options.indexOf(sounds[letter]!) + 1));
  await expect(page.locator(".vocab-verdict")).toHaveText("✓ Juste");
});

test("Quechua: sixteen lessons, five-vowel and Spanish spellings, ejectives from the key row", async ({ page }) => {
  await newPlayer(page, "Killa");
  await goHome(page);
  await expect(page.locator("[data-activity='vocab-course-quechua']")).toContainText("Vocabulaire quechua");
  await expect(page.locator("[data-activity='vocab-course-quechua'] .activity-text")).toHaveText("🦙 Quechua");
  await openActivity(page, "lessons-quechua");
  await expect(page.locator(".lessons-item")).toHaveCount(16);
  await page.locator(".lessons-item").first().click();
  await expect(page.locator(".lesson-title")).toContainText("1.");
  const card = page.locator(".lesson-exercise[data-exercise='official']");
  const inputs = card.locator(".lesson-input");
  // Qosqo and Wiraqocha, with the five vowels of the old spelling, are right.
  for (const [i, v] of [[0, "Qosqo"], [1, "khipu"], [2, "Wiraqocha"], [3, "Titiqaqa"]] as const) await inputs.nth(i).fill(v);
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("4/4");
  // The Spanish spelling of khipu misses the aspirate: wrong.
  await inputs.nth(1).fill("quipu");
  await card.locator(".lesson-check").click();
  await expect(card.locator(".lesson-exercise-score")).toHaveText("3/4");

  // Lesson 2: t' from the key row, and a plain t for an ejective is wrong.
  await openActivity(page, "lessons-quechua");
  await page.locator(".lessons-item").nth(1).click();
  const spell = page.locator(".lesson-exercise[data-exercise='spell']");
  const fields = spell.locator(".lesson-input");
  await fields.nth(0).click();
  await spell.locator(".lesson-key", { hasText: /^t'$/ }).click();
  await page.keyboard.type("anta");
  await expect(fields.nth(0)).toHaveValue("t'anta");
  for (const [i, v] of [[1, "qhatu"], [2, "tika"], [3, "phuyu"]] as const) await fields.nth(i).fill(v);
  await spell.locator(".lesson-check").click();
  await expect(spell.locator(".lesson-exercise-score")).toHaveText("3/4");
});
