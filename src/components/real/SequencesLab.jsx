import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider } from "../math/MathPlot";
import { SEQUENCES, findN } from "../../math/realAnalysis";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

export default function SequencesLab() {
  const { log } = useApp();
  const [key, setKey] = useState("inv");
  const [eps, setEps] = useState(0.1);
  const [shown, setShown] = useState(60);
  const [candidate, setCandidate] = useState(0);

  const seq = SEQUENCES.find((s) => s.key === key) || SEQUENCES[0];
  const diverges = seq.limit === null;
  const L = diverges ? candidate : seq.limit;
  const N = useMemo(() => findN(seq.a, L, eps), [seq, L, eps]);
  const pts = useMemo(() => Array.from({ length: shown }, (_, i) => [i + 1, seq.a(i + 1)]), [seq, shown]);

  const ys = pts.map((p) => p[1]).concat([L - eps, L + eps]);
  const lo = Math.min(...ys), hi = Math.max(...ys);
  const pad = (hi - lo || 1) * 0.12;
  const outside = pts.filter((p) => !(Math.abs(p[1] - L) < eps)).length;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> aₙ → L means: for every ε &gt; 0 there is an N such that |aₙ − L| &lt; ε for <em>all</em> n ≥ N.
          Shrink ε and watch the amber band tighten — the dashed line marks the N that works.
        </p>
        <div className="qp-card">
          <h4>Terms of the sequence and the ε-band around L</h4>
          <MathPlot xr={[0, shown + 1]} yr={[lo - pad, hi + pad]} xLabel="n" yLabel="aₙ" label="Sequence terms with epsilon band">
            {({ X, Y, W }) => (
              <>
                <rect x={0} width={W} y={Y(L + eps)} height={Math.max(1, Y(L - eps) - Y(L + eps))} fill="rgba(194,116,10,0.16)" stroke="rgba(194,116,10,0.5)" />
                <line x1={0} x2={W} y1={Y(L)} y2={Y(L)} stroke={PLOT.amber} strokeDasharray="5 4" />
                {N !== null && N <= shown && <line x1={X(N - 0.5)} x2={X(N - 0.5)} y1={0} y2={Y(lo - pad)} stroke={PLOT.teal} strokeDasharray="4 3" strokeWidth={1.5} />}
                {pts.map((p) => {
                  const inside = Math.abs(p[1] - L) < eps;
                  return <circle key={p[0]} cx={X(p[0])} cy={Y(p[1])} r={3.2} fill={inside ? PLOT.teal : PLOT.red} opacity={0.9} />;
                })}
              </>
            )}
          </MathPlot>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Sequence</h4>
          <select className="qp-select" value={key} onChange={(e) => setKey(e.target.value)} aria-label="Sequence">
            {SEQUENCES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          {diverges && <Slider label="Candidate limit L" value={candidate} min={-2} max={2} step={0.1} onChange={setCandidate} format={(v) => v.toFixed(1)} />}
          <Slider label="Tolerance ε" value={eps} min={0.01} max={1.5} step={0.01} onChange={setEps} format={(v) => v.toFixed(2)} />
          <Slider label="Terms shown" value={shown} min={10} max={200} step={5} onChange={setShown} />
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Limit L" value={diverges ? "none (diverges)" : fmt(seq.limit, 5)} accent="#c2740a" />
            <Readout label="Smallest N" value={N === null ? "—" : N} accent="#0e8ea3" />
            <Readout label="Terms outside band" value={`${outside} of ${shown}`} />
            <Readout label="Verdict" value={N === null ? "no N exists" : "N found"} />
          </div>
          {diverges && <p className="qp-muted small" style={{ margin: "0 0 10px" }}>The terms keep jumping by 2, so for any ε &lt; 1 no tail of the sequence stays inside the band — whatever L you try.</p>}
          <button className="qp-btn" onClick={() => log("Real Analysis: Sequences", `${seq.label}, ε=${eps.toFixed(2)}`, N === null ? `no N found (limit ${diverges ? "does not exist" : fmt(L, 4)})` : `L=${fmt(L, 5)}, N=${N}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
