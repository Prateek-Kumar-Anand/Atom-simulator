import React, { useState } from "react";
import { ArrowUp, ArrowDown, HelpCircle, RotateCcw, Radio } from "lucide-react";
import Readout from "../common/Readout";
import { measureEntangledPair } from "../../physics/quantum";
import { useApp } from "../../context/AppContext";

function ParticleCard({ label, value }) {
  return (
    <div className="qp-card" style={{ textAlign: "center", flex: 1 }}>
      <h4>{label}</h4>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 80 }}>
        {value === null ? (
          <HelpCircle size={40} color="#7c8a9c" />
        ) : value === "↑" ? (
          <ArrowUp size={40} color="#4fd8e0" />
        ) : (
          <ArrowDown size={40} color="#ef5b6f" />
        )}
      </div>
      <div className="small qp-muted">{value === null ? "Not yet measured" : `Spin ${value === "↑" ? "up" : "down"}`}</div>
    </div>
  );
}

export default function EntanglementLab() {
  const { log } = useApp();
  const [pair, setPair] = useState(null); // the hidden, already-determined pair once generated
  const [revealedA, setRevealedA] = useState(null);
  const [revealedB, setRevealedB] = useState(null);
  const [history, setHistory] = useState([]);

  const generatePair = () => {
    setPair(measureEntangledPair());
    setRevealedA(null);
    setRevealedB(null);
  };

  const measureA = () => {
    if (!pair) return;
    setRevealedA(pair.a);
    if (revealedB !== null) recordIfComplete(pair.a, revealedB);
  };
  const measureB = () => {
    if (!pair) return;
    setRevealedB(pair.b);
    if (revealedA !== null) recordIfComplete(revealedA, pair.b);
  };

  const recordIfComplete = (a, b) => {
    setHistory((h) => [{ i: h.length + 1, a, b }, ...h].slice(0, 12));
  };

  // When both sides have just been revealed in the same click sequence, the effect above may
  // race — so also catch the "both now known" case directly here for a reliable log entry.
  const bothKnown = pair && revealedA !== null && revealedB !== null;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Radio size={14} /> Generate an entangled pair, then measure each particle separately —
          notice each individual result is random, but the two are always perfectly opposite.
        </p>
        <div style={{ display: "flex", gap: 14 }}>
          <ParticleCard label="Particle A" value={revealedA} />
          <ParticleCard label="Particle B" value={revealedB} />
        </div>
        <div className="qp-card">
          <h4>Why this isn&rsquo;t faster-than-light communication</h4>
          <p className="small qp-muted" style={{ lineHeight: 1.6 }}>
            Measuring particle A gives a genuinely random result (50/50 up or down) — there is no way
            to choose or influence which outcome appears. Particle B&rsquo;s result is correlated with
            A&rsquo;s, but whoever holds B only learns that correlation by measuring their own particle,
            which also looks locally random until compared against A&rsquo;s record. Confirming the
            correlation always requires sending that record by ordinary means, no faster than light.
            No usable signal — no bit of chosen information — ever passes from one side to the other
            at the moment of measurement (the no-communication theorem).
          </p>
        </div>
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Controls</h4>
          <button className="qp-btn qp-btn-primary" onClick={generatePair} style={{ marginBottom: 8 }}>
            <RotateCcw size={14} /> Generate new entangled pair
          </button>
          <div className="qp-btn-row">
            <button className="qp-btn" disabled={!pair || revealedA !== null} onClick={measureA}>Measure A</button>
            <button className="qp-btn" disabled={!pair || revealedB !== null} onClick={measureB}>Measure B</button>
          </div>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Measurements" value={history.length} />
            <Readout label="Anti-correlated" value={history.length > 0 ? `${history.filter((h) => h.a !== h.b).length}/${history.length}` : "—"} accent="#4fd8e0" />
          </div>
          <div style={{ maxHeight: 160, overflowY: "auto" }}>
            {history.map((h) => (
              <div key={h.i} className="qp-shellrow small qp-muted" style={{ padding: "4px 0" }}>
                <span>#{h.i}</span><span>A: {h.a}</span><span>B: {h.b}</span>
              </div>
            ))}
          </div>
          <button
            className="qp-btn"
            disabled={!bothKnown}
            onClick={() => log("Quantum: Entanglement", `Pair #${history.length}`, `A=${revealedA}, B=${revealedB} (always opposite)`)}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
