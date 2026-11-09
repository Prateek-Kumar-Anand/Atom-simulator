import React, { useEffect, useMemo, useState } from "react";
import { Info, Play, Pause } from "lucide-react";
import Readout from "../common/Readout";
import { Slider, Chips } from "../math/MathPlot";
import Scene3D from "../math/Scene3D";
import { mulMV, det3, trace3, blend3, eigen3 } from "../../math/lab3d";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const c60 = Math.cos(Math.PI / 3), s60 = Math.sin(Math.PI / 3);
const PRESETS = [
  { key: "rot", label: "Rotation 60° about z", A: [[c60, -s60, 0], [s60, c60, 0], [0, 0, 1]] },
  { key: "shear", label: "Shear", A: [[1, 0.8, 0], [0, 1, 0.5], [0, 0, 1]] },
  { key: "stretch", label: "Stretch (2, 1, ½)", A: [[2, 0, 0], [0, 1, 0], [0, 0, 0.5]] },
  { key: "sym", label: "Symmetric", A: [[2, 1, 0], [1, 2, 1], [0, 1, 2]] },
  { key: "proj", label: "Projection (rank 2)", A: [[1, 0, 0], [0, 1, 0], [0, 0, 0]] },
  { key: "refl", label: "Reflection", A: [[1, 0, 0], [0, 1, 0], [0, 0, -1]] },
  { key: "rank1", label: "Squash (rank 1)", A: [[0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5]] },
];
const ease = (u) => u * u * (3 - 2 * u);
const CORNERS = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map((c) => c.map((v) => v * 0.5));
const FACES = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];

function rank3(A) {
  if (Math.abs(det3(A)) > 1e-9) return 3;
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) for (let k = 0; k < 3; k++) for (let l = k + 1; l < 3; l++) if (Math.abs(A[i][k] * A[j][l] - A[i][l] * A[j][k]) > 1e-9) return 2;
  return A.some((r) => r.some((v) => Math.abs(v) > 1e-9)) ? 1 : 0;
}

