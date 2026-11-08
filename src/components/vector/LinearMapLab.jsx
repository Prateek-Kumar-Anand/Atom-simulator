import React, { useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Arrow, Slider, Chips } from "../math/MathPlot";
import * as V from "../../math/vectorSpace";
import { formatC } from "../../math/complex";
import { useApp } from "../../context/AppContext";

const C45 = Math.SQRT1_2;
const PRESETS = [
  { key: "id", label: "Identity", m: [1, 0, 0, 1] },
  { key: "rot", label: "Rotation 45°", m: [C45, -C45, C45, C45] },
  { key: "shear", label: "Shear", m: [1, 1, 0, 1] },
  { key: "stretch", label: "Stretch", m: [2, 0, 0, 0.5] },
  { key: "sym", label: "Symmetric", m: [2, 1, 1, 2] },
  { key: "proj", label: "Projection (rank 1)", m: [1, 1, 1, 1].map((v) => v / 2) },
  { key: "refl", label: "Reflection", m: [1, 0, 0, -1] },
];
const R = 4;
const f2 = (v) => (Math.abs(v) < 5e-3 ? "0.00" : v.toFixed(2).replace("-", "−"));

export default function LinearMapLab() {
  const { log } = useApp();
  const [m, setM] = useState([2, 1, 1, 2]);
  const [x, setX] = useState([1, 0.4]);
  const [a, b, c, d] = m;
  const A = (v) => [a * v[0] + b * v[1], c * v[0] + d * v[1]];
  const det = a * d - b * c, tr = a + d;
  const eg = V.eig2(a, b, c, d);
  const rank = V.matrixRank2(a, b, c, d);
  const Ax = A(x);
  const ellipse = Array.from({ length: 97 }, (_, i) => { const t = (2 * Math.PI * i) / 96; return A([Math.cos(t), Math.sin(t)]); });
  const setEntry = (i) => (v) => setM(m.map((e, k) => (k === i ? v : e)));
  const presetKey = PRESETS.find((p) => p.m.every((e, i) => Math.abs(e - m[i]) < 1e-9))?.key;
  const evText = eg.type === "complex" ? `${formatC(eg.values[0], 2)} , ${formatC(eg.values[1], 2)}` : `${f2(eg.values[0][0])} , ${f2(eg.values[1][0])}`;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> A matrix A is a linear map. It sends the unit circle (grey) to an ellipse (teal) and the unit square to a parallelogram.
          Eigenvectors (amber lines) are the special directions A only stretches. Drag x (red) and compare it with Ax (orange).
        </p>
        <div className="qp-card">
          <h4>Action of A = [[{f2(a)}, {f2(b)}], [{f2(c)}, {f2(d)}]]</h4>
          <MathPlot xr={[-R, R]} yr={[-R, R]} square xLabel="x" yLabel="y" label="Linear map action" onPointer={(t, p) => { if (t !== "up") setX([Number(Math.max(-R, Math.min(R, p.x)).toFixed(2)), Number(Math.max(-R, Math.min(R, p.y)).toFixed(2))]); }}>
            {({ X, Y, sx }) => (
              <>
                {eg.type !== "complex" && eg.vectors.map((e, i) => (
                  <line key={i} x1={X(-30 * e[0])} y1={Y(-30 * e[1])} x2={X(30 * e[0])} y2={Y(30 * e[1])} stroke={PLOT.amber} strokeWidth={1.8} strokeDasharray="7 4" opacity={0.85} />
                ))}
                <circle cx={X(0)} cy={Y(0)} r={sx} fill="rgba(100,116,139,0.06)" stroke={PLOT.axis} strokeDasharray="3 4" />
                <polygon fill="rgba(139,79,216,0.07)" stroke="rgba(139,79,216,0.5)" points={[[0, 0], A([1, 0]), A([1, 1]), A([0, 1])].map((q) => `${X(q[0])},${Y(q[1])}`).join(" ")} />
                <polygon fill="rgba(14,142,163,0.10)" stroke={PLOT.teal} strokeWidth={2} points={ellipse.map((q) => `${X(q[0])},${Y(q[1])}`).join(" ")} />
                <Arrow x1={X(0)} y1={Y(0)} x2={X(a)} y2={Y(c)} color={PLOT.teal} width={2.4} />
                <Arrow x1={X(0)} y1={Y(0)} x2={X(b)} y2={Y(d)} color={PLOT.violet} width={2.4} />
                <Arrow x1={X(0)} y1={Y(0)} x2={X(x[0])} y2={Y(x[1])} color={PLOT.red} width={2.4} />
                <Arrow x1={X(0)} y1={Y(0)} x2={X(Ax[0])} y2={Y(Ax[1])} color="#e8892b" width={2.4} />
                <circle cx={X(x[0])} cy={Y(x[1])} r={6} fill={PLOT.red} stroke="#fff" strokeWidth={2} style={{ cursor: "grab" }} />
              </>
            )}
          </MathPlot>
          <p className="qp-muted small" style={{ margin: "8px 0 0" }}>
            <span style={{ color: PLOT.teal }}>●</span> A e₁ (first column)&nbsp; <span style={{ color: PLOT.violet }}>●</span> A e₂ (second column)&nbsp; <span style={{ color: PLOT.red }}>●</span> x&nbsp; <span style={{ color: "#e8892b" }}>●</span> Ax
          </p>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Matrix</h4>
          <Chips options={PRESETS} value={presetKey} onChange={(k) => setM(PRESETS.find((p) => p.key === k).m)} />
          {["a (row 1, col 1)", "b (row 1, col 2)", "c (row 2, col 1)", "d (row 2, col 2)"].map((name, i) => (
            <Slider key={name} label={name} value={Number(m[i].toFixed(3))} min={-3} max={3} step={0.05} onChange={setEntry(i)} format={(v) => v.toFixed(2)} />
          ))}
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Determinant" value={f2(det)} accent="#0e8ea3" />
            <Readout label="Trace" value={f2(tr)} />
            <Readout label="Rank" value={rank} />
            <Readout label="Area scale |det|" value={Math.abs(det).toFixed(3)} />
            <Readout label="Eigenvalues λ" value={evText} accent="#c2740a" />
            <Readout label="Eigenvectors" value={eg.type === "complex" ? "none real (rotation)" : eg.vectors.map((e) => `(${f2(e[0])}, ${f2(e[1])})`).join("  ")} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            {rank === 0 ? "Zero matrix: everything collapses to the origin." : rank === 1 ? "Rank 1: the plane collapses onto a line; the null space is the direction that maps to 0." : det < 0 ? "det < 0: orientation is reversed (a reflection component)." : eg.type === "complex" ? "Complex eigenvalues: no real direction is preserved — the map rotates (and scales)." : "det > 0: orientation preserved."}
          </p>
          <button className="qp-btn" onClick={() => log("Vector Spaces: Linear Map", `A=[[${f2(a)},${f2(b)}],[${f2(c)},${f2(d)}]]`, `det=${f2(det)}, trace=${f2(tr)}, rank=${rank}, λ=${evText}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
