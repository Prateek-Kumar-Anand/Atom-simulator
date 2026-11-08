import React from "react";

export default function Readout({ label, value, accent }) {
  return (
    <div className="qp-readout">
      <span className="qp-readout-label">{label}</span>
      <span className="qp-readout-value" style={accent ? { color: `color-mix(in srgb, ${accent} 70%, #0f172a)` } : undefined}>{value}</span>
    </div>
  );
}
