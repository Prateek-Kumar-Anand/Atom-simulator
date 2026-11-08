import React, { useRef, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Arrow, Slider } from "../math/MathPlot";
import * as V from "../../math/vectorSpace";
import { useApp } from "../../context/AppContext";

const R = 5;
const clampRound = (v) => Number(Math.max(-R, Math.min(R, v)).toFixed(2));
const f2 = (v) => (Math.abs(v) < 5e-3 ? "0.00" : v.toFixed(2).replace("-", "−"));
const vec = (v) => `(${f2(v[0])}, ${f2(v[1])})`;

export default function SpanBasisLab() {
  const { log } = useApp();
  const [v1, setV1] = useState([2, 0.5]);
  const [v2, setV2] = useState([-0.5, 1.5]);
  const [w, setW] = useState([2.5, 2]);
  const [ortho, setOrtho] = useState(false);
  const grab = useRef("w");

  const setters = { v1: setV1, v2: setV2, w: setW };
  const pts = { v1, v2, w };
  const d = V.det2(v1, v2);
  const coords = V.coordinates(v1, v2, w);
  const basis = V.gramSchmidt(v1, v2);
  const dim = basis.length;
  const angle = V.norm(v1) > 1e-9 && V.norm(v2) > 1e-9 ? (Math.acos(Math.max(-1, Math.min(1, V.dot(v1, v2) / (V.norm(v1) * V.norm(v2))))) * 180) / Math.PI : NaN;
  const dirLine = V.norm(v1) > 1e-9 ? v1 : v2;
  const inSpan = coords !== null || (dim === 1 && Math.abs(V.det2(dirLine, w)) < 1e-6) || (dim === 0 && V.norm(w) < 1e-9);

  const onPointer = (type, p) => {
    if (type === "down") {
      grab.current = Object.entries(pts).map(([k, v]) => [k, Math.hypot(p.x - v[0], p.y - v[1])]).sort((a, b) => a[1] - b[1])[0][0];
    }
    if (type !== "up") setters[grab.current]([clampRound(p.x), clampRound(p.y)]);
  };

  const lines = Array.from({ length: 21 }, (_, i) => i - 10);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Drag the tips of v₁ (teal), v₂ (violet) and w (red). If v₁, v₂ are linearly independent they form a basis of ℝ²
          and every w has unique coordinates (c₁, c₂). Make them parallel and the span collapses to a line.
        </p>
        <div className="qp-card">
          <h4>Basis grid and coordinates of w</h4>
          <MathPlot xr={[-R, R]} yr={[-R, R]} square xLabel="x" yLabel="y" onPointer={onPointer} label="Vector space basis plot">
            {({ X, Y }) => {
              const P = (z) => [X(z[0]), Y(z[1])];
              const tip = (z, color) => <circle cx={X(z[0])} cy={Y(z[1])} r={6} fill={color} stroke="#fff" strokeWidth={2} style={{ cursor: "grab" }} />;
              const lab = (z, t, color) => <text x={X(z[0]) + 9} y={Y(z[1]) - 9} fontSize={12} fontWeight={600} fill={color} stroke="rgba(255,255,255,0.85)" strokeWidth={3} paintOrder="stroke">{t}</text>;
              const seg = (a, b, k) => <line key={k} x1={X(a[0])} y1={Y(a[1])} x2={X(b[0])} y2={Y(b[1])} stroke="rgba(14,142,163,0.22)" />;
              return (
                <>
                  {dim === 2 && lines.flatMap((c) => [
                    seg([c * v1[0] - 30 * v2[0], c * v1[1] - 30 * v2[1]], [c * v1[0] + 30 * v2[0], c * v1[1] + 30 * v2[1]], "a" + c),
                    seg([c * v2[0] - 30 * v1[0], c * v2[1] - 30 * v1[1]], [c * v2[0] + 30 * v1[0], c * v2[1] + 30 * v1[1]], "b" + c),
                  ])}
                  {dim === 1 && <line x1={X(-30 * dirLine[0])} y1={Y(-30 * dirLine[1])} x2={X(30 * dirLine[0])} y2={Y(30 * dirLine[1])} stroke={PLOT.teal} strokeWidth={3} opacity={0.35} />}
                  {coords && (
                    <>
                      <polyline fill="none" stroke={PLOT.axis} strokeDasharray="4 4" points={[[0, 0], [coords[0] * v1[0], coords[0] * v1[1]], w, [coords[1] * v2[0], coords[1] * v2[1]], [0, 0]].map((q) => P(q).join(",")).join(" ")} />
                      <Arrow x1={X(0)} y1={Y(0)} x2={X(coords[0] * v1[0])} y2={Y(coords[0] * v1[1])} color={PLOT.teal} width={1.6} dashed opacity={0.8} />
                      <Arrow x1={X(0)} y1={Y(0)} x2={X(coords[1] * v2[0])} y2={Y(coords[1] * v2[1])} color={PLOT.violet} width={1.6} dashed opacity={0.8} />
                    </>
                  )}
                  {ortho && basis.map((e, i) => <Arrow key={i} x1={X(0)} y1={Y(0)} x2={X(e[0])} y2={Y(e[1])} color={PLOT.green} width={2.6} />)}
                  <Arrow x1={X(0)} y1={Y(0)} x2={X(v1[0])} y2={Y(v1[1])} color={PLOT.teal} width={2.8} />
                  <Arrow x1={X(0)} y1={Y(0)} x2={X(v2[0])} y2={Y(v2[1])} color={PLOT.violet} width={2.8} />
                  <Arrow x1={X(0)} y1={Y(0)} x2={X(w[0])} y2={Y(w[1])} color={PLOT.red} width={2.8} />
                  {tip(v1, PLOT.teal)}{lab(v1, "v₁", PLOT.teal)}
                  {tip(v2, PLOT.violet)}{lab(v2, "v₂", PLOT.violet)}
                  {tip(w, PLOT.red)}{lab(w, "w", PLOT.red)}
                </>
              );
            }}
          </MathPlot>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Vectors</h4>
          {[["v₁", v1, setV1], ["v₂", v2, setV2], ["w", w, setW]].map(([name, v, set]) => (
            <React.Fragment key={name}>
              <Slider label={`${name}ₓ`} value={v[0]} min={-R} max={R} step={0.05} onChange={(x) => set([x, v[1]])} format={(x) => x.toFixed(2)} />
              <Slider label={`${name}ᵧ`} value={v[1]} min={-R} max={R} step={0.05} onChange={(y) => set([v[0], y])} format={(y) => y.toFixed(2)} />
            </React.Fragment>
          ))}
          <button className={"qp-btn" + (ortho ? " qp-btn-primary" : "")} onClick={() => setOrtho((o) => !o)}>
            {ortho ? "Hide" : "Show"} Gram–Schmidt orthonormal basis (green)
          </button>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="det[v₁ v₂]" value={f2(d)} accent="#0e8ea3" />
            <Readout label="dim span{v₁, v₂}" value={dim} />
            <Readout label="Independent?" value={dim === 2 ? "yes — a basis" : "no — dependent"} />
            <Readout label="w in the span?" value={inSpan ? "yes" : "no"} />
            <Readout label="Coordinates (c₁, c₂)" value={coords ? vec(coords) : "—"} accent="#c2740a" />
            <Readout label="v₁ · v₂ , angle" value={Number.isFinite(angle) ? `${f2(V.dot(v1, v2))} , ${angle.toFixed(1)}°` : "—"} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            {coords ? `w = ${f2(coords[0])}·v₁ + ${f2(coords[1])}·v₂ — the unique way to write w in this basis.` : "With a zero determinant the vectors are collinear: they span only a line, so most w cannot be written as c₁v₁ + c₂v₂."}
          </p>
          <button className="qp-btn" onClick={() => log("Vector Spaces: Span & Basis", `v₁=${vec(v1)}, v₂=${vec(v2)}, w=${vec(w)}`, `det=${f2(d)}, ${coords ? `coordinates ${vec(coords)}` : "dependent (no unique coordinates)"}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
