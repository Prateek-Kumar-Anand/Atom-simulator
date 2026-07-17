/**
 * physics/decay.js
 * -----------------------------------------------------------------------
 * Exponential decay law:
 *   N(t)  = N0 * e^(-λt)              (expected population remaining)
 *   λ     = ln(2) / T½                (decay constant from half-life)
 *   τ     = 1 / λ                     (mean lifetime)
 *   A(t)  = λ * N(t)                  (activity: decays per unit time)
 *
 * The Monte Carlo simulator advances in discrete ticks. For a tick of
 * length dt, the correct per-atom decay probability is:
 *   p = 1 - e^(-λ dt)
 * (the discrete-time form of the same exponential law), applied
 * independently to every surviving atom — which is what makes the
 * simulated curve noisy around the smooth theoretical curve, exactly as
 * in a real detector count.
 *
 * ISOTOPES now covers all 118 elements with one representative
 * radioisotope each (real half-life data, ultimately sourced from NUBASE /
 * CIAAW-style nuclear data compilations). For elements whose only natural
 * isotopes are stable (most of the periodic table), the isotope shown is a
 * well-known artificial or trace radioisotope commonly used in medicine,
 * dating, or physics teaching (e.g. Carbon-14, Cobalt-60) rather than "the"
 * isotope of that element — this mirrors how the lab already worked before
 * this table was widened to all 118 elements. For the superheavy elements
 * (Z ≥ 104), reported half-lives carry substantial experimental
 * uncertainty since typically only a handful of atoms have ever been made.
 *
 * Real half-lives span milliseconds to 10^19 years, so the interactive
 * simulation uses a compressed "simulated half-life" (a handful to a few
 * tens of seconds), computed automatically on a log scale from the real
 * value, purely so the demonstration is watchable in real time; the
 * real-world half-life is shown alongside it for reference.
 * -----------------------------------------------------------------------
 */

const YEAR = 365.25 * 86400;

