/**
 * Quantities with units for the physical chemistry questions: values written
 * to a number of significant figures, constants, and the options a
 * calculation gives.
 */
import type { Option, MistakeKey } from "./types";
import type { Rng } from "./rng";

/** Gas constant in J K⁻¹ mol⁻¹, and in dm³ bar K⁻¹ mol⁻¹. */
export const R = 8.314;
export const R_BAR = 0.08314;
/** L atm K⁻¹ mol⁻¹: the value a student may use by mistake in SI units. */
export const R_ATM = 0.08206;
export const K_B = 1.381e-23;
export const N_A = 6.022e23;
export const KELVIN = 273.15;
/** Faraday constant, C mol⁻¹. */
export const FARADAY = 96485;

/**
 * A number to `digits` significant figures, in TeX: plain between 0.001 and
 * 100 000 (so it can be typed), ×10ⁿ otherwise.
 */
export function sig(x: number, digits = 3): string {
  if (x === 0) return "0";
  if (!Number.isFinite(x)) return x > 0 ? "\\infty" : "-\\infty";
  const exponent = Math.floor(Math.log10(Math.abs(x)));
  const plain = Math.abs(x) >= 1e-3 && Math.abs(x) < 1e5;
  if (plain) {
    const decimals = Math.max(0, digits - 1 - exponent);
    const text = x.toFixed(decimals);
    // 9.996 to 3 figures is 10.00: one decimal too many.
    const rounded = Number(text);
    const again = Math.floor(Math.log10(Math.abs(rounded)));
    return again > exponent ? rounded.toFixed(Math.max(0, digits - 1 - again)) : text;
  }
  let mantissa = x / 10 ** exponent;
  let power = exponent;
  if (Math.abs(Number(mantissa.toFixed(digits - 1))) >= 10) {
    mantissa /= 10;
    power += 1;
  }
  return `${mantissa.toFixed(digits - 1)} \\times 10^{${power}}`;
}

/** A unit in TeX roman: "dm^{3}" → \mathrm{dm^{3}}; "" for none. */
export const unit = (u: string): string => (u ? `\\,\\mathrm{${u}}` : "");

/** A quantity: value to `digits` figures and its unit. */
export const qty = (x: number, u: string, digits = 3): string => `${sig(x, digits)}${unit(u)}`;

/** A given: "T = 298\,K". */
export const given = (symbol: string, x: number, u: string, digits = 3): string => `${symbol} = ${qty(x, u, digits)}`;

/** The quantity asked, with the unit the answer is in: "p = \;?\;\mathrm{kPa}". */
export const asked = (symbol: string, u: string): string => `${symbol} = \\;?${unit(u)}`;

/** An option: the value as shown, and the exact value behind it. */
export const valueIn = (x: number, u: string, digits = 3): Option => ({ tex: qty(x, u, digits), num: x });

/** A wrong option standing for a mistake. */
export const mistakeIn = (x: number, u: string, mistake: MistakeKey, digits = 3): Option => ({ ...valueIn(x, u, digits), mistake });

/** A value drawn on a grid: min + k·step, written with the step's decimals. */
export function draw(rng: Rng, min: number, max: number, step: number): number {
  const k = rng.int(0, Math.round((max - min) / step));
  const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  return Number((min + k * step).toFixed(decimals));
}
