import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import MagneticFieldViewport from "./MagneticFieldViewport";
import { wireFieldAt, solenoidFieldInside, barMagnetFieldAt, MU0 } from "../../physics/electromagnetism";
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
  const [probe, setProbe] = useState({ x: 2.6, y: 1.7 });

  const solenoidB = useMemo(() => solenoidFieldInside(current * direction, turnsPerCm * 100), [current, direction, turnsPerCm]);

  const probeField = useMemo(() => {
    if (source === "bar") return barMagnetFieldAt(strength, probe.x, probe.y);
    if (source === "wire") return wireFieldAt(current * direction, probe.x, probe.y);
    return null;
  }, [source, strength, current, direction, probe]);

  const probeR = Math.hypot(probe.x, probe.y);
  const probeAngleDeg = probeField ? (Math.atan2(probeField.By ?? probeField.y, probeField.Bx ?? probeField.x) * 180) / Math.PI : null;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Switch between sources to compare field-line shapes: closed loops
          around a magnet, concentric circles around a wire, and a uniform field inside a
          solenoid. For the magnet and wire, drag the green compass needle anywhere in the plane —
          it always swings to point along the local field direction, just like a real compass.
        </p>
        <HUD label={`MAGNETIC FIELD · ${SOURCES.find((s) => s.key === source).label.toUpperCase()}`}>
          <MagneticFieldViewport
            source={source}
            strength={strength}
            currentA={current}
            direction={direction}
            probe={probe}
            onDragProbe={(x, y) => setProbe({ x, y })}
            probeField={probeField}
          />
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
                <Readout label="Probe distance r" value={`${fmt(probeR, 2)} cm`} />
                <Readout label="B = μ₀I/2πr at probe" value={`${fmt(probeField.mT, 4)} mT`} accent="#4fd8e0" />
                <Readout label="Field direction (compass)" value={`${fmt(probeAngleDeg, 1)}°`} />
                <Readout label="μ₀" value={`${fmt(MU0, 4)} T·m/A`} />
              </>
            )}
            {source === "solenoid" && (
              <Readout label="B = μ₀nI (inside)" value={`${fmt(solenoidB * 1000, 4)} mT`} accent="#4fd8e0" />
            )}
            {source === "bar" && (
              <>
                <Readout label="Field model" value="Magnetic dipole" accent="#4fd8e0" />
                <Readout label="Compass distance from magnet" value={`${fmt(probeR, 2)}`} />
                <Readout label="Field direction (compass)" value={`${fmt(probeAngleDeg, 1)}°`} />
              </>
            )}
          </div>
          <button
            className="qp-btn"
            onClick={() => log(
              "Electromagnetism: Magnetic Field",
              `${SOURCES.find((s) => s.key === source).label}, I=${current}A`,
              source === "wire" ? `B=${fmt(probeField.mT, 3)} mT at r=${fmt(probeR, 2)}cm, dir=${fmt(probeAngleDeg, 1)}°`
                : source === "solenoid" ? `B=${fmt(solenoidB * 1000, 3)} mT inside`
                : `strength=${strength}, compass dir=${fmt(probeAngleDeg, 1)}° at r=${fmt(probeR, 2)}`
            )}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
