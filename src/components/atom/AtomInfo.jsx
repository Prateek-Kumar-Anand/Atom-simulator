import React from "react";
import Readout from "../common/Readout";

export default function AtomInfo({ element, shells, onRecord }) {
  return (
    <div className="qp-card">
      <h3>{element.name} <span className="qp-muted">({element.symbol})</span></h3>
      <div className="qp-readout-grid">
        <Readout label="Atomic number (Z)" value={element.Z} />
        <Readout label="Mass number (A)" value={element.A} />
        <Readout label="Protons" value={element.Z} accent="#ef5b6f" />
        <Readout label="Neutrons" value={element.neutrons} accent="#5b8def" />
        <Readout label="Electrons" value={element.Z} accent="#4fd8e0" />
        <Readout label="Category" value={element.category} />
      </div>
      <div className="qp-shellrow">
        <span className="qp-muted small">Shell configuration:</span>
        <strong>{shells.join(" – ")}</strong>
      </div>
      <button className="qp-btn qp-btn-primary" onClick={onRecord} style={{ marginTop: 12 }}>
        Record observation
      </button>
    </div>
  );
}
