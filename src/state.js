import { computeBuySide } from "./engine/buySide.js";
import { computeRentSide } from "./engine/rentSide.js";
import { summarizeComparison } from "./engine/compare.js";
import { minDownPaymentPct, cmhcPremiumRate } from "./engine/cmhc.js";
import { landTitleRegistrationFee, mortgageRegistrationFee } from "./engine/closingCosts.js";
import { sellingCommission } from "./engine/sellingCommission.js";
import { readInputs } from "./ui/inputs.js";
import { renderResults } from "./ui/results.js";
import { renderNetWorthChart } from "./ui/chart.js";
import { renderDashboard } from "./ui/dashboard.js";
import { formatCurrency, formatPercent } from "./ui/format.js";

export function recalculateAndRender(form) {
  const inputs = readInputs(form);
  const buyContext = computeBuySide(inputs);
  const rentContext = computeRentSide(inputs, buyContext);
  const comparison = summarizeComparison(buyContext, rentContext);

  renderResults({ buyContext, rentContext, comparison, inputs });
  renderNetWorthChart(
    document.getElementById("chart-container"),
    comparison.series,
    comparison.breakevenYear
  );
  renderDashboard(document.getElementById("dashboard-container"), { inputs, buyContext, rentContext });
  renderComputedFormFields(inputs, buyContext);
  renderMinDownHint(inputs);
}

function renderComputedFormFields(inputs, buyContext) {
  document.getElementById("out-land-title-fee").textContent = formatCurrency(
    landTitleRegistrationFee(inputs.homePrice)
  );
  document.getElementById("out-mortgage-reg-fee").textContent = formatCurrency(
    mortgageRegistrationFee(buyContext.effectivePrincipal)
  );
  document.getElementById("out-cmhc-premium").textContent =
    buyContext.premium > 0 ? formatCurrency(buyContext.premium) : "$0";
  document.getElementById("out-cmhc-tier").textContent =
    buyContext.premium > 0 ? `(${formatPercent(cmhcPremiumRate(inputs.downPaymentPct) * 100)} tier)` : "";
  document.getElementById("out-selling-commission").textContent = formatCurrency(
    sellingCommission(buyContext.finalYear.homeValue, inputs.commissionOverridePct)
  );
}

function renderMinDownHint(inputs) {
  const minPct = minDownPaymentPct(inputs.homePrice);
  const hint = document.getElementById("min-down-hint");
  const isBelowMin = inputs.downPaymentPct < minPct - 0.01;
  hint.textContent = isBelowMin
    ? `Below the CMHC minimum for this price — minimum required down payment is ${formatPercent(minPct, 2)}.`
    : `Minimum required down payment at this price: ${formatPercent(minPct, 2)}.`;
  hint.classList.toggle("hint--warning", isBelowMin);
}
