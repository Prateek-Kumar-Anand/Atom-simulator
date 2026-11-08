import React, { useRef, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Arrow, Slider, Chips } from "../math/MathPlot";
import * as Cx from "../../math/complex";
import { useApp } from "../../context/AppContext";

const OPS = [
  { key: "add", label: "z₁ + z₂" },
  { key: "mul", label: "z₁ · z₂" },
  { key: "div", label: "z₁ / z₂" },
  { key: "pow", label: "z₁ⁿ" },
  { key: "roots", label: "ⁿ√z₁" },
];
const R = 4;
const round2 = (v) => Number(Math.max(-R, Math.min(R, v)).toFixed(2));

function compute(op, z1, z2, n) {
  if (op === "add") return { w: Cx.add(z1, z2) };
  if (op === "mul") return { w: Cx.mul(z1, z2) };
  if (op === "div") return { w: Cx.abs(z2) < 1e-9 ? [NaN, NaN] : Cx.div(z1, z2) };
  if (op === "pow") return { w: Cx.powInt(z1, n) };
  const roots = Cx.nthRoots(z1, n);
  return { w: roots[0], roots };
}

export default function ArgandLab() {
  const { log } = useApp();
  const [z1, setZ1] = useState([1.5, 1]);
  const [z2, setZ2] = useState([0.6, -1.2]);
  const [op, setOp] = useState("mul");
  const [n, setN] = useState(3);
  const grab = useRef(null);

  const { w, roots } = compute(op, z1, z2, n);
  const usesZ2 = op === "add" || op === "mul" || op === "div";

  const onPointer = (type, p) => {
    if (type === "down") {
      const d1 = Math.hypot(p.x - z1[0], p.y - z1[1]);
      const d2 = usesZ2 ? Math.hypot(p.x - z2[0], p.y - z2[1]) : Infinity;
      grab.current = d2 < d1 ? 2 : 1;
    }
    if (type === "up") return;
    const v = [round2(p.x), round2(p.y)];
    if (grab.current === 2) setZ2(v); else setZ1(v);
  };

  const label = OPS.find((o) => o.key === op).label.replace("n", String(n));
  const mulProp = op === "mul" || op === "div" || op === "pow";

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Drag z₁ (teal) and z₂ (violet) on the complex plane. Multiplication multiplies lengths and <em>adds angles</em>;
          roots of z₁ sit on a regular n-gon (De Moivre).
        </p>
        <div className="qp-card">
          <h4>Argand diagram — {label}</h4>
          <MathPlot xr={[-R, R]} yr={[-R, R]} square xLabel="Re" yLabel="Im" onPointer={onPointer} label="Complex plane">
            {({ X, Y, sx }) => {
              const A = (z, color, width = 2.4, dashed = false) => <Arrow x1={X(0)} y1={Y(0)} x2={X(z[0])} y2={Y(z[1])} color={color} width={width} dashed={dashed} />;
              const dot = (z, color, r = 6) => <circle cx={X(z[0])} cy={Y(z[1])} r={r} fill={color} stroke="#fff" strokeWidth={2} style={{ cursor: "grab" }} />;
              const tag = (z, text, color) => <text x={X(z[0]) + 9} y={Y(z[1]) - 9} fontSize={12} fontWeight={600} fill={color} stroke="rgba(255,255,255,0.85)" strokeWidth={3} paintOrder="stroke">{text}</text>;
              const wOk = Number.isFinite(w[0]) && Number.isFinite(w[1]);
              return (
                <>
                  <circle cx={X(0)} cy={Y(0)} r={sx} fill="none" stroke={PLOT.gridStrong} strokeDasharray="3 4" />
                  {op === "add" && wOk && (
                    <polyline fill="none" stroke={PLOT.axis} strokeDasharray="4 4" points={`${X(z1[0])},${Y(z1[1])} ${X(w[0])},${Y(w[1])} ${X(z2[0])},${Y(z2[1])}`} />
                  )}
                  {op === "roots" && roots && (
                    <>
                      <circle cx={X(0)} cy={Y(0)} r={Cx.abs(roots[0]) * sx} fill="none" stroke="rgba(194,116,10,0.45)" />
                      <polygon fill="rgba(194,116,10,0.08)" stroke="rgba(194,116,10,0.55)" points={roots.map((r) => `${X(r[0])},${Y(r[1])}`).join(" ")} />
                      {roots.map((r, i) => <circle key={i} cx={X(r[0])} cy={Y(r[1])} r={i === 0 ? 5.5 : 4} fill={PLOT.amber} stroke="#fff" strokeWidth={1.5} />)}
                    </>
                  )}
                  {A(z1, PLOT.teal)}
                  {usesZ2 && A(z2, PLOT.violet)}
                  {wOk && op !== "roots" && A(w, PLOT.amber, 2.8)}
                  {mulProp && wOk && Cx.abs(w) > 0.05 && (() => {
                    // angle arc from the positive real axis to the result
                    const th = Cx.arg(w), rr = 0.55, steps = 24;
                    const pts = Array.from({ length: steps + 1 }, (_, i) => { const t = (th * i) / steps; return `${X(rr * Math.cos(t))},${Y(rr * Math.sin(t))}`; });
                    return <polyline fill="none" stroke={PLOT.amber} strokeWidth={1.4} points={pts.join(" ")} />;
                  })()}
                  {dot(z1, PLOT.teal)}{tag(z1, "z₁", PLOT.teal)}
                  {usesZ2 && <>{dot(z2, PLOT.violet)}{tag(z2, "z₂", PLOT.violet)}</>}
                  {wOk && op !== "roots" && <>{dot(w, PLOT.amber, 5)}{tag(w, "w", PLOT.amber)}</>}
                </>
              );
            }}
          </MathPlot>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Operation</h4>
          <Chips options={OPS} value={op} onChange={setOp} />
          {(op === "pow" || op === "roots") && <Slider label="n" value={n} min={2} max={12} step={1} onChange={setN} />}
          <Slider label="Re z₁" value={z1[0]} min={-R} max={R} step={0.05} onChange={(v) => setZ1([v, z1[1]])} format={(v) => v.toFixed(2)} />
          <Slider label="Im z₁" value={z1[1]} min={-R} max={R} step={0.05} onChange={(v) => setZ1([z1[0], v])} format={(v) => v.toFixed(2)} />
          {usesZ2 && (
            <>
              <Slider label="Re z₂" value={z2[0]} min={-R} max={R} step={0.05} onChange={(v) => setZ2([v, z2[1]])} format={(v) => v.toFixed(2)} />
              <Slider label="Im z₂" value={z2[1]} min={-R} max={R} step={0.05} onChange={(v) => setZ2([z2[0], v])} format={(v) => v.toFixed(2)} />
            </>
          )}
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid" style={{ gridTemplateColumns: "1fr" }}>
            <Readout label="z₁ (rectangular)" value={Cx.formatC(z1, 2)} accent="#0e8ea3" />
            <Readout label="z₁ (polar)" value={Cx.formatPolar(z1, 2)} />
            {usesZ2 && <Readout label="z₂ (rectangular)" value={Cx.formatC(z2, 2)} accent="#8b4fd8" />}
            <Readout label={op === "roots" ? "Principal root" : `Result  ${label}`} value={Cx.formatC(w, 3)} accent="#c2740a" />
            <Readout label="Result (polar)" value={Cx.formatPolar(w, 3)} />
          </div>
          {mulProp && <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            {op === "pow" ? `|zⁿ| = |z|ⁿ and arg(zⁿ) = n·arg z (mod 360°).` : op === "mul" ? "|z₁z₂| = |z₁||z₂| and arg(z₁z₂) = arg z₁ + arg z₂." : "|z₁/z₂| = |z₁|/|z₂| and arg(z₁/z₂) = arg z₁ − arg z₂."}
          </p>}
          {op === "roots" && <p className="qp-muted small" style={{ margin: "0 0 10px" }}>All {n} roots have modulus |z₁|^(1/{n}) and are spaced {(360 / n).toFixed(1)}° apart.</p>}
          <button className="qp-btn" onClick={() => log("Complex Analysis: Argand Plane", `${label}, z₁=${Cx.formatC(z1, 2)}${usesZ2 ? `, z₂=${Cx.formatC(z2, 2)}` : ""}`, `${op === "roots" ? "principal root" : "result"} = ${Cx.formatC(w, 3)} (${Cx.formatPolar(w, 3)})`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
