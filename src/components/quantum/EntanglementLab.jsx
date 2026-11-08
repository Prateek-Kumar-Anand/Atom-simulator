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
          <HelpCircle size={40} color="#64748b" />
        ) : value === "↑" ? (
          <ArrowUp size={40} color="#0fa3b8" />
        ) : (
          <ArrowDown size={40} color="#e23d57" />
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
  const [history, setHistory] = useState([]); // most recent 12 pairs, for the on-screen list
  const [tally, setTally] = useState({ total: 0, opposite: 0 }); // running totals over the whole session

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

  // Called once, when the second particle of a pair is measured. The running counter (not the
  // length of the capped list) numbers the pairs — the old code derived the id from the list
  // length, so after 12 pairs every new entry got id 13, producing duplicate React keys and a
  // tally frozen at 12.
  const recordIfComplete = (a, b) => {
    const id = tally.total + 1;
    setTally((t) => ({ total: t.total + 1, opposite: t.opposite + (a !== b ? 1 : 0) }));
    setHistory((h) => [{ i: id, a, b }, ...h].slice(0, 12));
  };

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
            <Readout label="Pairs measured" value={tally.total} />
            <Readout label="Anti-correlated" value={tally.total > 0 ? `${tally.opposite}/${tally.total}` : "—"} accent="#0fa3b8" />
          </div>
          <div style={{ maxHeight: 160, overflowY: "auto" }} aria-label="Most recent 12 pairs">
            {history.map((h) => (
              <div key={h.i} className="qp-shellrow small qp-muted" style={{ padding: "4px 0" }}>
                <span>#{h.i}</span><span>A: {h.a}</span><span>B: {h.b}</span>
              </div>
            ))}
          </div>
          <button
            className="qp-btn"
            disabled={!bothKnown}
            onClick={() => log("Quantum: Entanglement", `Pair #${tally.total}`, `A=${revealedA}, B=${revealedB} (always opposite)`)}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
