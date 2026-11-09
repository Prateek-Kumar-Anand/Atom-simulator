import React, { useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, Arrow, pathD } from "../math/MathPlot";
import { FLUIDS_EXT, fluidByKey, poiseuille, poiseuilleProfile } from "../../physics/hydro";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

export default function PoiseuilleLab() {
  const { log } = useApp();
  const [fk, setFk] = useState("water");
  const [Rmm, setRmm] = useState(1);
  const [Lm, setLm] = useState(0.5);
  const [dP, setDP] = useState(100);
  const fluid = fluidByKey(fk);
  const R = Rmm / 1000;
  const P = poiseuille(fluid.viscosity, fluid.density, R, Lm, dP);
  const turbulent = !P.laminar;
  const vm = Math.max(P.vmax, 1e-12);
  const prof = Array.from({ length: 81 }, (_, i) => { const r = -R + (2 * R * i) / 80; return [poiseuilleProfile(fluid.viscosity, R, Lm, dP, r), r * 1000]; });
  const Rmax = 5;
  const qAt = (rm) => poiseuille(fluid.viscosity, fluid.density, rm / 1000, Lm, dP).Q * 1e6;
  const qc = Array.from({ length: 61 }, (_, i) => { const rm = 0.2 + (i / 60) * (Rmax - 0.2); return [rm, qAt(rm)]; });
  const dbl = Rmm * 2 <= Rmax;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Slow, viscous flow through a narrow tube is driven by a pressure drop ΔP and held back by wall friction. The velocity profile is a parabola, fastest at the centre and zero at the wall.
          The flow rate is Q = πR⁴ΔP / 8μL — strikingly sensitive to the radius: double R and Q rises sixteen-fold. The formula only holds while the flow stays laminar (Re ≲ 2300).
        </p>
        {turbulent && <div className="qp-card" style={{ borderColor: "rgba(220,59,84,0.5)", background: "rgba(220,59,84,0.07)" }}><strong style={{ color: "#dc3b54" }}>⚠ Re = {fmt(P.Re, 0)} — turbulent.</strong> Poiseuille’s law no longer applies; the real flow would be much lower than shown. Reduce ΔP or the radius.</div>}
        <div className="qp-card">
          <h4>Velocity profile across the pipe</h4>
          <MathPlot xr={[0, 1]} yr={[-Rmm * 1.15, Rmm * 1.15]} height={270} grid={false} axes={false} yLabel="r (mm)" label="Parabolic velocity profile">
            {({ X, Y, W }) => {
              const x0 = X(0.12), len = X(0.78) - X(0.12);
              const rows = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map((f) => f * Rmm);
              return (
                <>
                  <rect x={0} y={Y(Rmm * 1.15)} width={W} height={Y(Rmm) - Y(Rmm * 1.15)} fill="rgba(100,116,139,0.22)" />
                  <rect x={0} y={Y(-Rmm)} width={W} height={Y(-Rmm * 1.15) - Y(-Rmm)} fill="rgba(100,116,139,0.22)" />
                  <line x1={0} x2={W} y1={Y(Rmm)} y2={Y(Rmm)} stroke={PLOT.ink} strokeWidth={2.5} />
                  <line x1={0} x2={W} y1={Y(-Rmm)} y2={Y(-Rmm)} stroke={PLOT.ink} strokeWidth={2.5} />
                  {rows.map((r, i) => { const vv = poiseuilleProfile(fluid.viscosity, R, Lm, dP, r / 1000); return vv > 1e-12 * vm ? <Arrow key={i} x1={x0} y1={Y(r)} x2={x0 + (vv / vm) * len} y2={Y(r)} color={PLOT.teal} width={2.2} /> : null; })}
                  <path d={prof.map(([v, r], i) => `${i ? "L" : "M"}${(x0 + (v / vm) * len).toFixed(1)},${Y(r).toFixed(1)}`).join("")} fill="none" stroke={PLOT.red} strokeWidth={2.4} />
                  <text x={x0 + len + 8} y={Y(0) + 4} fontSize={11} fill={PLOT.red}>v_max = {fmt(P.vmax, 3)} m/s</text>
                  <text x={W - 8} y={Y(Rmm) + 15} fontSize={11} textAnchor="end" fill={PLOT.text}>wall (v = 0)</text>
                </>
              );
            }}
          </MathPlot>
        </div>
        <div className="qp-card">
          <h4>Flow rate Q versus radius (fourth-power law)</h4>
          <MathPlot xr={[0, Rmax]} yr={[0, qAt(Rmax) * 1.05]} height={220} xLabel="R (mm)" yLabel="Q (mL/s)" label="Flow rate versus radius">
            {({ X, Y }) => (
              <>
                <path d={pathD(qc, X, Y)} fill="none" stroke={PLOT.teal} strokeWidth={2.4} />
                <circle cx={X(Rmm)} cy={Y(qAt(Rmm))} r={5.5} fill={PLOT.red} stroke="#fff" strokeWidth={1.5} />
                {dbl && <circle cx={X(Rmm * 2)} cy={Y(qAt(Rmm * 2))} r={5.5} fill="none" stroke={PLOT.violet} strokeWidth={2} />}
              </>
            )}
          </MathPlot>
          {dbl && <p className="qp-muted small" style={{ margin: "6px 0 0" }}><span style={{ color: PLOT.red }}>●</span> now &nbsp; <span style={{ color: PLOT.violet }}>○</span> radius doubled → Q × 16</p>}
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Pipe and fluid</h4>
          <div className="qp-slider-row">
            <label>Fluid</label>
            <select className="qp-select" value={fk} onChange={(e) => setFk(e.target.value)}>
              {FLUIDS_EXT.map((f) => <option key={f.key} value={f.key}>{f.label} (μ = {f.viscosity.toExponential(2)} Pa·s)</option>)}
            </select>
          </div>
          <Slider label="Radius R" value={Rmm} min={0.2} max={5} step={0.1} onChange={setRmm} format={(x) => `${x.toFixed(1)} mm`} />
          <Slider label="Length L" value={Lm} min={0.1} max={2} step={0.1} onChange={setLm} format={(x) => `${x.toFixed(1)} m`} />
          <Slider label="Pressure drop ΔP" value={dP} min={10} max={2000} step={10} onChange={setDP} format={(x) => `${x} Pa`} />
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Flow rate Q" value={`${fmt(P.Q * 1e6, 4)} mL/s`} accent="#0e8ea3" />
            <Readout label="Mean speed" value={`${fmt(P.vavg, 4)} m/s`} />
            <Readout label="Centre speed (2× mean)" value={`${fmt(P.vmax, 4)} m/s`} accent="#dc3b54" />
            <Readout label="Wall shear stress" value={`${fmt(P.tauWall, 4)} Pa`} accent="#c2740a" />
            <Readout label="Reynolds number" value={fmt(P.Re, 0)} />
            <Readout label="Regime" value={P.laminar ? "laminar ✓" : "turbulent ⚠"} accent={P.laminar ? "#1f9d57" : "#dc3b54"} />
          </div>
          <button className="qp-btn" onClick={() => log("Fluid Dynamics: Poiseuille Flow", `${fluid.label}, R=${Rmm.toFixed(1)} mm, L=${Lm.toFixed(1)} m, ΔP=${dP} Pa`, `Q=${fmt(P.Q * 1e6, 4)} mL/s, v̄=${fmt(P.vavg, 4)} m/s, τ_wall=${fmt(P.tauWall, 4)} Pa, Re=${fmt(P.Re, 0)} (${P.laminar ? "laminar" : "turbulent — law invalid"})`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