/** [Z, symbol, isotope label, real half-life in seconds] */
const RAW = [
  [1, "H", "Tritium (H-3)", 12.32 * YEAR],
  [2, "He", "Helium-6", 0.807],
  [3, "Li", "Lithium-8", 0.840],
  [4, "Be", "Beryllium-7", 53.22 * 86400],
  [5, "B", "Boron-8", 0.770],
  [6, "C", "Carbon-14", 5730 * YEAR],
  [7, "N", "Nitrogen-13", 9.965 * 60],
  [8, "O", "Oxygen-15", 122.24],
  [9, "F", "Fluorine-18", 109.77 * 60],
  [10, "Ne", "Neon-19", 17.22],
  [11, "Na", "Sodium-22", 2.6019 * YEAR],
  [12, "Mg", "Magnesium-27", 9.458 * 60],
  [13, "Al", "Aluminium-26", 717000 * YEAR],
  [14, "Si", "Silicon-31", 157.3 * 60],
  [15, "P", "Phosphorus-32", 14.268 * 86400],
  [16, "S", "Sulfur-35", 87.37 * 86400],
  [17, "Cl", "Chlorine-36", 301000 * YEAR],
  [18, "Ar", "Argon-39", 269 * YEAR],
  [19, "K", "Potassium-40", 1.248e9 * YEAR],
  [20, "Ca", "Calcium-45", 162.6 * 86400],
  [21, "Sc", "Scandium-46", 83.79 * 86400],
  [22, "Ti", "Titanium-44", 60 * YEAR],
  [23, "V", "Vanadium-49", 330 * 86400],
  [24, "Cr", "Chromium-51", 27.7 * 86400],
  [25, "Mn", "Manganese-54", 312.3 * 86400],
  [26, "Fe", "Iron-55", 2.744 * YEAR],
  [27, "Co", "Cobalt-60", 5.2714 * YEAR],
  [28, "Ni", "Nickel-63", 100.1 * YEAR],
  [29, "Cu", "Copper-64", 12.70 * 3600],
  [30, "Zn", "Zinc-65", 243.9 * 86400],
  [31, "Ga", "Gallium-67", 3.2617 * 86400],
  [32, "Ge", "Germanium-68", 270.8 * 86400],
  [33, "As", "Arsenic-73", 80.3 * 86400],
  [34, "Se", "Selenium-79", 327000 * YEAR],
  [35, "Br", "Bromine-82", 35.3 * 3600],
  [36, "Kr", "Krypton-85", 10.76 * YEAR],
  [37, "Rb", "Rubidium-87", 4.97e10 * YEAR],
  [38, "Sr", "Strontium-90", 28.79 * YEAR],
  [39, "Y", "Yttrium-90", 64.05 * 3600],
  [40, "Zr", "Zirconium-93", 1.61e6 * YEAR],
  [41, "Nb", "Niobium-94", 20300 * YEAR],
  [42, "Mo", "Molybdenum-99", 65.94 * 3600],
  [43, "Tc", "Technetium-99", 211000 * YEAR],
  [44, "Ru", "Ruthenium-106", 373.6 * 86400],
  [45, "Rh", "Rhodium-102", 207 * 86400],
  [46, "Pd", "Palladium-107", 6.5e6 * YEAR],
  [47, "Ag", "Silver-108m", 418 * YEAR],
  [48, "Cd", "Cadmium-113m", 14.1 * YEAR],
  [49, "In", "Indium-115", 4.41e14 * YEAR],
  [50, "Sn", "Tin-126", 2.3e5 * YEAR],
  [51, "Sb", "Antimony-125", 2.7582 * YEAR],
  [52, "Te", "Tellurium-127m", 109 * 86400],
  [53, "I", "Iodine-131", 8.0207 * 86400],
  [54, "Xe", "Xenon-127", 36.345 * 86400],
  [55, "Cs", "Caesium-137", 30.17 * YEAR],
  [56, "Ba", "Barium-133", 10.51 * YEAR],
  [57, "La", "Lanthanum-137", 6e4 * YEAR],
  [58, "Ce", "Cerium-144", 284.9 * 86400],
  [59, "Pr", "Praseodymium-143", 13.57 * 86400],
  [60, "Nd", "Neodymium-147", 10.98 * 86400],
  [61, "Pm", "Promethium-145", 17.7 * YEAR],
  [62, "Sm", "Samarium-151", 90 * YEAR],
  [63, "Eu", "Europium-152", 13.517 * YEAR],
  [64, "Gd", "Gadolinium-153", 240.4 * 86400],
  [65, "Tb", "Terbium-160", 72.3 * 86400],
  [66, "Dy", "Dysprosium-166", 81.6 * 3600],
  [67, "Ho", "Holmium-166", 26.83 * 3600],
  [68, "Er", "Erbium-169", 9.4 * 86400],
  [69, "Tm", "Thulium-171", 1.92 * YEAR],
  [70, "Yb", "Ytterbium-169", 32.02 * 86400],
  [71, "Lu", "Lutetium-176", 3.76e10 * YEAR],
  [72, "Hf", "Hafnium-182", 8.9e6 * YEAR],
  [73, "Ta", "Tantalum-182", 114.4 * 86400],
  [74, "W", "Tungsten-181", 121.2 * 86400],
  [75, "Re", "Rhenium-187", 4.12e10 * YEAR],
  [76, "Os", "Osmium-194", 6 * YEAR],
  [77, "Ir", "Iridium-192", 73.83 * 86400],
  [78, "Pt", "Platinum-193", 50 * YEAR],
  [79, "Au", "Gold-198", 2.6952 * 86400],
  [80, "Hg", "Mercury-203", 46.6 * 86400],
  [81, "Tl", "Thallium-204", 3.78 * YEAR],
  [82, "Pb", "Lead-210", 22.3 * YEAR],
  [83, "Bi", "Bismuth-209", 1.9e19 * YEAR],
  [84, "Po", "Polonium-210", 138.4 * 86400],
  [85, "At", "Astatine-210", 8.1 * 3600],
  [86, "Rn", "Radon-222", 3.8235 * 86400],
  [87, "Fr", "Francium-223", 22.00 * 60],
  [88, "Ra", "Radium-226", 1600 * YEAR],
  [89, "Ac", "Actinium-227", 21.772 * YEAR],
  [90, "Th", "Thorium-232", 1.405e10 * YEAR],
  [91, "Pa", "Protactinium-231", 32760 * YEAR],
  [92, "U", "Uranium-238", 4.468e9 * YEAR],
  [93, "Np", "Neptunium-237", 2.144e6 * YEAR],
  [94, "Pu", "Plutonium-244", 8.0e7 * YEAR],
  [95, "Am", "Americium-243", 7370 * YEAR],
  [96, "Cm", "Curium-247", 1.56e7 * YEAR],
  [97, "Bk", "Berkelium-247", 1380 * YEAR],
  [98, "Cf", "Californium-251", 898 * YEAR],
  [99, "Es", "Einsteinium-252", 471.7 * 86400],
  [100, "Fm", "Fermium-257", 100.5 * 86400],
  [101, "Md", "Mendelevium-258", 51.5 * 86400],
  [102, "No", "Nobelium-259", 58 * 60],
  [103, "Lr", "Lawrencium-266", 11 * 3600],
  [104, "Rf", "Rutherfordium-267", 13.06 * 3600],
  [105, "Db", "Dubnium-268", 5.56 * 3600],
  [106, "Sg", "Seaborgium-269", 1.94 * 3600],
  [107, "Bh", "Bohrium-270", 1.5 * 3600],
  [108, "Hs", "Hassium-269", 1.11 * 3600],
  [109, "Mt", "Meitnerium-278", 30 * 60],
  [110, "Ds", "Darmstadtium-281", 4 * 60],
  [111, "Rg", "Roentgenium-282", 10 * 60],
  [112, "Cn", "Copernicium-285", 40 * 60],
  [113, "Nh", "Nihonium-286", 20 * 60],
  [114, "Fl", "Flerovium-289", 1.32 * 60],
  [115, "Mc", "Moscovium-290", 1 * 60],
  [116, "Lv", "Livermorium-293", 0.120],
  [117, "Ts", "Tennessine-294", 0.050],
  [118, "Og", "Oganesson-294", 0.005],
];

