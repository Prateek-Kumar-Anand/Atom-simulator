import React, { useState } from "react";
import DoubleSlitLab from "./DoubleSlitLab";
import TunnelingLab from "./TunnelingLab";
import EntanglementLab from "./EntanglementLab";
import BoxLab from "./BoxLab";
import OscillatorLab from "./OscillatorLab";
import WavePacketLab from "./WavePacketLab";
import QubitLab from "./QubitLab";
import HydrogenLab from "./HydrogenLab";
import InterferometerLab from "./InterferometerLab";

const EXPERIMENTS = [
  { key: "doubleSlit", label: "Double Slit", Component: DoubleSlitLab },
  { key: "tunneling", label: "Quantum Tunneling", Component: TunnelingLab },
  { key: "entanglement", label: "Entanglement", Component: EntanglementLab },
  { key: "box", label: "Particle in a Box", Component: BoxLab },
  { key: "oscillator", label: "Harmonic Oscillator", Component: OscillatorLab },
  { key: "packet", label: "Wave-Packet Scattering", Component: WavePacketLab },
  { key: "qubit", label: "Spin-½ & Qubit", Component: QubitLab },
  { key: "hydrogen", label: "Hydrogen Orbitals", Component: HydrogenLab },
  { key: "interferometer", label: "Interferometer", Component: InterferometerLab },
];

export default function QuantumLab() {
  const [expKey, setExpKey] = useState("doubleSlit");
  const active = EXPERIMENTS.find((e) => e.key === expKey) || EXPERIMENTS[0];
  const Active = active.Component;

  return (
    <div>
      <div className="qp-chip-row" style={{ marginBottom: 14 }}>
        {EXPERIMENTS.map((e) => (
          <button key={e.key} className={"qp-chip" + (e.key === expKey ? " active" : "")} onClick={() => setExpKey(e.key)}>
            {e.label}
          </button>
        ))}
      </div>
      <Active />
    </div>
  );
}
