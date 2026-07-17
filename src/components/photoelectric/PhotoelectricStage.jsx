import React from "react";
import { Lightbulb } from "lucide-react";
import { CONST, wavelengthToColor } from "../../physics/constants";

export default function PhotoelectricStage({ photonE, intensity, freqTHz, emitting, KEmax, metalName }) {
  const beamColor = wavelengthToColor(CONST.hc_eVnm / photonE);
  return (
    <div className="qp-card qp-photo-stage">
      <div className="qp-photo-source">
        <Lightbulb size={28} color="#f2a94e" />
        <div className="qp-photo-beam" style={{ opacity: 0.35 + (intensity / 100) * 0.65 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="qp-photon-line"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${1.4 - Math.min(freqTHz / 20, 0.9)}s`,
                background: beamColor,
              }}
            />
          ))}
        </div>
      </div>
      <div className="qp-photo-plate">
        <span className="qp-plate-label">{metalName} plate</span>
        {emitting &&
          Array.from({ length: Math.max(1, Math.round(intensity / 15)) }).map((_, i) => (
            <span
              key={i}
              className="qp-electron-pop"
              style={{ left: `${10 + i * 14}%`, animationDelay: `${i * 0.1}s`, animationDuration: `${1.1 - Math.min(KEmax * 0.05, 0.6)}s` }}
            />
          ))}
      </div>
    </div>
  );
}
