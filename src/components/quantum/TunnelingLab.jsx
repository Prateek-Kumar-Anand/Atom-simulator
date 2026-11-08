import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot,
} from "recharts";
import { Info, Play, Pause, RotateCcw } from "lucide-react";
import Readout from "../common/Readout";
import { tunnelingProbability, sampleTunnelingCurve } from "../../physics/quantum";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";
import { CHART, TOOLTIP_STYLE, xAxisLabel } from "../common/chartTheme";

const CANVAS_W = 640, CANVAS_H = 200;
const BARRIER_X0 = CANVAS_W * 0.42, BARRIER_X1_MAX = CANVAS_W * 0.62;
const PAD_Y = 20;
const E_AXIS_FACTOR = 1.6; // energy axis spans 0 .. 1.6·V₀ (same range as the T(E) chart and the E slider)
const PARTICLE_SPEED = 90; // px / s
const SPAWN_EVERY_MS = 260;
const MASS_PRESETS = [
  { key: "electron", label: "Electron", ratio: 1 },
  { key: "proton", label: "Proton", ratio: 1836 },
];

// The detector canvas is an "instrument screen": it stays dark so the coloured particles read clearly.
const SCREEN_BG = "#141c2e";

export default function TunnelingLab() {
  const { log } = useApp();
  const [V0, setV0] = useState(5); // eV
  const [E, setE] = useState(3); // eV
  const [L, setL] = useState(0.5); // nm
  const [massKey, setMassKey] = useState("electron");
  const [playing, setPlaying] = useState(true);

  const mass = MASS_PRESETS.find((m) => m.key === massKey) || MASS_PRESETS[0];
  const T = useMemo(() => tunnelingProbability(E, V0, L, mass.ratio), [E, V0, L, mass.ratio]);
  const curve = useMemo(() => sampleTunnelingCurve(V0, L, mass.ratio, 60), [V0, L, mass.ratio]);

  const [counts, setCounts] = useState({ transmitted: 0, reflected: 0 });
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const barrierWidthPx = Math.min(BARRIER_X1_MAX - BARRIER_X0, Math.max(14, L * 60));
  const barrierX1 = BARRIER_X0 + barrierWidthPx;

  // The animation loop reads the latest physics through a ref, so it keeps running smoothly while
  // sliders move instead of being torn down and restarted on every value change.
  const live = useRef({ T, barrierX1, V0, E });
  live.current = { T, barrierX1, V0, E };

  // Any change to the physical setup (including the particle energy E, which sets T) starts a fresh
  // experiment — otherwise the empirical tally would mix results taken at different probabilities.
  useEffect(() => {
    particlesRef.current = [];
    setCounts({ transmitted: 0, reflected: 0 });
  }, [V0, E, L, mass.ratio]);

  useEffect(() => {
    let raf;
    let lastSpawn = 0;
    let lastTime = null;
    const ctx = canvasRef.current?.getContext("2d");
    const yForEnergy = (energy, v0) => CANVAS_H - PAD_Y - (energy / (v0 * E_AXIS_FACTOR)) * (CANVAS_H - 2 * PAD_Y);

    function draw(time) {
      const { T: prob, barrierX1: bx1, V0: v0, E: energy } = live.current;
      // Real elapsed time (capped), so speed doesn't double on 120 Hz displays or stall in background tabs.
      const dt = lastTime === null ? 0 : Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      if (playing) {
        if (time - lastSpawn > SPAWN_EVERY_MS) {
          lastSpawn = time;
          particlesRef.current.push({ x: 10, vx: PARTICLE_SPEED, status: "incoming", resolved: false });
        }
        particlesRef.current.forEach((p) => {
          if (p.status === "incoming" && p.x >= BARRIER_X0 && !p.resolved) {
            p.resolved = true;
            const success = Math.random() < prob;
            p.status = success ? "transmitted" : "reflected";
            setCounts((c) => (success ? { ...c, transmitted: c.transmitted + 1 } : { ...c, reflected: c.reflected + 1 }));
            if (!success) p.vx = -p.vx;
          }
          p.x += p.vx * dt;
        });
        particlesRef.current = particlesRef.current.filter((p) => p.x > -20 && p.x < CANVAS_W + 20);
      }

      if (ctx) {
        ctx.fillStyle = SCREEN_BG;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        const floorY = CANVAS_H - PAD_Y;
        const topY = yForEnergy(v0, v0); // the barrier is drawn up to its true height V₀
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, floorY); ctx.lineTo(CANVAS_W, floorY); ctx.stroke();
        // barrier (height = V₀)
        ctx.fillStyle = "rgba(255,107,129,0.26)";
        ctx.fillRect(BARRIER_X0, topY, bx1 - BARRIER_X0, floorY - topY);
        ctx.strokeStyle = "#ff6b81";
        ctx.strokeRect(BARRIER_X0, topY, bx1 - BARRIER_X0, floorY - topY);
        ctx.fillStyle = "#ff9aa8";
        ctx.font = "11px 'IBM Plex Mono', monospace";
        ctx.fillText("V₀", BARRIER_X0 + 4, topY - 5);
        // particle energy level
        const eY = yForEnergy(energy, v0);
        ctx.strokeStyle = "#4fd8e0";
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(0, eY); ctx.lineTo(CANVAS_W, eY); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#4fd8e0";
        ctx.fillText("E", 6, eY - 5);
        // particles travel along their own energy level
        particlesRef.current.forEach((p) => {
          ctx.fillStyle = p.status === "reflected" ? "#ffb44d" : p.status === "transmitted" ? "#5be39a" : "#c4a1ff";
          ctx.beginPath();
          ctx.arc(p.x, eY, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const reset = () => { particlesRef.current = []; setCounts({ transmitted: 0, reflected: 0 }); };
  const totalShots = counts.transmitted + counts.reflected;
  const empiricalT = totalShots > 0 ? counts.transmitted / totalShots : 0;
  const eMax = V0 * E_AXIS_FACTOR;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Each particle (violet) travels along its energy level E (dashed line). The
          red block is the barrier, drawn up to its height V₀ — while E is below it, the particle could
          never cross classically. Quantum mechanically it sometimes does anyway (green = transmitted,
          amber = reflected).
        </p>
        <div className="qp-card">
          <h4>Barrier approach</h4>
          <canvas
            ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="qp-screen"
            style={{ width: "100%", height: 180 }}
            role="img" aria-label="Particles approaching a potential barrier"
          />
        </div>
        <div className="qp-card">
          <h4>Transmission probability T(E)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={curve} margin={{ top: 8, right: 14, left: 0, bottom: 6 }}>
              <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="E" type="number" domain={[0, eMax]} tickFormatter={(v) => Number(v).toFixed(1)}
                stroke={CHART.axis} tick={CHART.tick} label={xAxisLabel("Energy E (eV)")}
              />
              <YAxis domain={[0, 1]} stroke={CHART.axis} tick={CHART.tick} width={30} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [Number(v).toFixed(4), "T"]} labelFormatter={(v) => `E = ${Number(v).toFixed(2)} eV`} />
              <Line type="monotone" dataKey="T" stroke="#0fa3b8" dot={false} strokeWidth={2} isAnimationActive={false} />
              <ReferenceDot x={E} y={T} r={5} fill="#9b59e6" stroke="#ffffff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Particle</h4>
          <div className="qp-chip-row">
            {MASS_PRESETS.map((m) => (
              <button key={m.key} className={"qp-chip" + (m.key === massKey ? " active" : "")} onClick={() => setMassKey(m.key)}>{m.label}</button>
            ))}
          </div>
          <div className="qp-slider-row">
            <label>Particle energy E = {E.toFixed(2)} eV</label>
            <input type="range" min={0.1} max={eMax} step={0.05} value={Math.min(E, eMax)} className="qp-slider" onChange={(e) => setE(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Barrier height V₀ = {V0.toFixed(1)} eV</label>
            <input
              type="range" min={1} max={15} step={0.5} value={V0} className="qp-slider"
              onChange={(e) => {
                const v = Number(e.target.value);
                setV0(v);
                setE((cur) => Math.min(cur, v * E_AXIS_FACTOR)); // keep E inside the slider's new range
              }}
            />
          </div>
          <div className="qp-slider-row">
            <label>Barrier width L = {L.toFixed(2)} nm</label>
            <input type="range" min={0.1} max={2} step={0.05} value={L} className="qp-slider" onChange={(e) => setL(Number(e.target.value))} />
          </div>
          <div className="qp-btn-row">
            <button className="qp-btn qp-btn-primary" onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : "Resume"}
            </button>
            <button className="qp-btn" onClick={reset}><RotateCcw size={14} /> Reset tally</button>
          </div>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Theoretical T" value={fmt(T, 4)} accent="#0fa3b8" />
            <Readout label="Empirical T (this run)" value={totalShots > 0 ? fmt(empiricalT, 3) : "—"} />
            <Readout label="Transmitted" value={counts.transmitted} accent="#22a35a" />
            <Readout label="Reflected" value={counts.reflected} accent="#e08a0b" />
          </div>
          <button
            className="qp-btn"
            onClick={() => log("Quantum: Tunneling", `${mass.label}, E=${fmt(E, 2)} eV, V₀=${fmt(V0, 1)} eV, L=${fmt(L, 2)} nm`, `T=${fmt(T, 4)} (theory), ${counts.transmitted}/${totalShots} empirical`)}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
