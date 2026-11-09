import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Readout from "../common/Readout";
import MathPlot, { PLOT, Slider, rampColor, pathD } from "../math/MathPlot";
import { hydrogenDensity, hydrogenRadial, hydrogenEnergy, hydrogenMeanR, ORBITAL_NAMES, A0_NM, HC_EV_NM, RYDBERG_EV } from "../../physics/quantumLab";
import { fmt } from "../../physics/constants";
import { useApp } from "../../context/AppContext";

const band = (nm) => (nm < 380 ? "ultraviolet" : nm < 750 ? "visible" : "infrared");

export default function HydrogenLab() {
  const { log } = useApp();
  const [n, setN] = useState(3);
  const [l, setL] = useState(2);
  const [m, setM] = useState(0);
  const lc = Math.min(l, n - 1), mc = Math.max(-lc, Math.min(lc, m));
  const half = Math.round(2.4 * n * n + 4);

  const maxD = useMemo(() => {
    let mx = 0;
    for (let i = 0; i <= 70; i++) for (let j = -70; j <= 70; j++) mx = Math.max(mx, hydrogenDensity(n, lc, mc, (i / 70) * half, (j / 70) * half));
    return mx || 1;
  }, [n, lc, mc, half]);

  const radial = useMemo(() => {
    const rMax = half * 1.05, pts = [];
    let peak = 0, peakR = 0;
    for (let i = 0; i <= 400; i++) {
      const r = (i / 400) * rMax, R = hydrogenRadial(n, lc, r), P = r * r * R * R;
      pts.push([r, P]);
      if (P > peak) { peak = P; peakR = r; }
    }
    return { pts, peak, peakR, rMax };
  }, [n, lc, half]);

  const E = hydrogenEnergy(n), meanR = hydrogenMeanR(n, lc);
  const lo = n > 2 ? 2 : 1;
  const lam = HC_EV_NM / (RYDBERG_EV * (1 / (lo * lo) - 1 / (n * n)));
  const name = `${n}${ORBITAL_NAMES[lc]}`;
  const gamma = 0.45;

  return (
    <div className="qp-lab-grid">
      <div className="qp-main-col">
        <p className="qp-instructions">
          <Info size={14} /> The hydrogen atom’s orbitals ψₙₗₘ(r, θ, φ). The picture is a cross-section through the nucleus (vertical axis = z) of the probability
          density |ψ|² — brighter means the electron is more likely to be found there. n sets the size and energy, l the shape (s, p, d, f) and m the orientation about z.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div className="qp-card" style={{ flex: "1 1 340px" }}>
            <h4>Orbital {name}, m = {mc} — density slice (axes in Bohr radii a₀)</h4>
            <MathPlot
              xr={[-half, half]} yr={[-half, half]} square grid={false} xLabel="x (a₀)" yLabel="z (a₀)" label={`Hydrogen ${name} orbital cross-section`}
              paintKey={`${n}-${lc}-${mc}`} paintRes={170}
              paint={(x, z) => { const d = hydrogenDensity(n, lc, mc, Math.abs(x), z) / maxD; const c = rampColor(Math.pow(d, gamma)); return [c[0], c[1], c[2], 255]; }}
            >
              {({ X, Y }) => (
                <>
                  <circle cx={X(0)} cy={Y(0)} r={3} fill={PLOT.red} stroke="#fff" strokeWidth={1.5} />
                  <line x1={X(0)} x2={X(0)} y1={0} y2={Y(-half)} stroke="rgba(255,255,255,0.35)" strokeDasharray="3 5" />
                </>
              )}
            </MathPlot>
          </div>
          <div className="qp-card" style={{ flex: "1 1 280px" }}>
            <h4>Radial probability P(r) = r²R²</h4>
            <MathPlot xr={[0, radial.rMax]} yr={[0, radial.peak * 1.15]} height={260} xLabel="r (a₀)" label="Radial distribution">
              {({ X, Y }) => (
                <>
                  <path d={`${pathD(radial.pts, X, Y)} L${X(radial.rMax)},${Y(0)} L${X(0)},${Y(0)} Z`} fill="rgba(14,142,163,0.18)" stroke={PLOT.teal} strokeWidth={2.2} />
                  <line x1={X(meanR)} x2={X(meanR)} y1={0} y2={Y(0)} stroke={PLOT.amber} strokeDasharray="5 4" strokeWidth={1.8} />
                  <text x={X(meanR) + 5} y={16} fontSize={11} fill={PLOT.amber}>⟨r⟩</text>
                  <line x1={X(radial.peakR)} x2={X(radial.peakR)} y1={Y(radial.peak)} y2={Y(0)} stroke={PLOT.red} strokeDasharray="2 4" strokeWidth={1.5} />
                </>
              )}
            </MathPlot>
            <p className="qp-muted small" style={{ margin: "8px 0 0" }}><span style={{ color: PLOT.amber }}>┆</span> mean radius ⟨r⟩ &nbsp; <span style={{ color: PLOT.red }}>┆</span> most probable radius</p>
          </div>
        </div>
      </div>
      <div className="qp-side-col">
        <div className="qp-card">
          <h4>Quantum numbers</h4>
          <Slider label="Principal n" value={n} min={1} max={5} step={1} onChange={(v) => { setN(v); setL((x) => Math.min(x, v - 1)); }} />
          <Slider label={`Angular momentum l (${ORBITAL_NAMES[lc]})`} value={lc} min={0} max={n - 1} step={1} onChange={(v) => { setL(v); setM((x) => Math.max(-v, Math.min(v, x))); }} />
          <Slider label="Magnetic m" value={mc} min={-lc} max={lc} step={1} onChange={setM} />
        </div>
        <div className="qp-card">
          <h4>Results</h4>
          <div className="qp-readout-grid">
            <Readout label={`Energy E${n}`} value={`${fmt(E, 4)} eV`} accent="#0e8ea3" />
            <Readout label="Mean radius ⟨r⟩" value={`${fmt(meanR, 4)} a₀ = ${fmt(meanR * A0_NM, 3)} nm`} />
            <Readout label="Most probable r" value={`${fmt(radial.peakR, 3)} a₀`} />
            <Readout label="Radial / angular nodes" value={`${n - lc - 1} / ${lc}`} accent="#8b4fd8" />
            <Readout label={lo === 2 ? `Balmer line ${n}→2` : "Lyman-α 2→1"} value={`${fmt(lam, 4)} nm (${band(lam)})`} accent="#c2740a" />
            <Readout label="Degeneracy of level" value={`${n * n} orbitals (×2 spin)`} />
          </div>
          <p className="qp-muted small" style={{ margin: "0 0 10px" }}>The energy depends only on n: all {n * n} orbitals of this shell are degenerate (the 1/n² Bohr formula, E = −13.6 eV/n²).</p>
          <button className="qp-btn" onClick={() => log("Quantum: Hydrogen Orbitals", `n=${n}, l=${lc} (${ORBITAL_NAMES[lc]}), m=${mc}`, `E=${fmt(E, 4)} eV, ⟨r⟩=${fmt(meanR, 4)} a₀, most probable r=${fmt(radial.peakR, 3)} a₀, nodes (radial/angular)=${n - lc - 1}/${lc}`)}>
            Record result
          </button>
        </div>
      </div>
    </div>
  );
}
