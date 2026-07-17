export const THEORY = {
  atom: {
    title: "Atomic structure",
    body: [
      "An atom consists of a dense, positively charged nucleus (protons + neutrons) surrounded by electrons occupying discrete energy shells.",
      "Nuclear radius scales approximately as r ≈ r₀·A^(1/3), which is why heavier nuclei are only modestly larger than light ones.",
      "Shell capacities follow 2, 8, 8, 18, 18, 32 (2n² up to a cap) — the simplified Bohr model taught before quantum subshells (s, p, d, f).",
    ],
  },
  spectrum: {
    title: "Hydrogen spectrum",
    body: [
      "Bohr's model restricts the electron to discrete orbits with energy Eₙ = −13.6 eV / n².",
      "A transition between levels emits or absorbs a photon with energy ΔE = |E_ni − E_nf|, and wavelength λ = hc / ΔE.",
      "Transitions ending on n=1 form the Lyman series (UV), n=2 the Balmer series (mostly visible), and n=3 the Paschen series (infrared).",
    ],
  },
  photoelectric: {
    title: "Photoelectric effect",
    body: [
      "Einstein's explanation: light arrives in quanta (photons) of energy E = hf, not as a continuous wave.",
      "An electron is only emitted if a single photon's energy exceeds the metal's work function φ; extra energy becomes kinetic energy: KEmax = hf − φ.",
      "Increasing intensity increases the number of photons per second (more electrons, if hf > φ) but never changes each photon's energy.",
    ],
  },
  decay: {
    title: "Radioactive decay",
    body: [
      "Decay is a random per-atom process. The population follows N(t) = N₀·e^(−λt), where λ = ln 2 / T½ is the decay constant.",
      "Half-life T½ is the time for half of a sample to decay — it is independent of how many atoms remain.",
      "Activity A(t) = λN(t) is the number of decays per second, and decreases exponentially alongside the population.",
    ],
  },
  particles: {
    title: "Particle collisions",
    body: [
      "For an elastic collision, both momentum (Σmv) and kinetic energy (Σ½mv²) are conserved.",
      "For two bodies colliding along the line joining their centers, exchanged velocity depends on the mass ratio — a light particle hitting a heavy one mostly bounces back.",
      "Wall bounces here are perfectly elastic (speed preserved, direction reflected), so total kinetic energy stays constant even though momentum direction changes at each wall.",
    ],
  },
  thermo: {
    title: "Thermodynamic processes",
    body: [
      "For an ideal gas, PV = nRT relates pressure, volume, and temperature at every instant, regardless of the process.",
      "Isothermal (T constant): W = nRT·ln(V2/V1), ΔU = 0. Isobaric (P constant): W = PΔV. Isochoric (V constant): W = 0. Adiabatic (Q = 0): all work comes from internal energy, ΔU = −W.",
      "The first law of thermodynamics, ΔU = Q − W, holds in every case — only how Q, W, and ΔU trade off against each other changes with the process.",
    ],
  },
  fluid: {
    title: "Fluid dynamics",
    body: [
      "Continuity (mass conservation): A₁v₁ = A₂v₂ — an incompressible fluid must speed up wherever the pipe narrows, since the same volume has to pass every cross-section per second.",
      "Bernoulli's equation (energy conservation along a streamline): P + ½ρv² stays constant, so the faster-moving fluid at a constriction is at lower pressure — the mechanism behind lift, atomizers, and Venturi meters.",
      "The Reynolds number Re = ρvD/μ compares inertial to viscous forces: low Re (< ~2300) gives smooth laminar flow, high Re (> ~4000) gives chaotic, mixing turbulent flow.",
    ],
  },
  quantum: {
    title: "Quantum physics",
    body: [
      "Double slit: particles build up an interference pattern one at a time, but only when no which-path information exists — obtaining which-slit information erases the interference term and leaves only the single-slit diffraction envelope.",
      "Tunneling: a particle with energy below a barrier's height still has a nonzero probability of appearing on the far side, T = [1 + V0²sinh²(κL) / 4E(V0−E)]⁻¹ — classically forbidden, quantum mechanically routine (it's how scanning tunneling microscopes and some radioactive decay work).",
      "Entanglement: two particles can share a correlated quantum state so that measuring one instantly correlates with the other's outcome — but each individual result is still random, and confirming the correlation requires ordinary communication, so no information travels faster than light.",
    ],
  },
};
