/**
 * physics/fluidDynamics.js
 * -----------------------------------------------------------------------
 * Simplified incompressible pipe-flow physics for a converging pipe
 * (a venturi-style constriction), all classic textbook relations:
 *
 *   Continuity equation (mass conservation, incompressible flow):
 *     A1 v1 = A2 v2   =>   v2 = v1 (A1 / A2)
 *   A pipe narrowing forces the fluid to speed up — no free parameter,
 *   it follows directly from volume flow rate Q = A·v being constant.
 *
 *   Bernoulli's equation (energy conservation along a streamline, for a
 *   horizontal pipe so the ρgh term is the same at both ends and cancels):
 *     P1 + ½ρv1² = P2 + ½ρv2²   =>   P2 = P1 + ½ρ(v1² − v2²)
 *   Faster flow (through the constriction) means *lower* pressure there —
 *   the same principle behind aircraft lift and a perfume atomizer.
 *
 *   Reynolds number (ratio of inertial to viscous forces):
 *     Re = ρ v D / μ
 *   Re < 2300         → laminar (smooth, parallel layers)
 *   2300 ≤ Re < 4000  → transitional
 *   Re ≥ 4000         → turbulent (chaotic mixing, eddies)
 *   This is the standard pipe-flow classification; real transition
 *   Reynolds numbers vary with pipe roughness and disturbances, so 2300
 *   and 4000 are the widely-taught reference thresholds, not exact cutoffs.
 *
 * This model is idealized: it ignores viscous (frictional) pressure loss
 * along straight sections, which is why Bernoulli's equation alone can be
 * used for the pressure change — a simplification appropriate for an
 * introductory teaching tool, not a real engineering pipe-flow calculation.
 * -----------------------------------------------------------------------
 */

export const FLUIDS = [
  { key: "water", label: "Water", density: 998, viscosity: 1.002e-3 },
  { key: "air", label: "Air", density: 1.225, viscosity: 1.81e-5 },
  { key: "oil", label: "Motor oil (SAE 30)", density: 918, viscosity: 0.29 },
  { key: "glycerin", label: "Glycerin", density: 1260, viscosity: 1.412 },
  { key: "honey", label: "Honey", density: 1420, viscosity: 10 },
];

/** Cross-sectional area of a circular pipe from its diameter. */
export function pipeArea(diameter) {
  const r = diameter / 2;
  return Math.PI * r * r;
}

/** Continuity equation: exit velocity from inlet velocity and the two diameters. */
export function continuityVelocity(v1, d1, d2) {
  const A1 = pipeArea(d1);
  const A2 = pipeArea(d2);
  return (v1 * A1) / A2;
}

/** Bernoulli pressure at the narrow section, relative to inlet pressure P1 (horizontal pipe). */
export function bernoulliPressure(P1, density, v1, v2) {
  return P1 + 0.5 * density * (v1 * v1 - v2 * v2);
}

export function reynoldsNumber(density, velocity, diameter, viscosity) {
  return (density * velocity * diameter) / viscosity;
}

export function flowRegime(Re) {
  if (Re < 2300) return "laminar";
  if (Re < 4000) return "transitional";
  return "turbulent";
}

/**
 * Full solve for a converging pipe: given inlet velocity/diameter, throat
 * diameter, inlet pressure, and fluid properties, returns everything
 * needed to render and label the experiment.
 */
export function solvePipeFlow({ v1, d1, d2, P1, fluid }) {
  const v2 = continuityVelocity(v1, d1, d2);
  const P2 = bernoulliPressure(P1, fluid.density, v1, v2);
  const Re1 = reynoldsNumber(fluid.density, v1, d1, fluid.viscosity);
  const Re2 = reynoldsNumber(fluid.density, v2, d2, fluid.viscosity);
  return {
    v1, v2, P1, P2,
    Re1, Re2,
    regime1: flowRegime(Re1),
    regime2: flowRegime(Re2),
    Q: v1 * pipeArea(d1), // volumetric flow rate, m^3/s (same at both ends by continuity)
  };
}

/**
 * Sample velocity, pressure, and local diameter along the pipe's length,
 * for charting. `xFrac` runs 0 (inlet) to 1 (outlet); the constriction is
 * modeled as a smooth cosine-shaped throat centered at xFrac = 0.5.
 */
export function pipeDiameterAt(xFrac, d1, d2, throatWidth = 0.28) {
  const center = 0.5;
  const half = throatWidth / 2;
  if (xFrac < center - half || xFrac > center + half) return d1;
  const local = (xFrac - (center - half)) / throatWidth; // 0..1 across the throat region
  const shape = 0.5 - 0.5 * Math.cos(local * Math.PI * 2); // 0 at edges, 1 at center
  return d1 - (d1 - d2) * shape;
}

export function samplePipeProfile(solved, d1, d2, density, steps = 60) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const xFrac = i / steps;
    const d = pipeDiameterAt(xFrac, d1, d2);
    const A = pipeArea(d);
    const v = solved.Q / A; // continuity: local velocity from the (constant) flow rate
    const P = bernoulliPressure(solved.P1, density, solved.v1, v); // Bernoulli relative to the inlet
    pts.push({ xFrac, d, v, P });
  }
  return pts;
}
