import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FULL_ELEMENTS, getGridPosition } from "../../physics/periodicTable";
import { getElementInfo, CATEGORY_LABEL, CATEGORY_COLOR } from "../../physics/elementInfo";

const CELLS = FULL_ELEMENTS.map((el) => ({ ...el, pos: getGridPosition(el.Z), info: getElementInfo(el.Z) }));

function Cell({ el, selected, dim, onSelect }) {
  const color = CATEGORY_COLOR[el.info.category];
  const style = {
    gridColumn: el.pos.footnote ? el.pos.footnoteCol : el.pos.group,
    gridRow: el.pos.footnote ? undefined : el.pos.period,
    borderColor: selected ? color : "rgba(100,116,139,0.28)",
    background: selected ? `${color}38` : "rgba(255,255,255,0.55)",
    opacity: dim ? 0.28 : 1,
  };
  return (
    <button
      className="qp-pt-cell"
      style={style}
      onClick={() => onSelect(el.Z)}
      title={`${el.name} (${el.symbol}) — ${CATEGORY_LABEL[el.info.category]}`}
    >
      <span className="qp-pt-z">{el.Z}</span>
      <span className="qp-pt-sym" style={{ color }}>{el.symbol}</span>
    </button>
  );
}

export default function PeriodicTableGrid({ selectedZ, onSelect }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const matches = (el) => !q || el.name.toLowerCase().includes(q) || el.symbol.toLowerCase().includes(q) || String(el.Z) === q;

  const mainCells = useMemo(() => CELLS.filter((el) => !el.pos.footnote), []);
  const lanthanides = useMemo(() => CELLS.filter((el) => el.pos.footnoteRow === 1), []);
  const actinides = useMemo(() => CELLS.filter((el) => el.pos.footnoteRow === 2), []);

  return (
    <div className="qp-card">
      <h4>Periodic table</h4>
      <div className="qp-search-row">
        <Search size={13} />
        <input
          className="qp-search-input"
          placeholder="Search by name, symbol, or number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="qp-pt-scroll">
        <div className="qp-pt-grid">
          {mainCells.map((el) => (
            <Cell key={el.Z} el={el} selected={el.Z === selectedZ} dim={!matches(el)} onSelect={onSelect} />
          ))}
        </div>
        <div className="qp-pt-grid qp-pt-footnotes">
          {lanthanides.map((el) => (
            <Cell key={el.Z} el={el} selected={el.Z === selectedZ} dim={!matches(el)} onSelect={onSelect} />
          ))}
        </div>
        <div className="qp-pt-grid qp-pt-footnotes">
          {actinides.map((el) => (
            <Cell key={el.Z} el={el} selected={el.Z === selectedZ} dim={!matches(el)} onSelect={onSelect} />
          ))}
        </div>
      </div>
      <div className="qp-pt-legend">
        {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
          <span key={key} className="qp-pt-legend-item">
            <span className="qp-pt-swatch" style={{ background: CATEGORY_COLOR[key] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
