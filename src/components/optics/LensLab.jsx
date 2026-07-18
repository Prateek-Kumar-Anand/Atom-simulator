import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import LensViewport from "./LensViewport";
import { solveLens, computeLensRays } from "../../physics/optics";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

export default function LensLab() {
  const { log } = useApp();
  const [lensType, setLensType] = useState("convex");
  const [objectDistance, setObjectDistance] = useState(15);
  const [objectHeight, setObjectHeight] = useState(3);
  const [focalMag, setFocalMag] = useState(8);

  const focalLength = lensType === "convex" ? focalMag : -focalMag;
  const result = useMemo(() => solveLens(objectDistance, focalLength, objectHeight), [objectDistance, focalLength, objectHeight]);

  const xFar = Math.max(Math.abs(result?.v ?? 0), objectDistance) * 1.35 + 3;
  const rays = useMemo(() => computeLensRays(objectDistance, focalLength, objectHeight, xFar), [objectDistance, focalLength, objectHeight, xFar]);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Three principal rays construct the image automatically: parallel-to-axis,
          through-the-center, and through-the-near-focus. Where they meet (or appear to meet) is the image.
        </p>
        <HUD label={`${lensType.toUpperCase()} LENS · f=${focalLength} cm`}>
          {result && (
            <LensViewport
              rays={rays}
              objX={-objectDistance}
              objHeight={objectHeight}
              imgX={result.v}
              imgHeight={result.imageHeight}
              isConvex={lensType === "convex"}
              isVirtual={!result.real}
              xFar={xFar}
            />
          )}
        </HUD>
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Lens type</h4>
          <div className="qp-chip-row">
            <button className={"qp-chip" + (lensType === "convex" ? " active" : "")} onClick={() => setLensType("convex")}>Convex (converging)</button>
            <button className={"qp-chip" + (lensType === "concave" ? " active" : "")} onClick={() => setLensType("concave")}>Concave (diverging)</button>
          </div>
        </div>

        <div className="qp-card">
          <h4>Controls</h4>
          <div className="qp-slider-row">
            <label>Object distance u = {objectDistance} cm</label>
            <input type="range" min={2} max={40} step={1} value={objectDistance} className="qp-slider" onChange={(e) => setObjectDistance(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Object height = {objectHeight.toFixed(1)} cm</label>
            <input type="range" min={0.5} max={6} step={0.5} value={objectHeight} className="qp-slider" onChange={(e) => setObjectHeight(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Focal length |f| = {focalMag} cm</label>
            <input type="range" min={2} max={25} step={1} value={focalMag} className="qp-slider" onChange={(e) => setFocalMag(Number(e.target.value))} />
          </div>
        </div>

        <div className="qp-card">
          <h4>1/f = 1/v − 1/u</h4>
          {result ? (
            <>
              <div className="qp-readout-grid">
                <Readout label="Image distance v" value={`${fmt(result.imageDistance, 2)} cm`} accent="#4fd8e0" />
                <Readout label="Magnification v/u" value={fmt(result.m, 3)} accent="#f2a94e" />
                <Readout label="Image type" value={result.real ? "Real" : "Virtual"} accent={result.real ? "#ef5b6f" : "#c084fc"} />
                <Readout label="Orientation" value={result.orientation} />
              </div>
              <button
                className="qp-btn"
                onClick={() => log(
                  "Optics: Lens",
                  `${lensType} lens, u=${objectDistance}cm, f=${focalLength}cm`,
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
