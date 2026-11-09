import React, { useEffect, useMemo, useState } from "react";
import { Info, Play, Pause, RotateCcw } from "lucide-react";
import Readout from "../common/Readout";
import { Slider, rampColor } from "../math/MathPlot";
import Scene3D from "../math/Scene3D";
import EquationInput, { useFormula } from "../math/EquationInput";
import { FIELDS, descend } from "../../math/vectorSpace";
import { makeCustomField } from "./customField";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const STATUS = { converged: "converged (|∇f| < 10⁻⁵)", diverged: "diverged — step too large", "max-steps": "still moving after 400 steps" };

export default function Descent3DLab() {
  const { log } = useApp();
  const [key, setKey] = useState("himmelblau");
  const [custom, setCustom] = useState("sin(x)*cos(y) + 0.1*(x^2 + y^2)");
  const [half, setHalf] = useState(3.5);
  const formula = useFormula(custom, "real", ["x", "y"]);
  const isCustom = key === "custom";
  const field = useMemo(() => (isCustom ? makeCustomField(formula.f || (() => 0), custom, half) : FIELDS.find((f) => f.key === key) || FIELDS[0]), [isCustom, key, formula.f, custom, half]);
  const [start, setStart] = useState(FIELDS.find((f) => f.key === "himmelblau").start);
  const [logEta, setLogEta] = useState(Math.log10(0.01));
  const [beta, setBeta] = useState(0.5);
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(true);
  const eta = Math.pow(10, logEta);

  const pick = (nk) => { const f = FIELDS.find((e) => e.key === nk) || makeCustomField(() => 0, "", half); setKey(nk); setStart(f.start); setLogEta(Math.log10(f.eta)); setBeta(0); };
  const { path, status } = useMemo(() => descend(field, start, eta, beta, 400), [field, start, eta, beta]);
  useEffect(() => { setK(0); setPlaying(true); }, [field, start, eta, beta]);
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setK((c) => { if (c >= path.length - 1) { setPlaying(false); return c; } return Math.min(path.length - 1, c + Math.max(1, Math.round(path.length / 140))); }), 40);
    return () => clearInterval(id);
  }, [playing, path]);

  const [x0, x1, y0, y1] = field.domain;
  const mesh = useMemo(() => {
    const N = 44, rows = []; const vals = [];
    for (let j = 0; j <= N; j++) { const row = []; for (let i = 0; i <= N; i++) { const x = x0 + (i / N) * (x1 - x0), y = y0 + (j / N) * (y1 - y0); let v = field.f(x, y); if (!Number.isFinite(v)) v = 0; row.push(v); vals.push(v); } rows.push(row); }
    const sorted = [...vals].sort((a, b) => a - b);
    const lo = sorted[0], hi = Math.max(sorted[Math.floor(sorted.length * 0.93)], lo + 1e-9);
    return { N, rows, lo, hi };
  }, [field, x0, x1, y0, y1]);

  const cur = path[Math.min(k, path.length - 1)];
  const done = k >= path.length - 1;
  const draw = (g) => {
    const { N, rows, lo, hi } = mesh, sx = 2.4 / (x1 - x0), sy = 2.4 / (y1 - y0);
    const Z = (v) => ((Math.min(v, hi) - lo) / (hi - lo)) * 1.5 - 0.7;
    const P = (x, y, v) => [(x - (x0 + x1) / 2) * sx, (y - (y0 + y1) / 2) * sy, Z(v)];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const xa = x0 + (i / N) * (x1 - x0), xb = x0 + ((i + 1) / N) * (x1 - x0), ya = y0 + (j / N) * (y1 - y0), yb = y0 + ((j + 1) / N) * (y1 - y0);
      const v = (rows[j][i] + rows[j][i + 1] + rows[j + 1][i + 1] + rows[j + 1][i]) / 4;
      g.quad(P(xa, ya, rows[j][i]), P(xb, ya, rows[j][i + 1]), P(xb, yb, rows[j + 1][i + 1]), P(xa, yb, rows[j + 1][i]), rampColor(1 - Math.min(1, Math.max(0, (v - lo) / (hi - lo)))), { alpha: 0.93 });
    }
    g.axes(1.7, ["x", "y", "f"], "rgba(71,85,105,0.4)");
    const lift = 0.03;
    const pts = path.slice(0, k + 1).map((q) => { const p = P(q.x, q.y, q.f); return [p[0], p[1], p[2] + lift]; });
    g.path(pts, "#111827", 3);
    const s0 = P(start[0], start[1], field.f(start[0], start[1]));
    g.dot([s0[0], s0[1], s0[2] + lift], 6, "#1f9d57");
    const b = P(cur.x, cur.y, cur.f);
    g.line([b[0], b[1], -0.7], [b[0], b[1], b[2] + lift], "rgba(220,59,84,0.4)", 1.2);
    g.dot([b[0], b[1], b[2] + lift], 7, "#dc3b54");
  };

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> The same gradient descent as before, now as a ball rolling down a 3-D landscape z = f(x, y). The path always runs perpendicular to the level curves. Pick a surface or type your own,
          drag the start sliders to change where the ball is dropped, and compare how η and momentum β change the journey.
        </p>
        <div className="qp-card">
          <h4>Descent on {field.label} — step {Math.min(k, path.length - 1)} of {path.length - 1}</h4>
          <Scene3D draw={draw} label="3-D gradient descent on a surface" dist0={5.3} yaw0={-0.75} pitch0={0.6} autoRotate={false} />
          <div className="qp-btn-row" style={{ marginTop: 12 }}>
            <button className="qp-btn" onClick={() => { if (done) setK(0); setPlaying((p) => !p); }}>{playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : done ? "Replay" : "Run"}</button>
            <button className="qp-btn" onClick={() => { setK(0); setPlaying(true); }}><RotateCcw size={14} /> Restart</button>
          </div>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Surface and descent</h4>
          <select className="qp-select" value={key} onChange={(e) => pick(e.target.value)} aria-label="Surface">
            {FIELDS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            <option value="custom">✎ Custom formula…</option>
          </select>
          {isCustom && (
            <>
              <EquationInput label="Type your own surface" prefix="f(x, y) =" value={custom} onChange={setCustom} error={formula.error} id="eq-d3d" hint="x, y, pi, e, + − * / ^, sin cos exp ln sqrt abs" examples={["sin(x)*cos(y) + 0.1*(x^2 + y^2)", "x^4 + y^4 - 4*x*y + 1", "(x^2 + y - 11)^2 + (x + y^2 - 7)^2", "x^2 - y^2 + 0.05*x^4"]} />
              <Slider label="Window half-width" value={half} min={1} max={6} step={0.5} onChange={(v) => { setHalf(v); setStart([Number((v * 0.6).toFixed(2)), Number((v * 0.45).toFixed(2))]); }} format={(v) => v.toFixed(1)} />
            </>
          )}
          <Slider label="Start x" value={start[0]} min={x0} max={x1} step={(x1 - x0) / 80} onChange={(v) => setStart([Number(v.toFixed(2)), start[1]])} format={(v) => Number(v).toFixed(2)} />
          <Slider label="Start y" value={start[1]} min={y0} max={y1} step={(y1 - y0) / 80} onChange={(v) => setStart([start[0], Number(v.toFixed(2))])} format={(v) => Number(v).toFixed(2)} />
          <Slider label="Learning rate η" value={logEta} min={-4} max={0.3} step={0.05} onChange={setLogEta} format={() => eta.toPrecision(2)} />
          <Slider label="Momentum β" value={beta} min={0} max={0.95} step={0.05} onChange={setBeta} format={(v) => v.toFixed(2)} />
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Position (x, y)" value={`(${fmt(cur.x, 3)}, ${fmt(cur.y, 3)})`} />
            <Readout label="f at the ball" value={fmt(cur.f, 5)} accent="#0e8ea3" />
            <Readout label="Gradient |∇f|" value={fmt(cur.g, 4)} accent="#c2740a" />
            <Readout label="Outcome" value={done ? STATUS[status] : "running…"} accent={done && status === "converged" ? "#1f9d57" : "#64748b"} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>{field.note}</p>
          <button className="qp-btn" onClick={() => log("Vector Spaces: 3D Gradient Descent", `${field.label}, start (${start[0]}, ${start[1]}), η=${eta.toPrecision(2)}, β=${beta.toFixed(2)}`, `${path.length - 1} steps, final f=${fmt(path[path.length - 1].f, 5)}, ${STATUS[status]}`)}>Record result</button>
        </div>
      </div>
    </div>
  );
}
