/** English, French, Spanish. */
export type L3 = readonly [string, string, string];

/** How to install a tool that is not there by default: package names. */
export interface Install {
  apt: string;
  dnf?: string;
  brew?: string;
}

/**
 * A written Linux question. Commands go between backticks, identical in the
 * three languages; inline TeX between $…$ is avoided (a `$` belongs to code).
 */
export interface LinuxQuestion {
  /** Stable id ("lx-grep-01"): stored with a flag, never reused. */
  id: string;
  /** The test version that added it (2 for the first lists). */
  since?: number;
  q: L3;
  a: L3;
  /** At least three wrong answers; three are drawn. */
  w: readonly L3[];
  e: L3;
  install?: Install;
}
