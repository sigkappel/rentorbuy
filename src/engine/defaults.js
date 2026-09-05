// Single source of truth for default input values and Alberta/Calgary constants.
// Every value here is user-editable in the UI; these are just sane starting points.

export const DEFAULT_INPUTS = {
  // House & purchase
  propertyType: "house", // "house" | "condo"
  homePrice: 500000,
  downPaymentPct: 10, // linked $ <-> % in the UI; this is the source value

  // Financing
  mortgageRatePct: 5.0,
  amortizationYears: 25,
  legalFees: 1500,
  homeInspection: 500,
  appraisalFee: 300,
  titleInsurance: 0,

  // Ownership costs
  propertyTaxPct: 0.63, // % of appreciated home value, per year
  homeInsuranceAnnual: 2400, // house default; condo default is homeInsuranceAnnualCondo
  homeInsuranceAnnualCondo: 600,
  condoFeeMonthly: 400,
  maintenancePct: 1.5, // % of appreciated home value, per year
  suiteMonthlyRent: 0, // basement suite / mortgage helper income, offsets monthly carrying cost

  // Sale assumptions
  yearsToOwn: 7,
  appreciationPct: 4.5,
  commissionOverridePct: null, // null = use computed AB tiered commission

  // Rent & investment
  monthlyRent: 1800,
  rentIncreasePct: 3,
  rentersInsuranceAnnual: 300,
  investmentReturnPct: 7,
};

// --- Alberta / CMHC constants (2026) ---

export const CMHC = {
  maxInsurablePrice: 1_500_000,
  minDownPaymentTierPrice: 500_000,
  minDownPaymentPctLow: 5, // on the portion up to $500k
  minDownPaymentPctHigh: 10, // on the portion above $500k (up to $1.5M)
  premiumTiers: [
    { minDownPct: 5, maxDownPct: 10, rate: 0.04 },
    { minDownPct: 10, maxDownPct: 15, rate: 0.031 },
    { minDownPct: 15, maxDownPct: 20, rate: 0.028 },
  ],
  otherProvincePstRate: 0.08, // PST charged on the CMHC premium in ON/QC/SK/MB; AB charges none
};

export const AB_REGISTRATION = {
  baseFee: 50,
  perIncrement: 5,
  incrementSize: 5000,
};

export const STRESS_TEST = {
  bufferPct: 2,
  floorPct: 5.25,
};

export const SELLING_COMMISSION = {
  tier1Threshold: 100000,
  tier1Rate: 0.07,
  tier2Rate: 0.03,
  gstRate: 0.05,
};
