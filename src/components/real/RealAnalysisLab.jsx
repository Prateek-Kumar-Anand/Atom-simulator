import React from "react";
import { LabSwitcher } from "../math/MathPlot";
import SequencesLab from "./SequencesLab";
import SeriesLab from "./SeriesLab";
import EpsilonDeltaLab from "./EpsilonDeltaLab";
import RiemannLab from "./RiemannLab";
import TaylorLab from "./TaylorLab";

const EXPERIMENTS = [
  { key: "sequences", label: "Sequences (ε–N)", Component: SequencesLab },
  { key: "series", label: "Series", Component: SeriesLab },
  { key: "epsdelta", label: "Continuity (ε–δ)", Component: EpsilonDeltaLab },
  { key: "riemann", label: "Riemann integral", Component: RiemannLab },
  { key: "taylor", label: "Taylor series", Component: TaylorLab },
];

export default function RealAnalysisLab() {
  return <LabSwitcher experiments={EXPERIMENTS} />;
}
