/**
 * physics/quantum.js
 * -----------------------------------------------------------------------
 * Three simplified-but-physically-grounded quantum experiments.
 *
 * DOUBLE SLIT — Fraunhofer two-slit diffraction/interference intensity:
 *   I(θ) = I0 · [cos(πd·sinθ/λ)]² · [sinc(πa·sinθ/λ)]²
 * The first factor is two-source interference (slit separation d), the
 * second is single-slit diffraction (slit width a) that shapes the
 * overall envelope. With "which-path" information available (only one
 * slit effectively contributing, or the slits made fully distinguishable)
 * the cross term that produces interference vanishes, and the pattern
 * reduces to the plain single-slit diffraction envelope — this is the
 * standard textbook account of complementarity, not a claim about *how*
 * a measurement destroys the pattern mechanically.
 *
 * QUANTUM TUNNELING — transmission through a rectangular potential
 * barrier of height V0 and width L, for a particle of energy E < V0
 * (classically forbidden region):
 *   κ = sqrt(2m(V0−E)) / ħ
 *   T = [1 + (V0² sinh²(κL)) / (4E(V0−E))]⁻¹
 * For E ≥ V0 this simplified model reports T = 1 (over the barrier);
 * the exact quantum result actually still has partial reflection there
 * (resonance effects), which this teaching-level model omits.
 *
 * ENTANGLEMENT — a singlet-like pair with perfectly anti-correlated
 * outcomes along a shared measurement axis. This demonstrates quantum
 * correlation correctly: each individual outcome is fundamentally random
 * (50/50) at the moment of measurement, and the correlation is only ever
 * visible once the two measurement records are brought together and
 * compared — which requires ordinary (subluminal) communication. No
 * information is transmitted by the measurement itself (the
 * no-communication theorem), so this does not permit faster-than-light
 * signaling, contrary to a common misconception.
 * -----------------------------------------------------------------------
 */
import { CONST } from "./constants";

/** sinc(x) = sin(x)/x, with the removable singularity at x=0 handled. */
function sinc(x) {
  if (Math.abs(x) < 1e-8) return 1;
  return Math.sin(x) / x;
}

/**
 * Double-slit intensity at screen position y (meters), screen distance L (meters).
 * d, a, wavelength all in nanometers for convenient slider ranges.
 * whichPathKnown: if true, drops the interference term (single-slit envelope only).
 */
export function doubleSlitIntensity(y, { wavelengthNm, slitSeparationUm, slitWidthUm, screenDistanceM, whichPathKnown }) {
  const lambda = wavelengthNm * 1e-9;
  const d = slitSeparationUm * 1e-6;
  const a = slitWidthUm * 1e-6;
  const sinTheta = y / Math.sqrt(y * y + screenDistanceM * screenDistanceM);

  const diffraction = Math.pow(sinc((Math.PI * a * sinTheta) / lambda), 2);
  if (whichPathKnown) return diffraction;

  const interference = Math.pow(Math.cos((Math.PI * d * sinTheta) / lambda), 2);
  return diffraction * interference;
}

/** Sample the intensity pattern into a discrete probability distribution over screen position. */
export function sampleDoubleSlitPattern(params, halfRangeM, steps = 240) {
  const pts = [];
  let total = 0;
  for (let i = 0; i <= steps; i++) {
    const y = -halfRangeM + (2 * halfRangeM * i) / steps;
    const I = doubleSlitIntensity(y, params);
    pts.push({ y, I });
    total += I;
  }
  return { pts, total };
}

/** Draw one random detection position from the (normalized) intensity distribution. */
export function drawDoubleSlitHit({ pts, total }) {
  let r = Math.random() * total;
  for (const p of pts) {
    r -= p.I;
    if (r <= 0) return p.y;
  }
  return pts[pts.length - 1].y;
}

/** Tunneling transmission probability. E, V0 in eV; L in nm; mRatio = particle mass / electron mass. */
export function tunnelingProbability(E, V0, L, mRatio = 1) {
  if (E >= V0) return 1; // simplified model: no reflection above the barrier (see file header)
  if (E <= 0) return 0;
  const m = mRatio * CONST.me;
  const barrierJ = (V0 - E) * CONST.e; // eV -> J
  const kappa = Math.sqrt(2 * m * barrierJ) / (CONST.h / (2 * Math.PI)); // 1/m
  const kappaL = kappa * (L * 1e-9);
  const sinh2 = Math.sinh(kappaL) ** 2;
  const denom = 1 + (V0 * V0 * sinh2) / (4 * E * (V0 - E));
  return 1 / denom;
}

/** Sample transmission probability across a range of energies, for the T(E) chart. */
export function sampleTunnelingCurve(V0, L, mRatio = 1, steps = 60) {
  const pts = [];
  const Emax = V0 * 1.6;
  for (let i = 1; i <= steps; i++) {
    const E = (Emax * i) / steps;
    pts.push({ E, T: tunnelingProbability(E, V0, L, mRatio) });
  }
  return pts;
}

/** One measurement of an entangled singlet-like pair: perfectly anti-correlated, individually random. */
export function measureEntangledPair() {
  const a = Math.random() < 0.5 ? "↑" : "↓";
  const b = a === "↑" ? "↓" : "↑";
  return { a, b };
}
