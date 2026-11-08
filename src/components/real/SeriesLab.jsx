import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider } from "../math/MathPlot";
import { SERIES, partialSums, seriesTests, ratioVerdict } from "../../math/realAnalysis";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const KIND = { absolute: "converges absolutely", conditional: "converges conditionally", divergent: "diverges" };

export default function SeriesLab() {
  const { log } = useApp();
  const [key, setKey] = useState("basel");
  const [count, setCount] = useState(40);
  const series = SERIES.find((s) => s.key === key) || SERIES[0];
  const sums = useMemo(() => partialSums(series, 300), [series]);
  const shown = sums.slice(0, count);
  const SN = shown[shown.length - 1];
  const idx = series.start + count - 1;
  const { ratio, root } = seriesTests(series, idx);

  const ys = shown.concat(series.sum !== null ? [series.sum] : []);
  const lo = Math.min(...ys, 0), hi = Math.max(...ys);
  const pad = (hi - lo || 1) * 0.12;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> A series converges when its partial sums Sₙ = a₁ + … + aₙ settle to a limit. Compare
          absolutely convergent series (fast settling), conditionally convergent ones (slow, zig-zagging) and divergent ones.
        </p>
        <div className="qp-card">
          <h4>Partial sums Sₙ</h4>
          <MathPlot xr={[0, count + 1]} yr={[lo - pad, hi + pad]} xLabel="n" yLabel="Sₙ" label="Partial sums of the series">
            {({ X, Y, W }) => (
              <>
                {series.sum !== null && <line x1={0} x2={W} y1={Y(series.sum)} y2={Y(series.sum)} stroke={PLOT.amber} strokeDasharray="5 4" strokeWidth={1.5} />}
                <polyline fill="none" stroke="rgba(14,142,163,0.45)" strokeWidth={1.2} points={shown.map((s, i) => `${X(i + 1)},${Y(s)}`).join(" ")} />
                {shown.map((s, i) => <circle key={i} cx={X(i + 1)} cy={Y(s)} r={2.8} fill={PLOT.teal} />)}
              </>
            )}
          </MathPlot>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Series</h4>
          <select className="qp-select" value={key} onChange={(e) => setKey(e.target.value)} aria-label="Series">
            {SERIES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <Slider label="Terms summed n" value={count} min={5} max={300} step={5} onChange={setCount} />
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label={`Partial sum S${count}`} value={fmt(SN, 6)} accent="#0e8ea3" />
            <Readout label="Exact sum" value={series.sum === null ? "diverges" : fmt(series.sum, 6)} accent="#c2740a" />
            <Readout label="Remaining error" value={series.sum === null ? "—" : fmt(Math.abs(SN - series.sum), 3)} />
            <Readout label="Classification" value={KIND[series.kind]} />
            <Readout label="Ratio test ρ = |aₙ₊₁/aₙ|" value={fmt(ratio, 4)} />
            <Readout label="Root test |aₙ|^(1/n)" value={fmt(root, 4)} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>{ratioVerdict(ratio)}</p>
          <button className="qp-btn" onClick={() => log("Real Analysis: Series", `${series.label}, n=${count}`, `S=${fmt(SN, 6)}, exact=${series.sum === null ? "diverges" : fmt(series.sum, 6)}, ρ=${fmt(ratio, 4)}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
