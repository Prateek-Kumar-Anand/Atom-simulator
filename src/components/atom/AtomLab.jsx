import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import HUD from "../common/HUD";
import AtomViewport from "./AtomViewport";
import ElementSelector from "./ElementSelector";
import AtomInfo from "./AtomInfo";
import { getElementByZ, getShellConfig } from "../../physics/atomicData";
import { useApp } from "../../context/AppContext";

export default function AtomLab() {
  const { log } = useApp();
  const [Z, setZ] = useState(6); // default: carbon
  const element = getElementByZ(Z);
  const shells = useMemo(() => getShellConfig(Z), [Z]);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Drag the viewport to rotate the model, scroll to zoom, and pick an
          element to inspect its nucleus and electron shells (simplified Bohr model, exact for Z ≤ 20).
        </p>
        <HUD label={`ATOM · ${element.symbol}-${element.A}`}>
          <AtomViewport protons={Z} neutrons={element.neutrons} shellCounts={shells} />
        </HUD>
        <ElementSelector selectedZ={Z} onSelect={setZ} />
      </div>
      <div className="qp-side-col">
        <AtomInfo
          element={element}
          shells={shells}
          onRecord={() => log("Atomic Structure", `${element.name} (Z=${element.Z})`, `Shells ${shells.join("-")}, ${element.neutrons} neutrons`)}
        />
      </div>
    </div>
  );
}
