import React, { useEffect, useMemo, useState } from "react";
import { Info, Play, Pause, RotateCcw, StepForward } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider } from "../math/MathPlot";
import { FIELDS, descend } from "../../math/vectorSpace";
import { makeFieldPainter } from "./fieldPaint";
import EquationInput, { useFormula } from "../math/EquationInput";
import { makeCustomField } from "./customField";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const STATUS = { converged: "converged (|∇f| < 10⁻⁵)", diverged: "diverged — step too large", "max-steps": "still moving after 400 steps" };

export default function DescentLab() {
  const { log } = useApp();
  const [key, setKey] = useState("ravine");
  const [custom, setCustom] = useState("x^4 + y^4 - 4*x*y + 1");
  const [half, setHalf] = useState(3);
  const formula = useFormula(custom, "real", ["x", "y"]);
  const isCustom = key === "custom";
  const field = useMemo(
    () => (isCustom ? makeCustomField(formula.f || (() => 0), custom, half) : FIELDS.find((f) => f.key === key) || FIELDS[0]),
    [isCustom, key, formula.f, custom, half]
  );
  const [start, setStart] = useState(FIELDS[1].start);
  const [logEta, setLogEta] = useState(Math.log10(FIELDS[1].eta));
  const [beta, setBeta] = useState(0);
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(true);
  const eta = Math.pow(10, logEta);

  const pick = (nk) => {
    const f = FIELDS.find((e) => e.key === nk) || makeCustomField(() => 0, "", half);
    setKey(nk); setStart(f.start); setLogEta(Math.log10(f.eta)); setBeta(0);
  };

  const painter = useMemo(() => makeFieldPainter(field), [field]);
  const { path, status } = useMemo(() => descend(field, start, eta, beta, 400), [field, start, eta, beta]);

  // a new problem (field / start / η / β) restarts the animation
  useEffect(() => { setK(0); setPlaying(true); }, [field, start, eta, beta]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setK((cur) => {
      if (cur >= path.length - 1) { setPlaying(false); return cur; }
      return Math.min(path.length - 1, cur + Math.max(1, Math.round(path.length / 120)));
    }), 40);
    return () => clearInterval(id);
  }, [playing, path]);

  const cur = path[Math.min(k, path.length - 1)];
  const done = k >= path.length - 1;
  const [x0d, x1d, y0d, y1d] = field.domain;
  const gnorm = path.map((p, i) => [i, Math.log10(Math.max(p.g, 1e-10))]);
  const gHi = Math.max(...gnorm.map((p) => p[1]), 0) + 0.5, gLo = Math.min(...gnorm.map((p) => p[1]), -1) - 0.5;
  const visible = path.slice(0, k + 1);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Gradient descent repeats x ← x − η∇f(x): walk downhill, perpendicular to the contours. Click the picture to choose a start point.
          Too large an η overshoots and diverges; momentum β smooths the zig-zag in narrow valleys.
        </p>
        <div className="qp-card">
          <h4>Descent path on {field.label}</h4>
          <MathPlot
            xr={[x0d, x1d]} yr={[y0d, y1d]} square paint={painter} paintKey={`${key}|${isCustom ? custom + half : ""}`} paintRes={200} xLabel="x" yLabel="y" label="Gradient descent path"
            onPointer={(t, q) => { if (t === "down") setStart([Number(Math.max(x0d, Math.min(x1d, q.x)).toFixed(2)), Number(Math.max(y0d, Math.min(y1d, q.y)).toFixed(2))]); }}
          >
            {({ X, Y }) => (
              <>
                <polyline fill="none" stroke="rgba(30,41,59,0.75)" strokeWidth={2} strokeLinejoin="round" points={visible.map((p) => `${X(p.x)},${Y(p.y)}`).join(" ")} />
                {visible.length < 80 && visible.map((p, i) => <circle key={i} cx={X(p.x)} cy={Y(p.y)} r={2.6} fill="#fff" stroke="rgba(30,41,59,0.8)" />)}
                <circle cx={X(start[0])} cy={Y(start[1])} r={6} fill={PLOT.green} stroke="#fff" strokeWidth={2} />
                <circle cx={X(cur.x)} cy={Y(cur.y)} r={6.5} fill={PLOT.red} stroke="#fff" strokeWidth={2} />
              </>
            )}
          </MathPlot>
          <p className="qp-muted small" style={{ margin: "8px 0 0" }}><span style={{ color: PLOT.green }}>●</span> start&nbsp; <span style={{ color: PLOT.red }}>●</span> current point</p>
        </div>
        <div className="qp-card">
          <h4>log₁₀ |∇f| per iteration</h4>
          <MathPlot xr={[0, Math.max(5, path.length - 1)]} yr={[gLo, gHi]} height={170} xLabel="iteration" label="Gradient norm versus iteration">
            {({ X, Y }) => (
              <>
                <polyline fill="none" stroke="rgba(14,142,163,0.35)" strokeWidth={1.6} points={gnorm.map((p) => `${X(p[0])},${Y(p[1])}`).join(" ")} />
                <polyline fill="none" stroke={PLOT.teal} strokeWidth={2.2} points={gnorm.slice(0, k + 1).map((p) => `${X(p[0])},${Y(p[1])}`).join(" ")} />
              </>
            )}
          </MathPlot>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Problem</h4>
          <select className="qp-select" value={key} onChange={(e) => pick(e.target.value)} aria-label="Function to minimise">
            {FIELDS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            <option value="custom">✎ Custom formula…</option>
          </select>
          {isCustom && (
            <>
              <EquationInput
                label="Type the function to minimise" prefix="f(x, y) =" value={custom} onChange={setCustom} error={formula.error}
                hint="Use x, y, pi, e, + − * / ^, sin cos exp ln sqrt abs …"
                examples={["x^4 + y^4 - 4*x*y + 1", "(x-1)^2 + 5*(y+0.5)^2", "x^2 + y^2 + 3*sin(2*x)*sin(2*y)", "abs(x) + abs(y)", "x^2*y^2 + x^2 + y^2"]}
              />
              <Slider label="Window half-width" value={half} min={1} max={12} step={0.5} onChange={(v) => { setHalf(v); setStart([Number((v * 0.6).toFixed(2)), Number((v * 0.45).toFixed(2))]); }} format={(v) => v.toFixed(1)} />
            </>
          )}
          <Slider label="Learning rate η" value={logEta} min={-4} max={0.5} step={0.05} onChange={setLogEta} format={() => fmt(eta, 3)} />
          <Slider label="Momentum β" value={beta} min={0} max={0.95} step={0.01} onChange={setBeta} format={(v) => v.toFixed(2)} />
          <div className="qp-btn-row">
            <button className="qp-btn qp-btn-primary" onClick={() => { if (done) setK(0); setPlaying((p) => !p || done); }}>
              {playing && !done ? <Pause size={14} /> : <Play size={14} />} {playing && !done ? "Pause" : done ? "Replay" : "Play"}
            </button>
            <button className="qp-btn" onClick={() => { setPlaying(false); setK((c) => Math.min(path.length - 1, c + 1)); }}><StepForward size={14} /> Step</button>
            <button className="qp-btn" onClick={() => { setPlaying(false); setK(0); }}><RotateCcw size={14} /> Reset</button>
          </div>
          <p className="qp-muted small" style={{ margin: "10px 0 0" }}>{field.note}</p>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Iteration" value={`${k} / ${path.length - 1}`} />
            <Readout label="Position" value={`(${fmt(cur.x, 3)}, ${fmt(cur.y, 3)})`} />
            <Readout label="f" value={fmt(cur.f, 5)} accent="#0e8ea3" />
            <Readout label="|∇f|" value={fmt(cur.g, 3)} accent="#dc3b54" />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>{done ? `Run result: ${STATUS[status]}.` : "Running…"}</p>
          <button className="qp-btn" onClick={() => { const last = path[path.length - 1]; log("Vector Spaces: Gradient Descent", `${field.label}, η=${fmt(eta, 3)}, β=${beta.toFixed(2)}, start (${start[0]}, ${start[1]})`, `${STATUS[status]} after ${path.length - 1} steps; final (${fmt(last.x, 4)}, ${fmt(last.y, 4)}), f=${fmt(last.f, 5)}`); }}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
