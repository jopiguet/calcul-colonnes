/**
 * npm run check:astronomy — the astronomy labs' geometric models against
 * independent computations and against what is observed.
 *
 *   moon      the lit fraction (1 − cos φ)/2 against an integration over the
 *             Moon's surface; the phase names; the Earth's shadow, which
 *             reaches the Moon only within 1.5° of full moon
 *   seasons   solstices and equinoxes on their dates; perihelion in January;
 *             daily sunlight, formula against a minute-by-minute sum; with
 *             the tilt set to zero the seasons disappear, and the distance
 *             alone would make January the warmest month in the north
 *   eclipses  the limits; 2 to 5 solar eclipses a year, over centuries of
 *             simulated years; none outside the eclipse seasons; with an
 *             untilted orbit, an eclipse at every new moon; total at perigee,
 *             annular at apogee
 *   orbits    Kepler's ellipse against Newton's gravity, integrated; equal
 *             areas; vis-viva; T² = a³; Mars' retrograde loops: how many, how
 *             long, and that they happen when the Earth overtakes Mars
 */
import { EARTH_RADIUS, MOON_DISTANCE, SYNODIC, elongation, illuminated, illuminatedByIntegration, inShadow, phaseOf, riseHour, shadowAt, waxing } from "../shared/discover/moon.ts";
import { TILT, YEAR, dailyInsolation, dailyInsolationBySum, day21, dayLength, noonHeight, sky } from "../shared/discover/seasons.ts";
import {
  ECLIPSE_YEAR,
  MOON_ECCENTRICITY,
  MOON_SEMI_AXIS,
  centralKind,
  eclipsesOver,
  lunarLimit,
  solarLimit,
  sunRadius,
  umbraWidth,
} from "../shared/discover/eclipses.ts";
import { GM, PLANETS, integrateOrbit, marsTrack, period, planet, planetAt, positionAt, retrogradeSpells, speedAt, sweptArea } from "../shared/discover/orbits.ts";

let failures = 0;
let checks = 0;
function expect(ok: boolean, what: string): void {
  checks++;
  if (!ok) {
    failures++;
    if (failures <= 30) console.log(`  ✗ ${what}`);
  }
}
const near = (a: number, b: number, tol: number): boolean => Math.abs(a - b) <= tol;
const rel = (a: number, b: number, tol: number): boolean => Math.abs(a - b) <= tol * Math.max(Math.abs(a), Math.abs(b), 1e-300);

// ------------------------------------------------------------ moon

for (let phi = 0; phi < 360; phi += 7.5) {
  const integrated = illuminatedByIntegration(phi, 240);
  expect(near(illuminated(phi), integrated, 2e-3), `lit fraction at φ=${phi}: ${illuminated(phi)} against ${integrated}`);
}
expect(illuminated(0) === 0 && near(illuminated(180), 1, 1e-15) && near(illuminated(90), 0.5, 1e-12), "new, full and quarter moon");
for (const [day, name] of [
  [0, "new"],
  [SYNODIC / 8, "waxingCrescent"],
  [SYNODIC / 4, "firstQuarter"],
  [SYNODIC / 2, "full"],
  [(3 * SYNODIC) / 4, "lastQuarter"],
  [(7 * SYNODIC) / 8, "waningCrescent"],
  [SYNODIC, "new"],
] as const) {
  expect(phaseOf(elongation(day)) === name, `day ${day.toFixed(2)} is ${name}: got ${phaseOf(elongation(day))}`);
}
expect(waxing(90) && !waxing(270), "waxing before full moon, waning after");
expect(riseHour(0) === 6 && riseHour(180) === 18 && riseHour(90) === 12, "the full moon rises at sunset, the first quarter at noon");
const shadow = shadowAt();
expect(near(shadow.umbra, 4600, 30), `umbra at the Moon: ${shadow.umbra} km`);
expect(near(shadow.penumbra, 8176, 30), `penumbra at the Moon: ${shadow.penumbra} km`);
expect(shadow.umbra / 1737 > 2.5, "the umbra is more than 2.5 Moons wide: total lunar eclipses can last over an hour");
// The misconception: if the Earth's shadow made the phases, a half Moon would be half in the shadow.
let widest = 0;
for (let phi = 0; phi < 360; phi += 0.01) {
  if (inShadow(phi) !== "none") widest = Math.max(widest, Math.abs(phi - 180));
}
expect(widest > 1.2 && widest < 1.7, `the Earth's shadow reaches the Moon only near full moon: within ${widest.toFixed(2)}°`);
expect(inShadow(180) === "total" && inShadow(90) === "none" && inShadow(270) === "none" && inShadow(0) === "none", "full moon in the umbra, quarters in sunlight");
expect(inShadow(180, 5) === "none", "a full moon 5° above the ecliptic misses the shadow");

// ------------------------------------------------------------ seasons

