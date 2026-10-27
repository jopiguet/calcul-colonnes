import { expect, test, type Page } from "@playwright/test";
import { escapeTime, filledShare, kochFacts, playChaos } from "../../shared/discover/fractals.ts";
import { divergenceTime, twins } from "../../shared/discover/chaos.ts";
import { goHome, newPlayer, openActivity } from "./helpers";

test.use({ contextOptions: { reducedMotion: "reduce" } });

const fr = (x: number, digits = 1): string => new Intl.NumberFormat("fr-CH", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(x);
const frPct = (x: number): string => new Intl.NumberFormat("fr-CH", { style: "percent", maximumFractionDigits: 0 }).format(x);

const button = (page: Page, text: string) => page.locator(`button:text-is("${text}")`);
const focus = (page: Page, key: string) => page.locator(`[data-focus="${key}"]`);

async function setSlider(page: Page, name: string, value: number): Promise<void> {
  await page.locator(`input[name=${name}]`).fill(String(value));
}

async function noSidewaysScroll(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
}

async function checkRight(page: Page, label: string): Promise<void> {
  await page.locator(".discover-check .choice", { hasText: label }).click();
  await expect(page.locator(".vocab-feedback.good")).toBeVisible();
}

test("the Mathematical curiosities group: five labs, just before Chemistry and biology", async ({ page }) => {
  await newPlayer(page, "Odd");
  await goHome(page);
  const titles = await page.locator(".activity-group-title").allInnerTexts();
  const at = titles.indexOf("Curiosités mathématiques");
  expect(at).toBeGreaterThan(0);
  expect(titles[at + 1]).toBe("Chimie et biologie");
  expect(at + 1).toBe(titles.length - 1);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Curiosités mathématiques" }) });
  await expect(group.locator("[data-activity]")).toHaveCount(5);
  await group.locator("[data-activity='discover-lorenz']").click();
  await expect(page.locator(".activity-bar-title")).toHaveText("Curiosités mathématiques");
});

test("Koch: the perimeter grows by 4/3, the area tends to 8/5, the ruler", async ({ page }) => {
  await newPlayer(page, "Koch");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-koch");
  await button(page, "Grandit sans limite").click();
  await button(page, "Grandit sans limite, comme le périmètre").click();
  await button(page, "Aller construire").click();

  for (const n of [1, 2, 3]) await setSlider(page, "n", n);
  const f = kochFacts(3);
  await expect(page.locator(".discover-status").first()).toContainText(`Étape 3 : 192 côtés de longueur 1/27.`);
  await expect(page.locator(".discover-status").first()).toContainText(`Périmètre ${fr(f.perimeter, 2)}, aire ${fr(f.areaRatio, 3)} fois`);
  await expect(page.locator(".math-koch-table tbody tr")).toHaveCount(4);
  await expect(page.locator(".math-koch polygon")).toHaveCount(2);
  await expect(button(page, "Comparer avec la théorie")).toBeDisabled();

  for (const k of [0, 1, 2]) await focus(page, `ruler-${k}`).click();
  // Ruler 1/9: 48 lengths, 48/9 = 5.33.
  await expect(page.locator(".math-ruler-table tbody tr").nth(2)).toContainText(`1/9`);
  await expect(page.locator(".math-ruler-table tbody tr").nth(2)).toContainText(`48`);
  await expect(page.locator(".math-ruler-table tbody tr").nth(2)).toContainText(fr(48 / 9, 2));
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  await expect(compare.locator(".discover-verdict.good")).toContainText("le périmètre grandit sans limite");
  await expect(compare.locator(".discover-verdict.bad")).toContainText("8/5");
  await checkRight(page, "Plus longue");
});

test("Mandelbrot: following points, zooming into the edge", async ({ page }) => {
  await newPlayer(page, "Mandel");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-mandelbrot");
  await button(page, "Sautent entre deux valeurs").click();
  await button(page, "Toujours aussi détaillé").click();
  await button(page, "Aller explorer").click();

  await button(page, "c = −1").click();
  await expect(page.locator(".math-fate")).toContainText("z finit par revenir sur 2 valeurs");
  await expect(page.locator(".math-orbit tbody tr").nth(2)).toContainText("0");
  await expect(page.locator(".math-orbit tbody tr").nth(1)).toContainText("−1");
  await button(page, "c = 1").click();
  await expect(page.locator(".math-fate")).toContainText(`z dépasse 2 après ${escapeTime(1, 0, 100)} pas`);
  await expect(page.locator(".math-orbit tbody tr")).toHaveCount(4);
  await expect(page.locator(".math-orbit tbody tr.is-target")).toHaveCount(1);

  await expect(button(page, "Comparer avec la théorie")).toBeDisabled();
  for (let i = 0; i < 3; i++) await focus(page, "zoom-in").click();
  await expect(page.locator(".discover-status").first()).toContainText("Agrandi 64 fois");
  // A tap in zoom mode magnifies around the point touched.
  await page.locator(".math-mandelbrot").click({ position: { x: 20, y: 20 } });
  await expect(page.locator(".discover-status").first()).toContainText("Agrandi 256 fois");
  await expect(page.locator(".discover-status").first()).toContainText("Le plus loin : ×256.");
  await focus(page, "reset").click();
  await expect(page.locator(".discover-status").first()).toContainText("Agrandi 1 fois");
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  await expect(compare.locator(".math-points tbody tr")).toHaveCount(6);
  await expect(compare.locator(".math-points tbody tr.is-target")).toHaveCount(2);
  await expect(compare.locator(".discover-verdict.good")).toHaveCount(2);
  await expect(compare).toContainText("jusqu'à ×256");
  await checkRight(page, "Non");
});

test("chaos game: a seeded Sierpinski triangle, the hole never hit, the square filled", async ({ page }) => {
  await newPlayer(page, "Chaos");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-chaosgame");
  await button(page, "Forment un nuage flou au centre").click();
  await button(page, "Ils remplissent le carré uniformément").click();
  await button(page, "Aller jouer").click();
  const seed = Number((await page.locator(".discover-seed").innerText()).replace(/\D/g, ""));

  await focus(page, "jump-10").click();
  await focus(page, "jump-10000").click();
  await expect(page.locator(".math-hole")).toContainText("après les 20 premiers : 0.");
  const triangle = playChaos("triangle", seed, 10_010);
  await expect(page.locator(".math-chaos-table tbody tr").first()).toContainText(frPct(filledShare(triangle, 32)));

  await expect(button(page, "Comparer avec la théorie")).toBeDisabled();
  await button(page, "Carré").click();
  await focus(page, "jump-10000").click();
  const square = playChaos("square", seed, 10_000);
  await expect(page.locator(".math-chaos-table tbody tr").nth(1)).toContainText(frPct(filledShare(square, 32)));
  expect(filledShare(square, 32)).toBeGreaterThan(0.95);
  expect(filledShare(triangle, 32)).toBeLessThan(0.5);
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  await expect(compare.locator(".discover-verdict.bad")).toContainText("triangle de Sierpinski");
  await expect(compare.locator(".discover-verdict.good")).toContainText("le carré se remplit");
  await checkRight(page, "Il dessine le même triangle de Sierpinski");
});

test("Lorenz: the butterfly effect, a fixed time bought per factor of 10", async ({ page }) => {
  await newPlayer(page, "Lorenz");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-lorenz");
  await button(page, "N'ont plus rien à voir").click();
  await button(page, "Dix fois plus longtemps").click();
  await button(page, "Aller calculer").click();

  await setSlider(page, "delta", 6);
  await setSlider(page, "delta", 9);
  const rows = page.locator(".math-runs-table tbody tr");
  await expect(rows).toHaveCount(3);
  for (const [i, k] of [3, 6, 9].entries()) {
    const lost = divergenceTime(twins(10 ** -k, 40));
    await expect(rows.nth(i)).toContainText(lost === null ? "—" : fr(lost, 1));
  }
  await expect(page.locator(".math-butterfly polyline")).toHaveCount(2);
  await setSlider(page, "time", 40);
  await expect(page.locator(".discover-status").first()).toContainText("Les deux calculs sont séparés");
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  await expect(compare.locator(".math-runs-compare tbody tr")).toHaveCount(3);
  await expect(compare.locator(".discover-verdict.good")).toContainText("rien à voir");
  await expect(compare.locator(".discover-verdict.bad")).toContainText("2,5 unités de temps");
  await expect(page.locator(".math-theory")).toHaveCount(1);
  await checkRight(page, "Avec deux fois plus de chiffres exacts (la précision au carré)");
});

test("logistic map: two years, chaos, then a window of period 3", async ({ page }) => {
  await newPlayer(page, "Logi");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-logistic");
  await button(page, "Alterne entre deux valeurs, une année sur deux").click();
  await button(page, "Elle répète un cycle de quelques années").click();
  await button(page, "Aller essayer").click();

  const status = page.locator(".discover-status").first();
  await expect(status).toContainText("r = 2,80 : elle se stabilise à 0,643.");
  await focus(page, "r-3.2").click();
  await expect(status).toContainText("elle répète un cycle de 2 ans : 0,513 · 0,799.");
  await focus(page, "r-3.9").click();
  await expect(status).toContainText("elle ne se répète jamais");
  await expect(button(page, "Comparer avec la théorie")).toBeDisabled();
  await setSlider(page, "r", 3.83);
  await expect(status).toContainText("cycle de 3 ans");
  await expect(page.locator(".math-tried-table tbody tr")).toHaveCount(4);
  await expect(page.locator(".math-diagram")).toBeVisible();
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  await expect(compare.locator(".math-doublings tbody tr")).toHaveCount(7);
  await expect(compare.locator(".discover-verdict.good")).toContainText("0,51 et 0,80");
  await expect(compare.locator(".discover-verdict.bad")).toContainText("ne se répète jamais");
  await checkRight(page, "Répète un cycle de 3 ans");
});

test("the curiosities speak Spanish and English too", async ({ page }) => {
  await newPlayer(page, "OddEn");
  await openActivity(page, "discover-logistic");
  await page.selectOption(".language", "es");
  await expect(page.locator(".discover-head h1")).toHaveText("🐇 Del orden al caos");
  await expect(page.locator(".activity-bar-title")).toHaveText("Curiosidades matemáticas");
  await page.selectOption(".language", "en");
  await expect(page.locator(".discover-head h1")).toHaveText("🐇 From order to chaos");
  await button(page, "Alternates between two values, every other year").click();
  await button(page, "It never repeats").click();
  await button(page, "Go and try").click();
  await expect(page.locator(".discover-status").first()).toContainText("r = 2.80 : it settles at 0.643.");
  await page.selectOption(".language", "fr");
});
