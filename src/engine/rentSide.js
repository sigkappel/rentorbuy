// Renter's side: invest what the buyer would have spent upfront, plus invest the monthly
// cash-flow savings whenever renting is cheaper than owning that month (the buy side already
// "pays for itself" via home equity, so this asymmetric treatment — never asking the renter to
// draw down savings when owning is cheaper — matches how NYT's and other reputable rent-vs-buy
// calculators are built; see README for the full rationale).

/**
 * @param {object} inputs - monthlyRent, rentIncreasePct, rentersInsuranceAnnual, investmentReturnPct, yearsToOwn
 * @param {object} buyContext - the object returned by computeBuySide(inputs)
 */
export function computeRentSide(inputs, buyContext) {
  const { monthlyRent, rentIncreasePct, rentersInsuranceAnnual, investmentReturnPct, yearsToOwn } = inputs;

  const monthlyRate = investmentReturnPct / 100 / 12;
  const lumpSum = buyContext.downPayment + buyContext.closing.total + buyContext.premium;
  const holdMonths = yearsToOwn * 12;

  const rentAtYear = (year) => monthlyRent * Math.pow(1 + rentIncreasePct / 100, year);
  const renterMonthlyCost = (monthIndex) => {
    const year = Math.floor((monthIndex - 1) / 12);
    return rentAtYear(year) + rentersInsuranceAnnual / 12;
  };

  const yearlySeries = [{ year: 0, portfolioValue: lumpSum, monthlyRent: rentAtYear(0) }];
  let balance = lumpSum;
  let totalContributed = 0;

  for (let m = 1; m <= holdMonths; m++) {
    balance *= 1 + monthlyRate;
    const diff = Math.max(0, buyContext.monthlyOwnerCost(m) - renterMonthlyCost(m));
    balance += diff;
    totalContributed += diff;

    if (m % 12 === 0) {
      const year = m / 12;
      yearlySeries.push({ year, portfolioValue: balance, monthlyRent: rentAtYear(year) });
    }
  }

  const finalYear = yearlySeries[yearlySeries.length - 1];
  const totalInvested = lumpSum + totalContributed;

  return { lumpSum, totalContributed, totalInvested, yearlySeries, finalYear };
}
