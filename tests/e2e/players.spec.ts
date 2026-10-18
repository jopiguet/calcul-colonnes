import { expect, test } from "@playwright/test";
import { newPlayer, statsOf, typeAnswer, board, check, uniqueName, userByName } from "./helpers";

test("a new player is created, remembered and can be switched", async ({ page }) => {
  const first = await newPlayer(page, "Lea");
  await expect(page.locator(".chip").first()).toContainText(first);

  await page.reload();
  await expect(page.locator(".chip").first()).toContainText(first);

  await page.locator(".chip").first().click();
  const second = uniqueName("Tom");
  await page.fill(".new-player input", second);
  await page.keyboard.press("Enter");
  await expect(page.locator(".chip").first()).toContainText(second);

  await page.locator(".chip").first().click();
  await expect(page.locator(".player", { hasText: first })).toBeVisible();
  await expect(page.locator(".player", { hasText: second })).toBeVisible();
});

test("names are required and unique, ignoring case", async ({ page }) => {
  const name = await newPlayer(page, "Ana");
  await page.locator(".chip").first().click();
  await page.click(".new-player button");
  await expect(page.locator(".message")).toHaveText("Écris un prénom");
  await page.fill(".new-player input", name.toUpperCase());
  await page.keyboard.press("Enter");
  await expect(page.locator(".message")).toHaveText("Ce prénom existe déjà");
});

test("deleting a player removes all their results", async ({ page }) => {
  const request = page.request;
  const name = await newPlayer(page, "Del");
  await typeAnswer(page, await board(page));
  await check(page);
  expect((await statsOf(request, name)).total).toBe(1);

  page.once("dialog", (dialog) => void dialog.accept());
  await page.click("text=Scores");
  await page.click(`[aria-label='Supprimer ${name}']`);
  await expect(page.locator("text=Qui joue ?")).toBeVisible();

  const users = (await (await request.get("/api/users")).json()) as { name: string }[];
  expect(users.some((u) => u.name === name)).toBe(false);
  await expect(async () => userByName(request, name)).rejects.toThrow();
});
