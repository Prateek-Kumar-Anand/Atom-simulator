import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import TopBar from "./components/layout/TopBar";
import Sidebar from "./components/layout/Sidebar";
import TheoryDrawer from "./components/layout/TheoryDrawer";
import Notebook from "./components/layout/Notebook";
import ErrorBoundary from "./components/layout/ErrorBoundary";
import AtomLab from "./components/atom/AtomLab";
import SpectrumLab from "./components/spectrum/SpectrumLab";
import PhotoelectricLab from "./components/photoelectric/PhotoelectricLab";
import DecayLab from "./components/decay/DecayLab";
import ParticleLab from "./components/particles/ParticleLab";
import ThermoLab from "./components/thermo/ThermoLab";
import FluidLab from "./components/fluid/FluidLab";
import QuantumLab from "./components/quantum/QuantumLab";
import EMLab from "./components/electromagnetism/EMLab";
import OpticsLab from "./components/optics/OpticsLab";
import RealAnalysisLab from "./components/real/RealAnalysisLab";
import ComplexAnalysisLab from "./components/complex/ComplexAnalysisLab";
import VectorSpaceLab from "./components/vector/VectorSpaceLab";

const LABS = {
  atom: AtomLab,
  spectrum: SpectrumLab,
  photoelectric: PhotoelectricLab,
  decay: DecayLab,
  particles: ParticleLab,
  thermo: ThermoLab,
  fluid: FluidLab,
  quantum: QuantumLab,
  electromagnetism: EMLab,
  optics: OpticsLab,
  real: RealAnalysisLab,
  complex: ComplexAnalysisLab,
  vector: VectorSpaceLab,
};

function AppShell() {
  const { active } = useApp();
  const ActiveLab = LABS[active];
  return (
    <div className="qp-app">
      <TopBar />
      <Sidebar />
      <main className="qp-main">
        <ErrorBoundary resetKey={active}>
          <ActiveLab />
        </ErrorBoundary>
      </main>
      <div className="qp-dock">
        <TheoryDrawer />
        <Notebook />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