const june = sky(day21(5));
const december = sky(day21(11));
expect(near(june.declination, TILT, 0.3), `June solstice: declination ${june.declination}`);
expect(near(december.declination, -TILT, 0.3), `December solstice: declination ${december.declination}`);
expect(near(sky(78).declination, 0, 0.6) && near(sky(265).declination, 0, 0.6), "equinoxes around 20 March and 22 September");
let closest = 0;
for (let d = 0; d < 365; d++) if (sky(d).distance < sky(closest).distance) closest = d;
expect(closest >= 1 && closest <= 5, `perihelion in early January: day ${closest}`);
expect(near(sky(closest).distance, 0.983, 0.001) && near(sky(closest + 182).distance, 1.017, 0.001), "distance 0.983 to 1.017 AU");
for (let latitude = -85; latitude <= 85; latitude += 5) {
  for (let d = 0; d < 365; d += 13) {
    const s = sky(d);
    const formula = dailyInsolation(latitude, s);
    const summed = dailyInsolationBySum(latitude, s, 4000);
    expect(near(formula, summed, 0.6), `daily sunlight at ${latitude}°, day ${d}: ${formula} against ${summed}`);
  }
}
for (let d = 0; d < 365; d += 5) expect(near(dayLength(0, sky(d).declination), 12, 1e-9), `12 h days at the equator, day ${d}`);
for (let latitude = -60; latitude <= 60; latitude += 10) {
  expect(near(dayLength(latitude, 0), 12, 1e-9), `12 h days everywhere at an equinox, latitude ${latitude}`);
  // The two hemispheres mirror each other.
  expect(near(dayLength(latitude, june.declination) + dayLength(-latitude, june.declination), 24, 1e-9), `day lengths mirror at ${latitude}`);
}
expect(near(noonHeight(46.2, june.declination), 67.2, 0.4) && near(noonHeight(46.2, december.declination), 20.4, 0.4), "Geneva: the noon Sun at 67° in June, 20° in December");
expect(dayLength(80, june.declination) === 24 && dayLength(80, december.declination) === 0, "polar day and polar night");
const geneva = (d: number, tilt = TILT): number => dailyInsolation(46.2, sky(d, tilt));
expect(geneva(day21(5)) > 2.5 * geneva(day21(11)), `Geneva gets far more sunlight in June: ${geneva(day21(5))} against ${geneva(day21(11))}`);
const buenosAires = (d: number): number => dailyInsolation(-34.6, sky(d));
expect(buenosAires(day21(11)) > 1.8 * buenosAires(day21(5)), "Buenos Aires: summer in December");
// Without the tilt the distance is all that changes: January wins, by about 7 %.
const untilted = geneva(15, 0) / geneva(196, 0);
expect(untilted > 1.06 && untilted < 1.08, `no tilt: January gets ${untilted.toFixed(3)} times July's sunlight`);
let flat = Infinity;
let steep = 0;
for (let d = 0; d < 365; d++) {
  flat = Math.min(flat, geneva(d, 0));
  steep = Math.max(steep, geneva(d, 0));
}
expect(steep / flat < 1.08, "no tilt, no seasons: under 8 % change over the year");

// ------------------------------------------------------------ eclipses

expect(near(sunRadius(), 0.2666, 0.001), `the Sun's apparent radius: ${sunRadius()}`);
expect(solarLimit() > 1.4 && solarLimit() < 1.6, `solar eclipse limit: ${solarLimit()}`);
expect(lunarLimit() > 0.85 && lunarLimit() < 1.0, `lunar eclipse limit: ${lunarLimit()}`);
const perigee = MOON_SEMI_AXIS * (1 - MOON_ECCENTRICITY);
const apogee = MOON_SEMI_AXIS * (1 + MOON_ECCENTRICITY);
expect(centralKind(perigee) === "total" && centralKind(apogee) === "annular", "total at perigee, annular at apogee");
expect(umbraWidth(perigee) > 150 && umbraWidth(perigee) < 300, `the total strip at perigee: ${umbraWidth(perigee)} km`);
expect(umbraWidth(MOON_DISTANCE) < 0, "at mean distance the Moon's umbra just misses the Earth");

