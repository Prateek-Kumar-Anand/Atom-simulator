/**
 * physics/electromagnetism.js
 * -----------------------------------------------------------------------
 * Classical electromagnetism: Coulomb's law fields/potentials, magnetic
 * field models (bar magnet dipole, straight wire, solenoid), the Lorentz
 * force with a simple RK4 trajectory integrator, and plane EM waves.
 * All charge/point coordinates are in a "lab plane" measured in
 * centimeters for on-screen readability; SI values are derived internally.
 * -----------------------------------------------------------------------
 */

export const K_COULOMB = 8.9875517923e9; // N·m²/C², Coulomb constant
export const MU0 = 1.25663706212e-6; // vacuum permeability, T·m/A
export const EPS0 = 8.8541878128e-12; // vacuum permittivity, F/m

/** E and V at a field point due to one point charge (q in nC, distances in cm). */
function pointChargeContribution(charge, px, py) {
  const dx = px - charge.x;
  const dy = py - charge.y;
  const rCm = Math.hypot(dx, dy);
  const r = Math.max(rCm, 0.15) / 100; // to meters, clamp to avoid singularity
  const q = charge.q * 1e-9; // nC -> C
  const E = (K_COULOMB * q) / (r * r);
  const V = (K_COULOMB * q) / r;
  const ux = dx / Math.max(rCm, 1e-6);
  const uy = dy / Math.max(rCm, 1e-6);
  return { Ex: E * ux, Ey: E * uy, V, r };
}

/** Net field vector (N/C) and potential (V) at (px,py) from all charges. */
export function fieldAt(charges, px, py) {
  let Ex = 0, Ey = 0, V = 0;
  for (const c of charges) {
    const contrib = pointChargeContribution(c, px, py);
    Ex += contrib.Ex;
    Ey += contrib.Ey;
    V += contrib.V;
  }
  return { Ex, Ey, V, mag: Math.hypot(Ex, Ey) };
}

/** Sample a grid of field vectors across the plane, for arrow-field rendering. */
export function sampleFieldGrid(charges, halfExtentCm, n = 12) {
  const pts = [];
  const step = (halfExtentCm * 2) / n;
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      const x = -halfExtentCm + i * step;
      const y = -halfExtentCm + j * step;
      const skip = charges.some((c) => Math.hypot(x - c.x, y - c.y) < 0.6);
      if (skip) continue;
      const f = fieldAt(charges, x, y);
      pts.push({ x, y, ...f });
    }
  }
  return pts;
}

/** Trace one field line by stepping along the (normalized) field direction from a seed point. */
function traceFieldLine(charges, startX, startY, halfExtent, steps, stepSize) {
  const pts = [{ x: startX, y: startY }];
  let x = startX, y = startY;
  for (let i = 0; i < steps; i++) {
    const f = fieldAt(charges, x, y);
    if (f.mag < 1e-3) break;
    x += (f.Ex / f.mag) * stepSize;
    y += (f.Ey / f.mag) * stepSize;
    if (Math.abs(x) > halfExtent * 1.05 || Math.abs(y) > halfExtent * 1.05) { pts.push({ x, y }); break; }
    const hitSink = charges.some((c) => c.q < 0 && Math.hypot(x - c.x, y - c.y) < 0.35);
    pts.push({ x, y });
    if (hitSink) break;
  }
  return pts;
}

/** Build electric field lines seeded evenly around every positive charge (or, if all charges
 * share one sign, seeded outward/inward from every charge so the pattern is still visible). */
export function fieldLines(charges, halfExtentCm = 6, linesPerCharge = 10, stepSize = 0.12, steps = 260) {
  const lines = [];
  const hasPositive = charges.some((c) => c.q > 0);
  for (const c of charges) {
    const isSource = hasPositive ? c.q > 0 : true;
    if (!isSource) continue;
    for (let i = 0; i < linesPerCharge; i++) {
      const angle = (i / linesPerCharge) * Math.PI * 2;
      const seedX = c.x + Math.cos(angle) * 0.4;
      const seedY = c.y + Math.sin(angle) * 0.4;
      const dir = c.q >= 0 ? 1 : -1;
      lines.push(traceFieldLine(charges, seedX, seedY, halfExtentCm, steps, stepSize * dir));
    }
  }
  return lines;
}

