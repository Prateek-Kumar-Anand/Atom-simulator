# QUANTA — Atomic Physics Virtual Laboratory

An interactive, 3D, browser-based physics laboratory spanning atomic
structure, spectroscopy, thermodynamics, fluid dynamics, quantum phenomena,
and collision mechanics — built with **React**, **Three.js** (via
`@react-three/fiber` + `@react-three/drei`), and **Recharts**.

![tech](https://img.shields.io/badge/React-18-4fd8e0) ![tech](https://img.shields.io/badge/Three.js-r164-f2a94e) ![tech](https://img.shields.io/badge/Vite-5-c084fc)

## Features

| Module | What it demonstrates |
|---|---|
| **01 · Atomic Structure** | Rotatable 3D atomic models (Z = 1–20) with a tightly packed nucleus (relaxation-simulated proton/neutron packing) and animated electron shells, plus an element selector and live nuclear/electron readouts. |
| **02 · Hydrogen Spectrum** | Bohr-model energy levels generalized to any hydrogen-like ion (Eₙ = −13.6·Z²/n² eV) across a searchable 118-element picker, electron transitions, photon animation, and an energy-level diagram. |
| **03 · Photoelectric Effect** | Adjustable light frequency/intensity, work-function selection across 8 metals, photon-vs-intensity distinction, KE-vs-frequency and I–V graphs. |
| **04 · Radioactive Decay** | Monte Carlo per-atom decay simulation against the theoretical N(t) = N₀e^(−λt) curve, with a real, sourced radioisotope and half-life for all 118 elements. |
| **05 · Particle Collisions** | N-body 3D collisions (2–8 configurable balls, each with its own mass/speed) with a coefficient-of-restitution slider spanning elastic ↔ perfectly inelastic, live velocity vectors, and a momentum/KE time-series chart. |
| **06 · Thermodynamics** | Ideal-gas processes (isothermal/isobaric/isochoric/adiabatic) on a 3D piston, a live P–V diagram, the Maxwell–Boltzmann speed distribution, and experiment presets. |
| **07 · Fluid Dynamics** | A 3D converging pipe visualizing the continuity equation, Bernoulli pressure drop, and Reynolds-number-driven laminar→turbulent flow, with a velocity/pressure profile chart. |
| **08 · Quantum Physics** | Three sub-experiments — double-slit interference (with which-path collapse), quantum tunneling through a barrier, and entangled-pair measurement (with a correct no-faster-than-light-signaling explanation). |

Every module includes: written instructions, a **Theory** drawer with the
governing formulas, a **Lab Notebook** for recording results, and a
one-click **session report export** (plain text).

## Tech stack

- **React 18** — component architecture, hooks-based state
- **Three.js** via **@react-three/fiber** (React renderer for Three.js) and
  **@react-three/drei** (`OrbitControls`, `Stars`, helpers)
- **Recharts** — spectral, kinetic-energy, and decay charts
- **lucide-react** — iconography
- **Vite** — dev server and production bundler
- Plain CSS (custom design system in `src/index.css`) — no UI framework
  dependency, so the visual language stays fully custom

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) 18 or later
- npm 9+ (bundled with Node)

### Install & run locally
```bash
npm install
npm run dev
```
Open the printed local URL (typically `http://localhost:5173`).

### Production build
```bash
npm run build     # outputs to /dist
npm run preview   # serve the production build locally to sanity-check it
```

### Deployment

**GitHub Pages (automatic):** this repo includes `.github/workflows/deploy.yml`,
which builds the app and publishes it to GitHub Pages on every push to `main`.
To enable it:
1. Push this repo to GitHub.
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab) —
   the site will be live at `https://<username>.github.io/<repo-name>/`
   within a couple of minutes.

`vite.config.js` already sets `base: "./"`, so the build's asset paths are
relative and work correctly from a GitHub Pages project subpath without any
further configuration.

**Other static hosts** (Vercel, Netlify, Cloudflare Pages, S3, etc.): build
command `npm run build`, output directory `dist`.

## Project structure

