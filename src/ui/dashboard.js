import { qualifyingRate, stressTestPayment } from "../engine/stressTest.js";
import { premiumPstIfOtherProvince } from "../engine/cmhc.js";
import { formatCurrency, formatPercent } from "./format.js";

function item(title, body) {
  const el = document.createElement("div");
  el.className = "consideration-item";
  const h = document.createElement("h3");
  h.textContent = title;
  const p = document.createElement("p");
  p.innerHTML = body;
  el.append(h, p);
  return el;
}

export function renderDashboard(container, { inputs, buyContext, rentContext }) {
  const qRate = qualifyingRate(inputs.mortgageRatePct);
  const stressPayment = stressTestPayment(buyContext.effectivePrincipal, inputs.mortgageRatePct, inputs.amortizationYears);
  const pstSavings = buyContext.premium > 0 ? premiumPstIfOtherProvince(buyContext.premium) : 0;
  const leverageRatio = buyContext.downPayment > 0 ? inputs.homePrice / buyContext.downPayment : null;
  const sellingCostAtFinal = buyContext.finalYear.sellingCommission;
  const equityConsumedPct =
    buyContext.finalYear.homeValue > 0 ? (sellingCostAtFinal / buyContext.finalYear.homeValue) * 100 : 0;
  const shortHold = inputs.yearsToOwn < 4;

  const items = [
    item(
      "Mortgage stress test",
      `To qualify, lenders test you at <strong>${formatPercent(qRate)}</strong> (the higher of your rate + 2%, or 5.25%) — a payment of
       <strong>${formatCurrency(stressPayment, { precise: true })}</strong>/mo vs. your actual
       <strong>${formatCurrency(buyContext.monthlyPI, { precise: true })}</strong>/mo. This affects whether you can get the mortgage, not the return calculation above.`
    ),
    item(
      "No capital gains tax on your home",
      `Unlike the US, Canada exempts your principal residence from capital gains tax on sale — so unlike NYT-style US calculators, no tax is subtracted from the buy-side proceeds above.`
    ),
    item(
      "Alberta's CMHC advantage",
      buyContext.premium > 0
        ? `Your CMHC premium of <strong>${formatCurrency(buyContext.premium)}</strong> is charged with no provincial sales tax in Alberta. In Ontario, Quebec, Saskatchewan, or Manitoba, PST on this premium would add roughly <strong>${formatCurrency(pstSavings)}</strong> more.`
        : `Not applicable here — your down payment is 20% or more, so no CMHC insurance is required.`
    ),
    item(
      "Leverage cuts both ways",
      leverageRatio
        ? `Your down payment gives you <strong>${leverageRatio.toFixed(1)}×</strong> leverage on the home's value. At your ${formatPercent(inputs.appreciationPct)}/yr appreciation assumption, gains (and losses) on the full home price are amplified relative to your actual cash invested — this is why buying can outperform investing even at modest appreciation, but also why it's riskier if prices fall.`
        : `Enter a down payment to see your leverage ratio.`
    ),
    item(
      "Selling costs lock in short holds",
      `Realtor commission at year ${inputs.yearsToOwn} is estimated at <strong>${formatCurrency(sellingCostAtFinal)}</strong> (~${formatPercent(equityConsumedPct)} of the home's value).` +
        (shortHold
          ? ` Owning for under ~4 years is often costly once these transaction costs are included — consider whether renting makes more sense for a short stay.`
          : ``)
    ),
    item(
      "Liquidity & flexibility",
      `Home equity isn't spendable without selling (or borrowing against it) and involves time and transaction costs. An index-fund portfolio can typically be accessed within days. This isn't reflected as a dollar figure above, but matters if your plans could change.`
    ),
    item(
      "Maintenance & repair risk",
      `The ${formatPercent(inputs.maintenancePct)}/yr maintenance assumption is a long-run average. Any single year can be far higher (roof, furnace, major appliance) — renters generally aren't exposed to this risk.`
    ),
    item(
      "Payment stability",
      `A fixed-rate mortgage locks your P&I payment for the term; rent can rise annually (modeled here at ${formatPercent(inputs.rentIncreasePct)}/yr) and is subject to landlord decisions and local market conditions.`
    ),
    item(
      "Calgary rental market",
      `Vacancy rates and rent growth vary year to year — check current Calgary rental market data and adjust the rent increase assumption above rather than relying on a fixed figure here.`
    ),
  ];

  container.replaceChildren(...items);
}
