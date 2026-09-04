// Generic monthly IRR solver via bisection on a plain cash-flow array.
// cashFlows[0] is the initial outlay (negative), subsequent entries are monthly flows.

function npv(rate, cashFlows) {
  return cashFlows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + rate, i), 0);
}

/**
 * Solves for the periodic (monthly) rate that makes NPV of cashFlows == 0.
 * Returns null if no sign change is found in the search range (no solution / degenerate input).
 * @returns {number|null} monthly rate as a decimal (e.g. 0.005 for 0.5%/month)
 */
export function monthlyIrr(cashFlows, { low = -0.5, high = 0.5, tolerance = 1e-9, maxIterations = 200 } = {}) {
  if (!cashFlows || cashFlows.length < 2) return null;

  let npvLow = npv(low, cashFlows);
  let npvHigh = npv(high, cashFlows);

  if (npvLow === 0) return low;
  if (npvHigh === 0) return high;
  if (Math.sign(npvLow) === Math.sign(npvHigh)) return null; // no sign change, bisection won't converge

  let lo = low;
  let hi = high;
  for (let i = 0; i < maxIterations; i++) {
    const mid = (lo + hi) / 2;
    const npvMid = npv(mid, cashFlows);
    if (Math.abs(npvMid) < tolerance) return mid;
    if (Math.sign(npvMid) === Math.sign(npv(lo, cashFlows))) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/** Converts a monthly rate to an annualized (compounded) rate, as a percent. */
export function annualizeMonthlyRate(monthlyRate) {
  if (monthlyRate == null) return null;
  return (Math.pow(1 + monthlyRate, 12) - 1) * 100;
}
