/**
 * physics/atomicData.js
 * -----------------------------------------------------------------------
 * Element reference data (Z = 1..20, hydrogen through calcium) and the
 * simplified Bohr electron-shell filling rule: capacities 2, 8, 8, 18,
 * 18, 32, filled in order. This is the standard pre-university teaching
 * model and is exact for Z ≤ 20 — which is why the periodic selector is
 * capped there. Real elements beyond calcium fill subshells (3d before
 * 4s completion in places) in an order this simplified model does not
 * capture, so extending the table naively would silently teach the
 * wrong shell structure.
 * -----------------------------------------------------------------------
 */
export const CATEGORY_COLOR = {
  "nonmetal": "#4fd8e0",
  "noble gas": "#c084fc",
  "alkali metal": "#ef5b6f",
  "alkaline earth metal": "#f2a94e",
  "metalloid": "#6bd68a",
  "halogen": "#5b8def",
};

const RAW = [
  ["H", "Hydrogen", 1, 1, "nonmetal"], ["He", "Helium", 2, 4, "noble gas"],
  ["Li", "Lithium", 3, 7, "alkali metal"], ["Be", "Beryllium", 4, 9, "alkaline earth metal"],
  ["B", "Boron", 5, 11, "metalloid"], ["C", "Carbon", 6, 12, "nonmetal"],
  ["N", "Nitrogen", 7, 14, "nonmetal"], ["O", "Oxygen", 8, 16, "nonmetal"],
  ["F", "Fluorine", 9, 19, "halogen"], ["Ne", "Neon", 10, 20, "noble gas"],
  ["Na", "Sodium", 11, 23, "alkali metal"], ["Mg", "Magnesium", 12, 24, "alkaline earth metal"],
  ["Al", "Aluminium", 13, 27, "metalloid"], ["Si", "Silicon", 14, 28, "metalloid"],
  ["P", "Phosphorus", 15, 31, "nonmetal"], ["S", "Sulfur", 16, 32, "nonmetal"],
  ["Cl", "Chlorine", 17, 35, "halogen"], ["Ar", "Argon", 18, 40, "noble gas"],
  ["K", "Potassium", 19, 39, "alkali metal"], ["Ca", "Calcium", 20, 40, "alkaline earth metal"],
];

export const ELEMENTS = RAW.map(([symbol, name, Z, A, category]) => ({
  symbol, name, Z, A, neutrons: A - Z, category,
}));

export function getElementByZ(Z) {
  return ELEMENTS.find((e) => e.Z === Z) || ELEMENTS[0];
}

/** Fill electron shells using the simplified Bohr capacity rule (2,8,8,18,18,32). */
export function getShellConfig(Z) {
  const capacities = [2, 8, 8, 18, 18, 32];
  let remaining = Z;
  const shells = [];
  for (const cap of capacities) {
    if (remaining <= 0) break;
    const count = Math.min(cap, remaining);
    shells.push(count);
    remaining -= count;
  }
  return shells;
}