/** Map a real half-life (seconds) to a watchable demo half-life (3–40 s) on a log scale. */
function compressedSimHalfLife(realSeconds) {
  const logv = Math.log10(Math.max(realSeconds, 1e-3));
  const t = 3 + ((logv + 3) / 30) * 37; // logv spans roughly [-3, 27] across the whole table
  return Math.round(Math.min(40, Math.max(3, t)) * 10) / 10;
}

/** Format a half-life in seconds as a compact, appropriately-scaled string. */
export function formatHalfLife(seconds) {
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  if (seconds < 90) return `${seconds.toFixed(seconds < 10 ? 2 : 1)} s`;
  if (seconds < 5400) return `${(seconds / 60).toFixed(1)} min`;
  if (seconds < 86400 * 2) return `${(seconds / 3600).toFixed(1)} hours`;
  if (seconds < YEAR) return `${(seconds / 86400).toFixed(1)} days`;
  const years = seconds / YEAR;
  if (years >= 1e6) return `${years.toExponential(2)} years`;
  return `${years.toLocaleString(undefined, { maximumFractionDigits: years < 100 ? 1 : 0 })} years`;
}

export const ISOTOPES = RAW.map(([Z, symbol, name, realSeconds]) => ({
  Z,
  symbol,
  name,
  realSeconds,
  real: formatHalfLife(realSeconds),
  simHalfLife: compressedSimHalfLife(realSeconds),
}));

export function decayConstant(halfLife) {
  return Math.LN2 / halfLife;
}

export function expectedRemaining(N0, halfLife, t) {
  return N0 * Math.exp(-decayConstant(halfLife) * t);
}

/** Probability that a single surviving atom decays within a tick of length dt. */
export function tickDecayProbability(halfLife, dt) {
  return 1 - Math.exp(-decayConstant(halfLife) * dt);
}

/** Advance a Monte Carlo population array (mutated in place) by one tick. Returns the new alive count. */
export function stepDecay(aliveArray, halfLife, dt) {
  const p = tickDecayProbability(halfLife, dt);
  let alive = 0;
  for (let i = 0; i < aliveArray.length; i++) {
    if (aliveArray[i] && Math.random() < p) aliveArray[i] = false;
    if (aliveArray[i]) alive++;
  }
  return alive;
}
