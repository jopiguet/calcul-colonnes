import { expect, test, type Page } from "@playwright/test";
import { exactFlight, groundRange } from "../../shared/discover/projectile.ts";
import { exactPeriod, measuredPeriod } from "../../shared/discover/pendulum.ts";
import { image } from "../../shared/discover/lenses.ts";
import { solve } from "../../shared/discover/circuits.ts";
import { goHome, newPlayer, openActivity } from "./helpers";

// The flights land at once; the pendulum does not swing.
test.use({ contextOptions: { reducedMotion: "reduce" } });

/** A number as the French page writes it: "19,9". */
const fr = (x: number, digits = 1): string => x.toFixed(digits).replace(".", ",");

async function setSlider(page: Page, name: string, value: number): Promise<void> {
  await page.locator(`input[name=${name}]`).fill(String(value));
}

const button = (page: Page, text: string) => page.locator(`button:text-is("${text}")`);

async function noSidewaysScroll(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
}

test("throw a ball: predict the angle and plant a flag, throw, compare with the formula, check", async ({ page }) => {
  await newPlayer(page, "Thr");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-throw");
  await expect(page.locator(".activity-bar-title")).toHaveText("Physique");
  await expect(button(page, "Aller lancer")).toBeDisabled();
  await page.click('.physics-angles button:text-is("30°")');
  await setSlider(page, "flag", 14);
  await expect(page.locator(".discover-range-value")).toHaveText("à 14,0 m");
  await button(page, "Aller lancer").click();
  await expect(page.locator(".discover-mine")).toHaveText("Tes prévisions : le plus loin à 30° · drapeau à 14,0 m");

  // The predicted throw: 15 m/s at 30° from the ground lands where the formula says.
  await page.click(".physics-go");
  const d = groundRange(15, 30);
  await expect(page.locator(".discover-status")).toContainText(`Tombée à ${fr(d)} m, après ${fr(exactFlight({ speed: 15, angle: 30, height: 0 }).time, 2)} s en l'air.`);
  await expect(page.locator(".discover-status")).toContainText(`${fr(d - 14)} m plus loin que ton drapeau.`);
  await expect(page.locator(".physics-field")).toHaveAttribute("aria-label", `Le terrain : dernier lancer tombé à ${fr(d)} m ; le drapeau est à 14,0 m`);
  await expect(button(page, "Comparer avec la théorie")).toBeDisabled();
  await noSidewaysScroll(page);

  // 60° lands at the same place; 45° from a height of 10 m goes farther.
  await setSlider(page, "angle", 60);
  await page.click(".physics-go");
  await expect(page.locator(".discover-status")).toContainText(`Tombée à ${fr(d)} m`);
  await setSlider(page, "angle", 45);
  await setSlider(page, "height", 10);
  await page.click(".physics-go");
  const high = exactFlight({ speed: 15, angle: 45, height: 10 });
  await expect(page.locator(".discover-status")).toContainText(`Tombée à ${fr(high.range)} m`);
  await expect(page.locator(".physics-throws tbody tr")).toHaveCount(3);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  // Simulation and formula agree to the millimetre, row by row.
  for (const row of await compare.locator(".physics-check tbody tr").all()) {
    const cells = await row.locator("td").allInnerTexts();
    expect(cells.at(-2)).toBe(cells.at(-1));
  }
  await expect(compare).toContainText("Tu avais choisi 30°. Depuis le sol, 45° va le plus loin");
  await expect(compare).toContainText("Et 30° va aussi loin que 60°");
  await expect(compare).toContainText(`Ton drapeau était à 14,0 m ; lancée à 30° et 15 m/s, la balle tombe à ${fr(d)} m.`);
  await expect(compare.locator(".physics-curve")).toHaveAttribute("aria-label", /la plus grande à 3\d°/);

  await page.click('.discover-check button:has-text("Les deux en même temps")');
  await expect(page.locator(".vocab-feedback.good")).toBeVisible();
  await expect(page.locator(".physics-strobe .strobe-dropped")).toHaveCount(await page.locator(".physics-strobe .strobe-thrown").count());
  await noSidewaysScroll(page);
  await button(page, "Tout recommencer").click();
  await expect(button(page, "Aller lancer")).toBeDisabled();
});