export default function LinearMap3DLab() {
  const { log } = useApp();
  const [A, setA] = useState(PRESETS[3].A);
  const [pk, setPk] = useState("sym");
  const [t, setT] = useState(1);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return undefined;
    let raf = 0; const t0 = performance.now();
    const loop = (now) => {
      const u = (((now - t0) / 1000) % 7) / 7;
      setT(Math.round((u < 0.1 ? 0 : u < 0.5 ? ease((u - 0.1) / 0.4) : u < 0.62 ? 1 : 1 - ease((u - 0.62) / 0.38)) * 200) / 200);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  const eg = useMemo(() => eigen3(A), [A]);
  const det = det3(A), tr = trace3(A), rk = rank3(A);
  const ext = useMemo(() => { let m = 1; for (const c of CORNERS) { const v = mulMV(A, c.map((x) => x * 2)); m = Math.max(m, Math.hypot(...v) / 1.7); } return m; }, [A]);
  const setCell = (i, j, v) => { setPk("custom"); setA((cur) => cur.map((r, a) => r.map((x, b) => (a === i && b === j ? v : x)))); };

  const draw = (g) => {
    const Mt = blend3(A, t), sc = 1.45 / Math.max(1.45, ext), X = (p) => { const v = mulMV(Mt, p); return [v[0] * sc, v[1] * sc, v[2] * sc]; };
    g.axes(1.85, ["x", "y", "z"], "rgba(71,85,105,0.4)");
    // unit sphere wireframe (faint) and its image
    for (let a = 1; a < 6; a++) { const th = (a / 6) * Math.PI; g.path(Array.from({ length: 49 }, (_, k) => { const p = (k / 48) * 2 * Math.PI; return X([Math.sin(th) * Math.cos(p), Math.sin(th) * Math.sin(p), Math.cos(th)]); }), "#3b6fd8", 1.1, 0.45); }
    for (let b = 0; b < 12; b++) { const p = (b / 12) * 2 * Math.PI; g.path(Array.from({ length: 41 }, (_, k) => { const th = (k / 40) * Math.PI; return X([Math.sin(th) * Math.cos(p), Math.sin(th) * Math.sin(p), Math.cos(th)]); }), "#3b6fd8", 1.1, 0.45); }
    // unit cube (all faces + edges)
    const cols = [[224, 144, 43], [224, 144, 43], [14, 142, 163], [14, 142, 163], [139, 79, 216], [139, 79, 216]];
    FACES.forEach((f, i) => g.quad(X(CORNERS[f[0]].map((x) => x * 2)), X(CORNERS[f[1]].map((x) => x * 2)), X(CORNERS[f[2]].map((x) => x * 2)), X(CORNERS[f[3]].map((x) => x * 2)), cols[i], { alpha: 0.2 }));
    EDGES.forEach(([a, b]) => g.line(X(CORNERS[a].map((x) => x * 2)), X(CORNERS[b].map((x) => x * 2)), "#1e293b", 1.8, 0.9));
    // images of the basis vectors
    [[1, 0, 0, "#dc3b54", "Ae₁"], [0, 1, 0, "#1f9d57", "Ae₂"], [0, 0, 1, "#3b6fd8", "Ae₃"]].forEach(([x, y, z, c, l]) => {
      const e = X([x, y, z]);
      g.line([0, 0, 0], e, c, 3.2); g.dot(e, 4.5, c); g.text([e[0] * 1.12, e[1] * 1.12, e[2] * 1.12 + 0.06], l, c, 12);
    });
    // real eigenvector lines (direction stays fixed while A is blended in; length scales by (1−t)+tλ)
    eg.real.forEach((e) => {
      if (!e.vec) return;
      const a = [-e.vec[0] * 1.8, -e.vec[1] * 1.8, -e.vec[2] * 1.8], b = e.vec.map((v) => v * 1.8);
      g.line(a, b, "#8b4fd8", 2, 0.75);
      const lam = (1 - t) + t * e.value, tip = [e.vec[0] * lam * sc, e.vec[1] * lam * sc, e.vec[2] * lam * sc];
      g.dot(tip, 5.5, "#8b4fd8");
    });
  };

  const eigText = eg.real.map((e) => fmt(e.value, 4)).concat(eg.complex ? [`${fmt(eg.complex.re, 3)} ± ${fmt(eg.complex.im, 3)}i`] : []).join(",  ");

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> A 3 × 3 matrix A deforms space. The unit cube and unit sphere are morphed from the identity into A (animation or slider). The columns of A are where e₁, e₂, e₃ land; the
          <span style={{ color: "#8b4fd8" }}> purple lines</span> are real eigenvectors — directions that only stretch (by λ), never turn. The cube’s volume is multiplied by det A.
        </p>
        <div className="qp-card">
          <h4>Unit cube and sphere under A — morph {Math.round(t * 100)} %</h4>
          <Scene3D draw={draw} label="3-D linear map acting on a cube and a sphere" dist0={5.2} yaw0={-0.8} pitch0={0.45} autoRotate={false} />
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Matrix A</h4>
          <Chips options={PRESETS} value={pk} onChange={(k) => { setPk(k); setA(PRESETS.find((p) => p.key === k).A.map((r) => [...r])); }} />
          <div className="qp-matrix">
            {A.map((r, i) => r.map((v, j) => (
              <input key={i + "-" + j} type="number" step="0.1" value={Number.isFinite(v) ? Number(v.toFixed(3)) : 0} aria-label={`A row ${i + 1} column ${j + 1}`} onChange={(e) => setCell(i, j, e.target.value === "" ? 0 : Number(e.target.value))} />
            )))}
          </div>
          <Slider label="Morph t (0 = identity, 1 = A)" value={t} min={0} max={1} step={0.01} onChange={(v) => { setAuto(false); setT(v); }} format={(v) => v.toFixed(2)} />
          <button className="qp-btn" onClick={() => setAuto((p) => !p)}>{auto ? <Pause size={14} /> : <Play size={14} />} {auto ? "Pause morph" : "Animate morph"}</button>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="det A (volume factor)" value={fmt(det, 5)} accent={Math.abs(det) < 1e-9 ? "#dc3b54" : "#0e8ea3"} />
            <Readout label="Trace" value={fmt(tr, 5)} />
            <Readout label="Rank" value={`${rk}${rk < 3 ? " (collapses space)" : ""}`} accent={rk < 3 ? "#dc3b54" : "#1f9d57"} />
            <Readout label="Orientation" value={Math.abs(det) < 1e-9 ? "destroyed" : det > 0 ? "preserved" : "flipped (mirror)"} />
            <Readout label="Eigenvalues" value={eigText || "—"} accent="#8b4fd8" />
            <Readout label="Real eigenvectors" value={`${eg.real.filter((e) => e.vec).length} found`} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>
            {eg.complex ? "A complex eigenvalue pair means a rotation in some plane: only one real direction is left fixed. " : ""}
            {rk < 3 ? "det = 0: the cube is flattened — A has a null space and is not invertible." : "det ≠ 0: A is invertible; no information is lost."}
          </p>
          <button className="qp-btn" onClick={() => log("Vector Spaces: 3D Linear Map", `A=[${A.map((r) => r.map((v) => fmt(v, 3)).join(" ")).join("; ")}]`, `det=${fmt(det, 4)}, trace=${fmt(tr, 4)}, rank=${rk}, eigenvalues: ${eigText}`)}>Record result</button>
        </div>
      </div>
    </div>
  );
}
