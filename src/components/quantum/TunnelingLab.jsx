import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot,
} from "recharts";
import { Info, Play, Pause, RotateCcw } from "lucide-react";
import Readout from "../common/Readout";
import { tunnelingProbability, sampleTunnelingCurve } from "../../physics/quantum";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const CANVAS_W = 640, CANVAS_H = 200;
const BARRIER_X0 = CANVAS_W * 0.42, BARRIER_X1_MAX = CANVAS_W * 0.62;
const MASS_PRESETS = [
  { key: "electron", label: "Electron", ratio: 1 },
  { key: "proton", label: "Proton", ratio: 1836 },
];

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

  // Changing the physical setup starts a fresh experiment (old empirical tally no longer applies).
  useEffect(() => {
    particlesRef.current = [];
    setCounts({ transmitted: 0, reflected: 0 });
  }, [V0, L, mass.ratio]);

  useEffect(() => {
    let raf;
    let lastSpawn = 0;
    const ctx = canvasRef.current?.getContext("2d");

    function draw(time) {
      if (playing) {
        if (time - lastSpawn > 260) {
          lastSpawn = time;
          particlesRef.current.push({ x: 10, vx: 90, status: "incoming", resolved: false });
        }
        const dt = 1 / 60;
        particlesRef.current.forEach((p) => {
          if (p.status === "incoming" && p.x >= BARRIER_X0 && !p.resolved) {
            p.resolved = true;
            const success = Math.random() < T;
            p.status = success ? "transmitted" : "reflected";
            setCounts((c) => (success ? { ...c, transmitted: c.transmitted + 1 } : { ...c, reflected: c.reflected + 1 }));
            if (!success) p.vx = -p.vx;
          }
          p.x += p.vx * dt;
        });
        particlesRef.current = particlesRef.current.filter((p) => p.x > -20 && p.x < CANVAS_W + 20);
      }

      if (ctx) {
        ctx.fillStyle = "#05070c";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        // barrier
        ctx.fillStyle = "rgba(239,91,111,0.18)";
        ctx.fillRect(BARRIER_X0, 20, barrierX1 - BARRIER_X0, CANVAS_H - 40);
        ctx.strokeStyle = "#ef5b6f";
        ctx.strokeRect(BARRIER_X0, 20, barrierX1 - BARRIER_X0, CANVAS_H - 40);
        // energy level line for the incoming particle
        const eY = CANVAS_H - 20 - (E / (V0 * 1.6)) * (CANVAS_H - 40);
        ctx.strokeStyle = "#4fd8e0";
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(0, eY); ctx.lineTo(CANVAS_W, eY); ctx.stroke();
        ctx.setLineDash([]);
        // particles
        particlesRef.current.forEach((p) => {
          ctx.fillStyle = p.status === "reflected" ? "#f2a94e" : p.status === "transmitted" ? "#6bd68a" : "#c084fc";
          ctx.beginPath();
          ctx.arc(p.x, CANVAS_H / 2, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [playing, T, barrierX1, V0, E]);

  const reset = () => { particlesRef.current = []; setCounts({ transmitted: 0, reflected: 0 }); };
  const totalShots = counts.transmitted + counts.reflected;
  const empiricalT = totalShots > 0 ? counts.transmitted / totalShots : 0;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Each particle (violet) has energy E, shown by the dashed line, below the
          barrier height V₀ — classically it could never cross. Quantum mechanically it sometimes
          does anyway (green = transmitted, amber = reflected).
        </p>
        <div className="qp-card">
          <h4>Barrier approach</h4>
          <canvas
            ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
            style={{ width: "100%", height: 180, borderRadius: 8, background: "#05070c", border: "1px solid var(--border)" }}
          />
        </div>
        <div className="qp-card">
          <h4>Transmission probability T(E)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={curve.map((p) => ({ E: Number(p.E.toFixed(2)), T: p.T }))}>
              <CartesianGrid stroke="#1f2b3a" />
              <XAxis dataKey="E" stroke="#7c8a9c" tick={{ fontSize: 10 }} label={{ value: "Energy E (eV)", position: "insideBottom", offset: -4, fill: "#7c8a9c", fontSize: 10 }} />
              <YAxis domain={[0, 1]} stroke="#7c8a9c" tick={{ fontSize: 10 }} width={30} />
              <Tooltip contentStyle={{ background: "#0d131c", border: "1px solid #1f2b3a", fontSize: 12 }} />
              <Line type="monotone" dataKey="T" stroke="#4fd8e0" dot={false} strokeWidth={2} />
              <ReferenceDot x={Number(E.toFixed(2))} y={T} r={5} fill="#c084fc" stroke="#0d131c" strokeWidth={2} />
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
            <input type="range" min={0.1} max={V0 * 1.6} step={0.05} value={E} className="qp-slider" onChange={(e) => setE(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Barrier height V₀ = {V0.toFixed(1)} eV</label>
            <input type="range" min={1} max={15} step={0.5} value={V0} className="qp-slider" onChange={(e) => setV0(Number(e.target.value))} />
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
            <Readout label="Theoretical T" value={fmt(T, 4)} accent="#4fd8e0" />
            <Readout label="Empirical T (this run)" value={totalShots > 0 ? fmt(empiricalT, 3) : "—"} />
            <Readout label="Transmitted" value={counts.transmitted} accent="#6bd68a" />
            <Readout label="Reflected" value={counts.reflected} accent="#f2a94e" />
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
