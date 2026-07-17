/**
 * physics/thermodynamics.js
 * -----------------------------------------------------------------------
 * Ideal-gas thermodynamic processes, built on PV = nRT.
 *
 *   Isothermal (T constant):  P1V1 = P2V2,   W = nRT·ln(V2/V1),  ΔU = 0
 *   Isobaric   (P constant):  V/T  = const,  W = PΔV,            ΔU = nCvΔT
 *   Isochoric  (V constant):  P/T  = const,  W = 0,              ΔU = nCvΔT
 *   Adiabatic  (Q = 0):       PV^γ = const,  W = -ΔU,            ΔU = nCvΔT
 *
 * First law: ΔU = Q − W (W = work done BY the gas). Molar heat capacities
 * follow from γ = Cp/Cv and Cp − Cv = R:  Cv = R/(γ−1),  Cp = γR/(γ−1).
 * -----------------------------------------------------------------------
 */
export const R = 8.314; // J / (mol·K)

export const GASES = [
  { key: "monatomic", label: "Monatomic (He, Ne, Ar)", gamma: 5 / 3, molarMass: 0.020 }, // ~Ne, kg/mol
  { key: "diatomic", label: "Diatomic (N₂, O₂ — air)", gamma: 7 / 5, molarMass: 0.029 }, // ~air
  { key: "polyatomic", label: "Polyatomic (CO₂, CH₄)", gamma: 4 / 3, molarMass: 0.040 }, // ~CO2
];

export const PROCESSES = [
  { key: "isothermal", label: "Isothermal", detail: "T constant" },
  { key: "isobaric", label: "Isobaric", detail: "P constant" },
  { key: "isochoric", label: "Isochoric", detail: "V constant" },
  { key: "adiabatic", label: "Adiabatic", detail: "Q = 0" },
];

/** Experiment presets: sensible starting states so a student can jump straight to a familiar scenario. */
export const PRESETS = [
  { key: "stp", label: "STP", n: 1, T1: 273.15, V1L: 22.4 },
  { key: "room", label: "Room air", n: 1, T1: 293, V1L: 24 },
  { key: "boiling", label: "Boiling point", n: 1, T1: 373.15, V1L: 30.6 },
  { key: "cryo", label: "Liquid-N₂ cold", n: 1, T1: 77, V1L: 6.3 },
  { key: "compressed", label: "Compressed", n: 2, T1: 300, V1L: 2 },
];

/**
 * Maxwell–Boltzmann speed distribution for an ideal gas:
 *   f(v) = 4π n (m / 2πkT)^(3/2) v² exp(−mv² / 2kT)
 * where m is the mass of a single molecule (molarMass / Avogadro's number).
 * Returned f(v) is normalized so ∫f(v)dv = 1 (a probability density over speed).
 */
export function maxwellBoltzmannPDF(v, molarMass, T) {
  const kB = 1.380649e-23;
  const NA = 6.02214076e23;
  const m = molarMass / NA;
  if (T <= 0 || v < 0) return 0;
  const a = m / (2 * Math.PI * kB * T);
  return 4 * Math.PI * v * v * Math.pow(a, 1.5) * Math.exp((-m * v * v) / (2 * kB * T));
}

/** Characteristic speeds (m/s) for the distribution: most probable, mean, and RMS. */
export function characteristicSpeeds(molarMass, T) {
  const R_ = 8.314;
  const vp = Math.sqrt((2 * R_ * T) / molarMass); // most probable
  const vMean = Math.sqrt((8 * R_ * T) / (Math.PI * molarMass));
  const vRms = Math.sqrt((3 * R_ * T) / molarMass);
  return { vp, vMean, vRms };
}

/** Sample the Maxwell–Boltzmann curve out to a speed that comfortably contains the RMS tail. */
export function sampleMaxwellBoltzmann(molarMass, T, steps = 80) {
  const { vRms } = characteristicSpeeds(molarMass, T);
  const vMax = vRms * 2.6;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const v = (i / steps) * vMax;
    pts.push({ v, f: maxwellBoltzmannPDF(v, molarMass, T) });
  }
  return pts;
}

export function molarHeatCapacities(gamma) {
  const Cv = R / (gamma - 1);
  const Cp = gamma * Cv;
  return { Cv, Cp };
}

/**
 * state1 = { P, V, T } (Pa, m^3, K), self-consistent with PV = nRT for n moles.
 * control: for isothermal / adiabatic / isobaric, the volume ratio V2/V1;
 *          for isochoric, the temperature ratio T2/T1.
 * Returns both endpoint states and the W / ΔU / Q bookkeeping.
 */
export function computeProcess(processKey, gammaOrGasKey, n, state1, control) {
  const gamma = typeof gammaOrGasKey === "number" ? gammaOrGasKey : (GASES.find((g) => g.key === gammaOrGasKey) || GASES[1]).gamma;
  const { Cv, Cp } = molarHeatCapacities(gamma);
  const { P: P1, V: V1, T: T1 } = state1;

  let P2, V2, T2;
  if (processKey === "isothermal") {
    V2 = V1 * control;
    T2 = T1;
    P2 = (P1 * V1) / V2;
  } else if (processKey === "adiabatic") {
    V2 = V1 * control;
    P2 = P1 * Math.pow(V1 / V2, gamma);
    T2 = (P2 * V2) / (n * R);
  } else if (processKey === "isobaric") {
    V2 = V1 * control;
    P2 = P1;
    T2 = (P2 * V2) / (n * R);
  } else {
    // isochoric
    V2 = V1;
    T2 = T1 * control;
    P2 = (n * R * T2) / V2;
  }

  let W, dU, Q;
  if (processKey === "isothermal") {
    W = n * R * T1 * Math.log(V2 / V1);
    dU = 0;
    Q = W;
  } else if (processKey === "adiabatic") {
    dU = n * Cv * (T2 - T1);
    W = -dU;
    Q = 0;
  } else if (processKey === "isobaric") {
    W = P1 * (V2 - V1);
    dU = n * Cv * (T2 - T1);
    Q = n * Cp * (T2 - T1);
  } else {
    W = 0;
    dU = n * Cv * (T2 - T1);
    Q = dU;
  }

  return {
    state1: { P: P1, V: V1, T: T1 },
    state2: { P: P2, V: V2, T: T2 },
    W, dU, Q, gamma, Cv, Cp,
  };
}

/** Closed-form state at fraction t (0..1) along the process path, for animation and charting. */
export function stateAtT(processKey, state1, state2, gamma, t) {
  const { P: P1, V: V1, T: T1 } = state1;
  const { T: T2 } = state2;
  if (processKey === "isochoric") {
    const T = T1 + (T2 - T1) * t;
    return { P: P1 * (T / T1), V: V1, T };
  }
  const V = V1 + (state2.V - V1) * t;
  if (processKey === "isothermal") return { P: (P1 * V1) / V, V, T: T1 };
  if (processKey === "adiabatic") return { P: P1 * Math.pow(V1 / V, gamma), V, T: T1 * Math.pow(V1 / V, gamma - 1) };
  return { P: P1, V, T: T1 * (V / V1) }; // isobaric
}

/** Sample the P–V path into `steps` points for charting. */
export function samplePath(processKey, state1, state2, gamma, steps = 48) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const s = stateAtT(processKey, state1, state2, gamma, t);
    pts.push({ V: s.V, P: s.P });
  }
  return pts;
}
