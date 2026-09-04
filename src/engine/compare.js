// Combines the buy-side and rent-side yearly series into the headline comparison:
// year-by-year net worth for each path, the breakeven year (if any), and a verdict.

/**
 * @param {Array<{year:number, netEquityIfSold:number}>} buySeries
 * @param {Array<{year:number, portfolioValue:number}>} rentSeries
 * @returns {Array<{year:number, buy:number, rent:number}>}
 */
export function buildComparisonSeries(buySeries, rentSeries) {
  return buySeries.map((b, i) => ({
    year: b.year,
    buy: b.netEquityIfSold,
    rent: rentSeries[i].portfolioValue,
  }));
}

/**
 * First year (>=1) where buy net worth reaches or exceeds rent net worth, given buying started
 * behind at year 0 (the normal case, since selling costs make an immediate sale a loss).
 * Returns null if buying never catches up within the series, or 0 if buying was never behind.
 */
export function findBreakevenYear(series) {
  if (series.length === 0) return null;
  if (series[0].buy >= series[0].rent) return 0;
  for (let i = 1; i < series.length; i++) {
    if (series[i].buy >= series[i].rent) return series[i].year;
  }
  return null;
}

export function summarizeComparison(buyContext, rentContext) {
  const series = buildComparisonSeries(buyContext.yearlySeries, rentContext.yearlySeries);
  const breakevenYear = findBreakevenYear(series);
  const last = series[series.length - 1];
  const difference = last.buy - last.rent;
  const winner = difference > 0 ? "buy" : difference < 0 ? "rent" : "tie";

  return {
    series,
    breakevenYear,
    finalYear: last.year,
    finalBuyNetWorth: last.buy,
    finalRentNetWorth: last.rent,
    difference,
    winner,
  };
}
