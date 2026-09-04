import { monthlyPayment, generateSchedule, summaryAtMonth } from "./amortization.js";
import { cmhcPremium, cmhcPremiumRate, isInsuranceEligible } from "./cmhc.js";
import { totalClosingCosts } from "./closingCosts.js";
import { sellingCommission } from "./sellingCommission.js";
import { monthlyIrr, annualizeMonthlyRate } from "./irr.js";

/** Home value at a given year index (0 = purchase), compounding appreciation annually. */
export function homeValueAtYear(homePrice, appreciationPct, year) {
  return homePrice * Math.pow(1 + appreciationPct / 100, year);
}

/**
 * Precomputes everything needed to answer "what does this purchase cost, month by month
 * and year by year" for a given set of inputs. Returns a context object plus derived series.
 */
export function computeBuySide(inputs) {
  const {
    propertyType,
    homePrice,
    downPaymentPct,
    mortgageRatePct,
    amortizationYears,
    legalFees,
    homeInspection,
    appraisalFee,
    titleInsurance,
    propertyTaxPct,
    homeInsuranceAnnual,
    homeInsuranceAnnualCondo,
    condoFeeMonthly,
    maintenancePct,
    yearsToOwn,
    appreciationPct,
    commissionOverridePct,
  } = inputs;

  const downPayment = homePrice * (downPaymentPct / 100);
  const loanBeforePremium = Math.max(homePrice - downPayment, 0);

  const insuranceEligible = isInsuranceEligible(homePrice);
  const premiumRate = downPaymentPct < 20 && insuranceEligible ? cmhcPremiumRate(downPaymentPct) : 0;
  const premium = insuranceEligible ? cmhcPremium(loanBeforePremium, downPaymentPct) : 0;
  const effectivePrincipal = loanBeforePremium + premium;

  const closing = totalClosingCosts({
    homePrice,
    mortgageAmount: effectivePrincipal,
    legalFees,
    homeInspection,
    appraisalFee,
    titleInsurance,
  });

  const schedule = generateSchedule(effectivePrincipal, mortgageRatePct, amortizationYears);
  const monthlyPI = monthlyPayment(effectivePrincipal, mortgageRatePct, amortizationYears);

  const annualInsurance = propertyType === "condo" ? homeInsuranceAnnualCondo : homeInsuranceAnnual;
  const condoFee = propertyType === "condo" ? condoFeeMonthly : 0;

  const yearlyHomeValue = (year) => homeValueAtYear(homePrice, appreciationPct, year);
  const yearlyPropertyTax = (year) => yearlyHomeValue(year) * (propertyTaxPct / 100);
  const yearlyMaintenance = (year) => yearlyHomeValue(year) * (maintenancePct / 100);

  /** Total owner carrying cost for the given 1-indexed month (P&I + tax + insurance + maintenance + condo fee). */
  const monthlyOwnerCost = (monthIndex) => {
    if (monthIndex < 1 || monthIndex > schedule.length) return 0;
    const yearOfMonth = Math.floor((monthIndex - 1) / 12);
    const pi = schedule[monthIndex - 1].payment;
    return (
      pi +
      yearlyPropertyTax(yearOfMonth) / 12 +
      annualInsurance / 12 +
      yearlyMaintenance(yearOfMonth) / 12 +
      condoFee
    );
  };

  const upfrontCash = downPayment + closing.total;

  // Year-by-year series: home value, remaining balance, hypothetical net equity if sold that year,
  // and cumulative cash the buyer has put in to date (upfront + all carrying costs through that year).
  const yearlySeries = [];
  let cumulativeCash = upfrontCash;
  for (let year = 0; year <= yearsToOwn; year++) {
    if (year > 0) {
      for (let m = (year - 1) * 12 + 1; m <= year * 12; m++) {
        cumulativeCash += monthlyOwnerCost(m);
      }
    }
    const homeValue = yearlyHomeValue(year);
    const { balance } = summaryAtMonth(schedule, year * 12);
    const commission = sellingCommission(homeValue, commissionOverridePct);
    const netEquityIfSold = homeValue - commission - balance;
    yearlySeries.push({
      year,
      homeValue,
      remainingBalance: balance,
      sellingCommission: commission,
      netEquityIfSold,
      cumulativeCash,
    });
  }

  const finalYear = yearlySeries[yearlySeries.length - 1];

  // Buy-side IRR on the full monthly cash-flow stream over the holding period.
  const holdMonths = yearsToOwn * 12;
  const cashFlows = [-upfrontCash];
  for (let m = 1; m <= holdMonths; m++) {
    let flow = -monthlyOwnerCost(m);
    if (m === holdMonths) flow += finalYear.netEquityIfSold;
    cashFlows.push(flow);
  }
  const irrMonthly = holdMonths > 0 ? monthlyIrr(cashFlows) : null;
  const irrAnnualPct = annualizeMonthlyRate(irrMonthly);

  const { cumulativeInterest, cumulativePrincipal } = summaryAtMonth(schedule, holdMonths);

  return {
    downPayment,
    loanBeforePremium,
    premium,
    premiumRate,
    insuranceEligible,
    effectivePrincipal,
    closing,
    upfrontCash,
    schedule,
    monthlyPI,
    monthlyOwnerCost,
    yearlySeries,
    finalYear,
    totalInterestPaid: cumulativeInterest,
    totalPrincipalPaid: cumulativePrincipal,
    irrAnnualPct,
  };
}
