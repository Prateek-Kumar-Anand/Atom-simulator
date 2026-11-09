import React, { useEffect, useState } from "react";
import { Info, Play, Pause } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, pathD } from "../math/MathPlot";
import { G, waveProps, waveOrbit } from "../../physics/hydro";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

export default function WavesLab() {
  const { log } = useApp();
  const [logL, setLogL] = useState(Math.log10(20));
  const [logH, setLogH] = useState(Math.log10(5));
  const [steep, setSteep] = useState(0.15);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const lambda = Math.pow(10, logL), depth = Math.pow(10, logH);

  useEffect(() => {
    if (!playing) return undefined;
    let raf = 0, last = performance.now();
    const loop = (now) => { setPhase((p) => (p + ((now - last) / 1000) * (Math.PI / 2)) % (2 * Math.PI)); last = now; raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const w = waveProps(lambda, depth);
  const amp = steep / w.k;
  const viewDepth = Math.min(depth, lambda / 2);
  const surf = Array.from({ length: 241 }, (_, i) => { const x = (i / 240) * 1.5 * lambda; return [x, amp * Math.cos(w.k * x - phase)]; });
  const levels = [0, 0.25, 0.5, 0.75, 1].map((f) => f * viewDepth);
  const cDeep = Math.sqrt((G * lambda) / (2 * Math.PI)), cShallow = Math.sqrt(G * depth);
  const surfOrbit = waveOrbit(amp, w.k, depth, depth);
  const botOrbit = waveOrbit(amp, w.k, depth, 0);
  const cv = Array.from({ length: 121 }, (_, i) => { const lg = -0.5 + (i / 120) * 3; return [lg, waveProps(Math.pow(10, lg), depth).c]; });
  const cvDeep = cv.map(([lg]) => [lg, Math.sqrt((G * Math.pow(10, lg)) / (2 * Math.PI))]);
  const cMaxPlot = Math.min(Math.max(...cv.map((p) => p[1])), Math.sqrt((G * 316) / (2 * Math.PI))) * 1.05;
  const steepLimit = steep > 0.44;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Water waves are <em>dispersive</em>: ω² = gk·tanh(kh), so long waves travel faster than short ones in deep water, and in very shallow water all waves share the speed √(gh).
          Each water particle moves in a closed orbit — circles in deep water, flattening into ellipses as the bed is approached — while the wave pattern, not the water, travels. Animation runs slower than real time (one cycle every 4 s).
        </p>
        <div className="qp-card">
          <h4>Water column — surface profile and particle orbits</h4>
          <MathPlot xr={[0, 1.5 * lambda]} yr={[-viewDepth * 1.02, Math.max(amp * 1.6, viewDepth * 0.12)]} square grid={false} axes={false} label="Surface wave with particle orbits">
            {({ X, Y }) => (
              <>
                <path d={`${pathD(surf, X, Y)} L${X(1.5 * lambda)},${Y(-viewDepth * 1.02)} L${X(0)},${Y(-viewDepth * 1.02)} Z`} fill="rgba(59,111,216,0.18)" stroke={PLOT.blue} strokeWidth={2.4} />
                {depth <= viewDepth * 1.001 && <rect x={X(0)} y={Y(-depth)} width={X(1.5 * lambda) - X(0)} height={Y(-viewDepth * 1.02) - Y(-depth)} fill="rgba(100,116,139,0.35)" />}
                {levels.map((dz, li) => {
                  const zb = Math.max(0, depth - dz);
                  const o = waveOrbit(amp, w.k, depth, zb);
                  const dots = Array.from({ length: 13 }, (_, i) => (i / 12) * 1.5 * lambda);
                  return (
                    <g key={li}>
                      {dots.map((x0, i) => {
                        const th = w.k * x0 - phase;
                        const x = x0 - o.ax * Math.sin(th), y = -dz + o.az * Math.cos(th);
                        return <circle key={i} cx={X(x)} cy={Y(y)} r={3.2} fill={PLOT.teal} opacity={0.85} />;
                      })}
                      <ellipse cx={X(lambda / 2)} cy={Y(-dz)} rx={Math.max(0.5, Math.abs(X(o.ax) - X(0)))} ry={Math.max(0.5, Math.abs(Y(o.az) - Y(0)))} fill="none" stroke={PLOT.red} strokeWidth={1.2} />
                    </g>
                  );
                })}
              </>
            )}
          </MathPlot>
          <div className="qp-btn-row" style={{ marginTop: 12 }}>
            <button className="qp-btn" onClick={() => setPlaying((p) => !p)}>{playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : "Animate"}</button>
          </div>
        </div>
        <div className="qp-card">
          <h4>Phase speed versus wavelength (depth {depth < 10 ? depth.toFixed(1) : Math.round(depth)} m)</h4>
          <MathPlot xr={[-0.5, 2.5]} yr={[0, cMaxPlot]} height={220} xLabel="log₁₀ λ (m)" yLabel="c (m/s)" label="Dispersion relation">
            {({ X, Y, W }) => (
              <>
                <line x1={0} x2={W} y1={Y(cShallow)} y2={Y(cShallow)} stroke={PLOT.amber} strokeDasharray="6 4" strokeWidth={1.5} />
                <path d={pathD(cvDeep, X, Y)} fill="none" stroke={PLOT.violet} strokeDasharray="2 4" strokeWidth={1.6} />
                <path d={pathD(cv, X, Y)} fill="none" stroke={PLOT.teal} strokeWidth={2.6} />
                <circle cx={X(logL)} cy={Y(w.c)} r={6} fill={PLOT.red} stroke="#fff" strokeWidth={1.5} />
              </>
            )}
          </MathPlot>
          <p className="qp-muted small" style={{ margin: "6px 0 0" }}><span style={{ color: PLOT.teal }}>―</span> exact &nbsp; <span style={{ color: PLOT.violet }}>···</span> deep-water limit √(gλ/2π) &nbsp; <span style={{ color: PLOT.amber }}>- -</span> shallow limit √(gh)</p>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Wave</h4>
          <Slider label="Wavelength λ" value={logL} min={-0.3} max={2.3} step={0.02} onChange={setLogL} format={() => `${lambda < 10 ? lambda.toFixed(2) : lambda.toFixed(1)} m`} />
          <Slider label="Water depth h" value={logH} min={-0.3} max={3} step={0.02} onChange={setLogH} format={() => `${depth < 10 ? depth.toFixed(2) : Math.round(depth)} m`} />
          <Slider label="Steepness ka" value={steep} min={0.02} max={0.45} step={0.01} onChange={setSteep} format={(x) => x.toFixed(2)} />
          {steepLimit && <p className="qp-muted small" style={{ color: "#dc3b54" }}>Near the breaking limit (ka ≈ 0.44): real waves of this steepness would break.</p>}
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Regime" value={`${w.regime} water (kh = ${fmt(w.kh, 3)})`} accent="#0e8ea3" />
            <Readout label="Period T" value={`${fmt(w.period, 4)} s`} />
            <Readout label="Phase speed c" value={`${fmt(w.c, 4)} m/s`} accent="#3b6fd8" />
            <Readout label="Group speed cg" value={`${fmt(w.cg, 4)} m/s (${fmt(w.cg / w.c, 3)} c)`} accent="#c2740a" />
            <Readout label="Amplitude a = ka/k" value={`${fmt(amp, 3)} m`} />
            <Readout label="Surface orbit (x, z)" value={`${fmt(surfOrbit.ax, 3)}, ${fmt(surfOrbit.az, 3)} m`} />
            <Readout label="Bed orbit (x, z)" value={`${fmt(botOrbit.ax, 3)}, ${fmt(botOrbit.az, 3)} m`} accent="#dc3b54" />
            <Readout label="Deep-water c = √(gλ/2π)" value={`${fmt(cDeep, 4)} m/s`} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>Energy travels at the group speed: ½c in deep water, equal to c in shallow water. A tsunami (λ ≈ 200 km, h ≈ 4 km) is a shallow-water wave moving at √(gh) ≈ 200 m/s.</p>
          <button className="qp-btn" onClick={() => log("Fluid Dynamics: Surface Waves", `λ=${fmt(lambda, 3)} m, h=${fmt(depth, 3)} m, ka=${steep.toFixed(2)}`, `${w.regime} water, T=${fmt(w.period, 4)} s, c=${fmt(w.c, 4)} m/s, cg=${fmt(w.cg, 4)} m/s, amplitude ${fmt(amp, 3)} m`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
