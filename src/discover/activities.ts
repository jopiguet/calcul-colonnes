/**
 * The Discover activities by id: the probability labs and grids, then the
 * physics playground, the astronomy, chemistry-and-biology and mathematical-curiosity labs. Kept apart from their views so settings can check a
 * saved id without loading them.
 */
export const DISCOVER_ACTIVITIES = ["dice", "coins", "puzzles", "throw", "pendulum", "lenses", "circuits", "moon", "seasons", "eclipses", "planets", "molecules", "genetics", "cells", "ecology", "koch", "mandelbrot", "chaosgame", "lorenz", "logistic"] as const;
export type DiscoverActivity = (typeof DISCOVER_ACTIVITIES)[number];

/** The physics playground: shown in its own group on the home page. */
export const PHYSICS_LABS: DiscoverActivity[] = ["throw", "pendulum", "lenses", "circuits"];

/** The astronomy labs: their own group too. */
export const ASTRONOMY_LABS: DiscoverActivity[] = ["moon", "seasons", "eclipses", "planets"];

/** The chemistry-and-biology labs: with the balancing test, in their own group. */
export const BIO_LABS: DiscoverActivity[] = ["molecules", "genetics", "cells", "ecology"];

/** The mathematical curiosities: fractals and chaos, their own group. */
export const MATH_LABS: DiscoverActivity[] = ["koch", "mandelbrot", "chaosgame", "lorenz", "logistic"];

export const isDiscoverActivity = (value: unknown): value is DiscoverActivity => (DISCOVER_ACTIVITIES as readonly unknown[]).includes(value);
