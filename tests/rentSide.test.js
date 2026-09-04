import { describe, it, expect } from "vitest";
import { computeRentSide } from "../src/engine/rentSide.js";

function makeBuyContext({ downPayment, closingTotal, premium, ownerCost }) {
  return {
    downPayment,
    closing: { total: closingTotal },
    premium,
    monthlyOwnerCost: () => ownerCost,
  };
}

describe("computeRentSide", () => {
  it("zero-diff scenario: renter portfolio equals the lump sum compounded alone", () => {
    const buyContext = makeBuyContext({ downPayment: 50000, closingTotal: 5000, premium: 0, ownerCost: 2000 });
    const inputs = {
      monthlyRent: 2000,
      rentIncreasePct: 0,
      rentersInsuranceAnnual: 0,
      investmentReturnPct: 6,
      yearsToOwn: 5,
    };
    const result = computeRentSide(inputs, buyContext);
    const lumpSum = 55000;
    const monthlyRate = 0.06 / 12;
    const expected = lumpSum * Math.pow(1 + monthlyRate, 60);
    expect(result.finalYear.portfolioValue).toBeCloseTo(expected, 4);
    expect(result.totalContributed).toBeCloseTo(0, 6);
  });

  it("constant-diff scenario matches a manual future-value-of-an-annuity calculation", () => {
    const buyContext = makeBuyContext({ downPayment: 50000, closingTotal: 5000, premium: 0, ownerCost: 2500 });
    const inputs = {
      monthlyRent: 2000,
      rentIncreasePct: 0,
      rentersInsuranceAnnual: 0,
      investmentReturnPct: 6,
      yearsToOwn: 5,
    };
    const result = computeRentSide(inputs, buyContext);

    const lumpSum = 55000;
    const diff = 500;
    const r = 0.06 / 12;
    const M = 60;
    const expectedLump = lumpSum * Math.pow(1 + r, M);
    const expectedAnnuity = diff * ((Math.pow(1 + r, M) - 1) / r);
    const expected = expectedLump + expectedAnnuity;

    expect(result.finalYear.portfolioValue).toBeCloseTo(expected, 2);
    expect(result.totalContributed).toBeCloseTo(diff * M, 6);
  });

  it("never invests a monthly diff when renting costs more than owning that month", () => {
    const buyContext = makeBuyContext({ downPayment: 10000, closingTotal: 1000, premium: 0, ownerCost: 1000 });
    const inputs = {
      monthlyRent: 2000, // renting costs more than owning every month
      rentIncreasePct: 0,
      rentersInsuranceAnnual: 0,
      investmentReturnPct: 5,
      yearsToOwn: 2,
    };
    const result = computeRentSide(inputs, buyContext);
    expect(result.totalContributed).toBe(0);
  });
});
