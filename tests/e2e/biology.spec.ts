import { expect, test, type Page } from "@playwright/test";
import { breed, pValue, phenotypeShares } from "../../shared/discover/genetics.ts";
import { chiSquare } from "../../shared/discover/experiment.ts";
import { diffusionTime } from "../../shared/discover/cells.ts";
import { goHome, newPlayer, openActivity } from "./helpers";

test.use({ contextOptions: { reducedMotion: "reduce" } });

const fr = (x: number, digits = 1): string => x.toFixed(digits).replace(".", ",");

async function setSlider(page: Page, name: string, value: number): Promise<void> {
  await page.locator(`input[name=${name}]`).fill(String(value));
}

const button = (page: Page, text: string) => page.locator(`button:text-is("${text}")`);

async function noSidewaysScroll(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
}

test("the Chemistry and biology group: the test and four labs", async ({ page }) => {
  await newPlayer(page, "Bio");
  await goHome(page);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Chimie et biologie" }) });
  await expect(group.locator("[data-activity]")).toHaveCount(5);
  await group.locator("[data-activity='discover-genetics']").click();
  await expect(page.locator(".activity-bar-title")).toHaveText("Chimie et biologie");
});

test("molecules: valences decide the bonds, lone pairs the shape", async ({ page }) => {
  await newPlayer(page, "Mol");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-molecules");
  await button(page, "En ligne droite : H–O–H").click();
  await button(page, "En ligne droite : O–C–O").click();
  await button(page, "Aller construire").click();

  // Water: two single bonds already satisfy everything; oxygen keeps two lone pairs.
  await expect(page.locator(".bio-status")).toContainText("Toutes les valences sont respectées");
  await expect(page.locator(".bio-status")).toContainText("Autour de O : 2 voisins et 2 paires libres → coudée, 104,5° entre deux liaisons.");

  // Carbon dioxide: single bonds leave carbon short; two double bonds, and it is straight.
  await page.click('.bio-picker button:text-is("CO₂")');
  await expect(page.locator(".bio-status")).toContainText("Pas encore");
  await expect(page.locator(".bio-atoms")).toContainText("C : 2 liaisons sur 4");
  await page.locator(".bio-bonds button").nth(0).click();
  await expect(page.locator(".bio-bonds button").nth(0)).toBeFocused();
  await page.locator(".bio-bonds button").nth(1).click();
  await expect(page.locator(".bio-molecule")).toHaveAttribute("aria-label", "CO₂ : C–O double, C–O double");
  await expect(page.locator(".bio-status")).toContainText("Autour de C : 2 voisins et 0 paires libres → droite, 180° entre deux liaisons.");
  // A triple bond breaks oxygen's valence.
  await page.locator(".bio-bonds button").nth(0).click();
  await expect(page.locator(".bio-atoms .bad")).toHaveCount(2);
  await expect(button(page, "Comparer avec la théorie")).toBeDisabled();
  await page.click('.bio-picker button:text-is("NH₃")');
  await expect(page.locator(".bio-status")).toContainText("pyramide, 107°");
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  await expect(compare.locator(".bio-built tbody tr")).toHaveCount(3);
  await expect(compare).toContainText("Tu avais dit « En ligne droite : H–O–H ». L'eau est coudée");
  await expect(compare).toContainText("Tu avais dit : droite. Juste");
  await page.click(".discover-check .choice >> nth=0");
  await expect(page.locator(".vocab-feedback.good")).toBeVisible();
});

test("Mendel's peas: the square, seeded offspring, the chi-square", async ({ page }) => {
  await newPlayer(page, "Pea");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-genetics");
  await button(page, "1 sur 4").click();
  await button(page, "Non : toujours 1 sur 4").click();
  await button(page, "Aller croiser").click();
  const seed = Number((await page.locator(".discover-seed").innerText()).replace(/\D/g, ""));

  await expect(page.locator(".bio-punnett tbody tr")).toHaveCount(2);
  await expect(page.locator(".bio-punnett tbody")).toContainText("aa");
  await button(page, "× 100").click();
  await button(page, "Faire naître un pois").click();
  // The same experiment number gives the same peas, continuing the sequence.
  const counts = breed(seed * 10, "Aa", "Aa", 101);
  await expect(page.locator(".bio-counts")).toContainText(`jaune${counts.get("A") ?? 0}`);
  await expect(page.locator(".bio-counts")).toContainText(`vert${counts.get("a") ?? 0}`);
  await expect(page.locator(".discover-panel-title", { hasText: "101 descendants" })).toHaveCount(1);

  await page.click('.bio-crosses button:text-is("AaBb × AaBb")');
  await expect(page.locator(".bio-punnett tbody tr")).toHaveCount(4);
  await noSidewaysScroll(page);
  await button(page, "Comparer avec la théorie").click();
  const shares = phenotypeShares("Aa", "Aa");
  const chi = chiSquare(shares.map((s) => counts.get(s.phenotype) ?? 0), shares.map((s) => s.share * 101));
  const compare = page.locator(".discover-compare");
  await expect(compare).toContainText(`Ton croisement Aa × Aa : χ² = ${fr(chi, 2)}, p = ${fr(pValue(chi, 1), 2)}.`);
  await expect(compare).toContainText("Tu avais dit 1 sur 4 : juste");
  await expect(compare).toContainText("comme les pièces du labo Pile ou face");
  await page.click('.discover-check button:has-text("1 sur 2")');
  await expect(page.locator(".vocab-feedback.good")).toBeVisible();
});

