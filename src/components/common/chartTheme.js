/**
 * Shared Recharts styling so every chart in the lab reads as one system on the
 * frosted-white theme: soft slate gridlines, muted axes, and a translucent
 * white tooltip card with a gentle shadow.
 */
export const CHART = {
  grid: "rgba(100,116,139,0.22)",
  axis: "#94a3b8",
  label: "#475569",
  tick: { fontSize: 10, fill: "#64748b" },
};

export const TOOLTIP_STYLE = {
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(148,163,184,0.45)",
  borderRadius: 10,
  fontSize: 12,
  color: "#1e293b",
  boxShadow: "0 10px 28px rgba(30,41,59,0.14)",
};

export const xAxisLabel = (value) => ({ value, position: "insideBottom", offset: -4, fill: CHART.label, fontSize: 10 });
export const yAxisLabel = (value) => ({ value, angle: -90, position: "insideLeft", fill: CHART.label, fontSize: 10 });
