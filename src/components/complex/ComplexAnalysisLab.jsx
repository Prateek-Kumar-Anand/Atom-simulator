import React from "react";
import { LabSwitcher } from "../math/MathPlot";
import ArgandLab from "./ArgandLab";
import MappingLab from "./MappingLab";
import DomainColorLab from "./DomainColorLab";
import FractalLab from "./FractalLab";
import ComplexLandscapeLab from "./ComplexLandscapeLab";
import RiemannSphereLab from "./RiemannSphereLab";

const EXPERIMENTS = [
  { key: "argand", label: "Complex plane", Component: ArgandLab },
  { key: "mapping", label: "Conformal mapping", Component: MappingLab },
  { key: "domain", label: "Domain colouring", Component: DomainColorLab },
  { key: "fractal", label: "Mandelbrot & Julia", Component: FractalLab },
  { key: "landscape3d", label: "◆ 3D Landscape & Riemann surfaces", Component: ComplexLandscapeLab },
  { key: "sphere3d", label: "◆ 3D Riemann sphere", Component: RiemannSphereLab },
];

export default function ComplexAnalysisLab() {
  return <LabSwitcher experiments={EXPERIMENTS} />;
}
