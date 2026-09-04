import { formatCurrency, formatSignedCurrency, formatPercent } from "./format.js";

function statCard(label, value, { emphasis = false } = {}) {
  const card = document.createElement("div");
  card.className = emphasis ? "stat-card stat-card--emphasis" : "stat-card";
  const labelEl = document.createElement("span");
  labelEl.className = "stat-label";
  labelEl.textContent = label;
  const valueEl = document.createElement("strong");
  valueEl.className = "stat-value";
  valueEl.textContent = value;
  card.append(labelEl, valueEl);
  return card;
}

export function renderResults({ buyContext, rentContext, comparison, inputs }) {
  const headlineEl = document.getElementById("verdict-headline");
  const detailEl = document.getElementById("verdict-detail");
  const gridEl = document.getElementById("numbers-grid");
  const verdictCard = document.getElementById("verdict-card");

  const years = inputs.yearsToOwn;
  const absDiff = Math.abs(comparison.difference);

  if (comparison.winner === "buy") {
    headlineEl.textContent = `Buying wins by ${formatCurrency(absDiff)} after ${years} year${years === 1 ? "" : "s"}`;
  } else if (comparison.winner === "rent") {
    headlineEl.textContent = `Renting + investing wins by ${formatCurrency(absDiff)} after ${years} year${years === 1 ? "" : "s"}`;
  } else {
    headlineEl.textContent = `Buying and renting are about even after ${years} years`;
  }
  verdictCard.classList.toggle("verdict-card--buy", comparison.winner === "buy");
  verdictCard.classList.toggle("verdict-card--rent", comparison.winner === "rent");

  if (comparison.breakevenYear == null) {
    detailEl.textContent = "Buying does not catch up to renting + investing within the years you've entered.";
  } else if (comparison.breakevenYear === 0) {
    detailEl.textContent = "Buying is ahead of renting + investing from year 0.";
  } else {
    detailEl.textContent = `Buying's net worth overtakes renting + investing around year ${comparison.breakevenYear}.`;
  }

  gridEl.replaceChildren(
    statCard("Net worth if you buy", formatCurrency(comparison.finalBuyNetWorth), { emphasis: true }),
    statCard("Net worth if you rent + invest", formatCurrency(comparison.finalRentNetWorth), { emphasis: true }),
    statCard("Monthly mortgage payment (P&I)", formatCurrency(buyContext.monthlyPI, { precise: true })),
    statCard("Down payment", formatCurrency(buyContext.downPayment)),
    statCard("Total closing costs (excl. CMHC)", formatCurrency(buyContext.closing.total)),
    statCard(
      "CMHC insurance premium",
      buyContext.premium > 0 ? formatCurrency(buyContext.premium) : "None (20%+ down)"
    ),
    statCard("Cash needed to close", formatCurrency(buyContext.upfrontCash)),
    statCard(`Remaining mortgage balance (yr ${years})`, formatCurrency(buyContext.finalYear.remainingBalance)),
    statCard(`Total interest paid by yr ${years}`, formatCurrency(buyContext.totalInterestPaid)),
    statCard(`Home value (yr ${years})`, formatCurrency(buyContext.finalYear.homeValue)),
    statCard(
      "Buy-side annualized return (IRR)",
      buyContext.irrAnnualPct != null ? formatPercent(buyContext.irrAnnualPct) : "n/a"
    ),
    statCard("Renter's initial lump-sum investment", formatCurrency(rentContext.lumpSum)),
    statCard("Renter's total amount invested", formatCurrency(rentContext.totalInvested))
  );
}
