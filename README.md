# Rent vs. Buy — Calgary, Alberta

A single-page calculator comparing buying a home in Calgary against renting and investing
the difference, using Alberta-specific rules (no land transfer tax, CMHC insurance tiers,
AB title/mortgage registration fees, AB realtor commission convention, Canadian semi-annual
mortgage compounding, and the principal-residence capital gains exemption). Every input
recalculates the results instantly — no submit button, no backend.

## Development

```
npm install
npm run dev      # dev server with instant reload
npm run test     # runs the financial-engine test suite (Vitest)
npm run build    # static production build in dist/
```

## How it's calculated

See the "How this is calculated" section at the bottom of the app, or `src/engine/`:
each file there is a pure, independently unit-tested module (amortization, CMHC insurance,
Alberta closing costs, selling commission, mortgage stress test, IRR, and the buy-side /
rent-side / comparison orchestration).

All figures are estimates for planning purposes, not financial advice.
