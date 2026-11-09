import React from "react";
import { LabSwitcher } from "../math/MathPlot";
import SequencesLab from "./SequencesLab";
import SeriesLab from "./SeriesLab";
import EpsilonDeltaLab from "./EpsilonDeltaLab";
import RiemannLab from "./RiemannLab";
import TaylorLab from "./TaylorLab";
import Riemann3DLab from "./Riemann3DLab";
import FourierGibbs3DLab from "./FourierGibbs3DLab";

const EXPERIMENTS = [
  { key: "sequences", label: "Sequences (ε–N)", Component: SequencesLab },
  { key: "series", label: "Series", Component: SeriesLab },
  { key: "epsdelta", label: "Continuity (ε–δ)", Component: EpsilonDeltaLab },
  { key: "riemann", label: "Riemann integral", Component: RiemannLab },
  { key: "taylor", label: "Taylor series", Component: TaylorLab },
  { key: "riemann3d", label: "◆ 3D Riemann sum", Component: Riemann3DLab },
  { key: "gibbs3d", label: "◆ 3D Fourier & Gibbs", Component: FourierGibbs3DLab },
];

export default function RealAnalysisLab() {
  return <LabSwitcher experiments={EXPERIMENTS} />;
}
