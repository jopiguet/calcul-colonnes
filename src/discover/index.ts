/** The Discover activities, as the app and its update watcher see them. */
import { coinsBusy, coinsView } from "./coins";
import { diceBusy, diceView } from "./dice";
import type { User } from "../store";

/** The Discover activities, in the order of the home page. */
export const DISCOVER_ACTIVITIES = ["dice", "coins"] as const;
export type DiscoverActivity = (typeof DISCOVER_ACTIVITIES)[number];

export function discoverView(activity: DiscoverActivity, ctx: { user: User }): HTMLElement {
  return activity === "coins" ? coinsView(ctx) : diceView(ctx);
}

/** An experiment under way, in any lab: the update watcher does not reload then. */
export const discoverBusy = (): boolean => diceBusy() || coinsBusy();
