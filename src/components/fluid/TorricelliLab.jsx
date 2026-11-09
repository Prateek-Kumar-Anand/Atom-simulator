import React, { useEffect, useState } from "react";
import { Info, Play, Pause, RotateCcw } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, pathD } from "../math/MathPlot";
import { G, torricelliSpeed, torricelliHead, torricelliEmptyTime, torricelliRange } from "../../physics/hydro";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

export default function TorricelliLab() {
  const { log } = useApp();
  const [h0, setH0] = useState(1);
  const [tankR, setTankR] = useState(0.25);
  const [holeMm, setHoleMm] = useState(20);
  const [Cd, setCd] = useState(0.62);
  const [H, setH] = useState(1);
  const [u, setU] = useState(0);
  const [playing, setPlaying] = useState(true);

  const holeR = holeMm / 2000;
  const Tend = torricelliEmptyTime(h0, tankR, holeR, Cd);
  const t = u * Tend;
  const h = torricelliHead(h0, tankR, holeR, Cd, t);
  const v = torricelliSpeed(h);
  const Q = Cd * Math.PI * holeR * holeR * v;
  const range = torricelliRange(h, H);
  const rangeMax = torricelliRange(h0, H);

  useEffect(() => {
    if (!playing) return undefined;
    let raf = 0, last = performance.now();
    const loop = (now) => {
      const dt = (now - last) / 1000; last = now;
      setU((x) => { const nx = x + dt / 14; if (nx >= 1) { setPlaying(false); return 1; } return nx; });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const sci = (s) => (s < 120 ? `${fmt(s, 3)} s` : `${fmt(s / 60, 3)} min`);
  const tw = 2 * tankR; // tank occupies x ∈ [−tw, 0]
  const jet = Array.from({ length: 60 }, (_, i) => { const x = (i / 59) * range; return [x, v > 1e-6 ? H - (G * x * x) / (2 * v * v) : H]; });
  const hs = Array.from({ length: 101 }, (_, i) => [(i / 100) * Tend, torricelliHead(h0, tankR, holeR, Cd, (i / 100) * Tend)]);
  const xmax = Math.max(rangeMax * 1.08, 0.4);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Water leaves a hole at the speed of a body that has fallen the head h, v = √(2gh) (Torricelli). Because the head drops, the jet weakens and the tank drains
          ever more slowly: h(t) is a parabola in time. The jet’s landing distance is 2√(h·H) — and is the same for a hole at depth h or at height H − h.
        </p>
        <div className="qp-card">
          <h4>Tank draining — t = {sci(t)}</h4>
          <MathPlot xr={[-tw - 0.12, xmax]} yr={[0, H + h0 * 1.12]} square grid={false} label="Draining tank with jet" height={320}>
            {({ X, Y }) => (
              <>
                <rect x={X(-tw)} y={Y(H + h)} width={X(0) - X(-tw)} height={Y(H) - Y(H + h)} fill="rgba(59,111,216,0.28)" />
                <path d={`M${X(-tw)},${Y(H + h0 * 1.08)} V${Y(H)} H${X(0)} V${Y(H + h0 * 1.08)}`} fill="none" stroke={PLOT.ink} strokeWidth={2.5} />
                <line x1={X(-tw)} x2={X(0)} y1={Y(H + h)} y2={Y(H + h)} stroke={PLOT.blue} strokeWidth={1.5} />
                <line x1={X(0)} x2={X(0)} y1={Y(H + h0)} y2={Y(H + h)} stroke={PLOT.amber} strokeDasharray="3 3" />
                <text x={X(0) - 6} y={Y(H + h0) + 12} fontSize={11} textAnchor="end" fill={PLOT.amber}>h₀</text>
                <line x1={X(-tw - 0.1)} x2={X(xmax)} y1={Y(0)} y2={Y(0)} stroke={PLOT.ink} strokeWidth={2} />
                <line x1={X(0)} x2={X(0)} y1={Y(H)} y2={Y(0)} stroke={PLOT.axis} strokeDasharray="2 4" />
                {v > 1e-6 && <path d={pathD(jet, X, Y)} fill="none" stroke={PLOT.blue} strokeWidth={3.2} strokeLinecap="round" />}
                {v > 1e-6 && <circle cx={X(range)} cy={Y(0)} r={4.5} fill={PLOT.red} stroke="#fff" strokeWidth={1.5} />}
                <text x={X(-tw / 2)} y={Y(H) - 8} fontSize={11} textAnchor="middle" fill={PLOT.text}>H = {fmt(H, 3)} m</text>
              </>
            )}
          </MathPlot>
          <div className="qp-btn-row" style={{ marginTop: 12 }}>
            <button className="qp-btn" onClick={() => { if (u >= 1) setU(0); setPlaying((p) => !p); }}>{playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : u >= 1 ? "Replay" : "Run"}</button>
            <button className="qp-btn" onClick={() => { setU(0); setPlaying(false); }}><RotateCcw size={14} /> Reset</button>
          </div>
          <Slider label="Time (scrub)" value={u} min={0} max={1} step={0.005} onChange={(x) => { setPlaying(false); setU(x); }} format={() => sci(t)} />
        </div>
        <div className="qp-card">
          <h4>Water level h(t)</h4>
          <MathPlot xr={[0, Tend]} yr={[0, h0 * 1.1]} height={200} xLabel="t (s)" yLabel="h (m)" label="Head versus time">
            {({ X, Y }) => (
              <>
                <path d={pathD(hs, X, Y)} fill="none" stroke={PLOT.teal} strokeWidth={2.4} />
                <line x1={X(t)} x2={X(t)} y1={0} y2={Y(0)} stroke={PLOT.ink} strokeDasharray="4 4" />
                <circle cx={X(t)} cy={Y(h)} r={5} fill={PLOT.red} stroke="#fff" strokeWidth={1.5} />
              </>
            )}
          </MathPlot>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Tank and hole</h4>
          <Slider label="Initial head h₀" value={h0} min={0.2} max={2} step={0.05} onChange={(x) => { setH0(x); setU(0); }} format={(x) => `${x.toFixed(2)} m`} />
          <Slider label="Tank radius" value={tankR} min={0.1} max={0.5} step={0.01} onChange={(x) => { setTankR(x); setU(0); }} format={(x) => `${x.toFixed(2)} m`} />
          <Slider label="Hole diameter" value={holeMm} min={2} max={40} step={1} onChange={(x) => { setHoleMm(x); setU(0); }} format={(x) => `${x} mm`} />
          <Slider label="Discharge coeff. Cd" value={Cd} min={0.5} max={1} step={0.01} onChange={(x) => { setCd(x); setU(0); }} format={(x) => x.toFixed(2)} />
          <Slider label="Hole height above ground H" value={H} min={0.2} max={2} step={0.05} onChange={setH} format={(x) => `${x.toFixed(2)} m`} />
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Head h now" value={`${fmt(h, 4)} m`} accent="#0e8ea3" />
            <Readout label="Exit speed √(2gh)" value={`${fmt(v, 4)} m/s`} accent="#3b6fd8" />
            <Readout label="Flow rate Q = Cd·a·v" value={`${fmt(Q * 1000, 3)} L/s`} />
            <Readout label="Jet range now" value={`${fmt(range, 4)} m`} accent="#dc3b54" />
            <Readout label="Time to empty" value={sci(Tend)} accent="#c2740a" />
            <Readout label="Initial range 2√(h₀H)" value={`${fmt(rangeMax, 4)} m`} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>Quadruple the hole area and the tank empties twice as fast (T ∝ A_tank/a); double the head and it takes √2 longer.</p>
          <button className="qp-btn" onClick={() => log("Fluid Dynamics: Torricelli Draining", `h₀=${h0.toFixed(2)} m, tank R=${tankR.toFixed(2)} m, hole ⌀${holeMm} mm, Cd=${Cd.toFixed(2)}, H=${H.toFixed(2)} m`, `empty in ${sci(Tend)}, v₀=${fmt(torricelliSpeed(h0), 3)} m/s, initial range ${fmt(rangeMax, 3)} m; at t=${sci(t)}: h=${fmt(h, 3)} m`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
