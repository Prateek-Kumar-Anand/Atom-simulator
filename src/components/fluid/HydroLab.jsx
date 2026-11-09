import React from "react";
import { LabSwitcher } from "../math/MathPlot";
import FluidLab from "./FluidLab";
import BuoyancyLab from "./BuoyancyLab";
import TorricelliLab from "./TorricelliLab";
import PoiseuilleLab from "./PoiseuilleLab";
import CylinderFlowLab from "./CylinderFlowLab";
import DragLab from "./DragLab";
import WavesLab from "./WavesLab";

const EXPERIMENTS = [
  { key: "pipe", label: "Pipe Flow & Venturi", Component: FluidLab },
  { key: "buoyancy", label: "Buoyancy & Pressure", Component: BuoyancyLab },
  { key: "torricelli", label: "Torricelli Draining", Component: TorricelliLab },
  { key: "poiseuille", label: "Poiseuille Flow", Component: PoiseuilleLab },
  { key: "cylinder", label: "Flow Past a Cylinder", Component: CylinderFlowLab },
  { key: "drag", label: "Drag & Terminal Velocity", Component: DragLab },
  { key: "waves", label: "Surface Waves", Component: WavesLab },
];

export default function HydroLab() {
  return <LabSwitcher experiments={EXPERIMENTS} />;
}
