import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import PipeViewport from "./PipeViewport";
import FlowChart from "./FlowChart";
import { FLUIDS, solvePipeFlow, samplePipeProfile } from "../../physics/fluidDynamics";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const REGIME_COLOR = { laminar: "#4fd8e0", transitional: "#f2a94e", turbulent: "#ef5b6f" };

export default function FluidLab() {
  const { log } = useApp();
  const [fluidKey, setFluidKey] = useState("water");
  const [d1, setD1] = useState(0.10); // inlet diameter, m
  const [constrictionRatio, setConstrictionRatio] = useState(0.55); // d2 / d1
  const [v1, setV1] = useState(1.2); // inlet velocity, m/s
  const [P1kPa, setP1kPa] = useState(101.3);

  const fluid = FLUIDS.find((f) => f.key === fluidKey) || FLUIDS[0];
  const d2 = d1 * constrictionRatio;

  const solved = useMemo(
    () => solvePipeFlow({ v1, d1, d2, P1: P1kPa * 1000, fluid }),
    [v1, d1, d2, P1kPa, fluid]
  );

  const profile = useMemo(
    () => samplePipeProfile(solved, d1, d2, fluid.density, 60).map((p) => ({ ...p, Pkpa: p.P / 1000 })),
    [solved, d1, d2, fluid]
  );

  // Continuous turbulence intensity (0..1) at the throat, for the flow-line visualization —
  // smoothly ramps across the laminar→transitional→turbulent range rather than snapping.
  const turbulence = Math.max(0, Math.min(1, (solved.Re2 - 2300) / (4000 - 2300)));
  const regimeColor = REGIME_COLOR[solved.regime2];

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Narrow the pipe and the fluid must speed up (continuity) — watch the
          pressure drop at the throat (Bernoulli) and the flow turn turbulent past a critical
          Reynolds number.
        </p>
        <HUD label={`PIPE FLOW · ${fluid.label.toUpperCase()} · ${solved.regime2.toUpperCase()}`}>
          <PipeViewport d1={d1} d2={d2} v1={v1} turbulence={turbulence} color={regimeColor} />
        </HUD>
        <FlowChart data={profile} />
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Fluid</h4>
          <div className="qp-chip-row">
            {FLUIDS.map((f) => (
              <button key={f.key} className={"qp-chip" + (f.key === fluidKey ? " active" : "")} onClick={() => setFluidKey(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="qp-card">
          <h4>Pipe &amp; flow controls</h4>
          <div className="qp-slider-row">
            <label>Inlet diameter d₁ = {(d1 * 100).toFixed(1)} cm</label>
            <input type="range" min={0.03} max={0.25} step={0.005} value={d1} className="qp-slider" onChange={(e) => setD1(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Constriction ratio d₂/d₁ = {constrictionRatio.toFixed(2)} (throat = {(d2 * 100).toFixed(1)} cm)</label>
            <input type="range" min={0.25} max={1} step={0.01} value={constrictionRatio} className="qp-slider" onChange={(e) => setConstrictionRatio(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Inlet velocity v₁ = {v1.toFixed(2)} m/s</label>
            <input type="range" min={0.05} max={6} step={0.05} value={v1} className="qp-slider" onChange={(e) => setV1(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Inlet pressure P₁ = {P1kPa.toFixed(1)} kPa</label>
            <input type="range" min={101.3} max={500} step={1} value={P1kPa} className="qp-slider" onChange={(e) => setP1kPa(Number(e.target.value))} />
          </div>
        </div>

        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Inlet velocity v₁" value={`${fmt(solved.v1, 3)} m/s`} />
            <Readout label="Throat velocity v₂" value={`${fmt(solved.v2, 3)} m/s`} accent="#4fd8e0" />
            <Readout label="Throat pressure P₂" value={`${fmt(solved.P2 / 1000, 3)} kPa`} accent="#f2a94e" />
            <Readout label="Volumetric flow Q" value={`${fmt(solved.Q * 1000, 3)} L/s`} />
            <Readout label="Reynolds number (throat)" value={fmt(solved.Re2, 0)} />
            <Readout label="Flow regime" value={solved.regime2} accent={regimeColor} />
          </div>
          <button
            className="qp-btn"
            onClick={() =>
              log(
                "Fluid Dynamics",
                `${fluid.label}, d₂/d₁=${constrictionRatio.toFixed(2)}, v₁=${fmt(v1, 2)} m/s`,
                `v₂=${fmt(solved.v2, 2)} m/s, P₂=${fmt(solved.P2 / 1000, 2)} kPa, Re=${fmt(solved.Re2, 0)} (${solved.regime2})`
              )
            }
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
