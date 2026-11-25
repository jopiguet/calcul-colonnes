import { expect, test, type Page } from "@playwright/test";
import type { VocabBookInfo, VocabCard } from "../../shared/types.ts";
import { goHome, newPlayer, openActivity, userByName } from "./helpers";

// The note books (content/notes), imported by the server at start, shared with every account.
async function noteBook(page: Page, slug: string): Promise<VocabBookInfo> {
  const books = (await (await page.request.get("/api/vocab/books")).json()) as VocabBookInfo[];
  return books.find((b) => b.slug === slug)!;
}

async function firstCard(page: Page, activity: string): Promise<void> {
  await openActivity(page, activity);
  const lesson = page.locator(".vocab-lesson").first();
  if (!(await lesson.evaluate((d) => (d as HTMLDetailsElement).open))) await lesson.locator("summary").click();
  await lesson.locator(".vocab-section button").first().click();
  await page.locator(".vocab-card").waitFor();
}

test("notes: two books in the Sons group, for every account", async ({ page }) => {
  await newPlayer(page, "Notes");
  await goHome(page);
  const group = page.locator(".activity-group[data-group='sounds']");
  await expect(group.locator("[data-activity='vocab-notes-ear']")).toContainText("Notes à l'oreille");
  await expect(group.locator("[data-activity='vocab-notes-ear']")).toContainText("Écouter une note, la nommer");
  await expect(group.locator("[data-activity='vocab-notes-staff']")).toContainText("Notes sur la portée");
  expect((await noteBook(page, "notes-ear")).visibility).toBe("shared");
});

test("notes by ear: the sound is the question, the names in French", async ({ page }) => {
  await newPlayer(page, "Ear");
  await firstCard(page, "vocab-notes-ear");
  await expect(page.locator(".vocab-ask")).toHaveText("Quelle note ?");
  await expect(page.locator(".vocab-sound-audio")).toHaveAttribute("src", /^\/api\/vocab\/sounds\/[0-9a-f]{64}$/);
  await expect(page.locator(".vocab-picture")).toHaveCount(0);
  const options = await page.locator(".choice").allTextContents();
  expect(options.length).toBe(4);
  expect(options.every((o) => /(do|ré|mi|fa|sol|la|si)$/u.test(o.trim()))).toBe(true);
  await page.locator(".choice").first().click();
  await expect(page.locator(".vocab-prompt")).toHaveText(/^[A-G]\d$/);
  await expect(page.locator(".vocab-group")).toHaveText("après do");
});

test("notes on the staff: the staff is the question, its sound comes with the answer", async ({ page }) => {
  await newPlayer(page, "Staff");
  await firstCard(page, "vocab-notes-staff");
  await expect(page.locator(".vocab-ask")).toHaveText("Quelle note ?");
  await expect(page.locator(".vocab-picture img")).toHaveAttribute("src", /^\/api\/vocab\/images\/[0-9a-f]{64}$/);
  await expect(page.locator(".vocab-sound-audio")).toHaveCount(0);
  await page.locator(".choice").first().click();
  await expect(page.locator(".vocab-sound-audio")).toHaveCount(1);
  await expect(page.locator(".vocab-prompt")).toHaveText(/^[A-G]\d$/);
  await expect(page.locator(".vocab-group")).toHaveText("clé de sol");
});

test("notes: a sharp answered as C#, Db or do#; a natural in any of the three languages", async ({ page }) => {
  const name = await newPlayer(page, "Sharp");
  const user = await userByName(page.request, name);
  const book = await noteBook(page, "notes-ear");
  // The first lesson (naturals) and the second (sharps and flats), each a session of its own.
  const lesson = async (i: number) =>
    (await (await page.request.get(`/api/vocab/session?userId=${user.id}&kind=lesson&id=${book.lessons[i]!.id}&size=20&mode=written&lang=fr`)).json()) as VocabCard[];
  const cards = [...(await lesson(0)), ...(await lesson(1))];
  const card = (prompt: string) => cards.find((c) => c.prompt === prompt)!;
  const answer = async (prompt: string, given: string): Promise<boolean> =>
    ((await (await page.request.post("/api/vocab/answers", { data: { userId: user.id, entryId: card(prompt).entryId, direction: "recognise", mode: "written", given, lang: "fr" } })).json()) as { correct: boolean }).correct;
  expect(cards.some((c) => c.prompt === "C♯/D♭4")).toBe(true);
  expect([await answer("C♯/D♭4", "C#"), await answer("C♯/D♭4", "Db"), await answer("C♯/D♭4", "do#"), await answer("C♯/D♭4", "ré bémol"), await answer("C♯/D♭4", "do")]).toEqual([true, true, true, true, false]);
  expect([await answer("D4", "ré"), await answer("D4", "re"), await answer("D4", "D"), await answer("D4", "D#")]).toEqual([true, true, true, false]);
});
