import React from "react";
import { LabSwitcher } from "../math/MathPlot";
import SpanBasisLab from "./SpanBasisLab";
import LinearMapLab from "./LinearMapLab";
import GradientFieldLab from "./GradientFieldLab";
import DescentLab from "./DescentLab";
import LaplaceLab from "./LaplaceLab";
import VectorMapLab from "./VectorMapLab";
import FlowField3DLab from "./FlowField3DLab";
import LinearMap3DLab from "./LinearMap3DLab";
import Descent3DLab from "./Descent3DLab";

const EXPERIMENTS = [
  { key: "span", label: "Span & basis", Component: SpanBasisLab },
  { key: "map", label: "Linear map & eigenvectors", Component: LinearMapLab },
  { key: "gradient", label: "Gradient field", Component: GradientFieldLab },
  { key: "descent", label: "Gradient descent", Component: DescentLab },
  { key: "laplace", label: "Laplace equation", Component: LaplaceLab },
  { key: "custom", label: "✎ Custom map (type equations)", Component: VectorMapLab },
  { key: "flow3d", label: "◆ 3D Flow field", Component: FlowField3DLab },
  { key: "map3d", label: "◆ 3D Linear map", Component: LinearMap3DLab },
  { key: "descent3d", label: "◆ 3D Gradient descent", Component: Descent3DLab },
];

export default function VectorSpaceLab() {
  return <LabSwitcher experiments={EXPERIMENTS} />;
}
