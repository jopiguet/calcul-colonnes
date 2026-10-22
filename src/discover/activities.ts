/**
 * The Discover activities by id: the probability labs and grids, then the
 * physics playground and the astronomy labs. Kept apart from their views so settings can check a
 * saved id without loading them.
 */
export const DISCOVER_ACTIVITIES = ["dice", "coins", "puzzles", "throw", "pendulum", "lenses", "circuits", "moon", "seasons", "eclipses", "planets", "molecules", "genetics", "cells", "ecology"] as const;
export type DiscoverActivity = (typeof DISCOVER_ACTIVITIES)[number];

/** The physics playground: shown in its own group on the home page. */
export const PHYSICS_LABS: DiscoverActivity[] = ["throw", "pendulum", "lenses", "circuits"];

/** The astronomy labs: their own group too. */
export const ASTRONOMY_LABS: DiscoverActivity[] = ["moon", "seasons", "eclipses", "planets"];

/** The chemistry-and-biology labs: with the balancing test, in their own group. */
export const BIO_LABS: DiscoverActivity[] = ["molecules", "genetics", "cells", "ecology"];

export const isDiscoverActivity = (value: unknown): value is DiscoverActivity => (DISCOVER_ACTIVITIES as readonly unknown[]).includes(value);
