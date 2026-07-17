import React, { useState } from "react";
import { Info, Play, Pause, RotateCcw } from "lucide-react";
import Readout from "../common/Readout";
import AtomPopulationGrid from "./AtomPopulationGrid";
import DecayChart from "./DecayChart";
import { useDecaySimulation } from "../../hooks/useDecaySimulation";
import { ISOTOPES } from "../../physics/decay";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const DEFAULT_ISO_IDX = ISOTOPES.findIndex((iso) => iso.symbol === "Co");

export default function DecayLab() {
  const { log } = useApp();
  const [isoIdx, setIsoIdx] = useState(DEFAULT_ISO_IDX);
  const [halfLife, setHalfLife] = useState(ISOTOPES[DEFAULT_ISO_IDX].simHalfLife);
  const [atomCount, setAtomCount] = useState(100);
  const [speed, setSpeed] = useState(1);
  const [resetToken, setResetToken] = useState(0);

  const sim = useDecaySimulation({ atomCount, halfLife, speed, resetToken });
  const halfLivesElapsed = sim.elapsed / halfLife;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Each dot represents an atom; it independently decays with a probability
          set by the half-life. Simulation time is compressed to fit real half-lives (from seconds to
          millennia) into a watchable demo.
        </p>
        <AtomPopulationGrid aliveArray={sim.aliveView} />
        <DecayChart data={sim.chartData} />
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Isotope</h4>
          <select
            className="qp-select"
            value={isoIdx}
            onChange={(e) => {
              const i = Number(e.target.value);
              setIsoIdx(i);
              setHalfLife(ISOTOPES[i].simHalfLife);
              setResetToken((x) => x + 1);
            }}
          >
            {ISOTOPES.map((iso, i) => (
              <option key={iso.name} value={i}>Z={iso.Z} {iso.name} (T½ = {iso.real})</option>
            ))}
          </select>
          <div className="qp-slider-row">
            <label>Simulated half-life = {halfLife}s</label>
            <input type="range" min={3} max={40} value={halfLife} onChange={(e) => setHalfLife(Number(e.target.value))} className="qp-slider" />
          </div>
          <div className="qp-slider-row">
            <label>Atom count = {atomCount}</label>
            <input type="range" min={20} max={150} step={10} value={atomCount} onChange={(e) => setAtomCount(Number(e.target.value))} className="qp-slider" />
          </div>
          <div className="qp-slider-row">
            <label>Speed = {speed}×</label>
            <input type="range" min={1} max={5} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="qp-slider" />
          </div>
          <div className="qp-btn-row">
            <button className="qp-btn qp-btn-primary" onClick={() => sim.setPlaying((p) => !p)}>
              {sim.playing ? <Pause size={14} /> : <Play size={14} />} {sim.playing ? "Pause" : "Start"}
            </button>
            <button className="qp-btn" onClick={() => setResetToken((x) => x + 1)}><RotateCcw size={14} /> Reset</button>
          </div>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Remaining atoms" value={`${sim.currentN} / ${atomCount}`} accent="#4fd8e0" />
            <Readout label="Decay constant λ" value={`${fmt(sim.lambda)} /s`} />
            <Readout label="Mean lifetime τ = 1/λ" value={`${fmt(1 / sim.lambda)} s`} />
            <Readout label="Half-lives elapsed" value={fmt(halfLivesElapsed, 2)} />
            <Readout label="Elapsed sim time" value={`${fmt(sim.elapsed, 1)} s`} />
          </div>
          <button
            className="qp-btn"
            onClick={() => log("Radioactive Decay", ISOTOPES[isoIdx].name, `${sim.currentN}/${atomCount} remaining after ${fmt(sim.elapsed, 1)}s (${fmt(halfLivesElapsed, 2)} half-lives)`)}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
