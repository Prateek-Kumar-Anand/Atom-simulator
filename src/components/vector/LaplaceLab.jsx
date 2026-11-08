import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Info, Play, Pause, RotateCcw, FastForward } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, Chips, divergingColor } from "../math/MathPlot";
import { makeLaplaceGrid, laplaceSweep, laplaceResidual, dirichletEnergy, LAPLACE_METHODS, LAPLACE_PRESETS } from "../../math/vectorSpace";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const N = 40;
const METHOD_NOTE = {
  jacobi: "Jacobi: every point becomes the average of its 4 neighbours. This is exactly gradient descent on the Dirichlet energy with step ¼.",
  gs: "Gauss–Seidel reuses fresh values immediately — about twice as fast as Jacobi.",
  sor: "Successive over-relaxation (optimal ω) overshoots each update on purpose — an accelerated descent, orders of magnitude faster.",
  gd: "Plain gradient descent on E with step α. Stable only for α < 0.25; at α = ¼ it reproduces Jacobi.",
};

function bilinear(grid, x, y) {
  const { M, u } = grid;
  const gx = Math.min(M - 1.001, Math.max(0, x * (M - 1))), gy = Math.min(M - 1.001, Math.max(0, y * (M - 1)));
  const i = Math.floor(gx), j = Math.floor(gy), fx = gx - i, fy = gy - j;
  const a = u[j * M + i], b = u[j * M + i + 1], c = u[(j + 1) * M + i], d = u[(j + 1) * M + i + 1];
  return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
}

