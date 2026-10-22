import { expect, test, type Page } from "@playwright/test";
import { elongation, illuminated } from "../../shared/discover/moon.ts";
import { TILT, dailyInsolation, day21, noonHeight, sky, YEAR } from "../../shared/discover/seasons.ts";
import { syzygies } from "../../shared/discover/eclipses.ts";
import { period } from "../../shared/discover/orbits.ts";
import { goHome, newPlayer, openActivity } from "./helpers";

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

test("the home page has an Astronomy group with its four labs", async ({ page }) => {
  await newPlayer(page, "Sky");
  await goHome(page);
  const group = page.locator(".activity-group", { has: page.locator(".activity-group-title", { hasText: "Astronomie" }) });
  await expect(group.locator("[data-activity]")).toHaveCount(4);
  await group.locator("[data-activity='discover-seasons']").click();
  await expect(page.locator(".activity-bar-title")).toHaveText("Astronomie");
  await expect(page.locator(".discover-lab h1")).toHaveText("🌍 Les saisons");
});

test("the Moon's phases: the lit half, not the Earth's shadow; the shadow only at full moon", async ({ page }) => {
  await newPlayer(page, "Lun");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-moon");
  await expect(button(page, "Aller observer")).toBeDisabled();
  await button(page, "L'ombre de la Terre en cache une partie").click();
  await button(page, "Du côté opposé au Soleil").click();
  await button(page, "Aller observer").click();
  await expect(page.locator(".discover-mine")).toContainText("cause : L'ombre de la Terre en cache une partie");
  await expect(page.locator(".discover-status")).toContainText("nouvelle lune · éclairée à 0% · se lève vers 6 h 00");

  // The first quarter: half lit, and nowhere near the Earth's shadow.
  await setSlider(page, "day", 7.5);
  const quarter = elongation(7.5);
  await expect(page.locator(".discover-status")).toContainText(`premier quartier · éclairée à ${Math.round(100 * illuminated(quarter))}%`);
  await expect(page.locator(".astro-top")).toHaveAttribute("aria-label", /la Lune est à 89° d'elle\./);
  await expect(page.locator(".astro-sky")).toHaveAttribute("aria-label", "La Lune vue depuis la Terre : premier quartier, éclairée à 51%");
  await expect(page.locator(".astro-disc-lit")).toHaveCount(1);
  await expect(button(page, "Comparer avec la théorie")).toBeDisabled();

  // At full moon, in this flat drawing, the Moon enters the shadow: an eclipse, not a phase.
  await setSlider(page, "day", 14.75);
  await expect(page.locator(".discover-status")).toContainText("pleine lune");
  await expect(page.locator(".discover-status")).toContainText("c'est une éclipse de Lune");
  await expect(page.locator(".astro-disc.is-eclipsed")).toHaveCount(1);
  await setSlider(page, "day", 22);
  await expect(page.locator(".astro-visited")).toContainText("dernier quartier");
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  await expect(compare.locator(".astro-month tbody tr")).toHaveCount(8);
  await expect(compare.locator(".astro-month tbody tr.is-target")).toHaveCount(4);
  await expect(compare).toContainText("Tu avais dit : l'ombre de la Terre. Mais l'ombre part à l'opposé du Soleil");
  await expect(compare).toContainText("Tu avais placé la pleine lune à l'opposé du Soleil : juste.");
  await page.click('.discover-check button:has-text("À la pleine lune")');
  await expect(page.locator(".vocab-feedback.good")).toBeVisible();
  await noSidewaysScroll(page);
});

test("the seasons: the tilt, not the distance; January is the closest; with an upright axis they go", async ({ page }) => {
  await newPlayer(page, "Sea");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-seasons");
  await button(page, "La Terre est plus près du Soleil").click();
  await button(page, "Début juillet").click();
  await button(page, "Aller explorer").click();

  // 21 June at 46° N, the starting point.
  const june = sky(day21(5));
  const energy = (day: number, latitude: number, tilt = TILT): string => fr((dailyInsolation(latitude, sky(day, tilt)) * 24) / 1000);
  await expect(page.locator(".discover-status")).toContainText(`Soleil à midi : ${Math.round(noonHeight(46, june.declination))}°`);
  await expect(page.locator(".discover-status")).toContainText(`lumière reçue : ${energy(day21(5), 46)} kWh/m²`);
  await expect(page.locator(".discover-status")).toContainText(`Distance au Soleil : ${fr(june.distance * 149.6)} millions de km`);
  await page.click(".physics-go");

  // December, then polar night up north.
  await setSlider(page, "date", day21(11));
  await expect(page.locator("input[name=date] + output")).toHaveText("21 décembre");
  await page.click(".physics-go");
  await setSlider(page, "latitude", 80);
  await expect(page.locator(".astro-noon")).toContainText("nuit polaire");
  await expect(page.locator(".discover-status")).toContainText("jour : 0 h 00");
  await setSlider(page, "latitude", 46);

  // An upright axis: both curves, almost the same light in June and December.
  await button(page, "Droite : 0°").click();
  await setSlider(page, "date", 15);
  await page.click(".physics-go");
  await expect(page.locator(".astro-year .theory-curve")).toHaveCount(2);
  await expect(page.locator(".discover-status")).toContainText(`lumière reçue : ${energy(15, 46, 0)} kWh/m²`);
  await expect(page.locator(".astro-readings tbody tr")).toHaveCount(3);
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  await expect(compare.locator(".astro-compare tbody tr").last()).toContainText(`${energy(day21(5), 46)}${energy(day21(11), 46)}`);
  await expect(compare).toContainText("Tu avais dit : la Terre est plus près. Mais elle est le plus près en janvier");
  await expect(compare).toContainText("La Terre est le plus près vers le 3 janvier");
  await expect(compare).toContainText("Avec l'axe droit, la courbe est presque plate");
  await page.click('.discover-check button:has-text("L\'hiver")');
  await expect(page.locator(".vocab-feedback.good")).toBeVisible();
});

test("eclipses: the tilted orbit, year by year; without the tilt, one every new moon; total or annular", async ({ page }) => {
  await newPlayer(page, "Ecl");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-eclipses");
  await button(page, "La Lune est trop petite pour cacher le Soleil").click();
  await button(page, "à la nouvelle lune").click();
  await button(page, "Aller observer").click();

  // The same run as the page: from the Moon 30° past its node, 60° past perigee.
  const run = syzygies(YEAR * 18, 30, 60);
  const flat = syzygies(YEAR * 18, 30, 60, 0);
  const inYear = (list: typeof run, y: number) => list.filter((s) => s.day >= (y - 1) * YEAR && s.day < y * YEAR);
  const count = (list: typeof run, kind: "solar" | "lunar") => list.filter((s) => s.eclipse?.kind === kind).length;
  for (const y of [1, 2, 3]) {
    await setSlider(page, "year", y);
    const year = inYear(run, y);
    expect(count(year, "solar")).toBeGreaterThanOrEqual(2);
    await expect(page.locator(".discover-status").first()).toHaveText(`Année ${y} : ${count(year, "solar")} éclipse(s) de Soleil, ${count(year, "lunar")} éclipse(s) de Lune.`);
    await expect(page.locator(".astro-eclipses tbody tr")).toHaveCount(year.filter((s) => s.eclipse).length);
    await expect(page.locator(".astro-eclipse-ring")).toHaveCount(year.filter((s) => s.eclipse).length);
  }
  await button(page, "Aucune : 0°").click();
  const solarFlat = count(inYear(flat, 3), "solar");
  expect(solarFlat).toBeGreaterThanOrEqual(12);
  await expect(page.locator(".discover-status").first()).toContainText(`${solarFlat} éclipse(s) de Soleil`);

  // Far from the Earth the Moon leaves a ring; close, it covers the Sun.
  await setSlider(page, "distance", 405000);
  await expect(page.locator(".astro-discs")).toHaveAttribute("aria-label", /éclipse annulaire$/);
  await setSlider(page, "distance", 363500);
  await expect(page.locator(".astro-discs")).toHaveAttribute("aria-label", /éclipse totale$/);
  await expect(page.locator(".astro-size-status")).toContainText("éclipse totale, sur une bande de");
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  await expect(compare.locator(".astro-years tbody tr")).toHaveCount(3);
  await expect(compare).toContainText("Tu avais dit : la Lune est trop petite.");
  await expect(compare).toContainText("Tu avais dit à la nouvelle lune : juste");
  await expect(compare).toContainText("Sans inclinaison, chaque nouvelle lune serait une éclipse de Soleil");
  await page.click(".discover-check .choice >> nth=0");
  await expect(page.locator(".vocab-feedback.good")).toBeVisible();
});

test("the planets: equal areas, T² = a³, and Mars backing up as the Earth overtakes it", async ({ page }) => {
  await newPlayer(page, "Kep");
  await page.setViewportSize({ width: 360, height: 740 });
  await openActivity(page, "discover-planets");
  await button(page, "Partout à la même vitesse").click();
  await button(page, "1,5 an").click();
  await button(page, "Aller explorer").click();

  await expect(page.locator(".astro-sector")).toHaveCount(12);
  await expect(page.locator(".astro-planet-dot")).toHaveCount(12);
  await page.click(".physics-go");
  await setSlider(page, "axis", 1.5);
  await setSlider(page, "eccentricity", 0.1);
  await expect(page.locator(".discover-status").first()).toContainText(`Une année dure ${fr(period(1.5), 2)} an`);
  await page.click(".physics-go");
  await setSlider(page, "eccentricity", 0.6);
  await page.click(".physics-go");
  await expect(page.locator(".astro-orbits tbody tr")).toHaveCount(3);

  // Around day 530, the Earth overtakes Mars: it goes backwards.
  await setSlider(page, "mars-day", 200);
  await expect(page.locator(".astro-mars-status")).toHaveText("Mars avance sur le fond d'étoiles.");
  await setSlider(page, "mars-day", 530);
  await expect(page.locator(".astro-mars-status")).toHaveText("Mars recule sur le fond d'étoiles.");
  await noSidewaysScroll(page);

  await button(page, "Comparer avec la théorie").click();
  const compare = page.locator(".discover-compare");
  await expect(compare.locator(".astro-planets tbody tr")).toHaveCount(6);
  await expect(compare).toContainText("Tu avais choisi « Partout à la même vitesse »");
  await expect(compare).toContainText("Tu avais dit 1,5 an.");
  await expect(compare).toContainText("Mars semble reculer");
  await page.click('.discover-check button:has-text("La Terre la dépasse")');
  await expect(page.locator(".vocab-feedback.good")).toBeVisible();
});
