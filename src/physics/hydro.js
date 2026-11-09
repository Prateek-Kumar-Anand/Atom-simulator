/**
 * physics/hydro.js
 * -----------------------------------------------------------------------
 * Models for the additional hydrodynamics experiments: hydrostatics and
 * buoyancy, Torricelli draining, Poiseuille flow, potential flow past a
 * cylinder, drag and terminal velocity, and gravity waves on water.
 * SI units throughout.
 * -----------------------------------------------------------------------
 */
import { FLUIDS } from "./fluidDynamics";

export const G = 9.80665;
export const ATM = 101325;

export const FLUIDS_EXT = [
  ...FLUIDS,
  { key: "seawater", label: "Seawater", density: 1025, viscosity: 1.08e-3 },
  { key: "mercury", label: "Mercury", density: 13534, viscosity: 1.526e-3 },
  { key: "ethanol", label: "Ethanol", density: 789, viscosity: 1.07e-3 },
  { key: "blood", label: "Blood (37 °C)", density: 1060, viscosity: 3.5e-3 },
];
export const fluidByKey = (k) => FLUIDS_EXT.find((f) => f.key === k) || FLUIDS_EXT[0];

/* ---- Hydrostatics & buoyancy -------------------------------------------------------------- */
export const hydrostaticPressure = (rho, depth, p0 = ATM) => p0 + rho * G * depth;

/** Cube of side s (m) and density rhoObj placed in a deep fluid of density rhoF. */
export function buoyancy(rhoF, rhoObj, s) {
  const V = s * s * s, W = rhoObj * V * G;
  const floats = rhoObj <= rhoF;
  const subFrac = floats ? rhoObj / rhoF : 1;
  const Fb = rhoF * G * V * subFrac;
  return { V, W, floats, subFrac, draft: subFrac * s, Fb, net: W - Fb, apparent: floats ? 0 : W - Fb };
}

/* ---- Torricelli draining ------------------------------------------------------------------- */
export const torricelliSpeed = (h) => Math.sqrt(2 * G * Math.max(h, 0));
/** Water head above the hole after t seconds (exact solution of dh/dt = −Cd (a/A) √(2gh)). */
export function torricelliHead(h0, tankR, holeR, Cd, t) {
  const k = Cd * (holeR * holeR) / (tankR * tankR) * Math.sqrt(G / 2);
  const root = Math.sqrt(h0) - k * t;
  return root > 0 ? root * root : 0;
}
export function torricelliEmptyTime(h0, tankR, holeR, Cd) {
  return (tankR * tankR) / (Cd * holeR * holeR) * Math.sqrt((2 * h0) / G);
}
/** Horizontal range of the jet from a hole at height y0 above the ground with head h. */
export const torricelliRange = (h, y0) => 2 * Math.sqrt(Math.max(h, 0) * y0);

/* ---- Poiseuille flow ----------------------------------------------------------------------- */
export function poiseuille(mu, rho, R, Lpipe, dP) {
  const Q = (Math.PI * Math.pow(R, 4) * dP) / (8 * mu * Lpipe);
  const vavg = Q / (Math.PI * R * R);
  return { Q, vavg, vmax: 2 * vavg, tauWall: (dP * R) / (2 * Lpipe), Re: (rho * vavg * 2 * R) / mu, laminar: (rho * vavg * 2 * R) / mu < 2300 };
}
export const poiseuilleProfile = (mu, R, Lpipe, dP, r) => (dP / (4 * mu * Lpipe)) * Math.max(0, R * R - r * r);

