const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const currencyFormatterPrecise = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 2,
});

export function formatCurrency(value, { precise = false } = {}) {
  if (!Number.isFinite(value)) return "—";
  return (precise ? currencyFormatterPrecise : currencyFormatter).format(value);
}

export function formatSignedCurrency(value) {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

export function formatPercent(value, digits = 1) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}
