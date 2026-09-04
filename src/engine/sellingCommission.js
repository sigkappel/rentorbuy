import { SELLING_COMMISSION } from "./defaults.js";

/**
 * Alberta-convention realtor commission: 7% on the first $100,000 + 3% on the remainder,
 * plus 5% GST on the commission itself. Returns the total dollar cost.
 */
export function sellingCommission(salePrice, overridePct = null) {
  if (overridePct != null) {
    return salePrice * (overridePct / 100);
  }
  const tier1 = Math.min(salePrice, SELLING_COMMISSION.tier1Threshold) * SELLING_COMMISSION.tier1Rate;
  const tier2 = Math.max(salePrice - SELLING_COMMISSION.tier1Threshold, 0) * SELLING_COMMISSION.tier2Rate;
  const preTax = tier1 + tier2;
  return preTax * (1 + SELLING_COMMISSION.gstRate);
}

/** Effective commission rate as a fraction of sale price (useful for the chart/UI). */
export function sellingCommissionRate(salePrice, overridePct = null) {
  if (salePrice <= 0) return 0;
  return sellingCommission(salePrice, overridePct) / salePrice;
}