test("the pendulum: the mass changes nothing, the length does, timed on the simulation", async ({ page }) => {
  await newPlayer(page, "Pen");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-pendulum");
  await button(page, "La lourde").click();
  await expect(button(page, "Aller essayer")).toBeDisabled();
  await button(page, "4 fois plus").click();
  await button(page, "Aller essayer").click();

  const p = { length: 1, mass: 0.2, angle: 15 };
  const period = measuredPeriod(p, 10);
  await page.click(".physics-go");
  await expect(page.locator(".discover-status")).toHaveText(`10 oscillations : ${fr(10 * period)} s, soit ${fr(period, 2)} s par oscillation.`);
  // Another mass: the same time.
  await page.click('.physics-masses button:text-is("5 kg")');
  await page.click(".physics-go");
  await expect(page.locator(".discover-status")).toHaveText(`10 oscillations : ${fr(10 * period)} s, soit ${fr(period, 2)} s par oscillation.`);
  // A string 4 times longer: twice the time.
  await setSlider(page, "length", 2.5);
  await page.locator('input[name="length"]').fill("0.25");
  await page.click(".physics-go");
  const short = measuredPeriod({ ...p, length: 0.25, mass: 5 }, 10);
  expect(period / short).toBeCloseTo(2, 2);
  await expect(page.locator(".discover-status")).toContainText(`${fr(short, 2)} s par oscillation`);
  await expect(page.locator(".physics-pendulum")).toHaveAttribute("aria-label", "Pendule de 0,25 m, boule de 5 kg, lâché à 15°");
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  await expect(compare).toContainText("Tu avais répondu « La lourde ». Mais la masse ne change pas la durée d'une oscillation.");
  await expect(compare).toContainText(`avec un fil de 1,00 m, 200 g et 5 kg donnent la même durée, ${fr(period, 2)} s.`);
  await expect(compare).toContainText("Tu avais répondu « 4 fois plus ».");
  // The exact period at 15°, to the millisecond.
  await expect(compare.locator(".physics-check tbody tr").last()).toContainText(`${fr(exactPeriod(p), 3)} s`);
  await page.click('.discover-check button:has-text("À peu près pareil")');
  await expect(page.locator(".vocab-feedback.good")).toBeVisible();
  await noSidewaysScroll(page);
});

test("lenses: focus the image on the screen, the card dims it, the lens equation", async ({ page }) => {
  await newPlayer(page, "Len");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-lenses");
  await button(page, "perd sa moitié haute").click();
  await button(page, "s'éloigner").click();
  await button(page, "Aller essayer").click();

  // Arrow at 30 cm, f = 10 cm: sharp at 15 cm only.
  const record = button(page, "Noter cette position");
  await setSlider(page, "screen", 25);
  await expect(record).toBeDisabled();
  await expect(page.locator(".physics-screen-status")).toContainText("Image floue");
  for (const [object, screen] of [
    [30, 15],
    [20, 20],
    [15, 30],
  ] as [number, number][]) {
    await setSlider(page, "object", object);
    await setSlider(page, "screen", screen);
    expect(image({ focal: 10, object })!.distance).toBeCloseTo(screen, 9);
    await expect(page.locator(".physics-screen-status")).toContainText("✓ Image nette");
    await expect(record).toBeEnabled();
    await record.click();
  }
  await expect(page.locator(".physics-screen-status")).toContainText("à l'envers, 2,0 fois la taille de la flèche");
  // The card: the image stays, half the light.
  await button(page, "Carton sur la moitié haute").click();
  await expect(page.locator(".physics-screen-status")).toContainText("✓ Image nette");
  await expect(page.locator(".physics-screen-status")).toContainText("51");
  await expect(page.locator(".physics-bench .bench-card")).toHaveCount(1);
  // Too close: no sharp image anywhere.
  await setSlider(page, "object", 8);
  await expect(page.locator(".physics-screen-status")).toContainText("Pas d'image nette possible");
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  for (const row of await compare.locator(".physics-check tbody tr").all()) {
    const cells = await row.locator("td").allInnerTexts();
    expect(cells.at(-2)).toBe(cells.at(-1));
  }
  await expect(compare).toContainText("Tu avais prévu : « perd sa moitié haute ». Mais l'image reste entière");
  await expect(compare).toContainText("Tu l'as vu avec le carton");
  await expect(compare).toContainText("Tu avais prévu que l'écran doit s'éloigner");
  // The arrow is too close: the ray diagram shows a virtual image, in front of the lens.
  expect(await compare.locator(".physics-rays .bench-image.is-virtual").count()).toBeGreaterThan(0);
  await page.click('.discover-check button:has-text("Non, c\'est une image virtuelle")');
  await expect(page.locator(".vocab-feedback.good")).toBeVisible();
  await noSidewaysScroll(page);
});

