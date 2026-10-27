/** The Discover activities, as the app and its update watcher see them. */
import { cellsBusy, cellsView } from "./cells";
import { chaosBusy, chaosGameView } from "./chaosgame";
import { kochBusy, kochView } from "./koch";
import { logisticBusy, logisticView } from "./logistic";
import { lorenzBusy, lorenzView } from "./lorenz";
import { mandelbrotBusy, mandelbrotView } from "./mandelbrot";
import { circuitsBusy, circuitsView } from "./circuits";
import { coinsBusy, coinsView } from "./coins";
import { diceBusy, diceView } from "./dice";
import { eclipsesBusy, eclipsesView } from "./eclipses";
import { ecologyBusy, ecologyView } from "./ecology";
import { geneticsBusy, geneticsView } from "./genetics";
import { lensesBusy, lensesView } from "./lenses";
import { moleculesBusy, moleculesView } from "./molecules";
import { moonBusy, moonView } from "./moon";
import { pendulumBusy, pendulumView } from "./pendulum";
import { planetsBusy, planetsView } from "./planets";
import { puzzlesBusy, puzzlesView } from "./puzzles";
import { seasonsBusy, seasonsView } from "./seasons";
import { throwBusy, throwView } from "./throw";
import { ASTRONOMY_LABS, BIO_LABS, DISCOVER_ACTIVITIES, MATH_LABS, PHYSICS_LABS, type DiscoverActivity } from "./activities";
import type { User } from "../store";

export { ASTRONOMY_LABS, BIO_LABS, DISCOVER_ACTIVITIES, MATH_LABS, PHYSICS_LABS, type DiscoverActivity };

const VIEWS: Record<DiscoverActivity, (ctx: { user: User }) => HTMLElement> = {
  dice: diceView,
  coins: coinsView,
  puzzles: puzzlesView,
  throw: throwView,
  pendulum: pendulumView,
  lenses: lensesView,
  circuits: circuitsView,
  moon: moonView,
  seasons: seasonsView,
  eclipses: eclipsesView,
  planets: planetsView,
  molecules: moleculesView,
  genetics: geneticsView,
  cells: cellsView,
  ecology: ecologyView,
  koch: kochView,
  mandelbrot: mandelbrotView,
  chaosgame: chaosGameView,
  lorenz: lorenzView,
  logistic: logisticView,
};

export function discoverView(activity: DiscoverActivity, ctx: { user: User }): HTMLElement {
  return VIEWS[activity](ctx);
}

/** An experiment under way, in any lab: the update watcher does not reload then. */
export const discoverBusy = (): boolean =>
  diceBusy() || coinsBusy() || puzzlesBusy() || throwBusy() || pendulumBusy() || lensesBusy() || circuitsBusy() ||
  moonBusy() || seasonsBusy() || eclipsesBusy() || planetsBusy() ||
  moleculesBusy() || geneticsBusy() || cellsBusy() || ecologyBusy() ||
  kochBusy() || mandelbrotBusy() || chaosBusy() || lorenzBusy() || logisticBusy();
