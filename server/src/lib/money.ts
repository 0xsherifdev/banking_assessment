/**
 * Currency helpers. Money is stored and computed as integer cents; dollars
 * (floats) only exist at the API boundary for human-friendly I/O.
 */

const CENTS_PER_DOLLAR = 100;

/** Convert a dollar amount (e.g. 12.34) to integer cents (1234). */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * CENTS_PER_DOLLAR);
}

/** Convert integer cents (1234) back to a dollar number (12.34). */
export function centsToDollars(cents: number): number {
  return cents / CENTS_PER_DOLLAR;
}

/** True when a dollar value has no sub-cent precision (at most 2 decimals). */
export function hasValidCentPrecision(dollars: number): boolean {
  return Math.abs(dollars * CENTS_PER_DOLLAR - Math.round(dollars * CENTS_PER_DOLLAR)) < 1e-6;
}
