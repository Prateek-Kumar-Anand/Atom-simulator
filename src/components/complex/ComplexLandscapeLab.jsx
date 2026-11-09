import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import { Slider, Chips } from "../math/MathPlot";
import Scene3D from "../math/Scene3D";
import EquationInput, { useFormula } from "../math/EquationInput";
import * as Cx from "../../math/complex";
import { BRANCHES, branchPoint } from "../../math/lab3d";
import { useApp } from "../../context/AppContext";

const HEIGHTS = [
  { key: "abs", label: "|f(z)|" }, { key: "re", label: "Re f" }, { key: "im", label: "Im f" }, { key: "log", label: "log |f|" },
];
const MODES = [{ key: "typed", label: "Your f(z)" }, { key: "branch", label: "Riemann surfaces" }];
const CAP = 4;

export default function ComplexLandscapeLab() {
  const { log } = useApp();
  const [mode, setMode] = useState("typed");
  const [src, setSrc] = useState("(z^2 - 1)/(z^2 + z + 1)");
  const [hk, setHk] = useState("abs");
  const [half, setHalf] = useState(2.5);
  const [rad, setRad] = useState(1.2);
  const [branch, setBranch] = useState("sqrt");
  const fm = useFormula(src, "complex");
  const f = fm.f || ((z) => z);

  const heightOf = (w) => {
    if (hk === "re") return w[0];
    if (hk === "im") return w[1];
    const m = Math.hypot(w[0], w[1]);
    return hk === "abs" ? m : Math.log10(m + 1e-12);
  };
  const clampH = (h) => (hk === "abs" ? Math.min(h, CAP) : Math.max(-CAP, Math.min(CAP, h)));

  const mesh = useMemo(() => {
    if (mode !== "typed") return null;
    const M = 54, rows = [];
    for (let j = 0; j <= M; j++) {
      const row = [];
      for (let i = 0; i <= M; i++) {
        const x = -half + (i / M) * 2 * half, y = -half + (j / M) * 2 * half;
        const w = f([x, y]);
        const ok = Number.isFinite(w[0]) && Number.isFinite(w[1]);
        row.push({ x, y, w, h: ok ? clampH(heightOf(w)) : 0, ok, col: ok ? Cx.domainColor(w) : [200, 200, 200] });
      }
      rows.push(row);
    }
    return { M, rows };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, f, half, hk]);

  const br = BRANCHES.find((b) => b.key === branch);
  const bmesh = useMemo(() => {
    if (mode !== "branch") return null;
    const NR = 22, NT = 90, rows = [];
    const R = 2.0, th0 = branch === "log" ? -3 * Math.PI : 0, turns = br.turns;
    for (let j = 0; j <= NT; j++) {
      const th = th0 + (j / NT) * turns, row = [];
      for (let i = 0; i <= NR; i++) {
        const r = branch === "log" ? 0.05 + (i / NR) * (R - 0.05) : (i / NR) * R;
        const p = branchPoint(branch, r, th);
        row.push({ ...p, col: Cx.domainColor(p.w) });
      }
      rows.push(row);
    }
    return { NR, NT, rows, th0, R };
  }, [mode, branch, br.turns]);

  const draw = (g, t) => {
    if (mode === "typed" && mesh) {
      const { M, rows } = mesh, S = 1.5 / half, V = hk === "abs" ? 0.5 : 0.36;
      const zb = hk === "abs" ? -0.75 : 0;               // the z-plane sits here
      const P = (c) => [c.x * S, c.y * S, c.h * V + zb];
      for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) {
        const a = rows[j][i], b = rows[j][i + 1], c = rows[j + 1][i + 1], d = rows[j + 1][i];
        if (!(a.ok && b.ok && c.ok && d.ok)) continue;
        g.quad(P(a), P(b), P(c), P(d), a.col, { alpha: 0.92 });
      }
      g.axes(1.75, ["Re z", "Im z", hk === "abs" ? "|f|" : hk === "re" ? "Re f" : hk === "im" ? "Im f" : "log|f|"]);
      // a point walking round |z| = rad, with its image curve on the surface and its shadow in the plane
      const at = (z) => { const w = f(z); return Number.isFinite(w[0]) && Number.isFinite(w[1]) ? [z[0] * S, z[1] * S, clampH(heightOf(w)) * V + zb] : null; };
      const th = t * 0.6, z0 = [rad * Math.cos(th), rad * Math.sin(th)];
      const circ = Array.from({ length: 97 }, (_, k) => { const a = (k / 96) * 2 * Math.PI; return [rad * Math.cos(a), rad * Math.sin(a)]; });
      g.path(circ.map(at), "#111827", 2.6);
      g.path(circ.map((z) => [z[0] * S, z[1] * S, zb]), "rgba(17,24,39,0.35)", 1.4);
      const top = at(z0);
      if (top) { g.dot(top, 6, "#dc3b54"); g.line(top, [z0[0] * S, z0[1] * S, zb], "rgba(220,59,84,0.5)", 1.2); }
    } else if (bmesh) {
      const { NR, NT, rows, R } = bmesh, S = 1.35 / R, V = branch === "log" ? 0.17 : 0.55;
      const P = (c) => [c.x * S, c.y * S, c.h * V];
      for (let j = 0; j < NT; j++) for (let i = 0; i < NR; i++) g.quad(P(rows[j][i]), P(rows[j][i + 1]), P(rows[j + 1][i + 1]), P(rows[j + 1][i]), rows[j][i].col, { alpha: 0.9 });
      g.axes(1.7, ["Re z", "Im z", branch === "log" ? "arg" : "Im w"]);
      // a particle going round the branch point, climbing sheets
      const total = br.turns, r0 = 1.0, tt = (t * 0.5) % 1, th = bmesh.th0 + tt * total, p = branchPoint(branch, r0, th);
      const trail = Array.from({ length: 80 }, (_, k) => { const a = bmesh.th0 + Math.max(0, tt - (k / 79) * 0.18) * total; return P(branchPoint(branch, r0, a)); });
      g.path(trail, "#111827", 2.8);
      g.dot(P(p), 6.5, "#dc3b54");
      g.line(P(p), [p.x * S, p.y * S, 0], "rgba(220,59,84,0.45)", 1.2);
    }
  };

  const z1 = [rad, 0], w1 = f(z1);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> A complex function as a landscape: the base plane is z, the height is |f(z)| (or Re f, Im f, log|f|) and the colour is arg f(z). Poles are spikes, zeros are pits, and the colours
          wind round each of them. In <em>Riemann surfaces</em> mode you can see why √z and log z are many-valued: walk round the origin and you climb onto another sheet.
        </p>
        <div className="qp-card">
          <h4>{mode === "typed" ? `f(z) = ${src}` : br.label}</h4>
          <Scene3D draw={draw} label="3-D complex function landscape" dist0={5.2} yaw0={-0.8} pitch0={0.6} autoRotate />
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>View</h4>
          <Chips options={MODES} value={mode} onChange={setMode} />
          {mode === "typed" ? (
            <>
              <EquationInput label="Type your own function" prefix="f(z) =" value={src} onChange={setSrc} error={fm.error} id="eq-cland" hint="z, i, pi, e, + − * / ^, sin cos tan exp log sqrt sinh cosh conj abs" examples={["(z^2 - 1)/(z^2 + z + 1)", "1/z", "z^3 - 1", "exp(z)", "sin(z)", "(z - i)/(z + i)", "z^2 + 0.5"]} />
              <Chips options={HEIGHTS} value={hk} onChange={setHk} />
              <Slider label="Window half-width" value={half} min={1} max={4} step={0.25} onChange={setHalf} format={(v) => v.toFixed(2)} />
              <Slider label="Orbit radius |z|" value={rad} min={0.2} max={Math.min(half, 3)} step={0.05} onChange={setRad} format={(v) => v.toFixed(2)} />
            </>
          ) : (
            <select className="qp-select" value={branch} onChange={(e) => setBranch(e.target.value)} aria-label="Riemann surface">
              {BRANCHES.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
            </select>
          )}
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          {mode === "typed" ? (
            <div className="qp-readout-grid">
              <Readout label="f(rad) at z = rad" value={Cx.formatC(w1, 3)} accent="#0e8ea3" />
              <Readout label="|f|, arg f" value={Cx.formatPolar(w1, 3)} />
            </div>
          ) : null}
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            {mode === "typed" ? "Heights above 4 are clipped so poles do not swamp the picture. The black loop is f(z) along |z| = r — the red dot walks round it." : br.note}
          </p>
          <button className="qp-btn" onClick={() => log("Complex Analysis: 3D Landscape", mode === "typed" ? `f(z)=${src}, height=${HEIGHTS.find((h) => h.key === hk).label}, window ±${half}` : br.label, mode === "typed" ? `f(${rad.toFixed(2)})=${Cx.formatC(w1, 3)}` : br.note)}>Record result</button>
        </div>
      </div>
    </div>
  );
}
