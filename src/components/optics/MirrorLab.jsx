import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import MirrorViewport from "./MirrorViewport";
import { solveMirror, computeMirrorRays } from "../../physics/optics";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const KINDS = [
  { key: "concave", label: "Concave" },
  { key: "convex", label: "Convex" },
  { key: "plane", label: "Plane" },
];

export default function MirrorLab() {
  const { log } = useApp();
  const [kind, setKind] = useState("concave");
  const [objectDistance, setObjectDistance] = useState(18);
  const [objectHeight, setObjectHeight] = useState(3);
  const [focalMag, setFocalMag] = useState(10);

  const isPlane = kind === "plane";
  const focalLength = kind === "concave" ? -focalMag : focalMag;
  const result = useMemo(
    () => solveMirror(objectDistance, focalLength, objectHeight, isPlane),
    [objectDistance, focalLength, objectHeight, isPlane]
  );

  const xFar = Math.max(Math.abs(result?.v ?? 0), objectDistance, focalMag * 2) * 1.3 + 3;
  const rays = useMemo(
    () => (isPlane ? null : computeMirrorRays(objectDistance, focalMag, objectHeight, kind === "concave", xFar)),
    [objectDistance, focalMag, objectHeight, kind, xFar, isPlane]
  );

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Concave mirrors converge parallel rays through a real focal point in
          front of the surface; convex mirrors diverge them from a virtual focus behind it.
        </p>
        <HUD label={`${kind.toUpperCase()} MIRROR`}>
          {result && (
            <MirrorViewport
              rays={rays}
              objX={-objectDistance}
              objHeight={objectHeight}
              imgX={result.v}
              imgHeight={result.imageHeight}
              kind={kind}
              isVirtual={!result.real}
              xFar={xFar}
            />
          )}
        </HUD>
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Mirror type</h4>
          <div className="qp-chip-row">
            {KINDS.map((k) => (
              <button key={k.key} className={"qp-chip" + (k.key === kind ? " active" : "")} onClick={() => setKind(k.key)}>{k.label}</button>
            ))}
          </div>
        </div>

        <div className="qp-card">
          <h4>Controls</h4>
          <div className="qp-slider-row">
            <label>Object distance u = {objectDistance} cm</label>
            <input type="range" min={2} max={45} step={1} value={objectDistance} className="qp-slider" onChange={(e) => setObjectDistance(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Object height = {objectHeight.toFixed(1)} cm</label>
            <input type="range" min={0.5} max={6} step={0.5} value={objectHeight} className="qp-slider" onChange={(e) => setObjectHeight(Number(e.target.value))} />
          </div>
          {!isPlane && (
            <div className="qp-slider-row">
              <label>|Focal length| = {focalMag} cm</label>
              <input type="range" min={2} max={25} step={1} value={focalMag} className="qp-slider" onChange={(e) => setFocalMag(Number(e.target.value))} />
            </div>
          )}
        </div>

        <div className="qp-card">
          <h4>1/f = 1/v + 1/u</h4>
          {result ? (
            <>
              <div className="qp-readout-grid">
                <Readout label="Image distance v" value={`${fmt(result.imageDistance, 2)} cm`} accent="#4fd8e0" />
                <Readout label="Magnification m = −v/u" value={fmt(result.m, 3)} accent="#f2a94e" />
                <Readout label="Image type" value={result.real ? "Real" : "Virtual"} accent={result.real ? "#ef5b6f" : "#c084fc"} />
                <Readout label="Orientation" value={result.orientation} />
              </div>
              <button
                className="qp-btn"
                onClick={() => log(
                  "Optics: Mirror",
                  `${kind} mirror, u=${objectDistance}cm${isPlane ? "" : `, f=${focalLength}cm`}`,
                  `v=${fmt(result.imageDistance, 2)}cm, m=${fmt(result.m, 3)}, ${result.real ? "real" : "virtual"}, ${result.orientation}`
                )}
              >
                Record result
              </button>
            </>
          ) : (
            <p className="qp-muted small">Object at the focal point — image forms at infinity.</p>
          )}
        </div>
      </div>
    </div>
  );
}
