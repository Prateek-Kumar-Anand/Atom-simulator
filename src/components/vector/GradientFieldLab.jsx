import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Arrow, Slider } from "../math/MathPlot";
import { FIELDS, laplacian, norm } from "../../math/vectorSpace";
import { makeFieldPainter } from "./fieldPaint";
import EquationInput, { useFormula } from "../math/EquationInput";
import { makeCustomField } from "./customField";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const GRID = 11;

export default function GradientFieldLab() {
  const { log } = useApp();
  const [key, setKey] = useState("waves");
  const [custom, setCustom] = useState("sin(x) + cos(y) + 0.1*(x^2 + y^2)");
  const [half, setHalf] = useState(4);
  const formula = useFormula(custom, "real", ["x", "y"]);
  const isCustom = key === "custom";
  const field = useMemo(
    () => (isCustom ? makeCustomField(formula.f || (() => 0), custom, half) : FIELDS.find((f) => f.key === key) || FIELDS[0]),
    [isCustom, key, formula.f, custom, half]
  );
  const [x0d, x1d, y0d, y1d] = field.domain;
  const [p, setP] = useState([0.8, 0.6]);
  const [theta, setTheta] = useState(30);

  const painter = useMemo(() => makeFieldPainter(field), [field]);
  const pick = (k) => {
    const f = FIELDS.find((e) => e.key === k);
    setKey(k);
    setP(f ? [f.start[0] * 0.5, f.start[1] * 0.5] : [1, 0.7]);
  };

  const g = field.grad(p[0], p[1]);
  const gn = norm(g);
  const u = [Math.cos((theta * Math.PI) / 180), Math.sin((theta * Math.PI) / 180)];
  const Du = g[0] * u[0] + g[1] * u[1];
  const lap = laplacian(field.f, p[0], p[1], 1e-3);
  const harmonic = Math.abs(lap) < 1e-3;
  const cell = (x1d - x0d) / GRID;
  const clampP = (v, lo, hi) => Number(Math.max(lo, Math.min(hi, v)).toFixed(2));
  const arrows = useMemo(() => {
    const out = [];
    for (let j = 0; j < GRID; j++) for (let i = 0; i < GRID; i++) {
      const x = x0d + (i + 0.5) * cell, y = y0d + (j + 0.5) * ((y1d - y0d) / GRID);
      const gr = field.grad(x, y), m = norm(gr);
      if (m > 1e-9) out.push({ x, y, ux: gr[0] / m, uy: gr[1] / m, m });
    }
    return out;
  }, [field, x0d, y0d, y1d, cell]);
  const mMax = Math.max(...arrows.map((a) => a.m), 1e-9);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> The gradient ∇f points in the direction of steepest ascent and is perpendicular to the contour lines.
          Drag the probe; the directional derivative D<sub>u</sub>f = ∇f · u is largest (= |∇f|) when u points along ∇f and zero along a contour.
        </p>
        <div className="qp-card">
          <h4>f(x, y) — {field.label}</h4>
          <MathPlot
            xr={[x0d, x1d]} yr={[y0d, y1d]} square paint={painter} paintKey={`${key}|${isCustom ? custom + half : ""}`} paintRes={200} xLabel="x" yLabel="y" label="Scalar field with gradient arrows"
            onPointer={(t, q) => { if (t !== "up") setP([clampP(q.x, x0d, x1d), clampP(q.y, y0d, y1d)]); }}
          >
            {({ X, Y }) => {
              const L = cell * 0.42;
              return (
                <>
                  {arrows.map((a, i) => (
                    <Arrow key={i} x1={X(a.x - a.ux * L * 0.5)} y1={Y(a.y - a.uy * L * 0.5)} x2={X(a.x + a.ux * L * 0.5)} y2={Y(a.y + a.uy * L * 0.5)} color="#1e293b" width={1.3} head={5} opacity={0.35 + 0.5 * Math.sqrt(a.m / mMax)} />
                  ))}
                  <Arrow x1={X(p[0])} y1={Y(p[1])} x2={X(p[0] + u[0] * cell * 1.1)} y2={Y(p[1] + u[1] * cell * 1.1)} color={PLOT.violet} width={3} head={10} />
                  {gn > 1e-9 && <Arrow x1={X(p[0])} y1={Y(p[1])} x2={X(p[0] + (g[0] / gn) * cell * 1.4)} y2={Y(p[1] + (g[1] / gn) * cell * 1.4)} color={PLOT.red} width={3.2} head={11} />}
                  <circle cx={X(p[0])} cy={Y(p[1])} r={6} fill="#fff" stroke={PLOT.ink} strokeWidth={2.2} style={{ cursor: "grab" }} />
                </>
              );
            }}
          </MathPlot>
          <p className="qp-muted small" style={{ margin: "8px 0 0" }}>
            <span style={{ color: PLOT.red }}>●</span> ∇f (direction only)&nbsp; <span style={{ color: PLOT.violet }}>●</span> chosen direction u&nbsp; · dark bands = contour lines, deeper colour = larger f
          </p>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Field</h4>
          <select className="qp-select" value={key} onChange={(e) => pick(e.target.value)} aria-label="Scalar field">
            {FIELDS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            <option value="custom">✎ Custom formula…</option>
          </select>
          {isCustom && (
            <>
              <EquationInput
                label="Type your own scalar field" prefix="f(x, y) =" value={custom} onChange={setCustom} error={formula.error}
                hint="Use x, y, pi, e, + − * / ^, sin cos tan exp ln sqrt abs … e.g. x^2*y - y^3"
                examples={["sin(x) + cos(y) + 0.1*(x^2 + y^2)", "x^2 - y^2", "x*y*exp(-(x^2+y^2)/4)", "x^4 + y^4 - 4*x*y + 1", "sin(x*y)", "1/(1 + x^2 + y^2)"]}
              />
              <Slider label="Window half-width" value={half} min={1} max={12} step={0.5} onChange={(v) => { setHalf(v); setP((q) => [Math.max(-v, Math.min(v, q[0])), Math.max(-v, Math.min(v, q[1]))]); }} format={(v) => v.toFixed(1)} />
            </>
          )}
          <Slider label="Direction u (angle)" value={theta} min={0} max={360} step={1} onChange={setTheta} format={(v) => `${v}°`} />
          <p className="qp-muted small" style={{ margin: 0 }}>{field.note}</p>
        </div>
        <div className="qp-card">
          <h4>At the probe ({p[0].toFixed(2)}, {p[1].toFixed(2)})</h4>
          <div className="qp-readout-grid">
            <Readout label="f" value={fmt(field.f(p[0], p[1]), 4)} accent="#0e8ea3" />
            <Readout label="|∇f|" value={fmt(gn, 4)} accent="#dc3b54" />
            <Readout label="∇f = (fₓ, fᵧ)" value={`(${fmt(g[0], 3)}, ${fmt(g[1], 3)})`} />
            <Readout label="Dᵤf = ∇f · u" value={fmt(Du, 4)} accent="#8b4fd8" />
            <Readout label="Laplacian ∇²f" value={fmt(Math.abs(lap) < 1e-3 ? 0 : lap, 3)} />
            <Readout label="Harmonic here?" value={harmonic ? "yes (∇²f = 0)" : "no"} />
          </div>
          <button className="qp-btn" onClick={() => log("Vector Spaces: Gradient Field", `${field.label} at (${p[0].toFixed(2)}, ${p[1].toFixed(2)}), u at ${theta}°`, `f=${fmt(field.f(p[0], p[1]), 4)}, |∇f|=${fmt(gn, 4)}, Duf=${fmt(Du, 4)}, ∇²f=${fmt(Math.abs(lap) < 1e-3 ? 0 : lap, 3)}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
