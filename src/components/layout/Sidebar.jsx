import React from "react";
import { Orbit, Waves, Lightbulb, Activity, FlaskConical, Thermometer, Droplets, Atom } from "lucide-react";
import { MODULES, useApp } from "../../context/AppContext";

const ICONS = { atom: Orbit, spectrum: Waves, photoelectric: Lightbulb, decay: Activity, particles: FlaskConical, thermo: Thermometer, fluid: Droplets, quantum: Atom };

export default function Sidebar() {
  const { active, setActive, visited } = useApp();
  return (
    <nav className="qp-sidebar">
      {MODULES.map((m) => {
        const Icon = ICONS[m.key];
        return (
          <button key={m.key} className={"qp-nav-item" + (active === m.key ? " active" : "")} onClick={() => setActive(m.key)}>
            <span className="qp-nav-code">{m.code}</span>
            <Icon size={16} />
            <span className="qp-nav-label">{m.label}</span>
            {visited.has(m.key) && <span className="qp-nav-check" />}
          </button>
        );
      })}
    </nav>
  );
}