// --- Magnetic field models -------------------------------------------------

/** Dipole field of a bar magnet centered at origin, moment along +x (N pole at +x end).
 * Uses the standard 2D magnetic-dipole formula; strength scaled for display purposes. */
export function barMagnetFieldAt(strength, px, py) {
  const r = Math.max(Math.hypot(px, py), 0.25);
  const theta = Math.atan2(py, px);
  const m = strength;
  const Br = (2 * m * Math.cos(theta)) / (r ** 3);
  const Btheta = (m * Math.sin(theta)) / (r ** 3);
  const Bx = Br * Math.cos(theta) - Btheta * Math.sin(theta);
  const By = Br * Math.sin(theta) + Btheta * Math.cos(theta);
  return { Bx, By, mag: Math.hypot(Bx, By) };
}

/** Field magnitude around a long straight current-carrying wire (out of the page at origin).
 * B = μ0·I / (2π·r); direction is azimuthal (right-hand rule), magnitude in mT for display. */
export function wireFieldAt(currentA, px, py) {
  const rCm = Math.max(Math.hypot(px, py), 0.2);
  const r = rCm / 100;
  const Bmag = (MU0 * currentA) / (2 * Math.PI * r); // Tesla
  const theta = Math.atan2(py, px);
  // Azimuthal direction (counter-clockwise for current out of page, +I convention)
  const Bx = -Bmag * Math.sin(theta);
  const By = Bmag * Math.cos(theta);
  return { Bx, By, mag: Bmag, mT: Bmag * 1000 };
}

/** Uniform field inside a long solenoid: B = μ0·n·I (n = turns per meter). Zero-ish outside. */
export function solenoidFieldInside(currentA, turnsPerMeter) {
  return MU0 * turnsPerMeter * currentA; // Tesla
}

/** Generic streamline tracer: follows a 2D vector field {vx,vy} from a seed point. Used to
 * draw closed dipole field-line loops for the bar magnet visualization. */
export function traceStreamline(vectorFieldFn, startX, startY, steps = 200, stepSize = 0.15, bound = 9) {
  const pts = [{ x: startX, y: startY }];
  let x = startX, y = startY;
  for (let i = 0; i < steps; i++) {
    const v = vectorFieldFn(x, y);
    const mag = Math.hypot(v.x, v.y);
    if (mag < 1e-8) break;
    x += (v.x / mag) * stepSize;
    y += (v.y / mag) * stepSize;
    pts.push({ x, y });
    if (Math.hypot(x, y) > bound) break;
  }
  return pts;
}

/** Closed-loop bar-magnet field lines: each seeded near the N pole, traced outward and
 * back around toward the S pole so the loops read as the classic dipole pattern. */
export function barMagnetFieldLines(strength, nLines = 10) {
  const lines = [];
  for (let i = 0; i < nLines; i++) {
    const frac = (i + 0.5) / nLines - 0.5; // -0.5..0.5
    const seedY = frac * 3.2;
    const seedX = 0.9;
    const forward = traceStreamline((x, y) => { const b = barMagnetFieldAt(strength, x, y); return { x: b.Bx, y: b.By }; }, seedX, seedY, 140, 0.1, 8);
    const backward = traceStreamline((x, y) => { const b = barMagnetFieldAt(strength, x, y); return { x: -b.Bx, y: -b.By }; }, seedX, seedY, 140, 0.1, 8);
    lines.push([...backward.reverse(), ...forward]);
  }
  return lines;
}

// --- Lorentz force & trajectory ---------------------------------------------

