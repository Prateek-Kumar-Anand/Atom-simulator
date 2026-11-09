import React, { useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, Arrow, pathD } from "../math/MathPlot";
import { FLUIDS_EXT, fluidByKey, buoyancy, hydrostaticPressure, G } from "../../physics/hydro";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const TANK = 2; // m
const MATERIALS = [
  { label: "Cork", rho: 240 }, { label: "Pine wood", rho: 500 }, { label: "Ice", rho: 917 }, { label: "Oak", rho: 750 },
  { label: "Concrete", rho: 2400 }, { label: "Aluminium", rho: 2700 }, { label: "Iron", rho: 7870 }, { label: "Lead", rho: 11340 },
];

export default function BuoyancyLab() {
  const { log } = useApp();
  const [fk, setFk] = useState("water");
  const [rhoObj, setRhoObj] = useState(500);
  const [side, setSide] = useState(0.5);
  const [probe, setProbe] = useState(1);
  const fluid = fluidByKey(fk);
  const b = buoyancy(fluid.density, rhoObj, side);
  const bottom = b.floats ? -b.draft : -TANK;
  const top = bottom + side;
  const Pprobe = hydrostaticPressure(fluid.density, probe);
  const Pdeep = hydrostaticPressure(fluid.density, TANK);
  const Fmax = Math.max(b.W, b.Fb, 1e-9);
  const curve = [[hydrostaticPressure(fluid.density, 0) / 1000, 0], [Pdeep / 1000, -TANK]];

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Pressure grows linearly with depth, P = P₀ + ρgh. A submerged body feels more pressure underneath than on top: the difference is the
          buoyant force ρ<sub>fluid</sub>·g·V<sub>displaced</sub> (Archimedes). A block floats when its average density is below the fluid’s — and then sits with the fraction ρ<sub>obj</sub>/ρ<sub>fluid</sub> submerged.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div className="qp-card" style={{ flex: "2 1 340px" }}>
            <h4>{b.floats ? "Block floats" : "Block sinks"} in {fluid.label.toLowerCase()}</h4>
            <MathPlot xr={[-1.2, 3.2]} yr={[-TANK, 1.1]} square grid={false} axes={false} yTicks label="Block in a tank">
              {({ X, Y }) => {
                const cxm = 1, half = side / 2;
                const arrow = (f) => 12 + (f / Fmax) * 78;
                const mid = Y((top + bottom) / 2);
                return (
                  <>
                    <rect x={X(0)} y={Y(0)} width={X(2) - X(0)} height={Y(-TANK) - Y(0)} fill="rgba(59,111,216,0.14)" />
                    <line x1={X(0)} x2={X(2)} y1={Y(0)} y2={Y(0)} stroke={PLOT.blue} strokeWidth={2} />
                    <path d={`M${X(0)},${Y(1.1)} V${Y(-TANK)} H${X(2)} V${Y(1.1)}`} fill="none" stroke={PLOT.ink} strokeWidth={2.5} />
                    <rect x={X(cxm - half)} y={Y(top)} width={X(cxm + half) - X(cxm - half)} height={Y(bottom) - Y(top)} rx={3} fill="rgba(194,116,10,0.55)" stroke={PLOT.amber} strokeWidth={2} />
                    <Arrow x1={X(cxm)} y1={mid} x2={X(cxm)} y2={mid + arrow(b.W)} color={PLOT.red} width={3} />
                    <Arrow x1={X(cxm)} y1={mid} x2={X(cxm)} y2={mid - arrow(b.Fb)} color={PLOT.green} width={3} />
                    <text x={X(cxm) + 10} y={mid + arrow(b.W) - 2} fontSize={11} fill={PLOT.red}>weight</text>
                    <text x={X(cxm) + 10} y={mid - arrow(b.Fb) + 10} fontSize={11} fill={PLOT.green}>buoyancy</text>
                    <line x1={X(0.1)} x2={X(0.1)} y1={Y(0)} y2={Y(-probe)} stroke={PLOT.ink} strokeDasharray="3 3" />
                    <circle cx={X(0.1)} cy={Y(-probe)} r={5} fill={PLOT.ink} stroke="#fff" strokeWidth={1.5} />
                    <text x={X(0.1) + 8} y={Y(-probe) + 4} fontSize={11} fill={PLOT.ink}>{fmt(probe, 3)} m</text>
                  </>
                );
              }}
            </MathPlot>
          </div>
          <div className="qp-card" style={{ flex: "1 1 220px" }}>
            <h4>Pressure versus depth</h4>
            <MathPlot xr={[0, Pdeep / 1000 * 1.08]} yr={[-TANK, 0.08]} height={300} xLabel="P (kPa)" yLabel="depth (m)" label="Hydrostatic pressure profile">
              {({ X, Y }) => (
                <>
                  <path d={pathD(curve, X, Y)} fill="none" stroke={PLOT.teal} strokeWidth={2.4} />
                  <circle cx={X(Pprobe / 1000)} cy={Y(-probe)} r={5.5} fill={PLOT.ink} stroke="#fff" strokeWidth={1.5} />
                </>
              )}
            </MathPlot>
          </div>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Fluid and block</h4>
          <div className="qp-slider-row">
            <label>Fluid</label>
            <select className="qp-select" value={fk} onChange={(e) => setFk(e.target.value)}>
              {FLUIDS_EXT.map((f) => <option key={f.key} value={f.key}>{f.label} ({fmt(f.density, 4)} kg/m³)</option>)}
            </select>
          </div>
          <div className="qp-chip-row" style={{ marginBottom: 10 }}>
            {MATERIALS.map((m) => <button key={m.label} className={"qp-chip" + (m.rho === rhoObj ? " active" : "")} onClick={() => setRhoObj(m.rho)}>{m.label}</button>)}
          </div>
          <Slider label="Block density" value={rhoObj} min={100} max={12000} step={10} onChange={setRhoObj} format={(v) => `${v} kg/m³`} />
          <Slider label="Block side s" value={side} min={0.1} max={1} step={0.05} onChange={setSide} format={(v) => `${v.toFixed(2)} m`} />
          <Slider label="Probe depth" value={probe} min={0} max={TANK} step={0.05} onChange={setProbe} format={(v) => `${v.toFixed(2)} m`} />
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Weight mg" value={`${fmt(b.W, 4)} N`} accent="#dc3b54" />
            <Readout label="Buoyant force" value={`${fmt(b.Fb, 4)} N`} accent="#1f9d57" />
            <Readout label={b.floats ? "Submerged fraction" : "Apparent weight"} value={b.floats ? `${fmt(b.subFrac * 100, 4)} % (draft ${fmt(b.draft, 3)} m)` : `${fmt(b.apparent, 4)} N`} accent="#c2740a" />
            <Readout label="Verdict" value={b.floats ? "floats" : "sinks"} />
            <Readout label={`Absolute P at ${fmt(probe, 3)} m`} value={`${fmt(Pprobe / 1000, 5)} kPa`} accent="#0e8ea3" />
            <Readout label="Gauge ρgh" value={`${fmt(fluid.density * G * probe / 1000, 4)} kPa`} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            {b.floats ? "Floating: weight = buoyancy, so the net force is zero." : "A sinking block weighs less in the fluid by exactly the weight of the fluid it displaces (apparent weight)."}
          </p>
          <button className="qp-btn" onClick={() => log("Fluid Dynamics: Buoyancy", `${fluid.label}, block ρ=${rhoObj} kg/m³, s=${side.toFixed(2)} m, probe ${probe.toFixed(2)} m`, `${b.floats ? `floats, ${fmt(b.subFrac * 100, 4)} % submerged` : `sinks, apparent weight ${fmt(b.apparent, 4)} N`}, Fb=${fmt(b.Fb, 4)} N, P=${fmt(Pprobe / 1000, 5)} kPa`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
