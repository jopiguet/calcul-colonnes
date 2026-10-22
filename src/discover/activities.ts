/**
 * The Discover activities by id: the probability labs and grids, then the
 * physics playground. Kept apart from their views so settings can check a
 * saved id without loading them.
 */
export const DISCOVER_ACTIVITIES = ["dice", "coins", "puzzles", "throw", "pendulum", "lenses", "circuits"] as const;
export type DiscoverActivity = (typeof DISCOVER_ACTIVITIES)[number];

/** The physics playground: shown in its own group on the home page. */
export const PHYSICS_LABS: DiscoverActivity[] = ["throw", "pendulum", "lenses", "circuits"];

export const isDiscoverActivity = (value: unknown): value is DiscoverActivity => (DISCOVER_ACTIVITIES as readonly unknown[]).includes(value);