/** F = q(E + v × B). Fields are uniform vectors {x,y,z}; returns force vector. */
export function lorentzForce(q, v, E, B) {
  const vxB = {
    x: v.y * B.z - v.z * B.y,
    y: v.z * B.x - v.x * B.z,
    z: v.x * B.y - v.y * B.x,
  };
  return {
    x: q * (E.x + vxB.x),
    y: q * (E.y + vxB.y),
    z: q * (E.z + vxB.z),
  };
}

/** Integrate a charged particle's trajectory under uniform E and B fields using RK4.
 * q in C, m in kg, v0 in m/s, E in V/m, B in T. Returns an array of {x,y,z,t} in meters. */
export function integrateTrajectory({ q, m, v0, E, B, dt = 1e-11, steps = 400 }) {
  let pos = { x: 0, y: 0, z: 0 };
  let vel = { ...v0 };
  const pts = [{ ...pos, t: 0 }];

  const accel = (v) => {
    const F = lorentzForce(q, v, E, B);
    return { x: F.x / m, y: F.y / m, z: F.z / m };
  };

  for (let i = 0; i < steps; i++) {
    const k1v = accel(vel);
    const k1x = vel;

    const v2 = { x: vel.x + (k1v.x * dt) / 2, y: vel.y + (k1v.y * dt) / 2, z: vel.z + (k1v.z * dt) / 2 };
    const k2v = accel(v2);
    const k2x = v2;

    const v3 = { x: vel.x + (k2v.x * dt) / 2, y: vel.y + (k2v.y * dt) / 2, z: vel.z + (k2v.z * dt) / 2 };
    const k3v = accel(v3);
    const k3x = v3;

    const v4 = { x: vel.x + k3v.x * dt, y: vel.y + k3v.y * dt, z: vel.z + k3v.z * dt };
    const k4v = accel(v4);
    const k4x = v4;

    pos = {
      x: pos.x + (dt / 6) * (k1x.x + 2 * k2x.x + 2 * k3x.x + k4x.x),
      y: pos.y + (dt / 6) * (k1x.y + 2 * k2x.y + 2 * k3x.y + k4x.y),
      z: pos.z + (dt / 6) * (k1x.z + 2 * k2x.z + 2 * k3x.z + k4x.z),
    };
    vel = {
      x: vel.x + (dt / 6) * (k1v.x + 2 * k2v.x + 2 * k3v.x + k4v.x),
      y: vel.y + (dt / 6) * (k1v.y + 2 * k2v.y + 2 * k3v.y + k4v.y),
      z: vel.z + (dt / 6) * (k1v.z + 2 * k2v.z + 2 * k3v.z + k4v.z),
    };
    pts.push({ ...pos, t: (i + 1) * dt });

    // Bail out early if the particle has flown far off the visualized region.
    if (Math.hypot(pos.x, pos.y, pos.z) > 5) break;
  }
  return { pts, finalSpeed: Math.hypot(vel.x, vel.y, vel.z) };
}

// --- Electromagnetic waves ---------------------------------------------------

export const SPEED_OF_LIGHT_DERIVED = 1 / Math.sqrt(MU0 * EPS0); // c = 1/√(μ0ε0)

/** Sample a plane EM wave along the propagation (z) axis at time t: E oscillates in x,
 * B oscillates in y, both perpendicular to propagation and to each other. */
export function sampleEMWave({ amplitude = 1, wavelengthM = 1, t = 0, length = 4, steps = 120 }) {
  const k = (2 * Math.PI) / wavelengthM;
  const omega = k * SPEED_OF_LIGHT_DERIVED;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const z = (i / steps) * length - length / 2;
    const phase = k * z - omega * t;
    const E = amplitude * Math.sin(phase);
    const B = amplitude * Math.sin(phase); // B/c in SI, normalized to same amplitude for display
    pts.push({ z, E, B });
  }
  return pts;
}
