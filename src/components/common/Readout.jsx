import React from "react";

export default function Readout({ label, value, accent }) {
  return (
    <div className="qp-readout">
      <span className="qp-readout-label">{label}</span>
      <span className="qp-readout-value" style={accent ? { color: accent } : undefined}>{value}</span>
    </div>
  );
}
