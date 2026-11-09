import React, { useEffect, useMemo, useState } from "react";
import { Info, Play, Pause } from "lucide-react";
import Readout from "../common/Readout";
import { Slider, Chips } from "../math/MathPlot";
import Scene3D from "../math/Scene3D";
import EquationInput, { useFormula } from "../math/EquationInput";
import * as Cx from "../../math/complex";
import { stereo } from "../../math/lab3d";
import { useApp } from "../../context/AppContext";

const PRESETS = [
  { key: "z", label: "z (identity)", src: "z" },
  { key: "inv", label: "1/z", src: "1/z" },
  { key: "sq", label: "z²", src: "z^2" },
  { key: "mob", label: "(z−1)/(z+1)", src: "(z - 1)/(z + 1)" },
  { key: "exp", label: "exp z", src: "exp(z)" },
  { key: "custom", label: "✎ Custom", src: null },
];
const CIRCLES = [0.2, 0.4, 0.7, 1, 1.6, 2.5, 5];
const RAYS = 16;
const ease = (u) => u * u * (3 - 2 * u);

export default function RiemannSphereLab() {
  const { log } = useApp();
  const [pk, setPk] = useState("inv");
  const [custom, setCustom] = useState("(z^2 + 1)/(2*z)");
  const [morph, setMorph] = useState(1);
  const [auto, setAuto] = useState(true);
  const src = pk === "custom" ? custom : PRESETS.find((p) => p.key === pk).src;
  const fm = useFormula(src, "complex");
  const f = fm.f || ((z) => z);

  useEffect(() => {
    if (!auto) return undefined;
    let raf = 0, t0 = performance.now();
    const loop = (now) => {
      const u = (((now - t0) / 1000) % 8) / 8;           // 8 s loop: hold identity, morph, hold image, morph back
      const m = u < 0.12 ? 0 : u < 0.5 ? ease((u - 0.12) / 0.38) : u < 0.62 ? 1 : 1 - ease((u - 0.62) / 0.38);
      setMorph(Math.round(m * 200) / 200);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  const curves = useMemo(() => {
    const out = { circles: [], rays: [] };
    for (const r of CIRCLES) out.circles.push(Array.from({ length: 121 }, (_, k) => { const a = (k / 120) * 2 * Math.PI; return [r * Math.cos(a), r * Math.sin(a)]; }));
    for (let q = 0; q < RAYS; q++) { const a = (q / RAYS) * 2 * Math.PI; out.rays.push(Array.from({ length: 70 }, (_, k) => { const r = 0.02 * Math.pow(500, k / 69); return [r * Math.cos(a), r * Math.sin(a)]; })); }
    return out;
  }, []);

  const place = (z, t) => {
    const w = f(z);
    if (!Number.isFinite(w[0]) || !Number.isFinite(w[1])) return null;
    const m = [(1 - t) * z[0] + t * w[0], (1 - t) * z[1] + t * w[1]];
    return stereo(m);
  };

  const draw = (g, tm) => {
    const R = 1.25;
    const S = (p) => (p ? [p[0] * R, p[1] * R, p[2] * R] : null);
    // glassy sphere
    const NL = 14, NM = 28;
    for (let a = 0; a < NL; a++) for (let b = 0; b < NM; b++) {
      const t0 = (a / NL) * Math.PI, t1 = ((a + 1) / NL) * Math.PI, p0 = (b / NM) * 2 * Math.PI, p1 = ((b + 1) / NM) * 2 * Math.PI;
      const q = (t, p) => [R * Math.sin(t) * Math.cos(p), R * Math.sin(t) * Math.sin(p), R * Math.cos(t)];
      g.quad(q(t0, p0), q(t0, p1), q(t1, p1), q(t1, p0), [205, 222, 240], { alpha: 0.16 });
    }
    // equator |z| = 1
    g.path(Array.from({ length: 97 }, (_, k) => { const a = (k / 96) * 2 * Math.PI; return [R * Math.cos(a), R * Math.sin(a), 0]; }), "rgba(71,85,105,0.45)", 1.2);
    curves.circles.forEach((c, i) => g.path(c.map((z) => S(place(z, morph))), CIRCLES[i] === 1 ? "#c2740a" : "#e0902b", CIRCLES[i] === 1 ? 2.6 : 1.7, 0.95));
    curves.rays.forEach((c, i) => g.path(c.map((z) => S(place(z, morph))), "#0e8ea3", 1.7, 0.95));
    g.dot([0, 0, -R], 5, "#334155"); g.text([0, 0, -R * 1.13], "0", "#334155", 13);
    g.dot([0, 0, R], 5, "#334155"); g.text([0, 0, R * 1.13], "∞", "#334155", 14);
    // a moving test point on the unit circle and its image
    const th = tm * 0.7, z0 = [Math.cos(th) * 1.6, Math.sin(th) * 1.6];
    const p = S(place(z0, morph));
    if (p) g.dot(p, 6.5, "#dc3b54");
  };

  const sample = [1.5, 0.5], w = f(sample);

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> The Riemann sphere adds one point, ∞, to the complex plane and wraps it onto a sphere (stereographic projection: 0 at the south pole, ∞ at the north pole, |z| = 1 on the equator).
          Circles <span style={{ color: "#c2740a" }}>|z| = r</span> and rays <span style={{ color: "#0e8ea3" }}>arg z = θ</span> are drawn on the sphere, then <em>morphed</em> into their images under w = f(z).
          Möbius maps like 1/z just rotate or move the sphere rigidly — circles always stay circles.
        </p>
        <div className="qp-card">
          <h4>w = {src} — morph {Math.round(morph * 100)} %</h4>
          <Scene3D draw={draw} label="Riemann sphere with morphing polar grid" dist0={5.2} yaw0={-0.7} pitch0={0.35} autoRotate />
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Map</h4>
          <Chips options={PRESETS} value={pk} onChange={setPk} />
          {pk === "custom" && <EquationInput label="Type your own map" prefix="w =" value={custom} onChange={setCustom} error={fm.error} id="eq-sphere" hint="z, i, pi, e, + − * / ^, sin cos exp log sqrt conj abs" examples={["(z^2 + 1)/(2*z)", "z + 1/z", "i*z", "z^3", "sin(z)"]} />}
          <Slider label="Morph t (0 = z, 1 = f(z))" value={morph} min={0} max={1} step={0.01} onChange={(v) => { setAuto(false); setMorph(v); }} format={(v) => v.toFixed(2)} />
          <button className="qp-btn" onClick={() => setAuto((p) => !p)}>{auto ? <Pause size={14} /> : <Play size={14} />} {auto ? "Pause morph" : "Animate morph"}</button>
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label="Sample z" value={Cx.formatC(sample, 2)} />
            <Readout label="f(z)" value={Cx.formatC(w, 3)} accent="#0e8ea3" />
            <Readout label="f(0)" value={Cx.formatC(f([0, 0]), 3)} />
            <Readout label="f(1)" value={Cx.formatC(f([1, 0]), 3)} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>The red dot starts on |z| = 1.6 and rides the morph. Where f has a pole, lines run to the north pole ∞; where f has a zero they run to the south pole.</p>
          <button className="qp-btn" onClick={() => log("Complex Analysis: Riemann Sphere", `w = ${src}`, `f(1.5+0.5i)=${Cx.formatC(w, 3)}, f(0)=${Cx.formatC(f([0, 0]), 3)}, f(1)=${Cx.formatC(f([1, 0]), 3)}`)}>Record result</button>
        </div>
      </div>
    </div>
  );
}
