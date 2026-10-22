/**
 * Bulbs and a battery: series, parallel, and one of each.
 *
 * A circuit is a list of bulbs between numbered junctions (0 is the
 * battery's − terminal, 1 its + terminal). It is solved by nodal analysis
 * (Kirchhoff's current law at every junction, Ohm's law in every bulb), a
 * general method that knows nothing of "series" or "parallel".
 * `npm run check:physics` compares it with the series and parallel formulas,
 * and checks that current and energy add up.
 *
 * Bulbs are taken as fixed resistors. A real filament's resistance rises
 * with its temperature, so a dim bulb is a little less dim than this model
 * says; the lab says so.
 */

/** Battery voltage, V. */
export const VOLTAGE = 6;
/** Resistance of one bulb, Ω. */
export const RESISTANCE = 12;

export const CIRCUITS = ["one", "series2", "series3", "parallel2", "parallel3", "mixed"] as const;
export type CircuitId = (typeof CIRCUITS)[number];

export type BulbName = "A" | "B" | "C";

/** Each bulb between two junctions, the current flowing from the first to the second. */
export const LAYOUT: Record<CircuitId, { bulb: BulbName; from: number; to: number }[]> = {
  one: [{ bulb: "A", from: 1, to: 0 }],
  series2: [
    { bulb: "A", from: 1, to: 2 },
    { bulb: "B", from: 2, to: 0 },
  ],
  series3: [
    { bulb: "A", from: 1, to: 2 },
    { bulb: "B", from: 2, to: 3 },
    { bulb: "C", from: 3, to: 0 },
  ],
  parallel2: [
    { bulb: "A", from: 1, to: 0 },
    { bulb: "B", from: 1, to: 0 },
  ],
  parallel3: [
    { bulb: "A", from: 1, to: 0 },
    { bulb: "B", from: 1, to: 0 },
    { bulb: "C", from: 1, to: 0 },
  ],
  mixed: [
    { bulb: "A", from: 1, to: 2 },
    { bulb: "B", from: 2, to: 0 },
    { bulb: "C", from: 2, to: 0 },
  ],
};

export interface BulbReading {
  bulb: BulbName;
  /** Present in its socket. */
  in: boolean;
  /** Voltage across it, V. */
  voltage: number;
  /** Current through it, A. */
  current: number;
  /** Power, W. */
  power: number;
  /** Power relative to one bulb alone on the battery: its brightness, roughly. */
  brightness: number;
}

export interface Solution {
  bulbs: BulbReading[];
  /** Current leaving the battery's + terminal, A. */
  battery: number;
  /** Power the battery delivers, W. */
  power: number;
  /** Voltage of every junction, V (junction 0 at 0 V). */
  junctions: number[];
}

/** One bulb alone on the battery: its power, the yardstick of brightness. */
export const SINGLE_POWER = (VOLTAGE * VOLTAGE) / RESISTANCE;

/** Solves A x = b by Gaussian elimination with partial pivoting. */
export function solveLinear(a: number[][], b: number[]): number[] {
  const n = b.length;
  const m = a.map((row, i) => [...row, b[i]!]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(m[r]![col]!) > Math.abs(m[pivot]![col]!)) pivot = r;
    [m[col], m[pivot]] = [m[pivot]!, m[col]!];
    const p = m[col]![col]!;
    if (Math.abs(p) < 1e-300) throw new Error("singular circuit");
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = m[r]![col]! / p;
      if (f !== 0) for (let c = col; c <= n; c++) m[r]![c]! -= f * m[col]![c]!;
    }
  }
  return m.map((row, i) => row[n]! / row[i]!);
}

/**
 * Nodal analysis. Unknowns: the voltages of junctions 1…n and the battery's
 * current. A tiny conductance from every junction to 0 keeps a junction left
 * floating by a missing bulb defined (it then sits at a harmless voltage, no
 * current through anything).
 */
export function solve(circuit: CircuitId, removed: BulbName[] = [], voltage = VOLTAGE, resistance = RESISTANCE): Solution {
  const parts = LAYOUT[circuit];
  const nodes = Math.max(...parts.flatMap((p) => [p.from, p.to]));
  const size = nodes + 1; // V1…Vn, then the battery current
  const a = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  const b = new Array<number>(size).fill(0);
  const g = 1 / resistance;
  const GMIN = 1e-12;
  for (let n = 1; n <= nodes; n++) a[n - 1]![n - 1]! += GMIN;
  for (const p of parts) {
    if (removed.includes(p.bulb)) continue;
    for (const [i, j] of [
      [p.from, p.to],
      [p.to, p.from],
    ] as const) {
      if (i === 0) continue;
      a[i - 1]![i - 1]! += g;
      if (j !== 0) a[i - 1]![j - 1]! -= g;
    }
  }
  // The battery drives current I out of + (junction 1) into the circuit: it enters junction 1's balance.
  a[0]![nodes]! -= 1;
  // And sets V1 − V0 = voltage.
  a[nodes]![0] = 1;
  b[nodes] = voltage;
  const x = solveLinear(a, b);
  const junctions = [0, ...x.slice(0, nodes)];
  const battery = x[nodes]!;
  const bulbs = parts.map((p): BulbReading => {
    const present = !removed.includes(p.bulb);
    const v = present ? junctions[p.from]! - junctions[p.to]! : 0;
    const i = v / resistance;
    return { bulb: p.bulb, in: present, voltage: v, current: i, power: v * i, brightness: (v * i) / ((voltage * voltage) / resistance) };
  });
  return { bulbs, battery, power: voltage * battery, junctions };
}

/** Bulbs of a circuit. */
export const bulbsOf = (circuit: CircuitId): BulbName[] => LAYOUT[circuit].map((p) => p.bulb);
