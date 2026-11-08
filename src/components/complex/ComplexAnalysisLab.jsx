import React from "react";
import { LabSwitcher } from "../math/MathPlot";
import ArgandLab from "./ArgandLab";
import MappingLab from "./MappingLab";
import DomainColorLab from "./DomainColorLab";
import FractalLab from "./FractalLab";

const EXPERIMENTS = [
  { key: "argand", label: "Complex plane", Component: ArgandLab },
  { key: "mapping", label: "Conformal mapping", Component: MappingLab },
  { key: "domain", label: "Domain colouring", Component: DomainColorLab },
  { key: "fractal", label: "Mandelbrot & Julia", Component: FractalLab },
];

export default function ComplexAnalysisLab() {
  return <LabSwitcher experiments={EXPERIMENTS} />;
}