let years = 0;
let solarMin = Infinity;
let solarMax = 0;
let lunarMax = 0;
let annular = 0;
let total = 0;
for (let node = 0; node < 360; node += 15) {
  for (let anomaly = 0; anomaly < 360; anomaly += 90) {
    const eclipses = eclipsesOver(YEAR * 30, node, anomaly);
    for (let y = 0; y < 30; y++) {
      const inYear = eclipses.filter((e) => e.day >= y * YEAR && e.day < (y + 1) * YEAR);
      const solar = inYear.filter((e) => e.kind === "solar").length;
      const lunar = inYear.filter((e) => e.kind === "lunar").length;
      solarMin = Math.min(solarMin, solar);
      solarMax = Math.max(solarMax, solar);
      lunarMax = Math.max(lunarMax, lunar);
      years++;
    }
    for (const e of eclipses) {
      if (e.type === "annular") annular++;
      if (e.kind === "solar" && e.type === "total") total++;
      // Only in the eclipse seasons: the Sun within about 18° of a node.
      const sunFromNode = (node + (360 * e.day) / ECLIPSE_YEAR) % 180;
      expect(Math.min(sunFromNode, 180 - sunFromNode) < 19, `eclipse ${e.day.toFixed(1)} outside an eclipse season: ${sunFromNode}`);
    }
    // An eclipse season every half eclipse year: no gap between eclipses of 0.25 to 0.4 years.
    for (let i = 1; i < eclipses.length; i++) {
      const gap = eclipses[i]!.day - eclipses[i - 1]!.day;
      expect(gap < 40 || gap > 140, `a gap of ${gap.toFixed(1)} days between eclipses`);
    }
  }
}
expect(solarMin >= 2 && solarMax <= 5, `solar eclipses a year over ${years} years: ${solarMin} to ${solarMax}`);
expect(lunarMax <= 3, `umbral lunar eclipses a year: at most ${lunarMax}`);
expect(annular > total, `annular eclipses outnumber total ones: ${annular} against ${total}`);
const untiltedEclipses = eclipsesOver(YEAR, 40, 0, 0);
const newMoons = Math.floor(YEAR / SYNODIC) + 1;
expect(untiltedEclipses.filter((e) => e.kind === "solar").length === newMoons, "an untilted orbit: a solar eclipse every new moon");
expect(untiltedEclipses.filter((e) => e.kind === "lunar").length === newMoons - 1 + (YEAR % SYNODIC > SYNODIC / 2 ? 1 : 0), "and a lunar eclipse every full moon");
expect(EARTH_RADIUS > 0, "constants");

// ------------------------------------------------------------ orbits

for (const p of PLANETS) {
  expect(rel(period(p.a) ** 2, p.a ** 3, 1e-12), `T² = a³ for ${p.name}`);
  const T = period(p.a);
  const back = positionAt(p.a, p.e, T);
  const start = positionAt(p.a, p.e, 0);
  expect(near(back.x, start.x, 1e-9) && near(back.y, start.y, 1e-9), `${p.name} back at perihelion after one period`);
  // Equal areas in equal times.
  const b = p.a * Math.sqrt(1 - p.e * p.e);
  for (let k = 0; k < 12; k++) {
    const area = sweptArea(p.a, p.e, (T * k) / 12, (T * (k + 1)) / 12, 600);
    expect(rel(area, (Math.PI * p.a * b) / 12, 1e-5), `${p.name} sector ${k}: ${area} against ${(Math.PI * p.a * b) / 12}`);
  }
  // Vis-viva against the speed measured along the ellipse.
  for (let k = 0; k < 8; k++) {
    const t = (T * k) / 8;
    const h = T * 1e-6;
    const p0 = positionAt(p.a, p.e, t - h);
    const p1 = positionAt(p.a, p.e, t + h);
    const measured = Math.hypot(p1.x - p0.x, p1.y - p0.y) / (2 * h);
    expect(rel(measured, speedAt(p.a, positionAt(p.a, p.e, t).r), 1e-6), `${p.name} speed at ${k}/8`);
  }
}
expect(near(period(planet("mars").a), 1.88, 0.01), `a Mars year: ${period(planet("mars").a)}`);
expect(speedAt(1, 1) > 6.28 && speedAt(1, 1) < 6.29, "the Earth: 2π AU a year");
for (const e of [0, 0.0167, 0.0934, 0.2056, 0.5, 0.7]) {
  for (const fraction of [0.13, 0.5, 0.77, 1]) {
    const a = 1;
    const kepler = positionAt(a, e, fraction);
    const newton = integrateOrbit(a, e, fraction, e > 0.4 ? 2e-6 : 1e-5);
    expect(near(kepler.x, newton.x, 2e-5) && near(kepler.y, newton.y, 2e-5), `Kepler against Newton, e=${e}, t=${fraction}: (${kepler.x}, ${kepler.y}) against (${newton.x}, ${newton.y})`);
  }
}
expect(GM === 4 * Math.PI ** 2, "GM in AU³/yr²");
const track = marsTrack(10);
const spells = retrogradeSpells(track);
expect(spells.length >= 4 && spells.length <= 5, `Mars backs up every 2.1 years: ${spells.length} times in 10 years`);
for (const s of spells) {
  expect(s.days > 55 && s.days < 85, `a retrograde spell of ${s.days.toFixed(0)} days`);
  const middle = (s.start + s.days / 2) / 365.25;
  const m = planetAt(planet("mars"), middle);
  const e = planetAt(planet("earth"), middle);
  const apart = Math.abs((((Math.atan2(m.y, m.x) - Math.atan2(e.y, e.x)) * 180) / Math.PI + 540) % 360 - 180);
  expect(apart < 10, `the Earth overtakes Mars in the middle of the spell: ${apart.toFixed(1)}° apart`);
}
for (let i = 1; i < spells.length; i++) {
  const gap = (spells[i]!.start - spells[i - 1]!.start) / 365.25;
  expect(near(gap, 2.135, 0.15), `between retrograde spells: ${gap.toFixed(2)} years (the synodic period of Mars)`);
}

console.log(`${checks} checks, ${failures} failures.`);
if (failures > 0) process.exit(1);
