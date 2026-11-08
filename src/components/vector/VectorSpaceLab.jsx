import React from "react";
import { LabSwitcher } from "../math/MathPlot";
import SpanBasisLab from "./SpanBasisLab";
import LinearMapLab from "./LinearMapLab";
import GradientFieldLab from "./GradientFieldLab";
import DescentLab from "./DescentLab";
import LaplaceLab from "./LaplaceLab";

const EXPERIMENTS = [
  { key: "span", label: "Span & basis", Component: SpanBasisLab },
  { key: "map", label: "Linear map & eigenvectors", Component: LinearMapLab },
  { key: "gradient", label: "Gradient field", Component: GradientFieldLab },
  { key: "descent", label: "Gradient descent", Component: DescentLab },
  { key: "laplace", label: "Laplace equation", Component: LaplaceLab },
];

export default function VectorSpaceLab() {
  return <LabSwitcher experiments={EXPERIMENTS} />;
}
