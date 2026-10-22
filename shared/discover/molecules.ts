/**
 * Molecules: bonds from valences, shapes from electron pairs (VSEPR).
 *
 * Each atom makes as many bonds as its valence (H 1, O 2, N 3, C 4, Cl 1); a
 * double bond counts twice. Around a central atom, the bonded neighbours and
 * the lone pairs push each other as far apart as they can: two groups make a
 * line, three a triangle, four a tetrahedron. Lone pairs are invisible in the
 * shape but take room, and push the bonds a little closer: water is bent at
 * 104.5°, while carbon dioxide, with no lone pair on carbon, is straight.
 * `npm run check:biology` checks that each molecule has exactly one way to
 * satisfy every valence on its skeleton, and that the shapes follow.
 */

export type Element = "H" | "C" | "N" | "O" | "Cl";

export const VALENCE: Record<Element, number> = { H: 1, C: 4, N: 3, O: 2, Cl: 1 };
/** Electrons in the outer shell. */
export const OUTER: Record<Element, number> = { H: 1, C: 4, N: 5, O: 6, Cl: 7 };

export interface Molecule {
  id: string;
  formula: string;
  atoms: Element[];
  /** Positions for drawing, in a 0–100 square. */
  at: [number, number][];
  /** The skeleton: which atoms are next to each other. Bond orders are the learner's to find. */
  links: [number, number][];
  /** The atoms whose shape is asked. */
  centres: number[];
}

export const MOLECULES: Molecule[] = [
  { id: "water", formula: "H2O", atoms: ["O", "H", "H"], at: [[50, 40], [22, 68], [78, 68]], links: [[0, 1], [0, 2]], centres: [0] },
  { id: "carbonDioxide", formula: "CO2", atoms: ["C", "O", "O"], at: [[50, 50], [18, 50], [82, 50]], links: [[0, 1], [0, 2]], centres: [0] },
  { id: "ammonia", formula: "NH3", atoms: ["N", "H", "H", "H"], at: [[50, 38], [20, 70], [50, 82], [80, 70]], links: [[0, 1], [0, 2], [0, 3]], centres: [0] },
  { id: "methane", formula: "CH4", atoms: ["C", "H", "H", "H", "H"], at: [[50, 50], [50, 16], [16, 50], [84, 50], [50, 84]], links: [[0, 1], [0, 2], [0, 3], [0, 4]], centres: [0] },
  { id: "oxygen", formula: "O2", atoms: ["O", "O"], at: [[32, 50], [68, 50]], links: [[0, 1]], centres: [] },
  { id: "nitrogen", formula: "N2", atoms: ["N", "N"], at: [[32, 50], [68, 50]], links: [[0, 1]], centres: [] },
  { id: "hydrogenCyanide", formula: "HCN", atoms: ["H", "C", "N"], at: [[14, 50], [44, 50], [80, 50]], links: [[0, 1], [1, 2]], centres: [1] },
  { id: "formaldehyde", formula: "CH2O", atoms: ["C", "O", "H", "H"], at: [[50, 55], [50, 18], [20, 78], [80, 78]], links: [[0, 1], [0, 2], [0, 3]], centres: [0] },
  { id: "ethylene", formula: "C2H4", atoms: ["C", "C", "H", "H", "H", "H"], at: [[36, 50], [64, 50], [14, 26], [14, 74], [86, 26], [86, 74]], links: [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5]], centres: [0, 1] },
  { id: "acetylene", formula: "C2H2", atoms: ["H", "C", "C", "H"], at: [[10, 50], [36, 50], [64, 50], [90, 50]], links: [[0, 1], [1, 2], [2, 3]], centres: [1, 2] },
];

export const molecule = (id: string): Molecule => MOLECULES.find((m) => m.id === id)!;

/** Bonds made by each atom with these bond orders (one per link). */
export function bondsOf(m: Molecule, orders: number[]): number[] {
  const made = m.atoms.map(() => 0);
  m.links.forEach(([a, b], i) => {
    made[a]! += orders[i]!;
    made[b]! += orders[i]!;
  });
  return made;
}

/** Every atom has exactly its valence. */
export const satisfied = (m: Molecule, orders: number[]): boolean => bondsOf(m, orders).every((n, i) => n === VALENCE[m.atoms[i]!]);

/** Every way to give the links orders 1–3 that satisfies every valence. */
export function solutions(m: Molecule): number[][] {
  const out: number[][] = [];
  const orders = m.links.map(() => 1);
  const walk = (i: number): void => {
    if (i === orders.length) {
      if (satisfied(m, orders)) out.push([...orders]);
      return;
    }
    for (let k = 1; k <= 3; k++) {
      orders[i] = k;
      walk(i + 1);
    }
  };
  walk(0);
  return out;
}

export interface Shape {
  /** Neighbours bonded to the atom, and its lone pairs. */
  bonded: number;
  lonePairs: number;
  name: "linear" | "trigonalPlanar" | "bent" | "tetrahedral" | "trigonalPyramidal";
  /** The angle between two bonds, degrees. */
  angle: number;
}

/** VSEPR: the shape around atom `i` once the bonds are set. */
export function shapeAt(m: Molecule, orders: number[], i: number): Shape {
  const bonded = m.links.filter(([a, b]) => a === i || b === i).length;
  const lonePairs = (OUTER[m.atoms[i]!] - bondsOf(m, orders)[i]!) / 2;
  const groups = bonded + lonePairs;
  if (groups === 2) return { bonded, lonePairs, name: "linear", angle: 180 };
  if (groups === 3) return lonePairs === 0 ? { bonded, lonePairs, name: "trigonalPlanar", angle: 120 } : { bonded, lonePairs, name: "bent", angle: 117 };
  if (lonePairs === 0) return { bonded, lonePairs, name: "tetrahedral", angle: 109.5 };
  if (lonePairs === 1) return { bonded, lonePairs, name: "trigonalPyramidal", angle: 107 };
  return { bonded, lonePairs, name: "bent", angle: 104.5 };
}

/** The ideal angle for a number of electron groups, without lone pairs: the farthest apart on a sphere. */
export function idealAngle(groups: number): number {
  if (groups === 2) return 180;
  if (groups === 3) return 120;
  return (Math.acos(-1 / 3) * 180) / Math.PI;
}
