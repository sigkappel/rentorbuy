import { formatCurrency, formatSignedCurrency, formatPercent } from "./format.js";

function statCard(label, value, { emphasis = false, kind = null } = {}) {
  const card = document.createElement("div");
  const classes = ["stat-card"];
  if (emphasis) classes.push("stat-card--emphasis");
  if (kind) classes.push(`stat-card--${kind}`);
  card.className = classes.join(" ");
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
    statCard("Net worth if you buy", formatCurrency(comparison.finalBuyNetWorth), { emphasis: true, kind: "buy" }),
    statCard("Net worth if you rent + invest", formatCurrency(comparison.finalRentNetWorth), {
      emphasis: true,
      kind: "rent",
    }),
    statCard("Monthly mortgage payment (P&I)", formatCurrency(buyContext.monthlyPI, { precise: true }), {
      kind: "buy",
    }),
    ...(buyContext.suiteMonthlyRent > 0
      ? [
          statCard("Basement suite income ($/mo)", formatCurrency(buyContext.suiteMonthlyRent, { precise: true }), {
            kind: "buy",
          }),
          statCard(
            "Net owner carrying cost, yr 1 ($/mo)",
            formatCurrency(buyContext.grossMonthlyOwnerCostYear1 - buyContext.suiteMonthlyRent, { precise: true }),
            { kind: "buy" }
          ),
        ]
      : []),
    statCard("Down payment", formatCurrency(buyContext.downPayment), { kind: "buy" }),
    statCard("Total closing costs (excl. CMHC)", formatCurrency(buyContext.closing.total), { kind: "buy" }),
    statCard(
      "CMHC insurance premium",
      buyContext.premium > 0 ? formatCurrency(buyContext.premium) : "None (20%+ down)",
      { kind: "buy" }
    ),
    statCard("Cash needed to close", formatCurrency(buyContext.upfrontCash), { kind: "buy" }),
    statCard(`Remaining mortgage balance (yr ${years})`, formatCurrency(buyContext.finalYear.remainingBalance), {
      kind: "buy",
    }),
    statCard(`Total interest paid by yr ${years}`, formatCurrency(buyContext.totalInterestPaid), { kind: "buy" }),
    statCard(`Home value (yr ${years})`, formatCurrency(buyContext.finalYear.homeValue), { kind: "buy" }),
    statCard(
      "Buy-side annualized return (IRR)",
      buyContext.irrAnnualPct != null ? formatPercent(buyContext.irrAnnualPct) : "n/a",
      { kind: "buy" }
    ),
    statCard("Renter's initial lump-sum investment", formatCurrency(rentContext.lumpSum), { kind: "rent" }),
    statCard("Renter's total amount invested", formatCurrency(rentContext.totalInvested), { kind: "rent" })
  );
}
