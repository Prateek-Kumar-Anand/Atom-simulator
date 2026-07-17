import React, { useCallback, useRef, useState } from "react";
import { Info, Play, Pause, RotateCcw, Plus, X } from "lucide-react";
import HUD from "../common/HUD";
import Readout from "../common/Readout";
import ParticleViewport, { BALL_COLORS } from "./ParticleViewport";
import CollisionChart from "./CollisionChart";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const MIN_BALLS = 2;
const MAX_BALLS = 8;
const RESTITUTION_PRESETS = [
  { key: "elastic", label: "Elastic (e=1)", value: 1 },
  { key: "partial", label: "Partly inelastic (e=0.5)", value: 0.5 },
  { key: "perfect", label: "Perfectly inelastic (e=0)", value: 0 },
];

function makeBall(i) {
  return { mass: 1.5, speed: 2, color: BALL_COLORS[i % BALL_COLORS.length] };
}

export default function ParticleLab() {
  const { log } = useApp();
  const [balls, setBalls] = useState([
    { ...makeBall(0), mass: 1.5, speed: 2.2 },
    { ...makeBall(1), mass: 3, speed: 1.4 },
  ]);
  const [playing, setPlaying] = useState(true);
  const [resetToken, setResetToken] = useState(0);
  const [restitution, setRestitution] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [stats, setStats] = useState({ momentum: 0, ke: 0, collisions: 0, speeds: [] });
  const [history, setHistory] = useState([]);
  const startRef = useRef(performance.now());

  const handleStats = useCallback((s) => {
    setStats(s);
    setHistory((h) => {
      const t = (performance.now() - startRef.current) / 1000;
      const next = [...h, { t: Number(t.toFixed(1)), momentum: Number(s.momentum.toFixed(2)), ke: Number(s.ke.toFixed(2)) }];
      return next.length > 60 ? next.slice(next.length - 60) : next;
    });
  }, []);

  const updateBall = (i, patch) => setBalls((bs) => bs.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  const addBall = () =>
    setBalls((bs) => (bs.length >= MAX_BALLS ? bs : [...bs, makeBall(bs.length)]));
  const removeBall = (i) =>
    setBalls((bs) => (bs.length <= MIN_BALLS ? bs : bs.filter((_, idx) => idx !== i)));
  const doReset = () => {
    setResetToken((x) => x + 1);
    setHistory([]);
    startRef.current = performance.now();
  };
  const collisionMode = restitution >= 0.999 ? "Elastic" : restitution <= 0.001 ? "Perfectly inelastic" : "Partly inelastic";

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Set how many balls are in the chamber and each one&rsquo;s mass and
          speed. Momentum is always conserved; switch the collision mode below to see kinetic
          energy conserved (elastic) or dissipated (inelastic) instead.
        </p>
        <HUD label={`COLLISION CHAMBER · ${balls.length} BODIES · ${collisionMode.toUpperCase()}`}>
          <ParticleViewport
            balls={balls} resetToken={resetToken} playing={playing}
            restitution={restitution} showVectors={showVectors} onStats={handleStats}
          />
        </HUD>
        <CollisionChart data={history} />
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Collision mode</h4>
          <div className="qp-chip-row">
            {RESTITUTION_PRESETS.map((p) => (
              <button
                key={p.key}
                className={"qp-chip" + (Math.abs(restitution - p.value) < 0.01 ? " active" : "")}
                onClick={() => { setRestitution(p.value); doReset(); }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="qp-slider-row">
            <label>Coefficient of restitution e = {restitution.toFixed(2)}</label>
            <input
              type="range" min={0} max={1} step={0.05} value={restitution} className="qp-slider"
              onChange={(e) => { setRestitution(Number(e.target.value)); doReset(); }}
            />
          </div>
          <label className="small qp-muted" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, cursor: "pointer" }}>
            <input type="checkbox" checked={showVectors} onChange={(e) => setShowVectors(e.target.checked)} />
            Show velocity vectors
          </label>
        </div>
        <div className="qp-card">
          <h4>Ball configuration ({balls.length}/{MAX_BALLS})</h4>
          {balls.map((ball, i) => (
            <div key={i} className="qp-ball-config">
              <div className="qp-ball-config-head">
                <span className="qp-swatch" style={{ background: ball.color, marginLeft: 0 }} /> Ball {i + 1}
                {balls.length > MIN_BALLS && (
                  <button className="qp-icon-btn qp-ball-remove" onClick={() => removeBall(i)} title="Remove ball">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="qp-slider-row">
                <label>Mass = {ball.mass.toFixed(1)}</label>
                <input
                  type="range" min={0.5} max={5} step={0.1} value={ball.mass} className="qp-slider"
                  onChange={(e) => updateBall(i, { mass: Number(e.target.value) })}
                />
              </div>
              <div className="qp-slider-row">
                <label>Speed = {ball.speed.toFixed(1)}</label>
                <input
                  type="range" min={0.3} max={4} step={0.1} value={ball.speed} className="qp-slider"
                  onChange={(e) => updateBall(i, { speed: Number(e.target.value) })}
                />
              </div>
            </div>
          ))}
          <button className="qp-btn" disabled={balls.length >= MAX_BALLS} onClick={addBall}>
            <Plus size={14} /> Add ball
          </button>
          <div className="qp-btn-row" style={{ marginTop: 10 }}>
            <button className="qp-btn qp-btn-primary" onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : "Resume"}
            </button>
            <button className="qp-btn" onClick={doReset}><RotateCcw size={14} /> Reset</button>
          </div>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Balls" value={balls.length} />
            <Readout label="Collisions" value={stats.collisions} accent="#f2a94e" />
            <Readout label="Total momentum |p|" value={fmt(stats.momentum, 2)} />
            <Readout label="Total kinetic energy" value={fmt(stats.ke, 2)} accent="#4fd8e0" />
          </div>
          <div className="qp-shellrow" style={{ flexWrap: "wrap", gap: 8 }}>
            {stats.speeds.map((v, i) => (
              <span key={i} className="small qp-muted">
                <span className="qp-swatch" style={{ background: balls[i]?.color }} /> B{i + 1}: {fmt(v, 2)}
              </span>
            ))}
          </div>
          <button
            className="qp-btn"
            onClick={() =>
              log(
                "Particle Collisions",
                `${balls.length} balls, ${collisionMode} (e=${restitution.toFixed(2)})`,
                `${stats.collisions} collisions, KE=${fmt(stats.ke, 2)}, |p|=${fmt(stats.momentum, 2)}`
              )
            }
          >
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
