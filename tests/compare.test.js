import { describe, it, expect } from "vitest";
import { findBreakevenYear, buildComparisonSeries, summarizeComparison } from "../src/engine/compare.js";

describe("findBreakevenYear", () => {
  it("finds the first year buy crosses above rent", () => {
    const series = [
      { year: 0, buy: 50, rent: 100 },
      { year: 1, buy: 70, rent: 110 },
      { year: 2, buy: 120, rent: 115 },
      { year: 3, buy: 200, rent: 120 },
    ];
    expect(findBreakevenYear(series)).toBe(2);
  });

  it("returns null when buying never catches up", () => {
    const series = [
      { year: 0, buy: 10, rent: 100 },
      { year: 1, buy: 20, rent: 150 },
      { year: 2, buy: 30, rent: 200 },
    ];
    expect(findBreakevenYear(series)).toBeNull();
  });

  it("returns 0 when buying is never behind", () => {
    const series = [
      { year: 0, buy: 100, rent: 90 },
      { year: 1, buy: 110, rent: 95 },
    ];
    expect(findBreakevenYear(series)).toBe(0);
  });
});

describe("buildComparisonSeries / summarizeComparison", () => {
  it("combines series and reports the winner at the final year", () => {
    const buySeries = [
      { year: 0, netEquityIfSold: 10 },
      { year: 1, netEquityIfSold: 150 },
    ];
    const rentSeries = [
      { year: 0, portfolioValue: 100 },
      { year: 1, portfolioValue: 120 },
    ];
    const combined = buildComparisonSeries(buySeries, rentSeries);
    expect(combined).toEqual([
      { year: 0, buy: 10, rent: 100 },
      { year: 1, buy: 150, rent: 120 },
    ]);

    const summary = summarizeComparison(
      { yearlySeries: buySeries },
      { yearlySeries: rentSeries }
    );
    expect(summary.winner).toBe("buy");
    expect(summary.difference).toBeCloseTo(30, 6);
    expect(summary.breakevenYear).toBe(1);
  });
});
