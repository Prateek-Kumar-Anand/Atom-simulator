import React, { useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider } from "../math/MathPlot";
import EquationInput, { useFormula } from "../math/EquationInput";
import * as Cx from "../../math/complex";
import { useApp } from "../../context/AppContext";

export default function DomainColorLab() {
  const { log } = useApp();
  const [key, setKey] = useState("z3m1");
  const [half, setHalf] = useState(2.5);
  const [probe, setProbe] = useState([1, 0.5]);
  const [custom, setCustom] = useState("(z^2 - 1)/(z^2 + z + 1)");
  const formula = useFormula(custom, "complex");
  const isCustom = key === "custom";
  const def = isCustom
    ? { key: "custom", label: custom, f: formula.f || ((z) => z), note: "Your own formula: zeros and poles show up as points where all colours meet." }
    : Cx.COLOR_FUNCTIONS.find((f) => f.key === key) || Cx.COLOR_FUNCTIONS[0];
  const w = def.f(probe);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Domain colouring shows a complex function as a picture: <strong>hue = arg f(z)</strong> and <strong>brightness bands = |f(z)|</strong>.
          Zeros and poles appear as points where every colour meets; the colours wind in opposite directions around zeros and poles.
        </p>
        <div className="qp-card">
          <h4>f(z) = {def.label}</h4>
          <MathPlot
            xr={[-half, half]} yr={[-half, half]} square paintRes={240} paintKey={`${key}|${half}|${isCustom ? custom : ""}`}
            paint={(x, y) => Cx.domainColor(def.f([x, y]))}
            xLabel="Re z" yLabel="Im z" label="Domain colouring of the function"
            onPointer={(t, p) => { if (t !== "up") setProbe([Number(p.x.toFixed(2)), Number(p.y.toFixed(2))]); }}
          >
            {({ X, Y }) => (
              <>
                <circle cx={X(probe[0])} cy={Y(probe[1])} r={6} fill="none" stroke="#fff" strokeWidth={3} />
                <circle cx={X(probe[0])} cy={Y(probe[1])} r={6} fill="none" stroke={PLOT.ink} strokeWidth={1.4} />
              </>
            )}
          </MathPlot>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Function</h4>
          <select className="qp-select" value={key} onChange={(e) => setKey(e.target.value)} aria-label="Function">
            {Cx.COLOR_FUNCTIONS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            <option value="custom">✎ Custom formula…</option>
          </select>
          {isCustom && (
            <EquationInput
              label="Type your own function" prefix="f(z) =" value={custom} onChange={setCustom} error={formula.error}
              hint="z, i, pi, e, + − * / ^, sin cos tan exp log sqrt sinh cosh conj abs"
              examples={["(z^2 - 1)/(z^2 + z + 1)", "z^5 - 1", "tan(z)", "z^z", "sin(1/z)", "exp(z)/(z - 1)", "(z - i)/(z + i)"]}
            />
          )}
          <Slider label="Window half-width" value={half} min={1} max={8} step={0.25} onChange={setHalf} format={(v) => v.toFixed(2)} />
          <p className="qp-muted small" style={{ margin: 0 }}>{def.note}</p>
        </div>
        <div className="qp-card">
          <h4>Probe (click or drag on the picture)</h4>
          <div className="qp-readout-grid" style={{ gridTemplateColumns: "1fr" }}>
            <Readout label="z" value={Cx.formatC(probe, 2)} />
            <Readout label="f(z)" value={Cx.formatC(w, 4)} accent="#c2740a" />
            <Readout label="|f(z)|" value={Number.isFinite(Cx.abs(w)) ? Cx.abs(w).toFixed(4) : "—"} accent="#0e8ea3" />
            <Readout label="arg f(z)" value={Number.isFinite(Cx.arg(w)) ? `${((Cx.arg(w) * 180) / Math.PI).toFixed(1)}°` : "—"} />
          </div>
          <button className="qp-btn" onClick={() => log("Complex Analysis: Domain Colouring", `f(z)=${def.label}, z=${Cx.formatC(probe, 2)}`, `f(z)=${Cx.formatC(w, 4)}, |f|=${Cx.abs(w).toFixed(4)}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
