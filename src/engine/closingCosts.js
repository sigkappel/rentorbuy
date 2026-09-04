import { AB_REGISTRATION } from "./defaults.js";

/** Alberta Land Title Office transfer-of-land registration fee: $50 + $5 per $5,000 (rounded up). */
export function landTitleRegistrationFee(price) {
  if (price <= 0) return AB_REGISTRATION.baseFee;
  const increments = Math.ceil(price / AB_REGISTRATION.incrementSize);
  return AB_REGISTRATION.baseFee + increments * AB_REGISTRATION.perIncrement;
}

/** Alberta Land Title Office mortgage registration fee: same formula, applied to the mortgage amount. */
export function mortgageRegistrationFee(mortgageAmount) {
  if (mortgageAmount <= 0) return AB_REGISTRATION.baseFee;
  const increments = Math.ceil(mortgageAmount / AB_REGISTRATION.incrementSize);
  return AB_REGISTRATION.baseFee + increments * AB_REGISTRATION.perIncrement;
}

/**
 * Total upfront closing costs (excludes down payment itself, includes CMHC premium only if
 * the caller wants it counted here rather than financed into the mortgage — see buySide.js).
 */
export function totalClosingCosts({
  homePrice,
  mortgageAmount,
  legalFees,
  homeInspection,
  appraisalFee,
  titleInsurance,
}) {
  const landTitleFee = landTitleRegistrationFee(homePrice);
  const mortgageFee = mortgageRegistrationFee(mortgageAmount);
  return {
    landTitleFee,
    mortgageFee,
    legalFees,
    homeInspection,
    appraisalFee,
    titleInsurance,
    total:
      landTitleFee + mortgageFee + legalFees + homeInspection + appraisalFee + titleInsurance,
  };
}