test("cells: surface over volume falls as 6/s, diffusion time grows as the square", async ({ page }) => {
  await newPlayer(page, "Cel");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-cells");
  await button(page, "double").click();
  await button(page, "Cent fois plus").click();
  await button(page, "Aller mesurer").click();

  await expect(page.locator(".discover-status")).toContainText("surface / volume : 0,6 µm⁻¹");
  await page.click(".physics-go");
  await setSlider(page, "side", -4);
  await expect(page.locator("input[name=side] + output")).toHaveText("100 µm");
  await expect(page.locator(".discover-status")).toContainText("surface / volume : 0,06 µm⁻¹");
  await expect(page.locator(".discover-status")).toContainText(`L'oxygène met ${Math.round(diffusionTime(5e-5) * 1000)} ms`);
  await page.click(".physics-go");
  await setSlider(page, "split", 3);
  await expect(page.locator(".bio-cube .bio-cut")).toHaveCount(12);
  await expect(page.locator(".discover-status")).toContainText("Découpé en 27 cubes : même volume, 3 fois plus de surface.");
  await page.click(".physics-go");
  await expect(page.locator(".bio-cells tbody tr")).toHaveCount(3);
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  await expect(compare).toContainText("Tu avais dit « double ». Le rapport vaut 6/s");
  await expect(compare).toContainText("Tu avais dit « Cent fois plus ». La diffusion ralentit");
  await page.click('.discover-check button:has-text("À peu près de la même taille")');
  await expect(page.locator(".vocab-feedback.good")).toBeVisible();
});

test("hares and lynxes: cycles, the prey first, the averages at the equilibrium", async ({ page }) => {
  await newPlayer(page, "Lyn");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-ecology");
  await button(page, "Les lièvres").click();
  await button(page, "continuent d'osciller").click();
  await button(page, "Aller simuler").click();

  await page.click(".physics-go");
  const status = page.locator(".discover-status");
  await expect(status).toHaveText(/Un cycle dure (\d+),(\d) ans ; les lynx culminent (\d+),(\d) ans après les lièvres\./);
  const [, p1, p2, l1, l2] = /dure (\d+),(\d) ans ; les lynx culminent (\d+),(\d)/.exec(await status.innerText())!;
  const period = Number(`${p1}.${p2}`);
  const lag = Number(`${l1}.${l2}`);
  expect(period).toBeGreaterThan(8);
  expect(period).toBeLessThan(13);
  expect(lag).toBeGreaterThan(0.1 * period);
  expect(lag).toBeLessThan(0.5 * period);
  await expect(page.locator(".bio-euler")).toHaveCount(0);
  await expect(button(page, "Comparer avec la théorie")).toBeDisabled();
  await setSlider(page, "hares", 150);
  await page.click(".physics-go");
  // Whatever the start, the averages are the equilibrium: 100 thousand hares.
  await expect(page.locator(".bio-runs tbody tr")).toHaveCount(2);
  for (const row of await page.locator(".bio-runs tbody tr").all()) await expect(row.locator("td").last()).toContainText("100 /");
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  await expect(page.locator(".bio-euler")).toHaveCount(1);
  const compare = page.locator(".discover-compare");
  await expect(compare).toContainText("x* = γ/δ = 100 milliers de lièvres");
  await expect(compare).toContainText("Tu avais dit : les lièvres. Juste");
  await page.click('.discover-check button:has-text("Les mêmes moyennes qu\'avant")');
  await expect(page.locator(".vocab-feedback.good")).toBeVisible();
});
