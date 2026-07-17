import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Info, Play, Pause, RotateCcw } from "lucide-react";
import Readout from "../common/Readout";
import { sampleDoubleSlitPattern, drawDoubleSlitHit } from "../../physics/quantum";
import { wavelengthToColor, fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const HALF_RANGE_M = 0.06; // screen shown from -6cm to +6cm around center
const CANVAS_W = 640, CANVAS_H = 260;

export default function DoubleSlitLab() {
  const { log } = useApp();
  const [wavelengthNm, setWavelengthNm] = useState(550);
  const [slitSeparationUm, setSlitSeparationUm] = useState(60);
  const [slitWidthUm, setSlitWidthUm] = useState(12);
  const [screenDistanceM, setScreenDistanceM] = useState(1.2);
  const [whichPathKnown, setWhichPathKnown] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [hitCount, setHitCount] = useState(0);

  const canvasRef = useRef(null);
  const hitsRef = useRef([]);

  const params = { wavelengthNm, slitSeparationUm, slitWidthUm, screenDistanceM, whichPathKnown };
  const beamColor = wavelengthToColor(wavelengthNm);

  const distribution = useMemo(() => sampleDoubleSlitPattern(params, HALF_RANGE_M, 240),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wavelengthNm, slitSeparationUm, slitWidthUm, screenDistanceM, whichPathKnown]);

  const chartData = useMemo(
    () => distribution.pts.map((p) => ({ mm: Math.round(p.y * 1000), I: p.I })),
    [distribution]
  );

  // Reset the accumulated screen whenever the physical setup changes (a new experiment).
  useEffect(() => {
    hitsRef.current = [];
    setHitCount(0);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) { ctx.fillStyle = "#05070c"; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wavelengthNm, slitSeparationUm, slitWidthUm, screenDistanceM, whichPathKnown]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      const y = drawDoubleSlitHit(distribution);
      hitsRef.current.push(y);
      if (hitsRef.current.length > 4000) hitsRef.current.shift();
      setHitCount((c) => c + 1);

      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        const px = CANVAS_W / 2 + (y / HALF_RANGE_M) * (CANVAS_W / 2 - 10);
        const py = CANVAS_H / 2 + (Math.random() - 0.5) * (CANVAS_H - 20);
        ctx.fillStyle = beamColor;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(px, py, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }, 12);
    return () => clearInterval(id);
  }, [playing, distribution, beamColor]);

  const reset = () => {
    hitsRef.current = [];
    setHitCount(0);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) { ctx.fillStyle = "#05070c"; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); }
  };

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Particles are detected one at a time, but their landing positions build
          up the wave interference pattern. Toggle which-path knowledge to see the pattern collapse
          to a plain single-slit envelope.
        </p>
        <div className="qp-card">
          <h4>Detector screen ({hitCount.toLocaleString()} particles detected)</h4>
          <canvas
            ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
            style={{ width: "100%", height: 220, borderRadius: 8, background: "#05070c", border: "1px solid var(--border)" }}
          />
        </div>
        <div className="qp-card">
          <h4>Probability distribution (theoretical intensity)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <CartesianGrid stroke="#1f2b3a" />
              <XAxis dataKey="mm" stroke="#7c8a9c" tick={{ fontSize: 10 }} label={{ value: "Screen position (mm)", position: "insideBottom", offset: -4, fill: "#7c8a9c", fontSize: 10 }} />
              <YAxis stroke="#7c8a9c" tick={{ fontSize: 10 }} width={30} />
              <Tooltip contentStyle={{ background: "#0d131c", border: "1px solid #1f2b3a", fontSize: 12 }} />
              <Area type="monotone" dataKey="I" stroke={beamColor} fill={beamColor} fillOpacity={0.25} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Mode</h4>
          <div className="qp-chip-row">
            <button className={"qp-chip" + (!whichPathKnown ? " active" : "")} onClick={() => setWhichPathKnown(false)}>Wave-like (coherent)</button>
            <button className={"qp-chip" + (whichPathKnown ? " active" : "")} onClick={() => setWhichPathKnown(true)}>Which-path known</button>
          </div>
        </div>
        <div className="qp-card">
          <h4>Setup</h4>
          <div className="qp-slider-row">
            <label>Wavelength λ = {wavelengthNm} nm</label>
            <input type="range" min={400} max={700} step={5} value={wavelengthNm} className="qp-slider" onChange={(e) => setWavelengthNm(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Slit separation d = {slitSeparationUm} μm</label>
            <input type="range" min={20} max={150} step={2} value={slitSeparationUm} className="qp-slider" onChange={(e) => setSlitSeparationUm(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Slit width a = {slitWidthUm} μm</label>
            <input type="range" min={4} max={40} step={1} value={slitWidthUm} className="qp-slider" onChange={(e) => setSlitWidthUm(Number(e.target.value))} />
          </div>
          <div className="qp-slider-row">
            <label>Screen distance L = {screenDistanceM.toFixed(1)} m</label>
            <input type="range" min={0.3} max={3} step={0.1} value={screenDistanceM} className="qp-slider" onChange={(e) => setScreenDistanceM(Number(e.target.value))} />
          </div>
          <div className="qp-btn-row">
            <button className="qp-btn qp-btn-primary" onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : "Resume"}
            </button>
            <button className="qp-btn" onClick={reset}><RotateCcw size={14} /> Clear screen</button>
          </div>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Fringe spacing (≈λL/d)" value={`${fmt((wavelengthNm * 1e-9 * screenDistanceM / (slitSeparationUm * 1e-6)) * 1000, 2)} mm`} accent="#4fd8e0" />
            <Readout label="Particles detected" value={hitCount.toLocaleString()} />
          </div>
          <button
            className="qp-btn"
            onClick={() => log("Quantum: Double Slit", `${whichPathKnown ? "Which-path known" : "Wave-like"}, λ=${wavelengthNm}nm`, `${hitCount} particles detected, d=${slitSeparationUm}μm, a=${slitWidthUm}μm`)}
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
