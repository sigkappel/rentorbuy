import { describe, it, expect } from "vitest";
import { monthlyPayment, generateSchedule, summaryAtMonth } from "../src/engine/amortization.js";

describe("monthlyPayment", () => {
  it("matches published Canadian (semi-annual compounding) mortgage figures", () => {
    // $300,000 / 5% / 25yr -> ~$1,744.81/mo; $500,000 / 5% / 25yr -> ~$2,908.02/mo
    // (both verified against published Canadian mortgage calculator figures, which use
    // legally-mandated semi-annual compounding rather than US-style monthly compounding)
    expect(monthlyPayment(300000, 5, 25)).toBeCloseTo(1744.81, 1);
    expect(monthlyPayment(500000, 5, 25)).toBeCloseTo(2908.02, 1);
  });

  it("handles a 0% interest rate as a plain division", () => {
    expect(monthlyPayment(120000, 0, 10)).toBeCloseTo(1000, 6);
  });

  it("returns 0 for a 0-year amortization", () => {
    expect(monthlyPayment(100000, 5, 0)).toBe(0);
  });
});

describe("generateSchedule", () => {
  it("pays off the loan to (approximately) zero by the final month", () => {
    const schedule = generateSchedule(300000, 5, 25);
    expect(schedule).toHaveLength(300);
    expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 6);
  });

  it("sums principal payments back to the original loan amount", () => {
    const principal = 300000;
    const schedule = generateSchedule(principal, 5, 25);
    const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);
    expect(totalPrincipal).toBeCloseTo(principal, 4);
  });
});

describe("summaryAtMonth", () => {
  it("returns zero paid-in and full balance at month 0", () => {
    const schedule = generateSchedule(300000, 5, 25);
    const summary = summaryAtMonth(schedule, 0);
    expect(summary.cumulativeInterest).toBe(0);
    expect(summary.cumulativePrincipal).toBe(0);
    expect(summary.balance).toBeCloseTo(300000, 4);
  });

  it("matches the schedule's own balance at an arbitrary month", () => {
    const schedule = generateSchedule(300000, 5, 25);
    const summary = summaryAtMonth(schedule, 84); // 7 years
    expect(summary.balance).toBeCloseTo(schedule[83].balance, 6);
  });
});
