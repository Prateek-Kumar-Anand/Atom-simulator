import React, { useEffect, useRef, useState } from "react";
import { Info, Play, Pause } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, Chips, pathD } from "../math/MathPlot";
import { boxEnergy, boxPsi, boxProbLeft, boxMatrixX, boxSuperDensity, HBAR_EV_FS, HC_EV_NM } from "../../physics/quantumLab";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const band = (nm) => (nm < 380 ? "ultraviolet" : nm < 750 ? "visible" : nm < 2500 ? "near-infrared" : "infrared");

export default function BoxLab() {
  const { log } = useApp();
  const [n, setN] = useState(2);
  const [n2, setN2] = useState(3);
  const [L, setL] = useState(1);
  const [mode, setMode] = useState("single");
  const [alpha, setAlpha] = useState(45);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const raf = useRef(0);

  const sup = mode === "super" && n2 !== n;
  const E1 = boxEnergy(n, L), E2 = boxEnergy(n2, L);
  const dE = Math.abs(E2 - E1);
  const period = sup ? (2 * Math.PI * HBAR_EV_FS) / dE : NaN; // fs
  const a = (alpha * Math.PI) / 180;

  useEffect(() => {
    if (!sup || !playing) return undefined;
    let last = performance.now();
    const loop = (now) => { setPhase((p) => (p + ((now - last) / 1000) * (2 * Math.PI / 4)) % (2 * Math.PI)); last = now; raf.current = requestAnimationFrame(loop); };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [sup, playing]);

  const tFs = sup ? (phase / (2 * Math.PI)) * period : 0;
  const xs = Array.from({ length: 241 }, (_, i) => (L * i) / 240);
  const dens = (x) => (sup ? boxSuperDensity(n, n2, a, L, x, tFs) : Math.pow(boxPsi(n, L, x), 2));
  const dPts = xs.map((x) => [x, dens(x)]);
  const psiA = xs.map((x) => [x, boxPsi(n, L, x)]);
  const psiB = xs.map((x) => [x, boxPsi(n2, L, x)]);
  const amp = Math.sqrt(2 / L);
  const meanX = sup ? L / 2 + 2 * Math.cos(a) * Math.sin(a) * boxMatrixX(n, n2, L) * Math.cos(phase) : L / 2;
  const pLeft = sup ? null : boxProbLeft(n, 1 / 3);
  const lam = n > 1 ? HC_EV_NM / (boxEnergy(n, L) - boxEnergy(n - 1, L)) : null;
  const ladder = Array.from({ length: 8 }, (_, i) => i + 1);
  const Emax = boxEnergy(8, L);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> An electron trapped between two impenetrable walls can only have the standing-wave energies Eₙ = n²h²/8mL². Shrink the box and every
          level rises (confinement costs energy). Superpose two levels and the density sloshes back and forth at the beat frequency (E₂ − E₁)/h.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div className="qp-card" style={{ flex: "2 1 360px" }}>
            <h4>{sup ? "Component wavefunctions ψₙ(x)" : `Wavefunction ψ${n}(x)`}</h4>
            <MathPlot xr={[0, L]} yr={[-amp * 1.3, amp * 1.3]} height={190} xLabel="x (nm)" label="Box wavefunctions">
              {({ X, Y }) => (
                <>
                  <path d={pathD(psiA, X, Y)} fill="none" stroke={PLOT.blue} strokeWidth={2.4} />
                  {sup && <path d={pathD(psiB, X, Y)} fill="none" stroke={PLOT.violet} strokeWidth={2.4} />}
                </>
              )}
            </MathPlot>
            <h4 style={{ marginTop: 14 }}>Probability density |ψ|²{sup ? " (animated)" : ""}</h4>
            <MathPlot xr={[0, L]} yr={[0, ((2 / L) * (sup ? Math.pow(Math.cos(a) + Math.sin(a), 2) : 1)) * 1.12]} height={190} xLabel="x (nm)" label="Probability density">
              {({ X, Y }) => (
                <>
                  <path d={`${pathD(dPts, X, Y)} L${X(L)},${Y(0)} L${X(0)},${Y(0)} Z`} fill="rgba(14,142,163,0.22)" stroke={PLOT.teal} strokeWidth={2.2} />
                  {!sup && <rect x={X(0)} y={0} width={X(L / 3) - X(0)} height={Y(0)} fill="rgba(194,116,10,0.10)" />}
                </>
              )}
            </MathPlot>
          </div>
          <div className="qp-card" style={{ flex: "1 1 200px" }}>
            <h4>Energy levels</h4>
            <MathPlot xr={[0, 1]} yr={[0, Emax * 1.08]} width={260} height={380} xTicks={false} grid={false} axes={false} label="Energy ladder">
              {({ X, Y }) => (
                <>
                  {ladder.map((k) => {
                    const on = k === n || (sup && k === n2);
                    return (
                      <g key={k}>
                        <line x1={X(0.18)} x2={X(0.95)} y1={Y(boxEnergy(k, L))} y2={Y(boxEnergy(k, L))} stroke={on ? (k === n ? PLOT.blue : PLOT.violet) : PLOT.axis} strokeWidth={on ? 3 : 1.5} />
                        <text x={X(0.2)} y={Y(boxEnergy(k, L)) - 4} fontSize={10} fill={on ? PLOT.ink : PLOT.text}>n = {k}</text>
                      </g>
                    );
                  })}
                </>
              )}
            </MathPlot>
          </div>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Box and state</h4>
          <Chips options={[{ key: "single", label: "Energy eigenstate" }, { key: "super", label: "Superposition" }]} value={mode} onChange={setMode} />
          <Slider label="Box width L" value={L} min={0.2} max={2} step={0.05} onChange={setL} format={(v) => `${v.toFixed(2)} nm`} />
          <Slider label={mode === "super" ? "Level n₁" : "Level n"} value={n} min={1} max={8} step={1} onChange={setN} />
          {mode === "super" && (
            <>
              <Slider label="Level n₂" value={n2} min={1} max={8} step={1} onChange={setN2} />
              <Slider label="Mix angle α (cos α |n₁⟩ + sin α |n₂⟩)" value={alpha} min={0} max={90} step={1} onChange={setAlpha} format={(v) => `${v}°`} />
              <button className="qp-btn" onClick={() => setPlaying((p) => !p)}>{playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : "Animate"}</button>
            </>
          )}
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label={`E${n}`} value={`${fmt(E1, 4)} eV`} accent="#0e8ea3" />
            {sup ? <Readout label={`E${n2}`} value={`${fmt(E2, 4)} eV`} accent="#8b4fd8" /> : <Readout label="E ∝ n² (E/E₁)" value={n * n} />}
            {sup ? <Readout label="Beat period 2πħ/ΔE" value={Number.isFinite(period) ? `${fmt(period, 3)} fs` : "—"} /> : <Readout label="P(0 < x < L/3)" value={fmt(pLeft, 4)} accent="#c2740a" />}
            {sup ? <Readout label="⟨x⟩ now" value={`${fmt(meanX, 3)} nm`} /> : <Readout label={n > 1 ? `Photon ${n}→${n - 1}` : "Zero-point energy"} value={lam ? `${fmt(lam, 4)} nm (${band(lam)})` : `${fmt(E1, 3)} eV`} />}
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            {sup ? (n === n2 ? "Choose two different levels to see the density oscillate." : "A superposition is not an energy eigenstate: its density is not static, and ⟨x⟩ oscillates about L/2 only when n₁ + n₂ is odd.") : "Higher n → more nodes (n − 1) and a density that looks increasingly like the classical, uniform one."}
          </p>
          <button className="qp-btn" onClick={() => log("Quantum: Particle in a Box", `${sup ? `superposition n=${n},${n2}, α=${alpha}°` : `n=${n}`}, L=${L.toFixed(2)} nm`, sup ? `E=${fmt(E1, 4)}/${fmt(E2, 4)} eV, beat period ${fmt(period, 3)} fs` : `E=${fmt(E1, 4)} eV, P(0<x<L/3)=${fmt(pLeft, 4)}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
