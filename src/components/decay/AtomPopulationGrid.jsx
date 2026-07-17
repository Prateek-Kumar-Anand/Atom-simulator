import React from "react";

export default function AtomPopulationGrid({ aliveArray }) {
  return (
    <div className="qp-card">
      <div className="qp-atom-grid">
        {aliveArray.map((alive, i) => (
          <span key={i} className={"qp-atom-dot" + (alive ? "" : " decayed")} />
        ))}
      </div>
    </div>
  );
}
