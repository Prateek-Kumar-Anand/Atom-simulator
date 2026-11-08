import React, { useMemo, useState } from "react";
import { Info, AlertTriangle } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import PrismViewport from "./PrismViewport";
import { tracePrismRay, prismDispersionFan, cauchyIndex, minimumDeviationDeg, GLASS_PRESETS, SPECTRUM_SAMPLE_NM } from "../../physics/optics";
import { fmt, wavelengthToColor } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const REF_NM = 589; // sodium D line, the conventional reference wavelength for glass "n"

export default function PrismLab() {
  const { log } = useApp();
  const [mode, setMode] = useState("spectrum");
  const [glassKey, setGlassKey] = useState("crown");
  const [apexAngle, setApexAngle] = useState(60);
  const [incidenceDeg, setIncidenceDeg] = useState(50);
  const [monoNm, setMonoNm] = useState(589);

  const glass = GLASS_PRESETS.find((g) => g.key === glassKey);
  const nRef = cauchyIndex(REF_NM, glass.A, glass.B);

  const rays = useMemo(() => {
    if (mode === "spectrum") {
      return prismDispersionFan(apexAngle, incidenceDeg, glass, SPECTRUM_SAMPLE_NM).map((r) => ({
        ...r,
        color: wavelengthToColor(r.wavelengthNm),
      }));
    }
    const n = cauchyIndex(monoNm, glass.A, glass.B);
    const r = tracePrismRay(apexAngle, incidenceDeg, n);
    return [{ ...r, wavelengthNm: monoNm, n, color: wavelengthToColor(monoNm) }];
  }, [mode, apexAngle, incidenceDeg, glass, monoNm]);

  const geometryBase = rays[0];
  const refRay = useMemo(() => tracePrismRay(apexAngle, incidenceDeg, nRef), [apexAngle, incidenceDeg, nRef]);
  const deltaMin = useMemo(() => minimumDeviationDeg(apexAngle, nRef), [apexAngle, nRef]);
  const criticalAngleDeg = nRef > 1 ? (Math.asin(1 / nRef) * 180) / Math.PI : null;

  const tirCount = rays.filter((r) => r.tir).length;
  const violet = rays.find((r) => r.wavelengthNm <= 440) || rays[0];
  const red = rays.find((r) => r.wavelengthNm >= 660) || rays[rays.length - 1];
  const angularDispersion = mode === "spectrum" && violet && red && !violet.tir && !red.tir
    ? Math.abs(violet.deviationDeg - red.deviationDeg)
    : null;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> A ray enters the first face, bends toward the normal inside the denser
          glass, then bends again leaving the second face. Because the glass&rsquo;s index n(λ) is
          slightly higher for shorter wavelengths (violet) than longer ones (red), white light fans
          out into a spectrum — the same physics Newton used to prove sunlight is composite.
        </p>
        <HUD label={`PRISM · ${glass.label.toUpperCase()} · A=${apexAngle}°`}>
          <PrismViewport geometryBase={geometryBase} rays={rays} mode={mode} />
        </HUD>
        {tirCount > 0 && (
          <p className="qp-instructions" style={{ color: "#e23d57" }}>
            <AlertTriangle size={14} /> {tirCount} of {rays.length} rays undergo total internal
            reflection at this angle and never emerge — try a smaller incidence or apex angle.
          </p>
        )}
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Light source</h4>
          <div className="qp-chip-row">
            <button className={"qp-chip" + (mode === "spectrum" ? " active" : "")} onClick={() => setMode("spectrum")}>White light (spectrum)</button>
            <button className={"qp-chip" + (mode === "mono" ? " active" : "")} onClick={() => setMode("mono")}>Single wavelength</button>
          </div>
          {mode === "mono" && (
            <div className="qp-slider-row">
              <label>Wavelength λ = {monoNm} nm</label>
              <input type="range" min={400} max={700} step={5} value={monoNm} className="qp-slider" onChange={(e) => setMonoNm(Number(e.target.value))} />
            </div>
          )}
        </div>

        <div className="qp-card">
          <h4>Glass &amp; geometry</h4>
          <div className="qp-chip-row">
            {GLASS_PRESETS.map((g) => (
              <button key={g.key} className={"qp-chip" + (g.key === glassKey ? " active" : "")} onClick={() => setGlassKey(g.key)}>{g.label}</button>
            ))}
          </div>
          <div className="qp-slider-row">
            <label>Apex angle A = {apexAngle}°</label>
            <input type="range" min={30} max={75} step={1} value={apexAngle} className="qp-slider" onChange={(e) => setApexAngle(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Angle of incidence θ₁ = {incidenceDeg}°</label>
            <input type="range" min={5} max={85} step={1} value={incidenceDeg} className="qp-slider" onChange={(e) => setIncidenceDeg(Number(e.target.value))} />
          </div>
        </div>

        <div className="qp-card">
          <h4>n(λ) = A + B/λ² · δ = θ₁ + θ₂ − A</h4>
          <div className="qp-readout-grid">
            <Readout label={`n at ${REF_NM}nm (sodium D)`} value={fmt(nRef, 4)} accent="#0fa3b8" />
            <Readout
              label="Deviation δ (ref. λ)"
              value={refRay.tir ? "TIR — no exit ray" : `${fmt(refRay.deviationDeg, 2)}°`}
              accent={refRay.tir ? "#e23d57" : "#e08a0b"}
            />
            <Readout label="Minimum deviation δmin" value={deltaMin != null ? `${fmt(deltaMin, 2)}°` : "—"} />
            <Readout label="Critical angle (internal)" value={criticalAngleDeg != null ? `${fmt(criticalAngleDeg, 2)}°` : "—"} />
            {angularDispersion != null && (
              <Readout label="Angular dispersion (violet − red)" value={`${fmt(angularDispersion, 2)}°`} accent="#9b59e6" />
            )}
          </div>
          <button
            className="qp-btn"
            onClick={() => log(
              "Optics: Prism / Ray Optics",
              `${glass.label}, A=${apexAngle}°, θ1=${incidenceDeg}°, ${mode === "spectrum" ? "white light" : `λ=${monoNm}nm`}`,
              refRay.tir ? "Total internal reflection — no emergent ray" : `δ=${fmt(refRay.deviationDeg, 2)}° at ${REF_NM}nm${angularDispersion != null ? `, spread=${fmt(angularDispersion, 2)}°` : ""}`
            )}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
