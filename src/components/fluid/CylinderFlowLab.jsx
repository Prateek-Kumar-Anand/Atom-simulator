import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, pathD, divergingColor } from "../math/MathPlot";
import { FLUIDS_EXT, fluidByKey, cylinderVelocity, cylinderSurfaceSpeed, pressureCoefficient, cylinderStagnation, kuttaLift, traceStreamline } from "../../physics/hydro";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const WIN = 3.2;
const deg = (r) => (r * 180) / Math.PI;

export default function CylinderFlowLab() {
  const { log } = useApp();
  const [fk, setFk] = useState("water");
  const [U, setU] = useState(2);
  const [a, setA] = useState(0.1);
  const [s, setS] = useState(0);
  const [probe, setProbe] = useState({ x: -1.6, y: 1.3 });
  const [showCp, setShowCp] = useState(true);
  const fluid = fluidByKey(fk);

  // Dimensionless picture: a = 1, U = 1, Γ = 4π s  (s = Γ / 4πaU)
  const G1 = 4 * Math.PI * s;
  const lines = useMemo(() => {
    const out = [];
    for (let i = 0; i < 19; i++) {
      const y0 = -WIN * 0.92 + (i * WIN * 1.84) / 18;
      out.push(traceStreamline(-WIN, y0, 1, 1, G1, WIN, 0.05, 1400));
    }
    return out;
  }, [G1]);
  const stag = cylinderStagnation(1, 1, G1);
  const gammaPhys = 4 * Math.PI * s * a * U;
  const lift = kuttaLift(fluid.density, U, gammaPhys) + 0;
  const Cl = -4 * Math.PI * s + 0;
  const vmax = 2 * (1 + Math.abs(s)) * U;
  const [pu, pv] = cylinderVelocity(probe.x, probe.y, 1, 1, G1);
  const pr = Math.hypot(probe.x, probe.y);
  const inside = pr < 1;
  const pSpeed = Math.hypot(pu, pv);
  const pCp = pressureCoefficient(pSpeed, 1);
  const cpSurf = Array.from({ length: 181 }, (_, i) => { const th = (i / 180) * 2 * Math.PI; return [deg(th), pressureCoefficient(cylinderSurfaceSpeed(th, 1, 1, G1), 1)]; });
  const cpMin = 1 - vmax * vmax / (U * U);
  const paint = showCp ? (x, y) => {
    if (x * x + y * y < 1) return [255, 255, 255, 255];
    const [uu, vv] = cylinderVelocity(x, y, 1, 1, G1);
    const cp = 1 - (uu * uu + vv * vv);
    const t = cp >= 0 ? cp : cp / 3;
    const c = divergingColor(Math.max(-1, Math.min(1, t)));
    return [c[0], c[1], c[2], 255];
  } : null;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Ideal (frictionless, irrotational) flow past a cylinder is a uniform stream plus a doublet. With no circulation the pressure pattern is symmetric: <em>zero drag</em> (d’Alembert’s paradox) and zero lift.
          Add a vortex and the stagnation points slide round the surface, the flow above speeds up, and a net lift appears: L = −ρUΓ per metre of span (Kutta–Joukowski). Drag the white dot to probe the flow.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div className="qp-card" style={{ flex: "2 1 340px" }}>
            <h4>Streamlines{showCp ? " and pressure coefficient Cp" : ""} — distances in cylinder radii</h4>
            <MathPlot
              xr={[-WIN, WIN]} yr={[-WIN, WIN]} square grid={false} xLabel="x / a" yLabel="y / a" label="Potential flow past a cylinder"
              paint={paint} paintKey={`${s}-${showCp}`} paintRes={150}
              onPointer={(t, p) => setProbe({ x: Math.max(-WIN, Math.min(WIN, p.x)), y: Math.max(-WIN, Math.min(WIN, p.y)) })}
            >
              {({ X, Y, sx }) => (
                <>
                  {lines.map((pts, i) => <path key={i} d={pathD(pts, X, Y)} fill="none" stroke="rgba(30,41,59,0.55)" strokeWidth={1.2} />)}
                  <circle cx={X(0)} cy={Y(0)} r={sx} fill="rgba(255,255,255,0.97)" stroke={PLOT.ink} strokeWidth={2.4} />
                  {stag && stag.map((t, i) => <circle key={i} cx={X(Math.cos(t))} cy={Y(Math.sin(t))} r={4.5} fill={PLOT.red} stroke="#fff" strokeWidth={1.5} />)}
                  {!stag && <circle cx={X(0)} cy={Y(s + Math.sign(s) * Math.sqrt(s * s - 1))} r={4.5} fill={PLOT.red} stroke="#fff" strokeWidth={1.5} />}
                  <line x1={X(probe.x)} y1={Y(probe.y)} x2={X(probe.x + pu * 0.35)} y2={Y(probe.y + pv * 0.35)} stroke={PLOT.violet} strokeWidth={3} />
                  <circle cx={X(probe.x)} cy={Y(probe.y)} r={7} fill="#fff" stroke={PLOT.violet} strokeWidth={2.5} />
                </>
              )}
            </MathPlot>
            <label className="qp-check"><input type="checkbox" checked={showCp} onChange={(e) => setShowCp(e.target.checked)} /> Shade pressure (red = high, blue = low)</label>
          </div>
          <div className="qp-card" style={{ flex: "1 1 260px" }}>
            <h4>Surface pressure coefficient</h4>
            <MathPlot xr={[0, 360]} yr={[-Math.max(4, -cpMin) * 1.05, 1.5]} height={280} xLabel="θ (degrees)" yLabel="Cp" label="Cp round the cylinder">
              {({ X, Y }) => <path d={pathD(cpSurf, X, Y)} fill="none" stroke={PLOT.teal} strokeWidth={2.4} />}
            </MathPlot>
            <p className="qp-muted small" style={{ margin: "6px 0 0" }}>Cp = 1 at a stagnation point. Lift comes from the lower pressure over the top (θ = 90°) than the bottom (270°) when s &lt; 0.</p>
          </div>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Flow</h4>
          <div className="qp-slider-row">
            <label>Fluid</label>
            <select className="qp-select" value={fk} onChange={(e) => setFk(e.target.value)}>
              {FLUIDS_EXT.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </div>
          <Slider label="Stream speed U" value={U} min={0.5} max={20} step={0.5} onChange={setU} format={(x) => `${x} m/s`} />
          <Slider label="Cylinder radius a" value={a} min={0.02} max={0.5} step={0.01} onChange={setA} format={(x) => `${x.toFixed(2)} m`} />
          <Slider label="Circulation s = Γ/(4πaU)" value={s} min={-2} max={2} step={0.05} onChange={setS} format={(x) => `${x.toFixed(2)}${x < 0 ? " (clockwise)" : x > 0 ? " (anticlockwise)" : ""}`} />
          <div className="qp-btn-row"><button className="qp-btn" onClick={() => setS(0)}>No circulation</button><button className="qp-btn" onClick={() => setS(-1)}>Stagnation pair merges (s = −1)</button></div>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Drag per metre" value="0 N/m (d’Alembert)" accent="#8b4fd8" />
            <Readout label="Lift per metre" value={`${fmt(lift, 4)} N/m ${lift > 0 ? "↑" : lift < 0 ? "↓" : ""}`} accent="#1f9d57" />
            <Readout label="Lift coefficient" value={fmt(Cl, 4)} />
            <Readout label="Stagnation angles" value={stag ? `${fmt(deg(stag[0]), 3)}°, ${fmt(deg(stag[1]), 3)}°` : "off the surface"} accent="#dc3b54" />
            <Readout label="Peak surface speed" value={`${fmt(vmax, 3)} m/s (${fmt(vmax / U, 3)} U)`} />
            <Readout label="Min Cp (suction peak)" value={fmt(cpMin, 4)} />
            <Readout label="Probe speed" value={inside ? "inside body" : `${fmt(pSpeed * U, 4)} m/s`} accent="#8b4fd8" />
            <Readout label="Probe p − p∞" value={inside ? "—" : `${fmt(0.5 * fluid.density * U * U * pCp, 4)} Pa (Cp ${fmt(pCp, 3)})`} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            Real cylinders shed vortices and have drag; this inviscid model describes the flow well only upstream and near the front surface. For |s| &gt; 1 the stagnation point detaches into the fluid, above the body for anticlockwise circulation and below it for clockwise.
          </p>
          <button className="qp-btn" onClick={() => log("Fluid Dynamics: Flow Past a Cylinder", `${fluid.label}, U=${U} m/s, a=${a.toFixed(2)} m, Γ/(4πaU)=${s.toFixed(2)}`, `lift=${fmt(lift, 4)} N/m, Cl=${fmt(Cl, 3)}, drag=0, peak surface speed ${fmt(vmax, 3)} m/s, min Cp=${fmt(cpMin, 3)}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
