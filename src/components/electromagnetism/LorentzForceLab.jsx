import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import LorentzForceViewport from "./LorentzForceViewport";
import { integrateTrajectory, lorentzForce } from "../../physics/electromagnetism";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const PROTON_MASS = 1.67262192369e-27; // kg
const ELEMENTARY_CHARGE = 1.602176634e-19; // C

export default function LorentzForceLab() {
  const { log } = useApp();
  const [chargeMultiple, setChargeMultiple] = useState(1);
  const [velocityE5, setVelocityE5] = useState(4); // ×10^5 m/s
  const [bFieldMt, setBFieldMt] = useState(3); // mT
  const [eFieldVm, setEFieldVm] = useState(0); // V/m, along y

  const q = chargeMultiple * ELEMENTARY_CHARGE;
  const v0 = { x: velocityE5 * 1e5, y: 0, z: 0 };
  const B = { x: 0, y: 0, z: bFieldMt * 1e-3 };
  const E = { x: 0, y: eFieldVm, z: 0 };

  const cyclotronPeriod = q !== 0 ? (2 * Math.PI * PROTON_MASS) / (Math.abs(q) * (bFieldMt * 1e-3 || 1e-9)) : 0;
  const dt = cyclotronPeriod > 0 ? cyclotronPeriod / 240 : 1e-9;

  const trajectory = useMemo(
    () => integrateTrajectory({ q, m: PROTON_MASS, v0, E, B, dt, steps: 480 }),
    [q, velocityE5, bFieldMt, eFieldVm] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const F0 = lorentzForce(q, v0, E, B);
  const Fmag = Math.hypot(F0.x, F0.y, F0.z);
  const radius = q !== 0 && bFieldMt !== 0 ? (PROTON_MASS * Math.hypot(v0.x, v0.y, v0.z)) / (Math.abs(q) * bFieldMt * 1e-3) : Infinity;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> A proton-like particle launched into a uniform field bends into a
          circular (or helical, with an added E field) path — the Lorentz force always acts
          perpendicular to velocity, so it changes direction but never speed from B alone.
        </p>
        <HUD label={`LORENTZ FORCE · q=${chargeMultiple > 0 ? "+" : ""}${chargeMultiple}e`}>
          <LorentzForceViewport trajectoryPoints={trajectory.pts} particleCharge={q} />
        </HUD>
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Particle controls</h4>
          <div className="qp-slider-row">
            <label>Particle charge q = {chargeMultiple > 0 ? "+" : ""}{chargeMultiple}e</label>
            <input type="range" min={-5} max={5} step={1} value={chargeMultiple} className="qp-slider" onChange={(e) => setChargeMultiple(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Velocity v = {velocityE5.toFixed(1)} × 10⁵ m/s</label>
            <input type="range" min={1} max={12} step={0.5} value={velocityE5} className="qp-slider" onChange={(e) => setVelocityE5(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Magnetic field B = {bFieldMt.toFixed(1)} mT (out of page)</label>
            <input type="range" min={0.5} max={10} step={0.5} value={bFieldMt} className="qp-slider" onChange={(e) => setBFieldMt(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Electric field E = {eFieldVm.toFixed(0)} V/m (⊥ to v)</label>
            <input type="range" min={0} max={200000} step={5000} value={eFieldVm} className="qp-slider" onChange={(e) => setEFieldVm(Number(e.target.value))} />
          </div>
        </div>

        <div className="qp-card">
          <h4>F = q(E + v × B)</h4>
          <div className="qp-readout-grid">
            <Readout label="Force magnitude" value={`${fmt(Fmag, 4)} N`} accent="#4fd8e0" />
            <Readout label="Cyclotron radius r = mv/qB" value={Number.isFinite(radius) ? `${fmt(radius, 3)} m` : "—"} accent="#f2a94e" />
            <Readout label="Cyclotron period T" value={`${fmt(cyclotronPeriod * 1e6, 3)} μs`} />
            <Readout label="Final speed" value={`${fmt(trajectory.finalSpeed / 1e5, 3)} ×10⁵ m/s`} />
          </div>
          <button
            className="qp-btn"
            onClick={() => log(
              "Electromagnetism: Lorentz Force",
              `q=${chargeMultiple}e, v=${velocityE5}×10⁵ m/s, B=${bFieldMt} mT, E=${eFieldVm} V/m`,
              `F=${fmt(Fmag, 3)} N, r=${Number.isFinite(radius) ? fmt(radius, 3) + " m" : "n/a"}`
            )}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
