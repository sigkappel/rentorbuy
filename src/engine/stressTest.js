import { STRESS_TEST } from "./defaults.js";
import { monthlyPayment } from "./amortization.js";

/** Federal mortgage stress-test qualifying rate: max(contract rate + 2%, 5.25%). */
export function qualifyingRate(contractRatePct) {
  return Math.max(contractRatePct + STRESS_TEST.bufferPct, STRESS_TEST.floorPct);
}

/**
 * Informational only — does not feed into the buy/rent ROI math, just tells the user
 * what payment they'd need to qualify for at the stress-test rate.
 */
export function stressTestPayment(principal, contractRatePct, amortYears) {
  const qRate = qualifyingRate(contractRatePct);
  return monthlyPayment(principal, qRate, amortYears);
}
