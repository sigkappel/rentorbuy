import "./styles.css";
import { DEFAULT_INPUTS } from "./engine/defaults.js";
import { populateForm, setupDerivedFieldSync } from "./ui/inputs.js";
import { recalculateAndRender } from "./state.js";

const form = document.getElementById("inputs-form");

populateForm(form, DEFAULT_INPUTS);

const recalc = () => recalculateAndRender(form);

// One delegated listener covers every plain input/select field; setupDerivedFieldSync wires
// the down-payment $/% pair and the property-type toggle separately since those also need to
// update other form fields before the recalculation runs.
form.addEventListener("input", recalc);
form.addEventListener("change", recalc);
setupDerivedFieldSync(form, recalc);

document.getElementById("methodology-body").innerHTML = `
  <p><strong>Buy side:</strong> standard Canadian mortgage math (semi-annually compounded, as required by law) gives your
  monthly payment and amortization schedule. Each year, home value grows by your appreciation assumption, and property
  tax/maintenance are calculated as a percent of that grown value. If you've entered a basement suite / mortgage helper
  rent, it's subtracted from your monthly carrying cost every month (flat, with no vacancy modeled) before that cost
  is used anywhere below. "Net worth if you buy" is what you'd walk away with if you sold that year: appreciated
  value, minus estimated realtor commission, minus your remaining mortgage balance.</p>
  <p><strong>Rent side:</strong> your down payment and all upfront buying costs (closing costs, plus any CMHC premium
  you would have paid) are invested immediately at your chosen rate of return. Then, every month, whichever of
  owning or renting costs less, the person paying less invests the difference at the same rate. When owning happens
  to be cheaper in a given month, the model does not ask the renter to withdraw savings to match it — that gap is
  simply treated as an ordinary living expense, the same way the buyer's monthly costs are. This "equal cash flow"
  approach is the same method used by the New York Times' rent-vs-buy calculator and most other reputable tools.</p>
  <p>Canadian principal residences are exempt from capital gains tax, so unlike US-based calculators, no tax is
  subtracted from the buy side's sale proceeds. All figures are estimates for planning purposes, not financial advice.</p>
`;

recalc();