export default function LaplaceLab() {
  const { log } = useApp();
  const [presetKey, setPresetKey] = useState("plate");
  const [edges, setEdges] = useState({ top: 100, bottom: 0, left: 0, right: 0 });
  const [method, setMethod] = useState("gs");
  const [alpha, setAlpha] = useState(0.2);
  const [perFrame, setPerFrame] = useState(6);
  const [playing, setPlaying] = useState(true);
  const [probe, setProbe] = useState([0.5, 0.5]);
  const [stats, setStats] = useState({ iter: 0, change: 1, residual: 1, energy: 0, hist: [] });

  const preset = LAPLACE_PRESETS.find((p) => p.key === presetKey) || LAPLACE_PRESETS[0];
  const bc = useMemo(() => (preset.custom
    ? { top: () => edges.top, bottom: () => edges.bottom, left: () => edges.left, right: () => edges.right }
    : preset.bc), [preset, edges]);
  const gridRef = useRef(null);
  const scratch = useRef(new Float64Array((N + 2) * (N + 2)));
  const iterRef = useRef(0);
  const histRef = useRef([]);
  const cfg = useRef({ method, alpha, perFrame });
  cfg.current = { method, alpha, perFrame };

  const snapshot = useCallback((change) => {
    const g = gridRef.current;
    const res = laplaceResidual(g);
    histRef.current.push(Math.log10(Math.max(res, 1e-12)));
    if (histRef.current.length > 600) histRef.current = histRef.current.filter((_, i) => i % 2 === 0);
    setStats({ iter: iterRef.current, change, residual: res, energy: dirichletEnergy(g), hist: histRef.current.slice() });
  }, []);

  const reset = useCallback(() => {
    gridRef.current = makeLaplaceGrid(N, bc);
    iterRef.current = 0;
    histRef.current = [];
    snapshot(1);
    setPlaying(true);
  }, [bc, snapshot]);

  useEffect(() => { reset(); }, [reset]);

  const advance = useCallback((sweeps) => {
    let change = 1;
    for (let s = 0; s < sweeps; s++) {
      change = laplaceSweep(gridRef.current, cfg.current.method, cfg.current.alpha, scratch.current);
      iterRef.current += 1;
      if (!Number.isFinite(change) || change < 1e-11) break;
    }
    snapshot(change);
    return change;
  }, [snapshot]);

  useEffect(() => {
    if (!playing) return undefined;
    let raf;
    const loop = () => {
      const change = advance(cfg.current.perFrame);
      if (!(change > 1e-11) || !Number.isFinite(change)) { setPlaying(false); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, advance]);

  const solveFully = () => {
    setPlaying(false);
    let guard = 0;
    while (guard < 40000) {
      const change = laplaceSweep(gridRef.current, cfg.current.method === "gd" && cfg.current.alpha > 0.25 ? "gs" : cfg.current.method, cfg.current.alpha, scratch.current);
      iterRef.current += 1; guard++;
      if (guard % 20 === 0) histRef.current.push(Math.log10(Math.max(laplaceResidual(gridRef.current), 1e-12)));
      if (!(change > 1e-9)) break;
    }
    snapshot(0);
  };

  const g = gridRef.current;
  const bcVals = useMemo(() => {
    const t = Array.from({ length: 21 }, (_, i) => i / 20);
    return t.flatMap((s) => [bc.top(s), bc.bottom(s), bc.left(s), bc.right(s)]);
  }, [bc]);
  const bLo = Math.min(...bcVals), bHi = Math.max(...bcVals);
  const scaleAbs = Math.max(Math.abs(bLo), Math.abs(bHi), 1e-9);

  // interior extrema and mean-value check at the probe
  let iLo = Infinity, iHi = -Infinity, maxErr = null;
  if (g) {
    for (let j = 1; j <= N; j++) for (let i = 1; i <= N; i++) { const v = g.u[j * g.M + i]; if (v < iLo) iLo = v; if (v > iHi) iHi = v; }
    if (preset.exact) {
      maxErr = 0;
      for (let j = 0; j < g.M; j++) for (let i = 0; i < g.M; i++) maxErr = Math.max(maxErr, Math.abs(g.u[j * g.M + i] - preset.exact(i / (N + 1), j / (N + 1))));
    }
  }
  const pv = g ? bilinear(g, probe[0], probe[1]) : 0;
  const h = 1 / (N + 1);
  const mean4 = g ? (bilinear(g, probe[0] + h, probe[1]) + bilinear(g, probe[0] - h, probe[1]) + bilinear(g, probe[0], probe[1] + h) + bilinear(g, probe[0], probe[1] - h)) / 4 : 0;
  const maxPrinciple = iLo >= bLo - 1e-6 * scaleAbs && iHi <= bHi + 1e-6 * scaleAbs;
  const converged = stats.residual < 1e-6 * scaleAbs;
  const unstable = method === "gd" && alpha > 0.25;
  const hist = stats.hist;
  const hLo = Math.min(...hist, -3) - 0.3, hHi = Math.max(...hist, 0) + 0.3;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Laplace's equation ∇²u = 0 describes steady-state heat, electrostatic potential and ideal flow. Fix u on the four edges and
          let the interior relax: each relaxation sweep is a <em>descent step on the Dirichlet energy</em> E = ½∫|∇u|². Click the plate to probe a point.
        </p>
        <div className="qp-card">
          <h4>Solution u(x, y) — {stats.iter.toLocaleString()} sweeps, {LAPLACE_METHODS.find((m) => m.key === method).label}</h4>
          <MathPlot
            xr={[0, 1]} yr={[0, 1]} square paintRes={N * 3} paintKey={`${stats.iter}|${presetKey}|${scaleAbs}`} grid={false} axes={false}
            paint={(x, y) => (g ? divergingColor(bilinear(g, x, y) / scaleAbs) : [248, 250, 252])}
            xLabel="x" yLabel="y" label="Heat map of the Laplace solution"
            onPointer={(t, q) => { if (t !== "up") setProbe([Math.min(0.98, Math.max(0.02, q.x)), Math.min(0.98, Math.max(0.02, q.y))]); }}
          >
            {({ X, Y }) => (
              <>
                <rect x={0.5} y={0.5} width={X(1) - 1} height={Y(0) - 1} fill="none" stroke={PLOT.ink} strokeWidth={1.4} opacity={0.45} />
                <circle cx={X(probe[0])} cy={Y(probe[1])} r={6} fill="#fff" stroke={PLOT.ink} strokeWidth={2} />
              </>
            )}
          </MathPlot>
          <p className="qp-muted small" style={{ margin: "8px 0 0" }}>red = positive u, blue = negative u, white = 0 · boundary values are held fixed</p>
        </div>
        <div className="qp-card">
          <h4>Convergence: log₁₀ of the largest residual |u − average of neighbours|</h4>
          <MathPlot xr={[0, Math.max(10, hist.length - 1)]} yr={[hLo, hHi]} height={170} xLabel="frame" label="Residual versus iteration">
            {({ X, Y }) => <polyline fill="none" stroke={PLOT.teal} strokeWidth={2.2} points={hist.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} />}
          </MathPlot>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Boundary conditions</h4>
          <Chips options={LAPLACE_PRESETS.map((p) => ({ key: p.key, label: p.label }))} value={presetKey} onChange={setPresetKey} />
          {preset.custom && ["top", "bottom", "left", "right"].map((s) => (
            <Slider key={s} label={`u on ${s} edge`} value={edges[s]} min={-100} max={100} step={5} onChange={(v) => setEdges((e) => ({ ...e, [s]: v }))} />
          ))}
        </div>
        <div className="qp-card">
          <h4>Solver</h4>
          <Chips options={LAPLACE_METHODS} value={method} onChange={setMethod} />
          {method === "gd" && <Slider label="Step α" value={alpha} min={0.02} max={0.3} step={0.01} onChange={setAlpha} format={(v) => v.toFixed(2)} />}
          {unstable && <p className="qp-instructions qp-warning" style={{ marginBottom: 10 }}>α &gt; 0.25 is unstable — the iteration will blow up.</p>}
          <Slider label="Sweeps per frame" value={perFrame} min={1} max={60} step={1} onChange={setPerFrame} />
          <div className="qp-btn-row">
            <button className="qp-btn qp-btn-primary" onClick={() => setPlaying((p) => !p)}>{playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : "Run"}</button>
            <button className="qp-btn" onClick={solveFully}><FastForward size={14} /> Solve</button>
            <button className="qp-btn" onClick={reset}><RotateCcw size={14} /> Reset</button>
          </div>
          <p className="qp-muted small" style={{ margin: "10px 0 0" }}>{METHOD_NOTE[method]}</p>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Sweeps" value={stats.iter.toLocaleString()} />
            <Readout label="Residual" value={fmt(stats.residual, 2)} accent="#dc3b54" />
            <Readout label="Dirichlet energy E" value={fmt(stats.energy, 4)} accent="#0e8ea3" />
            <Readout label="State" value={!Number.isFinite(stats.residual) ? "diverged" : converged ? "converged" : "relaxing"} />
            <Readout label="u at probe" value={fmt(pv, 4)} />
            <Readout label="Mean of 4 neighbours" value={fmt(mean4, 4)} />
            <Readout label="Max principle" value={maxPrinciple ? "holds ✓" : "violated"} />
            <Readout label="Max error vs exact" value={maxErr === null ? "n/a" : fmt(maxErr, 2)} accent="#c2740a" />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            At a solution u equals the average of its neighbours at every point (mean-value property), and its largest and smallest values sit on the boundary.
          </p>
          <button className="qp-btn" onClick={() => log("Vector Spaces: Laplace Equation", `${preset.label}, ${LAPLACE_METHODS.find((m) => m.key === method).label}${preset.custom ? `, edges T/B/L/R = ${edges.top}/${edges.bottom}/${edges.left}/${edges.right}` : ""}`, `${stats.iter} sweeps, residual=${fmt(stats.residual, 2)}, E=${fmt(stats.energy, 4)}${maxErr === null ? "" : `, max error vs exact=${fmt(maxErr, 2)}`}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
