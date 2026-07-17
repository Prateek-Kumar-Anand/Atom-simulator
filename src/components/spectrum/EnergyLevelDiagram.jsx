import React from "react";

const LEVELS = [1, 2, 3, 4, 5, 6];
// Compress -13.6/n^2 onto a compact SVG-friendly vertical scale (0..~92).
const yFor = (n) => 92 - ((1 - 1 / (n * n)) / (1 - 1 / 36)) * 82;

export default function EnergyLevelDiagram({ ni, nf, color }) {
  return (
    <svg viewBox="0 0 300 110" className="qp-level-svg">
      {LEVELS.map((n) => (
        <g key={n}>
          <line x1="20" x2="280" y1={yFor(n)} y2={yFor(n)} className={"qp-level-line" + (n === ni || n === nf ? " active" : "")} />
          <text x="6" y={yFor(n) + 3} className="qp-level-text">{n}</text>
        </g>
      ))}
      <line x1="150" x2="150" y1={yFor(ni)} y2={yFor(nf)} stroke={color} strokeWidth="2" markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill={color} />
        </marker>
      </defs>
    </svg>
  );
}
