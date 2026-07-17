import React, { useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import PhotoelectricStage from "./PhotoelectricStage";
import { KineticEnergyChart, PhotocurrentChart } from "./PhotoelectricChart";
import { METALS, computePhotoelectric } from "../../physics/photoelectric";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

export default function PhotoelectricLab() {
  const { log } = useApp();
  const [metalIdx, setMetalIdx] = useState(5);
  const [freqTHz, setFreqTHz] = useState(8.5); // ×10^14 Hz
  const [intensity, setIntensity] = useState(60); // %
  const metal = METALS[metalIdx];
  const result = computePhotoelectric(freqTHz * 1e14, metal.phi);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Intensity changes how many photons per second arrive (more electrons),
          but only frequency changes each photon&rsquo;s energy — that&rsquo;s the key photoelectric insight.
        </p>
        <PhotoelectricStage
          photonE={result.photonE}
          intensity={intensity}
          freqTHz={freqTHz}
          emitting={result.emitting}
          KEmax={result.KEmax}
          metalName={metal.name}
        />
        <KineticEnergyChart workFunctionEV={metal.phi} thresholdFreq={result.thresholdFrequency / 1e14} />
        <PhotocurrentChart stoppingV={result.stoppingVoltage} intensity={intensity} />
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Metal surface</h4>
          <div className="qp-chip-row">
            {METALS.map((m, i) => (
              <button key={m.symbol} className={"qp-chip" + (i === metalIdx ? " active" : "")} onClick={() => setMetalIdx(i)}>
                {m.symbol}
              </button>
            ))}
          </div>
          <div className="qp-slider-row">
            <label>Frequency = {freqTHz.toFixed(1)}×10¹⁴ Hz</label>
            <input type="range" min={3} max={13} step={0.1} value={freqTHz} onChange={(e) => setFreqTHz(Number(e.target.value))} className="qp-slider" />
          </div>
          <div className="qp-slider-row">
            <label>Intensity = {intensity}%</label>
            <input type="range" min={0} max={100} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="qp-slider" />
          </div>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Work function φ" value={`${metal.phi} eV`} />
            <Readout label="Photon energy E=hf" value={`${fmt(result.photonE)} eV`} accent="#f2a94e" />
            <Readout label="Threshold frequency f₀" value={`${fmt(result.thresholdFrequency / 1e14)}×10¹⁴ Hz`} />
            <Readout label="Max kinetic energy" value={`${fmt(result.KEmax)} eV`} accent="#4fd8e0" />
            <Readout label="Stopping potential Vs" value={`${fmt(result.stoppingVoltage)} V`} />
            <Readout label="Emission occurring?" value={result.emitting ? "Yes" : "No — below threshold"} />
          </div>
          <button
            className="qp-btn"
            onClick={() => log("Photoelectric Effect", `${metal.name}, f=${freqTHz.toFixed(1)}e14 Hz`, `KEmax=${fmt(result.KEmax)} eV, Vs=${fmt(result.stoppingVoltage)} V`)}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
