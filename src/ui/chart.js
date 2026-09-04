// Hand-rolled inline SVG line chart: buy vs. rent net worth over time. No dependency —
// at most ~30 yearly points and 2 series, a library would be overkill here.

function formatCompact(value) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1000)}k`;
  return `${sign}$${Math.round(abs)}`;
}

export function renderNetWorthChart(container, series, breakevenYear) {
  if (!series || series.length === 0) {
    container.replaceChildren();
    return;
  }

  const width = 640;
  const height = 320;
  const padding = { top: 16, right: 16, bottom: 28, left: 64 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const years = series.map((p) => p.year);
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const yearSpan = maxYear - minYear || 1;

  const values = series.flatMap((p) => [p.buy, p.rent]);
  const minV = Math.min(0, ...values);
  const maxV = Math.max(...values);
  const valueSpan = maxV - minV || 1;

  const xScale = (year) => padding.left + ((year - minYear) / yearSpan) * innerWidth;
  const yScale = (value) => padding.top + innerHeight - ((value - minV) / valueSpan) * innerHeight;

  const buyPoints = series.map((p) => `${xScale(p.year)},${yScale(p.buy)}`).join(" ");
  const rentPoints = series.map((p) => `${xScale(p.year)},${yScale(p.rent)}`).join(" ");

  const zeroY = yScale(0);
  const zeroLine =
    minV < 0
      ? `<line x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}" class="chart-zero-line" />`
      : "";

  const breakevenMarker =
    breakevenYear != null
      ? `<line x1="${xScale(breakevenYear)}" y1="${padding.top}" x2="${xScale(breakevenYear)}" y2="${padding.top + innerHeight}" class="chart-breakeven-line" />
         <text x="${xScale(breakevenYear)}" y="${padding.top - 4}" class="chart-breakeven-label" text-anchor="middle">Breakeven: yr ${breakevenYear}</text>`
      : "";

  const yTicks = [minV, minV + valueSpan / 2, maxV];
  const yTickLabels = yTicks
    .map(
      (v) =>
        `<text x="${padding.left - 8}" y="${yScale(v) + 4}" class="chart-axis-label" text-anchor="end">${formatCompact(v)}</text>`
    )
    .join("");

  const xTickYears = [minYear, Math.round((minYear + maxYear) / 2), maxYear];
  const xTickLabels = xTickYears
    .map(
      (y) =>
        `<text x="${xScale(y)}" y="${height - padding.bottom + 18}" class="chart-axis-label" text-anchor="middle">yr ${y}</text>`
    )
    .join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Net worth over time: buying vs. renting and investing" class="net-worth-svg">
      ${zeroLine}
      ${yTickLabels}
      ${xTickLabels}
      ${breakevenMarker}
      <polyline points="${rentPoints}" class="chart-line chart-line--rent" />
      <polyline points="${buyPoints}" class="chart-line chart-line--buy" />
    </svg>
    <div class="chart-legend">
      <span class="legend-item"><span class="legend-swatch legend-swatch--buy"></span>Buy (net equity if sold)</span>
      <span class="legend-item"><span class="legend-swatch legend-swatch--rent"></span>Rent + invest (portfolio)</span>
    </div>
  `;
}
