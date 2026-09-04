import { describe, it, expect } from "vitest";
import { monthlyIrr, annualizeMonthlyRate } from "../src/engine/irr.js";

describe("monthlyIrr", () => {
  it("solves an analytically known 2-period case: -100 then +121 -> 10% period rate", () => {
    const rate = monthlyIrr([-100, 0, 121]);
    expect(rate).toBeCloseTo(0.1, 6);
  });

  it("solves a simple single-period case: -100 then +110 -> 10%", () => {
    const rate = monthlyIrr([-100, 110]);
    expect(rate).toBeCloseTo(0.1, 6);
  });

  it("returns null when there is no sign change (degenerate input)", () => {
    expect(monthlyIrr([100, 110])).toBeNull();
  });
});

describe("annualizeMonthlyRate", () => {
  it("compounds a monthly rate to an annual percent", () => {
    // 1%/month compounded 12x = (1.01^12 - 1) * 100 ≈ 12.6825%
    expect(annualizeMonthlyRate(0.01)).toBeCloseTo(12.6825, 3);
  });
});
