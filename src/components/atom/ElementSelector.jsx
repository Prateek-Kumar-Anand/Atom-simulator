import React from "react";
import { ELEMENTS, CATEGORY_COLOR } from "../../physics/atomicData";

export default function ElementSelector({ selectedZ, onSelect }) {
  return (
    <div className="qp-element-grid">
      {ELEMENTS.map((e) => (
        <button
          key={e.Z}
          className={"qp-element-btn" + (e.Z === selectedZ ? " active" : "")}
          style={{ "--accent": CATEGORY_COLOR[e.category] }}
          onClick={() => onSelect(e.Z)}
          title={`${e.name} (Z=${e.Z})`}
        >
          <span className="num">{e.Z}</span>
          <span className="sym">{e.symbol}</span>
        </button>
      ))}
    </div>
  );
}
