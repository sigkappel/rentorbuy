// Standard fixed-rate mortgage amortization math. Pure functions, no DOM access.
//
// Canadian fixed-rate mortgages are legally required to compound semi-annually (not monthly,
// as in the US) — see https://www.yorku.ca/amarshal/mortgage.htm and Canadian mortgage lender
// disclosures generally. The quoted nominal annual rate is converted to an effective monthly
// rate via r = (1 + annualRate/2)^(1/6) - 1 before applying the standard payment formula. This
// makes Canadian payments slightly lower than a naive annualRate/12 monthly-compounding
// calculation would produce (verified: $300,000/5%/25yr -> ~$1,744.81/mo, $500,000/5%/25yr ->
// ~$2,908.02/mo, both matching published Canadian mortgage calculator figures).

/** Converts a nominal annual rate (%) to the effective monthly rate under semi-annual compounding. */
export function monthlyRateFromAnnual(annualRatePct) {
  const i = annualRatePct / 100;
  return Math.pow(1 + i / 2, 1 / 6) - 1;
}

/**
 * Monthly principal + interest payment for a fixed-rate loan, using Canadian semi-annual
 * compounding convention.
 * @param {number} principal - loan amount
 * @param {number} annualRatePct - annual nominal interest rate, e.g. 5 for 5%
 * @param {number} amortYears - amortization period in years
 */
export function monthlyPayment(principal, annualRatePct, amortYears) {
  const n = Math.round(amortYears * 12);
  if (n <= 0) return 0;
  const r = monthlyRateFromAnnual(annualRatePct);
  if (r === 0) return principal / n;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

/**
 * Full month-by-month amortization schedule.
 * @returns {Array<{month: number, payment: number, interest: number, principal: number, balance: number}>}
 */
export function generateSchedule(principal, annualRatePct, amortYears) {
  const n = Math.round(amortYears * 12);
  const r = monthlyRateFromAnnual(annualRatePct);
  const payment = monthlyPayment(principal, annualRatePct, amortYears);
  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= n; month++) {
    const interest = balance * r;
    let principalPaid = payment - interest;
    // Guard against floating-point drift on the final payment.
    if (month === n || principalPaid > balance) {
      principalPaid = balance;
    }
    balance = Math.max(0, balance - principalPaid);
    schedule.push({
      month,
      payment: month === n ? principalPaid + interest : payment,
      interest,
      principal: principalPaid,
      balance,
    });
  }

  return schedule;
}

/**
 * Cumulative interest/principal paid and remaining balance as of a given month index
 * (0 = nothing paid yet). monthIndex is clamped to the schedule length.
 */
export function summaryAtMonth(schedule, monthIndex) {
  if (monthIndex <= 0) {
    return { cumulativeInterest: 0, cumulativePrincipal: 0, balance: schedule.length ? schedule[0].balance + schedule[0].principal : 0 };
  }
  const idx = Math.min(monthIndex, schedule.length) - 1;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  for (let i = 0; i <= idx; i++) {
    cumulativeInterest += schedule[i].interest;
    cumulativePrincipal += schedule[i].principal;
  }
  const balance = idx >= 0 ? schedule[idx].balance : 0;
  return { cumulativeInterest, cumulativePrincipal, balance };
}
