/**
 * physics/constants.js
 * -----------------------------------------------------------------------
 * Central store of physical constants used throughout the laboratory.
 * SI values are given alongside eV-scaled variants, since atomic-scale
 * energies are far more readable in electronvolts than in joules.
 * Source: CODATA 2018 recommended values.
 * -----------------------------------------------------------------------
 */
export const CONST = {
  h: 6.62607015e-34,      // Planck constant, J·s
  hEV: 4.135667696e-15,   // Planck constant, eV·s
  c: 2.99792458e8,        // speed of light in vacuum, m/s
  e: 1.602176634e-19,     // elementary charge, C
  RyEV: 13.605693,        // Rydberg energy (hydrogen ground-state binding energy), eV
  me: 9.1093837015e-31,   // electron rest mass, kg
  NA: 6.02214076e23,      // Avogadro constant, 1/mol
  kB: 1.380649e-23,       // Boltzmann constant, J/K
  hc_eVnm: 1239.8419843,  // hc expressed directly in eV·nm, saves a conversion step
};

/** Format a number for display, switching to scientific notation for very large/small values. */
export function fmt(n, digits = 3) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (Math.abs(n) !== 0 && (Math.abs(n) < 1e-3 || Math.abs(n) >= 1e5)) return n.toExponential(digits);
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

/** Trigger a client-side text file download (used by the results-export feature). */
export function downloadText(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Approximate a visible-light wavelength (380–780 nm) as an RGB color.
 * Classic piecewise approximation (after Dan Bruton), widely used in
 * educational spectroscopy tools. Wavelengths outside the visible range
 * return a dim neutral gray to represent UV/IR.
 */
export function wavelengthToColor(wl) {
  let r = 0, g = 0, b = 0;
  if (wl >= 380 && wl < 440) { r = -(wl - 440) / 60; g = 0; b = 1; }
  else if (wl < 490) { r = 0; g = (wl - 440) / 50; b = 1; }
  else if (wl < 510) { r = 0; g = 1; b = -(wl - 510) / 20; }
  else if (wl < 580) { r = (wl - 510) / 70; g = 1; b = 0; }
  else if (wl < 645) { r = 1; g = -(wl - 645) / 65; b = 0; }
  else if (wl <= 780) { r = 1; g = 0; b = 0; }
  else return "rgb(70,70,95)";

  let factor = 1;
  if (wl < 420) factor = 0.3 + (0.7 * (wl - 380)) / 40;
  else if (wl > 700) factor = 0.3 + (0.7 * (780 - wl)) / 80;

  const gamma = 0.8;
  const R = Math.round(255 * Math.pow(Math.max(r, 0) * factor, gamma));
  const G = Math.round(255 * Math.pow(Math.max(g, 0) * factor, gamma));
  const B = Math.round(255 * Math.pow(Math.max(b, 0) * factor, gamma));
  return `rgb(${R},${G},${B})`;
}
