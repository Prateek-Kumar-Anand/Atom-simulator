import React, { useEffect, useMemo, useState } from "react";
import { Info, Play, Pause } from "lucide-react";
import Readout from "../common/Readout";
import { Slider, Chips, rampColor } from "../math/MathPlot";
import Scene3D from "../math/Scene3D";
import { WAVES, waveTarget, waveErrors } from "../../math/lab3d";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const NS = 26, NX = 161;

export default function FourierGibbs3DLab() {
  const { log } = useApp();
  const [kind, setKind] = useState("square");
  const [N, setN] = useState(9);
  const [sweep, setSweep] = useState(true);

  // S[n][i] for n = 0..NS, built incrementally
  const S = useMemo(() => {
    const xs = Array.from({ length: NX }, (_, i) => -Math.PI + (i / (NX - 1)) * 2 * Math.PI);
    const out = [Array(NX).fill(0)];
    for (let n = 1; n <= NS; n++) {
      const prev = out[n - 1];
      out.push(xs.map((x, i) => {
        let add = 0;
        if (kind === "square") { if (n % 2) add = (4 / Math.PI) * Math.sin(n * x) / n; }
        else if (kind === "sawtooth") add = (2 / Math.PI) * (n % 2 ? 1 : -1) * Math.sin(n * x) / n;
        else if (n % 2) add = (8 / (Math.PI * Math.PI)) * Math.cos(n * x) / (n * n);
        return prev[i] + add;
      }));
    }
    return { xs, rows: out };
  }, [kind]);
  const target = useMemo(() => S.xs.map((x) => waveTarget(kind, x)), [S, kind]);
  const err = useMemo(() => waveErrors(kind, N), [kind, N]);

  useEffect(() => {
    if (!sweep) return undefined;
    const id = setInterval(() => setN((c) => (c >= NS ? 1 : c + 1)), 520);
    return () => clearInterval(id);
  }, [sweep]);

  const draw = (g) => {
    const sy = 2.4 / NS, sz = 0.85;
    const X = (x) => x * (1.15 / Math.PI);
    const Q = (x, n, v) => [X(x), (n - NS / 2) * sy, v * sz];
    // floor / reference frame
    g.line(Q(-Math.PI, 0, 0), Q(Math.PI, 0, 0), "rgba(100,116,139,0.5)", 1.2);
    g.line(Q(-Math.PI, NS, 0), Q(Math.PI, NS, 0), "rgba(100,116,139,0.5)", 1.2);
    g.text(Q(Math.PI * 1.12, 0, 0), "x", "#334155", 13); g.text(Q(0, NS * 1.08, 0), "N", "#334155", 13); g.text(Q(-Math.PI * 1.05, NS, 1.25), "S_N(x)", "#334155", 12);
    // surface z = S_N(x) over (x, N): colour = distance from the target (blue small → red large)
    for (let n = 1; n < NS; n++) for (let i = 0; i < NX - 1; i += 2) {
      const i2 = Math.min(NX - 1, i + 2);
      const e = Math.abs(S.rows[n][i] - target[i]);
      const col = rampColor(Math.min(1, e * 0.9));
      g.quad(Q(S.xs[i], n, S.rows[n][i]), Q(S.xs[i2], n, S.rows[n][i2]), Q(S.xs[i2], n + 1, S.rows[n + 1][i2]), Q(S.xs[i], n + 1, S.rows[n + 1][i]), col, { alpha: 0.78 });
    }
    // target at the near edge and the current N highlighted
    g.path(S.xs.map((x, i) => Q(x, 0, target[i])), "#dc3b54", 2.6);
    g.path(S.xs.map((x, i) => Q(x, N, S.rows[N][i])), "#1e293b", 3);
    g.path(S.xs.map((x, i) => Q(x, 0, S.rows[N][i])), "#0e8ea3", 2.4);
    g.line(Q(-Math.PI, 0, 0), Q(-Math.PI, N, 0), "rgba(30,41,59,0.35)", 1);
    // Gibbs peak marker
    let pk = 0; for (let i = 1; i < NX; i++) if (S.rows[N][i] > S.rows[N][pk]) pk = i;
    g.dot(Q(S.xs[pk], N, S.rows[N][pk]), 5, "#dc3b54");
  };

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> Each curve is a partial Fourier sum S_N. Stack them along the N axis and you get a surface: it converges to the wave <em>pointwise</em>, but at a jump the overshoot
          (the Gibbs ridge, red dot) never shrinks below ≈ 9 % of the jump — it only gets narrower. Convergence is <em>not uniform</em> for the square wave, but is for the continuous triangle wave.
        </p>
        <div className="qp-card">
          <h4>Partial sums S_N(x) stacked over N — colour shows distance from the wave</h4>
          <Scene3D draw={draw} label="Fourier partial sums as a 3-D surface" dist0={5.6} yaw0={-0.95} pitch0={0.55} autoRotate={false} />
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Wave and harmonics</h4>
          <Chips options={WAVES} value={kind} onChange={setKind} />
          <Slider label="Harmonics N" value={N} min={1} max={NS} step={1} onChange={(v) => { setSweep(false); setN(v); }} />
          <button className="qp-btn" onClick={() => setSweep((p) => !p)}>{sweep ? <Pause size={14} /> : <Play size={14} />} {sweep ? "Pause sweep" : "Sweep N"}</button>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Peak of S_N" value={fmt(err.max, 5)} accent="#dc3b54" />
            <Readout label="Overshoot above 1" value={fmt(err.overshoot, 4)} accent="#c2740a" />
            <Readout label="RMS error (L²)" value={fmt(err.rms, 4)} accent="#0e8ea3" />
            <Readout label="Sup error ≥" value={kind === "square" ? "stays ≈ 0.18" : "→ 0"} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            {kind === "square" ? "Gibbs: sup|S_N − f| → (2/π)Si(π) − 1 ≈ 0.179 (8.95 % of the jump of 2). The L² error still goes to 0." : "No jump → the sum converges uniformly and the peak of S_N approaches the true maximum without overshoot beyond the wave."}
          </p>
          <button className="qp-btn" onClick={() => log("Real Analysis: 3D Fourier & Gibbs", `${WAVES.find((w) => w.key === kind).label}, N=${N} harmonics`, `peak=${fmt(err.max, 5)}, overshoot=${fmt(err.overshoot, 4)}, RMS error=${fmt(err.rms, 4)}`)}>Record result</button>
        </div>
      </div>
    </div>
  );
}
