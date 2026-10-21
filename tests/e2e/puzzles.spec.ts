import { expect, test, type Page } from "@playwright/test";
import { generatePuzzle, nextStep, rowOf, colOf } from "../../shared/discover/puzzles.ts";
import { openActivity, newPlayer } from "./helpers";

const GRID = 4821;

async function openPuzzles(page: Page): Promise<void> {
  await openActivity(page, "discover-puzzles");
  await page.locator(".puzzle-grid").waitFor();
}

/** Level, then grid GRID through the replay form. */
async function openGrid(page: Page, level: number): Promise<void> {
  await page.click(`[data-focus=level-${level}]`);
  await page.locator(".discover-replay-input").fill(String(GRID));
  await page.click(".discover-replay button[type=submit]");
  await expect(page.locator(".discover-seed")).toHaveText(`Grille n° ${GRID}`);
}

const cell = (page: Page, i: number) => page.locator(`[data-focus="cell-${i}"]`);

/** Selects a square and types a key. */
async function type(page: Page, i: number, key: string): Promise<void> {
  await cell(page, i).click();
  await page.keyboard.press(key);
}

test("level 1: givens, a rule broken shown at once, a hint in two stages, solved", async ({ page }) => {
  await newPlayer(page, "Grid1");
  await openPuzzles(page);
  await openGrid(page, 1);
  const p = generatePuzzle(GRID, 1);
  await expect(page.locator(".puzzle-cell")).toHaveCount(16);
  await expect(page.locator(".puzzle-cell.is-given")).toHaveCount(p.givens.length);
  for (const g of p.givens) await expect(cell(page, g)).toContainText(String(p.solution[g]));

  // A number already in its row: shown at once, then erased.
  const empty = [...Array(16).keys()].filter((i) => !p.givens.includes(i));
  const target = empty[0]!;
  const inRow = p.givens.find((g) => rowOf(g, 4) === rowOf(target, 4)) ?? p.givens.find((g) => colOf(g, 4) === colOf(target, 4))!;
  await type(page, target, String(p.solution[inRow]));
  await expect(page.locator(".puzzle-cell.is-conflict")).not.toHaveCount(0);
  await page.keyboard.press("Backspace");
  await expect(page.locator(".puzzle-cell.is-conflict")).toHaveCount(0);

  // A given number cannot be changed.
  await type(page, p.givens[0]!, String((p.solution[p.givens[0]!]! % 4) + 1));
  await expect(cell(page, p.givens[0]!)).toContainText(String(p.solution[p.givens[0]!]));

  // Hint: first the square, then the reasoning with the number.
  const entries = p.solution.map((v, i) => (p.givens.includes(i) ? v : 0));
  const step = nextStep(p, entries)!;
  await page.click("[data-focus=hint]");
  await expect(page.locator(".puzzle-cell.is-hinted")).toHaveAttribute("data-focus", `cell-${step.cell}`);
  await expect(page.locator(".puzzle-message")).not.toContainText(String(step.value) + ".");
  await expect(page.locator("[data-focus=hint]")).toHaveText("Explique");
  await page.click("[data-focus=hint]");
  await expect(page.locator(".puzzle-message")).toContainText(`le ${step.value}`);

  // The rest by keyboard: arrows from the first square, digits.
  await cell(page, 0).click();
  for (let i = 0; i < 16; i++) {
    if (!p.givens.includes(i)) await page.keyboard.press(String(p.solution[i]));
    if (i < 15) await page.keyboard.press(i % 4 === 3 ? "ArrowDown" : "ArrowRight");
    if (i % 4 === 3 && i < 15) for (let k = 0; k < 3; k++) await page.keyboard.press("ArrowLeft");
  }
  await expect(page.locator(".puzzle-solved-text")).toContainText("Bravo ! Grille résolue en");
  await expect(page.locator(".puzzle-solved-text")).toContainText("avec 1 indice");
  await expect(page.locator("[data-focus=hint]")).toBeDisabled();
});

