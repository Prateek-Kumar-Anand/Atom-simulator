import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Arrow, Slider, pathD } from "../math/MathPlot";
import EquationInput, { useFormula } from "../math/EquationInput";
import { complexDerivative } from "../../math/expr";
import * as Cx from "../../math/complex";
import { useApp } from "../../context/AppContext";

const WIN = { square: 6, cube: 8, inverse: 3, exp: 6, sin: 4, joukowski: 4, mobius: 3 };
const ZR = 3;
const LINES = [-2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5];

function gridLines(f, lim) {
  const out = [];
  const n = 160;
  const img = (z) => {
    const w = f(z);
    return Number.isFinite(w[0]) && Number.isFinite(w[1]) && Math.abs(w[0]) < lim * 1.6 && Math.abs(w[1]) < lim * 1.6 ? w : null;
  };
  LINES.forEach((c) => {
    out.push({ kind: "v", c, pts: Array.from({ length: n + 1 }, (_, i) => img([c, -ZR + (2 * ZR * i) / n])) });
    out.push({ kind: "h", c, pts: Array.from({ length: n + 1 }, (_, i) => img([-ZR + (2 * ZR * i) / n, c])) });
  });
  return out;
}

export default function MappingLab() {
  const { log } = useApp();
  const [key, setKey] = useState("square");
  const [z0, setZ0] = useState([0.9, 0.6]);
  const [custom, setCustom] = useState("z^2 + 0.5z");
  const [customWin, setCustomWin] = useState(4);
  const formula = useFormula(custom, "complex");
  const isCustom = key === "custom";
  const map = useMemo(() => {
    if (!isCustom) return Cx.MAPPINGS.find((m) => m.key === key) || Cx.MAPPINGS[0];
    const f = formula.f || ((z) => z);
    return { key: "custom", label: `w = ${custom}`, f, df: (z) => complexDerivative(f, z), note: "Your own formula — f′(z) is computed numerically, so the conformal check works for any analytic expression." };
  }, [isCustom, key, custom, formula.f]);
  const lim = isCustom ? customWin : WIN[key];
  const lines = useMemo(() => gridLines(map.f, lim), [map, lim]);
  const domainLines = useMemo(() => LINES.flatMap((c) => [
    { kind: "v", c, pts: [[c, -ZR], [c, ZR]] }, { kind: "h", c, pts: [[-ZR, c], [ZR, c]] },
  ]), []);

  const w0 = map.f(z0), d0 = map.df(z0);
  const mag = Cx.abs(d0);
  const rot = (Cx.arg(d0) * 180) / Math.PI;
  const conformal = Number.isFinite(mag) && mag > 1e-6;
  const colour = (k) => (k === "v" ? PLOT.teal : PLOT.amber);
  const e1 = [0.4, 0], e2 = [0, 0.4];
  const de1 = Cx.mul(d0, e1), de2 = Cx.mul(d0, e2);
  const len = Math.max(Cx.abs(de1), 1e-9);
  const k = Math.min(1, (lim * 0.2) / len); // keep image arrows a readable size

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> An analytic map w = f(z) sends the left grid to the right one. Where f′(z) ≠ 0 it is <em>conformal</em>: it
          rotates by arg f′ and scales by |f′|, so grid lines still cross at right angles. Drag the point in the z-plane.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div className="qp-card" style={{ flex: "1 1 300px" }}>
            <h4>z-plane</h4>
            <MathPlot
              xr={[-ZR, ZR]} yr={[-ZR, ZR]} square width={420} xLabel="Re z" yLabel="Im z" label="Domain plane"
              onPointer={(t, p) => { if (t !== "up") setZ0([Number(Math.max(-ZR, Math.min(ZR, p.x)).toFixed(2)), Number(Math.max(-ZR, Math.min(ZR, p.y)).toFixed(2))]); }}
            >
              {({ X, Y }) => (
                <>
                  {domainLines.map((l, i) => <line key={i} x1={X(l.pts[0][0])} y1={Y(l.pts[0][1])} x2={X(l.pts[1][0])} y2={Y(l.pts[1][1])} stroke={colour(l.kind)} strokeOpacity={0.55} />)}
                  <Arrow x1={X(z0[0])} y1={Y(z0[1])} x2={X(z0[0] + e1[0])} y2={Y(z0[1] + e1[1])} color={PLOT.red} width={2.2} />
                  <Arrow x1={X(z0[0])} y1={Y(z0[1])} x2={X(z0[0] + e2[0])} y2={Y(z0[1] + e2[1])} color={PLOT.violet} width={2.2} />
                  <circle cx={X(z0[0])} cy={Y(z0[1])} r={5.5} fill="#fff" stroke={PLOT.ink} strokeWidth={2} style={{ cursor: "grab" }} />
                </>
              )}
            </MathPlot>
          </div>
          <div className="qp-card" style={{ flex: "1 1 300px" }}>
            <h4>w-plane  ({isCustom ? "custom" : map.label})</h4>
            <MathPlot xr={[-lim, lim]} yr={[-lim, lim]} square width={420} xLabel="Re w" yLabel="Im w" label="Image plane">
              {({ X, Y }) => (
                <>
                  {lines.map((l, i) => <path key={i} d={pathD(l.pts, X, Y)} fill="none" stroke={colour(l.kind)} strokeOpacity={0.6} strokeWidth={1.2} />)}
                  {Number.isFinite(w0[0]) && Number.isFinite(w0[1]) && (
                    <>
                      <Arrow x1={X(w0[0])} y1={Y(w0[1])} x2={X(w0[0] + de1[0] * k)} y2={Y(w0[1] + de1[1] * k)} color={PLOT.red} width={2.2} />
                      <Arrow x1={X(w0[0])} y1={Y(w0[1])} x2={X(w0[0] + de2[0] * k)} y2={Y(w0[1] + de2[1] * k)} color={PLOT.violet} width={2.2} />
                      <circle cx={X(w0[0])} cy={Y(w0[1])} r={5.5} fill="#fff" stroke={PLOT.ink} strokeWidth={2} />
                    </>
                  )}
                </>
              )}
            </MathPlot>
          </div>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Mapping</h4>
          <select className="qp-select" value={key} onChange={(e) => setKey(e.target.value)} aria-label="Mapping">
            {Cx.MAPPINGS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            <option value="custom">✎ Custom formula…</option>
          </select>
          {isCustom && (
            <>
              <EquationInput
                label="Type your own map" prefix="w =" value={custom} onChange={setCustom} error={formula.error}
                hint="Use z, i, pi, e, + − * / ^, sin cos tan exp log sqrt sinh cosh conj abs … e.g. 2z(z+1)"
                examples={["z^2 + 0.5z", "z + 1/z", "exp(z) - z", "sin(z)/z", "(z-1)/(z+1)", "z^3 - 3z", "sqrt(z)", "log(z)"]}
              />
              <Slider label="w-plane half-width" value={customWin} min={1} max={20} step={0.5} onChange={setCustomWin} format={(v) => v.toFixed(1)} />
            </>
          )}
          <p className="qp-muted small" style={{ margin: 0 }}>{map.note}</p>
        </div>
        <div className="qp-card">
          <h4>Results at the chosen point</h4>
          <div className="qp-readout-grid" style={{ gridTemplateColumns: "1fr" }}>
            <Readout label="z₀" value={Cx.formatC(z0, 2)} />
            <Readout label="w₀ = f(z₀)" value={Cx.formatC(w0, 3)} accent="#c2740a" />
            <Readout label="f′(z₀)" value={Cx.formatC(d0, 3)} />
            <Readout label="Local scaling |f′|" value={Number.isFinite(mag) ? mag.toFixed(3) : "—"} accent="#0e8ea3" />
            <Readout label="Local rotation arg f′" value={Number.isFinite(rot) ? `${rot.toFixed(1)}°` : "—"} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            {conformal ? "Red and violet arrows (images of the horizontal and vertical directions) stay perpendicular — the map is conformal here." : "f′(z₀) ≈ 0: the map is not conformal at this point (angles are not preserved)."}
          </p>
          <button className="qp-btn" onClick={() => log("Complex Analysis: Conformal Mapping", `${map.label}, z₀=${Cx.formatC(z0, 2)}`, `w₀=${Cx.formatC(w0, 3)}, |f′|=${Number.isFinite(mag) ? mag.toFixed(3) : "—"}, rotation=${Number.isFinite(rot) ? rot.toFixed(1) : "—"}°`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
