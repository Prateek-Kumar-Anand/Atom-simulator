/**
 * physics/periodicTable.js
 * -----------------------------------------------------------------------
 * The full 118-element roster: symbol, name, atomic number, block, an
 * approximate mass number (rounded standard atomic weight, or the
 * longest-lived isotope's mass number for elements with no stable
 * isotope), and a real electron-shell configuration for every element.
 *
 * The shell configuration is built programmatically from the Aufbau /
 * Madelung (n+l, then n) subshell-filling rule, then summed by principal
 * quantum number n to give the familiar K-L-M-N-O-P-Q shell counts. The
 * ten well-established cases where an electron promotes from an outer ns
 * subshell into the (n-1)d subshell for extra stability (chromium,
 * copper, and their heavier group-mates) are corrected explicitly, since
 * that promotion moves an electron between principal shells. A handful of
 * rarer f-block boundary cases (lanthanum, cerium, gadolinium, actinium,
 * and some actinides/superheavy elements) are left on the idealized
 * Madelung path, since published configurations for those disagree or
 * are theoretical. This is still far more accurate across the whole
 * table than a naive extension of the strict 2,8,8,18,18,32-in-order
 * rule, which becomes wrong as early as Z=19.
 *
 * Energy-level and decay physics don't have any of these subtleties: the
 * hydrogen-like-ion formula En = -13.6·Z²/n² and the exponential decay law
 * N(t) = N0·e^(−λt) are both valid for any Z, so those modules use this
 * full table too.
 * -----------------------------------------------------------------------
 */
export const BLOCK_COLOR = {
  s: "#ef5b6f",
  p: "#4fd8e0",
  d: "#5b8def",
  f: "#c084fc",
};

const RAW = [
  ["H", "Hydrogen", "s", 1], ["He", "Helium", "p", 4],
  ["Li", "Lithium", "s", 7], ["Be", "Beryllium", "s", 9], ["B", "Boron", "p", 11], ["C", "Carbon", "p", 12],
  ["N", "Nitrogen", "p", 14], ["O", "Oxygen", "p", 16], ["F", "Fluorine", "p", 19], ["Ne", "Neon", "p", 20],
  ["Na", "Sodium", "s", 23], ["Mg", "Magnesium", "s", 24], ["Al", "Aluminium", "p", 27], ["Si", "Silicon", "p", 28],
  ["P", "Phosphorus", "p", 31], ["S", "Sulfur", "p", 32], ["Cl", "Chlorine", "p", 35], ["Ar", "Argon", "p", 40],
  ["K", "Potassium", "s", 39], ["Ca", "Calcium", "s", 40], ["Sc", "Scandium", "d", 45], ["Ti", "Titanium", "d", 48],
  ["V", "Vanadium", "d", 51], ["Cr", "Chromium", "d", 52], ["Mn", "Manganese", "d", 55], ["Fe", "Iron", "d", 56],
  ["Co", "Cobalt", "d", 59], ["Ni", "Nickel", "d", 59], ["Cu", "Copper", "d", 64], ["Zn", "Zinc", "d", 65],
  ["Ga", "Gallium", "p", 70], ["Ge", "Germanium", "p", 73], ["As", "Arsenic", "p", 75], ["Se", "Selenium", "p", 79],
  ["Br", "Bromine", "p", 80], ["Kr", "Krypton", "p", 84], ["Rb", "Rubidium", "s", 85], ["Sr", "Strontium", "s", 88],
  ["Y", "Yttrium", "d", 89], ["Zr", "Zirconium", "d", 91], ["Nb", "Niobium", "d", 93], ["Mo", "Molybdenum", "d", 96],
  ["Tc", "Technetium", "d", 98], ["Ru", "Ruthenium", "d", 101], ["Rh", "Rhodium", "d", 103], ["Pd", "Palladium", "d", 106],
  ["Ag", "Silver", "d", 108], ["Cd", "Cadmium", "d", 112], ["In", "Indium", "p", 115], ["Sn", "Tin", "p", 119],
  ["Sb", "Antimony", "p", 122], ["Te", "Tellurium", "p", 128], ["I", "Iodine", "p", 127], ["Xe", "Xenon", "p", 131],
  ["Cs", "Caesium", "s", 133], ["Ba", "Barium", "s", 137], ["La", "Lanthanum", "f", 139], ["Ce", "Cerium", "f", 140],
  ["Pr", "Praseodymium", "f", 141], ["Nd", "Neodymium", "f", 144], ["Pm", "Promethium", "f", 145], ["Sm", "Samarium", "f", 150],
  ["Eu", "Europium", "f", 152], ["Gd", "Gadolinium", "f", 157], ["Tb", "Terbium", "f", 159], ["Dy", "Dysprosium", "f", 163],
  ["Ho", "Holmium", "f", 165], ["Er", "Erbium", "f", 167], ["Tm", "Thulium", "f", 169], ["Yb", "Ytterbium", "f", 173],
  ["Lu", "Lutetium", "f", 175], ["Hf", "Hafnium", "d", 179], ["Ta", "Tantalum", "d", 181], ["W", "Tungsten", "d", 184],
  ["Re", "Rhenium", "d", 186], ["Os", "Osmium", "d", 190], ["Ir", "Iridium", "d", 192], ["Pt", "Platinum", "d", 195],
  ["Au", "Gold", "d", 197], ["Hg", "Mercury", "d", 201], ["Tl", "Thallium", "p", 204], ["Pb", "Lead", "p", 207],
  ["Bi", "Bismuth", "p", 209], ["Po", "Polonium", "p", 209], ["At", "Astatine", "p", 210], ["Rn", "Radon", "p", 222],
  ["Fr", "Francium", "s", 223], ["Ra", "Radium", "s", 226], ["Ac", "Actinium", "f", 227], ["Th", "Thorium", "f", 232],
  ["Pa", "Protactinium", "f", 231], ["U", "Uranium", "f", 238], ["Np", "Neptunium", "f", 237], ["Pu", "Plutonium", "f", 244],
  ["Am", "Americium", "f", 243], ["Cm", "Curium", "f", 247], ["Bk", "Berkelium", "f", 247], ["Cf", "Californium", "f", 251],
  ["Es", "Einsteinium", "f", 252], ["Fm", "Fermium", "f", 257], ["Md", "Mendelevium", "f", 258], ["No", "Nobelium", "f", 259],
  ["Lr", "Lawrencium", "d", 266], ["Rf", "Rutherfordium", "d", 267], ["Db", "Dubnium", "d", 268], ["Sg", "Seaborgium", "d", 269],
  ["Bh", "Bohrium", "d", 270], ["Hs", "Hassium", "d", 269], ["Mt", "Meitnerium", "d", 278], ["Ds", "Darmstadtium", "d", 281],
  ["Rg", "Roentgenium", "d", 282], ["Cn", "Copernicium", "d", 285], ["Nh", "Nihonium", "p", 286], ["Fl", "Flerovium", "p", 289],
  ["Mc", "Moscovium", "p", 290], ["Lv", "Livermorium", "p", 293], ["Ts", "Tennessine", "p", 294], ["Og", "Oganesson", "p", 294],
];

