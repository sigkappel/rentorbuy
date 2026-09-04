import { CMHC } from "./defaults.js";

/** Minimum down payment required for a given purchase price, as a percent of price. */
export function minDownPaymentPct(price) {
  if (price <= CMHC.minDownPaymentTierPrice) {
    return CMHC.minDownPaymentPctLow;
  }
  const lowPortion = CMHC.minDownPaymentTierPrice * (CMHC.minDownPaymentPctLow / 100);
  const highPortion = (price - CMHC.minDownPaymentTierPrice) * (CMHC.minDownPaymentPctHigh / 100);
  return ((lowPortion + highPortion) / price) * 100;
}

/** Whether the purchase is eligible for CMHC-insured financing at all. */
export function isInsuranceEligible(price) {
  return price < CMHC.maxInsurablePrice;
}

/** CMHC premium rate (as a decimal, e.g. 0.04) for a given down payment percent. Returns 0 at >=20% down. */
export function cmhcPremiumRate(downPaymentPct) {
  if (downPaymentPct >= 20) return 0;
  const tier = CMHC.premiumTiers.find(
    (t) => downPaymentPct >= t.minDownPct && downPaymentPct < t.maxDownPct
  );
  // Below the minimum insurable down payment (shouldn't normally happen once UI enforces the minimum).
  if (!tier) return CMHC.premiumTiers[0].rate;
  return tier.rate;
}

/** Dollar CMHC premium, typically financed into (added to) the mortgage principal. */
export function cmhcPremium(loanAmount, downPaymentPct) {
  return loanAmount * cmhcPremiumRate(downPaymentPct);
}

/** What the premium would cost if PST applied (as in ON/QC/SK/MB), for the Alberta-advantage comparison. */
export function premiumPstIfOtherProvince(premiumAmount) {
  return premiumAmount * CMHC.otherProvincePstRate;
}
