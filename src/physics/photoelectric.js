/**
 * physics/photoelectric.js
 * -----------------------------------------------------------------------
 * Einstein's photoelectric equation:
 *   E_photon = h f
 *   KE_max   = h f - φ           (φ = work function of the metal, eV)
 *   f0       = φ / h             (threshold frequency; below this, no
 *                                 electrons are emitted regardless of
 *                                 intensity)
 *   V_stop   = KE_max / e        (numerically equal to KE_max when KE is
 *                                 expressed in eV, since 1 eV = e * 1 V)
 *
 * Intensity affects the *rate* of photon arrival (and thus the number of
 * emitted electrons per second / photocurrent), never the energy of an
 * individual photon — that depends on frequency alone. Encoding this
 * correctly (rather than letting intensity leak into the energy formula)
 * is the whole pedagogical point of the experiment.
 * -----------------------------------------------------------------------
 */
import { CONST } from "./constants";

export const METALS = [
  { name: "Cesium", symbol: "Cs", phi: 2.14 },
  { name: "Sodium", symbol: "Na", phi: 2.28 },
  { name: "Potassium", symbol: "K", phi: 2.30 },
  { name: "Calcium", symbol: "Ca", phi: 2.87 },
  { name: "Zinc", symbol: "Zn", phi: 4.33 },
  { name: "Copper", symbol: "Cu", phi: 4.70 },
  { name: "Silver", symbol: "Ag", phi: 4.73 },
  { name: "Platinum", symbol: "Pt", phi: 6.35 },
];

export function photonEnergyEV(frequencyHz) {
  return CONST.hEV * frequencyHz;
}

export function computePhotoelectric(frequencyHz, workFunctionEV) {
  const photonE = photonEnergyEV(frequencyHz);
  const KEmax = Math.max(0, photonE - workFunctionEV);
  const stoppingVoltage = KEmax; // volts, numerically equal to KEmax in eV
  const thresholdFrequency = workFunctionEV / CONST.hEV;
  return {
    photonE,
    KEmax,
    stoppingVoltage,
    thresholdFrequency,
    emitting: photonE > workFunctionEV,
  };
}
