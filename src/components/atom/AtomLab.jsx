import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import HUD from "../common/HUD";
import AtomViewport from "./AtomViewport";
import FullElementPicker from "../common/FullElementPicker";
import AtomInfo from "./AtomInfo";
import { getFullElementByZ, getFullShellConfig } from "../../physics/periodicTable";
import { useApp } from "../../context/AppContext";

export default function AtomLab() {
  const { log } = useApp();
  const [Z, setZ] = useState(6); // default: carbon
  const element = getFullElementByZ(Z);
  const shells = useMemo(() => getFullShellConfig(Z), [Z]);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Drag the viewport to rotate the model, scroll to zoom, and pick any
          of all 118 elements to inspect its nucleus and real electron-shell configuration
          (Aufbau/Madelung filling, with the well-known chromium/copper-family exceptions applied).
        </p>
        <HUD label={`ATOM · ${element.symbol}-${element.A}`}>
          <AtomViewport protons={Z} neutrons={element.neutrons} shellCounts={shells} />
        </HUD>
        <FullElementPicker selectedZ={Z} onSelect={setZ} />
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
