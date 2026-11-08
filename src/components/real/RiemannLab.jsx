import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, Chips, pathD } from "../math/MathPlot";
import { INTEGRANDS, RULES, riemann } from "../../math/realAnalysis";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

export default function RiemannLab() {
  const { log } = useApp();
  const [key, setKey] = useState("sq");
  const [rule, setRule] = useState("mid");
  const [n, setN] = useState(8);
  const g = INTEGRANDS.find((d) => d.key === key) || INTEGRANDS[0];
  const [a, b] = g.range;

  const exact = g.F(b) - g.F(a);
  const res = useMemo(() => riemann(g.f, a, b, n, rule), [g, a, b, n, rule]);
  const lower = useMemo(() => riemann(g.f, a, b, n, "lower").sum, [g, a, b, n]);
  const upper = useMemo(() => riemann(g.f, a, b, n, "upper").sum, [g, a, b, n]);
  const curve = useMemo(() => Array.from({ length: 301 }, (_, i) => { const x = a + ((b - a) * i) / 300; return [x, g.f(x)]; }), [g, a, b]);

  const ys = curve.map((p) => p[1]).concat(res.bars.flatMap((r) => [r.h0, r.h1]), [0]);
  const lo = Math.min(...ys), hi = Math.max(...ys);
  const pad = (hi - lo || 1) * 0.12;
  const err = res.sum - exact;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> The Riemann integral is the common limit of lower and upper (Darboux) sums as the partition refines.
          Increase n and watch U − L shrink to zero — that is exactly the criterion for integrability.
        </p>
        <div className="qp-card">
          <h4>Partition into {n} pieces — {RULES.find((r) => r.key === rule).label} sum</h4>
          <MathPlot xr={[a - (b - a) * 0.04, b + (b - a) * 0.04]} yr={[lo - pad, hi + pad]} xLabel="x" yLabel="f(x)" label="Riemann sum rectangles">
            {({ X, Y }) => (
              <>
                {res.bars.map((r, i) => (
                  <polygon
                    key={i} fill="rgba(14,142,163,0.22)" stroke="rgba(14,142,163,0.65)" strokeWidth={n > 60 ? 0.3 : 1}
                    points={`${X(r.x0)},${Y(0)} ${X(r.x0)},${Y(r.h0)} ${X(r.x1)},${Y(r.h1)} ${X(r.x1)},${Y(0)}`}
                  />
                ))}
                <path d={pathD(curve, X, Y)} fill="none" stroke={PLOT.blue} strokeWidth={2.2} />
              </>
            )}
          </MathPlot>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Setup</h4>
          <select className="qp-select" value={key} onChange={(e) => setKey(e.target.value)} aria-label="Integrand">
            {INTEGRANDS.map((d) => <option key={d.key} value={d.key}>{d.label} on [{fmt(d.range[0], 2)}, {fmt(d.range[1], 2)}]</option>)}
          </select>
          <Chips options={RULES} value={rule} onChange={setRule} />
          <Slider label="Pieces n" value={n} min={1} max={200} step={1} onChange={setN} />
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Sum" value={fmt(res.sum, 6)} accent="#0e8ea3" />
            <Readout label="Exact ∫ f dx" value={fmt(exact, 6)} accent="#c2740a" />
            <Readout label="Error" value={fmt(err, 3)} />
            <Readout label="Gap U − L" value={fmt(upper - lower, 4)} />
            <Readout label="Lower sum L" value={fmt(lower, 5)} />
            <Readout label="Upper sum U" value={fmt(upper, 5)} />
          </div>
          <button className="qp-btn" onClick={() => log("Real Analysis: Riemann Integral", `${g.label}, ${RULES.find((r) => r.key === rule).label}, n=${n}`, `sum=${fmt(res.sum, 6)}, exact=${fmt(exact, 6)}, U−L=${fmt(upper - lower, 4)}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
