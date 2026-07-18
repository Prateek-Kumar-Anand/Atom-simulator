import React, { useState } from "react";
import ElectricFieldLab from "./ElectricFieldLab";
import MagneticFieldLab from "./MagneticFieldLab";
import LorentzForceLab from "./LorentzForceLab";
import EMWaveLab from "./EMWaveLab";

const EXPERIMENTS = [
  { key: "electricField", label: "Electric Field", Component: ElectricFieldLab },
  { key: "magneticField", label: "Magnetic Field", Component: MagneticFieldLab },
  { key: "lorentzForce", label: "Lorentz Force", Component: LorentzForceLab },
  { key: "emWave", label: "EM Wave", Component: EMWaveLab },
];

export default function EMLab() {
  const [expKey, setExpKey] = useState("electricField");
  const active = EXPERIMENTS.find((e) => e.key === expKey) || EXPERIMENTS[0];
  const Active = active.Component;

  return (
    <div>
      <div className="qp-chip-row" style={{ marginBottom: 14 }}>
        {EXPERIMENTS.map((e) => (
          <button key={e.key} className={"qp-chip" + (e.key === expKey ? " active" : "")} onClick={() => setExpKey(e.key)}>
            {e.label}
          </button>
        ))}
      </div>
      <Active />
    </div>
  );
}
