import React, { useEffect, useMemo, useState } from "react";
import { Info, Play, Pause, RotateCcw } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, pathD } from "../math/MathPlot";
import { createPacketSim, makePotential, POTENTIALS } from "../../physics/quantumLab";
import { HB2M, HBAR_EV_FS } from "../../physics/quantumLab";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

/** Plane-wave transmission through a rectangular barrier (for comparison with the packet). */
function barrierT(E, V0, w) {
  if (E <= 0) return 0;
  if (Math.abs(E - V0) < 1e-9) return 1 / (1 + (w * w * V0) / (4 * HB2M));
  if (E < V0) { const k = Math.sqrt((V0 - E) / HB2M); return 1 / (1 + (V0 * V0 * Math.pow(Math.sinh(k * w), 2)) / (4 * E * (V0 - E))); }
  const q = Math.sqrt((E - V0) / HB2M);
  return 1 / (1 + (V0 * V0 * Math.pow(Math.sin(q * w), 2)) / (4 * E * (E - V0)));
}

export default function WavePacketLab() {
  const { log } = useApp();
  const [pot, setPot] = useState("barrier");
  const [V0, setV0] = useState(1);
  const [w, setW] = useState(0.6);
  const [E, setE] = useState(0.5);
  const [sigma, setSigma] = useState(2);
  const [speed, setSpeed] = useState(2);
  const [showRe, setShowRe] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [resets, setResets] = useState(0);
  const [, setTick] = useState(0);

  const sim = useMemo(
    () => createPacketSim({ N: 1024, L: 60, V: makePotential(pot, V0, w), x0: pot === "harmonic" ? -6 : -15, sigma, energyEV: E, dtFs: 0.1 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pot, V0, w, E, sigma, resets]
  );

  useEffect(() => {
    if (!playing) return undefined;
    let raf = 0;
    const loop = () => { sim.step(speed); setTick((t) => (t + 1) % 1e9); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sim, playing, speed]);

  const scatter = pot === "barrier" || pot === "step" || pot === "well" || pot === "double";
  const edge = pot === "double" ? 1 + w : pot === "step" ? 0 : w / 2;
  const st = sim.stats(-edge, edge);
  const dens = sim.density();
  const Vmin = Math.min(0, ...sim.V), Vmax = Math.max(0, E, ...sim.V.map((v) => Math.min(v, 5)));
  const span = Math.max(Vmax - Vmin, 0.5);
  const yLo = Vmin - 0.12 * span, yHi = Vmax + 0.55 * span;
  const peak0 = 1 / (Math.sqrt(2 * Math.PI) * sigma);
  const sc = (0.42 * span) / peak0;
  const baseE = E;
  const xs = Array.from(sim.x);
  const dPts = xs.reduce((a, x, i) => { if (i % 2 === 0) a.push([x, Math.min(yHi, baseE + dens[i] * sc)]); return a; }, []);
  const rePts = showRe ? xs.reduce((a, x, i) => { if (i % 2 === 0) a.push([x, baseE + sim.re[i] * (sc / Math.sqrt(peak0))]); return a; }, []) : null;
  const vPts = xs.map((x, i) => [x, Math.min(yHi, sim.V[i])]);
  const vg = (2 * HB2M * sim.k0) / HBAR_EV_FS; // group velocity, nm/fs
  const x0 = pot === "harmonic" ? 6 : 15;
  const done = !scatter ? false : sim.t > (x0 + edge + 3 * sigma) / vg + 3;
  const phaseLabel = !scatter ? "" : done ? "" : sim.t < (x0 - 2 * sigma) / vg ? "approaching" : "scattering…";
  const Tpw = pot === "barrier" ? barrierT(E, V0, w) : null;
  const uncertainty = st.dX * st.dK;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> A Gaussian electron wave packet is evolved by solving the time-dependent Schrödinger equation (split-operator FFT). The packet
          splits into reflected and transmitted parts; the potential is drawn in black and the density sits on the dashed mean-energy line. Energy is exact only on average —
          a packet is a spread of energies, so tunnelling probabilities are smooth averages.
        </p>
        <div className="qp-card">
          <h4>Wave packet |ψ(x, t)|² — t = {fmt(sim.t, 3)} fs</h4>
          <MathPlot xr={[-30, 30]} yr={[yLo, yHi]} height={320} xLabel="x (nm)" yLabel="E (eV)" label="Wave packet scattering">
            {({ X, Y, W }) => (
              <>
                {scatter && edge > 0 && <rect x={X(-edge)} y={0} width={X(edge) - X(-edge)} height={Y(yLo)} fill="rgba(100,116,139,0.07)" />}
                <path d={pathD(vPts, X, Y)} fill="none" stroke={PLOT.ink} strokeWidth={2} />
                <line x1={0} x2={W} y1={Y(baseE)} y2={Y(baseE)} stroke={PLOT.amber} strokeDasharray="6 4" strokeWidth={1.3} />
                {rePts && <path d={pathD(rePts, X, Y)} fill="none" stroke={PLOT.violet} strokeWidth={1} opacity={0.75} />}
                <path d={pathD(dPts, X, Y)} fill="none" stroke={PLOT.teal} strokeWidth={2.4} />
              </>
            )}
          </MathPlot>
          <div className="qp-btn-row" style={{ marginTop: 12 }}>
            <button className="qp-btn" onClick={() => setPlaying((p) => !p)}>{playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : "Run"}</button>
            <button className="qp-btn" onClick={() => setResets((r) => r + 1)}><RotateCcw size={14} /> Restart</button>
          </div>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Potential and packet</h4>
          <div className="qp-slider-row">
            <label>Potential</label>
            <select className="qp-select" value={pot} onChange={(e) => setPot(e.target.value)}>
              {POTENTIALS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </div>
          {pot !== "free" && <Slider label={pot === "harmonic" ? "V at 5 nm" : pot === "well" ? "Well depth" : "Height V₀"} value={V0} min={0.1} max={3} step={0.05} onChange={setV0} format={(v) => `${v.toFixed(2)} eV`} />}
          {(pot === "barrier" || pot === "well" || pot === "double") && <Slider label="Width" value={w} min={0.2} max={3} step={0.05} onChange={setW} format={(v) => `${v.toFixed(2)} nm`} />}
          <Slider label="Mean energy E" value={E} min={0.1} max={2} step={0.05} onChange={setE} format={(v) => `${v.toFixed(2)} eV`} />
          <Slider label="Packet width σ" value={sigma} min={1} max={4} step={0.25} onChange={setSigma} format={(v) => `${v.toFixed(2)} nm`} />
          <Slider label="Playback speed" value={speed} min={1} max={8} step={1} onChange={setSpeed} format={(v) => `×${v}`} />
          <label className="qp-check"><input type="checkbox" checked={showRe} onChange={(e) => setShowRe(e.target.checked)} /> Show Re ψ</label>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Reflected R" value={done ? fmt(st.probLeft, 3) : phaseLabel || "—"} accent="#dc3b54" />
            <Readout label="Transmitted T" value={done ? fmt(st.probRight, 3) : phaseLabel || "—"} accent="#1f9d57" />
            <Readout label="Position spread Δx" value={`${fmt(st.dX, 3)} nm`} />
            <Readout label="Wavenumber spread Δk" value={`${fmt(st.dK, 3)} /nm`} />
            <Readout label="Δx·Δk (≥ ½)" value={fmt(uncertainty, 3)} accent="#8b4fd8" />
            <Readout label="Total probability" value={fmt(st.total, 4)} />
            {Tpw !== null && <Readout label="Plane-wave T(E)" value={fmt(Tpw, 3)} accent="#c2740a" />}
            <Readout label="⟨E⟩" value={`${fmt(st.energy, 3)} eV`} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            {scatter ? "R and T appear once the packet has finished interacting: they count the probability found on each side of the structure (including the part already absorbed at the window edges), so R + T = 1." : "Without a scatterer the packet just spreads (Δx grows) while Δk stays fixed."}
          </p>
          <button className="qp-btn" onClick={() => log("Quantum: Wave Packet Scattering", `${POTENTIALS.find((p) => p.key === pot).label}, V₀=${V0.toFixed(2)} eV, w=${w.toFixed(2)} nm, E=${E.toFixed(2)} eV, σ=${sigma} nm`, `t=${fmt(sim.t, 3)} fs, ${done ? `R=${fmt(st.probLeft, 3)}, T=${fmt(st.probRight, 3)}` : scatter ? `still ${phaseLabel}` : "free evolution"}, ΔxΔk=${fmt(uncertainty, 3)}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
