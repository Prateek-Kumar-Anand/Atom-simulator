import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, pathD } from "../math/MathPlot";
import { EPS_DELTA, findDelta } from "../../math/realAnalysis";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const HALF_W = 1.5; // half-width of the viewing window around a
const HALF_H = 2.2;

export default function EpsilonDeltaLab() {
  const { log } = useApp();
  const [key, setKey] = useState("sq");
  const def = EPS_DELTA.find((d) => d.key === key) || EPS_DELTA[0];
  const [a, setA] = useState(def.a[2]);
  const [eps, setEps] = useState(0.5);

  const pick = (k) => {
    const d = EPS_DELTA.find((e) => e.key === k);
    setKey(k);
    setA(d.a[2]);
  };

  const L = def.limitAt(a);
  const { delta, resolved } = useMemo(() => findDelta(def.f, a, L, eps, HALF_W), [def, a, L, eps]);
  const curve = useMemo(() => {
    const n = 700;
    return Array.from({ length: n + 1 }, (_, i) => {
      const x = a - HALF_W + (2 * HALF_W * i) / n;
      const y = def.f(x);
      return Number.isFinite(y) && Math.abs(y - L) <= HALF_H * 1.6 ? [x, y] : null;
    });
  }, [def, a, L]);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> f is continuous at a when, for every ε &gt; 0, some δ &gt; 0 keeps |f(x) − L| &lt; ε whenever |x − a| &lt; δ.
          Pick ε (amber band) and the lab finds the largest δ (teal band) so that the graph inside it never leaves the band.
        </p>
        <div className="qp-card">
          <h4>Graph, ε-band and δ-band</h4>
          <MathPlot xr={[a - HALF_W, a + HALF_W]} yr={[L - HALF_H, L + HALF_H]} xLabel="x" yLabel="f(x)" label="Epsilon delta picture">
            {({ X, Y, W, H }) => (
              <>
                <rect x={0} width={W} y={Y(L + eps)} height={Y(L - eps) - Y(L + eps)} fill="rgba(194,116,10,0.14)" stroke="rgba(194,116,10,0.55)" />
                {resolved && <rect x={X(a - delta)} width={X(a + delta) - X(a - delta)} y={0} height={H} fill="rgba(14,142,163,0.14)" stroke="rgba(14,142,163,0.6)" strokeDasharray="4 3" />}
                <path d={pathD(curve, X, Y)} fill="none" stroke={PLOT.blue} strokeWidth={2.2} />
                <circle cx={X(a)} cy={Y(L)} r={5} fill="#fff" stroke={PLOT.red} strokeWidth={2} />
              </>
            )}
          </MathPlot>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Function</h4>
          <select className="qp-select" value={key} onChange={(e) => pick(e.target.value)} aria-label="Function">
            {EPS_DELTA.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
          </select>
          <Slider label="Point a" value={a} min={def.a[0]} max={def.a[1]} step={0.05} onChange={(v) => setA(Number(v.toFixed(3)))} format={(v) => v.toFixed(2)} />
          <Slider label="Tolerance ε" value={eps} min={0.02} max={1.5} step={0.02} onChange={setEps} format={(v) => v.toFixed(2)} />
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Limit L at a" value={fmt(L, 4)} accent="#c2740a" />
            <Readout label="Largest δ" value={resolved ? fmt(delta, 4) : "none"} accent="#0e8ea3" />
            <Readout label="δ / ε" value={resolved && eps ? fmt(delta / eps, 3) : "—"} />
            <Readout label="Continuous here?" value={resolved ? "yes" : "no — no δ works"} />
          </div>
          {!resolved && <p className="qp-muted small" style={{ margin: "0 0 10px" }}>The graph jumps (or oscillates) so close to a that no δ keeps it within ε of L.</p>}
          {key === "inv" && <p className="qp-muted small" style={{ margin: "0 0 10px" }}>Slide a toward 0.2: δ for the same ε keeps shrinking — continuity holds at every point, but δ cannot be chosen independent of a (not uniform).</p>}
          <button className="qp-btn" onClick={() => log("Real Analysis: ε–δ Continuity", `${def.label}, a=${a.toFixed(2)}, ε=${eps.toFixed(2)}`, resolved ? `δ=${fmt(delta, 4)}, L=${fmt(L, 4)}` : "no δ exists (discontinuity)")}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
