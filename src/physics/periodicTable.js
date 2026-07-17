/**
 * physics/periodicTable.js
 * -----------------------------------------------------------------------
 * The full 118-element roster (symbol, name, atomic number, block), used
 * by any module that lets the user sweep across the whole periodic table
 * rather than the simplified Z ≤ 20 teaching set in atomicData.js (which
 * intentionally stays capped — see the note there on why extending *that*
 * table isn't correct for electron-shell filling beyond calcium).
 *
 * Energy-level and decay physics don't have that same restriction: the
 * hydrogen-like-ion formula En = -13.6·Z²/n² and the exponential decay law
 * N(t) = N0·e^(−λt) are both valid for any Z, so those modules use this
 * full table instead.
 * -----------------------------------------------------------------------
 */
export const BLOCK_COLOR = {
  s: "#ef5b6f",
  p: "#4fd8e0",
  d: "#5b8def",
  f: "#c084fc",
};

const RAW = [
  ["H", "Hydrogen", "s"], ["He", "Helium", "p"],
  ["Li", "Lithium", "s"], ["Be", "Beryllium", "s"], ["B", "Boron", "p"], ["C", "Carbon", "p"],
  ["N", "Nitrogen", "p"], ["O", "Oxygen", "p"], ["F", "Fluorine", "p"], ["Ne", "Neon", "p"],
  ["Na", "Sodium", "s"], ["Mg", "Magnesium", "s"], ["Al", "Aluminium", "p"], ["Si", "Silicon", "p"],
  ["P", "Phosphorus", "p"], ["S", "Sulfur", "p"], ["Cl", "Chlorine", "p"], ["Ar", "Argon", "p"],
  ["K", "Potassium", "s"], ["Ca", "Calcium", "s"], ["Sc", "Scandium", "d"], ["Ti", "Titanium", "d"],
  ["V", "Vanadium", "d"], ["Cr", "Chromium", "d"], ["Mn", "Manganese", "d"], ["Fe", "Iron", "d"],
  ["Co", "Cobalt", "d"], ["Ni", "Nickel", "d"], ["Cu", "Copper", "d"], ["Zn", "Zinc", "d"],
  ["Ga", "Gallium", "p"], ["Ge", "Germanium", "p"], ["As", "Arsenic", "p"], ["Se", "Selenium", "p"],
  ["Br", "Bromine", "p"], ["Kr", "Krypton", "p"], ["Rb", "Rubidium", "s"], ["Sr", "Strontium", "s"],
  ["Y", "Yttrium", "d"], ["Zr", "Zirconium", "d"], ["Nb", "Niobium", "d"], ["Mo", "Molybdenum", "d"],
  ["Tc", "Technetium", "d"], ["Ru", "Ruthenium", "d"], ["Rh", "Rhodium", "d"], ["Pd", "Palladium", "d"],
  ["Ag", "Silver", "d"], ["Cd", "Cadmium", "d"], ["In", "Indium", "p"], ["Sn", "Tin", "p"],
  ["Sb", "Antimony", "p"], ["Te", "Tellurium", "p"], ["I", "Iodine", "p"], ["Xe", "Xenon", "p"],
  ["Cs", "Caesium", "s"], ["Ba", "Barium", "s"], ["La", "Lanthanum", "f"], ["Ce", "Cerium", "f"],
  ["Pr", "Praseodymium", "f"], ["Nd", "Neodymium", "f"], ["Pm", "Promethium", "f"], ["Sm", "Samarium", "f"],
  ["Eu", "Europium", "f"], ["Gd", "Gadolinium", "f"], ["Tb", "Terbium", "f"], ["Dy", "Dysprosium", "f"],
  ["Ho", "Holmium", "f"], ["Er", "Erbium", "f"], ["Tm", "Thulium", "f"], ["Yb", "Ytterbium", "f"],
  ["Lu", "Lutetium", "f"], ["Hf", "Hafnium", "d"], ["Ta", "Tantalum", "d"], ["W", "Tungsten", "d"],
  ["Re", "Rhenium", "d"], ["Os", "Osmium", "d"], ["Ir", "Iridium", "d"], ["Pt", "Platinum", "d"],
  ["Au", "Gold", "d"], ["Hg", "Mercury", "d"], ["Tl", "Thallium", "p"], ["Pb", "Lead", "p"],
  ["Bi", "Bismuth", "p"], ["Po", "Polonium", "p"], ["At", "Astatine", "p"], ["Rn", "Radon", "p"],
  ["Fr", "Francium", "s"], ["Ra", "Radium", "s"], ["Ac", "Actinium", "f"], ["Th", "Thorium", "f"],
  ["Pa", "Protactinium", "f"], ["U", "Uranium", "f"], ["Np", "Neptunium", "f"], ["Pu", "Plutonium", "f"],
  ["Am", "Americium", "f"], ["Cm", "Curium", "f"], ["Bk", "Berkelium", "f"], ["Cf", "Californium", "f"],
  ["Es", "Einsteinium", "f"], ["Fm", "Fermium", "f"], ["Md", "Mendelevium", "f"], ["No", "Nobelium", "f"],
  ["Lr", "Lawrencium", "d"], ["Rf", "Rutherfordium", "d"], ["Db", "Dubnium", "d"], ["Sg", "Seaborgium", "d"],
  ["Bh", "Bohrium", "d"], ["Hs", "Hassium", "d"], ["Mt", "Meitnerium", "d"], ["Ds", "Darmstadtium", "d"],
  ["Rg", "Roentgenium", "d"], ["Cn", "Copernicium", "d"], ["Nh", "Nihonium", "p"], ["Fl", "Flerovium", "p"],
  ["Mc", "Moscovium", "p"], ["Lv", "Livermorium", "p"], ["Ts", "Tennessine", "p"], ["Og", "Oganesson", "p"],
];

export const FULL_ELEMENTS = RAW.map(([symbol, name, block], i) => ({
  Z: i + 1, symbol, name, block,
}));

export function getFullElementByZ(Z) {
  return FULL_ELEMENTS.find((e) => e.Z === Z) || FULL_ELEMENTS[0];
}
