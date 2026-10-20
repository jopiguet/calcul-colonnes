import { expect, test, type Page } from "@playwright/test";
import { TARGET, newExperiment, rollBatch } from "../../shared/discover/dice.ts";
import { flipBatch, newCoinExperiment } from "../../shared/discover/coins.ts";
import { newPlayer, openActivity } from "./helpers";

// Most tests skip the dice animation; one test keeps it.
test.use({ contextOptions: { reducedMotion: "reduce" } });

const SEED = 4821;

/** The same rolls as the page, computed by the engine: an experiment is its seed. */
function engine(batches: number[]): { rolls: number; sevens: number; series: number[] } {
  const e = newExperiment(SEED);
  for (const b of batches) rollBatch(e, b);
  return { rolls: e.rolls, sevens: e.bySum[TARGET]!, series: e.series };
}

/** Opens the lab on experiment SEED, through the replay form. */
async function openLab(page: Page): Promise<void> {
  await openActivity(page, "discover-dice");
  await page.locator(".discover-lab").waitFor();
}

async function replay(page: Page, seed: number): Promise<void> {
  // The replay form is shown once rolling has started: predict, roll once, then replay.
  await page.locator(".discover-replay-input").fill(String(seed));
  await page.click(".discover-replay button[type=submit]");
  await expect(page.locator(".discover-seed")).toHaveText(`Expérience n° ${seed}`);
}

async function predict(page: Page, most: string, sevens: number): Promise<void> {
  await page.click(`.discover-sums >> text="${most}"`);
  await page.locator(".discover-range").fill(String(sevens));
  await page.click("text=Lancer les dés");
  await page.locator(".discover-roll").waitFor();
}

test("the probability lab: predict, roll, compare, explain, check", async ({ page }) => {
  await newPlayer(page, "Dice");
  await openLab(page);
  await expect(page.locator(".discover-seed")).toHaveText(/^Expérience n° \d{1,4}$/);

  // A prediction is needed before rolling.
  await expect(page.locator("text=Lancer les dés")).toBeDisabled();
  await predict(page, "Toutes autant", 30);
  await expect(page.locator(".discover-mine")).toContainText("Toutes autant");
  await expect(page.locator(".discover-mine")).toContainText("30 fois sur 100");

  // The same experiment by its number, predictions again.
  await replay(page, SEED);
  await predict(page, "Toutes autant", 30);

  // Rolls: the counts are the engine's for this seed.
  await page.click("[data-focus=roll-1]");
  await page.click("[data-focus=roll-10]");
  let want = engine([1, 10]);
  await expect(page.locator(".discover-status")).toContainText(`${want.rolls} lancers`);
  await expect(page.locator(".discover-status")).toContainText(`La somme 7 : ${want.sevens} fois`);
  await expect(page.locator(".discover-series-item")).toHaveCount(1);
  await expect(page.locator(".discover-series-count")).toHaveText(`${want.series[0]} sur 10`);
  // Not enough rolls to compare yet.
  await expect(page.locator("[data-focus=reveal]")).toBeDisabled();

  await page.click("[data-focus=roll-100]");
  want = engine([1, 10, 100]);
  await expect(page.locator(".discover-status")).toContainText(`${want.rolls} lancers`);
  await expect(page.locator(".discover-histogram .stats-col")).toHaveCount(11);
  await expect(page.locator(".discover-path polyline")).toHaveCount(1);
  await expect(page.locator(".discover-path .theory-line")).toHaveCount(0); // hidden until the reveal

  // Compare: the 36 squares, six of them 7; the theory; the predictions.
  await page.click("[data-focus=reveal]");
  await expect(page.locator(".dice-grid-cell")).toHaveCount(36);
  await expect(page.locator(".dice-grid-cell.is-target")).toHaveCount(6);
  await expect(page.locator(".discover-table tbody tr")).toHaveCount(11);
  await expect(page.locator(".discover-table tr.is-target td").nth(1)).toHaveText("16,7%");
  await expect(page.locator(".discover-formula .katex")).toHaveCount(1);
  await expect(page.locator(".discover-path .theory-line")).toHaveCount(1);
  await expect(page.locator(".discover-expected")).toHaveCount(11);
  await expect(page.locator(".discover-verdict").first()).toContainText("11 sommes et 36 façons");
  const measured = Math.round((100 * want.sevens) / want.rolls);
  await expect(page.locator(".discover-verdict").nth(1)).toContainText(`ton expérience a donné ${measured} sur 100`);
  await expect(page.locator(".discover-explain li")).toHaveCount(3);

  // Check: the gambler's fallacy.
  await page.click("text=moins probable");
  await expect(page.locator(".discover-check .vocab-feedback")).toContainText("Pas tout à fait");
  await expect(page.locator(".discover-check .choice.is-right")).toContainText("toujours 1 chance sur 6");
  await expect(page.locator(".discover-check .choice").first()).toBeDisabled();

  // A new experiment starts at the prediction.
  await page.click("text=Nouvelle expérience");
  await expect(page.locator(".discover-sums")).toBeVisible();
});

