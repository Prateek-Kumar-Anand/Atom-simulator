import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FULL_ELEMENTS, BLOCK_COLOR } from "../../physics/periodicTable";

/** Full 118-element grid picker with a text filter, for modules that sweep the whole periodic table. */
export default function FullElementPicker({ selectedZ, onSelect }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FULL_ELEMENTS;
    return FULL_ELEMENTS.filter(
      (e) => e.symbol.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || String(e.Z) === q
    );
  }, [query]);

  return (
    <div>
      <div className="qp-search-row">
        <Search size={13} />
        <input
          className="qp-search-input"
          placeholder="Filter by name, symbol, or Z…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="qp-element-grid-scroll">
        <div className="qp-element-grid">
          {filtered.map((e) => (
            <button
              key={e.Z}
              className={"qp-element-btn" + (e.Z === selectedZ ? " active" : "")}
              style={{ "--accent": BLOCK_COLOR[e.block] }}
              onClick={() => onSelect(e.Z)}
              title={`${e.name} (Z=${e.Z})`}
            >
              <span className="num">{e.Z}</span>
              <span className="sym">{e.symbol}</span>
            </button>
          ))}
          {filtered.length === 0 && <span className="qp-muted small">No matches.</span>}
        </div>
      </div>
    </div>
  );
}
