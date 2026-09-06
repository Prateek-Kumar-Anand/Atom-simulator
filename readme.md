# QUANTA — Atomic Physics Laboratory

QUANTA is an interactive browser-based physics lab for exploring atomic, quantum, thermodynamic, fluid, electromagnetic, and optics concepts through visual simulations. It is built with React, Vite, Three.js, React Three Fiber, and Recharts.

## Features

- **10 guided lab modules** covering atomic structure, hydrogen spectra, photoelectric emission, radioactive decay, particle collisions, thermodynamics, fluid dynamics, quantum physics, electromagnetism, and optics.
- **Interactive 3D and chart-based visualizations** using Three.js, React Three Fiber, and Recharts.
- **Built-in theory drawer** that summarizes the governing equations and concepts for each module.
- **Session progress tracking** as learners visit each lab.
- **Notebook export** for saving observations and generated session reports.
- **Instrument-panel UI** with responsive lab layouts and telemetry-style readouts.

## Lab Modules

| # | Module | What you can explore |
|---|---|---|
| 01 | Atomic Structure | Element selection, shell models, atomic properties, and nucleus/electron visualization. |
| 02 | Hydrogen Spectrum | Bohr energy levels, electronic transitions, photon energy, and spectral lines. |
| 03 | Photoelectric Effect | Work function thresholds, emitted-electron kinetic energy, and intensity/frequency changes. |
| 04 | Radioactive Decay | Half-life, exponential decay, activity, and stochastic population behavior. |
| 05 | Particle Collisions | Elastic collisions, mass ratios, momentum, kinetic energy, and wall bounces. |
| 06 | Thermodynamics | Ideal-gas state variables and isothermal, isobaric, isochoric, and adiabatic processes. |
| 07 | Fluid Dynamics | Continuity, Bernoulli behavior, pressure/velocity tradeoffs, and Reynolds number. |
| 08 | Quantum Physics | Double-slit interference, tunneling, and entanglement demonstrations. |
| 09 | Electromagnetism | Electric fields, magnetic fields, Lorentz force, and electromagnetic waves. |
| 10 | Optics | Lenses, mirrors, refraction, diffraction, and interference. |

## Tech Stack

- [React](https://react.dev/) for the UI
- [Vite](https://vitejs.dev/) for local development and production builds
- [Three.js](https://threejs.org/) and [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) for 3D scenes
- [Drei](https://github.com/pmndrs/drei) for React Three Fiber helpers
- [Recharts](https://recharts.org/) for charts
- [Lucide React](https://lucide.dev/) for icons

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
npm install
```

### Development

Start the Vite development server:

```bash
npm run dev
```

Open the local URL shown in your terminal, usually `http://localhost:5173`.

### Production Build

```bash
npm run build
```

### Preview the Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

> Note: the project defines a lint script, but an ESLint configuration file may need to be added before the command can run successfully in a fresh checkout.

## Project Structure

```text
.
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── context/
│   │   └── AppContext.jsx
│   ├── components/
│   │   ├── atom/
│   │   ├── common/
│   │   ├── decay/
│   │   ├── electromagnetism/
│   │   ├── fluid/
│   │   ├── layout/
│   │   ├── optics/
│   │   ├── particles/
│   │   ├── photoelectric/
│   │   ├── quantum/
│   │   ├── spectrum/
│   │   └── thermo/
│   ├── hooks/
│   └── physics/
└── assets/
```

## Educational Notes

The simulations are designed as teaching aids and use simplified models where appropriate. They are suitable for conceptual exploration, demonstrations, and classroom discussion, but should not be treated as a substitute for validated scientific or engineering software.

## License

No license file is currently included. Add a license before distributing or reusing this project publicly.
