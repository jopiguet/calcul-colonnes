import { expect, test, type Page } from "@playwright/test";
import type { VocabBookInfo, VocabCard } from "../../shared/types.ts";
import { goHome, newPlayer, openActivity, userByName } from "./helpers";

// An invented sound book (tones, invented birds): tests/e2e/fixtures/vocab-sounds.
async function birdsBook(page: Page): Promise<VocabBookInfo> {
  const books = (await (await page.request.get("/api/vocab/books")).json()) as VocabBookInfo[];
  return books.find((b) => b.slug === "test-birds")!;
}

test("sounds: a group of their own on the home page, kept out of the languages", async ({ page }) => {
  await newPlayer(page, "Bird");
  await goHome(page);
  const group = page.locator(".activity-group[data-group='sounds']");
  await expect(group.locator(".activity-group-title")).toHaveText("Sons");
  await expect(group.locator("[data-activity='vocab-test-birds']")).toContainText("Sons : Test birds");
  await expect(group.locator("[data-activity='vocab-test-birds']")).toContainText("5 enregistrements à découvrir");
  await expect(page.locator(".activity-group[data-group='languages'] [data-activity='vocab-test-birds']")).toHaveCount(0);
  // Its scientific names are Latin, but it is not on the Latin shelf.
  const latin = page.locator("[data-activity='vocab-shelf-la']");
  if (await latin.count()) expect(await latin.getAttribute("data-hides")).not.toContain("vocab-test-birds");
});

test("sounds: the recording is the question, the name comes with the answer, with the recording's credit", async ({ page }) => {
  await newPlayer(page, "Listen");
  await openActivity(page, "vocab-test-birds");
  const lesson = page.locator(".vocab-lesson").first();
  if (!(await lesson.evaluate((d) => (d as HTMLDetailsElement).open))) await lesson.locator("summary").click();
  await lesson.locator(".vocab-section button").first().click();
  await page.locator(".vocab-card").waitFor();
  await expect(page.locator(".vocab-ask")).toHaveText("Quel oiseau ?");
  const audio = page.locator(".vocab-sound-audio");
  await expect(audio).toHaveAttribute("src", /^\/api\/vocab\/sounds\/[0-9a-f]{64}$/);
  // The scientific name would give the bird away: not shown yet.
  await expect(page.locator(".vocab-prompt")).toHaveCount(0);
  await expect(page.locator(".choice")).toHaveCount(4);
  const src = (await audio.getAttribute("src"))!;
  const response = await page.request.get(src);
  expect([response.status(), response.headers()["content-type"]]).toEqual([200, "audio/wav"]);
  await page.locator(".choice").first().click();
  await expect(page.locator(".vocab-prompt")).toHaveText(/^Testus [a-z]+$/);
  await expect(page.locator(".vocab-note")).toContainText("Enregistrement : Invented tone");
  await expect(page.locator(".vocab-group")).toHaveText("chant");
});

test("sounds: only the songs at first, the call waits for its song; the scientific name is an answer", async ({ page }) => {
  const name = await newPlayer(page, "Calls");
  const user = await userByName(page.request, name);
  const book = await birdsBook(page);
  const cards = async (): Promise<VocabCard[]> =>
    (await (await page.request.get(`/api/vocab/session?userId=${user.id}&kind=all&id=${book.id}&size=20&mode=written&lang=fr`)).json()) as VocabCard[];
  const first = await cards();
  expect(first.map((c) => c.prompt).sort()).toEqual(["Testus primus", "Testus quartus", "Testus secundus", "Testus tertius"]);
  expect(first.every((c) => c.direction === "recognise" && /^[0-9a-f]{64}$/.test(c.audio ?? ""))).toBe(true);
  // Its name in French, its scientific name, its name in English: each is right; another bird's is not.
  const song = first.find((c) => c.prompt === "Testus primus")!;
  const answer = async (given: string): Promise<boolean> =>
    ((await (await page.request.post("/api/vocab/answers", { data: { userId: user.id, entryId: song.entryId, direction: "recognise", mode: "written", given, lang: "fr" } })).json()) as { correct: boolean }).correct;
  expect([await answer("premier oiseau de test"), await answer("Testus primus"), await answer("First test bird"), await answer("Testus secundus")]).toEqual([true, true, true, false]);
  // The call still waits: its song is not yet in box 3 (the waiting itself: npm run check:birds).
  expect((await cards()).some((c) => c.prompt === "Testus primus (call)")).toBe(false);
});