/* ---- Potential flow past a cylinder (uniform stream + doublet + vortex) ------------------------ */
/** Velocity (u, v) at (x, y); radius a, stream U along +x, circulation Γ counter-clockwise (m²/s). */
export function cylinderVelocity(x, y, U, a, gammaCCW) {
  const r2 = x * x + y * y;
  if (r2 < a * a) return [0, 0];
  const a2 = a * a;
  const u = U * (1 - (a2 * (x * x - y * y)) / (r2 * r2)) - (gammaCCW * y) / (2 * Math.PI * r2);
  const v = -U * ((2 * a2 * x * y) / (r2 * r2)) + (gammaCCW * x) / (2 * Math.PI * r2);
  return [u, v];
}
/** Surface tangential speed (counter-clockwise positive) at polar angle θ. */
export const cylinderSurfaceSpeed = (theta, U, a, gammaCCW) => -2 * U * Math.sin(theta) + gammaCCW / (2 * Math.PI * a);
export const pressureCoefficient = (speed, U) => 1 - (speed * speed) / (U * U);
/** Stagnation angles (radians) for the given circulation; null when the stagnation point has left the surface. */
export function cylinderStagnation(U, a, gammaCCW) {
  const s = gammaCCW / (4 * Math.PI * a * U);
  if (Math.abs(s) > 1) return null;
  const t1 = Math.asin(s);
  return [t1, Math.PI - t1];
}
/** Kutta–Joukowski lift per unit span, up positive (clockwise circulation gives lift). */
export const kuttaLift = (rho, U, gammaCCW) => -rho * U * gammaCCW;
/** Streamline traced by arc-length RK4 from (x0, y0). Stops outside the window or after `maxSteps`. */
export function traceStreamline(x0, y0, U, a, gammaCCW, win, ds = 0.05, maxSteps = 900, dir = 1) {
  const pts = [[x0, y0]];
  let x = x0, y = y0;
  const dirAt = (px, py) => { const [u, v] = cylinderVelocity(px, py, U, a, gammaCCW); const m = Math.hypot(u, v) || 1; return [(dir * u) / m, (dir * v) / m]; };
  for (let i = 0; i < maxSteps; i++) {
    const k1 = dirAt(x, y), k2 = dirAt(x + (ds / 2) * k1[0], y + (ds / 2) * k1[1]), k3 = dirAt(x + (ds / 2) * k2[0], y + (ds / 2) * k2[1]), k4 = dirAt(x + ds * k3[0], y + ds * k3[1]);
    x += (ds / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    y += (ds / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    if (x * x + y * y < a * a * 0.98 || Math.abs(x) > win || Math.abs(y) > win) break;
    pts.push([x, y]);
  }
  return pts;
}

/* ---- Drag and terminal velocity -------------------------------------------------------------- */
/** Drag coefficient of a smooth sphere (Schiller–Naumann, flat 0.44 above Re = 1000). */
export function sphereCd(Re) {
  if (Re < 1e-9) return 1e9;
  return Re < 1000 ? (24 / Re) * (1 + 0.15 * Math.pow(Re, 0.687)) : 0.44;
}
export const stokesTerminal = (rhoS, rhoF, d, mu) => ((rhoS - rhoF) * G * d * d) / (18 * mu);
/** Net downward acceleration of a sphere moving down at speed v. */
export function fallAcceleration(v, d, rhoS, rhoF, mu) {
  const A = (Math.PI * d * d) / 4, m = (rhoS * Math.PI * Math.pow(d, 3)) / 6;
  const Re = (rhoF * Math.abs(v) * d) / mu;
  const drag = 0.5 * rhoF * sphereCd(Re) * A * v * Math.abs(v);
  // virtual (added) mass of ½ the displaced fluid mass is included, as is appropriate for a sphere
  const added = 0.5 * rhoF * (Math.PI * Math.pow(d, 3)) / 6;
  return ((rhoS - rhoF) * G * (Math.PI * Math.pow(d, 3)) / 6 - drag) / (m + added);
}
/** Terminal speed (> 0 for sinking spheres, magnitude only) found by bisection on the force balance. */
export function terminalVelocity(d, rhoS, rhoF, mu) {
  if (rhoS <= rhoF) return 0;
  let lo = 0, hi = 1;
  while (fallAcceleration(hi, d, rhoS, rhoF, mu) > 0 && hi < 1e6) hi *= 2;
  for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (fallAcceleration(mid, d, rhoS, rhoF, mu) > 0) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
/** Fall from rest (speed v(t), distance y(t)) with RK4. Returns arrays of {t, v, y}. */
export function simulateFall(d, rhoS, rhoF, mu, tEnd, n = 400) {
  const out = [{ t: 0, v: 0, y: 0 }];
  let v = 0, y = 0;
  const dt = tEnd / n;
  const f = (vv) => fallAcceleration(vv, d, rhoS, rhoF, mu);
  for (let i = 1; i <= n; i++) {
    const k1 = f(v), k2 = f(v + 0.5 * dt * k1), k3 = f(v + 0.5 * dt * k2), k4 = f(v + dt * k3);
    const v2 = v + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    y += 0.5 * (v + v2) * dt;
    v = v2;
    out.push({ t: i * dt, v, y });
  }
  return out;
}

/* ---- Gravity waves on water ------------------------------------------------------------------ */
export function waveProps(lambda, depth) {
  const k = (2 * Math.PI) / lambda, kh = k * depth;
  const omega = Math.sqrt(G * k * Math.tanh(kh));
  const c = omega / k;
  const n = 0.5 * (1 + (2 * kh) / Math.sinh(2 * kh));
  return { k, kh, omega, c, cg: n * c, period: (2 * Math.PI) / omega, regime: kh > Math.PI ? "deep" : kh < Math.PI / 10 ? "shallow" : "intermediate" };
}
/** Orbit semi-axes of a water particle at height z above the bed (z from 0 at the bed to depth at the surface). */
export function waveOrbit(amp, k, depth, zAboveBed) {
  const s = Math.sinh(k * depth);
  return { ax: (amp * Math.cosh(k * zAboveBed)) / s, az: (amp * Math.sinh(k * zAboveBed)) / s };
}
