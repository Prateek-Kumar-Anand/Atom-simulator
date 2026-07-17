import React, { useMemo, useState } from "react";
import { Info, Sparkles } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import SpectrumViewport from "./SpectrumViewport";
import EnergyLevelDiagram from "./EnergyLevelDiagram";
import FullElementPicker from "../common/FullElementPicker";
import { computeTransition } from "../../physics/hydrogenSpectrum";
import { getFullElementByZ } from "../../physics/periodicTable";
import { fmt, wavelengthToColor } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

export default function SpectrumLab() {
  const { log } = useApp();
  const [Z, setZ] = useState(1);
  const [ni, setNi] = useState(3);
  const [nf, setNf] = useState(2);
  const [emitToken, setEmitToken] = useState(0);

  const element = getFullElementByZ(Z);
  const t = useMemo(() => computeTransition(ni, nf, Z), [ni, nf, Z]);
  const color = t.visible ? wavelengthToColor(t.wavelengthNm) : "#5b6472";

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Choose an element (modeled as a hydrogen-like ion, one electron only),
          an initial level n<sub>i</sub> and final level n<sub>f</sub>, then trigger a transition.
        </p>
        <HUD label={`${element.symbol.toUpperCase()}${Z > 1 ? `${Z - 1}+` : ""} · BOHR MODEL`}>
          <SpectrumViewport ni={ni} nf={nf} emitToken={emitToken} color={color} emission={t.emission} />
        </HUD>

        <div className="qp-card">
          <h4>Element (Z = {Z}, hydrogen-like ion)</h4>
          <FullElementPicker selectedZ={Z} onSelect={setZ} />
        </div>

        <div className="qp-card">
          <h4>Energy-level diagram</h4>
          <EnergyLevelDiagram ni={ni} nf={nf} color={color} />
        </div>

        <div className="qp-card">
          <h4>Visible spectrum position</h4>
          <div className="qp-spectrum-bar">
            {t.visible && (
              <div className="qp-spectrum-marker" style={{ left: `${((t.wavelengthNm - 380) / 400) * 100}%`, background: color }} />
            )}
          </div>
          <div className="qp-spectrum-labels"><span>380 nm (violet)</span><span>780 nm (red)</span></div>
        </div>
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <div className="qp-slider-row">
            <label>Initial level n<sub>i</sub> = {ni}</label>
            <input type="range" min={1} max={6} value={ni} onChange={(e) => setNi(Number(e.target.value))} className="qp-slider" />
          </div>
          <div className="qp-slider-row">
            <label>Final level n<sub>f</sub> = {nf}</label>
            <input type="range" min={1} max={6} value={nf} onChange={(e) => setNf(Number(e.target.value))} className="qp-slider" />
          </div>
          <button className="qp-btn qp-btn-primary" disabled={ni === nf} onClick={() => setEmitToken((x) => x + 1)}>
            <Sparkles size={14} /> {t.emission ? "Emit photon" : "Absorb photon"}
          </button>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Ion" value={`${element.symbol}${Z > 1 ? `${Z - 1}+` : ""} (Z=${Z})`} accent="#c084fc" />
            <Readout label="Transition" value={ni === nf ? "—" : `n=${ni} → n=${nf}`} />
            <Readout label="Series" value={t.series} />
            <Readout label="ΔE" value={`${fmt(t.dE)} eV`} accent="#f2a94e" />
            <Readout label="Wavelength (λ)" value={`${fmt(t.wavelengthNm)} nm`} accent={color} />
            <Readout label="Frequency" value={`${fmt(t.frequencyHz / 1e14)}×10¹⁴ Hz`} />
            <Readout label="In visible range?" value={t.visible ? "Yes" : "No (UV/IR)"} />
          </div>
          <button
            className="qp-btn"
            onClick={() => log("Hydrogen Spectrum", `${element.symbol}${Z > 1 ? `${Z - 1}+` : ""}, n=${ni}→n=${nf}`, `ΔE=${fmt(t.dE)} eV, λ=${fmt(t.wavelengthNm)} nm, ${t.series}`)}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
