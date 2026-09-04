import { describe, it, expect } from "vitest";
import {
  minDownPaymentPct,
  isInsuranceEligible,
  cmhcPremiumRate,
  cmhcPremium,
} from "../src/engine/cmhc.js";

describe("minDownPaymentPct", () => {
  it("is 5% for prices at or under $500k", () => {
    expect(minDownPaymentPct(400000)).toBeCloseTo(5, 6);
    expect(minDownPaymentPct(500000)).toBeCloseTo(5, 6);
  });

  it("blends 5%/10% tiers above $500k", () => {
    // $600,000: 5% of 500,000 = 25,000; 10% of 100,000 = 10,000; total 35,000 / 600,000 = 5.833%
    expect(minDownPaymentPct(600000)).toBeCloseTo(5.8333, 3);
  });
});

describe("isInsuranceEligible", () => {
  it("is eligible under $1.5M and ineligible at or above it", () => {
    expect(isInsuranceEligible(1499999)).toBe(true);
    expect(isInsuranceEligible(1500000)).toBe(false);
  });
});

describe("cmhcPremiumRate tier boundaries", () => {
  it("applies the correct rate at each tier boundary", () => {
    expect(cmhcPremiumRate(5)).toBeCloseTo(0.04, 6);
    expect(cmhcPremiumRate(9.99)).toBeCloseTo(0.04, 6);
    expect(cmhcPremiumRate(10)).toBeCloseTo(0.031, 6);
    expect(cmhcPremiumRate(14.99)).toBeCloseTo(0.031, 6);
    expect(cmhcPremiumRate(15)).toBeCloseTo(0.028, 6);
    expect(cmhcPremiumRate(19.99)).toBeCloseTo(0.028, 6);
  });

  it("is 0 at 20% down or more", () => {
    expect(cmhcPremiumRate(20)).toBe(0);
    expect(cmhcPremiumRate(50)).toBe(0);
  });
});

describe("cmhcPremium", () => {
  it("computes premium dollars as loan amount times tier rate", () => {
    expect(cmhcPremium(450000, 10)).toBeCloseTo(450000 * 0.031, 4);
  });
});