test("predicting 7 is confirmed; another sum is told its share", async ({ page }) => {
  await newPlayer(page, "Seven");
  await openLab(page);
  await predict(page, "7", 17);
  await page.click("[data-focus=roll-100]");
  await page.click("[data-focus=reveal]");
  await expect(page.locator(".discover-verdict.good")).toHaveText("Tu avais prévu le 7 : c'est bien la somme la plus fréquente.");
  await page.click("text=Nouvelle expérience");
  await predict(page, "12", 17);
  await page.click("[data-focus=roll-100]");
  await page.click("[data-focus=reveal]");
  await expect(page.locator(".discover-verdict.bad")).toHaveText("Tu avais prévu le 12. Il a 1 façons de tomber sur 36 ; le 7 en a 6.");
  await expect(page.locator(".dice-grid-cell.is-predicted")).toHaveCount(1);
  await page.click("text=toujours 1 chance sur 6");
  await expect(page.locator(".discover-check .vocab-feedback")).toContainText("Juste");
});

test("the keyboard stays on the roll button; the experiment survives a language change", async ({ page }) => {
  await newPlayer(page, "Keys");
  await openLab(page);
  await page.click(`.discover-sums >> text="7"`);
  await page.locator("text=Lancer les dés").focus();
  await page.keyboard.press("Enter");
  await page.locator("[data-focus=roll-100]").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".discover-status")).toContainText("100 lancers");
  await expect(page.locator("[data-focus=roll-100]")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".discover-status")).toContainText("200 lancers");

  const seed = await page.locator(".discover-seed").innerText();
  await page.selectOption(".language", "en");
  await expect(page.locator(".discover-status")).toContainText("200 rolls");
  await expect(page.locator(".discover-seed")).toHaveText(seed.replace("Expérience n°", "Experiment no."));
  await page.selectOption(".language", "fr");
});

test("on a phone: no sideways scrolling, every step", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await newPlayer(page, "Phone");
  await openLab(page);
  const noSideways = async () =>
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await noSideways();
  await predict(page, "Toutes autant", 9);
  await page.click("[data-focus=roll-1000]");
  await noSideways();
  await page.click("[data-focus=reveal]");
  await noSideways();
});

test.describe("with the dice animation", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });
  test("one roll tumbles, ten are shown one by one, then counted", async ({ page }) => {
    await newPlayer(page, "Anim");
    await openLab(page);
    await predict(page, "7", 17);
    await page.click("[data-focus=roll-10]");
    await expect(page.locator(".discover-dice.is-rolling")).toHaveCount(1);
    // A click while the dice move is not lost: that animation stops, the new rolls count.
    await page.click("[data-focus=roll-10]");
    await expect(page.locator(".discover-status")).toContainText("20 lancers");
    await expect(page.locator(".discover-series-item")).toHaveCount(2);
    await page.click("[data-focus=roll-1]");
    await expect(page.locator(".discover-status")).toContainText("21 lancers");
    await expect(page.locator(".discover-dice")).toHaveAttribute("aria-label", /^Dé 1 : \d, dé 2 : \d, somme \d+$/);
  });
});

// ------------------------------------------------------------------ coins

function coinEngine(batches: number[]) {
  const e = newCoinExperiment(SEED);
  for (const b of batches) flipBatch(e, b);
  return e;
}

async function openCoins(page: Page): Promise<void> {
  await openActivity(page, "discover-coins");
  await page.locator(".discover-lab.is-coins").waitFor();
}

async function predictCoins(page: Page, run: number, sequence: "all" | "mixed" | "equal"): Promise<void> {
  await page.click(`[data-focus=run-${run}]`);
  await page.click(`[data-focus=seq-${sequence}]`);
  await page.click("[data-focus=predict-done]");
  await page.locator(".discover-roll").waitFor();
}

