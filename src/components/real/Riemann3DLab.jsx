import React, { useEffect, useMemo, useState } from "react";
import { Info, Play, Pause } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, Chips, rampColor, pathD } from "../math/MathPlot";
import Scene3D from "../math/Scene3D";
import EquationInput, { useFormula } from "../math/EquationInput";
import { RULES_2D, riemann2D, integral2D } from "../../math/lab3d";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const NMAX = 30;

export default function Riemann3DLab() {
  const { log } = useApp();
  const [src, setSrc] = useState("2 + sin(x)*cos(y)");
  const [L, setL] = useState(3);
  const [rule, setRule] = useState("mid");
  const [n, setN] = useState(4);
  const [playing, setPlaying] = useState(true);
  const fm = useFormula(src, "real", ["x", "y"]);
  const f = fm.f || (() => 0);

  const ref = useMemo(() => integral2D(f, 0, L, 0, L), [f, L]);
  const cur = useMemo(() => riemann2D(f, 0, L, 0, L, n, rule), [f, L, n, rule]);
  const conv = useMemo(() => Array.from({ length: NMAX }, (_, i) => [i + 1, riemann2D(f, 0, L, 0, L, i + 1, rule).sum]), [f, L, rule]);
  const surf = useMemo(() => {
    const M = 28, z = [];
    let lo = Infinity, hi = -Infinity;
    for (let j = 0; j <= M; j++) { const row = []; for (let i = 0; i <= M; i++) { let v = f((i / M) * L, (j / M) * L); if (!Number.isFinite(v)) v = 0; row.push(v); lo = Math.min(lo, v); hi = Math.max(hi, v); } z.push(row); }
    return { M, z, lo, hi };
  }, [f, L]);

  // animated refinement 1 → NMAX, then pause on the finest grid and loop
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setN((c) => (c >= NMAX ? 1 : c + 1)), 650);
    return () => clearInterval(id);
  }, [playing]);

  const err = cur.sum - ref;
  const top = Math.max(surf.hi, 0), bot = Math.min(surf.lo, 0), span = Math.max(1e-9, top - bot);
  const draw = (g) => {
    const S = 2.4 / L, V = 1.5 / span;
    const P = (x, y, v) => [x * S - 1.2, y * S - 1.2, (v - bot) * V - 0.7];
    // floor grid
    for (let k = 0; k <= 6; k++) { const u = (k / 6) * L; g.line(P(u, 0, 0), P(u, L, 0), "rgba(100,116,139,0.35)", 1); g.line(P(0, u, 0), P(L, u, 0), "rgba(100,116,139,0.35)", 1); }
    g.text(P(L * 1.05, 0, 0), "x", "#334155", 13); g.text(P(0, L * 1.05, 0), "y", "#334155", 13); g.text(P(0, 0, top * 1.15 + 0.1 * span), "f", "#334155", 13);
    // bars
    const { heights, dx, dy } = cur;
    const sides = n <= 14;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const h = heights[j][i], x0 = i * dx, x1 = x0 + dx, y0 = j * dy, y1 = y0 + dy;
      const col = rampColor(span > 0 ? (h - bot) / span : 0.5);
      const A = P(x0, y0, h), B = P(x1, y0, h), C = P(x1, y1, h), D = P(x0, y1, h);
      g.quad(A, B, C, D, col, { alpha: 0.62, stroke: "rgba(30,41,59,0.45)" });
      if (sides) {
        const a0 = P(x0, y0, 0), b0 = P(x1, y0, 0), c0 = P(x1, y1, 0), d0 = P(x0, y1, 0);
        g.quad(a0, b0, B, A, col, { alpha: 0.5 }); g.quad(b0, c0, C, B, col, { alpha: 0.5 });
        g.quad(c0, d0, D, C, col, { alpha: 0.5 }); g.quad(d0, a0, A, D, col, { alpha: 0.5 });
      }
    }
    // the true surface as a wire mesh
    const { M, z } = surf, st = L / M;
    for (let j = 0; j <= M; j += 2) g.path(Array.from({ length: M + 1 }, (_, i) => P(i * st, j * st, z[j][i])), "#1e293b", 1.3, 0.85);
    for (let i = 0; i <= M; i += 2) g.path(Array.from({ length: M + 1 }, (_, j) => P(i * st, j * st, z[j][i])), "#1e293b", 1.3, 0.85);
  };

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> The double integral ∬f dA is the volume under the surface. A Riemann sum approximates it with n × n boxes; as the grid is refined the lower and upper sums squeeze
          the exact volume. Watch the boxes shrink onto the surface (dark mesh). Use your own f(x, y) below.
        </p>
        <div className="qp-card">
          <h4>Volume under f over [0, {L}]² — {n} × {n} = {n * n} boxes</h4>
          <Scene3D draw={draw} label="3-D Riemann sum boxes under a surface" dist0={5.2} yaw0={-0.75} pitch0={0.62} autoRotate />
        </div>
        <div className="qp-card">
          <h4>Convergence of the sum as the grid is refined</h4>
          <MathPlot xr={[0, NMAX + 1]} yr={[Math.min(...conv.map((p) => p[1]), ref) - 0.05 * Math.abs(ref) - 0.01, Math.max(...conv.map((p) => p[1]), ref) + 0.05 * Math.abs(ref) + 0.01]} height={200} xLabel="n" yLabel="S" label="Riemann sum versus n">
            {({ X, Y, W }) => (
              <>
                <line x1={0} x2={W} y1={Y(ref)} y2={Y(ref)} stroke={PLOT.amber} strokeDasharray="6 4" strokeWidth={1.6} />
                <path d={pathD(conv, X, Y)} fill="none" stroke={PLOT.teal} strokeWidth={2.4} />
                <circle cx={X(n)} cy={Y(cur.sum)} r={5.5} fill={PLOT.red} stroke="#fff" strokeWidth={1.5} />
              </>
            )}
          </MathPlot>
          <p className="qp-muted small" style={{ margin: "6px 0 0" }}><span style={{ color: PLOT.amber }}>- -</span> exact value &nbsp; <span style={{ color: PLOT.teal }}>―</span> sum Sₙ</p>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Function and grid</h4>
          <EquationInput label="Surface z = f(x, y)" prefix="f(x, y) =" value={src} onChange={setSrc} error={fm.error} id="eq-r3d" hint="x, y, pi, e, + − * / ^, sin cos tan exp ln sqrt abs" examples={["2 + sin(x)*cos(y)", "x*y", "4 - x^2/3 - y^2/3", "exp(-((x-1.5)^2+(y-1.5)^2))", "1 + x/2 + sin(y)^2"]} />
          <Slider label="Square side L" value={L} min={1} max={4} step={0.5} onChange={setL} format={(v) => v.toFixed(1)} />
          <Chips options={RULES_2D} value={rule} onChange={setRule} />
          <Slider label="Grid n" value={n} min={1} max={NMAX} step={1} onChange={(v) => { setPlaying(false); setN(v); }} />
          <button className="qp-btn" onClick={() => setPlaying((p) => !p)}>{playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause refinement" : "Animate refinement"}</button>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label={`Sum Sₙ (n = ${n})`} value={fmt(cur.sum, 6)} accent="#0e8ea3" />
            <Readout label="Exact ∬ f dA" value={fmt(ref, 6)} accent="#c2740a" />
            <Readout label="Error Sₙ − exact" value={fmt(err, 3)} accent={Math.abs(err) < 0.01 * Math.abs(ref) ? "#1f9d57" : "#dc3b54"} />
            <Readout label="Box area dx·dy" value={fmt(cur.dx * cur.dy, 4)} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            For a continuous f the lower sum increases and the upper sum decreases to the same limit — that is exactly the Riemann (Darboux) criterion for integrability in two variables.
          </p>
          <button className="qp-btn" onClick={() => log("Real Analysis: 3D Riemann Sum", `f=${src}, [0,${L}]², ${RULES_2D.find((r) => r.key === rule).label}, n=${n}`, `S_n=${fmt(cur.sum, 6)}, exact=${fmt(ref, 6)}, error=${fmt(err, 3)}`)}>Record result</button>
        </div>
      </div>
    </div>
  );
}
