import React, { useMemo, useRef, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import { Slider, rampColor } from "../math/MathPlot";
import Scene3D from "../math/Scene3D";
import EquationInput, { useFormula } from "../math/EquationInput";
import { rk4step3, divCurl3 } from "../../math/lab3d";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const PRESETS = [
  { key: "lorenz", label: "Lorenz attractor", P: "10*(y-x)", Q: "x*(28-z)-y", R: "x*y-8/3*z", half: 28, center: [0, 0, 24], dt: 0.006, note: "Chaos: nearby tracers separate exponentially, yet all are drawn onto the same butterfly. ∇·F = −σ−1−β is constant, so volumes shrink at a fixed rate." },
  { key: "rossler", label: "Rössler attractor", P: "-y-z", Q: "x+0.2*y", R: "0.2+z*(x-5.7)", half: 14, center: [0, 0, 8], dt: 0.02, note: "A single spiral band that occasionally flicks upward — the simplest chaotic flow." },
  { key: "thomas", label: "Thomas attractor", P: "sin(y)-0.208186*x", Q: "sin(z)-0.208186*y", R: "sin(x)-0.208186*z", half: 5.5, center: [0, 0, 0], dt: 0.08, note: "A cyclically symmetric chaotic flow with a weak damping 0.208186; every direction is equivalent." },
  { key: "helix", label: "Helix (rotation + lift)", P: "-y", Q: "x", R: "0.4", half: 4, center: [0, 0, 0], dt: 0.03, note: "A rigid rotation about the z-axis plus a constant upward drift: curl = (0, 0, 2) and divergence 0 — the flow is incompressible." },
  { key: "spiral", label: "Spiral out & up", P: "0.15*x - y", Q: "x + 0.15*y", R: "0.2*z + 0.3", half: 4, center: [0, 0, 1.5], dt: 0.03, note: "Positive divergence (0.5): tracers spread out — a spiral source." },
  { key: "saddle", label: "3-D saddle", P: "x", Q: "-y", R: "-z", half: 3, center: [0, 0, 0], dt: 0.03, note: "Stretches along x, squeezes along y and z. Zero divergence: volume is preserved but its shape is not." },
];
const M = 90, TL = 44;

export default function FlowField3DLab() {
  const { log } = useApp();
  const [pk, setPk] = useState("lorenz");
  const [sx, setSx] = useState(PRESETS[0].P), [sy, setSy] = useState(PRESETS[0].Q), [sz, setSz] = useState(PRESETS[0].R);
  const [speed, setSpeed] = useState(1);
  const [arrows, setArrows] = useState(false);
  const [resets, setResets] = useState(0);
  const Pf = useFormula(sx, "real", ["x", "y", "z"]), Qf = useFormula(sy, "real", ["x", "y", "z"]), Rf = useFormula(sz, "real", ["x", "y", "z"]);
  const preset = PRESETS.find((p) => p.key === pk);
  const matches = preset && preset.P === sx && preset.Q === sy && preset.R === sz;
  const half = matches ? preset.half : (preset?.half || 4);
  const center = matches ? preset.center : preset?.center || [0, 0, 0];
  const dt = preset?.dt || 0.03;

  const F = useMemo(() => {
    const p = Pf.f, q = Qf.f, r = Rf.f;
    return p && q && r ? (x, y, z) => [p(x, y, z), q(x, y, z), r(x, y, z)] : () => [0, 0, 0];
  }, [Pf.f, Qf.f, Rf.f]);

  const sim = useRef(null);
  const spawn = (c, h) => ({ p: [c[0] + (Math.random() - 0.5) * h * 0.9, c[1] + (Math.random() - 0.5) * h * 0.9, c[2] + (Math.random() - 0.5) * h * 0.9], trail: [], age: Math.floor(Math.random() * 400), life: 700 + Math.floor(Math.random() * 700) });

  const apply = (p) => { setPk(p.key); setSx(p.P); setSy(p.Q); setSz(p.R); };
  const dc = useMemo(() => divCurl3(F, [center[0] + 0.5, center[1] + 0.5, center[2] + 0.5]), [F, center]);
  const f0 = F(center[0] + 0.5, center[1] + 0.5, center[2] + 0.5);

  const draw = (g) => {
    let s = sim.current;
    if (!s || s.F !== F || s.half !== half || s.resets !== resets || s.center !== center) {
      s = sim.current = { F, half, resets, center, parts: Array.from({ length: M }, () => spawn(center, half)), vmax: 1e-6 };
    }
    const k = 1.3 / half;
    const to = (p) => [(p[0] - center[0]) * k, (p[1] - center[1]) * k, (p[2] - center[2]) * k];
    const steps = Math.max(1, Math.round(2 * speed));
    for (const q of s.parts) {
      for (let i = 0; i < steps; i++) {
        const np = rk4step3(F, q.p, dt);
        if (!Number.isFinite(np[0] + np[1] + np[2]) || Math.abs(np[0] - center[0]) > half * 1.6 || Math.abs(np[1] - center[1]) > half * 1.6 || Math.abs(np[2] - center[2]) > half * 1.6 || ++q.age > q.life) {
          const n = spawn(center, half); q.p = n.p; q.trail = []; q.age = 0; q.life = n.life; break;
        }
        q.p = np;
        if (i === steps - 1) { q.trail.push(np); if (q.trail.length > TL) q.trail.shift(); }
      }
    }
    // frame: axes through the centre plus a faint box
    const e = 1.3 * 1.0;
    g.axes(e * 1.25, ["x", "y", "z"], "rgba(71,85,105,0.4)");
    const corners = [-e, e];
    for (const a of corners) for (const b of corners) {
      g.line([-e, a, b], [e, a, b], "rgba(100,116,139,0.25)", 1); g.line([a, -e, b], [a, e, b], "rgba(100,116,139,0.25)", 1); g.line([a, b, -e], [a, b, e], "rgba(100,116,139,0.25)", 1);
    }
    if (arrows) {
      const n = 4;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let l = 0; l < n; l++) {
        const p = [center[0] + ((i + 0.5) / n - 0.5) * 2 * half, center[1] + ((j + 0.5) / n - 0.5) * 2 * half, center[2] + ((l + 0.5) / n - 0.5) * 2 * half];
        const v = F(p[0], p[1], p[2]), m = Math.hypot(v[0], v[1], v[2]);
        if (!Number.isFinite(m) || m < 1e-9) continue;
        const a = to(p), L = 0.3, b = [a[0] + (v[0] / m) * L, a[1] + (v[1] / m) * L, a[2] + (v[2] / m) * L];
        g.line(a, b, "#3b6fd8", 2, 0.75); g.dot(b, 2.4, "#3b6fd8", 0.9);
      }
    }
    for (const q of s.parts) {
      const v = F(q.p[0], q.p[1], q.p[2]), sp = Math.hypot(v[0], v[1], v[2]);
      if (Number.isFinite(sp)) s.vmax = Math.max(s.vmax * 0.9995, sp);
      const col = rampColor(0.25 + 0.75 * Math.min(1, (Number.isFinite(sp) ? sp : 0) / s.vmax));
      const tr = q.trail;
      for (let i = 1; i < tr.length; i++) g.line(to(tr[i - 1]), to(tr[i]), col, 1.9, 0.12 + 0.8 * (i / tr.length));
      if (tr.length) g.dot(to(tr[tr.length - 1]), 2.8, col);
    }
  };

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Type a 3-D vector field F = (P, Q, R)(x, y, z). Tracer particles follow x′ = F(x) (RK4) and leave glowing trails, so you see the streamlines form in real time.
          Divergence tells whether volume expands or contracts; curl measures local rotation. Try the presets, then edit the three formulas.
        </p>
        <div className="qp-card">
          <h4>{matches ? preset.label : "Your field"} — {M} tracers</h4>
          <Scene3D draw={draw} label="3-D vector field with animated tracer particles" dist0={5.4} yaw0={-0.8} pitch0={0.4} autoRotate />
        </div>
        {matches && <p className="qp-muted small" style={{ margin: "0 4px" }}>{preset.note}</p>}
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Field F = (P, Q, R)</h4>
          <div className="qp-chip-row" style={{ marginBottom: 10 }}>
            {PRESETS.map((p) => <button key={p.key} className={"qp-chip" + (matches && p.key === pk ? " active" : "")} onClick={() => apply(p)}>{p.label}</button>)}
          </div>
          <EquationInput label="P(x, y, z)" prefix="P =" value={sx} onChange={setSx} error={Pf.error} id="eq-3dP" hint="x, y, z, pi, e, + − * / ^, sin cos tan exp ln sqrt abs" />
          <EquationInput label="Q(x, y, z)" prefix="Q =" value={sy} onChange={setSy} error={Qf.error} id="eq-3dQ" />
          <EquationInput label="R(x, y, z)" prefix="R =" value={sz} onChange={setSz} error={Rf.error} id="eq-3dR" />
          <Slider label="Flow speed" value={speed} min={0.5} max={4} step={0.5} onChange={setSpeed} format={(v) => `×${v}`} />
          <label className="qp-check"><input type="checkbox" checked={arrows} onChange={(e) => setArrows(e.target.checked)} /> Show field arrows (4×4×4)</label>
          <button className="qp-btn" style={{ marginTop: 10 }} onClick={() => setResets((r) => r + 1)}>Re-seed tracers</button>
        </div>
        <div className="qp-card">
          <h4>At a sample point ({fmt(center[0] + 0.5, 3)}, {fmt(center[1] + 0.5, 3)}, {fmt(center[2] + 0.5, 3)})</h4>
          <div className="qp-readout-grid">
            <Readout label="F" value={`(${f0.map((v) => fmt(v, 3)).join(", ")})`} accent="#0e8ea3" />
            <Readout label="Divergence ∇·F" value={fmt(dc.div, 4)} accent={dc.div < -1e-6 ? "#dc3b54" : dc.div > 1e-6 ? "#1f9d57" : "#64748b"} />
            <Readout label="Curl ∇×F" value={`(${dc.curl.map((v) => fmt(v, 3)).join(", ")})`} accent="#8b4fd8" />
            <Readout label="|curl|" value={fmt(Math.hypot(...dc.curl), 4)} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>∇·F &lt; 0: tracers crowd together (volume contracts); ∇·F &gt; 0: they spread out; ∇·F = 0: incompressible flow.</p>
          <button className="qp-btn" onClick={() => log("Vector Spaces: 3D Flow Field", `P=${sx}; Q=${sy}; R=${sz}`, `F=(${f0.map((v) => fmt(v, 3)).join(", ")}), div=${fmt(dc.div, 4)}, curl=(${dc.curl.map((v) => fmt(v, 3)).join(", ")}) at the sample point`)}>Record result</button>
        </div>
      </div>
    </div>
  );
}
