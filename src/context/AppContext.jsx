import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { downloadText } from "../physics/constants";

export const MODULES = [
  { key: "atom", label: "Atomic Structure", code: "01" },
  { key: "spectrum", label: "Hydrogen Spectrum", code: "02" },
  { key: "photoelectric", label: "Photoelectric Effect", code: "03" },
  { key: "decay", label: "Radioactive Decay", code: "04" },
  { key: "particles", label: "Particle Collisions", code: "05" },
  { key: "thermo", label: "Thermodynamics", code: "06" },
  { key: "fluid", label: "Fluid Dynamics", code: "07" },
  { key: "quantum", label: "Quantum Physics", code: "08" },
];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [active, setActive] = useState("atom");
  const [visited, setVisited] = useState(() => new Set(["atom"]));
  const [results, setResults] = useState([]);
  const [notebookOpen, setNotebookOpen] = useState(false);

  useEffect(() => {
    setVisited((v) => new Set(v).add(active));
  }, [active]);

  const log = useCallback((module, label, detail) => {
    setResults((r) => [{ id: Date.now(), module, label, detail, time: new Date().toLocaleTimeString() }, ...r]);
    setNotebookOpen(true);
  }, []);

  const exportResults = useCallback(() => {
    const lines = [
      "QUANTA — Atomic Physics Laboratory — Session Report",
      `Generated: ${new Date().toLocaleString()}`,
      `Modules explored: ${visited.size} / ${MODULES.length}`,
      "".padEnd(60, "-"),
      ...results.slice().reverse().map((r) => `[${r.time}] ${r.module} — ${r.label}\n  ${r.detail}`),
    ];
    downloadText("atomic-physics-lab-report.txt", lines.join("\n\n"));
  }, [results, visited]);

  const value = {
    active, setActive, visited, results, log, exportResults,
    notebookOpen, setNotebookOpen,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