export const FULL_ELEMENTS = RAW.map(([symbol, name, block, A], i) => ({
  Z: i + 1, symbol, name, block, A, neutrons: A - (i + 1),
}));

export function getFullElementByZ(Z) {
  return FULL_ELEMENTS.find((e) => e.Z === Z) || FULL_ELEMENTS[0];
}

// Subshells in Aufbau (Madelung n+l, then n) fill order, each as [n, capacity].
const AUFBAU_ORDER = [
  [1, 2], [2, 2], [2, 6], [3, 2], [3, 6], [4, 2], [3, 10], [4, 6], [5, 2], [4, 10],
  [5, 6], [6, 2], [4, 14], [5, 10], [6, 6], [7, 2], [5, 14], [6, 10], [7, 6],
];

// The ~10 well-established cases where a ground-state atom promotes one (or, for
// palladium, two) electrons from the outer ns subshell into the (n-1)d subshell for
// extra stability — this does shift electrons between principal shells, unlike most
// Aufbau exceptions. Rarer f-block boundary cases (La, Ce, Gd, Ac, Th, Pa, U, Np, Cm,
// and the superheavy elements) are left on the idealized Madelung path, since sourced
// configurations for those disagree or are theoretical/relativistic-model-dependent.
const D_BLOCK_EXCEPTIONS = {
  24: { from: 4, to: 3, count: 1 }, // Cr: 3d5 4s1
  29: { from: 4, to: 3, count: 1 }, // Cu: 3d10 4s1
  41: { from: 5, to: 4, count: 1 }, // Nb: 4d4 5s1
  42: { from: 5, to: 4, count: 1 }, // Mo: 4d5 5s1
  44: { from: 5, to: 4, count: 1 }, // Ru: 4d7 5s1
  45: { from: 5, to: 4, count: 1 }, // Rh: 4d8 5s1
  46: { from: 5, to: 4, count: 2 }, // Pd: 4d10 5s0
  47: { from: 5, to: 4, count: 1 }, // Ag: 4d10 5s1
  78: { from: 6, to: 5, count: 1 }, // Pt: 5d9 6s1
  79: { from: 6, to: 5, count: 1 }, // Au: 5d10 6s1
};

/**
 * Real (Aufbau + known d-block exceptions) electron-shell configuration for any Z
 * from 1 to 118, returned as electron counts per principal shell [K, L, M, N, O, P, Q]
 * with trailing empty shells trimmed. See the module doc comment above for the small
 * set of rarer f-block cases this still simplifies over.
 */
export function getFullShellConfig(Z) {
  const shells = [0, 0, 0, 0, 0, 0, 0];
  let remaining = Z;
  for (const [n, cap] of AUFBAU_ORDER) {
    if (remaining <= 0) break;
    const take = Math.min(cap, remaining);
    shells[n - 1] += take;
    remaining -= take;
  }
  const ex = D_BLOCK_EXCEPTIONS[Z];
  if (ex) { shells[ex.from - 1] -= ex.count; shells[ex.to - 1] += ex.count; }
  while (shells.length > 1 && shells[shells.length - 1] === 0) shells.pop();
  return shells;
}
