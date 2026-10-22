/** The Discover activities, as the app and its update watcher see them. */
import { circuitsBusy, circuitsView } from "./circuits";
import { coinsBusy, coinsView } from "./coins";
import { diceBusy, diceView } from "./dice";
import { lensesBusy, lensesView } from "./lenses";
import { pendulumBusy, pendulumView } from "./pendulum";
import { puzzlesBusy, puzzlesView } from "./puzzles";
import { throwBusy, throwView } from "./throw";
import { DISCOVER_ACTIVITIES, PHYSICS_LABS, type DiscoverActivity } from "./activities";
import type { User } from "../store";

export { DISCOVER_ACTIVITIES, PHYSICS_LABS, type DiscoverActivity };

const VIEWS: Record<DiscoverActivity, (ctx: { user: User }) => HTMLElement> = {
  dice: diceView,
  coins: coinsView,
  puzzles: puzzlesView,
  throw: throwView,
  pendulum: pendulumView,
  lenses: lensesView,
  circuits: circuitsView,
};

export function discoverView(activity: DiscoverActivity, ctx: { user: User }): HTMLElement {
  return VIEWS[activity](ctx);
}

/** An experiment under way, in any lab: the update watcher does not reload then. */
export const discoverBusy = (): boolean =>
  diceBusy() || coinsBusy() || puzzlesBusy() || throwBusy() || pendulumBusy() || lensesBusy() || circuitsBusy();
