/**
 * physics/hydrogenSpectrum.js
 * -----------------------------------------------------------------------
 * Bohr-model energy levels and spectral-line calculations, generalized to
 * any one-electron ("hydrogen-like") ion:
 *   E(n) = -13.6 eV · Z^2 / n^2            (bound-state energy of level n)
 *   ΔE   = |E(n_i) - E(n_f)|               (photon energy for a transition)
 *   λ    = hc / ΔE                         (photon wavelength)
 * Z = 1 recovers plain hydrogen. Z > 1 models a hydrogen-like ion — an
 * atom of that element stripped down to a single remaining electron
 * (He+, Li2+, ... up to Og117+) — which is the standard, exact extension
 * of the Bohr model taught for one-electron systems across the periodic
 * table; it is not the neutral, many-electron atom's real spectrum.
 * A transition is emissive when n_i > n_f (electron falls to a lower
 * level) and absorptive when n_i < n_f (electron is excited upward).
 * -----------------------------------------------------------------------
 */
import { CONST } from "./constants";

export function energyLevel(n, Z = 1) {
  return -CONST.RyEV * Z * Z / (n * n);
}

export function seriesName(nf) {
  return (
    { 1: "Lyman (UV)", 2: "Balmer (visible)", 3: "Paschen (IR)", 4: "Brackett (IR)", 5: "Pfund (IR)" }[nf] ||
    `n = ${nf} series`
  );
}

export function computeTransition(ni, nf, Z = 1) {
  const dE = Math.abs(energyLevel(ni, Z) - energyLevel(nf, Z)); // eV
  const emission = ni > nf;
  const wavelengthNm = CONST.hc_eVnm / dE;
  const frequencyHz = CONST.c / (wavelengthNm * 1e-9);
  return {
    dE,
    wavelengthNm,
    frequencyHz,
    emission,
    series: seriesName(Math.min(ni, nf)),
    visible: wavelengthNm >= 380 && wavelengthNm <= 780,
  };
}