test("circuits: series dims, parallel does not, current is not used up, a bulb unscrewed", async ({ page }) => {
  await newPlayer(page, "Cir");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-circuits");
  await page.locator(".discover-choices").nth(0).locator('button:text-is("pareil")').click();
  await page.locator(".discover-choices").nth(1).locator('button:text-is("pareil")').click();
  await button(page, "Aller brancher").click();

  await button(page, "2 en série").click();
  const series = solve("series2");
  await expect(page.locator(".circuit-bulb").first()).toHaveAttribute("aria-label", `Ampoule A : 25% d'une ampoule seule, ${fr(series.bulbs[0]!.current, 3)} A`);
  await expect(page.locator(".discover-status")).toHaveText("La pile fournit 0,250 A. Ampèremètres : 0,250 A, 0,250 A et 0,250 A.");
  // Unscrew A: everything goes out.
  await page.locator(".circuit-bulb").first().click();
  await expect(page.locator(".discover-status")).toHaveText("La pile fournit 0,000 A. Ampèremètres : 0,000 A, 0,000 A et 0,000 A.");
  await expect(button(page, "Comparer avec la théorie")).toBeDisabled();

  await button(page, "2 en parallèle").click();
  await expect(page.locator(".discover-status")).toHaveText("La pile fournit 1,000 A. Ampèremètres : 1,000 A, 0,500 A et 0,500 A.");
  // By keyboard: unscrew A, B stays as bright.
  await page.locator(".circuit-bulb").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".circuit-bulb").nth(1)).toHaveAttribute("aria-label", "Ampoule B : 100% d'une ampoule seule, 0,500 A");
  await expect(page.locator(".circuit-bulb").first()).toBeFocused();
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  await expect(compare.locator(".physics-circuits-table tbody tr")).toHaveCount(6);
  await expect(compare).toContainText("Tu avais prévu « pareil » en série.");
  await expect(compare).toContainText("Tu avais prévu « pareil » en parallèle : c'est ça");
  await page.click('.discover-check button:has-text("Toujours 0,25 A")');
  await expect(page.locator(".vocab-feedback.good")).toBeVisible();
  await noSidewaysScroll(page);
});

test("the playground in Spanish and English; each lab keeps its state; the home page group", async ({ page }) => {
  await newPlayer(page, "Lng");
  await goHome(page);
  await expect(page.locator(".activity-group-title", { hasText: "Physique" })).toHaveCount(1);
  await openActivity(page, "discover-throw");
  await page.click('.physics-angles button:text-is("45°")');
  await button(page, "Aller lancer").click();
  await page.click(".physics-go");
  await page.selectOption(".language", "es");
  await expect(page.locator(".discover-lab h1")).toHaveText("🏀 Lanzar una pelota");
  await expect(page.locator(".discover-status")).toContainText(`Ha caído a ${fr(groundRange(15, 30))} m`);
  await page.selectOption(".language", "en");
  await expect(page.locator(".discover-status")).toContainText(`Landed at ${groundRange(15, 30).toFixed(1)} m`);
  await expect(page.locator(".activity-bar-title")).toHaveText("Physics");

  await openActivity(page, "discover-circuits");
  await expect(page.locator(".discover-lab h1")).toHaveText("💡 Circuits");
  await openActivity(page, "discover-throw");
  // Still the same experiment: the throw is there.
  await expect(page.locator(".physics-throws tbody tr")).toHaveCount(1);
  await page.selectOption(".language", "fr");
});

test.describe("with motion", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("the ball flies before it lands; the pendulum swings", async ({ page }) => {
    await newPlayer(page, "Mov");
    await openActivity(page, "discover-throw");
    await page.click('.physics-angles button:text-is("45°")');
    await button(page, "Aller lancer").click();
    await page.click(".physics-go");
    // In flight: the path grows, the result is not shown yet.
    await expect(page.locator(".physics-field .is-live")).not.toHaveAttribute("points", "");
    await expect(page.locator(".discover-status")).toContainText("Tombée à 19,9 m", { timeout: 5_000 });

    await openActivity(page, "discover-pendulum");
    await button(page, "Pareil").click();
    await button(page, "2 fois plus").click();
    await button(page, "Aller essayer").click();
    const bob = page.locator(".pendulum-bob");
    const first = await bob.getAttribute("cx");
    await expect.poll(async () => bob.getAttribute("cx")).not.toBe(first);
  });
});
