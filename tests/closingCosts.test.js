import { describe, it, expect } from "vitest";
import { landTitleRegistrationFee, mortgageRegistrationFee } from "../src/engine/closingCosts.js";

describe("landTitleRegistrationFee", () => {
  it("matches the known example: $450,000 -> $500", () => {
    expect(landTitleRegistrationFee(450000)).toBe(500);
  });

  it("rounds up at exact $5,000 multiples", () => {
    // Exactly at a multiple: 500,000 / 5,000 = 100 increments exactly, no rounding needed
    expect(landTitleRegistrationFee(500000)).toBe(50 + 5 * 100);
  });

  it("rounds up just over a $5,000 multiple to the next increment", () => {
    // 500,001 must round up to 101 increments, not 100
    expect(landTitleRegistrationFee(500001)).toBe(50 + 5 * 101);
  });
});

describe("mortgageRegistrationFee", () => {
  it("matches the known example: $360,000 mortgage -> $410", () => {
    expect(mortgageRegistrationFee(360000)).toBe(410);
  });
});
