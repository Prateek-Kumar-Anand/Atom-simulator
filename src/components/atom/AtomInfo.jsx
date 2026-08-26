import React from "react";
import Readout from "../common/Readout";
import { getGridPosition, formatElectronConfig } from "../../physics/periodicTable";
import { getElementInfo, CATEGORY_LABEL, CATEGORY_COLOR } from "../../physics/elementInfo";

export default function AtomInfo({ element, shells, onRecord }) {
  const pos = getGridPosition(element.Z);
  const info = getElementInfo(element.Z);
  const categoryColor = CATEGORY_COLOR[info.category];
  const groupLabel = pos.footnote ? (pos.footnote === "lanthanide" ? "57–71 (f-block)" : "89–103 (f-block)") : pos.group;

  return (
    <div className="qp-card">
      <h3>{element.name} <span className="qp-muted">({element.symbol})</span></h3>
      <span className="qp-pt-legend-item" style={{ marginBottom: 10 }}>
        <span className="qp-pt-swatch" style={{ background: categoryColor }} />
        {CATEGORY_LABEL[info.category]}
      </span>
      <div className="qp-readout-grid">
        <Readout label="Atomic number (Z)" value={element.Z} />
        <Readout label="Mass number (A)" value={element.A} />
        <Readout label="Protons" value={element.Z} accent="#ef5b6f" />
        <Readout label="Neutrons" value={element.neutrons} accent="#5b8def" />
        <Readout label="Electrons" value={element.Z} accent="#4fd8e0" />
        <Readout label="Block" value={`${element.block}-block`} />
        <Readout label="Period" value={pos.period} />
        <Readout label="Group" value={groupLabel} />
      </div>
      <div className="qp-shellrow">
        <span className="qp-muted small">Shell configuration:</span>
        <strong>{shells.join(" – ")}</strong>
      </div>
      <div className="qp-shellrow" style={{ flexWrap: "wrap" }}>
        <span className="qp-muted small">Electron configuration:</span>
        <strong style={{ fontSize: 12 }}>{formatElectronConfig(element.Z)}</strong>
      </div>
      {info.summary && (
        <p className="qp-element-summary" style={{ marginTop: 12 }}>
          {info.summary}
        </p>
      )}
      <button className="qp-btn qp-btn-primary" onClick={onRecord} style={{ marginTop: 12 }}>
        Record observation
      </button>
    </div>
  );
}
