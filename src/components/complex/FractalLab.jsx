import React, { useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, Chips } from "../math/MathPlot";
import * as Cx from "../../math/complex";
import { useApp } from "../../context/AppContext";

const INSIDE = [20, 28, 46];
const PRESETS = [
  { key: "rabbit", label: "Rabbit", c: [-0.123, 0.745] },
  { key: "dendrite", label: "Dendrite", c: [0, 1] },
  { key: "airplane", label: "Airplane", c: [-1.755, 0] },
  { key: "seahorse", label: "Seahorse", c: [-0.75, 0.1] },
  { key: "dust", label: "Cantor dust", c: [0.6, 0.6] },
];

function colour(it, max) {
  if (it >= max) return INSIDE;
  const t = Math.min(1, it / 40);
  return Cx.hslToRgb((0.62 + 1.6 * t) % 1, 0.7, 0.88 - 0.42 * Math.sqrt(t));
}

export default function FractalLab() {
  const { log } = useApp();
  const [c, setC] = useState([-0.123, 0.745]);
  const [maxIter, setMaxIter] = useState(120);
  const setCRound = (v) => setC([Number(v[0].toFixed(3)), Number(v[1].toFixed(3))]);

  const inM = Cx.escapeTime([0, 0], c, 400) >= 400;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Iterate z → z² + c. The <strong>Mandelbrot set</strong> (left) marks every c for which the orbit of 0 stays bounded; the
          <strong> Julia set</strong> (right) is the boundary of the points that stay bounded for that one c. Click the Mandelbrot picture to choose c.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div className="qp-card" style={{ flex: "1 1 300px" }}>
            <h4>Mandelbrot set — pick c</h4>
            <MathPlot
              xr={[-2.2, 0.8]} yr={[-1.3, 1.3]} square width={420} paintRes={220} paintKey={`m${maxIter}`}
              paint={(x, y) => colour(Cx.escapeTime([0, 0], [x, y], maxIter), maxIter)}
              xLabel="Re c" yLabel="Im c" label="Mandelbrot set" grid={false} onPointer={(t, p) => { if (t !== "up") setCRound([p.x, p.y]); }}
            >
              {({ X, Y }) => (
                <>
                  <circle cx={X(c[0])} cy={Y(c[1])} r={6} fill="none" stroke="#fff" strokeWidth={3} />
                  <circle cx={X(c[0])} cy={Y(c[1])} r={6} fill="none" stroke={PLOT.red} strokeWidth={1.6} />
                </>
              )}
            </MathPlot>
          </div>
          <div className="qp-card" style={{ flex: "1 1 300px" }}>
            <h4>Julia set for c = {Cx.formatC(c, 3)}</h4>
            <MathPlot
              xr={[-1.8, 1.8]} yr={[-1.8, 1.8]} square width={420} paintRes={220} paintKey={`j${c[0]}|${c[1]}|${maxIter}`}
              paint={(x, y) => colour(Cx.escapeTime([x, y], c, maxIter), maxIter)}
              xLabel="Re z" yLabel="Im z" label="Julia set" grid={false}
            >
              {() => null}
            </MathPlot>
          </div>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Parameter c</h4>
          <Chips options={PRESETS} value={PRESETS.find((p) => p.c[0] === c[0] && p.c[1] === c[1])?.key} onChange={(k) => setC(PRESETS.find((p) => p.key === k).c)} />
          <Slider label="Re c" value={c[0]} min={-2} max={0.8} step={0.005} onChange={(v) => setC([v, c[1]])} format={(v) => v.toFixed(3)} />
          <Slider label="Im c" value={c[1]} min={-1.3} max={1.3} step={0.005} onChange={(v) => setC([c[0], v])} format={(v) => v.toFixed(3)} />
          <Slider label="Max iterations" value={maxIter} min={20} max={300} step={10} onChange={setMaxIter} />
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid" style={{ gridTemplateColumns: "1fr" }}>
            <Readout label="c" value={Cx.formatC(c, 3)} accent="#c2740a" />
            <Readout label="c in Mandelbrot set?" value={inM ? "yes (bounded orbit)" : "no (orbit escapes)"} accent="#0e8ea3" />
            <Readout label="Julia set topology" value={inM ? "connected" : "Cantor dust (disconnected)"} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>Fatou–Julia theorem: the Julia set is connected exactly when c lies in the Mandelbrot set. The membership test is run to 400 iterations.</p>
          <button className="qp-btn" onClick={() => log("Complex Analysis: Mandelbrot & Julia", `c=${Cx.formatC(c, 3)}, ${maxIter} iterations`, `${inM ? "c in Mandelbrot set, Julia set connected" : "c outside Mandelbrot set, Julia set is Cantor dust"}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
