import { describe, it, expect } from "vitest";
import { sellingCommission } from "../src/engine/sellingCommission.js";

describe("sellingCommission", () => {
  it("matches a manual calculation at $600,000", () => {
    // 7% of first 100k = 7,000; 3% of remaining 500k = 15,000; = 22,000 pre-tax; *1.05 GST = 23,100
    expect(sellingCommission(600000)).toBeCloseTo(23100, 2);
  });

  it("respects an override percent when provided", () => {
    expect(sellingCommission(500000, 4)).toBeCloseTo(20000, 6);
  });

  it("handles a sale price under the tier-1 threshold", () => {
    expect(sellingCommission(80000)).toBeCloseTo(80000 * 0.07 * 1.05, 4);
  });
});
