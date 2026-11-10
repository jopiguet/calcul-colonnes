import { expect, test, type Page } from "@playwright/test";
import { goHome, newPlayer } from "./helpers";
import type { User } from "../../shared/types.ts";

// The trembling cards of the arranging mode never stand still for a click: as with "reduce motion".
test.use({ contextOptions: { reducedMotion: "reduce" } });

const group = (page: Page, id: string) => page.locator(`.activity-group[data-group='${id}']`);
const cardIds = async (page: Page, id: string): Promise<string[]> =>
  group(page, id).locator(".activity-cell").evaluateAll((cells) => cells.map((c) => (c as HTMLElement).dataset.cell ?? ""));
const groupIds = async (page: Page): Promise<string[]> =>
  page.locator(".home-groups > .activity-group").evaluateAll((groups) => groups.map((g) => (g as HTMLElement).dataset.group ?? ""));

test("home: one line per group, opened by its title, and kept so", async ({ page }) => {
  await newPlayer(page, "Line");
  await goHome(page);
  const computing = group(page, "computing");
  await expect(computing).toHaveClass(/is-line/);
  await expect(computing.locator(".activity-group-count")).toHaveText("9");
  // On one line: every card at the same height.
  const tops = await computing.locator(".activity-cell").evaluateAll((cells) => cells.map((c) => Math.round(c.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
  await computing.locator(".activity-group-toggle").click();
  await expect(computing).toHaveClass(/is-open/);
  await page.reload();
  await goHome(page);
  await expect(group(page, "computing")).toHaveClass(/is-open/);
  await expect(group(page, "maths")).toHaveClass(/is-line/);
});

test("home: a card's ⋯ arranges the page, removes a card and puts it back", async ({ page }) => {
  await newPlayer(page, "Arrange");
  await goHome(page);
  expect(await cardIds(page, "maths")).toEqual(["columns", "quiz", "calc"]);

  // ⋯ → arrange: the cards tremble, open nothing, and move.
  await page.locator("[data-cell='columns'] .activity-more").click();
  await expect(page.locator(".activity-menu-item")).toHaveText(["✥ Réorganiser l'accueil", "＋ Ajouter une activité", "✕ Retirer de l'accueil"]);
  await page.locator(".activity-menu-item", { hasText: "Réorganiser" }).click();
  await expect(page.locator(".home-arrange")).toBeVisible();
  await page.locator("[data-activity='quiz']").click();
  await expect(page.locator(".home")).toBeVisible();
  await page.locator("[data-cell='columns'] .activity-move", { hasText: "▶" }).click();
  expect(await cardIds(page, "maths")).toEqual(["quiz", "columns", "calc"]);
  // The group down one step.
  expect((await groupIds(page)).slice(0, 2)).toEqual(["maths", "sciences"]);
  await group(page, "maths").locator(".activity-group-tools .activity-move", { hasText: "▼" }).click();
  expect((await groupIds(page)).slice(0, 2)).toEqual(["sciences", "maths"]);

  // − removes a card; ＋ Ajouter puts it back.
  await page.locator("[data-cell='calc'] .activity-remove").click();
  expect(await cardIds(page, "maths")).toEqual(["quiz", "columns"]);
  await group(page, "maths").locator(".activity-add-toggle").click();
  await group(page, "maths").locator(".activity-add-item", { hasText: "Analyse" }).click();
  await expect(page.locator("[data-cell='calc']")).toBeVisible();
  await expect(page.locator(".home-arrange")).toBeVisible();
  await page.locator(".home-arrange-done").click();
  await expect(page.locator(".home-arrange")).toBeHidden();

  // Kept: after a reload, the same order.
  await page.reload();
  await goHome(page);
  expect((await groupIds(page)).slice(0, 2)).toEqual(["sciences", "maths"]);
  expect(await cardIds(page, "maths")).toEqual(["quiz", "columns", "calc"]);

  // Removed from the menu, outside the arranging mode.
  await page.locator("[data-cell='columns'] .activity-more").click();
  await page.locator(".activity-menu-item", { hasText: "Retirer" }).click();
  await expect(page.locator("[data-cell='columns']")).toHaveCount(0);
  await page.reload();
  await goHome(page);
  await expect(page.locator("[data-cell='columns']")).toHaveCount(0);
});

test("home: what waits comes first, the most first, then the set order again", async ({ page }) => {
  const name = await newPlayer(page, "Due");
  await goHome(page);
  expect((await groupIds(page))[0]).toBe("maths");
  expect(await cardIds(page, "economics")).toEqual(["econ", "marx"]);
  // A Capital test left blank: its notions are to review.
  const users = (await (await page.request.get("/api/users")).json()) as User[];
  const me = users.find((u) => u.name === name)!;
  const posted = await page.request.post("/api/quizzes", {
    data: { userId: me.id, seed: 7, level: "marxBeginner", topics: ["marxProfit"], count: 5, answers: [-1, -1, -1, -1, -1] },
  });
  expect(posted.ok()).toBe(true);
  await page.reload();
  await goHome(page);
  await expect(page.locator("[data-cell='marx'] .activity-status")).toHaveText(/à revoir/);
  // The waiting card is marked on its border only: nothing painted behind its rounded corners.
  expect(await page.locator("[data-cell='marx']").evaluate((c) => getComputedStyle(c).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  // The Capital first in Economics, and Economics first on the page.
  expect(await cardIds(page, "economics")).toEqual(["marx", "econ"]);
  expect((await groupIds(page))[0]).toBe("economics");
  await expect(group(page, "economics").locator(".activity-group-due")).toHaveText(/en attente/);
  // While arranging, the set order.
  await page.locator("[data-cell='econ'] .activity-more").click();
  await page.locator(".activity-menu-item", { hasText: "Réorganiser" }).click();
  expect(await cardIds(page, "economics")).toEqual(["econ", "marx"]);
  expect((await groupIds(page))[0]).toBe("maths");
});