test("level 4: cages, check, a wrong number pointed out, then solved with hints alone", async ({ page }) => {
  test.setTimeout(120_000);
  await newPlayer(page, "Grid4");
  await openPuzzles(page);
  await openGrid(page, 4);
  const p = generatePuzzle(GRID, 4);
  await expect(page.locator(".puzzle-cell")).toHaveCount(36);
  await expect(page.locator(".cage-label")).toHaveCount(p.cages.filter((c) => c.op !== "=").length);
  await expect(page.locator(".puzzle-cell.is-given")).toHaveCount(p.givens.length);

  // A wrong number: "Check" finds it, and the next hint points at it.
  const empty = [...Array(36).keys()].filter((i) => !p.givens.includes(i));
  const wrongAt = empty[3]!;
  const wrongValue = (p.solution[wrongAt]! % 6) + 1;
  await type(page, wrongAt, String(wrongValue));
  await page.click("[data-focus=check]");
  await expect(page.locator(".puzzle-cell.is-wrong")).toHaveCount(1);
  await expect(page.locator(".puzzle-message")).toHaveText("1 case à revoir, en rouge.");
  await page.click("[data-focus=hint]");
  await expect(page.locator(".puzzle-cell.is-hinted")).toHaveAttribute("data-focus", `cell-${wrongAt}`);
  await expect(page.locator(".puzzle-message")).toHaveText("La case entourée n'est pas juste.");
  await type(page, wrongAt, "Backspace");

  // Solved with hints alone: each hint, explained, gives a square and its number.
  for (let guard = 0; guard < 40; guard++) {
    if (await page.locator(".puzzle-solved-text").isVisible()) break;
    await page.click("[data-focus=hint]");
    const hinted = Number((await page.locator(".puzzle-cell.is-hinted").getAttribute("data-focus"))!.replace("cell-", ""));
    await page.click("[data-focus=hint]");
    const value = p.solution[hinted]!;
    await expect(page.locator(".puzzle-message")).toContainText(String(value));
    await type(page, hinted, String(value));
  }
  await expect(page.locator(".puzzle-solved-text")).toContainText("Bravo");
});

test("notes, and a phone: no sideways scrolling at level 4", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await newPlayer(page, "Notes");
  await openPuzzles(page);
  await openGrid(page, 4);
  const p = generatePuzzle(GRID, 4);
  const free = [...Array(36).keys()].find((i) => !p.givens.includes(i))!;
  await cell(page, free).click();
  await page.keyboard.press("n");
  await expect(page.locator("[data-focus=notes]")).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("2");
  await page.keyboard.press("5");
  await expect(cell(page, free).locator(".cell-notes")).toHaveText(/2.*5/);
  await expect(cell(page, free)).toHaveAttribute("aria-label", /notes : 2 et 5/);
  await page.keyboard.press("2");
  await expect(cell(page, free).locator(".cell-notes")).not.toContainText("2");
  await page.keyboard.press("N");
  await page.keyboard.press(String(p.solution[free]));
  await expect(cell(page, free).locator(".cell-value")).toHaveText(String(p.solution[free]));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  // The level buttons hold their labels, at the phone's width and just above it (four columns from 600 px), even with text enlarged.
  for (const [width, fontSize] of [[360, "100%"], [360, "130%"], [600, "100%"], [600, "130%"]] as const) {
    await page.setViewportSize({ width, height: 740 });
    await page.evaluate((size) => (document.documentElement.style.fontSize = size), fontSize);
    const spill = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".puzzle-levels .segment")).filter((button) => {
        const b = button.getBoundingClientRect();
        return Array.from(button.querySelectorAll("span")).some((t) => t.getBoundingClientRect().left < b.left || t.getBoundingClientRect().right > b.right);
      }).length,
    );
    expect(spill, `${width} px, text at ${fontSize}`).toBe(0);
  }
});

test("the same number gives the same grid; each level keeps its own", async ({ page }) => {
  await newPlayer(page, "Same");
  await openPuzzles(page);
  await openGrid(page, 2);
  const p = generatePuzzle(GRID, 2);
  const labels = await page.locator(".cage-label").allInnerTexts();
  expect(labels.sort()).toEqual(p.cages.filter((c) => c.op !== "=").map((c) => `${c.target}${c.op}`).sort());
  const free = [...Array(16).keys()].find((i) => !p.givens.includes(i))!;
  await type(page, free, String(p.solution[free]));
  await page.click("[data-focus=level-3]");
  await expect(page.locator(".puzzle-cell")).toHaveCount(25);
  await page.click("[data-focus=level-2]");
  await expect(page.locator(".discover-seed")).toHaveText(`Grille n° ${GRID}`);
  await expect(cell(page, free).locator(".cell-value")).toHaveText(String(p.solution[free]));
});
