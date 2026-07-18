import React, { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Info } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import DiffractionViewport from "./DiffractionViewport";
import { sampleDiffractionPattern } from "../../physics/optics";
import { wavelengthToColor, fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

export default function DiffractionLab() {
  const { log } = useApp();
  const [mode, setMode] = useState("double");
  const [wavelengthNm, setWavelengthNm] = useState(550);
  const [slitWidthUm, setSlitWidthUm] = useState(20);
  const [slitSeparationUm, setSlitSeparationUm] = useState(80);
  const [screenDistanceM, setScreenDistanceM] = useState(1.5);

  const beamColor = wavelengthToColor(wavelengthNm);
  const params = { wavelengthNm, slitWidthUm, slitSeparationUm };

  const pattern = useMemo(
    () => sampleDiffractionPattern(mode, params, screenDistanceM, 25, 220),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, wavelengthNm, slitWidthUm, slitSeparationUm, screenDistanceM]
  );

  const fringeSpacingMm = mode === "double"
    ? ((wavelengthNm * 1e-9 * screenDistanceM) / (slitSeparationUm * 1e-6)) * 1000
    : ((wavelengthNm * 1e-9 * screenDistanceM) / (slitWidthUm * 1e-6)) * 1000;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Narrower slits diffract light more widely; two slits add interference
          fringes on top of the single-slit diffraction envelope (Young&rsquo;s experiment).
        </p>
        <HUD label={`${mode === "single" ? "SINGLE" : "DOUBLE"} SLIT · λ=${wavelengthNm}nm`}>
          <DiffractionViewport mode={mode} pattern={pattern} wavelengthNm={wavelengthNm} slitSeparationUm={slitSeparationUm} slitWidthUm={slitWidthUm} />
        </HUD>
        <div className="qp-card">
          <h4>Intensity vs. screen position</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={pattern}>
              <CartesianGrid stroke="#1f2b3a" />
              <XAxis dataKey="mm" stroke="#7c8a9c" tick={{ fontSize: 10 }} label={{ value: "Screen position (mm)", position: "insideBottom", offset: -4, fill: "#7c8a9c", fontSize: 10 }} />
              <YAxis stroke="#7c8a9c" tick={{ fontSize: 10 }} width={30} />
              <Tooltip contentStyle={{ background: "#0d131c", border: "1px solid #1f2b3a", fontSize: 12 }} />
              <Area type="monotone" dataKey="I" stroke={beamColor} fill={beamColor} fillOpacity={0.3} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Mode</h4>
          <div className="qp-chip-row">
            <button className={"qp-chip" + (mode === "single" ? " active" : "")} onClick={() => setMode("single")}>Single slit diffraction</button>
            <button className={"qp-chip" + (mode === "double" ? " active" : "")} onClick={() => setMode("double")}>Young&rsquo;s double slit</button>
          </div>
        </div>

        <div className="qp-card">
          <h4>Controls</h4>
          <div className="qp-slider-row">
            <label>Wavelength λ = {wavelengthNm} nm</label>
            <input type="range" min={400} max={700} step={5} value={wavelengthNm} className="qp-slider" onChange={(e) => setWavelengthNm(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Slit width a = {slitWidthUm} μm</label>
            <input type="range" min={4} max={50} step={1} value={slitWidthUm} className="qp-slider" onChange={(e) => setSlitWidthUm(Number(e.target.value))} />
          </div>
          {mode === "double" && (
            <div className="qp-slider-row">
              <label>Slit separation d = {slitSeparationUm} μm</label>
              <input type="range" min={20} max={200} step={2} value={slitSeparationUm} className="qp-slider" onChange={(e) => setSlitSeparationUm(Number(e.target.value))} />
            </div>
          )}
          <div className="qp-slider-row">
            <label>Screen distance L = {screenDistanceM.toFixed(1)} m</label>
            <input type="range" min={0.3} max={3} step={0.1} value={screenDistanceM} className="qp-slider" onChange={(e) => setScreenDistanceM(Number(e.target.value))} />
          </div>
        </div>

        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label={mode === "double" ? "Fringe spacing (≈λL/d)" : "Central max half-width (≈λL/a)"} value={`${fmt(fringeSpacingMm, 3)} mm`} accent="#4fd8e0" />
            <Readout label="Wavelength" value={`${wavelengthNm} nm`} />
          </div>
          <button
            className="qp-btn"
            onClick={() => log(
              "Optics: Diffraction",
              `${mode === "double" ? "Double" : "Single"} slit, λ=${wavelengthNm}nm, a=${slitWidthUm}μm${mode === "double" ? `, d=${slitSeparationUm}μm` : ""}`,
              `Spacing ≈ ${fmt(fringeSpacingMm, 3)} mm at L=${screenDistanceM}m`
            )}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
