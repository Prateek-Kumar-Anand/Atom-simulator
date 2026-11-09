import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Arrow, Slider, Chips, pathD } from "../math/MathPlot";
import EquationInput, { useFormula } from "../math/EquationInput";
import { jacobian, eig2, flowTrajectory, classifyLinear } from "../../math/vectorSpace";
import { formatC } from "../../math/complex";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const PRESETS = [
  { key: "rot", label: "Rotation", P: "-y", Q: "x" },
  { key: "src", label: "Source", P: "x", Q: "y" },
  { key: "saddle", label: "Saddle", P: "x", Q: "-y" },
  { key: "spiral", label: "Stable spiral", P: "-x - y", Q: "x - y" },
  { key: "pend", label: "Pendulum", P: "y", Q: "-sin(x)" },
  { key: "vdp", label: "Van der Pol", P: "y", Q: "(1 - x^2)*y - x" },
  { key: "fold", label: "Fold map", P: "x^2 - y^2", Q: "2*x*y" },
];
const LINES = Array.from({ length: 13 }, (_, i) => -3 + i * 0.5);
const GRID = 14;
const f2 = (v) => (Number.isFinite(v) ? (Math.abs(v) < 5e-4 ? "0" : fmt(v, 3)) : "—");

export default function VectorMapLab() {
  const { log } = useApp();
  const [mode, setMode] = useState("field");
  const [pText, setPText] = useState("-y");
  const [qText, setQText] = useState("x");
  const [half, setHalf] = useState(3);
  const [outHalf, setOutHalf] = useState(6);
  const [p, setP] = useState([1.2, 0.6]);
  const Pf = useFormula(pText, "real", ["x", "y"]);
  const Qf = useFormula(qText, "real", ["x", "y"]);
  const P = Pf.f || (() => 0), Q = Qf.f || (() => 0);

  const applyPreset = (k) => { const pr = PRESETS.find((e) => e.key === k); setPText(pr.P); setQText(pr.Q); if (k === "fold") setMode("grid"); };
  const presetKey = PRESETS.find((e) => e.P === pText && e.Q === qText)?.key;

  const Fp = [P(p[0], p[1]), Q(p[0], p[1])];
  const J = jacobian(P, Q, p[0], p[1]);
  const tr = J[0][0] + J[1][1], det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
  const div = tr, curl = J[1][0] - J[0][1];
  const eg = eig2(J[0][0], J[0][1], J[1][0], J[1][1]);
  const evText = eg.type === "complex" ? `${formatC(eg.values[0], 2)} , ${formatC(eg.values[1], 2)}` : `${f2(eg.values[0][0])} , ${f2(eg.values[1][0])}`;
  const finite = Fp.every(Number.isFinite) && J.flat().every(Number.isFinite);
  const cell = (2 * half) / GRID;

  const arrows = useMemo(() => {
    const out = [];
    for (let j = 0; j < GRID; j++) for (let i = 0; i < GRID; i++) {
      const x = -half + (i + 0.5) * cell, y = -half + (j + 0.5) * cell;
      const u = P(x, y), v = Q(x, y), m = Math.hypot(u, v);
      if (Number.isFinite(m) && m > 1e-9) out.push({ x, y, ux: u / m, uy: v / m, m });
    }
    return out;
  }, [P, Q, half, cell]);
  const mMax = Math.max(...arrows.map((a) => a.m), 1e-9);
  const fwd = useMemo(() => flowTrajectory(P, Q, p[0], p[1], half, 0.04, 700, 1), [P, Q, p, half]);
  const bwd = useMemo(() => flowTrajectory(P, Q, p[0], p[1], half, 0.04, 700, -1), [P, Q, p, half]);

  const gridLines = useMemo(() => {
    const out = [];
    const n = 120;
    const ok = (w) => w && Number.isFinite(w[0]) && Number.isFinite(w[1]) && Math.abs(w[0]) < outHalf * 1.8 && Math.abs(w[1]) < outHalf * 1.8;
    const img = (x, y) => { const w = [P(x, y), Q(x, y)]; return ok(w) ? w : null; };
    LINES.forEach((c) => {
      if (Math.abs(c) > half) return;
      out.push({ kind: "v", pts: Array.from({ length: n + 1 }, (_, i) => img(c, -half + (2 * half * i) / n)) });
      out.push({ kind: "h", pts: Array.from({ length: n + 1 }, (_, i) => img(-half + (2 * half * i) / n, c)) });
    });
    return out;
  }, [P, Q, half, outHalf]);
  const colour = (k) => (k === "v" ? PLOT.teal : PLOT.amber);
  const clamp = (v) => Number(Math.max(-half, Math.min(half, v)).toFixed(2));
  const onPointer = (t, q) => { if (t !== "up") setP([clamp(q.x), clamp(q.y)]); };
  const e1 = [J[0][0], J[1][0]], e2 = [J[0][1], J[1][1]];
  const kk = Math.min(1, (outHalf * 0.22) / Math.max(Math.hypot(...e1), Math.hypot(...e2), 1e-9));
  const sense = !Number.isFinite(det) ? "—" : Math.abs(det) < 1e-4 ? "folds here (det ≈ 0)" : det > 0 ? "preserves orientation" : "reverses orientation";

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Type your own map F(x, y) = (P, Q). <strong>Field mode</strong> draws F as a vector field and follows the flow x′ = F(x) from the
          point you drag; <strong>grid mode</strong> shows how F bends the plane. The Jacobian at the probe tells you what F does locally.
        </p>
        {mode === "field" ? (
          <div className="qp-card">
            <h4>Vector field F = ({pText}, {qText})</h4>
            <MathPlot xr={[-half, half]} yr={[-half, half]} square xLabel="x" yLabel="y" label="Vector field and flow line" onPointer={onPointer}>
              {({ X, Y }) => (
                <>
                  {arrows.map((a, i) => (
                    <Arrow key={i} x1={X(a.x - a.ux * cell * 0.36)} y1={Y(a.y - a.uy * cell * 0.36)} x2={X(a.x + a.ux * cell * 0.36)} y2={Y(a.y + a.uy * cell * 0.36)} color="#1e293b" width={1.4} head={5} opacity={0.25 + 0.65 * Math.sqrt(a.m / mMax)} />
                  ))}
                  <path d={pathD(bwd, X, Y)} fill="none" stroke={PLOT.violet} strokeWidth={2.2} strokeDasharray="6 4" />
                  <path d={pathD(fwd, X, Y)} fill="none" stroke={PLOT.teal} strokeWidth={2.6} />
                  <circle cx={X(p[0])} cy={Y(p[1])} r={6} fill="#fff" stroke={PLOT.ink} strokeWidth={2.2} style={{ cursor: "grab" }} />
                </>
              )}
            </MathPlot>
            <p className="qp-muted small" style={{ margin: "8px 0 0" }}><span style={{ color: PLOT.teal }}>●</span> where the point flows next&nbsp; <span style={{ color: PLOT.violet }}>●</span> where it came from</p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div className="qp-card" style={{ flex: "1 1 300px" }}>
              <h4>Domain (x, y)</h4>
              <MathPlot xr={[-half, half]} yr={[-half, half]} square width={420} xLabel="x" yLabel="y" label="Domain grid" onPointer={onPointer}>
                {({ X, Y }) => (
                  <>
                    {LINES.filter((c) => Math.abs(c) <= half).flatMap((c) => [
                      <line key={"v" + c} x1={X(c)} x2={X(c)} y1={Y(-half)} y2={Y(half)} stroke={PLOT.teal} strokeOpacity={0.55} />,
                      <line key={"h" + c} x1={X(-half)} x2={X(half)} y1={Y(c)} y2={Y(c)} stroke={PLOT.amber} strokeOpacity={0.55} />,
                    ])}
                    <Arrow x1={X(p[0])} y1={Y(p[1])} x2={X(p[0] + cell)} y2={Y(p[1])} color={PLOT.red} width={2.2} />
                    <Arrow x1={X(p[0])} y1={Y(p[1])} x2={X(p[0])} y2={Y(p[1] + cell)} color={PLOT.violet} width={2.2} />
                    <circle cx={X(p[0])} cy={Y(p[1])} r={5.5} fill="#fff" stroke={PLOT.ink} strokeWidth={2} style={{ cursor: "grab" }} />
                  </>
                )}
              </MathPlot>
            </div>
            <div className="qp-card" style={{ flex: "1 1 300px" }}>
              <h4>Image (u, v) = F(x, y)</h4>
              <MathPlot xr={[-outHalf, outHalf]} yr={[-outHalf, outHalf]} square width={420} xLabel="u" yLabel="v" label="Image grid">
                {({ X, Y }) => (
                  <>
                    {gridLines.map((l, i) => <path key={i} d={pathD(l.pts, X, Y)} fill="none" stroke={colour(l.kind)} strokeOpacity={0.65} strokeWidth={1.2} />)}
                    {finite && Math.abs(Fp[0]) < outHalf * 1.8 && Math.abs(Fp[1]) < outHalf * 1.8 && (
                      <>
                        <Arrow x1={X(Fp[0])} y1={Y(Fp[1])} x2={X(Fp[0] + e1[0] * kk)} y2={Y(Fp[1] + e1[1] * kk)} color={PLOT.red} width={2.2} />
                        <Arrow x1={X(Fp[0])} y1={Y(Fp[1])} x2={X(Fp[0] + e2[0] * kk)} y2={Y(Fp[1] + e2[1] * kk)} color={PLOT.violet} width={2.2} />
                        <circle cx={X(Fp[0])} cy={Y(Fp[1])} r={5.5} fill="#fff" stroke={PLOT.ink} strokeWidth={2} />
                      </>
                    )}
                  </>
                )}
              </MathPlot>
            </div>
          </div>
        )}
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Your map</h4>
          <Chips options={[{ key: "field", label: "Vector field & flow" }, { key: "grid", label: "Grid map" }]} value={mode} onChange={setMode} />
          <Chips options={PRESETS} value={presetKey} onChange={applyPreset} />
          <EquationInput label="First component" prefix="P(x, y) =" value={pText} onChange={setPText} error={Pf.error} id="eq-P" hint="x, y, pi, e, + − * / ^, sin cos tan exp ln sqrt abs" />
          <EquationInput label="Second component" prefix="Q(x, y) =" value={qText} onChange={setQText} error={Qf.error} id="eq-Q" />
          <Slider label="Domain half-width" value={half} min={1} max={6} step={0.5} onChange={(v) => { setHalf(v); setP((q) => [Math.max(-v, Math.min(v, q[0])), Math.max(-v, Math.min(v, q[1]))]); }} format={(v) => v.toFixed(1)} />
          {mode === "grid" && <Slider label="Image half-width" value={outHalf} min={1} max={30} step={1} onChange={setOutHalf} />}
        </div>
        <div className="qp-card">
          <h4>At the probe ({p[0].toFixed(2)}, {p[1].toFixed(2)})</h4>
          <div className="qp-readout-grid">
            <Readout label="F = (P, Q)" value={`(${f2(Fp[0])}, ${f2(Fp[1])})`} accent="#0e8ea3" />
            <Readout label="|F|" value={f2(Math.hypot(...Fp))} />
            <Readout label="Divergence ∇·F" value={f2(div)} accent="#c2740a" />
            <Readout label="Curl (Qₓ − Pᵧ)" value={f2(curl)} accent="#8b4fd8" />
            <Readout label="det J (area scale)" value={f2(det)} />
            <Readout label="Eigenvalues of J" value={finite ? evText : "—"} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            {mode === "field"
              ? `Linearised flow near here: ${finite ? classifyLinear(tr, det) : "—"}. Positive divergence = fluid spreading out; non-zero curl = local rotation.`
              : `F ${sense}: it scales tiny areas by |det J| = ${f2(Math.abs(det))}. Red and violet arrows are the images of the x and y directions (the columns of J).`}
          </p>
          <button className="qp-btn" disabled={!finite} onClick={() => log("Vector Spaces: Custom Map", `F=(${pText}, ${qText}) at (${p[0].toFixed(2)}, ${p[1].toFixed(2)})`, `F=(${f2(Fp[0])}, ${f2(Fp[1])}), div=${f2(div)}, curl=${f2(curl)}, detJ=${f2(det)}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
