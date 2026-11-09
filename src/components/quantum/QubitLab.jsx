import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import { PLOT, Slider, Chips } from "../math/MathPlot";
import { GATES, qubitFromAngles, applyGate, rotation, bloch, AXES, probPlus, sgChain } from "../../physics/quantumLab";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const SIZE = 300, R = 118, C = SIZE / 2, EL = (22 * Math.PI) / 180;
const GATE_NOTE = { X: "bit flip (π about x)", Y: "π about y", Z: "phase flip (π about z)", H: "Hadamard: z ↔ x", S: "π/2 about z", T: "π/4 about z" };
const CHAINS = [
  { key: "zz", label: "z → z", axes: ["z", "z"] },
  { key: "zxz", label: "z → x → z", axes: ["z", "x", "z"] },
  { key: "zxyz", label: "z → x → y → z", axes: ["z", "x", "y", "z"] },
  { key: "xyz", label: "x → y → z", axes: ["x", "y", "z"] },
];
const cx = (c) => `${c[0] >= 0 ? "" : "−"}${Math.abs(c[0]).toFixed(3)}${c[1] >= 0 ? " + " : " − "}${Math.abs(c[1]).toFixed(3)}i`;

export default function QubitLab() {
  const { log } = useApp();
  const [theta, setTheta] = useState(60);
  const [phi, setPhi] = useState(0);
  const [st, setSt] = useState(() => qubitFromAngles(Math.PI / 3, 0));
  const [hist, setHist] = useState([]);
  const [az, setAz] = useState(35);
  const [axis, setAxis] = useState("z");
  const [rotAng, setRotAng] = useState(90);
  const [counts, setCounts] = useState({ plus: 0, minus: 0 });
  const [chain, setChain] = useState("zxz");

  const r = bloch(st);
  const pPlus = probPlus(r, AXES[axis]);
  const sg = useMemo(() => sgChain([0, 0, 0], CHAINS.find((c) => c.key === chain).axes), [chain]);
  const sgAxes = CHAINS.find((c) => c.key === chain).axes;

  const prepare = (th, ph) => { setTheta(th); setPhi(ph); setSt(qubitFromAngles((th * Math.PI) / 180, (ph * Math.PI) / 180)); setHist([]); setCounts({ plus: 0, minus: 0 }); };
  const gate = (g) => { setSt((s) => applyGate(s, GATES[g])); setHist((h) => [...h, g].slice(-14)); setCounts({ plus: 0, minus: 0 }); };
  const rotate = () => { setSt((s) => applyGate(s, rotation(axis, (rotAng * Math.PI) / 180))); setHist((h) => [...h, `R${axis}(${rotAng}°)`].slice(-14)); setCounts({ plus: 0, minus: 0 }); };
  const measure = (shots) => {
    let p = 0;
    for (let i = 0; i < shots; i++) if (Math.random() < pPlus) p++;
    setCounts((c) => ({ plus: c.plus + p, minus: c.minus + shots - p }));
  };

  // 3-D → screen projection (azimuth about z, then a fixed tilt)
  const a = (az * Math.PI) / 180;
  const proj = (v) => {
    const x1 = v[0] * Math.cos(a) - v[1] * Math.sin(a), y1 = v[0] * Math.sin(a) + v[1] * Math.cos(a), z1 = v[2];
    return { x: C + R * x1, y: C - R * (z1 * Math.cos(EL) - y1 * Math.sin(EL)), d: y1 * Math.cos(EL) + z1 * Math.sin(EL) };
  };
  const ring = (f) => Array.from({ length: 97 }, (_, i) => proj(f((i / 96) * 2 * Math.PI)));
  const segs = (pts) => {
    const out = { front: "", back: "" };
    for (let i = 1; i < pts.length; i++) {
      const k = pts[i].d + pts[i - 1].d >= 0 ? "front" : "back";
      out[k] += `M${pts[i - 1].x.toFixed(1)},${pts[i - 1].y.toFixed(1)}L${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`;
    }
    return out;
  };
  const rings = [segs(ring((t) => [Math.cos(t), Math.sin(t), 0])), segs(ring((t) => [Math.cos(t), 0, Math.sin(t)])), segs(ring((t) => [0, Math.cos(t), Math.sin(t)]))];
  const tip = proj(r), o = proj([0, 0, 0]);
  const labels = [["|0⟩", [0, 0, 1.14]], ["|1⟩", [0, 0, -1.14]], ["+x", [1.14, 0, 0]], ["+y", [0, 1.14, 0]]];
  const total = counts.plus + counts.minus;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> A spin-½ particle (or any two-level system) lives on the Bloch sphere: |ψ⟩ = cos(θ/2)|0⟩ + e^{"{iφ}"} sin(θ/2)|1⟩. Gates are rotations
          of the sphere; a measurement along any axis gives “+” with probability (1 + r·n̂)/2 — and then the state is the axis state. This is what Stern–Gerlach magnets do to atoms.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div className="qp-card" style={{ flex: "1 1 320px" }}>
            <h4>Bloch sphere</h4>
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: "100%", maxWidth: 340, display: "block", margin: "0 auto" }} role="img" aria-label="Bloch sphere">
              <circle cx={C} cy={C} r={R} fill="rgba(255,255,255,0.55)" stroke={PLOT.axis} />
              {rings.map((g, i) => <path key={"b" + i} d={g.back} fill="none" stroke={PLOT.axis} strokeDasharray="3 4" opacity={0.7} />)}
              {rings.map((g, i) => <path key={"f" + i} d={g.front} fill="none" stroke={PLOT.gridStrong} strokeWidth={1.2} />)}
              {[[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]].map((v, i) => { const p = proj(v); return <line key={i} x1={o.x} y1={o.y} x2={p.x} y2={p.y} stroke={PLOT.axis} strokeWidth={1} />; })}
              {labels.map(([t, v]) => { const p = proj(v); return <text key={t} x={p.x} y={p.y + 4} fontSize={12} fill={PLOT.text} textAnchor="middle" stroke="rgba(255,255,255,0.85)" strokeWidth={3} paintOrder="stroke">{t}</text>; })}
              <line x1={o.x} y1={o.y} x2={tip.x} y2={tip.y} stroke={PLOT.red} strokeWidth={3} strokeLinecap="round" />
              <circle cx={tip.x} cy={tip.y} r={6} fill={PLOT.red} stroke="#fff" strokeWidth={2} />
            </svg>
            <Slider label="Rotate view" value={az} min={0} max={360} step={5} onChange={setAz} format={(v) => `${v}°`} />
          </div>
          <div className="qp-card" style={{ flex: "1 1 260px" }}>
            <h4>Prepare and apply gates</h4>
            <Slider label="Polar angle θ" value={theta} min={0} max={180} step={1} onChange={(v) => prepare(v, phi)} format={(v) => `${v}°`} />
            <Slider label="Azimuth φ" value={phi} min={0} max={360} step={1} onChange={(v) => prepare(theta, v)} format={(v) => `${v}°`} />
            <div className="qp-chip-row" style={{ marginBottom: 10 }}>
              {Object.keys(GATES).map((g) => <button key={g} className="qp-chip" title={GATE_NOTE[g]} onClick={() => gate(g)}>{g}</button>)}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
              <Chips options={[{ key: "x", label: "Rx" }, { key: "y", label: "Ry" }, { key: "z", label: "Rz" }]} value={axis} onChange={setAxis} />
            </div>
            <Slider label={`Rotation about ${axis}`} value={rotAng} min={-180} max={180} step={5} onChange={setRotAng} format={(v) => `${v}°`} />
            <button className="qp-btn" onClick={rotate}>Apply R{axis}({rotAng}°)</button>
            <p className="qp-muted small" style={{ margin: "10px 0 0" }}>Gates applied: {hist.length ? hist.join(" → ") : "none"}</p>
          </div>
        </div>
        <div className="qp-card">
          <h4>Stern–Gerlach filter chain (unpolarised atoms in)</h4>
          <Chips options={CHAINS} value={chain} onChange={setChain} />
          <div className="qp-sg">
            {sg.map((f, i) => (
              <div key={i} className="qp-sg-row">
                <span className="qp-sg-lab">Filter {i + 1} ({sgAxes[i]}+)</span>
                <div className="qp-sg-track"><div className="qp-sg-fill" style={{ width: `${f * 100}%` }} /></div>
                <span className="qp-sg-val">{fmt(f * 100, 3)} %{i > 0 ? <span className="qp-muted"> ({fmt((f / sg[0]) * 100, 3)} of beam 1)</span> : null}</span>
              </div>
            ))}
          </div>
          <p className="qp-muted small" style={{ margin: "8px 0 0" }}>
            Percentages are of the original unpolarised atoms (the first filter always keeps half). A second z filter passes the whole z+ beam (100 % of beam 1), but putting an x filter in between scrambles z:
            only 25 % of beam 1 survives z → x → z. Measuring x destroys the earlier knowledge of z.
          </p>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>State and measurement</h4>
          <div className="qp-readout-grid">
            <Readout label="Amplitude ⟨0|ψ⟩" value={cx(st.a)} />
            <Readout label="Amplitude ⟨1|ψ⟩" value={cx(st.b)} />
            <Readout label="Bloch vector (x, y, z)" value={`(${r.map((v) => v.toFixed(2)).join(", ")})`} accent="#dc3b54" />
            <Readout label={`P(${axis}+)`} value={fmt(pPlus, 4)} accent="#0e8ea3" />
          </div>
          <Chips options={[{ key: "x", label: "Measure x" }, { key: "y", label: "Measure y" }, { key: "z", label: "Measure z" }]} value={axis} onChange={(k) => { setAxis(k); setCounts({ plus: 0, minus: 0 }); }} />
          <div className="qp-btn-row" style={{ marginBottom: 10 }}>
            <button className="qp-btn" onClick={() => measure(1)}>1 shot</button>
            <button className="qp-btn" onClick={() => measure(100)}>100 shots</button>
            <button className="qp-btn" onClick={() => setCounts({ plus: 0, minus: 0 })}>Clear</button>
          </div>
          <div className="qp-sg">
            {[["+", counts.plus, PLOT.teal, pPlus], ["−", counts.minus, PLOT.amber, 1 - pPlus]].map(([s, c, col, p]) => (
              <div key={s} className="qp-sg-row">
                <span className="qp-sg-lab">{axis}{s} observed</span>
                <div className="qp-sg-track"><div className="qp-sg-fill" style={{ width: `${total ? (c / total) * 100 : 0}%`, background: col }} /></div>
                <span className="qp-sg-val">{total ? fmt((c / total) * 100, 3) : "—"} % <span className="qp-muted">({fmt(p * 100, 3)})</span></span>
              </div>
            ))}
          </div>
          <p className="qp-muted small" style={{ margin: "8px 0 10px" }}>Shots are independent copies of the same prepared state (the state is not collapsed here), so counts approach the prediction in brackets.</p>
          <button className="qp-btn" onClick={() => log("Quantum: Spin-½ Qubit", `θ=${theta}°, φ=${phi}°, gates: ${hist.length ? hist.join("→") : "none"}`, `r=(${r.map((v) => v.toFixed(2)).join(", ")}), P(${axis}+)=${fmt(pPlus, 4)}${total ? `, ${counts.plus}/${total} observed` : ""}; SG ${sgAxes.join("→")}: ${fmt(sg[sg.length - 1] * 100, 3)} % pass`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
