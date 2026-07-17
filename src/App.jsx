import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import TopBar from "./components/layout/TopBar";
import Sidebar from "./components/layout/Sidebar";
import TheoryDrawer from "./components/layout/TheoryDrawer";
import Notebook from "./components/layout/Notebook";
import AtomLab from "./components/atom/AtomLab";
import SpectrumLab from "./components/spectrum/SpectrumLab";
import PhotoelectricLab from "./components/photoelectric/PhotoelectricLab";
import DecayLab from "./components/decay/DecayLab";
import ParticleLab from "./components/particles/ParticleLab";
import ThermoLab from "./components/thermo/ThermoLab";
import FluidLab from "./components/fluid/FluidLab";
import QuantumLab from "./components/quantum/QuantumLab";

const LABS = {
  atom: AtomLab,
  spectrum: SpectrumLab,
  photoelectric: PhotoelectricLab,
  decay: DecayLab,
  particles: ParticleLab,
  thermo: ThermoLab,
  fluid: FluidLab,
  quantum: QuantumLab,
};

function AppShell() {
  const { active } = useApp();
  const ActiveLab = LABS[active];
  return (
    <div className="qp-app">
      <TopBar />
      <Sidebar />
      <main className="qp-main">
        <ActiveLab />
      </main>
      <TheoryDrawer />
      <Notebook />
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