```
atomic-physics-lab/
├── .github/workflows/deploy.yml # GitHub Pages CI/CD (build + deploy on push)
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # Root shell: layout + active-lab routing
│   ├── index.css                # Design system (dark, instrument-panel theme)
│   ├── context/
│   │   └── AppContext.jsx       # Active module, progress tracking, lab notebook, export
│   ├── hooks/
│   │   └── useDecaySimulation.js
│   ├── physics/                 # Pure, framework-free physics engine
│   │   ├── constants.js         # CODATA constants, formatting, wavelength→color, download helper
│   │   ├── atomicData.js        # Element table (Z 1–20) + Bohr shell-filling rule (Atom Simulator)
│   │   ├── periodicTable.js     # Full 118-element roster (Hydrogen Spectrum, Radioactive Decay)
│   │   ├── hydrogenSpectrum.js  # Hydrogen-like-ion energy levels, transition energy/wavelength
│   │   ├── photoelectric.js     # Einstein photoelectric equation, metal work functions
│   │   ├── decay.js             # Exponential decay law, Monte Carlo step, 118-isotope dataset
│   │   ├── particles.js         # N-body collision vector math (elastic→inelastic), wall reflection
│   │   ├── thermodynamics.js    # Ideal gas processes, Maxwell–Boltzmann distribution
│   │   ├── fluidDynamics.js     # Continuity, Bernoulli, Reynolds number
│   │   ├── quantum.js           # Double-slit intensity, tunneling transmission, entanglement
│   │   └── theory.js            # Per-module formula/explanation text
│   └── components/
│       ├── common/              # HUD frame, Readout tile, shared 3D StageCanvas, element picker
│       ├── layout/               # TopBar, Sidebar, TheoryDrawer, Notebook
│       ├── atom/                 # Atom Simulator (viewport, selector, info panel)
│       ├── spectrum/             # Hydrogen Spectrum (viewport, level diagram)
│       ├── photoelectric/        # Photoelectric Effect (stage animation, charts)
│       ├── decay/                # Radioactive Decay (population grid, chart, hook)
│       ├── particles/            # Particle Collisions (3D viewport, config box, chart)
│       ├── thermo/               # Thermodynamics (3D piston, P–V + Maxwell–Boltzmann charts)
│       ├── fluid/                # Fluid Dynamics (3D pipe, flow profile chart)
│       └── quantum/              # Quantum Physics (double slit, tunneling, entanglement)
└── public/                       # Static assets (none required by default)
```

The **physics/** folder has no React or Three.js imports — every formula is a
plain, independently testable function. UI components import from it rather
than embedding physics logic inline, which keeps the simulation logic
reusable (e.g. in unit tests, or a future non-3D report view) and easy to
audit for correctness.

## Physics reference

- **Atomic structure**: nuclear radius r ≈ r₀·A^(1/3); simplified Bohr shell
  capacities 2, 8, 8, 18, 18, 32 (exact for Z ≤ 20, which is why the element
  selector stops at calcium); nucleons are packed by a pairwise-repulsion
  relaxation simulation so they sit nearly touching, not evenly scattered.
- **Hydrogen spectrum**: Eₙ = −13.6·Z² eV / n² (the hydrogen-like-ion
  generalization, exact for any single-electron ion, e.g. He⁺, Li²⁺); ΔE =
  |E_ni − E_nf|; λ = hc / ΔE.
- **Photoelectric effect**: E = hf; KEmax = hf − φ; f₀ = φ / h; stopping
  voltage Vs numerically equals KEmax expressed in eV.
- **Radioactive decay**: N(t) = N₀e^(−λt); λ = ln 2 / T½; per-tick decay
  probability p = 1 − e^(−λΔt).
- **Particle collisions**: N-body pairwise collisions using the general
  restitution-coefficient formula (e = 1 elastic → e = 0 perfectly
  inelastic), conserving momentum exactly regardless of e.
- **Thermodynamics**: PV = nRT; adiabatic PV^γ = const; ΔU = Q − W (first
  law); Maxwell–Boltzmann speed distribution f(v) = 4πn(m/2πkT)^(3/2)
  v²e^(−mv²/2kT).
- **Fluid dynamics**: continuity A₁v₁ = A₂v₂; Bernoulli P + ½ρv² = const
  (horizontal pipe); Reynolds number Re = ρvD/μ, with Re < 2300 laminar and
  Re > 4000 turbulent.
- **Quantum physics**: double-slit intensity I(θ) ∝ cos²(πd·sinθ/λ)·sinc²(πa·sinθ/λ);
  tunneling transmission T = [1 + V₀²sinh²(κL)/4E(V₀−E)]⁻¹; entanglement
  modeled as a singlet-like pair with individually random, perfectly
  anti-correlated outcomes (no faster-than-light signaling).

## Notes & simplifications

- The Bohr shell model shown in the Atom Simulator is a teaching
  simplification; it is exact for Z ≤ 20 and is intentionally not extended
  to transition metals, whose real subshell filling order it cannot capture.
- The hydrogen-like-ion generalization in the Spectrum module is exact only
  for one-electron systems (H, He⁺, Li²⁺, …); it does not model multi-electron
  atoms' real (non-hydrogenic) spectra.
- The Radioactive Decay module uses a *compressed* simulated half-life
  (seconds, not real time) so isotopes with half-lives of days or millennia
  can still be watched decay in real time; each isotope's real half-life is
  shown alongside it. Each element's isotope is a commonly-referenced
  radioisotope for that element, not necessarily its single most stable one.
- Fluid Dynamics ignores viscous (frictional) pressure loss along straight
  sections — an idealization appropriate for teaching continuity/Bernoulli
  together, not a real engineering pipe-flow calculation.
- Quantum Tunneling reports T = 1 for E ≥ V₀ (over-the-barrier); the exact
  result still has small resonance-related reflection there, omitted here.
- Session progress and the lab notebook are held in memory for the current
  browser session (no backend, no cookies/local storage) — refreshing the
  page starts a new session. Export your results before reloading if you
  want to keep them.


