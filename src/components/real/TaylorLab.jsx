import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, Chips, pathD } from "../math/MathPlot";
import { TAYLOR, taylorPoly, lagrangeBound } from "../../math/realAnalysis";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const XR = [-4, 4], YR = [-4, 4];

export default function TaylorLab() {
  const { log } = useApp();
  const [key, setKey] = useState("sin");
  const [N, setN] = useState(5);
  const [x0, setX0] = useState(1);
  const def = TAYLOR.find((t) => t.key === key) || TAYLOR[0];

  const sample = (fn) => Array.from({ length: 401 }, (_, i) => {
    const x = XR[0] + ((XR[1] - XR[0]) * i) / 400;
    const y = fn(x);
    return Number.isFinite(y) && Math.abs(y) < 30 ? [x, y] : null;
  });
  const fCurve = useMemo(() => sample(def.f), [def]); // eslint-disable-line react-hooks/exhaustive-deps
  const tCurve = useMemo(() => sample((x) => taylorPoly(def, N, x)), [def, N]); // eslint-disable-line react-hooks/exhaustive-deps

  const fx = def.f(x0), tx = taylorPoly(def, N, x0);
  const err = Math.abs(fx - tx);
  const bound = lagrangeBound(def, N, x0);
  const inside = Math.abs(x0) < def.R;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> The Taylor polynomial Tₙ(x) = Σ f⁽ᵏ⁾(0)xᵏ/k! hugs f near 0. Inside the radius of convergence R it
          improves as the degree grows; outside it diverges — even though f itself is perfectly smooth there.
        </p>
        <div className="qp-card">
          <h4>f(x) and its Taylor polynomial of degree {N}</h4>
          <MathPlot xr={XR} yr={YR} xLabel="x" yLabel="y" label="Function and Taylor polynomial">
            {({ X, Y, W, H }) => (
              <>
                {Number.isFinite(def.R) && (
                  <>
                    <rect x={0} y={0} width={X(-def.R)} height={H} fill="rgba(220,59,84,0.07)" />
                    <rect x={X(def.R)} y={0} width={W - X(def.R)} height={H} fill="rgba(220,59,84,0.07)" />
                  </>
                )}
                <path d={pathD(fCurve, X, Y)} fill="none" stroke={PLOT.blue} strokeWidth={2.4} />
                <path d={pathD(tCurve, X, Y)} fill="none" stroke={PLOT.amber} strokeWidth={2.2} strokeDasharray="6 3" />
                {Number.isFinite(fx) && Math.abs(fx) < 30 && <circle cx={X(x0)} cy={Y(fx)} r={4.5} fill={PLOT.blue} stroke="#fff" strokeWidth={1.5} />}
                {Number.isFinite(tx) && Math.abs(tx) < 30 && <circle cx={X(x0)} cy={Y(tx)} r={4.5} fill={PLOT.amber} stroke="#fff" strokeWidth={1.5} />}
              </>
            )}
          </MathPlot>
          <p className="qp-muted small" style={{ margin: "8px 0 0" }}>
            <span style={{ color: PLOT.blue }}>●</span> f(x)&nbsp;&nbsp;<span style={{ color: PLOT.amber }}>●</span> Tₙ(x)
            {Number.isFinite(def.R) && " · pink = outside the radius of convergence"}
          </p>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Function</h4>
          <Chips options={TAYLOR.map((t) => ({ key: t.key, label: t.label }))} value={key} onChange={setKey} />
          <Slider label="Degree n" value={N} min={0} max={25} step={1} onChange={setN} />
          <Slider label="Evaluate at x" value={x0} min={-3.5} max={3.5} step={0.05} onChange={(v) => setX0(Number(v.toFixed(3)))} format={(v) => v.toFixed(2)} />
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="f(x)" value={fmt(fx, 6)} accent="#3b6fd8" />
            <Readout label="Tₙ(x)" value={fmt(tx, 6)} accent="#c2740a" />
            <Readout label="Actual error" value={fmt(err, 3)} />
            <Readout label="Lagrange bound" value={bound === null ? "—" : fmt(bound, 3)} />
            <Readout label="Radius R" value={Number.isFinite(def.R) ? def.R : "∞"} />
            <Readout label="x inside R?" value={inside ? "yes" : "no — series diverges"} />
          </div>
          <button className="qp-btn" onClick={() => log("Real Analysis: Taylor Series", `${def.label}, degree ${N}, x=${x0.toFixed(2)}`, `f=${fmt(fx, 6)}, Tₙ=${fmt(tx, 6)}, error=${fmt(err, 3)}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
