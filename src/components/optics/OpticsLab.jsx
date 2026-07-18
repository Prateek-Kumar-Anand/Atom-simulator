import React, { useState } from "react";
import LensLab from "./LensLab";
import MirrorLab from "./MirrorLab";
import RefractionLab from "./RefractionLab";
import DiffractionLab from "./DiffractionLab";

const EXPERIMENTS = [
  { key: "lens", label: "Lens", Component: LensLab },
  { key: "mirror", label: "Mirror", Component: MirrorLab },
  { key: "refraction", label: "Refraction", Component: RefractionLab },
  { key: "diffraction", label: "Diffraction & Interference", Component: DiffractionLab },
];

export default function OpticsLab() {
  const [expKey, setExpKey] = useState("lens");
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
