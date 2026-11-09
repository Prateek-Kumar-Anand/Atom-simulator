import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, pathD } from "../math/MathPlot";
import { FLUIDS_EXT, fluidByKey, sphereCd, stokesTerminal, terminalVelocity, fallAcceleration, simulateFall } from "../../physics/hydro";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const PRESETS = [
  { label: "Steel ball in glycerin", fk: "glycerin", rho: 7850, dmm: 5 },
  { label: "Marble in water", fk: "water", rho: 2600, dmm: 16 },
  { label: "Sand grain in water", fk: "water", rho: 2650, dmm: 0.2 },
  { label: "Raindrop in air", fk: "air", rho: 998, dmm: 2 },
  { label: "Ball bearing in honey", fk: "honey", rho: 7850, dmm: 3 },
  { label: "Hailstone in air", fk: "air", rho: 900, dmm: 20 },
];

export default function DragLab() {
  const { log } = useApp();
  const [fk, setFk] = useState("glycerin");
  const [rho, setRho] = useState(7850);
  const [logd, setLogd] = useState(Math.log10(5));
  const dmm = Math.pow(10, logd), d = dmm / 1000;
  const fluid = fluidByKey(fk);
  const mu = fluid.viscosity, rf = fluid.density;
  const sinks = rho > rf;

  const calc = useMemo(() => {
    if (!sinks) return null;
    const vt = terminalVelocity(d, rho, rf, mu);
    const vs = stokesTerminal(rho, rf, d, mu);
    const a0 = fallAcceleration(0, d, rho, rf, mu);
    const tau = vt / a0;
    const tEnd = 5 * tau;
    const traj = simulateFall(d, rho, rf, mu, tEnd, 240);
    const t99 = (traj.find((p) => p.v >= 0.99 * vt) || traj[traj.length - 1]).t;
    const Re = (rf * vt * d) / mu;
    return { vt, vs, tEnd, traj, t99, Re, Cd: sphereCd(Re), dist: traj[traj.length - 1].y };
  }, [d, rho, rf, mu, sinks]);

  const cdCurve = Array.from({ length: 141 }, (_, i) => { const lr = -2 + (i / 140) * 8; return [lr, Math.log10(sphereCd(Math.pow(10, lr)))]; });
  const stokesLine = [[-2, Math.log10(24 / 0.01)], [3, Math.log10(24 / 1000)]];
  const tU = calc && calc.tEnd < 1 ? (calc.tEnd < 0.01 ? { k: 1e6, u: "µs" } : { k: 1e3, u: "ms" }) : { k: 1, u: "s" };
  const regime = !calc ? "—" : calc.Re < 1 ? "Stokes (creeping)" : calc.Re < 1000 ? "intermediate" : "Newton (quadratic drag)";

  const pick = (p) => { setFk(p.fk); setRho(p.rho); setLogd(Math.log10(p.dmm)); };

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> A sphere released in a fluid speeds up until drag plus buoyancy balance its weight: the terminal velocity. At low Reynolds number drag is linear in speed (Stokes: F = 3πμdv) and v<sub>t</sub> = (ρₛ − ρ<sub>f</sub>)gd²/18μ.
          At high Re drag grows as v² and the Stokes formula badly overestimates the speed. The solver uses the full Schiller–Naumann drag law plus added mass.
        </p>
        <div className="qp-btn-row" style={{ flexWrap: "wrap" }}>
          {PRESETS.map((p) => <button key={p.label} className="qp-chip" onClick={() => pick(p)}>{p.label}</button>)}
        </div>
        {!sinks && <div className="qp-card" style={{ borderColor: "rgba(194,116,10,0.5)", background: "rgba(194,116,10,0.08)" }}>The sphere is <strong>lighter than the fluid</strong> (ρ ≤ ρ_fluid), so it rises instead of sinking. Choose a denser sphere.</div>}
        {calc && (
          <>
            <div className="qp-card">
              <h4>Speed versus time after release</h4>
              <MathPlot xr={[0, calc.tEnd * tU.k]} yr={[0, Math.max(calc.vt, calc.vs) * 1.1]} height={250} xLabel={`t (${tU.u})`} yLabel="v (m/s)" label="Falling speed versus time">
                {({ X, Y, W }) => (
                  <>
                    <line x1={0} x2={W} y1={Y(calc.vt)} y2={Y(calc.vt)} stroke={PLOT.amber} strokeDasharray="6 4" strokeWidth={1.6} />
                    <line x1={0} x2={W} y1={Y(calc.vs)} y2={Y(calc.vs)} stroke={PLOT.violet} strokeDasharray="2 4" strokeWidth={1.6} />
                    <path d={pathD(calc.traj.map((p) => [p.t * tU.k, p.v]), X, Y)} fill="none" stroke={PLOT.teal} strokeWidth={2.6} />
                    <text x={W - 6} y={Y(calc.vt) + 14} fontSize={11} textAnchor="end" fill={PLOT.amber}>terminal v_t</text>
                    <text x={W - 6} y={Y(calc.vs) - 5} fontSize={11} textAnchor="end" fill={PLOT.violet}>Stokes prediction</text>
                  </>
                )}
              </MathPlot>
            </div>
            <div className="qp-card">
              <h4>Drag coefficient versus Reynolds number</h4>
              <MathPlot xr={[-2, 6]} yr={[-1, 4.2]} height={240} xLabel="log₁₀ Re" yLabel="log₁₀ Cd" label="Sphere drag curve">
                {({ X, Y }) => (
                  <>
                    <path d={pathD(stokesLine, X, Y)} fill="none" stroke={PLOT.violet} strokeDasharray="5 4" strokeWidth={1.6} />
                    <path d={pathD(cdCurve, X, Y)} fill="none" stroke={PLOT.teal} strokeWidth={2.4} />
                    <circle cx={X(Math.log10(calc.Re))} cy={Y(Math.log10(calc.Cd))} r={6} fill={PLOT.red} stroke="#fff" strokeWidth={1.5} />
                  </>
                )}
              </MathPlot>
              <p className="qp-muted small" style={{ margin: "6px 0 0" }}><span style={{ color: PLOT.violet }}>- -</span> Stokes Cd = 24/Re &nbsp; <span style={{ color: PLOT.red }}>●</span> your sphere at terminal speed</p>
            </div>
          </>
        )}
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Sphere and fluid</h4>
          <div className="qp-slider-row">
            <label>Fluid</label>
            <select className="qp-select" value={fk} onChange={(e) => setFk(e.target.value)}>
              {FLUIDS_EXT.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </div>
          <Slider label="Diameter" value={logd} min={-1} max={2} step={0.05} onChange={setLogd} format={() => `${dmm < 1 ? dmm.toFixed(2) : dmm.toFixed(1)} mm`} />
          <Slider label="Sphere density" value={rho} min={200} max={12000} step={50} onChange={setRho} format={(x) => `${x} kg/m³`} />
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Terminal speed v_t" value={calc ? `${fmt(calc.vt, 4)} m/s` : "rises"} accent="#0e8ea3" />
            <Readout label="Stokes formula" value={calc ? `${fmt(calc.vs, 4)} m/s` : "—"} accent="#8b4fd8" />
            <Readout label="Stokes ÷ actual" value={calc ? `${fmt(calc.vs / calc.vt, 3)}×` : "—"} />
            <Readout label="Reynolds number" value={calc ? fmt(calc.Re, 3) : "—"} />
            <Readout label="Drag coefficient Cd" value={calc ? fmt(calc.Cd, 3) : "—"} />
            <Readout label="Time to 99 % of v_t" value={calc ? `${fmt(calc.t99, 3)} s` : "—"} accent="#c2740a" />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>Regime: <strong>{regime}</strong>. {calc && calc.Re > 1 ? "Stokes’ law is only valid for Re ≲ 1, so it overestimates the speed here." : "Stokes’ law is accurate here (ratio ≈ 1)."}</p>
          <button className="qp-btn" disabled={!calc} onClick={() => calc && log("Fluid Dynamics: Drag & Terminal Velocity", `${fluid.label}, sphere ⌀${dmm.toFixed(2)} mm, ρ=${rho} kg/m³`, `v_t=${fmt(calc.vt, 4)} m/s (Stokes ${fmt(calc.vs, 4)}), Re=${fmt(calc.Re, 3)}, Cd=${fmt(calc.Cd, 3)}, ${regime}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
