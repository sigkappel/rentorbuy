import { describe, it, expect } from "vitest";
import { computeBuySide } from "../src/engine/buySide.js";
import { DEFAULT_INPUTS } from "../src/engine/defaults.js";

describe("computeBuySide suite income (mortgage helper)", () => {
  it("does not change carrying cost when suiteMonthlyRent is 0", () => {
    const inputs = { ...DEFAULT_INPUTS, suiteMonthlyRent: 0 };
    const buyContext = computeBuySide(inputs);
    expect(buyContext.monthlyOwnerCost(1)).toBeCloseTo(buyContext.grossMonthlyOwnerCostYear1, 6);
  });

  it("subtracts suite income from every month's owner carrying cost", () => {
    const withoutSuite = computeBuySide({ ...DEFAULT_INPUTS, suiteMonthlyRent: 0 });
    const withSuite = computeBuySide({ ...DEFAULT_INPUTS, suiteMonthlyRent: 800 });

    expect(withSuite.monthlyOwnerCost(1)).toBeCloseTo(withoutSuite.monthlyOwnerCost(1) - 800, 6);
    expect(withSuite.monthlyOwnerCost(60)).toBeCloseTo(withoutSuite.monthlyOwnerCost(60) - 800, 6);
    expect(withSuite.suiteMonthlyRent).toBe(800);
  });

  it("allows suite income to exceed carrying cost, producing a negative (net income) month", () => {
    const buyContext = computeBuySide({ ...DEFAULT_INPUTS, suiteMonthlyRent: 100000 });
    expect(buyContext.monthlyOwnerCost(1)).toBeLessThan(0);
  });

  it("does not affect upfront cash to close", () => {
    const withoutSuite = computeBuySide({ ...DEFAULT_INPUTS, suiteMonthlyRent: 0 });
    const withSuite = computeBuySide({ ...DEFAULT_INPUTS, suiteMonthlyRent: 800 });
    expect(withSuite.upfrontCash).toBeCloseTo(withoutSuite.upfrontCash, 6);
  });
});
