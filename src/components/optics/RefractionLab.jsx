import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import FullElementPicker from "../common/FullElementPicker";
import RefractionViewport from "./RefractionViewport";
import { snellRefract, MEDIA, elementRefractiveIndex } from "../../physics/optics";
import { getFullElementByZ } from "../../physics/periodicTable";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

export default function RefractionLab() {
  const { log } = useApp();
  const [n1Key, setN1Key] = useState("air");
  const [useElementForN2, setUseElementForN2] = useState(false);
  const [n2Key, setN2Key] = useState("water");
  const [elementZ, setElementZ] = useState(14);
  const [theta1, setTheta1] = useState(35);

  const n1 = MEDIA.find((m) => m.key === n1Key).n;
  const n2 = useElementForN2 ? elementRefractiveIndex(elementZ) : MEDIA.find((m) => m.key === n2Key).n;
  const element = getFullElementByZ(elementZ);

  const result = useMemo(() => snellRefract(n1, n2, theta1), [n1, n2, theta1]);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Light bends toward the normal when entering a denser medium (n2 &gt; n1),
          and away from it when entering a less dense one — past the critical angle it reflects entirely.
        </p>
        <HUD label={`REFRACTION · n1=${fmt(n1, 3)} → n2=${fmt(n2, 3)}`}>
          <RefractionViewport theta1Deg={theta1} theta2Deg={result.totalInternalReflection ? null : result.theta2Deg} tir={result.totalInternalReflection} />
        </HUD>
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Medium 1 (incident side)</h4>
          <select className="qp-select" value={n1Key} onChange={(e) => setN1Key(e.target.value)}>
            {MEDIA.map((m) => <option key={m.key} value={m.key}>{m.label} (n={m.n})</option>)}
          </select>
          <div className="qp-slider-row">
            <label>Angle of incidence θ₁ = {theta1}°</label>
            <input type="range" min={0} max={89} step={1} value={theta1} className="qp-slider" onChange={(e) => setTheta1(Number(e.target.value))} />
          </div>
        </div>

        <div className="qp-card">
          <h4>Medium 2 (refracted side)</h4>
          <div className="qp-chip-row">
            <button className={"qp-chip" + (!useElementForN2 ? " active" : "")} onClick={() => setUseElementForN2(false)}>Standard media</button>
            <button className={"qp-chip" + (useElementForN2 ? " active" : "")} onClick={() => setUseElementForN2(true)}>118-element table</button>
          </div>
          {!useElementForN2 ? (
            <select className="qp-select" value={n2Key} onChange={(e) => setN2Key(e.target.value)}>
              {MEDIA.map((m) => <option key={m.key} value={m.key}>{m.label} (n={m.n})</option>)}
            </select>
          ) : (
            <>
              <FullElementPicker selectedZ={elementZ} onSelect={setElementZ} />
              <p className="qp-muted small">{element.name} (Z={element.Z}) — teaching-approximation n = {fmt(n2, 3)}</p>
            </>
          )}
        </div>

        <div className="qp-card">
          <h4>n₁ sinθ₁ = n₂ sinθ₂</h4>
          <div className="qp-readout-grid">
            <Readout label="n1" value={fmt(n1, 4)} />
            <Readout label="n2" value={fmt(n2, 4)} />
            {result.totalInternalReflection ? (
              <Readout label="Result" value="Total internal reflection" accent="#ef5b6f" />
            ) : (
              <Readout label="Refraction angle θ₂" value={`${fmt(result.theta2Deg, 2)}°`} accent="#4fd8e0" />
            )}
            {result.criticalAngleDeg != null && (
              <Readout label="Critical angle" value={`${fmt(result.criticalAngleDeg, 2)}°`} accent="#f2a94e" />
            )}
          </div>
          <button
            className="qp-btn"
            onClick={() => log(
              "Optics: Refraction",
              `n1=${fmt(n1, 3)}, n2=${fmt(n2, 3)}, θ1=${theta1}°`,
              result.totalInternalReflection ? "Total internal reflection" : `θ2=${fmt(result.theta2Deg, 2)}°`
            )}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
