import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import FullElementPicker from "../common/FullElementPicker";
import ElectricFieldViewport from "./ElectricFieldViewport";
import { fieldAt, K_COULOMB } from "../../physics/electromagnetism";
import { getFullElementByZ } from "../../physics/periodicTable";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

function makeLayout(numCharges, distance, magnitude) {
  if (numCharges === 2) {
    return [
      { x: -distance / 2, y: 0, q: magnitude },
      { x: distance / 2, y: 0, q: -magnitude },
    ];
  }
  const radius = distance / 2;
  return Array.from({ length: numCharges }, (_, i) => {
    const angle = (i / numCharges) * Math.PI * 2;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, q: i % 2 === 0 ? magnitude : -magnitude };
  });
}

export default function ElectricFieldLab() {
  const { log } = useApp();
  const [numCharges, setNumCharges] = useState(2);
  const [distance, setDistance] = useState(6);
  const [magnitude, setMagnitude] = useState(4);
  const [ionZ, setIonZ] = useState(11);
  const [charges, setCharges] = useState(() => [...makeLayout(2, 6, 4), { x: 0, y: 5.5, q: 0 }]);

  const applyLayout = (n, d, m) => {
    setCharges([...makeLayout(n, d, m), { x: 0, y: 5.5, q: 0 }]);
  };

  const handleNum = (n) => { setNumCharges(n); applyLayout(n, distance, magnitude); };
  const handleDistance = (d) => { setDistance(d); applyLayout(numCharges, d, magnitude); };
  const handleMagnitude = (m) => { setMagnitude(m); applyLayout(numCharges, distance, m); };

  const handleDragCharge = (index, x, y) => {
    setCharges((prev) => { const next = prev.slice(); next[index] = { ...next[index], x, y }; return next; });
  };

  const probe = charges[charges.length - 1];
  const sourceCharges = charges.filter((c) => c.q !== 0);
  const field = useMemo(() => fieldAt(sourceCharges, probe.x, probe.y), [sourceCharges, probe.x, probe.y]);

  const pairSeparation = numCharges === 2
    ? Math.hypot(charges[0].x - charges[1].x, charges[0].y - charges[1].y) / 100
    : null;
  const pairForce = pairSeparation
    ? (K_COULOMB * Math.abs(charges[0].q * 1e-9 * charges[1].q * 1e-9)) / (pairSeparation ** 2)
    : null;

  const ion = getFullElementByZ(ionZ);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Drag the red/blue charges to reshape the field lines. Drag the green
          probe marker to read the field strength and potential at any point.
        </p>
        <HUD label={`ELECTRIC FIELD · ${numCharges} CHARGES`}>
          <ElectricFieldViewport charges={charges} onDragCharge={handleDragCharge} />
        </HUD>
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Charge configuration</h4>
          <div className="qp-chip-row">
            {[2, 3, 4].map((n) => (
              <button key={n} className={"qp-chip" + (n === numCharges ? " active" : "")} onClick={() => handleNum(n)}>
                {n} charges
              </button>
            ))}
          </div>
          <div className="qp-slider-row">
            <label>Charge magnitude |Q| = {magnitude.toFixed(1)} nC</label>
            <input type="range" min={0.5} max={12} step={0.5} value={magnitude} className="qp-slider" onChange={(e) => handleMagnitude(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Layout distance = {distance.toFixed(1)} cm</label>
            <input type="range" min={2} max={12} step={0.5} value={distance} className="qp-slider" onChange={(e) => handleDistance(Number(e.target.value))} />
          </div>
        </div>

        <div className="qp-card">
          <h4>Ion reference (118-element table)</h4>
          <p className="qp-muted small" style={{ marginTop: 0 }}>
            Pick an element to see how its atomic number would scale the source charge Q = Z·e (for a fully-ionized nucleus).
          </p>
          <FullElementPicker selectedZ={ionZ} onSelect={setIonZ} />
          <div className="qp-readout-grid" style={{ marginTop: 10 }}>
            <Readout label={`${ion.name} (Z=${ion.Z})`} value={`Q = +${ion.Z}e`} accent="#ef5b6f" />
            <Readout label="Nuclear charge" value={`${fmt(ion.Z * 1.602176634e-19 * 1e9, 3)} nC`} />
          </div>
        </div>

        <div className="qp-card">
          <h4>Probe readout — E = kQ/r², V = kQ/r</h4>
          <div className="qp-readout-grid">
            <Readout label="Field magnitude |E|" value={`${fmt(field.mag, 3)} N/C`} accent="#4fd8e0" />
            <Readout label="Potential V" value={`${fmt(field.V, 3)} V`} accent="#f2a94e" />
            <Readout label="Ex" value={`${fmt(field.Ex, 3)} N/C`} />
            <Readout label="Ey" value={`${fmt(field.Ey, 3)} N/C`} />
          </div>
          {pairSeparation && (
            <div className="qp-readout-grid">
              <Readout label="Separation r" value={`${(pairSeparation * 100).toFixed(2)} cm`} />
              <Readout label="Coulomb force F = kQ₁Q₂/r²" value={`${fmt(pairForce, 4)} N`} accent="#c084fc" />
            </div>
          )}
          <button
            className="qp-btn"
            onClick={() => log(
              "Electromagnetism: Electric Field",
              `${numCharges} charges, |Q|=${magnitude} nC, distance=${distance} cm`,
              `Probe: |E|=${fmt(field.mag, 3)} N/C, V=${fmt(field.V, 3)} V`
            )}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
