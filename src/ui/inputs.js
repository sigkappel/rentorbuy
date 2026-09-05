// Reads/writes the form: populates defaults, keeps the down-payment $/% pair in sync,
// toggles condo-specific fields, and parses the form into a structured Inputs object.

const NUMERIC_FIELDS = [
  "homePrice",
  "downPaymentPct",
  "mortgageRatePct",
  "amortizationYears",
  "legalFees",
  "homeInspection",
  "appraisalFee",
  "titleInsurance",
  "propertyTaxPct",
  "homeInsuranceAnnual",
  "homeInsuranceAnnualCondo",
  "condoFeeMonthly",
  "maintenancePct",
  "suiteMonthlyRent",
  "yearsToOwn",
  "appreciationPct",
  "monthlyRent",
  "rentIncreasePct",
  "rentersInsuranceAnnual",
  "investmentReturnPct",
];

export function populateForm(form, values) {
  for (const key of NUMERIC_FIELDS) {
    const el = form.elements[key];
    if (el && values[key] != null) el.value = values[key];
  }
  form.elements.propertyType.value = values.propertyType;
  updateDownPaymentAmountField(form);
  updateConditionalFields(form);
}

function updateDownPaymentAmountField(form) {
  const homePrice = parseFloat(form.elements.homePrice.value) || 0;
  const pct = parseFloat(form.elements.downPaymentPct.value) || 0;
  form.elements.downPaymentAmount.value = Math.round((homePrice * pct) / 100);
}

function updateDownPaymentPctField(form) {
  const homePrice = parseFloat(form.elements.homePrice.value) || 0;
  const amount = parseFloat(form.elements.downPaymentAmount.value) || 0;
  const pct = homePrice > 0 ? (amount / homePrice) * 100 : 0;
  form.elements.downPaymentPct.value = Math.round(pct * 100) / 100;
}

function updateConditionalFields(form) {
  const isCondo = form.elements.propertyType.value === "condo";
  document.getElementById("field-home-insurance").hidden = isCondo;
  document.getElementById("field-condo-insurance").hidden = !isCondo;
  document.getElementById("field-condo-fee").hidden = !isCondo;
}

/**
 * Wires the derived-field behavior. Call once after populateForm. `onChange` fires after
 * any derived-field update so the caller can trigger a recalculation.
 */
export function setupDerivedFieldSync(form, onChange) {
  form.elements.downPaymentPct.addEventListener("input", () => {
    updateDownPaymentAmountField(form);
    onChange();
  });
  form.elements.downPaymentAmount.addEventListener("input", () => {
    updateDownPaymentPctField(form);
    onChange();
  });
  form.elements.homePrice.addEventListener("input", () => {
    updateDownPaymentAmountField(form);
    onChange();
  });
  form.elements.propertyType.addEventListener("change", () => {
    updateConditionalFields(form);
    onChange();
  });
}

/** Parses the current form state into a structured Inputs object for the engine. */
export function readInputs(form) {
  const inputs = { propertyType: form.elements.propertyType.value };
  for (const key of NUMERIC_FIELDS) {
    inputs[key] = parseFloat(form.elements[key].value) || 0;
  }
  const overrideRaw = form.elements.commissionOverridePct.value;
  inputs.commissionOverridePct = overrideRaw === "" ? null : parseFloat(overrideRaw);
  return inputs;
}
