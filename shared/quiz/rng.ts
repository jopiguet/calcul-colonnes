/** Seeded random numbers (mulberry32): the same seed always gives the same test. */
export interface Rng {
  next(): number;
  /** Integer in [min, max], both inclusive. */
  int(min: number, max: number): number;
  /** Integer in [min, max] other than 0. */
  nonZero(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  /** Shuffled copy. */
  shuffle<T>(items: readonly T[]): T[];
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number): number => min + Math.floor(next() * (max - min + 1));
  return {
    next,
    int,
    nonZero(min, max) {
      for (;;) {
        const value = int(min, max);
        if (value !== 0) return value;
      }
    },
    pick: (items) => items[int(0, items.length - 1)]!,
    shuffle(items) {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(0, i);
        [out[i], out[j]] = [out[j]!, out[i]!];
      }
      return out;
    },
  };
}
