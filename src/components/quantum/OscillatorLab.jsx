import React, { useEffect, useRef, useState } from "react";
import { Info, Play, Pause } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, Chips, pathD } from "../math/MathPlot";
import { hoPsi, hoTurningPoint, hoClassicalDensity, hoForbiddenProbability, hoLength, HC_EV_NM } from "../../physics/quantumLab";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const XI = 7;

export default function OscillatorLab() {
  const { log } = useApp();
  const [mode, setMode] = useState("fock");
  const [n, setN] = useState(3);
  const [hw, setHw] = useState(0.2);
  const [alpha, setAlpha] = useState(2.5);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const raf = useRef(0);

  useEffect(() => {
    if (mode !== "coherent" || !playing) return undefined;
    let last = performance.now();
    const loop = (now) => { setPhase((p) => (p + ((now - last) / 1000) * (2 * Math.PI / 5)) % (2 * Math.PI)); last = now; raf.current = requestAnimationFrame(loop); };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [mode, playing]);

  const coh = mode === "coherent";
  const a = hoLength(hw); // nm
  const xs = Array.from({ length: 401 }, (_, i) => -XI + (2 * XI * i) / 400);
  const xi0 = Math.SQRT2 * alpha * Math.cos(phase);
  const dens = (x) => (coh ? Math.exp(-Math.pow(x - xi0, 2)) / Math.sqrt(Math.PI) : Math.pow(hoPsi(n, x), 2));
  const dPts = xs.map((x) => [x, dens(x)]);
  const cPts = xs.map((x) => (coh ? null : [x, hoClassicalDensity(n, x)]));
  const E = coh ? alpha * alpha + 0.5 : n + 0.5;
  const topE = Math.max(E + 2, 6);
  const maxD = Math.max(...dPts.map((p) => p[1]), 1e-9);
  const sc = 0.9 / maxD;
  const turn = coh ? Math.SQRT2 * alpha : hoTurningPoint(n);
  const forb = coh ? null : hoForbiddenProbability(n);
  const maxDensity2 = Math.max(...dPts.map((p) => p[1]), ...cPts.map((p) => (p ? Math.min(p[1], 1.2) : 0)), 0.1);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> In a parabolic potential the energy levels are equally spaced, Eₙ = (n + ½)ħω. The wavefunction leaks into the classically
          forbidden region beyond the turning points. A <em>coherent state</em> is the quantum state closest to a classical oscillating mass: a Gaussian that does not spread.
        </p>
        <div className="qp-card">
          <h4>Potential V = ½mω²x², energy level and density (drawn at the level)</h4>
          <MathPlot xr={[-XI, XI]} yr={[0, topE]} height={300} xLabel="x / a" yLabel="E / ħω" label="Harmonic oscillator potential and state">
            {({ X, Y, W }) => {
              const pot = xs.map((x) => [x, Math.min(topE, 0.5 * x * x)]);
              return (
                <>
                  {Array.from({ length: Math.floor(topE) + 1 }, (_, k) => <line key={k} x1={0} x2={W} y1={Y(k + 0.5)} y2={Y(k + 0.5)} stroke={PLOT.grid} strokeDasharray="2 5" />)}
                  <rect x={X(-XI)} y={0} width={X(-turn) - X(-XI)} height={Y(0)} fill="rgba(220,59,84,0.06)" />
                  <rect x={X(turn)} y={0} width={X(XI) - X(turn)} height={Y(0)} fill="rgba(220,59,84,0.06)" />
                  <path d={pathD(pot, X, Y)} fill="none" stroke={PLOT.ink} strokeWidth={2.2} />
                  <line x1={0} x2={W} y1={Y(E)} y2={Y(E)} stroke={PLOT.amber} strokeDasharray="6 4" strokeWidth={1.6} />
                  <path d={`${pathD(dPts.map((p) => [p[0], E + p[1] * sc]), X, Y)}`} fill="none" stroke={PLOT.teal} strokeWidth={2.4} />
                </>
              );
            }}
          </MathPlot>
        </div>
        <div className="qp-card">
          <h4>{coh ? "Coherent state |ψ|² (moves like a classical oscillator)" : "Quantum |ψₙ|² versus the classical density"}</h4>
          <MathPlot xr={[-XI, XI]} yr={[0, maxDensity2 * 1.15]} height={200} xLabel="x / a" label="Quantum and classical probability density">
            {({ X, Y }) => (
              <>
                <path d={`${pathD(dPts, X, Y)} L${X(XI)},${Y(0)} L${X(-XI)},${Y(0)} Z`} fill="rgba(14,142,163,0.22)" stroke={PLOT.teal} strokeWidth={2} />
                {!coh && <path d={pathD(cPts.map((p) => (p ? [p[0], Math.min(p[1], maxDensity2 * 1.1)] : null)), X, Y)} fill="none" stroke={PLOT.red} strokeWidth={1.8} strokeDasharray="5 3" />}
              </>
            )}
          </MathPlot>
          {!coh && <p className="qp-muted small" style={{ margin: "8px 0 0" }}><span style={{ color: PLOT.teal }}>●</span> quantum |ψₙ|² &nbsp; <span style={{ color: PLOT.red }}>●</span> classical (time spent at each x) — they agree on average for large n</p>}
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Oscillator</h4>
          <Chips options={[{ key: "fock", label: "Energy eigenstate" }, { key: "coherent", label: "Coherent state" }]} value={mode} onChange={setMode} />
          {coh
            ? <Slider label="Amplitude α" value={alpha} min={0} max={4} step={0.1} onChange={setAlpha} format={(v) => v.toFixed(1)} />
            : <Slider label="Quantum number n" value={n} min={0} max={14} step={1} onChange={setN} />}
          <Slider label="Level spacing ħω" value={hw} min={0.05} max={1} step={0.05} onChange={setHw} format={(v) => `${v.toFixed(2)} eV`} />
          {coh && <button className="qp-btn" onClick={() => setPlaying((p) => !p)}>{playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : "Animate"}</button>}
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label={coh ? "⟨E⟩" : `E${n}`} value={`${fmt(E * hw, 4)} eV`} accent="#0e8ea3" />
            <Readout label="Zero-point energy ½ħω" value={`${fmt(hw / 2, 3)} eV`} />
            <Readout label="Length scale a = √(ħ/mω)" value={`${fmt(a, 3)} nm`} />
            <Readout label="Turning point" value={`±${fmt(turn * a, 3)} nm`} accent="#c2740a" />
            <Readout label="P(classically forbidden)" value={coh ? "—" : `${fmt(forb * 100, 3)} %`} accent="#dc3b54" />
            <Readout label="Photon for n → n−1" value={`${fmt(HC_EV_NM / hw, 4)} nm`} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            {coh ? "Δx stays a/√2 for all time — the minimum-uncertainty Gaussian just slides back and forth." : "n = 0 has a 15.7 % chance to be found where a classical particle of that energy could never go; the fraction falls as n grows."}
          </p>
          <button className="qp-btn" onClick={() => log("Quantum: Harmonic Oscillator", `${coh ? `coherent α=${alpha.toFixed(1)}` : `n=${n}`}, ħω=${hw.toFixed(2)} eV`, `E=${fmt(E * hw, 4)} eV, a=${fmt(a, 3)} nm${coh ? "" : `, P(forbidden)=${fmt(forb * 100, 3)} %`}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
