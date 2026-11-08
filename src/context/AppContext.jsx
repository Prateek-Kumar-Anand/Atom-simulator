import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { downloadText } from "../physics/constants";
import { buildCsv, buildTextReport, fileStamp } from "../utils/exportReport";

export const MODULES = [
  { key: "atom", label: "Atomic Structure", code: "01" },
  { key: "spectrum", label: "Hydrogen Spectrum", code: "02" },
  { key: "photoelectric", label: "Photoelectric Effect", code: "03" },
  { key: "decay", label: "Radioactive Decay", code: "04" },
  { key: "particles", label: "Particle Collisions", code: "05" },
  { key: "thermo", label: "Thermodynamics", code: "06" },
  { key: "fluid", label: "Fluid Dynamics", code: "07" },
  { key: "quantum", label: "Quantum Physics", code: "08" },
  { key: "electromagnetism", label: "Electromagnetism", code: "09" },
  { key: "optics", label: "Optics", code: "10" },
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

  const nextId = useRef(1);

  const log = useCallback((module, label, detail) => {
    // A running counter gives every entry a unique id (Date.now() collided on quick double-clicks,
    // producing duplicate React keys). `ts` is the raw timestamp the export formats from.
    setResults((r) => [{ id: nextId.current++, ts: Date.now(), module, label, detail }, ...r]);
    setNotebookOpen(true);
  }, []);

  // Two downloads, one fixed schema (see utils/exportReport.js).
  const exportCsv = useCallback(() => {
    downloadText(`quanta-lab-results_${fileStamp(Date.now())}.csv`, buildCsv(results), "text/csv");
  }, [results]);

  const exportReport = useCallback(() => {
    const now = Date.now();
    downloadText(`quanta-lab-report_${fileStamp(now)}.txt`, buildTextReport(results, MODULES, visited, now));
  }, [results, visited]);

  const value = {
    active, setActive, visited, results, log, exportCsv, exportReport,
    notebookOpen, setNotebookOpen,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
