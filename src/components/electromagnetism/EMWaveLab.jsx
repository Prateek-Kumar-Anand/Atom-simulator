import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Info } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import EMWaveViewport from "./EMWaveViewport";
import { sampleEMWave, SPEED_OF_LIGHT_DERIVED, MU0, EPS0 } from "../../physics/electromagnetism";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

export default function EMWaveLab() {
  const { log } = useApp();
  const [wavelengthNm, setWavelengthNm] = useState(500);
  const [amplitude, setAmplitude] = useState(1.2);
  const [speedFactor, setSpeedFactor] = useState(2);

  const frequency = SPEED_OF_LIGHT_DERIVED / (wavelengthNm * 1e-9);
  const chartData = useMemo(
    () => sampleEMWave({ amplitude, wavelengthM: 1, t: 0, length: 4, steps: 120 }).map((p) => ({ z: p.z.toFixed(2), E: p.E, B: p.B })),
    [amplitude]
  );
  const wavelengthFrac = 0.28; // fixed visual cycle density independent of the physical nm value, for a readable viewport

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> The electric field (cyan) and magnetic field (amber) oscillate
          perpendicular to each other and to the direction of travel — a self-propagating wave
          that needs no medium.
        </p>
        <HUD label="EM WAVE PROPAGATION">
          <EMWaveViewport amplitude={amplitude} wavelengthFrac={wavelengthFrac} speedFactor={speedFactor} />
        </HUD>
        <div className="qp-card">
          <h4>Field profile snapshot (E ⊥ B ⊥ propagation)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 6, right: 12, left: 0, bottom: 6 }}>
              <CartesianGrid stroke="#1f2b3a" />
              <XAxis dataKey="z" stroke="#7c8a9c" tick={{ fontSize: 10 }} label={{ value: "Position along propagation axis", position: "insideBottom", offset: -4, fill: "#7c8a9c", fontSize: 10 }} />
              <YAxis stroke="#7c8a9c" tick={{ fontSize: 10 }} width={30} />
              <Tooltip contentStyle={{ background: "#0d131c", border: "1px solid #1f2b3a", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="E" name="Electric field E" stroke="#4fd8e0" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="B" name="Magnetic field B" stroke="#f2a94e" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Wave controls</h4>
          <div className="qp-slider-row">
            <label>Wavelength λ = {wavelengthNm} nm</label>
            <input type="range" min={100} max={900} step={10} value={wavelengthNm} className="qp-slider" onChange={(e) => setWavelengthNm(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Amplitude = {amplitude.toFixed(2)}</label>
            <input type="range" min={0.3} max={2.2} step={0.1} value={amplitude} className="qp-slider" onChange={(e) => setAmplitude(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Animation speed = {speedFactor.toFixed(1)}×</label>
            <input type="range" min={0.5} max={5} step={0.5} value={speedFactor} className="qp-slider" onChange={(e) => setSpeedFactor(Number(e.target.value))} />
          </div>
        </div>

        <div className="qp-card">
          <h4>c = 1/√(μ₀ε₀)</h4>
          <div className="qp-readout-grid">
            <Readout label="Speed of light c" value={`${fmt(SPEED_OF_LIGHT_DERIVED, 6)} m/s`} accent="#4fd8e0" />
            <Readout label="μ₀" value={`${fmt(MU0, 4)} T·m/A`} />
            <Readout label="ε₀" value={`${fmt(EPS0, 4)} F/m`} />
            <Readout label="Frequency f = c/λ" value={`${fmt(frequency / 1e12, 3)} THz`} accent="#f2a94e" />
          </div>
          <button
            className="qp-btn"
            onClick={() => log("Electromagnetism: EM Wave", `λ=${wavelengthNm} nm`, `f=${fmt(frequency / 1e12, 3)} THz, c=${fmt(SPEED_OF_LIGHT_DERIVED, 0)} m/s`)}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
