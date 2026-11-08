import { expect, test } from "@playwright/test";
import { newPlayer, openActivity } from "./helpers";

const SOUND = /\/api\/courses\/[a-z]+\/sounds\/[0-9a-f]{12}\.mp3$/;

test("Egyptian: the letters of the table of signs and the words of the text can be listened to, not the exercises", async ({ page }) => {
  await newPlayer(page, "Ahmose");
  await openActivity(page, "lessons-egyptian");
  await page.locator(".lessons-item").nth(1).click();
  await expect(page.locator(".lesson-title")).toContainText("2.");
  // The vulture's letter, in the table of signs.
  const aleph = page.locator(".lesson-text td .sound-play[data-sound='ꜣ']").first();
  await expect(aleph).toBeVisible();
  await expect(aleph).toHaveAttribute("title", /Écouter/);
  // An italic word of the text, with its school reading.
  const rn = page.locator(".lesson-text em + .sound-play[data-sound='rn']").first();
  await expect(rn).toHaveAttribute("title", "Écouter « ren » (voix de synthèse)");
  const [response] = await Promise.all([page.waitForResponse((r) => SOUND.test(r.url())), rn.click()]);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("audio/mpeg");
  // Nothing in the exercises: it would give the answers away.
  await expect(page.locator(".lesson-exercise .sound-play")).toHaveCount(0);
});

test("Malayalam: the letter is said once the card is answered", async ({ page }) => {
  await newPlayer(page, "Lakshmi");
  await openActivity(page, "lessons-malayalam");
  await page.locator(".lessons-item").first().click();
  await expect(page.locator(".lesson-text .script-malayalam + .sound-play").first()).toBeVisible();
  await openActivity(page, "lessons-malayalam");
  await page.locator(".lessons-letters").click();
  const lesson = page.locator(".vocab-lesson").first();
  await lesson.locator("summary").click();
  await lesson.locator(".vocab-section button").first().click();
  await expect(page.locator(".vocab-ask")).toHaveText("Quel son ?");
  await expect(page.locator(".sound-play")).toHaveCount(0);
  await page.keyboard.press("1");
  const play = page.locator(".vocab-sound .sound-play");
  await expect(play).toBeVisible();
  const letter = await page.locator(".vocab-prompt").innerText();
  await expect(play).toHaveAttribute("data-sound", letter);
  const [response] = await Promise.all([page.waitForResponse((r) => SOUND.test(r.url())), play.click()]);
  expect(response.status()).toBe(200);
});

test("the sounds: a course without them has an empty list, an unknown file is refused", async ({ page }) => {
  await newPlayer(page, "Sappho");
  expect(await (await page.request.get("/api/courses/latin/sounds")).json()).toEqual({});
  const list = (await (await page.request.get("/api/courses/sumerian/sounds")).json()) as Record<string, { file: string }>;
  expect(list["lugal"]?.file).toMatch(/^[0-9a-f]{12}\.mp3$/);
  expect((await page.request.get("/api/courses/sumerian/sounds/000000000000.mp3")).status()).toBe(404);
  expect((await page.request.get("/api/courses/sumerian/sounds/..%2Fcourse.json")).status()).toBe(404);
});
