import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import MagneticFieldViewport from "./MagneticFieldViewport";
import { wireFieldAt, solenoidFieldInside, MU0 } from "../../physics/electromagnetism";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const SOURCES = [
  { key: "bar", label: "Bar Magnet" },
  { key: "wire", label: "Current-carrying Wire" },
  { key: "solenoid", label: "Solenoid" },
];

export default function MagneticFieldLab() {
  const { log } = useApp();
  const [source, setSource] = useState("bar");
  const [current, setCurrent] = useState(5);
  const [strength, setStrength] = useState(6);
  const [direction, setDirection] = useState(1);
  const [turnsPerCm, setTurnsPerCm] = useState(8);
  const [probeR, setProbeR] = useState(2);

  const wireB = useMemo(() => wireFieldAt(current * direction, probeR, 0), [current, direction, probeR]);
  const solenoidB = useMemo(() => solenoidFieldInside(current * direction, turnsPerCm * 100), [current, direction, turnsPerCm]);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Switch between sources to compare field-line shapes: closed loops
          around a magnet, concentric circles around a wire, and a uniform field inside a solenoid.
        </p>
        <HUD label={`MAGNETIC FIELD · ${SOURCES.find((s) => s.key === source).label.toUpperCase()}`}>
          <MagneticFieldViewport source={source} strength={strength} currentA={current} direction={direction} />
        </HUD>
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Source</h4>
          <div className="qp-chip-row">
            {SOURCES.map((s) => (
              <button key={s.key} className={"qp-chip" + (s.key === source ? " active" : "")} onClick={() => setSource(s.key)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="qp-card">
          <h4>Parameters</h4>
          {source === "bar" && (
            <div className="qp-slider-row">
              <label>Magnet strength = {strength.toFixed(1)}</label>
              <input type="range" min={2} max={12} step={0.5} value={strength} className="qp-slider" onChange={(e) => setStrength(Number(e.target.value))} />
            </div>
          )}
          {source !== "bar" && (
            <div className="qp-slider-row">
              <label>Current I = {current.toFixed(1)} A</label>
              <input type="range" min={0.5} max={20} step={0.5} value={current} className="qp-slider" onChange={(e) => setCurrent(Number(e.target.value))} />
            </div>
          )}
          {source === "solenoid" && (
            <div className="qp-slider-row">
              <label>Turn density n = {turnsPerCm} turns/cm</label>
              <input type="range" min={2} max={20} step={1} value={turnsPerCm} className="qp-slider" onChange={(e) => setTurnsPerCm(Number(e.target.value))} />
            </div>
          )}
          {source === "wire" && (
            <div className="qp-slider-row">
              <label>Probe distance r = {probeR.toFixed(1)} cm</label>
              <input type="range" min={0.5} max={6} step={0.1} value={probeR} className="qp-slider" onChange={(e) => setProbeR(Number(e.target.value))} />
            </div>
          )}
          {source !== "bar" && (
            <div className="qp-chip-row">
              <button className={"qp-chip" + (direction === 1 ? " active" : "")} onClick={() => setDirection(1)}>Direction: + (out of page)</button>
              <button className={"qp-chip" + (direction === -1 ? " active" : "")} onClick={() => setDirection(-1)}>Direction: − (into page)</button>
            </div>
          )}
        </div>

        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            {source === "wire" && (
              <>
                <Readout label="B = μ₀I/2πr" value={`${fmt(wireB.mT, 4)} mT`} accent="#4fd8e0" />
                <Readout label="μ₀" value={`${fmt(MU0, 4)} T·m/A`} />
              </>
            )}
            {source === "solenoid" && (
              <Readout label="B = μ₀nI (inside)" value={`${fmt(solenoidB * 1000, 4)} mT`} accent="#4fd8e0" />
            )}
            {source === "bar" && (
              <Readout label="Field model" value="Magnetic dipole" accent="#4fd8e0" />
            )}
          </div>
          <button
            className="qp-btn"
            onClick={() => log(
              "Electromagnetism: Magnetic Field",
              `${SOURCES.find((s) => s.key === source).label}, I=${current}A`,
              source === "wire" ? `B=${fmt(wireB.mT, 3)} mT at r=${probeR}cm` : source === "solenoid" ? `B=${fmt(solenoidB * 1000, 3)} mT inside` : `strength=${strength}`
            )}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
