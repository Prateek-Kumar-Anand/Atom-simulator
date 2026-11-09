import React, { useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, Chips, pathD } from "../math/MathPlot";
import { machZehnder, bombTester } from "../../physics/quantumLab";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

export default function InterferometerLab() {
  const { log } = useApp();
  const [mode, setMode] = useState("mz");
  const [phiDeg, setPhiDeg] = useState(0);
  const [bomb, setBomb] = useState(true);
  const [counts, setCounts] = useState({ d1: 0, d2: 0, boom: 0 });
  const [last, setLast] = useState(null);

  const bt = mode === "bomb";
  const phi = bt ? 0 : (phiDeg * Math.PI) / 180;
  const mz = machZehnder(phi);
  const pr = bt ? (bomb ? bombTester() : { absorbed: 0, d1: 1, d2: 0 }) : { absorbed: 0, d1: mz.d1, d2: mz.d2 };
  const total = counts.d1 + counts.d2 + counts.boom;

  const clear = () => { setCounts({ d1: 0, d2: 0, boom: 0 }); setLast(null); };
  const send = (shots) => {
    let a = 0, b = 0, c = 0, lastOut = null;
    for (let i = 0; i < shots; i++) {
      const u = Math.random();
      lastOut = u < pr.absorbed ? "boom" : u < pr.absorbed + pr.d1 ? "d1" : "d2";
      if (lastOut === "boom") c++; else if (lastOut === "d1") a++; else b++;
    }
    setCounts((s) => ({ d1: s.d1 + a, d2: s.d2 + b, boom: s.boom + c }));
    setLast(lastOut);
  };
  const change = (fn) => (v) => { fn(v); clear(); };

  const curve = Array.from({ length: 181 }, (_, i) => { const p = (i / 180) * 2 * Math.PI; return [p * (180 / Math.PI), machZehnder(p).d1]; });
  const glow = (id) => (last === id ? 1 : 0.0);
  const Bar = ({ label, n, p, color }) => (
    <div className="qp-sg-row">
      <span className="qp-sg-lab">{label}</span>
      <div className="qp-sg-track"><div className="qp-sg-fill" style={{ width: `${total ? (n / total) * 100 : 0}%`, background: color }} /></div>
      <span className="qp-sg-val">{total ? fmt((n / total) * 100, 3) : "—"} % <span className="qp-muted">({fmt(p * 100, 3)})</span></span>
    </div>
  );

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Each photon meets a 50/50 beam splitter, takes <em>both</em> arms as a superposition, and recombines at a second splitter. Which detector clicks depends on the
          arm phase difference φ: P(D1) = cos²(φ/2). With one photon at a time the fringes still build up — the photon interferes with itself.
          In <em>bomb tester</em> mode an absorbing object in one arm lets you detect it without the photon ever touching it.
        </p>
        <div className="qp-card">
          <h4>{bt ? "Elitzur–Vaidman bomb tester" : "Mach–Zehnder interferometer"}</h4>
          <svg viewBox="0 0 520 270" style={{ width: "100%", maxWidth: 640, display: "block", margin: "0 auto" }} role="img" aria-label="Interferometer layout">
            {/* paths */}
            <g stroke={PLOT.teal} strokeWidth={3} fill="none" strokeLinecap="round">
              <path d="M30,60 H130" />
              <path d="M130,60 H400" />
              <path d="M130,60 V180" />
              <path d="M130,180 H400" />
              <path d="M400,60 V180" />
              <path d="M400,180 H470" />
              <path d="M400,180 V222" />
            </g>
            <rect x={118} y={48} width={24} height={24} rx={3} transform="rotate(45 130 60)" fill="rgba(59,111,216,0.25)" stroke={PLOT.blue} strokeWidth={2} />
            <rect x={388} y={168} width={24} height={24} rx={3} transform="rotate(45 400 180)" fill="rgba(59,111,216,0.25)" stroke={PLOT.blue} strokeWidth={2} />
            <rect x={118} y={168} width={24} height={24} rx={3} transform="rotate(45 130 180)" fill="rgba(100,116,139,0.35)" stroke={PLOT.axis} strokeWidth={2} />
            <rect x={388} y={48} width={24} height={24} rx={3} transform="rotate(45 400 60)" fill="rgba(100,116,139,0.35)" stroke={PLOT.axis} strokeWidth={2} />
            <text x={130} y={36} fontSize={11} textAnchor="middle" fill={PLOT.text}>BS₁</text>
            <text x={432} y={166} fontSize={11} textAnchor="middle" fill={PLOT.text}>BS₂</text>
            <text x={130} y={214} fontSize={11} textAnchor="middle" fill={PLOT.text}>mirror</text>
            <text x={400} y={36} fontSize={11} textAnchor="middle" fill={PLOT.text}>mirror</text>
            <text x={30} y={46} fontSize={11} fill={PLOT.text}>photon in</text>
            {!bt && <g><rect x={235} y={46} width={30} height={28} rx={5} fill="rgba(139,79,216,0.18)" stroke={PLOT.violet} strokeWidth={2} /><text x={250} y={64} fontSize={12} textAnchor="middle" fill={PLOT.violet}>φ</text></g>}
            {bt && bomb && <g><circle cx={265} cy={180} r={16} fill="rgba(220,59,84,0.2)" stroke={PLOT.red} strokeWidth={2.5} /><text x={265} y={185} fontSize={14} textAnchor="middle">💣</text></g>}
            {bt && !bomb && <g><circle cx={265} cy={180} r={16} fill="none" stroke={PLOT.axis} strokeDasharray="4 4" strokeWidth={2} /><text x={265} y={212} fontSize={11} textAnchor="middle" fill={PLOT.text}>no object</text></g>}
            {/* detectors */}
            <rect x={386} y={222} width={28} height={32} rx={6} fill={`rgba(31,157,87,${0.15 + 0.55 * glow("d1")})`} stroke={PLOT.green} strokeWidth={2} />
            <rect x={470} y={164} width={28} height={32} rx={6} fill={`rgba(194,116,10,${0.15 + 0.55 * glow("d2")})`} stroke={PLOT.amber} strokeWidth={2} />
            <text x={400} y={242} fontSize={11} textAnchor="middle" fill={PLOT.ink}>D1</text>
            <text x={484} y={184} fontSize={11} textAnchor="middle" fill={PLOT.ink}>D2</text>
            {last === "boom" && <text x={265} y={130} fontSize={20} textAnchor="middle" fill={PLOT.red}>💥 absorbed</text>}
          </svg>
          {!bt && (
            <>
              <h4 style={{ marginTop: 14 }}>Detector probability versus phase</h4>
              <MathPlot xr={[0, 360]} yr={[0, 1.05]} height={170} xLabel="φ (degrees)" label="Interference fringes">
                {({ X, Y }) => (
                  <>
                    <path d={pathD(curve, X, Y)} fill="none" stroke={PLOT.green} strokeWidth={2.4} />
                    <path d={pathD(curve.map((p) => [p[0], 1 - p[1]]), X, Y)} fill="none" stroke={PLOT.amber} strokeWidth={2.4} />
                    <line x1={X(phiDeg)} x2={X(phiDeg)} y1={0} y2={Y(0)} stroke={PLOT.ink} strokeDasharray="4 4" />
                    <circle cx={X(phiDeg)} cy={Y(mz.d1)} r={5} fill={PLOT.green} stroke="#fff" strokeWidth={1.5} />
                    <circle cx={X(phiDeg)} cy={Y(mz.d2)} r={5} fill={PLOT.amber} stroke="#fff" strokeWidth={1.5} />
                  </>
                )}
              </MathPlot>
              <p className="qp-muted small" style={{ margin: "6px 0 0" }}><span style={{ color: PLOT.green }}>●</span> D1 &nbsp; <span style={{ color: PLOT.amber }}>●</span> D2</p>
            </>
          )}
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Setup</h4>
          <Chips options={[{ key: "mz", label: "Interferometer" }, { key: "bomb", label: "Bomb tester" }]} value={mode} onChange={(k) => { setMode(k); clear(); }} />
          {!bt && <Slider label="Phase shift φ" value={phiDeg} min={0} max={360} step={5} onChange={change(setPhiDeg)} format={(v) => `${v}°`} />}
          {bt && (
            <Chips options={[{ key: "yes", label: "Object in lower arm" }, { key: "no", label: "Arm empty" }]} value={bomb ? "yes" : "no"} onChange={(k) => { setBomb(k === "yes"); clear(); }} />
          )}
          <div className="qp-btn-row">
            <button className="qp-btn" onClick={() => send(1)}>1 photon</button>
            <button className="qp-btn" onClick={() => send(100)}>100 photons</button>
            <button className="qp-btn" onClick={clear}>Clear</button>
          </div>
        </div>
        <div className="qp-card">
          <h4>Counts ({total} photons)</h4>
          <div className="qp-sg">
            <Bar label="D1" n={counts.d1} p={pr.d1} color={PLOT.green} />
            <Bar label="D2" n={counts.d2} p={pr.d2} color={PLOT.amber} />
            {bt && <Bar label="Absorbed" n={counts.boom} p={pr.absorbed} color={PLOT.red} />}
          </div>
          <div className="qp-readout-grid" style={{ marginTop: 12 }}>
            <Readout label="P(D1)" value={fmt(pr.d1, 4)} accent="#1f9d57" />
            <Readout label="P(D2)" value={fmt(pr.d2, 4)} accent="#c2740a" />
            {!bt && <Readout label="Fringe visibility" value="1.000" />}
            {bt && <Readout label="Interaction-free detection" value={bomb ? "25 % per photon" : "—"} accent="#8b4fd8" />}
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            {bt ? (bomb ? "With nothing in the way D2 would never click. A click at D2 therefore proves an object is there — even though that photon was never absorbed." : "Empty arm: the interference is perfect, every photon exits at D1 and D2 never clicks.") : "At φ = 0 every photon exits D1; at φ = 180° every photon exits D2. In between the probability varies smoothly as cos²(φ/2)."}
          </p>
          <button className="qp-btn" onClick={() => log("Quantum: Interferometer", bt ? `Bomb tester, object ${bomb ? "present" : "absent"}` : `Mach–Zehnder, φ=${phiDeg}°`, `${total} photons: D1=${counts.d1}, D2=${counts.d2}${bt ? `, absorbed=${counts.boom}` : ""}; predicted P(D1)=${fmt(pr.d1, 3)}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
