import React, { useEffect, useMemo, useRef, useState } from "react";
import { Info, Play, Pause, RotateCcw } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import ThermoViewport from "./ThermoViewport";
import PVChart from "./PVChart";
import MaxwellBoltzmannChart from "./MaxwellBoltzmannChart";
import { GASES, PROCESSES, PRESETS, computeProcess, stateAtT, samplePath } from "../../physics/thermodynamics";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const BASE_HEIGHT = 3;
const PROCESS_COLOR = { isothermal: "#4fd8e0", isobaric: "#f2a94e", isochoric: "#c084fc", adiabatic: "#ef5b6f" };

export default function ThermoLab() {
  const { log } = useApp();
  const [processKey, setProcessKey] = useState("isothermal");
  const [gasKey, setGasKey] = useState("diatomic");
  const [n, setN] = useState(1);
  const [T1, setT1] = useState(300);
  const [V1L, setV1L] = useState(5);
  const [control, setControl] = useState(2);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);

  const gas = GASES.find((g) => g.key === gasKey) || GASES[1];
  const isochoric = processKey === "isochoric";
  const color = PROCESS_COLOR[processKey];

  const state1 = useMemo(() => {
    const V = V1L / 1000; // L -> m^3
    const P = (n * 8.314 * T1) / V;
    return { P, V, T: T1 };
  }, [n, T1, V1L]);

  const process = useMemo(
    () => computeProcess(processKey, gas.gamma, n, state1, control),
    [processKey, gas.gamma, n, state1, control]
  );

  const current = useMemo(
    () => stateAtT(processKey, process.state1, process.state2, process.gamma, t),
    [processKey, process, t]
  );

  const path = useMemo(
    () => samplePath(processKey, process.state1, process.state2, process.gamma, 48),
    [processKey, process]
  );

  // Play button animates t from 0 -> 1 over ~3 seconds, then stops.
  const timerRef = useRef(null);
  useEffect(() => {
    if (!playing) return undefined;
    const start = performance.now();
    const duration = 3000;
    timerRef.current = setInterval(() => {
      const elapsed = performance.now() - start;
      const nextT = Math.min(1, elapsed / duration);
      setT(nextT);
      if (nextT >= 1) setPlaying(false);
    }, 60);
    return () => clearInterval(timerRef.current);
  }, [playing]);

  const runProcess = () => { setT(0); setPlaying(true); };
  const reset = () => { setPlaying(false); setT(0); };
  const applyPreset = (p) => { setN(p.n); setT1(p.T1); setV1L(p.V1L); reset(); };

  const height = BASE_HEIGHT * (current.V / state1.V);
  const temperatureFactor = current.T / state1.T;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Set an initial gas state, pick a process, then run it — the piston
          moves with volume and the molecules speed up or slow down with temperature.
        </p>
        <HUD label={`${PROCESSES.find((p) => p.key === processKey).label.toUpperCase()} · ${gas.label.split(" ")[0].toUpperCase()} GAS`}>
          <ThermoViewport height={Math.max(0.4, height)} temperatureFactor={temperatureFactor} color={color} />
        </HUD>
        <PVChart path={path} current={current} color={color} />
        <MaxwellBoltzmannChart molarMass={gas.molarMass} T={current.T} color={color} />
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Experiment presets</h4>
          <div className="qp-chip-row">
            {PRESETS.map((p) => (
              <button key={p.key} className="qp-chip" onClick={() => applyPreset(p)} title={`n=${p.n} mol, T=${p.T1} K, V=${p.V1L} L`}>
                {p.label}
              </button>
            ))}
          </div>
          <h4>Process</h4>
          <div className="qp-chip-row">
            {PROCESSES.map((p) => (
              <button
                key={p.key}
                className={"qp-chip" + (p.key === processKey ? " active" : "")}
                onClick={() => { setProcessKey(p.key); reset(); }}
                title={p.detail}
              >
                {p.label}
              </button>
            ))}
          </div>
          <h4>Gas type</h4>
          <div className="qp-chip-row">
            {GASES.map((g) => (
              <button key={g.key} className={"qp-chip" + (g.key === gasKey ? " active" : "")} onClick={() => setGasKey(g.key)}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="qp-card">
          <h4>Initial state</h4>
          <div className="qp-slider-row">
            <label>Moles n = {n.toFixed(1)} mol</label>
            <input type="range" min={0.5} max={3} step={0.1} value={n} className="qp-slider" onChange={(e) => setN(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Temperature T₁ = {T1} K</label>
            <input type="range" min={150} max={600} step={10} value={T1} className="qp-slider" onChange={(e) => setT1(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Volume V₁ = {V1L.toFixed(1)} L</label>
            <input type="range" min={1} max={10} step={0.1} value={V1L} className="qp-slider" onChange={(e) => setV1L(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>{isochoric ? `Final temperature ratio T₂/T₁ = ${control.toFixed(2)}` : `Final volume ratio V₂/V₁ = ${control.toFixed(2)}`}</label>
            <input type="range" min={0.3} max={3} step={0.05} value={control} className="qp-slider" onChange={(e) => { setControl(Number(e.target.value)); reset(); }} />
          </div>
          <div className="qp-slider-row">
            <label>Progress along process = {(t * 100).toFixed(0)}%</label>
            <input type="range" min={0} max={1} step={0.01} value={t} className="qp-slider" onChange={(e) => { setPlaying(false); setT(Number(e.target.value)); }} />
          </div>
          <div className="qp-btn-row">
            <button className="qp-btn qp-btn-primary" onClick={runProcess}>
              {playing ? <Pause size={14} /> : <Play size={14} />} Run process
            </button>
            <button className="qp-btn" onClick={reset}><RotateCcw size={14} /> Reset</button>
          </div>
        </div>

        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="P₁, V₁, T₁" value={`${fmt(process.state1.P / 1000, 2)} kPa, ${fmt(process.state1.V * 1000, 2)} L, ${fmt(process.state1.T, 3)} K`} />
            <Readout label="P₂, V₂, T₂" value={`${fmt(process.state2.P / 1000, 2)} kPa, ${fmt(process.state2.V * 1000, 2)} L, ${fmt(process.state2.T, 3)} K`} />
            <Readout label="Work done by gas (W)" value={`${fmt(process.W, 3)} J`} accent="#f2a94e" />
            <Readout label="Change in internal energy (ΔU)" value={`${fmt(process.dU, 3)} J`} />
            <Readout label="Heat transferred (Q)" value={`${fmt(process.Q, 3)} J`} accent="#4fd8e0" />
            <Readout label="Heat capacity ratio γ" value={fmt(process.gamma, 3)} />
          </div>
          <button
            className="qp-btn"
            onClick={() =>
              log(
                "Thermodynamics",
                `${PROCESSES.find((p) => p.key === processKey).label} · ${gas.label}`,
                `W=${fmt(process.W, 3)} J, ΔU=${fmt(process.dU, 3)} J, Q=${fmt(process.Q, 3)} J`
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