test("heads or tails: predict a streak, flip, compare with the exact chances, check", async ({ page }) => {
  await newPlayer(page, "Coin");
  await openCoins(page);
  await expect(page.locator(".discover-lab h1")).toHaveText("🪙 Pile ou face");

  // Both questions are needed.
  await page.click("[data-focus=run-3]");
  await expect(page.locator("[data-focus=predict-done]")).toBeDisabled();
  await page.click("[data-focus=seq-mixed]");
  await expect(page.locator("[data-focus=predict-done]")).toBeEnabled();
  await page.click("[data-focus=predict-done]");

  // Replay experiment SEED: the page shows the engine's figures.
  await replay(page, SEED);
  await predictCoins(page, 3, "mixed");
  await page.click("[data-focus=roll-10]");
  await page.click("[data-focus=roll-100]");
  const e = coinEngine([10, 100]);
  await expect(page.locator(".discover-status")).toContainText(`${e.flips} lancers`);
  await expect(page.locator(".discover-status")).toContainText(`plus longue série : ${e.longest}`);
  await expect(page.locator(".coin-ribbon .coin")).toHaveCount(100);
  const circled = await page.locator(".ribbon-run.is-long").count();
  const recent = e.recent;
  let long = 0;
  for (let i = 0; i < recent.length; ) {
    let j = i;
    while (j < recent.length && recent[j] === recent[i]) j++;
    if (j - i >= 5) long++;
    i = j;
  }
  expect(circled).toBe(long);
  await expect(page.locator(".discover-runs .stats-col")).toHaveCount(10);
  await expect(page.locator(".discover-path .theory-line")).toHaveCount(0);
  if (e.afterStreak.same + e.afterStreak.other > 0) {
    await expect(page.locator(".coin-streaks .stats-rate-of").first()).toHaveText(String(e.afterStreak.same));
  }

  // Compare: the longest streak of the first 100 flips, its row in the exact table, the sequences, the streaks.
  await page.click("[data-focus=reveal]");
  await expect(page.locator(".discover-compare .discover-verdict").first()).toHaveText(
    `Sur tes 100 premiers lancers, la plus longue série a été de ${e.longestInSeries}. Tu avais prévu 3.`,
  );
  await expect(page.locator(".discover-compare .discover-verdict.bad").first()).toBeVisible(); // 3 underestimates streaks
  await expect(page.locator(".coin-longest tbody tr")).toHaveCount(8);
  await expect(page.locator(".coin-longest tr.is-target")).toHaveCount(1);
  await expect(page.locator(".coin-longest tbody tr").nth(2).locator("td")).toHaveText("26,4%"); // longest = 6
  await expect(page.locator(".discover-compare .katex")).toHaveCount(1);
  await expect(page.locator(".discover-compare")).toContainText("Tu avais choisi une des deux suites");
  await expect(page.locator(".discover-compare")).toContainText(
    `ta pièce a continué la série ${e.afterStreak.same} fois et l'a cassée ${e.afterStreak.other} fois`,
  );
  await expect(page.locator(".discover-runs .discover-expected")).toHaveCount(10);
  await expect(page.locator(".coin-half")).toHaveCount(2);
  await expect(page.locator(".discover-path .theory-line")).toHaveCount(1);

  // Check: the real list is the one with streaks.
  await page.click("[data-focus=check-real]");
  await expect(page.locator(".discover-check .vocab-feedback")).toContainText("Juste");
  await expect(page.locator(".discover-check .vocab-feedback")).toContainText("77%");
  await page.click("text=Nouvelle expérience");
  await expect(page.locator(".discover-run-guess")).toBeVisible();
});

test("heads or tails: 'both the same' is confirmed; the coin flips by keyboard; phone width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await newPlayer(page, "Coin2");
  await openCoins(page);
  await predictCoins(page, 6, "equal");
  await page.locator("[data-focus=roll-100]").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".discover-status")).toContainText("100 lancers");
  await expect(page.locator("[data-focus=roll-100]")).toBeFocused();
  await page.click("[data-focus=reveal]");
  await expect(page.locator(".discover-compare")).toContainText("Tu avais répondu « autant l'une que l'autre » : c'est juste.");
  await expect(page.locator(".discover-compare .discover-verdict").first()).toHaveClass(/good/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test("each lab keeps its own experiment", async ({ page }) => {
  await newPlayer(page, "Both");
  await openActivity(page, "discover-dice");
  await page.click(`.discover-sums >> text="7"`);
  await page.click("text=Lancer les dés");
  await page.click("[data-focus=roll-100]");
  const diceSeed = await page.locator(".discover-seed").innerText();
  await openCoins(page);
  await predictCoins(page, 6, "equal");
  await page.click("[data-focus=roll-10]");
  await openActivity(page, "discover-dice");
  await expect(page.locator(".discover-seed")).toHaveText(diceSeed);
  await expect(page.locator(".discover-status")).toContainText("100 lancers");
  await openCoins(page);
  await expect(page.locator(".discover-status")).toContainText("10 lancers");
});
